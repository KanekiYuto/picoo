"use client";

import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface ImageUploadButtonProps {
  onClick?: () => void;
  uploadImages?: string[];
  onRemoveImage?: (index: number) => void;
  onImageClick?: (imageUrl: string, index: number) => void;
  onOpenUploadPanelForReplace?: (index: number) => void;
  onOpenMobileImagePanel?: () => void;
  size?: "sm" | "md" | "lg";
  className?: string;
  mode: "text-to-image" | "upscale" | "edit-image" | "remove-watermark";
}

export function ImageUploadButton({
  onClick,
  uploadImages = [],
  onRemoveImage,
  onImageClick,
  onOpenUploadPanelForReplace,
  onOpenMobileImagePanel,
  size = "md",
  className,
  mode,
}: ImageUploadButtonProps) {
  // 小尺寸按钮（移动端）- 总是可点击的，用于上传或管理图片
  if (size === "sm") {
    // text-to-image 模式不需要上传图片
    if (mode === "text-to-image") {
      return null;
    }

    const hasImages = uploadImages.length > 0;

    return (
      <motion.button
        onClick={() => {
          if (hasImages) {
            onOpenMobileImagePanel?.();
          } else {
            onClick?.();
          }
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "relative flex items-center justify-center flex-shrink-0 cursor-pointer",
          "w-10 h-10 rounded-xl",
          "border-2 border-dashed border-border",
          "bg-sidebar-hover hover:bg-sidebar-active",
          "transition-all duration-300",
          className
        )}
      >
        <Plus className="h-5 w-5 text-muted-foreground" />
        {uploadImages.length > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary text-white text-xs font-semibold flex items-center justify-center"
          >
            {uploadImages.length}
          </motion.div>
        )}
      </motion.button>
    );
  }

  // text-to-image 模式不需要上传图片
  if (mode === "text-to-image") {
    return (
      <div className={cn("flex h-24 w-24 items-center justify-center rounded-xl border-2 border-dashed border-border/35 bg-muted/10", className)}>
        <div className="flex flex-col items-center gap-1">
          <Plus className="h-6 w-6 text-muted-foreground/45 rotate-45" />
          <span className="text-[10px] font-medium text-muted-foreground/45">无需图片</span>
        </div>
      </div>
    );
  }

  // upscale 或 remove-watermark - 单图模式
  if (mode === "upscale" || mode === "remove-watermark") {
    const hasImage = uploadImages.length > 0;
    const imageUrl = uploadImages[0];
    const isMaxReached = uploadImages.length >= 1;

    return (
      <div className={cn("flex items-end gap-2", className)}>
        {hasImage ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => onOpenUploadPanelForReplace?.(0)}
                className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-card group cursor-pointer"
              >
                <img
                  src={imageUrl}
                  alt="Uploaded"
                  className="w-full h-full object-cover"
                />
                {/* 删除按钮 - 移动端始终显示，桌面端 hover 显示 */}
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onRemoveImage?.(0);
                  }}
                  className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center md:opacity-0 md:group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <X className="w-3 h-3 text-white" />
                </div>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent side="top" className="p-0 !bg-background border-0 shadow-lg">
              <div className="p-2 rounded-lg bg-card">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-48 h-48 rounded-lg object-cover"
                />
              </div>
            </TooltipContent>
          </Tooltip>
        ) : (
          <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center flex-shrink-0 cursor-pointer w-24 h-24 rounded-xl border-2 border-dashed border-border bg-sidebar-hover hover:bg-sidebar-active transition-all duration-300"
          >
            <Plus className="h-7 w-7 text-muted-foreground" />
          </motion.button>
        )}
      </div>
    );
  }

  // edit-image 模式 - 多图堆叠卡片设计
  const cardSize = 96; // 24 * 4 = 96px (w-24)
  const exposedWidth = Math.round(cardSize * 0.4); // 露出40%，约38px
  const visibleCards = Math.min(uploadImages.length, 4);
  // 计算堆叠区域总宽度：(可见卡片数-1) * 露出宽度 + 完整卡片宽度
  const stackWidth = visibleCards > 0 ? (visibleCards - 1) * exposedWidth + cardSize : 0;
  const isMaxReached = uploadImages.length >= 4;

  return (
    <div className={cn("flex items-end gap-2", className)}>
      {/* 堆叠卡片区域 */}
      {uploadImages.length > 0 && (
        <div
          className="relative"
          style={{ width: stackWidth, height: cardSize }}
        >
          {uploadImages.slice(0, 4).map((imageUrl, idx) => (
            <Tooltip key={idx}>
              <TooltipTrigger asChild>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => onOpenUploadPanelForReplace?.(idx)}
                  className="absolute w-24 h-24 rounded-xl overflow-hidden border-2 border-card group cursor-pointer"
                  style={{
                    left: idx * exposedWidth,
                    zIndex: idx + 1,
                  }}
                >
                  <img
                    src={imageUrl}
                    alt={`Uploaded ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {/* 删除按钮 - 移动端始终显示，桌面端 hover 显示 */}
                  <div
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onRemoveImage?.(idx);
                    }}
                    className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center md:opacity-0 md:group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <X className="w-3 h-3 text-white" />
                  </div>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent side="top" className="!bg-background">
                <img
                  src={imageUrl}
                  alt={`Preview ${idx + 1}`}
                  className="w-48 h-48 rounded-lg object-cover"
                />
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      )}

      {/* 添加按钮 */}
      {!isMaxReached && (
        <motion.button
          onClick={onClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center justify-center flex-shrink-0 cursor-pointer w-24 h-24 rounded-xl border-2 border-dashed border-border bg-sidebar-hover hover:bg-sidebar-active transition-all duration-300"
        >
          <Plus className="h-7 w-7 text-muted" />
        </motion.button>
      )}
    </div>
  );
}
