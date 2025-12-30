/**
 * 定价配置
 */

// 计费周期类型
export type BillingCycle = 'monthly' | 'yearly';

// 方案类型
export type PlanType = 'free' | 'basic' | 'plus' | 'pro';

// 定价方案常量
export const PRICING_PLANS = {
  FREE: 'free',
  BASIC: 'basic',
  PLUS: 'plus',
  PRO: 'pro',
} as const;

export type PricingPlanId = typeof PRICING_PLANS[keyof typeof PRICING_PLANS];

// 月付价格配置 (USD)
export const PLAN_PRICES = {
  FREE: 0,
  BASIC: 10,
  PLUS: 20,
  PRO: 100,
} as const;

// 订阅计划类型常量
export const SUBSCRIPTION_PLANS = {
  MONTHLY_BASIC: 'monthly_basic',
  YEARLY_BASIC: 'yearly_basic',
  MONTHLY_PLUS: 'monthly_plus',
  YEARLY_PLUS: 'yearly_plus',
  MONTHLY_PRO: 'monthly_pro',
  YEARLY_PRO: 'yearly_pro',
  FREE: 'free',
} as const;

// 年付折扣百分比
export const YEARLY_DISCOUNT_PERCENT = 20;

// 计算年付价格的辅助函数
export const calculateYearlyPrice = (monthlyPrice: number): number => {
  return Math.round(monthlyPrice * 12 * (1 - YEARLY_DISCOUNT_PERCENT / 100));
};

// 定价方案元数据
export interface PricingPlanMetadata {
  id: PlanType;
  monthlyPrice: number;
  isPopular?: boolean;
  outerColor?: string;
  colorClass: string;
}

export const PRICING_PLANS_METADATA: Record<PlanType, PricingPlanMetadata> = {
  free: {
    id: 'free',
    monthlyPrice: PLAN_PRICES.FREE,
    colorClass: 'bg-[linear-gradient(180deg,rgba(96,125,139,0.03)_0%,rgba(96,125,139,0.30)_100%)]',
  },
  basic: {
    id: 'basic',
    monthlyPrice: PLAN_PRICES.BASIC,
    isPopular: true,
    colorClass: 'bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(58,134,255,0.30)_100%)]',
    outerColor: 'bg-[#3A86FF]',
  },
  plus: {
    id: 'plus',
    monthlyPrice: PLAN_PRICES.PLUS,
    colorClass: 'bg-[linear-gradient(180deg,rgba(251,86,7,0.03)_0%,rgba(251,86,7,0.30)_100%)]',
  },
  pro: {
    id: 'pro',
    monthlyPrice: PLAN_PRICES.PRO,
    colorClass: 'bg-[linear-gradient(180deg,rgba(255,0,110,0.03)_0%,rgba(255,0,110,0.30)_100%)]',
    outerColor: 'bg-[#E91E63]',
  },
};

// ==========================================
// 积分配置
// ==========================================

/**
 * 年付订阅积分系数
 */
const ANNUAL_SUBSCRIPTION_POINTS_COEFFICIENT = 1.2;

/**
 * 订阅计划积分系数
 */
const SUBSCRIPTION_PLAN_POINTS_COEFFICIENT = {
  [SUBSCRIPTION_PLANS.MONTHLY_BASIC]: 1.5,
  [SUBSCRIPTION_PLANS.YEARLY_BASIC]: 1.5 * ANNUAL_SUBSCRIPTION_POINTS_COEFFICIENT,
  [SUBSCRIPTION_PLANS.MONTHLY_PLUS]: 1.5,
  [SUBSCRIPTION_PLANS.YEARLY_PLUS]: 1.5 * ANNUAL_SUBSCRIPTION_POINTS_COEFFICIENT,
  [SUBSCRIPTION_PLANS.MONTHLY_PRO]: 2,
  [SUBSCRIPTION_PLANS.YEARLY_PRO]: 2 * ANNUAL_SUBSCRIPTION_POINTS_COEFFICIENT,
} as const;

/**
 * 订阅计划积分金额配置（用于数据库积分管理）
 */
export const SUBSCRIPTION_CREDITS_AMOUNT_CONFIG: Record<string, number> = {
  [SUBSCRIPTION_PLANS.MONTHLY_BASIC]: 1000 * SUBSCRIPTION_PLAN_POINTS_COEFFICIENT[SUBSCRIPTION_PLANS.MONTHLY_BASIC],
  [SUBSCRIPTION_PLANS.YEARLY_BASIC]: 1000 * 12 * SUBSCRIPTION_PLAN_POINTS_COEFFICIENT[SUBSCRIPTION_PLANS.YEARLY_BASIC],
  [SUBSCRIPTION_PLANS.MONTHLY_PLUS]: 3000 * SUBSCRIPTION_PLAN_POINTS_COEFFICIENT[SUBSCRIPTION_PLANS.MONTHLY_PLUS],
  [SUBSCRIPTION_PLANS.YEARLY_PLUS]: 3000 * 12 * SUBSCRIPTION_PLAN_POINTS_COEFFICIENT[SUBSCRIPTION_PLANS.YEARLY_PLUS],
  [SUBSCRIPTION_PLANS.MONTHLY_PRO]: 10000 * SUBSCRIPTION_PLAN_POINTS_COEFFICIENT[SUBSCRIPTION_PLANS.MONTHLY_PRO],
  [SUBSCRIPTION_PLANS.YEARLY_PRO]: 10000 * 12 * SUBSCRIPTION_PLAN_POINTS_COEFFICIENT[SUBSCRIPTION_PLANS.YEARLY_PRO],
};

/**
 * 获取订阅计划积分金额（取整数）
 */
export function getSubscriptionCreditsAmount(planKey: string): number {
  return Math.round(SUBSCRIPTION_CREDITS_AMOUNT_CONFIG[planKey] || 0);
}

/**
 * 图片生成成本（每张）
 */
const IMAGE_COST = 5;

/**
 * 视频生成成本（每个）
 */
const VIDEO_COST = 50;

/**
 * 订阅计划积分配置（按计费周期分别配置）
 */
export const SUBSCRIPTION_CREDITS_CONFIG: Record<string, Record<string, number>> = {
  [SUBSCRIPTION_PLANS.MONTHLY_BASIC]: {
    credits: getSubscriptionCreditsAmount(SUBSCRIPTION_PLANS.MONTHLY_BASIC),
    max_images_per_month: Math.floor(getSubscriptionCreditsAmount(SUBSCRIPTION_PLANS.MONTHLY_BASIC) / IMAGE_COST),
    max_videos_per_month: Math.floor(getSubscriptionCreditsAmount(SUBSCRIPTION_PLANS.MONTHLY_BASIC) / VIDEO_COST),
    image_concurrent: 8,
    video_concurrent: 2,
  },
  [SUBSCRIPTION_PLANS.YEARLY_BASIC]: {
    credits: getSubscriptionCreditsAmount(SUBSCRIPTION_PLANS.YEARLY_BASIC),
    max_images_per_month: Math.floor(getSubscriptionCreditsAmount(SUBSCRIPTION_PLANS.YEARLY_BASIC) / 12 / IMAGE_COST),
    max_videos_per_month: Math.floor(getSubscriptionCreditsAmount(SUBSCRIPTION_PLANS.YEARLY_BASIC) / 12 / VIDEO_COST),
    image_concurrent: 8,
    video_concurrent: 2,
  },
  [SUBSCRIPTION_PLANS.MONTHLY_PLUS]: {
    credits: getSubscriptionCreditsAmount(SUBSCRIPTION_PLANS.MONTHLY_PLUS),
    max_images_per_month: Math.floor(getSubscriptionCreditsAmount(SUBSCRIPTION_PLANS.MONTHLY_PLUS) / IMAGE_COST),
    max_videos_per_month: Math.floor(getSubscriptionCreditsAmount(SUBSCRIPTION_PLANS.MONTHLY_PLUS) / VIDEO_COST),
    image_concurrent: 12,
    video_concurrent: 4,
  },
  [SUBSCRIPTION_PLANS.YEARLY_PLUS]: {
    credits: getSubscriptionCreditsAmount(SUBSCRIPTION_PLANS.YEARLY_PLUS),
    max_images_per_month: Math.floor(getSubscriptionCreditsAmount(SUBSCRIPTION_PLANS.YEARLY_PLUS) / 12 / IMAGE_COST),
    max_videos_per_month: Math.floor(getSubscriptionCreditsAmount(SUBSCRIPTION_PLANS.YEARLY_PLUS) / 12 / VIDEO_COST),
    image_concurrent: 12,
    video_concurrent: 4,
  },
  [SUBSCRIPTION_PLANS.MONTHLY_PRO]: {
    credits: getSubscriptionCreditsAmount(SUBSCRIPTION_PLANS.MONTHLY_PRO),
    max_images_per_month: Math.floor(getSubscriptionCreditsAmount(SUBSCRIPTION_PLANS.MONTHLY_PRO) / IMAGE_COST),
    max_videos_per_month: Math.floor(getSubscriptionCreditsAmount(SUBSCRIPTION_PLANS.MONTHLY_PRO) / VIDEO_COST),
    image_concurrent: 60,
    video_concurrent: 20,
  },
  [SUBSCRIPTION_PLANS.YEARLY_PRO]: {
    credits: getSubscriptionCreditsAmount(SUBSCRIPTION_PLANS.YEARLY_PRO),
    max_images_per_month: Math.floor(getSubscriptionCreditsAmount(SUBSCRIPTION_PLANS.YEARLY_PRO) / 12 / IMAGE_COST),
    max_videos_per_month: Math.floor(getSubscriptionCreditsAmount(SUBSCRIPTION_PLANS.YEARLY_PRO) / 12 / VIDEO_COST),
    image_concurrent: 60,
    video_concurrent: 20,
  },
};

/**
 * 获取订阅计划积分配置
 */
export function getSubscriptionCreditsConfig(planKey: string): Record<string, number> {
  return SUBSCRIPTION_CREDITS_CONFIG[planKey] || {};
}

// ==========================================
// Creem Pay 配置
// ==========================================

/**
 * Creem Pay 产品 ID 配置
 */
export const CREEM_PAY_PRODUCT_IDS: Record<string, string> = {
  [SUBSCRIPTION_PLANS.MONTHLY_BASIC]: process.env.NEXT_PUBLIC_CREEM_PAY_BASIC_MONTHLY_ID || '',
  [SUBSCRIPTION_PLANS.YEARLY_BASIC]: process.env.NEXT_PUBLIC_CREEM_PAY_BASIC_YEARLY_ID || '',
  [SUBSCRIPTION_PLANS.MONTHLY_PLUS]: process.env.NEXT_PUBLIC_CREEM_PAY_PLUS_MONTHLY_ID || '',
  [SUBSCRIPTION_PLANS.YEARLY_PLUS]: process.env.NEXT_PUBLIC_CREEM_PAY_PLUS_YEARLY_ID || '',
  [SUBSCRIPTION_PLANS.MONTHLY_PRO]: process.env.NEXT_PUBLIC_CREEM_PAY_PRO_MONTHLY_ID || '',
  [SUBSCRIPTION_PLANS.YEARLY_PRO]: process.env.NEXT_PUBLIC_CREEM_PAY_PRO_YEARLY_ID || '',
};

/**
 * 获取 Creem Pay 产品 ID
 */
export function getCreemPayProductId(planKey: string): string {
  return CREEM_PAY_PRODUCT_IDS[planKey] || '';
}

/**
 * 定价层级接口
 */
export interface PricingTier {
  planType: PlanType;
  subscriptionPlanType: string;
}

/**
 * 反向映射：从Creem Pay产品ID查找定价层级
 */
const PRODUCT_ID_TO_PRICING_TIER: Record<string, PricingTier> = {};

// 初始化反向映射
Object.entries(CREEM_PAY_PRODUCT_IDS).forEach(([planKey, productId]) => {
  if (productId) {
    const [billingType, planType] = (planKey as string).split('_');
    PRODUCT_ID_TO_PRICING_TIER[productId] = {
      planType: planType as PlanType,
      subscriptionPlanType: planKey,
    };
  }
});

/**
 * 根据Creem Pay产品ID获取定价层级
 */
export function getPricingTierByProductId(productId: string): PricingTier | null {
  return PRODUCT_ID_TO_PRICING_TIER[productId] || null;
}

/**
 * 获取订阅计划的积分配额
 */
export function getSubscriptionQuota(subscriptionPlanType: string): number {
  return getSubscriptionCreditsAmount(subscriptionPlanType);
}
