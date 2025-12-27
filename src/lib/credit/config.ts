// 积分配置
export const creditConfig = {
  // 每日免费积分数量
  dailyFreeCredit: {
    default: 100, // 默认每日100积分
  },

  // 积分类型
  creditTypes: {
    dailyFree: 'daily_free', // 免费配额-每日
    monthlyBasic: 'monthly_basic', // 月度订阅-基础版
    monthlyPro: 'monthly_pro', // 月度订阅-专业版
    yearlyBasic: 'yearly_basic', // 年度订阅-基础版
    yearlyPro: 'yearly_pro', // 年度订阅-专业版
    quotaPack: 'quota_pack', // 配额包
  },

  // 用户类型
  userTypes: {
    free: 'free',
    basic: 'basic',
    plus: 'plus',
    pro: 'pro',
  },
} as const;

export type UserType = 'free' | 'basic' | 'plus' | 'pro';

/**
 * 获取每日免费积分数量
 * @returns 积分数量
 */
export function getDailyFreeCredit(): number {
  return creditConfig.dailyFreeCredit.default;
}
