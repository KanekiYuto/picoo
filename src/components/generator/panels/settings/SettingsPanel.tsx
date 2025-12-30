"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { Form } from "@/components/ui/form";
import { MODELS, MODE_CONFIGS, type GeneratorMode } from "../../config";
import { ModelGrid } from "./ModelGrid";
import type { AspectRatio, GeneratorSettings, ModelOption } from "./types";
import {
  normalizeSettings,
  areSettingsEqual,
  getDefaultAspectRatio,
  isAspectRatioSupported,
  getModelById,
} from "./utils";
import { FOCUS_RING_CLASSES } from "./constants";

export interface SettingsPanelProps {
  onClose: () => void;
  settings?: GeneratorSettings;
  onSettingsChange?: (settings: GeneratorSettings) => void;
  mode?: GeneratorMode;
}

export function SettingsPanel({ onClose, settings, onSettingsChange, mode = "text-to-image" }: SettingsPanelProps) {
  const t = useTranslations("generator.settingsPanel");

  // 从 MODE_CONFIGS 获取当前模式的模型配置
  const availableModels = useMemo<ModelOption[]>(() => {
    const modeConfig = MODE_CONFIGS[mode];
    if (!modeConfig?.models) {
      return [];
    }

    // 将 ModelInfo 转换为 ModelOption
    return Object.entries(modeConfig.models).map(([id, modelInfo]): ModelOption => ({
      id,
      name: modelInfo.name,
      icon: modelInfo.icon,
      features: modelInfo.features,
      descriptionKey: modelInfo.descriptionKey,
      aspectRatioOptions: modelInfo.aspectRatioOptions,
      renderFormFields: modelInfo.renderFormFields,
    }));
  }, [mode]);

  const defaultSettings = useMemo(() => normalizeSettings(undefined, availableModels), [availableModels]);
  const isExternallyControlled = settings !== undefined && onSettingsChange !== undefined;

  const [localSettings, setLocalSettings] = useState<GeneratorSettings>(() => normalizeSettings(settings, availableModels));

  useEffect(() => {
    if (!settings || isExternallyControlled) return;
    const next = normalizeSettings(settings, availableModels);
    setLocalSettings((prev) => (areSettingsEqual(prev, next) ? prev : next));
  }, [isExternallyControlled, settings, availableModels]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const currentSettings = useMemo(() => {
    if (!settings) return localSettings;
    return isExternallyControlled ? normalizeSettings(settings, availableModels) : localSettings;
  }, [isExternallyControlled, localSettings, settings, availableModels]);

  const selectedModelConfig = useMemo(() => getModelById(currentSettings.model, availableModels), [currentSettings.model, availableModels]);
  const aspectRatioOptions = selectedModelConfig?.aspectRatioOptions ?? [];

  const defaultAspectRatio = useMemo(() => getDefaultAspectRatio(aspectRatioOptions), [aspectRatioOptions]);
  const canReset = currentSettings.aspectRatio !== defaultAspectRatio;

  // 使用 react-hook-form
  const form = useForm<GeneratorSettings>({
    defaultValues: currentSettings,
    values: currentSettings,
  });

  useEffect(() => {
    const subscription = form.watch((values) => {
      const next = values as GeneratorSettings;
      if (areSettingsEqual(next, currentSettings)) return;

      if (isExternallyControlled) {
        onSettingsChange?.(next);
        return;
      }

      setLocalSettings(next);
      onSettingsChange?.(next);
    });

    return () => subscription.unsubscribe();
  }, [form, currentSettings, isExternallyControlled, onSettingsChange]);

  const handleReset = () => {
    form.setValue("aspectRatio", defaultAspectRatio);
  };

  const handleSelectModel = (modelId: string) => {
    const model = getModelById(modelId, availableModels);
    if (model?.locked) return;

    const options = model?.aspectRatioOptions ?? [];
    const nextAspectRatio = isAspectRatioSupported(options, currentSettings.aspectRatio)
      ? currentSettings.aspectRatio
      : getDefaultAspectRatio(options);

    form.setValue("model", model?.id ?? modelId);
    form.setValue("aspectRatio", nextAspectRatio);
  };

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-3 text-center sm:flex-nowrap sm:px-6 sm:pt-4 sm:text-left pb-0">
        <h2 className="text-base font-semibold text-foreground sm:text-lg">{t("title")}</h2>
        <motion.button
          type="button"
          onClick={onClose}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-sidebar-hover hover:text-foreground cursor-pointer",
            FOCUS_RING_CLASSES
          )}
          aria-label="关闭"
        >
          <X className="h-4 w-4 sm:h-5 sm:w-5" />
        </motion.button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto py-0 custom-scrollbar lg:overflow-hidden">
        <div className="grid h-full min-h-0 gap-6 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)]">
          <div className="px-4 pb-4 pt-4 lg:flex lg:min-h-0 lg:flex-col lg:overflow-y-auto lg:custom-scrollbar">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground">{t("selectModel")}</h3>
            </div>
            <div className="lg:flex-1 lg:min-h-0">
              <ModelGrid models={availableModels} selectedModel={currentSettings.model} onSelect={handleSelectModel} t={t} />
            </div>
          </div>

          <Form {...form}>
            <div className="flex flex-col gap-4 px-4 py-4 lg:min-h-0 lg:overflow-y-auto lg:custom-scrollbar lg:px-4">
              {selectedModelConfig?.renderFormFields?.({
                settings: currentSettings,
                onChange: (next) => {
                  Object.entries(next).forEach(([key, value]) => {
                    form.setValue(key as keyof GeneratorSettings, value);
                  });
                },
                aspectRatioOptions,
                canReset,
                onReset: handleReset,
              })}
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
