"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { ModelDisplay } from "./settings-panel/ModelDisplay";
import type { GeneratorSettings } from "./settings-panel/types";
import { MODELS } from "./settings-panel/models";
import { getModelById } from "./settings-panel/utils";
import { ImageUploadButton } from "./ImageUploadButton";
import { ModeSelectorButton, type GeneratorMode } from "./ModeSelector";

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
}

export function GlobalGenerator({
  className,
  onGenerate,
  onOpenUploadPanel,
  onOpenSettingsPanel,
  onOpenModePanel,
  onOpenMobileImagePanel,
  previewUrl = "",
  uploadImages = [],
  onRemoveImage,
  settings,
  onSettingsChange
}: GlobalGeneratorProps) {
  const t = useTranslations("generator");
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState<GeneratorMode>("prompt");
  const MAX_UPLOAD_COUNT = 4;

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
          <ImageUploadButton
            size="lg"
            uploadImages={uploadImages}
            maxUploadCount={MAX_UPLOAD_COUNT}
            onClick={onOpenUploadPanel}
            onRemoveImage={onRemoveImage}
          />
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
