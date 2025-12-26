import { db } from '@/lib/db';
import { credit } from '@/lib/db/schema';
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

/**
 * 获取用户当前可用积分总数
 * @param userId 用户ID
 * @returns 可用积分总数
 */
export async function getAvailableCredit(userId: string): Promise<number> {
  try {
    const now = new Date();

    // 获取所有未过期或永久有效的积分
    const userCredits = await db
      .select()
      .from(credit)
      .where(
        and(
          eq(credit.userId, userId),
          // 过期时间为null(永久有效)或大于当前时间
        )
      );

    // 过滤出未过期的积分
    const validCredits = userCredits.filter(c => {
      return c.expiresAt === null || c.expiresAt >= now;
    });

    // 计算总的可用积分 (总积分 - 已消耗)
    const totalAvailable = validCredits.reduce((sum, c) => {
      return sum + (c.amount - c.consumed);
    }, 0);

    return Math.max(0, totalAvailable);
  } catch (error) {
    console.error('Failed to get available credit:', error);
    return 0;
  }
}

/**
 * 消耗积分
 * @param userId 用户ID
 * @param amount 消耗数量
 * @returns 是否成功消耗
 */
export async function consumeCredit(
  userId: string,
  amount: number = 1
): Promise<boolean> {
  try {
    const now = new Date();

    // 获取所有未过期或永久有效的积分,按过期时间排序(先到期的先用)
    const userCredits = await db
      .select()
      .from(credit)
      .where(eq(credit.userId, userId))
      .orderBy(credit.expiresAt);

    // 过滤出有效积分
    const validCredits = userCredits.filter(c => {
      return c.expiresAt === null || c.expiresAt >= now;
    });

    // 计算总的可用积分
    const totalAvailable = validCredits.reduce((sum, c) => {
      return sum + (c.amount - c.consumed);
    }, 0);

    // 检查积分是否足够
    if (totalAvailable < amount) {
      return false;
    }

    // 从积分中扣除,优先使用即将过期的积分
    let remaining = amount;
    for (const c of validCredits) {
      if (remaining <= 0) break;

      const available = c.amount - c.consumed;
      if (available <= 0) continue;

      const toConsume = Math.min(available, remaining);

      // 更新积分消耗量
      await db
        .update(credit)
        .set({
          consumed: c.consumed + toConsume,
          updatedAt: new Date(),
        })
        .where(eq(credit.id, c.id));

      remaining -= toConsume;
    }

    return true;
  } catch (error) {
    console.error('Failed to consume credit:', error);
    return false;
  }
}
