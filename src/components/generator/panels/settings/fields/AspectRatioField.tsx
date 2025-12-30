"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { SectionCard } from "../SectionCard";
import { RatioControls } from "../RatioControls";
import { FOCUS_RING_CLASSES } from "../constants";
import { FormControl, useFormField } from "@/components/ui/form";
import type { AspectRatio, AspectRatioOption } from "../types";

interface AspectRatioFieldProps {
  options: readonly AspectRatioOption[];
  canReset?: boolean;
  onReset?: () => void;
}

export function AspectRatioField({ options, canReset, onReset }: AspectRatioFieldProps) {
  const t = useTranslations("generator.settingsPanel");
  const { field } = useFormField();

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
              canReset ? "text-muted-foreground hover:text-foreground" : "cursor-not-allowed text-muted-foreground/40"
            )}
          >
            {t("reset")}
          </button>
        )
      }
    >
      <FormControl>
        <RatioControls options={options} value={field.value as AspectRatio} onChange={field.onChange} />
      </FormControl>
    </SectionCard>
  );
}
