/**
 * 文件上传验证工具
 * 负责文件类型、大小等验证
 */

export const FILE_LIMITS = {
  image: {
    mimeTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"],
    maxSize: 10 * 1024 * 1024, // 10MB
    extensions: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
  },
} as const;

export type FileType = keyof typeof FILE_LIMITS;

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  fileType?: FileType;
}

export interface FileInfo {
  name: string;
  size: number;
  type: string;
}

function getFileType(mimeType: string): FileType | null {
  for (const [type, config] of Object.entries(FILE_LIMITS)) {
    if ((config.mimeTypes as readonly string[]).includes(mimeType)) {
      return type as FileType;
    }
  }
  return null;
}

function getFileTypeByExtension(fileName: string): FileType | null {
  const ext = fileName.toLowerCase().substring(fileName.lastIndexOf("."));

  for (const [type, config] of Object.entries(FILE_LIMITS)) {
    if ((config.extensions as readonly string[]).includes(ext)) {
      return type as FileType;
    }
  }
  return null;
}

export function validateFile(fileInfo: FileInfo): FileValidationResult {
  const { name, size, type: mimeType } = fileInfo;

  if (!name || name.trim().length === 0) {
    return {
      valid: false,
      error: "File name cannot be empty",
    };
  }

  if (size === 0) {
    return {
      valid: false,
      error: "File cannot be empty",
    };
  }

  let fileType = getFileType(mimeType);
  if (!fileType) fileType = getFileTypeByExtension(name);

  if (!fileType) {
    return {
      valid: false,
      error: `Unsupported file type: ${mimeType}`,
    };
  }

  const limit = FILE_LIMITS[fileType];
  if (size > limit.maxSize) {
    const maxSizeMB = (limit.maxSize / 1024 / 1024).toFixed(1);
    const fileSizeMB = (size / 1024 / 1024).toFixed(2);
    return {
      valid: false,
      error: `File too large. Maximum size for ${fileType} is ${maxSizeMB}MB, current size: ${fileSizeMB}MB`,
    };
  }

  return {
    valid: true,
    fileType,
  };
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${units[i]}`;
}

