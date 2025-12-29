"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useKonvaStage } from "./hooks/useKonvaStage";
import { SelectionToolbar, ImageToolbar, ErrorToolbar } from "./components/Toolbar";
import { LAYOUT_CONSTANTS, ZOOM_CONSTANTS } from "./utils/konvaHelpers";

export type ImageItem =
  | { type: 'loading'; id: string; position?: { x: number; y: number } }
  | { type: 'uploading'; id: string; localUrl: string; position?: { x: number; y: number } }
  | { type: 'success'; id: string; url: string; position?: { x: number; y: number } }
  | { type: 'error'; id: string; error: string; position?: { x: number; y: number } };

export interface ResultPanelProps {
  images?: ImageItem[];
  onRegenerate?: () => void;
  onDownload?: (imageUrl: string) => void;
  onUpscale?: (imageUrl: string) => void;
  onImagePositionChange?: (id: string, position: { x: number; y: number }) => void;
  onDeleteError?: (id: string) => void;
  onPasteImageStart?: (id: string, localUrl: string) => void;
  onPasteImageComplete?: (id: string, url: string) => void;
  onPasteImageError?: (id: string, error: string) => void;
}

/**
 * 生成结果面板
 * 使用 Konva.js 画布引擎，支持图片拖动和缩放
 */
export function ResultPanel({
  images,
  onRegenerate,
  onDownload,
  onUpscale,
  onImagePositionChange,
  onDeleteError,
  onPasteImageStart,
  onPasteImageComplete,
  onPasteImageError,
}: ResultPanelProps) {
  const t = useTranslations("generator.resultPanel");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [globalZoom, setGlobalZoom] = useState(100);

  const {
    stageRef,
    layerRef,
    selectedImage,
    selectedImages,
    selectedErrorNode,
    imagesData,
    toolbarPos,
    setSelectedImage,
    setSelectedImages,
    setSelectedErrorNode,
    updateToolbarPosition,
    clearAllSelections,
  } = useKonvaStage(containerRef, images, onImagePositionChange);

  const isEmpty = !images || images.length === 0;

  // 禁止右键菜单
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    container.addEventListener('contextmenu', handleContextMenu);
    return () => container.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  // 复制选中图片到剪贴板
  const handleCopyImage = async () => {
    if (!selectedImage) {
      toast.error('请先选择图片');
      return;
    }

    const imageData = imagesData.get(selectedImage);
    if (!imageData?.url) {
      toast.error('图片数据不存在');
      return;
    }

    try {
      // 检查剪贴板 API 是否可用
      if (!navigator.clipboard) {
        toast.error('浏览器不支持剪贴板功能');
        return;
      }

      // 从 blob URL 获取 blob
      const response = await fetch(imageData.url);
      if (!response.ok) {
        throw new Error('Failed to fetch image');
      }

      const blob = await response.blob();

      // 如果是 JPEG 或其他不支持的格式，转换为 PNG
      let finalBlob = blob;
      if (blob.type !== 'image/png') {
        // 创建 Image 元素
        const img = new Image();
        const imageUrl = URL.createObjectURL(blob);

        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = imageUrl;
        });

        // 创建 Canvas 并绘制图片
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          throw new Error('Failed to get canvas context');
        }

        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(imageUrl);

        // 转换为 PNG blob
        finalBlob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to convert to PNG'));
            }
          }, 'image/png');
        });
      }

      // 写入剪贴板
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': finalBlob
        })
      ]);

      toast.success('图片已复制到剪贴板');
    } catch (error) {
      console.error('Failed to copy image:', error);
      toast.error('复制失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  // 键盘事件监听
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+C 或 Cmd+C
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && selectedImage) {
        e.preventDefault();
        handleCopyImage();
      }
    };

    const handlePaste = async (e: ClipboardEvent) => {
      if (!onPasteImageStart || !onPasteImageComplete || !onPasteImageError) return;

      const items = e.clipboardData?.items;
      if (!items) return;

      // 查找图片项
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          e.preventDefault();

          const file = item.getAsFile();
          if (!file) continue;

          const pasteId = `paste-${Date.now()}`;
          const localUrl = URL.createObjectURL(file);

          try {
            // 先显示本地图片预览（uploading 状态）
            onPasteImageStart(pasteId, localUrl);
            toast.loading('上传图片中...');

            // 上传图片
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/asset/upload', {
              method: 'POST',
              body: formData,
            });

            const result = await response.json() as
              | { success: true; data: { url: string } }
              | { success: false; error?: string };

            toast.dismiss();

            if (!result.success) {
              throw new Error(result.error || 'Upload failed');
            }

            // 上传成功，更新为真实 URL
            URL.revokeObjectURL(localUrl);
            onPasteImageComplete(pasteId, result.data.url);
            toast.success('图片已粘贴');
          } catch (error) {
            toast.dismiss();
            console.error('Paste image failed:', error);
            URL.revokeObjectURL(localUrl);
            const errorMsg = error instanceof Error ? error.message : '未知错误';
            onPasteImageError(pasteId, errorMsg);
            toast.error('粘贴失败: ' + errorMsg);
          }

          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('paste', handlePaste);
    };
  }, [selectedImage, imagesData, onPasteImageStart, onPasteImageComplete, onPasteImageError]);

  // 下载选中图片
  const handleDownloadSelected = () => {
    if (!selectedImage) return;
    const imageData = imagesData.get(selectedImage);
    if (imageData?.imageUrl) {
      onDownload?.(imageData.imageUrl);
    }
  };

  // 放大选中图片
  const handleUpscaleSelected = () => {
    if (!selectedImage) return;
    const imageData = imagesData.get(selectedImage);
    if (imageData?.imageUrl) {
      onUpscale?.(imageData.imageUrl);
    }
  };

  // 删除错误节点
  const handleDeleteError = () => {
    if (!selectedErrorNode) return;
    const nodeId = selectedErrorNode.name().replace('item-', '');
    onDeleteError?.(nodeId);
    setSelectedErrorNode(null);
  };

  // 整理图片
  const handleArrange = () => {
    if (!layerRef.current || !stageRef.current || selectedImages.length === 0) return;

    const layer = layerRef.current;

    const count = selectedImages.length;
    const cols = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / cols);

    const firstImg = selectedImages[0];
    const imgWidth = firstImg.width() * firstImg.scaleX();
    const imgHeight = firstImg.height() * firstImg.scaleY();

    // 计算起始位置（所有选中图片的左上角）
    let minX = Infinity;
    let minY = Infinity;
    selectedImages.forEach((img) => {
      minX = Math.min(minX, img.x());
      minY = Math.min(minY, img.y());
    });

    // 重新排列图片
    selectedImages.forEach((img, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;

      const x = minX + col * (imgWidth + LAYOUT_CONSTANTS.gridSpacing);
      const y = minY + row * (imgHeight + LAYOUT_CONSTANTS.gridSpacing);

      img.position({ x, y });

      // 更新位置到状态
      const nodeId = img.name().replace('item-', '');
      onImagePositionChange?.(nodeId, { x, y });
    });

    clearAllSelections();
    layer.draw();
  };

  // 全局缩放
  const handleGlobalZoomIn = () => {
    if (!stageRef.current) return;

    clearAllSelections();

    const stage = stageRef.current;
    const oldScale = stage.scaleX();
    const newZoom = Math.min(globalZoom + ZOOM_CONSTANTS.step, ZOOM_CONSTANTS.max);
    const newScale = newZoom / 100;

    // 以舞台中心为缩放原点
    const centerX = stage.width() / 2;
    const centerY = stage.height() / 2;

    // 计算缩放前后中心点对应的世界坐标
    const mousePointTo = {
      x: centerX / oldScale - stage.x() / oldScale,
      y: centerY / oldScale - stage.y() / oldScale,
    };

    // 计算新的位置以保持中心点不变
    const newPos = {
      x: centerX - mousePointTo.x * newScale,
      y: centerY - mousePointTo.y * newScale,
    };

    stage.scale({ x: newScale, y: newScale });
    stage.position(newPos);
    setGlobalZoom(newZoom);
    stage.batchDraw();
  };

  const handleGlobalZoomOut = () => {
    if (!stageRef.current) return;

    clearAllSelections();

    const stage = stageRef.current;
    const oldScale = stage.scaleX();
    const newZoom = Math.max(globalZoom - ZOOM_CONSTANTS.step, ZOOM_CONSTANTS.min);
    const newScale = newZoom / 100;

    // 以舞台中心为缩放原点
    const centerX = stage.width() / 2;
    const centerY = stage.height() / 2;

    // 计算缩放前后中心点对应的世界坐标
    const mousePointTo = {
      x: centerX / oldScale - stage.x() / oldScale,
      y: centerY / oldScale - stage.y() / oldScale,
    };

    // 计算新的位置以保持中心点不变
    const newPos = {
      x: centerX - mousePointTo.x * newScale,
      y: centerY - mousePointTo.y * newScale,
    };

    stage.scale({ x: newScale, y: newScale });
    stage.position(newPos);
    setGlobalZoom(newZoom);
    stage.batchDraw();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 bg-background"
      style={{ zIndex: 0 }}
    >
      {/* 全局缩放控制 */}
      {!isEmpty && (
        <div className="fixed top-4 right-20 z-30 flex items-center gap-2 bg-card/80 backdrop-blur-sm rounded-lg shadow-lg border border-border p-2">
          <button
            onClick={handleGlobalZoomOut}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-sidebar-hover"
          >
            <span className="text-lg font-medium">-</span>
          </button>
          <span className="text-sm font-medium min-w-[3rem] text-center">{globalZoom}%</span>
          <button
            onClick={handleGlobalZoomIn}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-sidebar-hover"
          >
            <span className="text-lg font-medium">+</span>
          </button>
        </div>
      )}

      {/* 画板区域 */}
      <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
        {/* 画布始终渲染 */}
        <div ref={containerRef} className="w-full h-full overflow-hidden" />

        {/* 空状态提示 - 覆盖在画布上方 */}
        {isEmpty && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/10">
                <span className="text-2xl text-muted">📷</span>
              </div>
              <p className="text-sm text-muted">生成结果会显示在这里</p>
            </div>
          </div>
        )}

        {/* 框选工具栏 - 显示整理 */}
        {selectedImages.length > 1 && toolbarPos && !isEmpty && (
          <SelectionToolbar position={toolbarPos} onArrange={handleArrange} />
        )}

        {/* 单个图片工具栏 */}
        {selectedImage && selectedImages.length === 1 && toolbarPos && !isEmpty && (
          <ImageToolbar
            position={toolbarPos}
            onDownload={handleDownloadSelected}
            onUpscale={handleUpscaleSelected}
          />
        )}

        {/* 错误节点工具栏 */}
        {selectedErrorNode && toolbarPos && !isEmpty && (
          <ErrorToolbar position={toolbarPos} onDelete={handleDeleteError} />
        )}
      </div>

      {/* 底部按钮 */}
      {selectedImage && !isEmpty && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-10">
          <button
            onClick={handleDownloadSelected}
            className={cn(
              "flex items-center justify-center gap-2 px-4 py-3 rounded-lg",
              "bg-primary text-white text-sm font-medium transition-all",
              "hover:bg-primary/90"
            )}
          >
            <Download className="h-4 w-4" />
            {t("download")}
          </button>

          <button
            onClick={onRegenerate}
            className={cn(
              "flex items-center justify-center gap-2 px-4 py-3 rounded-lg",
              "border border-border text-foreground text-sm font-medium transition-all",
              "hover:bg-sidebar-hover"
            )}
          >
            <RefreshCw className="h-4 w-4" />
            {t("regenerate")}
          </button>
        </div>
      )}
    </motion.div>
  );
}
