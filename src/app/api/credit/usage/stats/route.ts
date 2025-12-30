import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { creditTransaction } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

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

    // 获取所有交易记录计算统计数据
    const transactions = await db
      .select({
        type: creditTransaction.type,
        amount: creditTransaction.amount,
      })
      .from(creditTransaction)
      .where(eq(creditTransaction.userId, session.user.id));

    // 计算总消耗（consume 类型）
    const totalConsumed = transactions
      .filter(t => t.type === 'consume')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    // 总记录数
    const totalRecords = transactions.length;

    // 平均每条记录的消耗
    const consumeRecords = transactions.filter(t => t.type === 'consume');
    const avgPerRecord = consumeRecords.length > 0
      ? Math.round(totalConsumed / consumeRecords.length)
      : 0;

    return NextResponse.json({
      totalConsumed,
      totalRecords,
      avgPerRecord,
    });
  } catch (error) {
    console.error("Failed to fetch usage stats:", error);
    return NextResponse.json(
      { error: "获取统计数据失败" },
      { status: 500 }
    );
  }
}
