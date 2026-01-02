import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { mediaGenerationTask } from "@/lib/db/schema";
import { eq, desc, and, count, isNull } from "drizzle-orm";

export const runtime = "nodejs";

/**
 * 获取用户的生成历史列表
 * GET /api/history?limit=20&offset=0
 */
export async function GET(request: NextRequest) {
  try {
    // 验证用户身份
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "未授权" }, { status: 401 });
    }

    // 获取查询参数
    const limit = parseInt(request.nextUrl.searchParams.get("limit") || "20");
    const offset = parseInt(request.nextUrl.searchParams.get("offset") || "0");

    // 构建查询条件（不包括已删除的任务）
    const conditions = [
      eq(mediaGenerationTask.userId, session.user.id),
      isNull(mediaGenerationTask.deletedAt),
    ];

    // 获取总数
    const [{ total }] = await db
      .select({ total: count() })
      .from(mediaGenerationTask)
      .where(and(...conditions));

    // 执行分页查询
    const tasks = await db
      .select({
        id: mediaGenerationTask.id,
        parameters: mediaGenerationTask.parameters,
        result: mediaGenerationTask.results,
        type: mediaGenerationTask.taskType,
        createdAt: mediaGenerationTask.createdAt,
        updatedAt: mediaGenerationTask.updatedAt,
      })
      .from(mediaGenerationTask)
      .where(and(...conditions))
      .orderBy(desc(mediaGenerationTask.createdAt))
      .limit(limit)
      .offset(offset);

    // 格式化响应数据
    const histories = tasks.map((task) => {
      const parameters = task.parameters as Record<string, any> || {};
      const resultsArray = Array.isArray(task.result) ? task.result : [];
      const resultUrls = resultsArray.map((r: any) => r.url).filter(Boolean);

      return {
        id: task.id,
        prompt: parameters.prompt || "",
        results: resultUrls,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        histories,
        total,
        limit,
        offset,
        hasMore: offset + histories.length < total,
      },
    });
  } catch (error) {
    console.error("Get history error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "获取历史列表失败",
      },
      { status: 500 }
    );
  }
}
