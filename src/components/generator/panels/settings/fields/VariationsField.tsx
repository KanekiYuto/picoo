"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { SectionCard } from "../SectionCard";
import { BUTTON_TRANSITION_CLASSES, FOCUS_RING_CLASSES, VARIATION_OPTIONS } from "../constants";
import { FormControl, useFormField } from "@/components/ui/form";

interface VariationsFieldProps {
  // 组件不再需要 props
}

export function VariationsField({}: VariationsFieldProps) {
  const t = useTranslations("generator.settingsPanel");
  const { field } = useFormField();

  return (
    <SectionCard title={t("moreOptions")}>
      <div className="space-y-3">
        <p className="text-sm font-medium text-foreground">{t("variations")}</p>
        <FormControl>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {VARIATION_OPTIONS.map((num) => (
              <button
                key={num}
                type="button"
                aria-pressed={field.value === num}
                onClick={() => field.onChange(num)}
                className={cn(
                  "h-10 rounded-lg text-sm font-medium sm:h-11",
                  BUTTON_TRANSITION_CLASSES,
                  FOCUS_RING_CLASSES,
                  field.value === num
                    ? "bg-muted/20 text-foreground"
                    : "bg-muted/10 text-muted-foreground hover:text-foreground"
                )}
              >
                {num}
              </button>
            ))}
          </div>
        </FormControl>
      </div>
    </SectionCard>
  );
}
