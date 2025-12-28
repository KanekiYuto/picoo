"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { BUTTON_TRANSITION_CLASSES, FOCUS_RING_CLASSES, VISIBILITY_OPTIONS } from "../constants";

interface VisibilityFieldProps {
  value: "public" | "private";
  onChange: (value: "public" | "private") => void;
}

export function VisibilityField({ value, onChange }: VisibilityFieldProps) {
  const t = useTranslations("generator.settingsPanel");

  return (
    <div className="rounded-2xl border border-border/60 bg-[var(--color-generator-panel-card-bg)] px-3 py-3 sm:px-4 sm:py-3.5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-foreground">{t("visibility")}</p>
        <div className="relative flex gap-1 rounded-full bg-sidebar-active p-1">
          {VISIBILITY_OPTIONS.map((option) => (
            <motion.button
              key={option}
              type="button"
              aria-pressed={value === option}
              onClick={() => onChange(option)}
              className={cn(
                "relative flex min-w-[76px] items-center justify-center rounded-full px-4 py-1.5 text-xs font-semibold",
                BUTTON_TRANSITION_CLASSES,
                FOCUS_RING_CLASSES,
                value === option ? "text-white" : "text-white/60 hover:text-white/90"
              )}
            >
              {value === option && (
                <motion.div
                  layoutId="visibility-bg"
                  className="absolute inset-0 rounded-full bg-input-tab-active"
                  transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
                />
              )}
              <span className="relative z-10">{t(option)}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
