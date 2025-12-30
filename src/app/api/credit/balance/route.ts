import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getAvailableCredit, getAllUserCredits } from "@/lib/credit/query";

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

    // 获取用户所有积分记录
    const userCredits = await getAllUserCredits(session.user.id);

    // 获取可用积分总数
    const totalRemaining = await getAvailableCredit(session.user.id);

    // 计算总消耗
    const totalConsumed = userCredits.reduce((sum, c) => sum + c.consumed, 0);

    // 统计活跃积分数
    const now = new Date();
    const activeCredits = userCredits.filter((c) => {
      const isNotExpired = c.expiresAt === null || c.expiresAt >= now;
      const hasRemaining = c.amount - c.consumed > 0;
      return isNotExpired && hasRemaining;
    });

    // 格式化积分数据用于前端显示
    const credits = userCredits.map((c) => ({
      id: c.id,
      type: c.type,
      amount: c.amount,
      consumed: c.consumed,
      remaining: c.amount - c.consumed,
      issuedAt: c.createdAt.toISOString(),
      expiresAt: c.expiresAt?.toISOString() || null,
    }));

    return NextResponse.json({
      credits,
      summary: {
        totalRemaining,
        totalConsumed,
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


