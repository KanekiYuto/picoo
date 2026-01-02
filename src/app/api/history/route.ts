import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserGenerationHistory } from "@/lib/db/services/generation-task";

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

    // 调用公共函数获取历史
    const result = await getUserGenerationHistory(session.user.id, limit, offset);

    return NextResponse.json({
      success: true,
      data: result,
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
