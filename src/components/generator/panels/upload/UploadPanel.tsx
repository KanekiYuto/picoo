"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Upload, ImageOff, Plus, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useMediaPreviewStore } from "@/store/useMediaPreviewStore";

interface Asset {
  id: string;
  url: string;
  filename: string;
  originalFilename: string;
  createdAt: string;
}

interface UploadPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onImageSelect: (file: File) => void;
  onImageReplace?: (file: File, index: number) => void;
  onRecentAssetSelect?: (url: string) => void;
  onRecentAssetReplace?: (url: string, index: number) => void;
  initialImageUrl?: string;
  replaceIndex?: number;
}

export function UploadPanel({ isOpen, onClose, onImageSelect, onImageReplace, onRecentAssetSelect, onRecentAssetReplace, initialImageUrl, replaceIndex }: UploadPanelProps) {
  const t = useTranslations("generator.uploadPanel");
  const [isDragging, setIsDragging] = useState(false);
  const [recentAssets, setRecentAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(initialImageUrl || null);
  const MIN_LOADING_TIME = 600; // 最小显示时间（毫秒）

  // 当 initialImageUrl 变化时更新 selectedImage
  useEffect(() => {
    if (initialImageUrl) {
      setSelectedImage(initialImageUrl);
    }
  }, [initialImageUrl]);

  // 加载最近上传的素材
  useEffect(() => {
    if (isOpen) {
      fetchRecentAssets();
    }
  }, [isOpen]);

  const fetchRecentAssets = async () => {
    setIsLoading(true);
    const startTime = Date.now();
    try {
      const response = await fetch("/api/asset?type=image&limit=10&offset=0");
      const result = (await response.json()) as {
        success: boolean;
        data?: { assets: Asset[] };
        error?: string;
      };

      if (result.success && result.data) {
        setRecentAssets(result.data.assets);
      }
    } catch (error) {
      console.error("Failed to fetch recent assets:", error);
    } finally {
      // 确保至少显示最小时间
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsedTime);
      setTimeout(() => {
        setIsLoading(false);
      }, remainingTime);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (replaceIndex !== undefined && onImageReplace) {
        onImageReplace(file, replaceIndex);
      } else {
        onImageSelect(file);
      }
      onClose();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      if (replaceIndex !== undefined && onImageReplace) {
        onImageReplace(file, replaceIndex);
      } else {
        onImageSelect(file);
      }
      onClose();
    }
  };

  // 处理点击已上传的图片
  const handleRecentAssetClick = (asset: Asset) => {
    setSelectedImage(asset.url);
    if (replaceIndex !== undefined && onRecentAssetReplace) {
      onRecentAssetReplace(asset.url, replaceIndex);
    } else if (onRecentAssetSelect) {
      onRecentAssetSelect(asset.url);
    } else {
      // 降级方案：创建一个伪 File 对象
      const xhr = new XMLHttpRequest();
      xhr.responseType = "blob";
      xhr.onload = () => {
        const blob = xhr.response as Blob;
        const file = new File([blob], asset.originalFilename || asset.filename, {
          type: "image/jpeg",
        });
        if (replaceIndex !== undefined && onImageReplace) {
          onImageReplace(file, replaceIndex);
        } else {
          onImageSelect(file);
        }
      };
      xhr.open("GET", asset.url);
      xhr.send();
    }
    onClose();
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* 头部 */}
      <div className="flex items-center justify-between px-4 md:px-6 pt-3 md:pt-4 pb-0 flex-shrink-0">
        <h2 className="text-base md:text-lg font-semibold text-foreground">
          {t("title")}
        </h2>
        <motion.button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-sidebar-hover hover:text-foreground cursor-pointer"
          aria-label={t("close")}
          title={t("close")}
        >
          <X className="h-4 w-4 md:h-5 md:w-5" />
        </motion.button>
      </div>

      {/* 内容区域 - 上传和最近上传 */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
        {/* 上传区域 */}
        <div className="p-6 md:p-8">
          <input
            type="file"
            id="file-upload-panel"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          {selectedImage ? (
            /* 图片预览区域 */
            <div className="relative w-full rounded-2xl overflow-hidden bg-muted/10 border-2 border-dashed backdrop-blur-sm">
              <div className="flex items-center justify-center p-8 min-h-[300px]">
                <img
                  src={selectedImage}
                  alt="Selected"
                  onClick={() => useMediaPreviewStore.getState().open([{ id: 'upload-preview', type: 'image' as const, url: selectedImage }], 0)}
                  className="max-w-full max-h-[400px] object-contain rounded-lg cursor-pointer"
                />
              </div>
              {/* 删除按钮 */}
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-lg bg-black/60 hover:bg-black/80 text-white transition-colors backdrop-blur-sm cursor-pointer"
                aria-label={t("clearImage")}
                title={t("clearImage")}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ) : (
            /* 上传提示区域 */
            <label
              htmlFor="file-upload-panel"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "flex flex-col items-center justify-center gap-4",
                "w-full py-8 md:py-12 px-4 md:px-6 rounded-2xl cursor-pointer",
                "border-2 border-dashed transition-all duration-300",
                isDragging
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              )}
            >
              {/* 上传图标圆形背景 */}
              <div className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-sidebar-hover border border-border">
                <Upload className="h-8 w-8 md:h-10 md:w-10 text-foreground" />
              </div>

              {/* 主要文字 */}
              <p className="text-base md:text-lg font-semibold text-foreground text-center">
                {t("dragAndDrop")}
              </p>

              {/* 辅助说明 */}
              <p className="text-sm text-muted-foreground text-center max-w-xs">
                {t("clickToUpload")} • {t("fileTypes")}
              </p>

              {/* 文件格式标签 */}
              <div className="flex gap-2 flex-wrap justify-center mt-2">
                {["JPG", "PNG", "WebP", "GIF"].map((format) => (
                  <span
                    key={format}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-sidebar-hover border border-border text-muted-foreground hover:border-primary/50 transition-colors"
                  >
                    {format}
                  </span>
                ))}
              </div>
            </label>
          )}
        </div>

        {/* 最近上传 */}
        <div className="px-4 md:px-6 pb-4 md:pb-6">
          <h3 className="text-sm md:text-base font-semibold text-foreground mb-4">
            {t("recentUploads")}
          </h3>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <div
                  key={i}
                  className="aspect-square rounded-lg bg-sidebar-hover border border-border animate-pulse"
                />
              ))}
            </div>
          ) : recentAssets.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
              {recentAssets.map((asset) => {
                const isSelected = selectedImage === asset.url;
                return (
                  <motion.button
                    key={asset.id}
                    onClick={() => handleRecentAssetClick(asset)}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "aspect-square rounded-lg border transition-colors relative group cursor-pointer",
                      isSelected
                        ? "border-muted/10"
                        : "border-border"
                    )}
                  >
                    <div className="w-full h-full overflow-hidden rounded-lg">
                      <img
                        src={asset.url}
                        alt={asset.originalFilename}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className={cn(
                      "absolute inset-0 transition-colors",
                      isSelected ? "bg-black/60" : "bg-black/0 group-hover:bg-black/60"
                    )} />
                    {/* Hover 提示 */}
                    <div className={cn(
                      "absolute inset-0 flex items-center justify-center transition-opacity duration-200",
                      isSelected
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-100"
                    )}>
                      <div className="flex flex-col items-center gap-2">
                        {isSelected ? (
                          <Check className="w-6 h-6 text-white" />
                        ) : (
                          <Plus className="w-6 h-6 text-white" />
                        )}
                        <span className="text-xs text-white font-medium">
                          {isSelected ? t("selected") : t("clickToAdd")}
                        </span>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <div className="text-center w-full py-12 md:py-16 px-6 md:px-8 rounded-lg border border-border bg-sidebar-hover/30">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-lg bg-sidebar-hover border border-border">
                  <ImageOff className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">{t("noRecentUploads")}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
