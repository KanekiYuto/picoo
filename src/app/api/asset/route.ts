import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { asset, storage } from "@/lib/db/schema";
import { eq, desc, and, count, isNull } from "drizzle-orm";

export const runtime = "nodejs";

/**
 * 获取用户的素材列表
 * GET /api/asset?type=image&limit=20&offset=0
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
    const type = request.nextUrl.searchParams.get("type");
    const limit = parseInt(request.nextUrl.searchParams.get("limit") || "20");
    const offset = parseInt(request.nextUrl.searchParams.get("offset") || "0");

    // 构建查询条件
    const conditions = [
      eq(asset.userId, session.user.id),
      isNull(asset.deletedAt),
    ];
    if (type) {
      conditions.push(eq(storage.type, type));
    }

    // 获取总数
    const [{ total }] = await db
      .select({ total: count() })
      .from(asset)
      .innerJoin(storage, eq(asset.storageId, storage.id))
      .where(conditions.length > 1 ? and(...conditions) : conditions[0]);

    // 执行分页查询
    const results = await db
      .select({
        id: asset.id,
        filename: storage.filename,
        originalFilename: storage.originalFilename,
        url: storage.url,
        type: storage.type,
        mimeType: storage.mimeType,
        size: storage.size,
        tags: asset.tags,
        description: asset.description,
        createdAt: asset.createdAt,
        updatedAt: asset.updatedAt,
      })
      .from(asset)
      .innerJoin(storage, eq(asset.storageId, storage.id))
      .where(conditions.length > 1 ? and(...conditions) : conditions[0])
      .orderBy(desc(asset.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      success: true,
      data: {
        assets: results,
        total,
        limit,
        offset,
        hasMore: offset + results.length < total,
      },
    });
  } catch (error) {
    console.error("Get assets error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "获取素材列表失败",
      },
      { status: 500 }
    );
  }
}
