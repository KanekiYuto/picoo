"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useModalStore } from "@/store/useModalStore";

interface UploadPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onImageSelect: (file: File) => void;
  onImageReplace?: (file: File, index: number) => void;
  initialImageUrl?: string;
  replaceIndex?: number;
}

export function UploadPanel({ isOpen, onClose, onImageSelect, onImageReplace, initialImageUrl, replaceIndex }: UploadPanelProps) {
  const t = useTranslations("generator.uploadPanel");
  const [isDragging, setIsDragging] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(initialImageUrl || null);

  // 当 initialImageUrl 变化时更新 selectedImage
  useEffect(() => {
    if (initialImageUrl) {
      setSelectedImage(initialImageUrl);
    }
  }, [initialImageUrl]);

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

  return (
    <div className="h-full flex flex-col bg-background-generator border border-background-2 rounded-xl">
      {/* 头部 */}
      <div className="flex items-center justify-between px-4 md:px-6 pt-3 md:pt-4 pb-0 flex-shrink-0">
        <h2 className="text-base md:text-lg font-semibold text-foreground">
          {t("title")}
        </h2>
        <motion.button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background-2/40 hover:text-foreground cursor-pointer"
          aria-label={t("close")}
          title={t("close")}
        >
          <X className="h-4 w-4 md:h-5 md:w-5" />
        </motion.button>
      </div>

      {/* 内容区域 */}
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
            <div className="relative w-full rounded-2xl overflow-hidden bg-background-1 border-2 border-dashed border-background-2 backdrop-blur-sm">
              <div className="flex items-center justify-center p-8 min-h-[300px]">
                <img
                  src={selectedImage}
                  alt="Selected"
                  onClick={() => useModalStore.getState().openMediaPreview([{ id: 'upload-preview', type: 'image' as const, url: selectedImage }], 0)}
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
                  : "border-background-2 hover:border-primary/50"
              )}
            >
              {/* 上传图标圆形背景 */}
              <div className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-background-1 border border-background-2">
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
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-background-2/40 border border-background-2 text-muted-foreground hover:border-primary/50 transition-colors"
                  >
                    {format}
                  </span>
                ))}
              </div>
            </label>
          )}
        </div>

      </div>
    </div>
  );
}
