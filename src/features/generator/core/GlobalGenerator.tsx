"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { getRequiredCredits } from "@/config/model-credit-cost";
import { ModelDisplay } from "../panels/settings/ModelDisplay";
import type { GeneratorSettings } from "../panels/settings";
import { ImageUploadButton } from "../buttons/ImageUploadButton";
import { ModeSelectorButton } from "../buttons";
import { MODE_CONFIGS, type GeneratorMode } from "../config";
import type { ModelOption } from "../panels/settings/types";

interface GlobalGeneratorProps {
  className?: string;
  onGenerate?: (prompt: string, mode: string, settings: GeneratorSettings, images: string[]) => void;
  onOpenUploadPanel?: () => void;
  onOpenSettingsPanel?: () => void;
  onOpenModePanel?: () => void;
  onOpenMobileImagePanel?: () => void;
  previewUrl?: string;
  uploadImages?: string[];
  onRemoveImage?: (index: number) => void;
  onImageClick?: (imageUrl: string, index: number) => void;
  settings: GeneratorSettings;
  onSettingsChange?: (settings: GeneratorSettings) => void;
  mode?: GeneratorMode;
  initialPrompt?: string;
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
  onImageClick,
  settings,
  mode = "text-to-image",
  initialPrompt = ""
}: GlobalGeneratorProps) {
  const t = useTranslations("generator");
  const [prompt, setPrompt] = useState(initialPrompt);

  // 从 MODE_CONFIGS 获取当前模型信息
  const currentModel = useMemo<ModelOption | undefined>(() => {
    const modeConfig = MODE_CONFIGS[mode];
    if (!modeConfig?.models || !settings.model) {
      return undefined;
    }

    const modelInfo = modeConfig.models[settings.model];
    if (!modelInfo) {
      return undefined;
    }

    return {
      id: settings.model,
      name: modelInfo.name,
      icon: modelInfo.icon,
      features: modelInfo.features,
      descriptionKey: modelInfo.descriptionKey,
      renderFormFields: modelInfo.renderFormFields,
    };
  }, [mode, settings.model]);

  // ModelDisplay 配置
  const modelDisplayConfigs = [
    {
      key: 'mobile',
      props: {
        compact: true,
        iconOnly: true,
        className: 'md:hidden',
      },
    },
    {
      key: 'desktop',
      props: {
        compact: true,
        className: 'hidden md:flex',
      },
    },
  ] as const;

  const MAX_MODEL_DISPLAYS = modelDisplayConfigs.length;

  // 判断当前模式是否需要提示词
  const requiresPrompt = () => {
    return mode === "text-to-image" || mode === "edit-image";
  };

  // 计算所需积分
  const requiredCredits = useMemo<number | null>(() => {
    if (!settings.model) return null;

    const modeConfig = MODE_CONFIGS[mode];
    const modelInfo = modeConfig?.models?.[settings.model];

    if (!modelInfo?.getCreditsParams) return null;

    const parameters = modelInfo.getCreditsParams(settings);

    return getRequiredCredits(mode, settings.model, parameters);
  }, [mode, settings]);

  // 处理生成
  const handleCreate = () => {
    if (requiresPrompt()) {
      if (prompt.trim()) {
        onGenerate?.(prompt, mode, settings, uploadImages);
      }
    } else {
      onGenerate?.(prompt, mode, settings, uploadImages);
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
            onClick={onOpenUploadPanel}
            onRemoveImage={onRemoveImage}
            onImageClick={onImageClick}
            mode={mode}
          />
          {/* 模式切换按钮 */}
          <ModeSelectorButton value={mode} onClick={onOpenModePanel || (() => {})} />
        </div>

        {/* 移动端和桌面端共用的输入区域 - 右侧 */}
        <div className="flex-1 flex flex-col min-w-0 gap-2 justify-between">
          {/* 文本输入框容器 */}
          <div className="relative py-2 md:py-3 px-2 md:px-3">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={requiresPrompt() ? t("placeholder") : t("noImageRequired")}
              disabled={!requiresPrompt()}
              className={cn(
                "max-h-40 min-h-10 w-full resize-none !border-0 bg-transparent text-sm md:text-base text-foreground placeholder:text-muted-foreground focus:outline-none !ring-0 custom-scrollbar overflow-hidden",
                !requiresPrompt() && "cursor-not-allowed opacity-50"
              )}
              style={{ fieldSizing: 'content' } as React.CSSProperties}
            />
          </div>

          {/* 底部控制栏 */}
          <div className="flex items-end justify-between gap-2">
            {/* 左侧：模式选择、图片上传和模型信息 */}
            <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
              {/* 移动端模式切换按钮 - 始终显示 */}
              <ModeSelectorButton
                className="md:hidden flex-shrink-0"
                value={mode}
                onClick={onOpenModePanel || (() => {})}
                iconOnly={true}
              />

              {/* 移动端图片上传按钮 - 非 text-to-image 模式显示 */}
              {mode !== "text-to-image" && (
                <ImageUploadButton
                  className="md:hidden flex-shrink-0"
                  size="sm"
                  uploadImages={uploadImages}
                  onClick={onOpenUploadPanel}
                  onOpenMobileImagePanel={onOpenMobileImagePanel}
                  onRemoveImage={onRemoveImage}
                  onImageClick={onImageClick}
                  mode={mode}
                />
              )}

              {/* 模型信息按钮 */}
              {settings && mode && modelDisplayConfigs.slice(0, MAX_MODEL_DISPLAYS).map((config) => (
                <ModelDisplay
                  key={config.key}
                  model={currentModel}
                  settings={settings}
                  onClick={onOpenSettingsPanel}
                  mode={mode}
                  {...config.props}
                />
              ))}
            </div>

            {/* 右侧：创建按钮 */}
            <motion.button
              onClick={handleCreate}
              disabled={requiresPrompt() && !prompt.trim()}
              className={cn(
                "px-4 md:px-8 py-2.5 md:py-3 rounded-xl flex-shrink-0",
                "bg-gradient-primary",
                "text-sm md:text-base text-white font-medium whitespace-nowrap",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "transition-all duration-300",
                "hover:shadow-lg hover:shadow-primary/20 cursor-pointer"
              )}
            >
              {t("common.createWithCredits", { credits: requiredCredits ?? 0 })}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
