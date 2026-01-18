import type { NextRequest } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db } from '@/server/db';
import { credit, subscription, transaction, user } from '@/server/db/schema';
import {
  getCreditPackByProductId,
  getPricingTierByProductId,
  getSubscriptionQuota,
} from '@/shared/payment/config/payment';
import { getCreemClient } from '@/shared/payment/creem-client';
import type { PaymentWebhookAdapter } from './types';

// 初始化 Creem SDK（仅服务端）
const resolveCreem = () => getCreemClient({ requireWebhookSecret: true });

// 统一解析用户 ID，兼容不同字段命名
const getUserIdFromMetadata = (metadata: any) => {
  const userId = metadata?.userId ?? metadata?.referenceId ?? metadata?.user_id;
  return typeof userId === 'string' && userId.length > 0 ? userId : null;
};

// 订阅状态更新的公共逻辑
const updateSubscriptionStatus = async (
  status: 'canceled' | 'paused' | 'expired',
  data: any,
) => {
  const { id } = data;
  if (!id) {
    console.error(`✗ Subscription ${status}: Missing subscription ID`);
    return;
  }

  const updatePayload: Record<string, unknown> = {
    status,
    updatedAt: new Date(),
  };

  if (status === 'canceled') {
    updatePayload.canceledAt = new Date();
  }

  try {
    await subscriptionRepo.updateByPaymentId(id, updatePayload);

    console.log(`✓ Subscription ${status}: ${id}`);
  } catch (error) {
    console.error(`✗ Subscription ${status} handler error:`, error);
    throw error;
  }
};

// 数据访问层：订阅
const subscriptionRepo = {
  async updateByPaymentId(paymentSubscriptionId: string, payload: Record<string, unknown>) {
    return db
      .update(subscription)
      .set(payload)
      .where(eq(subscription.paymentSubscriptionId, paymentSubscriptionId));
  },
  async create(payload: {
    userId: string;
    paymentSubscriptionId: string;
    paymentCustomerId: string;
    planType: string;
    amount: number;
    currency: string;
    expiresAt: Date | null;
    nextBillingAt: Date | null;
  }) {
    return db
      .insert(subscription)
      .values({
        userId: payload.userId,
        paymentPlatform: 'creem',
        paymentSubscriptionId: payload.paymentSubscriptionId,
        paymentCustomerId: payload.paymentCustomerId,
        planType: payload.planType,
        status: 'active',
        amount: payload.amount,
        currency: payload.currency,
        startedAt: new Date(),
        expiresAt: payload.expiresAt,
        nextBillingAt: payload.nextBillingAt,
      })
      .returning();
  },
  async findActiveByUserId(userId: string) {
    const [active] = await db
      .select()
      .from(subscription)
      .where(and(eq(subscription.userId, userId), eq(subscription.status, 'active')))
      .limit(1);
    return active;
  },
  async updateById(subscriptionId: string, payload: Record<string, unknown>) {
    return db.update(subscription).set(payload).where(eq(subscription.id, subscriptionId));
  },
};

// 数据访问层：交易
const transactionRepo = {
  async findByPaymentTransactionId(paymentTransactionId: string) {
    const [existing] = await db
      .select()
      .from(transaction)
      .where(eq(transaction.paymentTransactionId, paymentTransactionId))
      .limit(1);
    return existing;
  },
  async createOneTimePayment(payload: {
    userId: string;
    paymentTransactionId: string;
    amount: number;
    currency: string;
  }) {
    const [record] = await db
      .insert(transaction)
      .values({
        userId: payload.userId,
        paymentTransactionId: payload.paymentTransactionId,
        type: 'one_time_payment',
        amount: payload.amount,
        currency: payload.currency,
      })
      .returning();
    return record;
  },
  async createSubscriptionPayment(payload: {
    userId: string;
    subscriptionId: string;
    paymentTransactionId: string;
    amount: number;
    currency: string;
  }) {
    const [record] = await db
      .insert(transaction)
      .values({
        userId: payload.userId,
        subscriptionId: payload.subscriptionId,
        paymentTransactionId: payload.paymentTransactionId,
        type: 'subscription_payment',
        amount: payload.amount,
        currency: payload.currency,
      })
      .returning();
    return record;
  },
};

// 数据访问层：积分
const creditRepo = {
  async grantCredits(payload: {
    userId: string;
    transactionId: string;
    type: string;
    amount: number;
    expiresAt: Date | null;
  }) {
    return db.insert(credit).values({
      userId: payload.userId,
      transactionId: payload.transactionId,
      type: payload.type,
      amount: payload.amount,
      consumed: 0,
      issuedAt: new Date(),
      expiresAt: payload.expiresAt,
    });
  },
};

// 数据访问层：用户
const userRepo = {
  async updateCurrentSubscription(userId: string, subscriptionId: string) {
    return db
      .update(user)
      .set({ currentSubscriptionId: subscriptionId, updatedAt: new Date() })
      .where(eq(user.id, userId));
  },
  async updatePlan(userId: string, planType: string, subscriptionId: string) {
    return db
      .update(user)
      .set({ type: planType, currentSubscriptionId: subscriptionId, updatedAt: new Date() })
      .where(eq(user.id, userId));
  },
  async revokeAccess(userId: string) {
    return db
      .update(user)
      .set({ type: 'free', currentSubscriptionId: null, updatedAt: new Date() })
      .where(eq(user.id, userId));
  },
};

// 一次性支付完成：写入交易 & 发放积分
async function handleCheckoutCompleted(data: any) {
  const { id, product, metadata, order } = data;

  const billingType = product?.billing_type ?? order?.type;
  if (billingType !== 'one-time' && billingType !== 'onetime') {
    return;
  }

  const userId = getUserIdFromMetadata(metadata);
  const creditPack = getCreditPackByProductId(product?.id || '');

  if (!userId || !creditPack) {
    console.error('✗ Checkout completed: Missing required data', {
      userId,
      productId: product?.id,
      creditPack,
    });
    return;
  }

  const paymentTransactionId = order?.transaction || order?.id || id;

  try {
    const existingTransaction = await transactionRepo.findByPaymentTransactionId(
      paymentTransactionId,
    );

    if (existingTransaction) {
      console.log(`⚠ Duplicate checkout detected for transaction ${paymentTransactionId}`);
      return;
    }

    const amount = order?.amount_paid ?? order?.amount ?? product?.price ?? 0;
    const currency = order?.currency || product?.currency || 'USD';

    const transactionRecord = await transactionRepo.createOneTimePayment({
      userId,
      paymentTransactionId,
      amount,
      currency,
    });

    const expiresAt = new Date(Date.now() + creditPack.validDays * 24 * 60 * 60 * 1000);

    await creditRepo.grantCredits({
      userId,
      transactionId: transactionRecord.id,
      type: `credit_pack_${creditPack.id}`,
      amount: creditPack.credits,
      expiresAt,
    });

    console.log(`✓ Granted ${creditPack.credits} credits to user ${userId} - Pack: ${creditPack.id}`);
  } catch (error) {
    console.error('✗ Checkout completed handler error:', error);
    throw error;
  }
}

// 订阅激活：创建订阅记录并绑定用户
async function handleSubscriptionActive(data: any) {
  const {
    id,
    customer,
    product,
    next_transaction_date,
    current_period_end_date,
    metadata,
  } = data;

  const userId = getUserIdFromMetadata(metadata);

  if (!product?.id) {
    console.error('✗ Subscription active: Missing product ID');
    return;
  }

  const pricingTier = getPricingTierByProductId(product.id);
  if (!pricingTier) {
    console.error('✗ Subscription active: Product ID not found in pricing config', {
      productId: product.id,
    });
    return;
  }

  if (!userId || !pricingTier.subscriptionPlanType) {
    console.error('✗ Subscription active: Missing required data', {
      userId,
      productId: product.id,
      planInfo: pricingTier,
    });
    return;
  }

  try {
    const [subscriptionRecord] = await subscriptionRepo.create({
      userId,
      paymentSubscriptionId: id,
      paymentCustomerId: customer?.id || '',
      planType: pricingTier.subscriptionPlanType,
      amount: product.price,
      currency: product.currency || 'USD',
      expiresAt: current_period_end_date ? new Date(current_period_end_date) : null,
      nextBillingAt: next_transaction_date ? new Date(next_transaction_date) : null,
    });

    await userRepo.updateCurrentSubscription(userId, subscriptionRecord.id);

    console.log(`✓ Created subscription for user ${userId} - Subscription ID: ${id}`);
  } catch (error) {
    console.error('✗ Subscription active handler error:', error);
    throw error;
  }
}

// 订阅支付成功：更新订阅 & 发放周期积分
async function handleSubscriptionPaid(data: any) {
  const {
    id,
    last_transaction,
    last_transaction_id,
    product,
    current_period_end_date,
    next_transaction_date,
    metadata,
  } = data;

  const userId = getUserIdFromMetadata(metadata);

  if (!product?.id) {
    console.error('✗ Subscription paid: Missing product ID');
    return;
  }

  const pricingTier = getPricingTierByProductId(product.id);
  if (!pricingTier) {
    console.error('✗ Subscription paid: Product ID not found in pricing config', {
      productId: product.id,
    });
    return;
  }

  if (!userId || !pricingTier.subscriptionPlanType) {
    console.error('✗ Subscription paid: Missing required data', {
      userId,
      productId: product.id,
      pricingTier,
    });
    return;
  }

  const quotaAmount = getSubscriptionQuota(pricingTier.subscriptionPlanType);

  try {
    const existingSubscription = await subscriptionRepo.findActiveByUserId(userId);

    if (!existingSubscription) {
      console.error(`✗ Active subscription not found for user: ${userId}`);
      return;
    }

    const newNextBillingAt = next_transaction_date
      ? new Date(next_transaction_date)
      : null;

    if (
      existingSubscription.nextBillingAt &&
      newNextBillingAt &&
      existingSubscription.nextBillingAt.getTime() === newNextBillingAt.getTime()
    ) {
      console.log(
        `⚠ Duplicate webhook detected for subscription ${existingSubscription.id} - nextBillingAt already set to ${newNextBillingAt.toISOString()}`,
      );
      return;
    }

    await subscriptionRepo.updateById(existingSubscription.id, {
      planType: pricingTier.subscriptionPlanType,
      amount: product.price,
      currency: product.currency,
      expiresAt: current_period_end_date ? new Date(current_period_end_date) : null,
      nextBillingAt: newNextBillingAt,
      updatedAt: new Date(),
    });

    await userRepo.updatePlan(userId, pricingTier.planType, existingSubscription.id);

    console.log(
      `✓ Subscription updated: ${id} - Plan: ${pricingTier.subscriptionPlanType}, Quota: ${quotaAmount}`,
    );

    if (last_transaction && last_transaction.amount_paid > 0) {
      const transactionRecord = await transactionRepo.createSubscriptionPayment({
        userId,
        subscriptionId: existingSubscription.id,
        paymentTransactionId: last_transaction_id || last_transaction.id,
        amount: last_transaction.amount_paid,
        currency: last_transaction.currency || 'USD',
      });

      console.log(
        `✓ Created transaction ${transactionRecord.id} - Amount paid: ${last_transaction.amount_paid} ${last_transaction.currency || 'USD'}`,
      );

      await creditRepo.grantCredits({
        userId,
        transactionId: transactionRecord.id,
        type: pricingTier.subscriptionPlanType,
        amount: quotaAmount,
        expiresAt: current_period_end_date ? new Date(current_period_end_date) : null,
      });

      console.log(
        `✓ Granted ${quotaAmount} quota to user ${userId} - Plan: ${pricingTier.subscriptionPlanType}`,
      );
    } else {
      console.log(
        `⚠ No quota granted: amount_paid is ${last_transaction?.amount_paid || 0}`,
      );
    }
  } catch (error) {
    console.error('✗ Subscription paid handler error:', error);
    throw error;
  }
}

// 订阅取消
async function handleSubscriptionCanceled(data: any) {
  await updateSubscriptionStatus('canceled', data);
}

// 订阅过期
async function handleSubscriptionExpired(data: any) {
  await updateSubscriptionStatus('expired', data);
}

// 订阅暂停
async function handleSubscriptionPaused(data: any) {
  await updateSubscriptionStatus('paused', data);
}

// 授权回调：当前未实现业务逻辑
async function handleGrantAccess() {
  return;
}

// 撤销访问权限：降级为免费用户
async function handleRevokeAccess(data: any) {
  const { reason, customer, product, metadata } = data;
  const userId = getUserIdFromMetadata(metadata);

  console.log(
    `Revoke access: ${reason} - User: ${userId}, Email: ${customer?.email}, Product: ${product?.name}`,
  );

  if (!userId) {
    console.error('✗ Revoke access: Missing user ID');
    return;
  }

  try {
    await userRepo.revokeAccess(userId);

    console.log(`✓ Revoked access from user ${userId} (${customer?.email})`);
  } catch (error) {
    console.error('✗ Revoke access handler error:', error);
    throw error;
  }
}

// Webhook 入口：签名校验 + 事件分发
export const creemWebhookAdapter: PaymentWebhookAdapter = {
  async handle(request: NextRequest) {
    const signature = request.headers.get('creem-signature');
    if (!signature) {
      return Response.json({ error: 'Missing signature' }, { status: 400 });
    }

    const body = await request.text();
    const creem = resolveCreem();

    try {
      await creem.webhooks.handleEvents(body, signature, {
        onCheckoutCompleted: handleCheckoutCompleted,
        onSubscriptionActive: handleSubscriptionActive,
        onSubscriptionCanceled: handleSubscriptionCanceled,
        onSubscriptionExpired: handleSubscriptionExpired,
        onSubscriptionPaid: handleSubscriptionPaid,
        onSubscriptionPaused: handleSubscriptionPaused,
        onGrantAccess: handleGrantAccess,
        onRevokeAccess: handleRevokeAccess,
      });
      return new Response('OK', { status: 200 });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid signature';
      return new Response(message, { status: 400 });
    }
  },
};
