"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { Form } from "@/components/ui/form";
import { MODE_CONFIGS, type GeneratorMode } from "../../config";
import { ModelGrid } from "./ModelGrid";
import type { GeneratorSettings, ModelOption } from "./types";
import {
  normalizeSettings,
  areSettingsEqual,
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
    if (!modeConfig?.models) return [];

    return Object.entries(modeConfig.models).map(([id, modelInfo]): ModelOption => ({
      id,
      name: modelInfo.name,
      icon: modelInfo.icon,
      features: modelInfo.features,
      descriptionKey: modelInfo.descriptionKey,
      renderFormFields: modelInfo.renderFormFields,
    }));
  }, [mode]);

  const isExternallyControlled = settings !== undefined && onSettingsChange !== undefined;

  // 状态管理
  const [localSettings, setLocalSettings] = useState<GeneratorSettings>(() => normalizeSettings(settings, availableModels));

  const currentSettings = useMemo(() => {
    if (!settings) return localSettings;
    return isExternallyControlled ? normalizeSettings(settings, availableModels) : localSettings;
  }, [isExternallyControlled, localSettings, settings, availableModels]);

  const selectedModelConfig = useMemo(
    () => getModelById(currentSettings.model, availableModels),
    [currentSettings.model, availableModels]
  );

  // 表单初始化
  const form = useForm<GeneratorSettings>({
    defaultValues: currentSettings,
    values: currentSettings,
  });

  // 处理外部 settings 变化
  useEffect(() => {
    if (!settings || isExternallyControlled) return;
    const next = normalizeSettings(settings, availableModels);
    setLocalSettings((prev) => (areSettingsEqual(prev, next) ? prev : next));
  }, [isExternallyControlled, settings, availableModels]);

  // ESC 关闭
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  // 监听表单变化
  useEffect(() => {
    const subscription = form.watch((values) => {
      const next = values as GeneratorSettings;
      if (areSettingsEqual(next, currentSettings)) return;

      if (isExternallyControlled) {
        onSettingsChange?.(next);
      } else {
        setLocalSettings(next);
        onSettingsChange?.(next);
      }
    });

    return () => subscription.unsubscribe();
  }, [form, currentSettings, isExternallyControlled, onSettingsChange]);

  // 事件处理
  const handleSelectModel = (modelId: string) => {
    const model = getModelById(modelId, availableModels);
    if (model?.locked) return;

    // 从 MODE_CONFIGS 获取模型的默认设置
    const modeConfig = MODE_CONFIGS[mode];
    const modelInfo = modeConfig.models?.[modelId];
    const modelDefaults = modelInfo?.defaultSettings || {};

    // 更新 model 字段
    form.setValue("model", model?.id ?? modelId);

    // 应用模型的默认设置
    Object.entries(modelDefaults).forEach(([key, value]) => {
      form.setValue(key as string, value);
    });
  };

  const handleFormFieldChange = (next: GeneratorSettings) => {
    Object.entries(next).forEach(([key, value]) => {
      form.setValue(key as string, value);
    });
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
                onChange: handleFormFieldChange,
              })}
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
