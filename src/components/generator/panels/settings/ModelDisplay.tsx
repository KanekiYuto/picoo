"use client";

import { cn } from "@/lib/utils";
import type { GeneratorSettings, ModelOption } from "./types";

interface ModelDisplayProps {
  model: ModelOption | undefined;
  aspectRatio: string;
  variations: 1 | 2 | 3 | 4;
  visibility?: "public" | "private";
  compact?: boolean;
  t?: (key: string) => string;
  onClick?: () => void;
}

/**
 * 模型信息展示组件
 * 显示当前选择的模型、比例和变体数
 */
export function ModelDisplay({
  model,
  aspectRatio,
  variations,
  visibility,
  compact = false,
  t,
  onClick,
}: ModelDisplayProps) {
  if (!model) return null;

  const modelName = model.name;
  const variationLabel = `${variations}v`;

  if (compact) {
    // 紧凑模式：用于GlobalGenerator的模型信息按钮
    return (
      <button
        onClick={onClick}
        className={cn(
          "flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-2 rounded-lg",
          "text-xs md:text-sm text-white whitespace-nowrap",
          "hover:bg-sidebar-hover",
          "transition-colors duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        )}
      >
        <span className="font-medium">{modelName}</span>
        <span>/</span>
        <span>{aspectRatio}</span>
        <span>/</span>
        <span>{variationLabel}</span>
      </button>
    );
  }

  // 完整模式：显示所有信息
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{modelName}</span>
        {visibility && <span className="text-xs text-muted">{visibility}</span>}
      </div>
      <div className="text-xs text-muted">
        {aspectRatio} • {variationLabel}
      </div>
    </div>
  );
}
