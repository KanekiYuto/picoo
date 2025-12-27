/**
 * 积分交易管理模块
 * 处理积分消费、退款等交易相关操作
 */

import { db } from '@/lib/db';
import { credit, creditTransaction } from '@/lib/db/schema';
import { eq, and, gt, or, isNull } from 'drizzle-orm';

/**
 * 积分消费结果
 */
export interface ConsumeCreditResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

/**
 * 积分退款结果
 */
export interface RefundCreditResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

/**
 * 消费积分
 * @param userId 用户ID
 * @param amount 消费数量
 * @param note 备注信息
 * @returns 消费结果
 */
export async function consumeCredit(
  userId: string,
  amount: number,
  note: string
): Promise<ConsumeCreditResult> {
  try {
    // 参数验证
    if (amount <= 0) {
      return {
        success: false,
        error: 'Amount must be greater than 0',
      };
    }

    // 查找可用的积分记录
    const availableCredits = await db
      .select()
      .from(credit)
      .where(
        and(
          eq(credit.userId, userId),
          gt(credit.amount, credit.consumed),
          or(isNull(credit.expiresAt), gt(credit.expiresAt, new Date()))
        )
      )
      .orderBy(credit.issuedAt);

    // 检查是否有可用积分记录
    if (availableCredits.length === 0) {
      return {
        success: false,
        error: 'No available credit records',
      };
    }

    // 计算总可用积分
    const totalAvailable = availableCredits.reduce(
      (sum, c) => sum + (c.amount - c.consumed),
      0
    );

    // 检查积分是否充足
    if (totalAvailable < amount) {
      return {
        success: false,
        error: 'Insufficient credits',
      };
    }

    // 扣除积分
    let remainingToConsume = amount;
    let selectedCreditId: string | null = null;
    let balanceBefore = 0;
    let balanceAfter = 0;

    for (const creditRecord of availableCredits) {
      if (remainingToConsume <= 0) break;

      const available = creditRecord.amount - creditRecord.consumed;
      const toConsume = Math.min(available, remainingToConsume);

      if (!selectedCreditId) {
        selectedCreditId = creditRecord.id;
        balanceBefore = available;
      }

      // 更新积分消耗
      await db
        .update(credit)
        .set({
          consumed: creditRecord.consumed + toConsume,
          updatedAt: new Date(),
        })
        .where(eq(credit.id, creditRecord.id));

      remainingToConsume -= toConsume;

      if (creditRecord.id === selectedCreditId) {
        balanceAfter = balanceBefore - toConsume;
      }
    }

    // 确保选择了积分记录
    if (!selectedCreditId) {
      return {
        success: false,
        error: 'Failed to select credit record',
      };
    }

    // 创建积分交易记录
    const [transaction] = await db
      .insert(creditTransaction)
      .values({
        userId,
        creditId: selectedCreditId,
        type: 'consume',
        amount: -amount,
        balanceBefore,
        balanceAfter,
        note,
      })
      .returning();

    return {
      success: true,
      transactionId: transaction.id,
    };
  } catch (error) {
    console.error('Consume credit error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to consume credit',
    };
  }
}

/**
 * 退款积分
 * @param consumeTransactionId 原始消费交易ID（必填，用于保证对账正确）
 * @param note 备注信息
 * @returns 退款结果
 */
export async function refundCredit(
  consumeTransactionId: string,
  note: string
): Promise<RefundCreditResult> {
  try {
    // 1. 查找原始消费交易记录
    const [consumeTransaction] = await db
      .select()
      .from(creditTransaction)
      .where(eq(creditTransaction.id, consumeTransactionId));

    if (!consumeTransaction) {
      return {
        success: false,
        error: 'Consume transaction not found',
      };
    }

    // 验证交易类型
    if (consumeTransaction.type !== 'consume') {
      return {
        success: false,
        error: 'Transaction is not a consume type',
      };
    }

    // 2. 检查是否已经退款过（防止重复退款）
    const existingRefunds = await db
      .select()
      .from(creditTransaction)
      .where(
        and(
          eq(creditTransaction.relatedTransactionId, consumeTransactionId),
          eq(creditTransaction.type, 'refund')
        )
      );

    if (existingRefunds.length > 0) {
      return {
        success: false,
        error: 'Transaction has already been refunded',
      };
    }

    // 3. 获取原始消费的积分数量（消费记录中 amount 是负数）
    const refundAmount = Math.abs(consumeTransaction.amount);

    if (refundAmount <= 0) {
      return {
        success: false,
        error: 'Invalid refund amount',
      };
    }

    // 4. 查找原始消费的积分记录
    const [targetCredit] = await db
      .select()
      .from(credit)
      .where(eq(credit.id, consumeTransaction.creditId));

    if (!targetCredit) {
      return {
        success: false,
        error: 'Credit record not found',
      };
    }

    const balanceBefore = targetCredit.amount - targetCredit.consumed;

    // 5. 更新积分（减少已消耗的数量，即退款）
    await db
      .update(credit)
      .set({
        consumed: Math.max(0, targetCredit.consumed - refundAmount),
        updatedAt: new Date(),
      })
      .where(eq(credit.id, targetCredit.id));

    const balanceAfter = balanceBefore + refundAmount;

    // 6. 创建退款交易记录
    const [refundTransaction] = await db
      .insert(creditTransaction)
      .values({
        userId: consumeTransaction.userId,
        creditId: targetCredit.id,
        type: 'refund',
        amount: refundAmount,
        balanceBefore,
        balanceAfter,
        relatedTransactionId: consumeTransactionId,
        note,
      })
      .returning();

    return {
      success: true,
      transactionId: refundTransaction.id,
    };
  } catch (error) {
    console.error('Refund credit error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to refund credit',
    };
  }
}
