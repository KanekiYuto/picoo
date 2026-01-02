import { NextRequest, NextResponse } from "next/server";
import { uploadToR2 } from "@/lib/storage/r2";
import { FILE_LIMITS, formatFileSize, validateFile } from "@/lib/storage/validation";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const modelType = request.nextUrl.searchParams.get("modelType");
    const modelName = request.nextUrl.searchParams.get("modelName");
    const customPrefix = request.nextUrl.searchParams.get("prefix");

    let prefix = "uploads";
    if (modelType && modelName) {
      prefix = `${modelType}/${modelName}`;
      if (customPrefix) prefix = `${prefix}/${customPrefix}`;
    } else if (customPrefix) {
      prefix = customPrefix;
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    const validation = validateFile({
      name: file.name,
      size: file.size,
      type: file.type,
    });

    if (!validation.valid) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const uploadResult = await uploadToR2({
      file: buffer,
      fileName: file.name,
      contentType: file.type,
      prefix,
    });

    return NextResponse.json({
      success: true,
      data: {
        key: uploadResult.key,
        url: uploadResult.url,
        size: uploadResult.size,
        file_type: validation.fileType,
        file_name: file.name,
        content_type: file.type,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to upload file" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const allowedTypes = Object.entries(FILE_LIMITS).reduce((acc, [type, config]) => {
      acc[type] = {
        extensions: config.extensions,
        mime_types: config.mimeTypes,
        max_size: formatFileSize(config.maxSize),
        max_size_bytes: config.maxSize,
      };
      return acc;
    }, {} as Record<string, { extensions: readonly string[]; mime_types: readonly string[]; max_size: string; max_size_bytes: number }>);

    return NextResponse.json({
      success: true,
      data: {
        allowed_types: allowedTypes,
      },
    });
  } catch (error) {
    console.error("Get upload config error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get upload config",
      },
      { status: 500 }
    );
  }
}
