"use client";

import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ImageUploadButtonProps {
  onClick?: () => void;
  uploadImages?: string[];
  maxUploadCount?: number;
  onRemoveImage?: (index: number) => void;
  onImageClick?: (imageUrl: string, index: number) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ImageUploadButton({
  onClick,
  uploadImages = [],
  maxUploadCount = 5,
  onRemoveImage,
  onImageClick,
  size = "md",
  className,
}: ImageUploadButtonProps) {
  const uploadCount = uploadImages.length;
  const isMaxReached = uploadCount >= maxUploadCount;

  // 小尺寸按钮（移动端）- 总是可点击的，用于上传或管理图片
  if (size === "sm") {
    return (
      <motion.button
        onClick={onClick}
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
        <Plus className="h-5 w-5 text-muted" />
        {uploadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary text-white text-xs font-semibold flex items-center justify-center"
          >
            {uploadCount}
          </motion.div>
        )}
      </motion.button>
    );
  }

  // 大尺寸 - 真正的堆叠卡片设计（从左往右堆叠，露出25%）
  const cardSize = 96; // 24 * 4 = 96px (w-24)
  const exposedWidth = Math.round(cardSize * 0.25); // 露出25%，约24px
  const visibleCards = Math.min(uploadImages.length, 4);
  // 计算堆叠区域总宽度：(可见卡片数-1) * 露出宽度 + 完整卡片宽度
  const stackWidth = visibleCards > 0 ? (visibleCards - 1) * exposedWidth + cardSize : 0;

  return (
    <div className={cn("flex items-end gap-2", className)}>
      {/* 堆叠卡片区域 */}
      {uploadImages.length > 0 && (
        <div
          className="relative"
          style={{ width: stackWidth, height: cardSize }}
        >
          {uploadImages.slice(0, 4).map((imageUrl, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -Math.round(cardSize * 0.25) }}
              onClick={() => onImageClick?.(imageUrl, idx)}
              className="absolute w-24 h-24 rounded-xl overflow-hidden border-2 border-card group cursor-pointer"
              style={{
                left: idx * exposedWidth,
                zIndex: idx + 1, // 从左到右，越往右层级越高
              }}
            >
              <img
                src={imageUrl}
                alt={`Uploaded ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              {/* 删除按钮 - 显示在所有图片的左上角 */}
              <div
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onRemoveImage?.(idx);
                }}
                className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-black/70 hover:bg-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <X className="w-3 h-3 text-white" />
              </div>
            </motion.div>
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
