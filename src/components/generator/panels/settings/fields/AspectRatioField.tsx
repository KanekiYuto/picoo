"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { SectionCard } from "../SectionCard";
import { RatioControls } from "../RatioControls";
import { FOCUS_RING_CLASSES } from "../constants";
import type { AspectRatio, AspectRatioOption } from "../types";

interface AspectRatioFieldProps {
  value: AspectRatio;
  options: readonly AspectRatioOption[];
  onChange: (value: AspectRatio) => void;
  canReset?: boolean;
  onReset?: () => void;
}

export function AspectRatioField({ value, options, onChange, canReset, onReset }: AspectRatioFieldProps) {
  const t = useTranslations("generator.settingsPanel");

  return (
    <SectionCard
      title={t("aspectRatio")}
      action={
        onReset && (
          <button
            type="button"
            onClick={onReset}
            disabled={!canReset}
            className={cn(
              "text-xs font-medium transition-colors",
              FOCUS_RING_CLASSES,
              canReset ? "text-muted hover:text-foreground" : "cursor-not-allowed text-muted/40"
            )}
          >
            {t("reset")}
          </button>
        )
      }
    >
      <RatioControls options={options} value={value} onChange={onChange} />
    </SectionCard>
  );
}
