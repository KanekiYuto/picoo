import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { mediaGenerationTask } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export const runtime = "nodejs";

/**
 * 删除单条生成历史
 * DELETE /api/history/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 验证用户身份
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "未授权" }, { status: 401 });
    }

    const { id } = await params;

    // 验证记录是否存在且属于当前用户
    const task = await db
      .select()
      .from(mediaGenerationTask)
      .where(
        and(
          eq(mediaGenerationTask.id, id),
          eq(mediaGenerationTask.userId, session.user.id)
        )
      )
      .limit(1);

    if (!task || task.length === 0) {
      return NextResponse.json(
        { success: false, error: "记录不存在或无权删除" },
        { status: 404 }
      );
    }

    // 软删除（标记删除时间）
    await db
      .update(mediaGenerationTask)
      .set({ deletedAt: new Date() })
      .where(eq(mediaGenerationTask.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete history error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "删除历史失败",
      },
      { status: 500 }
    );
  }
}
