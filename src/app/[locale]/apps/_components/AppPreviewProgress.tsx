"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAppPreviewStore } from "./app-preview-store";

export function AppPreviewProgress() {
  const t = useTranslations("apps.components.preview");
  const status = useAppPreviewStore((s) => s.status);
  const progress = useAppPreviewStore((s) => s.progress);

  if (status !== "generating") return null;

  const value =
    typeof progress?.value === "number"
      ? Math.max(0, Math.min(1, progress.value))
      : null;

  return (
    <div className="absolute inset-0 z-20 grid place-items-center bg-background-1">
      <div className="flex w-full max-w-sm flex-col items-center gap-3 rounded-3xl border border-background-2 bg-background-1/70 px-6 py-6 text-center shadow-sm backdrop-blur-sm">
        <Loader2 className="h-5 w-5 animate-spin text-foreground" />
        <div className="space-y-1">
          <div className="text-sm font-semibold text-foreground">
            {progress?.label ?? t("generating")}
          </div>
          <div className="text-xs text-muted-foreground">{t("generatingHint")}</div>
        </div>

        <div className="w-full space-y-2">
          <div className="h-2 w-full overflow-hidden rounded-full bg-background-2">
            {value !== null ? (
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-300"
                style={{ width: `${Math.round(value * 100)}%` }}
              />
            ) : (
              <div className="h-full w-2/5 animate-pulse rounded-full bg-primary/60" />
            )}
          </div>
          {value !== null ? (
            <div className="text-xs text-muted-foreground">
              {t("progress", { percent: Math.round(value * 100) })}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
