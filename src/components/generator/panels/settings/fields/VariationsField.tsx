"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { SectionCard } from "../SectionCard";
import { BUTTON_TRANSITION_CLASSES, FOCUS_RING_CLASSES, VARIATION_OPTIONS } from "../constants";

interface VariationsFieldProps {
  value: 1 | 2 | 3 | 4;
  onChange: (value: 1 | 2 | 3 | 4) => void;
}

export function VariationsField({ value, onChange }: VariationsFieldProps) {
  const t = useTranslations("generator.settingsPanel");

  return (
    <SectionCard title={t("moreOptions")}>
      <div className="space-y-3">
        <p className="text-sm font-medium text-foreground">{t("variations")}</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {VARIATION_OPTIONS.map((num) => (
            <button
              key={num}
              type="button"
              aria-pressed={value === num}
              onClick={() => onChange(num)}
              className={cn(
                "h-10 rounded-lg text-sm font-medium sm:h-11",
                BUTTON_TRANSITION_CLASSES,
                FOCUS_RING_CLASSES,
                value === num
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
  );
}
