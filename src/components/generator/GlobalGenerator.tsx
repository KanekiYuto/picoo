"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface GlobalGeneratorProps {
  className?: string;
  onGenerate?: (prompt: string, image?: File) => void;
  onOpenUploadPanel?: () => void;
  onOpenSettingsPanel?: () => void;
  previewUrl?: string;
}

export function GlobalGenerator({
  className,
  onGenerate,
  onOpenUploadPanel,
  onOpenSettingsPanel,
  previewUrl = ""
}: GlobalGeneratorProps) {
  const t = useTranslations("generator");
  const [prompt, setPrompt] = useState("");

  // 处理生成
  const handleCreate = () => {
    if (prompt.trim()) {
      onGenerate?.(prompt);
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="flex flex-col md:flex-row gap-3 md:gap-4">
        {/* 桌面端图片上传区域 - 左侧 */}
        <button
          onClick={onOpenUploadPanel}
          className={cn(
            "hidden md:flex flex-col items-center justify-center flex-shrink-0",
            "w-28 h-28 rounded-xl cursor-pointer",
            "border-2 border-dashed border-border",
            "bg-sidebar-hover hover:bg-sidebar-active",
            "transition-all duration-300",
            "overflow-hidden group"
          )}
        >
          {previewUrl ? (
            <div className="relative w-full h-full">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Plus className="h-6 w-6 text-white" />
              </div>
            </div>
          ) : (
            <>
              <Plus className="h-7 w-7 text-muted mb-1" />
              <span className="text-xs text-muted text-center px-1">{t("addImage")}</span>
            </>
          )}
        </button>

        {/* 移动端和桌面端共用的输入区域 - 右侧 */}
        <div className="flex-1 flex flex-col gap-3">
          {/* 文本输入框容器 */}
          <div className="relative rounded-xl bg-card px-3 py-2 md:px-4 md:py-3">
            <textarea
              rows={1}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={t("placeholder")}
              className="max-h-40 min-h-6 w-full resize-none md:resize-y !border-0 bg-transparent text-sm md:text-base text-foreground placeholder:text-muted focus:outline-none !ring-0 custom-scrollbar"
              style={{ fieldSizing: 'content' } as React.CSSProperties}
            />
          </div>

          {/* 底部控制栏 */}
          <div className="flex items-center justify-between gap-2 md:gap-3">
            {/* 左侧：图片上传和模型信息 */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* 移动端图片上传按钮 */}
              <button
                onClick={onOpenUploadPanel}
                className={cn(
                  "md:hidden flex items-center justify-center flex-shrink-0",
                  "w-10 h-10 rounded-lg cursor-pointer",
                  "border-2 border-dashed border-border",
                  "bg-sidebar-hover hover:bg-sidebar-active",
                  "transition-all duration-300"
                )}
              >
                <Plus className="h-5 w-5 text-muted" />
              </button>

              {/* 模型信息按钮 */}
              <motion.button
                onClick={onOpenSettingsPanel}
                className={cn(
                  "flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-2 rounded-lg",
                  "text-xs md:text-sm text-white whitespace-nowrap",
                  "hover:bg-sidebar-hover",
                  "transition-all duration-300 cursor-pointer"
                )}
              >
                <span className="font-medium">ImagineArt 1.5</span>
                <span>/</span>
                <span>1:1</span>
                <span>/</span>
                <span>4v</span>
              </motion.button>
            </div>

            {/* 右侧：创建按钮 */}
            <motion.button
              onClick={handleCreate}
              disabled={!prompt.trim()}
              className={cn(
                "px-4 md:px-8 py-2.5 md:py-3 rounded-xl",
                "bg-gradient-primary",
                "text-sm md:text-base text-white font-medium whitespace-nowrap",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "transition-all duration-300",
                "hover:shadow-lg hover:shadow-primary/20 "
              )}
            >
              {t("create")}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
