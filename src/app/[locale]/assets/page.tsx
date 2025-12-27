"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Image, Video, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { AssetsSkeleton } from "./AssetsSkeleton";
import { AssetsContentSkeleton } from "./AssetsContentSkeleton";

// 素材信息类型
interface AssetInfo {
  id: string;
  filename: string;
  originalFilename: string;
  url: string;
  type: "image" | "video";
  mimeType: string;
  size: number;
  tags: string[] | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function AssetsPage() {
  const t = useTranslations("assets");
  const [assets, setAssets] = useState<AssetInfo[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isContentLoading, setIsContentLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "image" | "video">("all");
  const [selectedAsset, setSelectedAsset] = useState<AssetInfo | null>(null);

  // 获取素材列表
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        // 首次加载使用 isInitialLoading，后续切换使用 isContentLoading
        if (isInitialLoading) {
          setIsInitialLoading(true);
        } else {
          setIsContentLoading(true);
        }

        // 设置最小显示时间为 300ms，避免闪烁
        const minLoadingTime = new Promise((resolve) => setTimeout(resolve, 300));

        const params = new URLSearchParams();
        if (filter !== "all") {
          params.append("type", filter);
        }
        params.append("limit", "50");

        const fetchPromise = fetch(`/api/asset/upload?${params.toString()}`)
          .then((response) => {
            if (!response.ok) {
              throw new Error("Failed to fetch assets");
            }
            return response.json();
          })
          .then((data) => {
            setAssets(data.data?.assets || []);
          });

        // 等待数据加载和最小显示时间都完成
        await Promise.all([fetchPromise, minLoadingTime]);
      } catch (error) {
        console.error("Failed to fetch assets:", error);
        setAssets([]);
        // 即使出错也要等待最小显示时间
        await new Promise((resolve) => setTimeout(resolve, 300));
      } finally {
        setIsInitialLoading(false);
        setIsContentLoading(false);
      }
    };

    fetchAssets();
  }, [filter]);

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  // 格式化日期
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // 筛选后的素材
  const filteredAssets = assets;

  // 首次加载显示完整骨架屏
  if (isInitialLoading) {
    return <AssetsSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        {/* 标题和筛选器 */}
        <div className="mb-6 flex items-center justify-between">
          {/* 左侧标题 */}
          <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>

          {/* 右侧筛选标签 */}
          <div className="relative flex gap-1 rounded-lg border border-border bg-sidebar-bg p-1">
            {/* 全部 */}
            <motion.button
              onClick={() => setFilter("all")}
              className={`relative rounded px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                filter === "all" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {filter === "all" && (
                <motion.div
                  layoutId="filter-tab"
                  className="absolute inset-0 rounded bg-foreground"
                  transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
                />
              )}
              <span className={`relative z-10 ${filter === "all" ? "text-background" : ""}`}>
                {t("filters.all")}
              </span>
            </motion.button>

            {/* 图片 */}
            <motion.button
              onClick={() => setFilter("image")}
              className={`relative rounded px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                filter === "image" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {filter === "image" && (
                <motion.div
                  layoutId="filter-tab"
                  className="absolute inset-0 rounded bg-foreground"
                  transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
                />
              )}
              <span className={`relative z-10 flex items-center gap-1.5 ${filter === "image" ? "text-background" : ""}`}>
                <Image className="h-3.5 w-3.5" />
                {t("filters.image")}
              </span>
            </motion.button>

            {/* 视频 */}
            <motion.button
              onClick={() => setFilter("video")}
              className={`relative rounded px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                filter === "video" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {filter === "video" && (
                <motion.div
                  layoutId="filter-tab"
                  className="absolute inset-0 rounded bg-foreground"
                  transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
                />
              )}
              <span className={`relative z-10 flex items-center gap-1.5 ${filter === "video" ? "text-background" : ""}`}>
                <Video className="h-3.5 w-3.5" />
                {t("filters.video")}
              </span>
            </motion.button>
          </div>
        </div>

        {/* 素材网格 */}
        {isContentLoading ? (
          <AssetsContentSkeleton />
        ) : filteredAssets.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-sidebar-bg py-16">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-sidebar-bg">
              {filter === "image" ? (
                <Image className="h-10 w-10 text-muted-foreground" />
              ) : filter === "video" ? (
                <Video className="h-10 w-10 text-muted-foreground" />
              ) : (
                <Image className="h-10 w-10 text-muted-foreground" />
              )}
            </div>
            <h3 className="text-lg font-medium text-foreground">{t("empty.title")}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t("empty.description")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {filteredAssets.map((asset) => (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg border border-border bg-muted transition-all hover:border-foreground/20 hover:shadow-md"
                onClick={() => setSelectedAsset(asset)}
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
            ))}
          </div>
        )}
      </div>

      {/* 素材详情弹窗 */}
      {selectedAsset && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedAsset(null)}
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
              onClick={() => setSelectedAsset(null)}
              className="absolute right-4 top-4 z-10 cursor-pointer rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* 左侧：素材预览 */}
              <div className="flex items-center justify-center bg-muted p-8">
                {selectedAsset.type === "image" ? (
                  <img
                    src={selectedAsset.url}
                    alt={selectedAsset.originalFilename}
                    className="max-h-[60vh] rounded-lg object-contain"
                  />
                ) : (
                  <video
                    src={selectedAsset.url}
                    controls
                    className="max-h-[60vh] rounded-lg"
                  />
                )}
              </div>

              {/* 右侧：详细信息 */}
              <div className="flex flex-col gap-6 p-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    {selectedAsset.originalFilename}
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {selectedAsset.description || t("detail.noDescription")}
                  </p>
                </div>

                {/* 详细信息列表 */}
                <div className="space-y-3">
                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="text-sm text-muted-foreground">{t("detail.type")}</span>
                    <span className="text-sm font-medium text-foreground">
                      {selectedAsset.type === "image" ? t("types.image") : t("types.video")}
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="text-sm text-muted-foreground">{t("detail.size")}</span>
                    <span className="text-sm font-medium text-foreground">
                      {formatFileSize(selectedAsset.size)}
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="text-sm text-muted-foreground">{t("detail.mimeType")}</span>
                    <span className="text-sm font-medium text-foreground">
                      {selectedAsset.mimeType}
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="text-sm text-muted-foreground">{t("detail.uploadDate")}</span>
                    <span className="text-sm font-medium text-foreground">
                      {formatDate(selectedAsset.createdAt)}
                    </span>
                  </div>

                  {/* 标签 */}
                  {selectedAsset.tags && selectedAsset.tags.length > 0 && (
                    <div className="space-y-2 border-b border-border pb-2">
                      <span className="text-sm text-muted-foreground">{t("detail.tags")}</span>
                      <div className="flex flex-wrap gap-2">
                        {selectedAsset.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 操作按钮 */}
                <div className="mt-auto flex gap-3">
                  <a
                    href={selectedAsset.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 rounded-lg bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {t("detail.viewOriginal")}
                  </a>
                  <a
                    href={selectedAsset.url}
                    download={selectedAsset.originalFilename}
                    className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-center text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    {t("detail.download")}
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
