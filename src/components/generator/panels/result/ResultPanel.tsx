"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Download, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import Konva from "konva";
import { cn } from "@/lib/utils";
import { useKonvaStage } from "./hooks/useKonvaStage";
import { SelectionToolbar, ImageToolbar, ErrorToolbar } from "./components/Toolbar";
import { constrainGroupPosition } from "./utils/konvaHelpers";

export type ImageItem =
  | { type: 'loading'; id: string }
  | { type: 'success'; id: string; url: string }
  | { type: 'error'; id: string; error: string };

export interface ResultPanelProps {
  images?: ImageItem[];
  onRegenerate?: () => void;
  onDownload?: (imageUrl: string) => void;
}

/**
 * 生成结果面板
 * 使用 Konva.js 画布引擎，支持图片拖动和缩放
 */
export function ResultPanel({
  images,
  onRegenerate,
  onDownload,
}: ResultPanelProps) {
  const t = useTranslations("generator.resultPanel");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [globalZoom, setGlobalZoom] = useState(100);

  const {
    stageRef,
    layerRef,
    groupRef,
    selectedImage,
    selectedImages,
    selectedErrorNode,
    imagesData,
    toolbarPos,
    setSelectedErrorNode,
    updateToolbarPosition,
  } = useKonvaStage(containerRef, images);

  const isEmpty = !images || images.length === 0;

  // 下载选中图片
  const handleDownloadSelected = () => {
    if (!selectedImage) return;
    const imageData = imagesData.get(selectedImage);
    if (imageData?.imageUrl) {
      onDownload?.(imageData.imageUrl);
    }
  };

  // 删除错误节点
  const handleDeleteError = () => {
    if (!selectedErrorNode || !layerRef.current) return;
    selectedErrorNode.destroy();
    setSelectedErrorNode(null);
    layerRef.current.draw();
  };

  // 自动布局
  const handleAutoLayout = () => {
    if (!layerRef.current || !stageRef.current || selectedImages.length === 0) return;

    const layer = layerRef.current;
    const transformer = (stageRef.current as any)?.transformer;

    // 如果 Group 不存在，创建 Group
    if (!groupRef.current) {
      let minX = Infinity;
      let minY = Infinity;
      selectedImages.forEach((img) => {
        minX = Math.min(minX, img.x());
        minY = Math.min(minY, img.y());
      });

      const group = new Konva.Group({
        name: "images-group",
        draggable: true,
        x: minX,
        y: minY,
      });

      selectedImages.forEach((img) => {
        const originalX = img.x();
        const originalY = img.y();

        img.remove();
        img.draggable(false);

        img.position({
          x: originalX - minX,
          y: originalY - minY,
        });

        group.add(img);
      });

      layer.add(group);

      if (transformer) {
        transformer.nodes([group]);
        transformer.moveToTop();
      }

      group.on("dragend", () => {
        if (stageRef.current) {
          constrainGroupPosition(group, stageRef.current, layer);
        }
        updateToolbarPosition();
      });

      group.on("dragmove", updateToolbarPosition);

      groupRef.current = group;
    }

    const group = groupRef.current;
    const groupChildren = group.children.filter((child) => child instanceof Konva.Image) as Konva.Image[];
    if (groupChildren.length === 0) return;

    const count = groupChildren.length;
    const cols = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / cols);

    const padding = 20;
    const spacing = 20;

    const firstImg = groupChildren[0];
    const imgWidth = firstImg.width() * firstImg.scaleX();
    const imgHeight = firstImg.height() * firstImg.scaleY();

    const totalWidth = cols * (imgWidth + spacing) - spacing + padding * 2;
    const totalHeight = rows * (imgHeight + spacing) - spacing + padding * 2;

    let bgRect = group.children.find((child) => child.name() === "bg-rect") as Konva.Rect | undefined;
    if (!bgRect) {
      bgRect = new Konva.Rect({
        name: "bg-rect",
        x: 0,
        y: 0,
        width: totalWidth,
        height: totalHeight,
        fill: "#262626",
        stroke: "#4b5cc4",
        strokeWidth: 2,
        cornerRadius: 8,
      });
      group.add(bgRect);
      bgRect.moveToBottom();
    } else {
      bgRect.setAttrs({
        x: 0,
        y: 0,
        width: totalWidth,
        height: totalHeight,
      });
    }

    groupChildren.forEach((img, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;

      const x = padding + col * (imgWidth + spacing);
      const y = padding + row * (imgHeight + spacing);

      img.position({ x, y });

      img.off("click");
      img.on("click", (e) => {
        e.cancelBubble = true;

        if (transformer) {
          transformer.nodes([img]);
          transformer.enabledAnchors([]);
          transformer.rotateEnabled(false);
          transformer.moveToTop();
        }
        updateToolbarPosition();
      });
    });

    if (transformer) {
      transformer.nodes([]);
    }

    layer.draw();
    updateToolbarPosition();
  };

  // 全局缩放
  const handleGlobalZoomIn = () => {
    if (!stageRef.current) return;
    const newZoom = Math.min(globalZoom + 10, 200);
    setGlobalZoom(newZoom);
    const scale = newZoom / 100;
    stageRef.current.scale({ x: scale, y: scale });
    stageRef.current.batchDraw();
  };

  const handleGlobalZoomOut = () => {
    if (!stageRef.current) return;
    const newZoom = Math.max(globalZoom - 10, 10);
    setGlobalZoom(newZoom);
    const scale = newZoom / 100;
    stageRef.current.scale({ x: scale, y: scale });
    stageRef.current.batchDraw();
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

        {/* 框选工具栏 - 显示自动布局 */}
        {selectedImages.length > 1 && toolbarPos && !isEmpty && (
          <SelectionToolbar position={toolbarPos} onAutoLayout={handleAutoLayout} />
        )}

        {/* 单个图片工具栏 */}
        {selectedImage && selectedImages.length === 1 && toolbarPos && !isEmpty && (
          <ImageToolbar position={toolbarPos} onDownload={handleDownloadSelected} />
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
