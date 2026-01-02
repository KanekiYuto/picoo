"use client";

import { useTranslations } from "next-intl";
import {
  downloadImage as downloadImageUtil,
  downloadImages as downloadImagesUtil,
} from "@/lib/image-utils";

export function useImageDownload() {
  const t = useTranslations();

  const downloadImage = async (imageUrl: string): Promise<void> => {
    return downloadImageUtil(imageUrl, {
      success: t("common.download.success") || "Downloaded successfully",
      error: t("common.download.error") || "Failed to download image",
    });
  };

  const downloadImages = async (urls: string[]): Promise<void> => {
    return downloadImagesUtil(urls, {
      downloadedFiles: (count) =>
        t("common.download.filesSuccess", { count }) ||
        `Downloaded ${count} file${count > 1 ? "s" : ""}`,
      failedFiles: (count) =>
        t("common.download.filesError", { count }) ||
        `Failed to download ${count} file${count > 1 ? "s" : ""}`,
    });
  };

  return { downloadImage, downloadImages };
}
