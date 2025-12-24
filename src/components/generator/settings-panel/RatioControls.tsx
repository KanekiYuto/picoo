"use client";

import { cn } from "@/lib/utils";
import type { AspectRatio, AspectRatioOption } from "./types";

export function RatioControls({
  options,
  value,
  onChange,
}: {
  options: readonly AspectRatioOption[];
  value: AspectRatio;
  onChange: (next: AspectRatio) => void;
}) {
  const maxSize = 96;

  const parseRatio = (ratio: AspectRatio) => {
    const [w, h] = ratio.split(":").map((n) => Number(n));
    if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) {
      return { width: 1, height: 1 };
    }
    return { width: w, height: h };
  };

  const getPreviewSize = (width: number, height: number) => {
    const r = width / height;
    if (r > 1) return { width: maxSize, height: maxSize / r };
    if (r < 1) return { width: maxSize * r, height: maxSize };
    return { width: maxSize, height: maxSize };
  };

  const current = parseRatio(value);
  const currentPreviewSize = getPreviewSize(current.width, current.height);

  const currentOption = options.find((opt) => opt.portrait === value || opt.landscape === value);
  const pairedRatio =
    currentOption && currentOption.landscape && currentOption.landscape !== currentOption.portrait
      ? currentOption.portrait === value
        ? currentOption.landscape
        : currentOption.portrait
      : null;

  const pairPreviewSize = pairedRatio ? (() => {
    const p = parseRatio(pairedRatio);
    return getPreviewSize(p.width, p.height);
  })() : null;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative mx-auto flex h-28 w-28 flex-shrink-0 items-center justify-center sm:mx-0 sm:h-24 sm:w-24">
        {pairPreviewSize && pairedRatio && (
          <button
            type="button"
            onClick={() => onChange(pairedRatio)}
            className="absolute flex items-center justify-center rounded-lg border-2 border-dashed bg-transparent text-muted transition-opacity hover:opacity-80"
            style={{
              width: `${pairPreviewSize.width}px`,
              height: `${pairPreviewSize.height}px`,
              borderColor: "rgba(255, 255, 255, 0.35)",
            }}
          >
            <span className="text-[11px] font-medium">{pairedRatio}</span>
          </button>
        )}

        <div
          className="relative z-10 flex items-center justify-center rounded-lg border-2 bg-transparent"
          style={{
            width: `${currentPreviewSize.width}px`,
            height: `${currentPreviewSize.height}px`,
            borderColor: "rgba(255, 255, 255, 0.55)",
          }}
        >
          <span className="text-xs font-semibold text-white/80">{value}</span>
        </div>
      </div>

      <div className="flex w-full flex-col gap-2">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {options.map((opt) => {
            const hasPair = Boolean(opt.landscape && opt.landscape !== opt.portrait);
            const isActive = value === opt.portrait || value === opt.landscape;
            const label = hasPair ? `${opt.portrait} | ${opt.landscape}` : opt.portrait;

            return (
              <button
                key={`${opt.portrait}:${opt.landscape ?? ""}`}
                type="button"
                onClick={() => {
                  if (!hasPair) return onChange(opt.portrait);
                  onChange(value === opt.portrait ? (opt.landscape as AspectRatio) : opt.portrait);
                }}
                className={cn(
                  "rounded-xl border px-3 py-2 text-left transition-colors",
                  isActive
                    ? "border-white/60 bg-sidebar-active text-white"
                    : "border-border/60 bg-sidebar-hover/40 text-muted hover:text-foreground hover:bg-sidebar-hover/60 hover:border-border/80"
                )}
              >
                <div className="text-[11px] font-semibold leading-tight">{opt.title}</div>
                <div className="mt-0.5 text-[11px] leading-tight opacity-90">{label}</div>
              </button>
            );
          })}
        </div>
        {pairedRatio && (
          <p className="text-[11px] text-muted/80">点击预览虚线框可切换：{pairedRatio}</p>
        )}
      </div>
    </div>
  );
}
