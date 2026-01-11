"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface ImageUploadPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onImageSelect: (file: File) => void;
}

export function ImageUploadPanel({ isOpen, onClose, onImageSelect }: ImageUploadPanelProps) {
  const t = useTranslations("generator.uploadPanel");
  const [activeTab, setActiveTab] = useState<"uploads" | "personalized">("uploads");
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelect(file);
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
      onImageSelect(file);
      onClose();
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* 头部 */}
      <div className="flex items-center justify-between border-b border-border px-4 md:px-6 py-3 md:py-4 flex-shrink-0">
        <h2 className="text-base md:text-lg font-semibold text-foreground">
          {t("title")}
        </h2>
        <motion.button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-sidebar-hover hover:text-foreground"
          aria-label="关闭"
        >
          <X className="h-4 w-4 md:h-5 md:w-5" />
        </motion.button>
      </div>

      {/* 上传区域 */}
      <div className="p-4 md:p-6 flex-shrink-0">
        <input
          type="file"
          id="file-upload-panel"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <label
          htmlFor="file-upload-panel"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "flex flex-col items-center justify-center",
            "w-full h-32 md:h-48 rounded-xl cursor-pointer",
            "border-2 border-dashed transition-all duration-300",
            isDragging
              ? "border-primary bg-primary/10"
              : "border-border bg-sidebar-hover hover:bg-sidebar-active hover:border-primary/50"
          )}
        >
          <Upload className="h-8 w-8 md:h-12 md:w-12 text-muted mb-2 md:mb-4" />
          <p className="text-sm md:text-base text-foreground mb-1">
            {t("clickToUpload")} / {t("dragAndDrop")}
          </p>
          <p className="text-xs md:text-sm text-muted">
            {t("fileTypes")}
          </p>
        </label>
      </div>

      {/* 标签页 */}
      <div className="border-t border-border px-4 md:px-6 py-3 md:py-4 overflow-y-auto flex-1 min-h-0 custom-scrollbar">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
          <div className="flex gap-2 md:gap-4 w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setActiveTab("uploads")}
              className={cn(
                "px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors whitespace-nowrap",
                activeTab === "uploads"
                  ? "bg-sidebar-active text-white"
                  : "text-muted hover:text-foreground hover:bg-sidebar-hover"
              )}
            >
              {t("uploads")}
            </button>
            <button
              onClick={() => setActiveTab("personalized")}
              className={cn(
                "px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors whitespace-nowrap",
                activeTab === "personalized"
                  ? "bg-sidebar-active text-white"
                  : "text-muted hover:text-foreground hover:bg-sidebar-hover"
              )}
            >
              {t("personalized")}
            </button>
          </div>
          <button className="px-3 md:px-4 py-1.5 md:py-2 rounded-lg bg-gradient-to-br from-primary to-primary-hover text-white text-xs md:text-sm font-medium whitespace-nowrap w-full sm:w-auto">
            {t("personalize")}
          </button>
        </div>

        {/* 内容区域 */}
        <div>
          <h3 className="text-xs md:text-sm font-medium text-foreground mb-3">
            {t("recentUploads")}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {/* 占位符 - 实际使用时从数据加载 */}
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="aspect-square rounded-lg bg-sidebar-hover border border-border"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
