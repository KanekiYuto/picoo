/**
 * 图片工具函数
 */

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
 */
export async function downloadImage(imageUrl: string): Promise<void> {
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
  } catch (error) {
    console.error("Failed to download image:", error);
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
