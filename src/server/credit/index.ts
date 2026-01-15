/**
 * 积分管理模块
 * 统一导出所有积分相关功能
 */

// 配置相关
export { creditConfig, getDailyFreeCredit, type UserType } from './config';

// 每日积分相关
export { checkAndIssueDailyCredit } from './daily-credit';

// 查询相关
export { getAvailableCredit, getAllUserCredits } from './query';

// 交易相关
export {
  consumeCredit,
  refundCredit,
  type ConsumeCreditResult,
  type RefundCreditResult,
} from './transaction';
