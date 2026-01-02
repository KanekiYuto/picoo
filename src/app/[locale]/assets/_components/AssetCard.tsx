"use client";

import { motion } from "framer-motion";
import { Image, Video } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatFileSize } from "./utils";
import type { AssetInfo } from "./types";

interface AssetCardProps {
  asset: AssetInfo;
  onClick: () => void;
}

export function AssetCard({ asset, onClick }: AssetCardProps) {
  const t = useTranslations("assets");

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg border border-border bg-muted transition-all hover:border-foreground/20 hover:shadow-md"
      onClick={onClick}
    >
      {/* 素材预览 */}
      {asset.type === "image" ? (
        <img
          src={asset.url}
          alt={asset.originalFilename}
          className="h-full w-full object-cover"
        />
      ) : (
        <video src={asset.url} className="h-full w-full object-cover" />
      )}

      {/* 悬停遮罩 */}
      <div className="absolute inset-0 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
        <div className="flex h-full flex-col justify-between p-3">
          {/* 文件类型标签 */}
          <div className="flex items-center gap-1">
            {asset.type === "image" ? (
              <div className="flex items-center gap-1 rounded-full bg-blue-500/90 px-2 py-1 text-xs font-medium text-white">
                <Image className="h-3 w-3" />
                {t("types.image")}
              </div>
            ) : (
              <div className="flex items-center gap-1 rounded-full bg-purple-500/90 px-2 py-1 text-xs font-medium text-white">
                <Video className="h-3 w-3" />
                {t("types.video")}
              </div>
            )}
          </div>

          {/* 文件信息 */}
          <div>
            <p className="truncate text-xs font-medium text-white">
              {asset.originalFilename}
            </p>
            <p className="mt-1 text-xs text-white/70">{formatFileSize(asset.size)}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
