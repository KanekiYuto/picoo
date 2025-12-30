/**
 * 订阅计划积分配置
 */

import { SUBSCRIPTION_PLANS } from './pricing';

/**
 * 年付订阅积分系数
 */
const ANNUAL_SUBSCRIPTION_POINTS_COEFFICIENT = 1.2;

/**
 * 订阅计划积分系数
 */
const SUBSCRIPTION_PLAN_POINTS_COEFFICIENT = {
  [SUBSCRIPTION_PLANS.MONTHLY_BASIC]: 1.5, // 基础版月付积分系数
  [SUBSCRIPTION_PLANS.YEARLY_BASIC]: 1.5 * ANNUAL_SUBSCRIPTION_POINTS_COEFFICIENT, // 基础版年付积分系数
  [SUBSCRIPTION_PLANS.MONTHLY_PLUS]: 1.5, // Plus版月付积分系数
  [SUBSCRIPTION_PLANS.YEARLY_PLUS]: 1.5 * ANNUAL_SUBSCRIPTION_POINTS_COEFFICIENT, // Plus版年付积分系数
  [SUBSCRIPTION_PLANS.MONTHLY_PRO]: 2, // 专业版月付积分系数
  [SUBSCRIPTION_PLANS.YEARLY_PRO]: 2 * ANNUAL_SUBSCRIPTION_POINTS_COEFFICIENT, // 专业版年付积分系数
} as const;

/**
 * 订阅计划积分金额配置（用于数据库积分管理）
 */
export const SUBSCRIPTION_CREDITS_AMOUNT_CONFIG: Record<string, number> = {
  // 基础版 - 月付
  [SUBSCRIPTION_PLANS.MONTHLY_BASIC]: 1000 * SUBSCRIPTION_PLAN_POINTS_COEFFICIENT[SUBSCRIPTION_PLANS.MONTHLY_BASIC],

  // 基础版 - 年付
  [SUBSCRIPTION_PLANS.YEARLY_BASIC]: 1000 * 12 * SUBSCRIPTION_PLAN_POINTS_COEFFICIENT[SUBSCRIPTION_PLANS.YEARLY_BASIC],

  // Plus版 - 月付
  [SUBSCRIPTION_PLANS.MONTHLY_PLUS]: 3000 * SUBSCRIPTION_PLAN_POINTS_COEFFICIENT[SUBSCRIPTION_PLANS.MONTHLY_PLUS],

  // Plus版 - 年付
  [SUBSCRIPTION_PLANS.YEARLY_PLUS]: 3000 * 12 * SUBSCRIPTION_PLAN_POINTS_COEFFICIENT[SUBSCRIPTION_PLANS.YEARLY_PLUS],

  // 专业版 - 月付
  [SUBSCRIPTION_PLANS.MONTHLY_PRO]: 10000 * SUBSCRIPTION_PLAN_POINTS_COEFFICIENT[SUBSCRIPTION_PLANS.MONTHLY_PRO],

  // 专业版 - 年付
  [SUBSCRIPTION_PLANS.YEARLY_PRO]: 10000 * 12 * SUBSCRIPTION_PLAN_POINTS_COEFFICIENT[SUBSCRIPTION_PLANS.YEARLY_PRO],
};

/**
 * 获取订阅计划积分金额（取整数）
 */
function getSubscriptionCreditsAmount(planKey: string): number {
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

// 订阅计划积分配置（按计费周期分别配置）
export const SUBSCRIPTION_CREDITS_CONFIG: Record<string, Record<string, number>> = {
  // 基础版 - 月付
  [SUBSCRIPTION_PLANS.MONTHLY_BASIC]: {
    credits: getSubscriptionCreditsAmount(SUBSCRIPTION_PLANS.MONTHLY_BASIC),
    max_images_per_month: Math.floor(getSubscriptionCreditsAmount(SUBSCRIPTION_PLANS.MONTHLY_BASIC) / IMAGE_COST),
    max_videos_per_month: Math.floor(getSubscriptionCreditsAmount(SUBSCRIPTION_PLANS.MONTHLY_BASIC) / VIDEO_COST),
    image_concurrent: 8,
    video_concurrent: 2,
  },
  // 基础版 - 年付
  [SUBSCRIPTION_PLANS.YEARLY_BASIC]: {
    credits: getSubscriptionCreditsAmount(SUBSCRIPTION_PLANS.YEARLY_BASIC),
    max_images_per_month: Math.floor(getSubscriptionCreditsAmount(SUBSCRIPTION_PLANS.YEARLY_BASIC) / 12 / IMAGE_COST),
    max_videos_per_month: Math.floor(getSubscriptionCreditsAmount(SUBSCRIPTION_PLANS.YEARLY_BASIC) / 12 / VIDEO_COST),
    image_concurrent: 8,
    video_concurrent: 2,
  },
  // Plus版 - 月付
  [SUBSCRIPTION_PLANS.MONTHLY_PLUS]: {
    credits: getSubscriptionCreditsAmount(SUBSCRIPTION_PLANS.MONTHLY_PLUS),
    max_images_per_month: Math.floor(getSubscriptionCreditsAmount(SUBSCRIPTION_PLANS.MONTHLY_PLUS) / IMAGE_COST),
    max_videos_per_month: Math.floor(getSubscriptionCreditsAmount(SUBSCRIPTION_PLANS.MONTHLY_PLUS) / VIDEO_COST),
    image_concurrent: 12,
    video_concurrent: 4,
  },
  // Plus版 - 年付
  [SUBSCRIPTION_PLANS.YEARLY_PLUS]: {
    credits: getSubscriptionCreditsAmount(SUBSCRIPTION_PLANS.YEARLY_PLUS),
    max_images_per_month: Math.floor(getSubscriptionCreditsAmount(SUBSCRIPTION_PLANS.YEARLY_PLUS) / 12 / IMAGE_COST),
    max_videos_per_month: Math.floor(getSubscriptionCreditsAmount(SUBSCRIPTION_PLANS.YEARLY_PLUS) / 12 / VIDEO_COST),
    image_concurrent: 12,
    video_concurrent: 4,
  },
  // 专业版 - 月付
  [SUBSCRIPTION_PLANS.MONTHLY_PRO]: {
    credits: getSubscriptionCreditsAmount(SUBSCRIPTION_PLANS.MONTHLY_PRO),
    max_images_per_month: Math.floor(getSubscriptionCreditsAmount(SUBSCRIPTION_PLANS.MONTHLY_PRO) / IMAGE_COST),
    max_videos_per_month: Math.floor(getSubscriptionCreditsAmount(SUBSCRIPTION_PLANS.MONTHLY_PRO) / VIDEO_COST),
    image_concurrent: 60,
    video_concurrent: 20,
  },
  // 专业版 - 年付
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
