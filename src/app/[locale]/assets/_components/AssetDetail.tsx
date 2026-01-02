"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useModalStore } from "@/store/useModalStore";
import { useImageDownload } from "@/hooks/useImageDownload";
import { formatFileSize, formatDate } from "./utils";
import type { AssetInfo } from "./types";

interface AssetDetailProps {
  asset: AssetInfo | null;
  onClose: () => void;
}

export function AssetDetail({ asset, onClose }: AssetDetailProps) {
  const t = useTranslations("assets");
  const { openMediaPreview } = useModalStore();
  const { downloadImage } = useImageDownload();

  const handleDownload = async () => {
    if (!asset) return;
    await downloadImage(asset.url);
  };

  if (!asset) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-xl bg-background shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-muted/30 transition-colors hover:bg-muted/20 cursor-pointer"
        >
          <X className="h-5 w-5 text-foreground" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* 左侧：素材预览 */}
          <div className="flex items-center justify-center bg-muted/30 p-8">
            {asset.type === "image" ? (
              <img
                src={asset.url}
                alt={asset.originalFilename}
                className="max-h-[60vh] rounded-lg object-contain"
              />
            ) : (
              <video
                src={asset.url}
                controls
                className="max-h-[60vh] rounded-lg"
              />
            )}
          </div>

          {/* 右侧：详细信息 */}
          <div className="flex flex-col gap-6 p-6">
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {asset.originalFilename}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {asset.description || t("detail.noDescription")}
              </p>
            </div>

            {/* 详细信息列表 */}
            <div className="space-y-0 divide-y divide-border">
              <div className="flex justify-between py-3 first:pt-0 last:pb-0">
                <span className="text-sm text-muted-foreground">{t("detail.type")}</span>
                <span className="text-sm font-medium text-foreground">
                  {asset.type === "image" ? t("types.image") : t("types.video")}
                </span>
              </div>

              <div className="flex justify-between py-3 first:pt-0 last:pb-0">
                <span className="text-sm text-muted-foreground">{t("detail.size")}</span>
                <span className="text-sm font-medium text-foreground">
                  {formatFileSize(asset.size)}
                </span>
              </div>

              <div className="flex justify-between py-3 first:pt-0 last:pb-0">
                <span className="text-sm text-muted-foreground">{t("detail.mimeType")}</span>
                <span className="text-sm font-medium text-foreground">
                  {asset.mimeType}
                </span>
              </div>

              <div className="flex justify-between py-3 first:pt-0 last:pb-0">
                <span className="text-sm text-muted-foreground">{t("detail.uploadDate")}</span>
                <span className="text-sm font-medium text-foreground">
                  {formatDate(asset.createdAt)}
                </span>
              </div>

              {/* 标签 */}
              {asset.tags && asset.tags.length > 0 && (
                <div className="space-y-3 py-3 first:pt-0 last:pb-0">
                  <span className="text-sm text-muted-foreground">{t("detail.tags")}</span>
                  <div className="flex flex-wrap gap-2">
                    {asset.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 操作按钮 */}
            <div className="mt-auto flex gap-3 pt-4">
              <button
                onClick={() => openMediaPreview([
                  {
                    id: asset.id,
                    url: asset.url,
                    type: asset.type,
                  }
                ])}
                className="flex-1 rounded-lg border border-border bg-muted/10 px-4 py-2.5 text-center text-sm font-medium text-foreground transition-colors hover:bg-muted/20 cursor-pointer"
              >
                {t("detail.viewOriginal")}
              </button>
              <button
                onClick={handleDownload}
                className="flex-1 rounded-lg border border-border bg-muted/10 px-4 py-2.5 text-center text-sm font-medium text-foreground transition-colors hover:bg-muted/20 cursor-pointer"
              >
                {t("detail.download")}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
