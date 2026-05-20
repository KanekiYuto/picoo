"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { AppPreviewProgress as AppPreviewProgressType } from "./app-preview-store";

export function AppPreviewProgress({ progress }: { progress: AppPreviewProgressType | null }) {
  const t = useTranslations("apps.components.preview");

  const value =
    typeof progress?.value === "number"
      ? Math.max(0, Math.min(1, progress.value))
      : null;

  const percent = value !== null ? Math.round(value * 100) : null;

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-background-1 px-8 py-12">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />

      <div className="w-full space-y-3 text-center">
        <p className="text-sm font-semibold text-foreground">
          {progress?.label ?? t("generating")}
        </p>
        <p className="text-xs text-muted-foreground">{t("generatingHint")}</p>
      </div>

      <div className="w-full space-y-2">
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-background-2">
          {value !== null ? (
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-primary transition-[width] duration-500"
              style={{ width: `${percent}%` }}
            />
          ) : (
            <div
              className="absolute inset-y-0 rounded-full bg-primary/60"
              style={{ animation: "indeterminate 2.8s ease-in-out infinite" }}
            />
          )}
        </div>

        {percent !== null && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{t("progress", { percent })}</span>
            <span className="text-xs font-medium tabular-nums text-primary">{percent}%</span>
          </div>
        )}
      </div>

      <style>{`
        @keyframes indeterminate {
          0% { left: -40%; width: 40%; }
          60% { left: 100%; width: 40%; }
          100% { left: 100%; width: 40%; }
        }
      `}</style>
    </div>
  );
}
