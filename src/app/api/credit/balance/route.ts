import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { credit } from "@/lib/db/schema";
import { eq, and, or, isNull, gt } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "未授权" },
        { status: 401 }
      );
    }

    // 查询用户的所有积分记录
    const userCredits = await db
      .select()
      .from(credit)
      .where(eq(credit.userId, session.user.id))
      .orderBy(credit.createdAt);

    // 计算每个积分的剩余量
    const creditsWithRemaining = userCredits.map((c) => ({
      id: c.id,
      type: c.type,
      amount: c.amount,
      consumed: c.consumed,
      remaining: c.amount - c.consumed,
      issuedAt: c.issuedAt.toISOString(),
      expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
      createdAt: c.createdAt.toISOString(),
    }));

    // 计算总积分（只计算有效且未过期的）
    const now = new Date();
    const activeCredits = creditsWithRemaining.filter((c) => {
      const hasRemaining = c.remaining > 0;
      const notExpired = !c.expiresAt || new Date(c.expiresAt) > now;
      return hasRemaining && notExpired;
    });

    const totalRemaining = activeCredits.reduce((sum, c) => sum + c.remaining, 0);

    // 计算今日消耗（所有积分类型的今日消耗总和）
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayCredits = userCredits.filter((c) => {
      const createdAt = new Date(c.createdAt);
      return createdAt >= todayStart;
    });

    // 简单计算：取今日新增的消耗量
    const todayConsumed = todayCredits.reduce((sum, c) => sum + c.consumed, 0);

    return NextResponse.json({
      credits: creditsWithRemaining,
      summary: {
        totalRemaining,
        todayConsumed,
        activeCreditsCount: activeCredits.length,
      },
    });
  } catch (error) {
    console.error("Failed to fetch credit balance:", error);
    return NextResponse.json(
      { error: "获取积分信息失败" },
      { status: 500 }
    );
  }
}
