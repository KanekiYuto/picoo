"use client";

import { cn } from "@/lib/utils";
import { SlidersHorizontal } from "lucide-react";
import type { ModelOption } from "./types";
import type { GeneratorSettings } from ".";
import { MODE_CONFIGS, type GeneratorMode } from "../../config";

interface ModelDisplayProps {
  model: ModelOption | undefined;
  settings: GeneratorSettings;
  compact?: boolean;
  onClick?: () => void;
  mode?: GeneratorMode;
  iconOnly?: boolean;
  className?: string;
}

/**
 * 模型信息展示组件
 * 根据模型配置中的 getDisplayContent 回调动态显示内容
 */
export function ModelDisplay({
  model,
  settings,
  compact = false,
  onClick,
  mode,
  iconOnly = false,
  className,
}: ModelDisplayProps) {
  const modeConfig = mode ? MODE_CONFIGS[mode] : undefined;
  const modelInfo = modeConfig?.models?.[settings.model];

  // 从模型配置获取显示内容
  const displayContent = modelInfo?.getDisplayContent(settings) || [];

  if (displayContent.length === 0 && !model?.name) {
    return null;
  }

  if (compact) {
    // 紧凑模式：用于GlobalGenerator的模型信息按钮
    const displayParts: string[] = [];
    if (model?.name) {
      displayParts.push(model.name);
    }
    displayParts.push(...displayContent.map(item => item.value));

    if (displayParts.length === 0) {
      return null;
    }

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
          {settings.visibility && <span className="text-xs text-muted-foreground">{settings.visibility}</span>}
        </div>
      )}
      <div className="text-xs text-muted-foreground">
        {displayContent.map((item, index) => (
          <div key={index}>
            <span className="font-medium">{item.label}:</span> {item.value}
          </div>
        ))}
      </div>
    </div>
  );
}
