import { db } from '@/server/db';
import { credit } from '@/server/db/schema';
import { eq, and, gte } from 'drizzle-orm';
import { creditConfig, getDailyFreeCredit, type UserType } from './config';

/**
 * 检查并下发每日免费积分
 * @param userId 用户ID
 * @param userType 用户类型
 * @returns 是否成功下发积分
 */
export async function checkAndIssueDailyCredit(
  userId: string,
  userType: UserType
): Promise<boolean> {
  // 只为免费用户下发每日积分
  if (userType !== creditConfig.userTypes.free) {
    return false;
  }

  try {
    // 获取当前时间
    const now = new Date();

    // 计算今天开始时间 (UTC 00:00:00)
    const todayStart = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      0, 0, 0, 0
    ));

    // 计算今天结束时间 (UTC 23:59:59.999)
    const todayEnd = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      23, 59, 59, 999
    ));

    // 检查今天是否已经下发过积分
    const existingCredit = await db
      .select()
      .from(credit)
      .where(
        and(
          eq(credit.userId, userId),
          eq(credit.type, creditConfig.creditTypes.dailyFree),
          gte(credit.issuedAt, todayStart)
        )
      )
      .limit(1);

    // 如果今天已经下发过,则不再下发
    if (existingCredit.length > 0) {
      return false;
    }

    // 获取每日免费积分数量
    const creditAmount = getDailyFreeCredit();

    // 下发每日免费积分 (id 由数据库自动生成 UUID)
    await db.insert(credit).values({
      userId: userId,
      type: creditConfig.creditTypes.dailyFree,
      amount: creditAmount,
      consumed: 0,
      issuedAt: new Date(),
      expiresAt: todayEnd, // 当天23:59:59过期
    });

    return true;
  } catch (error) {
    console.error('Failed to issue daily credit:', error);
    return false;
  }
}

