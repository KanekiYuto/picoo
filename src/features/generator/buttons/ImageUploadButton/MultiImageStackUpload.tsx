"use client";

import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface MultiImageStackUploadProps {
  uploadImages: string[];
  onClick?: () => void;
  onRemoveImage?: (index: number) => void;
  onImageClick?: (imageUrl: string, index: number) => void;
  className?: string;
}

export function MultiImageStackUpload({
  uploadImages,
  onClick,
  onRemoveImage,
  onImageClick,
  className,
}: MultiImageStackUploadProps) {
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
                  onClick={() => onImageClick?.(imageUrl, idx)}
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
