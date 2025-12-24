/**
 * Cloudflare R2 存储客户端（S3 兼容 API）
 */

import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

const STORAGE_VERSION = "beta";

const STORAGE_CONFIG = {
  region: process.env.STORAGE_REGION || "auto",
  endpoint: process.env.STORAGE_ENDPOINT,
  accessKeyId: process.env.STORAGE_ACCESS_KEY_ID,
  secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY,
  bucketName: process.env.STORAGE_BUCKET_NAME,
  publicUrl: process.env.STORAGE_PUBLIC_URL,
} as const;

export interface UploadOptions {
  file: Buffer;
  fileName: string;
  contentType: string;
  prefix?: string;
}

export interface UploadResult {
  key: string;
  url: string;
  size: number;
}

function createR2Client(): S3Client {
  const { region, endpoint, accessKeyId, secretAccessKey } = STORAGE_CONFIG;

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error("Storage credentials not configured");
  }

  return new S3Client({
    region,
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

export function generateFileKey(fileName: string, prefix?: string): string {
  const uuid = randomUUID();
  const ext = fileName.split(".").pop() || "";
  const timestamp = Date.now();

  const baseKey = ext ? `${uuid}-${timestamp}.${ext}` : `${uuid}-${timestamp}`;

  return `${STORAGE_VERSION}/${prefix ? `${prefix}/` : ""}${baseKey}`;
}

export function getFileUrl(key: string): string {
  const { publicUrl } = STORAGE_CONFIG;

  if (!publicUrl) {
    throw new Error(
      "STORAGE_PUBLIC_URL not configured. Please configure a public URL for storage bucket."
    );
  }

  const baseUrl = publicUrl.endsWith("/") ? publicUrl : `${publicUrl}/`;
  return `${baseUrl}${key}`;
}

export async function uploadToR2(options: UploadOptions): Promise<UploadResult> {
  const { file, fileName, contentType, prefix } = options;
  const { bucketName, endpoint, accessKeyId } = STORAGE_CONFIG;

  if (!bucketName) {
    throw new Error("STORAGE_BUCKET_NAME not configured");
  }

  const key = generateFileKey(fileName, prefix);
  const client = createR2Client();

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: file,
    ContentType: contentType,
  });

  try {
    console.log("Uploading to R2:", {
      endpoint,
      bucket: bucketName,
      key,
      accessKeyId: accessKeyId?.substring(0, 10) + "...",
    });

    await client.send(command);

    return {
      key,
      url: getFileUrl(key),
      size: file.length,
    };
  } catch (error) {
    console.error("R2 upload error:", {
      error,
      endpoint,
      bucket: bucketName,
      key,
    });
    throw error;
  }
}

export async function deleteFromR2(key: string): Promise<void> {
  const { bucketName } = STORAGE_CONFIG;

  if (!bucketName) {
    throw new Error("STORAGE_BUCKET_NAME not configured");
  }

  const client = createR2Client();

  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  await client.send(command);
}

