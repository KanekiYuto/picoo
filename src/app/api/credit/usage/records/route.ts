import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { creditTransaction, credit } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const pageSize = Math.min(100, parseInt(searchParams.get("pageSize") || "20"));
    const type = searchParams.get("type") || "all";

    // 构建查询条件
    const whereConditions = [eq(creditTransaction.userId, userId)];
    if (type !== "all") {
      whereConditions.push(eq(creditTransaction.type, type));
    }

    // 获取总条数
    const countResult = await db
      .select({ count: creditTransaction.id })
      .from(creditTransaction)
      .where(and(...whereConditions));

    const totalCount = countResult.length;
    const totalPages = Math.ceil(totalCount / pageSize);

    // 计算分页偏移
    const offset = (page - 1) * pageSize;

    // 查询分页数据
    const transactions = await db
      .select({
        id: creditTransaction.id,
        type: creditTransaction.type,
        amount: creditTransaction.amount,
        balanceBefore: creditTransaction.balanceBefore,
        balanceAfter: creditTransaction.balanceAfter,
        note: creditTransaction.note,
        createdAt: creditTransaction.createdAt,
        creditId: creditTransaction.creditId,
      })
      .from(creditTransaction)
      .where(and(...whereConditions))
      .orderBy(desc(creditTransaction.createdAt))
      .limit(pageSize)
      .offset(offset);

    // 获取关联的积分类型信息
    const creditIds = [...new Set(transactions.map(t => t.creditId))];
    const credits = await db
      .select({
        id: credit.id,
        type: credit.type,
      })
      .from(credit)
      .where(eq(credit.userId, userId));

    const creditTypeMap = new Map(credits.map(c => [c.id, c.type]));

    // 组合数据
    const records = transactions.map((t) => ({
      id: t.id,
      type: t.type,
      amount: t.amount,
      balanceBefore: t.balanceBefore,
      balanceAfter: t.balanceAfter,
      note: t.note,
      createdAt: t.createdAt.toISOString(),
      creditType: creditTypeMap.get(t.creditId) || 'unknown',
    }));

    return NextResponse.json({
      records,
      totalPages,
      currentPage: page,
      pageSize,
      totalCount,
    });
  } catch (error) {
    console.error("Failed to fetch usage records:", error);
    return NextResponse.json(
      { error: "Failed to fetch usage records" },
      { status: 500 }
    );
  }
}
