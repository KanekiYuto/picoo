import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { generationTask } from "@/server/db/schema";
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
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // 验证记录是否存在且属于当前用户
    const task = await db
      .select()
      .from(generationTask)
      .where(
        and(
          eq(generationTask.id, id),
          eq(generationTask.userId, userId)
        )
      )
      .limit(1);

    if (!task || task.length === 0) {
      return NextResponse.json(
        { success: false, error: "Record not found or access denied" },
        { status: 404 }
      );
    }

    // 软删除（标记删除时间）
    await db
      .update(generationTask)
      .set({ deletedAt: new Date() })
      .where(eq(generationTask.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete history error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete history",
      },
      { status: 500 }
    );
  }
}
