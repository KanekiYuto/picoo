"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { ModelDisplay } from "../panels/settings/ModelDisplay";
import type { GeneratorSettings } from "../panels/settings";
import { MODELS, getModelById } from "../panels/settings";
import { ImageUploadButton } from "../buttons/ImageUploadButton";
import { ModeSelectorButton } from "../buttons";

interface GlobalGeneratorProps {
  className?: string;
  onGenerate?: (prompt: string, image?: File) => void;
  onOpenUploadPanel?: () => void;
  onOpenSettingsPanel?: () => void;
  onOpenModePanel?: () => void;
  onOpenMobileImagePanel?: () => void;
  previewUrl?: string;
  uploadImages?: string[];
  onRemoveImage?: (index: number) => void;
  settings?: GeneratorSettings;
  onSettingsChange?: (settings: GeneratorSettings) => void;
  mode?: "prompt" | "upscale" | "edit" | "remove-watermark" | "change-background" | "ai-face-swap";
}

export function GlobalGenerator({
  className,
  onGenerate,
  onOpenUploadPanel,
  onOpenSettingsPanel,
  onOpenModePanel,
  onOpenMobileImagePanel,
  uploadImages = [],
  onRemoveImage,
  settings,
  mode = "prompt"
}: GlobalGeneratorProps) {
  const t = useTranslations("generator");
  const [prompt, setPrompt] = useState("");

  // 根据模式获取最大上传数量
  const getMaxUploadCount = () => {
    switch (mode) {
      case "prompt":
        return 0; // 文本生成不需要上传图片
      case "upscale":
        return 1; // 放大支持上传一张
      case "edit":
        return 4; // 编辑最多四张
      case "remove-watermark":
        return 1; // 去水印一张
      case "change-background":
        return 2; // 换背景两张
      case "ai-face-swap":
        return 2; // 换脸两张
      default:
        return 0;
    }
  };

  const MAX_UPLOAD_COUNT = getMaxUploadCount();

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
        <div className="hidden justify-end md:flex flex-col gap-3">
          {mode === "prompt" ? (
            <div className="flex h-24 w-24 items-center justify-center rounded-xl border-2 border-dashed border-border/35 bg-sidebar-hover/15">
              <div className="flex flex-col items-center gap-1">
                <ImageOff className="h-6 w-6 text-muted/45" />
                <span className="text-[10px] font-medium text-muted/45">{t("noImageRequired")}</span>
              </div>
            </div>
          ) : (
            <ImageUploadButton
              size="lg"
              uploadImages={uploadImages}
              maxUploadCount={MAX_UPLOAD_COUNT}
              onClick={onOpenUploadPanel}
              onRemoveImage={onRemoveImage}
            />
          )}
          {/* 模式切换按钮 */}
          <ModeSelectorButton value={mode} onClick={onOpenModePanel || (() => {})} />
        </div>

        {/* 分割线 */}
        <div className="hidden md:block w-px bg-border self-stretch" />

        {/* 移动端和桌面端共用的输入区域 - 右侧 */}
        <div className="flex-1 flex flex-col min-w-0 gap-2 justify-between">
          {/* 文本输入框容器 */}
          <div className="relative py-2 md:py-3">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={t("placeholder")}
              className="max-h-40 min-h-10 w-full resize-none !border-0 bg-transparent text-sm md:text-base text-foreground placeholder:text-muted focus:outline-none !ring-0 custom-scrollbar overflow-hidden"
              style={{ fieldSizing: 'content' } as React.CSSProperties}
            />
          </div>

          {/* 底部控制栏 */}
          <div className="flex items-end justify-between gap-2">
            {/* 左侧：图片上传和模型信息 */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* 移动端图片上传按钮 */}
              <ImageUploadButton
                className="md:hidden"
                size="sm"
                uploadImages={uploadImages}
                maxUploadCount={MAX_UPLOAD_COUNT}
                onClick={uploadImages.length > 0 ? onOpenMobileImagePanel : onOpenUploadPanel}
                onRemoveImage={onRemoveImage}
              />

              {/* 模型信息按钮 */}
              {settings && (
                <ModelDisplay
                  model={getModelById(settings.model, MODELS)}
                  aspectRatio={settings.aspectRatio}
                  variations={settings.variations}
                  compact={true}
                  onClick={onOpenSettingsPanel}
                />
              )}
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
