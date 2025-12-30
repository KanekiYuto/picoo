"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { BUTTON_TRANSITION_CLASSES, FOCUS_RING_CLASSES, VISIBILITY_OPTIONS } from "../constants";
import { FormControl, useFormField } from "@/components/ui/form";

interface VisibilityFieldProps {
  // 组件不再需要 props
}

export function VisibilityField({}: VisibilityFieldProps) {
  const t = useTranslations("generator.settingsPanel");
  const { field } = useFormField();

  return (
    <div className="rounded-2xl border border-border/60 bg-background px-3 py-3 sm:px-4 sm:py-3.5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-foreground">{t("visibility")}</p>
        <FormControl>
          <div className="relative flex gap-1 rounded-lg bg-muted/10 p-1">
            {VISIBILITY_OPTIONS.map((option) => (
              <motion.button
                key={option}
                type="button"
                aria-pressed={field.value === option}
                onClick={() => field.onChange(option)}
                className={cn(
                  "relative flex min-w-[76px] items-center justify-center rounded-md px-3 py-2 text-xs font-semibold",
                  BUTTON_TRANSITION_CLASSES,
                  FOCUS_RING_CLASSES,
                  field.value === option ? "text-foreground" : "text-foreground/60 hover:text-foreground/90"
                )}
              >
                {field.value === option && (
                  <motion.div
                    layoutId="visibility-bg"
                    className="absolute inset-0 rounded-md bg-muted/15"
                    transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
                  />
                )}
                <span className="relative z-10">{t(option)}</span>
              </motion.button>
            ))}
          </div>
        </FormControl>
      </div>
    </div>
  );
}
