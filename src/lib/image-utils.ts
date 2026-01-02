/**
 * 图片工具函数
 */

import { toast } from "sonner";

interface DownloadMessages {
  success?: string;
  error?: string;
}

interface DownloadImagesMessages extends DownloadMessages {
  downloadedFiles?: (count: number) => string;
  failedFiles?: (count: number) => string;
}

/**
 * 从 URL 中提取文件名
 */
function getFilenameFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const filename = pathname.split("/").pop();
    return filename || "image.png";
  } catch {
    return "image.png";
  }
}

/**
 * 下载图片
 * @param imageUrl 图片 URL
 * @param messages 国际化文本
 * @param silent 是否显示提示
 */
export async function downloadImage(
  imageUrl: string,
  messages?: DownloadMessages,
  silent?: boolean
): Promise<void> {
  const defaultMessages = {
    success: "Downloaded successfully",
    error: "Failed to download image",
  };

  const msgs = { ...defaultMessages, ...messages };

  try {
    const response = await fetch(imageUrl, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = getFilenameFromUrl(imageUrl);
    link.setAttribute("data-download-link", "true");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
    if (!silent) {
      toast.success(msgs.success);
    }
  } catch (error) {
    console.error("Failed to download image:", error);
    if (!silent) {
      toast.error(msgs.error);
    }
    throw error;
  }
}

/**
 * 加载图片为 Blob
 * @param imageUrl 图片 URL
 */
export async function loadImageAsBlob(imageUrl: string): Promise<Blob> {
  const response = await fetch(imageUrl, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }

  return response.blob();
}

/**
 * 下载多个图片
 * @param urls 图片 URL 数组
 * @param messages 国际化文本
 */
export async function downloadImages(
  urls: string[],
  messages?: DownloadImagesMessages
): Promise<void> {
  if (urls.length === 0) return;

  const defaultMessages = {
    downloadedFiles: (count: number) =>
      `Downloaded ${count} file${count > 1 ? "s" : ""}`,
    failedFiles: (count: number) =>
      `Failed to download ${count} file${count > 1 ? "s" : ""}`,
  };

  const msgs = { ...defaultMessages, ...messages };

  let successCount = 0;
  let failCount = 0;

  for (const url of urls) {
    try {
      // 批量下载时不显示单个文件的提示
      await downloadImage(url, undefined, true);
      successCount++;
      // 延迟 300ms 避免浏览器频繁处理
      await new Promise((resolve) => setTimeout(resolve, 300));
    } catch (error) {
      failCount++;
    }
  }

  if (successCount > 0) {
    toast.success(msgs.downloadedFiles(successCount));
  }
  if (failCount > 0) {
    toast.error(msgs.failedFiles(failCount));
  }
}
