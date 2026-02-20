"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAppPreviewStore } from "./app-preview-store";
import { AppPreviewError } from "./AppPreviewError";
import { AppPreviewProgress } from "./AppPreviewProgress";
import { AppPreviewResult } from "./AppPreviewResult";

export function AppPreviewStage({
  fallback,
  frameClassName = "aspect-[4/5] md:aspect-[4/5]",
}: {
  fallback: ReactNode;
  frameClassName?: string;
}) {
  const t = useTranslations("apps.components.preview");
  const pathname = usePathname();
  const reset = useAppPreviewStore((s) => s.reset);
  const status = useAppPreviewStore((s) => s.status);
  const result = useAppPreviewStore((s) => s.result);
  const progress = useAppPreviewStore((s) => s.progress);
  const error = useAppPreviewStore((s) => s.error);
  const prevStatusRef = useRef(status);

  useEffect(() => {
    reset();
  }, [pathname, reset]);

  useEffect(() => {
    if (prevStatusRef.current === "generating" && status === "success") {
      toast.success(t("successToast"));
    }
    prevStatusRef.current = status;
  }, [status, t]);

  const showResult = status === "success" && !!result;
  const showError = status === "error" && !!error;
  const showProgress = status === "generating";
  const showFallback = !showResult && !showError && !showProgress;

  return (
    <div className="relative w-full">
      <div className={cn("w-full", frameClassName)} aria-hidden="true" />
      {showFallback ? <div className="absolute inset-0">{fallback}</div> : null}
      {showResult ? <AppPreviewResult /> : null}
      {showError ? <AppPreviewError error={error} /> : null}
      {showProgress ? <AppPreviewProgress progress={progress} /> : null}
    </div>
  );
}
