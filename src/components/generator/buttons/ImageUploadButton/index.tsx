"use client";

import { SmallButton } from "./SmallButton";
import { TextToImagePlaceholder } from "./TextToImagePlaceholder";
import { SingleImageUpload } from "./SingleImageUpload";
import { MultiImageStackUpload } from "./MultiImageStackUpload";

interface ImageUploadButtonProps {
  onClick?: () => void;
  uploadImages?: string[];
  onRemoveImage?: (index: number) => void;
  onImageClick?: (imageUrl: string, index: number) => void;
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

    return (
      <SmallButton
        uploadImages={uploadImages}
        onClick={onClick}
        onOpenMobileImagePanel={onOpenMobileImagePanel}
        className={className}
      />
    );
  }

  // text-to-image 模式不需要上传图片
  if (mode === "text-to-image") {
    return <TextToImagePlaceholder className={className} />;
  }

  // upscale 或 remove-watermark - 单图模式
  if (mode === "upscale" || mode === "remove-watermark") {
    return (
      <SingleImageUpload
        uploadImages={uploadImages}
        onClick={onClick}
        onRemoveImage={onRemoveImage}
        onImageClick={onImageClick}
        className={className}
      />
    );
  }

  // edit-image 模式 - 多图堆叠卡片设计
  return (
    <MultiImageStackUpload
      uploadImages={uploadImages}
      onClick={onClick}
      onRemoveImage={onRemoveImage}
      onImageClick={onImageClick}
      className={className}
    />
  );
}
