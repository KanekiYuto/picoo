"use client";

import type { ComponentType } from "react";
import { Lock } from "lucide-react";

import { cn } from "@/lib/utils";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import type { ModelOption } from "./types";

export function ModelGrid({
  models,
  selectedModel,
  onSelect,
  t,
}: {
  models: ModelOption[];
  selectedModel: string;
  onSelect: (modelId: string) => void;
  t: (key: string) => string;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {models.map((model) => {
        const IconComponent = model.icon as ComponentType<{ className?: string }> | undefined;
        const isSelected = selectedModel === model.id;
        const isLocked = Boolean(model.locked);

        return (
          <div key={model.id} className="relative flex flex-col items-center justify-center gap-1">
            <HoverCard openDelay={200} closeDelay={80}>
              <HoverCardTrigger>
                <button
                  type="button"
                  aria-pressed={isSelected}
                  disabled={isLocked}
                  onClick={() => onSelect(model.id)}
                  className={cn(
                    "relative flex h-[80px] w-full shrink-0 items-center justify-center rounded-2xl border transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    isSelected
                      ? "border-white/80 bg-sidebar-active"
                      : "border-border/60 bg-[var(--color-generator-panel-card-bg)]",
                    isLocked
                      ? "cursor-not-allowed opacity-60"
                      : "cursor-pointer hover:border-border/80 hover:bg-sidebar-hover/60"
                  )}
                >
                  <div
                    className={cn(
                      "[&_svg]:transition-colors",
                      isSelected ? "[&_svg]:text-white" : "[&_svg]:text-muted/80"
                    )}
                  >
                    {IconComponent ? (
                      <IconComponent className="h-6 w-6" />
                    ) : (
                      <span
                        className={cn(
                          "text-base font-semibold transition-colors",
                          isSelected ? "text-white" : "text-muted/80"
                        )}
                      >
                        {model.glyph}
                      </span>
                    )}
                  </div>

                  {isLocked && (
                    <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded bg-black/40 p-0 text-white/80 backdrop-blur-[6px]">
                      <Lock className="h-3 w-3" />
                    </span>
                  )}
                </button>
              </HoverCardTrigger>
              <HoverCardContent className="text-xs">
                <div className="text-sm font-semibold text-white">{model.name}</div>
                {model.tag && <div className="mt-0.5 text-white/70">{model.tag}</div>}
                {model.features && model.features.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {model.features.map((feature: string) => (
                      <span
                        key={feature}
                        className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-white/80"
                      >
                        {t(`features.${feature}`)}
                      </span>
                    ))}
                  </div>
                )}
                {model.descriptionKey && (
                  <div className="mt-2 leading-relaxed text-white/70">
                    {t(`modelDescriptions.${model.descriptionKey}`)}
                  </div>
                )}
              </HoverCardContent>
            </HoverCard>

            <span
              title={model.name}
              className={cn(
                "w-full whitespace-normal break-words text-center text-[11px] font-medium leading-snug",
                isLocked ? "text-muted/50" : isSelected ? "text-white" : "text-muted/80"
              )}
            >
              {model.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}
