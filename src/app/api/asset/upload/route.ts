import { NextRequest, NextResponse } from "next/server";
import { uploadToR2 } from "@/server/storage/r2";
import { validateFile } from "@/server/storage/validation";
import { createAsset } from "@/server/db/services/asset";

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
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // 获取表单数据
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const description = formData.get("description") as string | null;
    const tags = formData.get("tags") as string | null; // JSON 数组字符串

    if (!file) {
      return NextResponse.json({ success: false, error: "File is required" }, { status: 400 });
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
      prefix: `assets/${userId}`,
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
        { success: false, error: "Only image and video files are supported" },
        { status: 400 }
      );
    }

    // 1. 先创建 storage 记录
    const { storage: storageRecord } = await createAsset(
      userId,
      {
        key: uploadResult.key,
        url: uploadResult.url,
        filename: file.name,
        originalFilename: file.name,
        type: fileType,
        mimeType: file.type,
        size: file.size,
      },
      {
        tags: parsedTags,
        description,
      }
    );

    return NextResponse.json({
      success: true,
      data: {
        id: storageRecord.id,
        url: uploadResult.url,
        type: fileType,
        filename: file.name,
        originalFilename: file.name,
        size: file.size,
        mimeType: file.type,
        createdAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Asset upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to upload asset",
      },
      { status: 500 }
    );
  }
}
