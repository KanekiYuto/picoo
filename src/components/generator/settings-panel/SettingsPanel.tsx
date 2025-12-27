"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { MODELS } from "./models";
import { ModelGrid } from "./ModelGrid";
import { RatioControls } from "./RatioControls";
import { SectionCard } from "./SectionCard";
import type { AspectRatio, AspectRatioOption, GeneratorSettings } from "./types";

const DEFAULT_MODEL_ID = MODELS[0]?.id ?? "nano-banana";

function getModelById(modelId: string) {
  return MODELS.find((model) => model.id === modelId) ?? MODELS[0];
}

function getDefaultAspectRatio(options: readonly AspectRatioOption[] | undefined): AspectRatio {
  return (options?.[0]?.portrait ?? "1:1") as AspectRatio;
}

function isAspectRatioSupported(options: readonly AspectRatioOption[], ratio: AspectRatio) {
  return options.some((opt) => opt.portrait === ratio || opt.landscape === ratio);
}

function normalizeSettings(settings?: Partial<GeneratorSettings>): GeneratorSettings {
  const modelId = settings?.model ?? DEFAULT_MODEL_ID;
  const model = getModelById(modelId);
  const aspectRatioOptions = model?.aspectRatioOptions ?? [];

  const defaultAspectRatio = getDefaultAspectRatio(aspectRatioOptions);
  const requestedAspectRatio = (settings?.aspectRatio as AspectRatio | undefined) ?? defaultAspectRatio;
  const aspectRatio = isAspectRatioSupported(aspectRatioOptions, requestedAspectRatio)
    ? requestedAspectRatio
    : defaultAspectRatio;

  const variations = ([1, 2, 3, 4] as const).includes(settings?.variations as GeneratorSettings["variations"])
    ? (settings?.variations as GeneratorSettings["variations"])
    : 1;

  const visibility = settings?.visibility === "private" ? "private" : "public";

  return {
    model: model?.id ?? modelId,
    aspectRatio,
    variations,
    visibility,
  };
}

function areSettingsEqual(a: GeneratorSettings, b: GeneratorSettings) {
  return (
    a.model === b.model &&
    a.aspectRatio === b.aspectRatio &&
    a.variations === b.variations &&
    a.visibility === b.visibility
  );
}

export interface SettingsPanelProps {
  onClose: () => void;
  settings?: GeneratorSettings;
  onSettingsChange?: (settings: GeneratorSettings) => void;
}

export function SettingsPanel({ onClose, settings, onSettingsChange }: SettingsPanelProps) {
  const t = useTranslations("generator.settingsPanel");

  const defaultSettings = useMemo(() => normalizeSettings(), []);
  const isExternallyControlled = settings !== undefined && onSettingsChange !== undefined;

  const [localSettings, setLocalSettings] = useState<GeneratorSettings>(() => normalizeSettings(settings));

  useEffect(() => {
    if (!settings || isExternallyControlled) return;
    const next = normalizeSettings(settings);
    setLocalSettings((prev) => (areSettingsEqual(prev, next) ? prev : next));
  }, [isExternallyControlled, settings]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const currentSettings = useMemo(() => {
    if (!settings) return localSettings;
    return isExternallyControlled ? normalizeSettings(settings) : localSettings;
  }, [isExternallyControlled, localSettings, settings]);

  const selectedModelConfig = useMemo(() => getModelById(currentSettings.model), [currentSettings.model]);
  const aspectRatioOptions = selectedModelConfig?.aspectRatioOptions ?? [];

  const canReset = !areSettingsEqual(currentSettings, defaultSettings);

  const commitSettings = (next: GeneratorSettings) => {
    if (areSettingsEqual(next, currentSettings)) return;

    if (isExternallyControlled) {
      onSettingsChange?.(next);
      return;
    }

    setLocalSettings(next);
    onSettingsChange?.(next);
  };

  const handleReset = () => {
    commitSettings(defaultSettings);
  };

  const handleSelectModel = (modelId: string) => {
    const model = getModelById(modelId);
    if (model?.locked) return;

    const options = model?.aspectRatioOptions ?? [];
    const nextAspectRatio = isAspectRatioSupported(options, currentSettings.aspectRatio)
      ? currentSettings.aspectRatio
      : getDefaultAspectRatio(options);

    commitSettings({
      ...currentSettings,
      model: model?.id ?? modelId,
      aspectRatio: nextAspectRatio,
    });
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 text-center sm:flex-nowrap sm:px-6 sm:py-4 sm:text-left">
        <h2 className="text-base font-semibold text-foreground sm:text-lg">{t("title")}</h2>
        <motion.button
          type="button"
          onClick={onClose}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-sidebar-hover hover:text-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
              <ModelGrid models={MODELS} selectedModel={currentSettings.model} onSelect={handleSelectModel} t={t} />
            </div>
          </div>

          <div className="flex flex-col gap-4 px-4 py-4 lg:h-full lg:min-h-0 lg:px-4">
            <div className="shrink-0">
              <SectionCard
                title={t("aspectRatio")}
                action={
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={!canReset}
                    className={cn(
                      "text-xs font-medium transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      canReset ? "text-muted hover:text-foreground" : "cursor-not-allowed text-muted/40"
                    )}
                  >
                    {t("reset")}
                  </button>
                }
              >
                <RatioControls
                  options={aspectRatioOptions}
                  value={currentSettings.aspectRatio}
                  onChange={(next) => commitSettings({ ...currentSettings, aspectRatio: next })}
                />
              </SectionCard>
            </div>

            <div className="lg:flex-1 lg:min-h-0 lg:overflow-y-auto lg:pr-2 lg:custom-scrollbar">
              <SectionCard title={t("moreOptions")}>
                <div className="space-y-3">
                  <p className="text-sm font-medium text-foreground">{t("variations")}</p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {([1, 2, 3, 4] as const).map((num) => (
                      <button
                        key={num}
                        type="button"
                        aria-pressed={currentSettings.variations === num}
                        onClick={() => commitSettings({ ...currentSettings, variations: num })}
                        className={cn(
                          "h-10 cursor-pointer rounded-lg text-sm font-medium transition-colors sm:h-11",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                          currentSettings.variations === num
                            ? "bg-sidebar-active text-white"
                            : "bg-sidebar-hover text-muted hover:text-foreground"
                        )}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              </SectionCard>
            </div>

            <div className="shrink-0">
              <div className="rounded-2xl border border-border/60 bg-[var(--color-generator-panel-card-bg)] px-3 py-3 sm:px-4 sm:py-3.5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-foreground">{t("visibility")}</p>
                  <div className="relative flex gap-1 rounded-full border border-border/60 bg-sidebar-hover/40 p-1.5">
                    {(["public", "private"] as const).map((option) => (
                      <button
                        key={option}
                        type="button"
                        aria-pressed={currentSettings.visibility === option}
                        onClick={() => commitSettings({ ...currentSettings, visibility: option })}
                        className={cn(
                          "relative flex min-w-[76px] cursor-pointer items-center justify-center rounded-full px-4 py-1.5 text-xs font-semibold transition-colors sm:py-2",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                          currentSettings.visibility === option
                            ? "text-white"
                            : "text-muted/80 hover:text-foreground hover:bg-sidebar-hover/30"
                        )}
                      >
                        {currentSettings.visibility === option && (
                          <motion.div
                            layoutId="visibility-pill"
                            className="absolute inset-0 rounded-full bg-sidebar-active shadow-sm shadow-black/30 ring-1 ring-white/10"
                            transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
                          />
                        )}
                        <span className="relative z-10">{t(option)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
