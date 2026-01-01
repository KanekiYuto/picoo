"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import { ImageUploadButton } from "../../buttons/ImageUploadButton";
import type { GeneratorMode } from "../../config";

interface MobileImagePanelProps {
  uploadImages: string[];
  mode: GeneratorMode;
  onClose: () => void;
  onOpenUploadPanel: () => void;
  onRemoveImage: (index: number) => void;
  onImageClick: (imageUrl: string, index: number) => void;
  onOpenUploadPanelForReplace: (index: number) => void;
}

export function MobileImagePanel({
  uploadImages,
  mode,
  onClose,
  onOpenUploadPanel,
  onRemoveImage,
  onImageClick,
  onOpenUploadPanelForReplace,
}: MobileImagePanelProps) {
  return (
    <motion.div
      key="mobile-images"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <div className="bg-background rounded-2xl p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">图片管理</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-sidebar-hover hover:text-foreground cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {/* 图片堆叠 */}
          <div className="flex items-center justify-center">
            <ImageUploadButton
              size="lg"
              uploadImages={uploadImages}
              onClick={onOpenUploadPanel}
              onRemoveImage={onRemoveImage}
              onImageClick={onImageClick}
              onOpenUploadPanelForReplace={onOpenUploadPanelForReplace}
              mode={mode}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
