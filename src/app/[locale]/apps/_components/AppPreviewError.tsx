"use client";

import { AlertTriangle, Zap } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@i18n/routing";
import { Button } from "@/components/ui/button";

const INSUFFICIENT_CREDITS_ERROR = "Insufficient credits";

export function AppPreviewError({ error }: { error: string }) {
  const t = useTranslations("apps.components.preview.error");

  const isInsufficientCredits = error === INSUFFICIENT_CREDITS_ERROR;

  if (isInsufficientCredits) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-5 bg-background-1 px-8 py-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <Zap className="h-7 w-7 text-primary" />
        </div>
        <div className="space-y-2">
          <p className="text-base font-semibold text-foreground">
            {t("insufficientCredits.title")}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("insufficientCredits.description")}
          </p>
        </div>
        <Button asChild size="sm" className="w-full">
          <Link href="/pricing">{t("insufficientCredits.cta")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-background-1 px-6 py-10">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-7 w-7 text-destructive" />
      </div>
      <p className="text-base font-semibold text-foreground text-center">{t("title")}</p>
      <div className="w-full max-h-40 overflow-y-auto rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3">
        <p className="text-sm text-muted-foreground break-words leading-relaxed">
          {error || t("description")}
        </p>
      </div>
    </div>
  );
}
