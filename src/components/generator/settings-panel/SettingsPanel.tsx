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
import type { AspectRatio, GeneratorSettings } from "./types";

export interface SettingsPanelProps {
  onClose: () => void;
  settings?: GeneratorSettings;
  onSettingsChange?: (settings: GeneratorSettings) => void;
}

export function SettingsPanel({ onClose, settings, onSettingsChange }: SettingsPanelProps) {
  const t = useTranslations("generator.settingsPanel");

  const initialModelId = settings?.model ?? MODELS[0]?.id ?? "nano-banana";
  const initialModel = MODELS.find((m) => m.id === initialModelId) ?? MODELS[0];
  const initialAspectRatio =
    (settings?.aspectRatio as AspectRatio | undefined) ??
    initialModel?.aspectRatioOptions?.[0]?.portrait ??
    ("1:1" as AspectRatio);

  const [selectedModel, setSelectedModel] = useState(initialModelId);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(initialAspectRatio);
  const [variations, setVariations] = useState<GeneratorSettings["variations"]>(settings?.variations ?? 1);
  const [visibility, setVisibility] = useState<GeneratorSettings["visibility"]>(settings?.visibility ?? "public");

  const selectedModelConfig = useMemo(
    () => MODELS.find((m) => m.id === selectedModel) ?? MODELS[0],
    [selectedModel]
  );
  const aspectRatioOptions = selectedModelConfig?.aspectRatioOptions ?? [];

  useEffect(() => {
    onSettingsChange?.({
      model: selectedModel,
      aspectRatio,
      variations,
      visibility,
    });
  }, [aspectRatio, onSettingsChange, selectedModel, variations, visibility]);

  const handleReset = () => {
    const modelId = MODELS[0]?.id ?? "nano-banana";
    const model = MODELS.find((m) => m.id === modelId) ?? MODELS[0];
    setSelectedModel(modelId);
    setAspectRatio((model?.aspectRatioOptions?.[0]?.portrait ?? "1:1") as AspectRatio);
    setVariations(1);
    setVisibility("public");
  };

  const handleSelectModel = (modelId: string) => {
    const model = MODELS.find((m) => m.id === modelId) ?? MODELS[0];
    const options = model?.aspectRatioOptions ?? [];

    setSelectedModel(modelId);

    const stillSupported = options.some((opt) => opt.portrait === aspectRatio || opt.landscape === aspectRatio);
    if (!stillSupported) {
      setAspectRatio((options[0]?.portrait ?? "1:1") as AspectRatio);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 text-center sm:flex-nowrap sm:px-6 sm:py-4 sm:text-left">
        <h2 className="text-base font-semibold text-foreground sm:text-lg">{t("title")}</h2>
        <motion.button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-sidebar-hover hover:text-foreground"
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
              <ModelGrid models={MODELS} selectedModel={selectedModel} onSelect={handleSelectModel} t={t} />
            </div>
          </div>

          <div className="flex flex-col gap-4 px-4 py-4 lg:h-full lg:min-h-0 lg:px-4">
            <div className="shrink-0">
              <SectionCard
                title={t("imageSize")}
                className="bg-[var(--color-generator-panel-card-bg)]"
                action={
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-xs font-medium text-muted transition-colors hover:text-foreground"
                  >
                    {t("reset")}
                  </button>
                }
              >
                <RatioControls options={aspectRatioOptions} value={aspectRatio} onChange={setAspectRatio} />
              </SectionCard>
            </div>

            <div className="lg:flex-1 lg:min-h-0 lg:overflow-y-auto lg:pr-2 lg:custom-scrollbar">
              <SectionCard title={t("moreOptions")} className="bg-[var(--color-generator-panel-card-bg)]">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-foreground">{t("variations")}</p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {([1, 2, 3, 4] as const).map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setVariations(num)}
                        className={cn(
                          "h-10 cursor-pointer rounded-lg text-sm font-medium transition-colors sm:h-11",
                          variations === num
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
                        aria-pressed={visibility === option}
                        onClick={() => setVisibility(option)}
                        className={cn(
                          "relative flex min-w-[76px] cursor-pointer items-center justify-center rounded-full px-4 py-1.5 text-xs font-semibold transition-colors sm:py-2",
                          visibility === option
                            ? "text-white"
                            : "text-muted/80 hover:text-foreground hover:bg-sidebar-hover/30"
                        )}
                      >
                        {visibility === option && (
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
