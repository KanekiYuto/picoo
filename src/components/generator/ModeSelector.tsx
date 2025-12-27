"use client";

import { Type, Maximize, Pencil, Palette, AtSign, X } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export type GeneratorMode = "prompt" | "upscale" | "edit" | "style" | "personalize";

interface ModeSelectorPanelProps {
  isOpen: boolean;
  value: GeneratorMode;
  onChange: (mode: GeneratorMode) => void;
  onClose: () => void;
  uploadImages?: string[];
}

const MODE_OPTIONS: { id: GeneratorMode; icon: React.ElementType; labelKey: string; descKey: string }[] = [
  { id: "prompt", icon: Type, labelKey: "prompt", descKey: "promptDesc" },
  { id: "upscale", icon: Maximize, labelKey: "upscale", descKey: "upscaleDesc" },
  { id: "edit", icon: Pencil, labelKey: "edit", descKey: "editDesc" },
  { id: "style", icon: Palette, labelKey: "style", descKey: "styleDesc" },
  { id: "personalize", icon: AtSign, labelKey: "personalize", descKey: "personalizeDesc" },
];

export function ModeSelectorPanel({ isOpen, value, onChange, onClose, uploadImages = [] }: ModeSelectorPanelProps) {
  const t = useTranslations("generator.modes");

  return (
    <div className="w-full rounded-2xl bg-card border border-border shadow-2xl">
      {/* 头部 - 标题和关闭按钮 */}
      <div className="flex items-center justify-between border-b border-border px-4 md:px-6 py-3 md:py-4 flex-shrink-0">
        <h2 className="text-base md:text-lg font-semibold text-foreground">
          {t("prompt")} Mode
        </h2>
        <motion.button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-sidebar-hover hover:text-foreground"
          aria-label="关闭"
        >
          <X className="h-4 w-4 md:h-5 md:w-5" />
        </motion.button>
      </div>


      {/* 内容 - 响应式模式网格 */}
      <div className="p-4 md:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4">
          {MODE_OPTIONS.map((mode) => {
            const Icon = mode.icon;
            const isSelected = value === mode.id;

            return (
              <motion.button
                key={mode.id}
                onClick={() => {
                  onChange(mode.id);
                  onClose();
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex flex-col items-start gap-2 p-3 md:p-4 rounded-xl border transition-all cursor-pointer",
                  isSelected
                    ? "border-white/80 bg-sidebar-active text-white"
                    : "border-border/60 bg-[var(--color-generator-panel-card-bg)] hover:border-border/80 text-foreground"
                )}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="text-sm md:text-base font-semibold">{t(mode.labelKey)}</span>
                </div>
                <span className="text-xs text-muted">{t(mode.descKey)}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// 按钮组件 - 用于打开模式选择面板
interface ModeSelectorButtonProps {
  value: GeneratorMode;
  onClick: () => void;
}

export function ModeSelectorButton({ value, onClick }: ModeSelectorButtonProps) {
  const t = useTranslations("generator.modes");
  const currentMode = MODE_OPTIONS.find((m) => m.id === value) || MODE_OPTIONS[0];
  const CurrentIcon = currentMode.icon;

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-sidebar-active text-white text-sm font-medium transition-all duration-200"
    >
      <CurrentIcon className="w-4 h-4" />
      <span>{t(currentMode.labelKey)}</span>
    </motion.button>
  );
}
