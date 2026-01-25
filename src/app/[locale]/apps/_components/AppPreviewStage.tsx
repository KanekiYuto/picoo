"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAppPreviewStore } from "./app-preview-store";
import { AppPreviewProgress } from "./AppPreviewProgress";
import { AppPreviewResult } from "./AppPreviewResult";

export function AppPreviewStage({
  fallback,
  frameClassName = "aspect-[4/5] md:aspect-[4/5]",
}: {
  fallback: ReactNode;
  frameClassName?: string;
}) {
  const pathname = usePathname();
  const reset = useAppPreviewStore((s) => s.reset);
  const status = useAppPreviewStore((s) => s.status);
  const result = useAppPreviewStore((s) => s.result);

  useEffect(() => {
    reset();
  }, [pathname, reset]);

  const showResult = status === "success" && !!result;
  const showProgress = status === "generating";
  const showFallback = !showResult && !showProgress;

  return (
    <div className="relative w-full">
      <div className={cn("w-full", frameClassName)} aria-hidden="true" />
      {showFallback ? <div className="absolute inset-0">{fallback}</div> : null}
      {showResult ? <AppPreviewResult /> : null}
      {showProgress ? <AppPreviewProgress /> : null}
    </div>
  );
}
