"use client";

import { Download, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useImageDownload } from "@/hooks/useImageDownload";
import { useAppPreviewStore } from "./app-preview-store";

export function AppPreviewResult() {
  const t = useTranslations("apps.components.preview");
  const status = useAppPreviewStore((s) => s.status);
  const result = useAppPreviewStore((s) => s.result);
  const reset = useAppPreviewStore((s) => s.reset);
  const { downloadImage } = useImageDownload();

  if (status !== "success" || !result) return null;

  const alt = result.alt ?? t("resultAlt");

  return (
    <div className="relative flex-1 min-h-[280px]">
      <img
        src={result.url}
        alt={alt}
        className="block h-full w-full object-contain"
        loading="eager"
        decoding="async"
      />

      <div className="absolute right-3 top-3 flex items-center gap-2">
        <Button
          type="button"
          variant="result"
          size="icon-sm"
          aria-label={t("download")}
          title={t("download")}
          onClick={async () => {
            await downloadImage(result.url);
          }}
        >
          <Download />
        </Button>
        <Button
          type="button"
          variant="result"
          size="icon-sm"
          aria-label={t("reset")}
          title={t("reset")}
          onClick={reset}
        >
          <RotateCcw />
        </Button>
      </div>
    </div>
  );
}

