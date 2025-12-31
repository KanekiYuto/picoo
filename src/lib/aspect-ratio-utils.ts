/**
 * 纵横比工具函数
 * 用于将纵横比字符串转换为具体的像素尺寸
 */

export interface Dimensions {
  width: number;
  height: number;
}

/**
 * 预定义的纵横比尺寸映射（基于 1024 基准）
 */
export const ASPECT_RATIO_DIMENSIONS: Record<string, Dimensions> = {
  "1:1": { width: 1024, height: 1024 },
  "16:9": { width: 1820, height: 1024 },
  "9:16": { width: 576, height: 1024 },
  "4:3": { width: 1365, height: 1024 },
  "3:4": { width: 768, height: 1024 },
  "3:2": { width: 1536, height: 1024 },
  "2:3": { width: 683, height: 1024 },
  "5:4": { width: 1280, height: 1024 },
  "4:5": { width: 819, height: 1024 },
  "21:9": { width: 2389, height: 1024 },
  "9:21": { width: 439, height: 1024 },
};

/**
 * 解析纵横比字符串，返回宽高比例
 * @param aspectRatio - 纵横比字符串，如 "16:9", "1:1"
 * @returns { width: number, height: number } 比例值
 */
function parseAspectRatio(aspectRatio: string): { width: number; height: number } {
  const parts = aspectRatio.split(':');
  if (parts.length !== 2) {
    throw new Error(`Invalid aspect ratio format: ${aspectRatio}`);
  }

  const width = parseInt(parts[0], 10);
  const height = parseInt(parts[1], 10);

  if (isNaN(width) || isNaN(height)) {
    throw new Error(`Invalid aspect ratio format: ${aspectRatio}`);
  }

  return { width, height };
}

/**
 * 计算给定纵横比的实际尺寸（基于 1024 基准）
 * @param aspectRatio - 纵横比字符串，如 "16:9", "1:1"
 * @returns { width: number, height: number } 实际像素尺寸
 */
export function calculateDimensions(aspectRatio: string): Dimensions {
  const ratio = parseAspectRatio(aspectRatio);
  const baseSize = 1024;

  // 确定短边和长边
  const isPortrait = ratio.height > ratio.width;

  let width: number;
  let height: number;

  if (ratio.width === ratio.height) {
    // 正方形
    width = baseSize;
    height = baseSize;
  } else if (isPortrait) {
    // 竖向：宽度是短边
    width = baseSize;
    height = Math.round((baseSize * ratio.height) / ratio.width);
  } else {
    // 横向：高度是短边
    height = baseSize;
    width = Math.round((baseSize * ratio.width) / ratio.height);
  }

  return { width, height };
}

/**
 * 获取纵横比的尺寸，优先使用预定义映射，否则动态计算
 * @param aspectRatio - 纵横比字符串，如 "16:9", "1:1"
 * @returns { width: number, height: number }
 */
export function getDimensions(aspectRatio: string): Dimensions {
  // 如果在预定义映射中，直接返回
  if (ASPECT_RATIO_DIMENSIONS[aspectRatio]) {
    return ASPECT_RATIO_DIMENSIONS[aspectRatio];
  }

  // 否则动态计算
  return calculateDimensions(aspectRatio);
}

/**
 * 将纵横比转换为 "宽*高" 格式的字符串
 * @param aspectRatio - 纵横比字符串，如 "16:9", "1:1"
 * @returns 格式化的尺寸字符串，如 "1820*1024"
 */
export function aspectRatioToString(aspectRatio: string): string {
  const { width, height } = getDimensions(aspectRatio);
  return `${width}*${height}`;
}

/**
 * 将纵横比转换为 "宽x高" 格式的字符串
 * @param aspectRatio - 纵横比字符串，如 "16:9", "1:1"
 * @returns 格式化的尺寸字符串，如 "1820x1024"
 */
export function aspectRatioToSize(aspectRatio: string): string {
  const { width, height } = getDimensions(aspectRatio);
  return `${width}x${height}`;
}
