"use client";

import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface SingleImageUploadProps {
  uploadImages: string[];
  onClick?: () => void;
  onRemoveImage?: (index: number) => void;
  onImageClick?: (imageUrl: string, index: number) => void;
  className?: string;
}

export function SingleImageUpload({
  uploadImages,
  onClick,
  onRemoveImage,
  onImageClick,
  className,
}: SingleImageUploadProps) {
  const hasImage = uploadImages.length > 0;
  const imageUrl = uploadImages[0];

  return (
    <div className={cn("flex items-end gap-2", className)}>
      {hasImage ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => onImageClick?.(imageUrl, 0)}
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
