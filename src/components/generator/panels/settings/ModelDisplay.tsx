"use client";

import { cn } from "@/lib/utils";
import { SlidersHorizontal } from "lucide-react";
import type { ModelOption } from "./types";
import { MODE_CONFIGS, type GeneratorMode } from "../../config";

interface ModelDisplayProps {
  model: ModelOption | undefined;
  aspectRatio: string;
  variations: 1 | 2 | 3 | 4;
  visibility?: "public" | "private";
  resolution?: string;
  format?: string;
  compact?: boolean;
  onClick?: () => void;
  mode?: GeneratorMode;
  iconOnly?: boolean;
  className?: string;
}

/**
 * 模型信息展示组件
 * 根据 MODE_CONFIGS 中的 displayFields 动态显示内容
 */
export function ModelDisplay({
  model,
  aspectRatio,
  variations,
  visibility,
  resolution,
  format,
  compact = false,
  onClick,
  mode = "text-to-image",
  iconOnly = false,
  className,
}: ModelDisplayProps) {
  const modeConfig = MODE_CONFIGS[mode];
  const displayFields = modeConfig?.displayFields || [];

  // 构建显示内容
  const displayParts: string[] = [];

  displayFields.forEach((field) => {
    switch (field) {
      case "model":
        if (model?.name) {
          displayParts.push(model.name);
        }
        break;
      case "aspectRatio":
        displayParts.push(aspectRatio);
        break;
      case "variations":
        displayParts.push(`${variations}v`);
        break;
      case "resolution":
        if (resolution) {
          displayParts.push(resolution.toUpperCase());
        }
        break;
      case "format":
        if (format) {
          displayParts.push(format.toUpperCase());
        }
        break;
    }
  });

  if (displayParts.length === 0) {
    return null;
  }

  if (compact) {
    // 紧凑模式：用于GlobalGenerator的模型信息按钮
    const displayText = displayParts.join(" / ");

    // iconOnly 模式：只显示设置图标
    if (iconOnly) {
      return (
        <button
          onClick={onClick}
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-xl",
            "bg-sidebar-active text-foreground",
            "hover:bg-sidebar-hover",
            "transition-colors duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            "flex-shrink-0",
            className
          )}
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      );
    }

    return (
      <button
        onClick={onClick}
        className={cn(
          "flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-2 rounded-lg",
          "text-xs md:text-sm text-foreground",
          "hover:bg-sidebar-hover",
          "transition-colors duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          "min-w-0 max-w-full",
          className
        )}
      >
        <span className={cn("truncate", model?.name && "font-medium")}>
          {displayText}
        </span>
      </button>
    );
  }

  // 完整模式：显示所有信息
  return (
    <div className="space-y-2">
      {model?.name && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">{model.name}</span>
          {visibility && <span className="text-xs text-muted-foreground">{visibility}</span>}
        </div>
      )}
      <div className="text-xs text-muted-foreground">
        {displayParts.filter(part => part !== model?.name).join(" • ")}
      </div>
    </div>
  );
}
