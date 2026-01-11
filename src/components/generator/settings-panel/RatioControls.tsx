"use client";

import { cn } from "@/lib/utils";

export function RatioControls({
  baseRatioIndex,
  setBaseRatioIndex,
  orientation,
  setOrientation,
  baseRatiosLength,
  currentRatioLabel,
  currentPreviewSize,
  pairPreviewSize,
  pairLabel,
}: {
  baseRatioIndex: number;
  setBaseRatioIndex: (index: number) => void;
  orientation: "portrait" | "landscape";
  setOrientation: (value: "portrait" | "landscape") => void;
  baseRatiosLength: number;
  currentRatioLabel: string;
  currentPreviewSize: { width: number; height: number };
  pairPreviewSize: { width: number; height: number } | null;
  pairLabel: string | null;
}) {
  const currentOrientation = baseRatioIndex === 0 ? "square" : orientation;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const index = parseInt(e.target.value, 10);
    setBaseRatioIndex(index);
  };

  const handleOrientationChange = (newOrientation: "portrait" | "square" | "landscape") => {
    if (newOrientation === "square") {
      setBaseRatioIndex(0);
      return;
    }

    if (baseRatioIndex === 0) {
      setBaseRatioIndex(1);
    }

    setOrientation(newOrientation);
  };

  const toggleOrientation = () => {
    if (baseRatioIndex === 0) return;
    setOrientation(orientation === "portrait" ? "landscape" : "portrait");
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative mx-auto flex h-28 w-28 flex-shrink-0 items-center justify-center sm:mx-0 sm:h-24 sm:w-24">
        {pairPreviewSize && (
          <button
            type="button"
            onClick={toggleOrientation}
            className="absolute flex items-center justify-center rounded-lg border-2 border-dashed bg-transparent text-muted transition-opacity hover:opacity-80"
            style={{
              width: `${pairPreviewSize.width}px`,
              height: `${pairPreviewSize.height}px`,
              borderColor: "rgba(255, 255, 255, 0.35)",
            }}
          >
            <span className="text-[11px] font-medium">{pairLabel}</span>
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
          <span className="text-xs font-semibold text-white/80">{currentRatioLabel}</span>
        </div>
      </div>

      <div className="flex w-full flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Portrait", value: "portrait" as const },
            { label: "Square", value: "square" as const },
            { label: "Landscape", value: "landscape" as const },
          ].map((category) => (
            <button
              key={category.value}
              type="button"
              onClick={() => handleOrientationChange(category.value)}
              className={cn(
                "flex-1 min-w-[92px] rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                currentOrientation === category.value
                  ? "bg-white text-black"
                  : "bg-sidebar-hover text-muted hover:text-foreground"
              )}
            >
              {category.label}
            </button>
          ))}
        </div>

        <div className="relative pt-2">
          <input
            type="range"
            min="0"
            max={baseRatiosLength - 1}
            value={baseRatioIndex}
            onChange={handleSliderChange}
            step="1"
            className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-border [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0"
          />
          <div className="absolute left-1/2 top-full mt-1 -translate-x-1/2 text-xs text-muted">
            {currentRatioLabel}
          </div>
        </div>
      </div>
    </div>
  );
}

