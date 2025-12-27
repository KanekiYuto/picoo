import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { asset } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { uploadToR2 } from "@/lib/storage/r2";
import { validateFile } from "@/lib/storage/validation";

export const runtime = "nodejs";

/**
 * 素材上传接口
 * POST /api/asset/upload
 *
 * 请求参数 (FormData):
 * - file: 文件（必需）
 * - description: 描述（可选）
 * - tags: 标签数组的 JSON 字符串（可选）
 */
export async function POST(request: NextRequest) {
  try {
    // 验证用户身份
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "未授权" }, { status: 401 });
    }

    // 获取表单数据
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const description = formData.get("description") as string | null;
    const tags = formData.get("tags") as string | null; // JSON 数组字符串

    if (!file) {
      return NextResponse.json({ success: false, error: "未提供文件" }, { status: 400 });
    }

    // 验证文件
    const validation = validateFile({
      name: file.name,
      size: file.size,
      type: file.type,
    });

    if (!validation.valid) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
    }

    // 上传到 R2
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadResult = await uploadToR2({
      file: buffer,
      fileName: file.name,
      contentType: file.type,
      prefix: `assets/${session.user.id}`,
    });

    // 解析标签
    let parsedTags: string[] = [];
    if (tags) {
      try {
        parsedTags = JSON.parse(tags);
      } catch (error) {
        console.error("Failed to parse tags:", error);
      }
    }

    // 判断文件类型（只支持图片和视频）
    let fileType: "image" | "video";
    if (file.type.startsWith("image/")) {
      fileType = "image";
    } else if (file.type.startsWith("video/")) {
      fileType = "video";
    } else {
      return NextResponse.json(
        { success: false, error: "只支持图片和视频文件" },
        { status: 400 }
      );
    }

    // 保存到数据库
    const [newAsset] = await db
      .insert(asset)
      .values({
        userId: session.user.id,
        filename: uploadResult.key,
        originalFilename: file.name,
        url: uploadResult.url,
        type: fileType,
        mimeType: file.type,
        size: file.size,
        tags: parsedTags,
        description,
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: {
        id: newAsset.id,
        url: newAsset.url,
        type: newAsset.type,
        filename: newAsset.filename,
        originalFilename: newAsset.originalFilename,
        size: newAsset.size,
        mimeType: newAsset.mimeType,
        createdAt: newAsset.createdAt,
      },
    });
  } catch (error) {
    console.error("Asset upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "上传素材失败",
      },
      { status: 500 }
    );
  }
}

/**
 * 获取用户的素材列表
 * GET /api/asset/upload?type=image&limit=20&offset=0
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
    const conditions = [eq(asset.userId, session.user.id)];
    if (type) {
      conditions.push(eq(asset.type, type));
    }

    // 执行查询
    const query = db
      .select()
      .from(asset)
      .where(conditions.length > 1 ? and(...conditions) : conditions[0])
      .orderBy(desc(asset.createdAt))
      .limit(limit)
      .offset(offset);

    const assets = await query;

    return NextResponse.json({
      success: true,
      data: {
        assets,
        total: assets.length,
        limit,
        offset,
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
