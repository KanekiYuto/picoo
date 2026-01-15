"use client";

import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface TextToImagePlaceholderProps {
  className?: string;
}

export function TextToImagePlaceholder({
  className,
}: TextToImagePlaceholderProps) {
  const t = useTranslations("generator");

  return (
    <div className={cn("flex h-24 w-24 items-center justify-center rounded-xl border-2 border-dashed border-border/35 bg-muted/10", className)}>
      <div className="flex flex-col items-center gap-1">
        <Plus className="h-6 w-6 text-muted-foreground/45 rotate-45" />
        <span className="text-[10px] font-medium text-muted-foreground/45">{t("noImageRequired")}</span>
      </div>
    </div>
  );
}
