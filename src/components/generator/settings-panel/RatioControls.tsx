"use client";

import { cn } from "@/lib/utils";
import type { AspectRatio, AspectRatioOption } from "./types";
import { parseRatio, getPreviewSize, findPairedRatio } from "./utils";
import { MAX_PREVIEW_SIZE, FOCUS_RING_CLASSES, BUTTON_TRANSITION_CLASSES } from "./constants";

export function RatioControls({
  options,
  value,
  onChange,
}: {
  options: readonly AspectRatioOption[];
  value: AspectRatio;
  onChange: (next: AspectRatio) => void;
}) {

  const current = parseRatio(value);
  const currentPreviewSize = getPreviewSize(current.width, current.height, MAX_PREVIEW_SIZE);

  const currentOption = options.find((opt) => opt.portrait === value || opt.landscape === value);
  const pairedRatio = currentOption ? findPairedRatio(value, currentOption) : null;

  const paired = pairedRatio ? parseRatio(pairedRatio) : null;
  const pairPreviewSize = paired ? getPreviewSize(paired.width, paired.height, MAX_PREVIEW_SIZE) : null;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch sm:gap-6">
      <div className="relative flex h-48 items-center justify-center sm:h-auto" style={{ flex: "3 1 0%" }}>
        {pairPreviewSize && pairedRatio && (
          <button
            type="button"
            onClick={() => onChange(pairedRatio)}
            className={cn(
              "absolute flex items-center justify-center rounded-lg border-2 border-dashed border-white/30 bg-transparent text-muted transition-opacity hover:opacity-80",
              FOCUS_RING_CLASSES
            )}
            style={{
              width: `${pairPreviewSize.width}px`,
              height: `${pairPreviewSize.height}px`,
            }}
          >
            <span className="text-[11px] font-medium">{pairedRatio}</span>
          </button>
        )}

        <div
          className="relative z-10 flex items-center justify-center rounded-lg border-2 border-white bg-transparent"
          style={{
            width: `${currentPreviewSize.width}px`,
            height: `${currentPreviewSize.height}px`,
          }}
        >
          <span className="text-xs font-semibold text-white/80">{value}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2" style={{ flex: "7 1 0%" }}>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {options.map((opt) => {
            const hasPair = Boolean(opt.landscape && opt.landscape !== opt.portrait);
            const isActive = value === opt.portrait || value === opt.landscape;
            const label = hasPair ? `${opt.portrait}/${opt.landscape}` : opt.portrait;

            return (
              <button
                key={`${opt.portrait}:${opt.landscape ?? ""}`}
                type="button"
                aria-pressed={isActive}
                onClick={() => {
                  if (!hasPair) return onChange(opt.portrait);
                  onChange(value === opt.portrait ? (opt.landscape as AspectRatio) : opt.portrait);
                }}
                className={cn(
                  "cursor-pointer rounded-xl border px-3 py-2 text-center flex flex-col items-center justify-start",
                  BUTTON_TRANSITION_CLASSES,
                  FOCUS_RING_CLASSES,
                  isActive
                    ? "border-white/80 bg-sidebar-active text-white"
                    : "border-border/60 bg-[var(--color-generator-panel-card-bg)] text-muted/80 hover:text-foreground hover:bg-sidebar-hover/60 hover:border-border/80"
                )}
              >
                {/* 显示比例的形状预览 */}
                <div className="flex items-center justify-center w-full">
                  {(() => {
                    // 解析比例 (portrait 或 portrait/landscape)
                    const getRatio = (ratioStr: string) => {
                      const [w, h] = ratioStr.split(":").map(Number);
                      return w / h;
                    };

                    const ratio = label.includes("/")
                      ? getRatio(label.split("/")[0]) // 用 portrait 比例
                      : getRatio(label);

                    const baseHeight = 48; // 固定高度
                    const width = Math.round(baseHeight * ratio);

                    return (
                      <div
                        className="rounded-sm bg-white/60"
                        style={{
                          width: `${width}px`,
                          height: `${baseHeight}px`,
                        }}
                      />
                    );
                  })()}
                </div>
                <div className="mt-2 text-xs leading-tight opacity-90 sm:text-[13px]">{label}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
