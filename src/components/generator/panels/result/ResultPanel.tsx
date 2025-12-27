"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Download, RefreshCw, ZoomIn, ZoomOut, X, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { loadImageAsBlob } from "@/lib/image-utils";
import Konva from "konva";

export interface ResultPanelProps {
  images?: string[];
  isLoading?: boolean;
  error?: string;
  onRegenerate?: () => void;
  onDownload?: (imageUrl: string) => void;
}

interface ImageData {
  url: string;
  imageUrl: string;
}

/**
 * 生成结果面板
 * 使用 Konva.js 画布引擎，支持图片拖动和缩放
 */
export function ResultPanel({
  images,
  isLoading = false,
  error,
  onRegenerate,
  onDownload,
}: ResultPanelProps) {
  const t = useTranslations("generator.resultPanel");

  // ==================== 状态管理 ====================
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<Konva.Stage | null>(null);
  const layerRef = useRef<Konva.Layer | null>(null);
  const [selectedImage, setSelectedImage] = useState<Konva.Image | null>(null);
  const [imagesData, setImagesData] = useState<Map<Konva.Image, ImageData>>(new Map());
  const [isStageReady, setIsStageReady] = useState(false);

  const isEmpty = !images || images.length === 0;

  // ==================== 舞台初始化 ====================
  useEffect(() => {
    if (!containerRef.current || stageRef.current) return;

    const container = containerRef.current;
    const initTimer = setTimeout(() => initStageWhenReady(), 0);

    function initStageWhenReady() {
      const width = container.clientWidth;
      const height = container.clientHeight;

      if (width === 0 || height === 0) {
        setTimeout(() => initStageWhenReady(), 100);
        return;
      }

      initStage();
    }

    function initStage() {
      const width = container.clientWidth;
      const height = container.clientHeight;

      if (width === 0 || height === 0) return;

      // 创建舞台
      const stage = new Konva.Stage({ container, width, height });
      const layer = new Konva.Layer();
      stage.add(layer);

      // 创建变换工具
      const transformer = createTransformer(layer);
      (stage as any).transformer = transformer;

      // 事件监听
      setupStageEvents(stage, transformer, layer);
      setupResizeObserver(stage, container);

      // 保存引用
      stageRef.current = stage;
      layerRef.current = layer;
      setIsStageReady(true);
    }

    return () => {
      clearTimeout(initTimer);
      if (stageRef.current) {
        stageRef.current.destroy();
        stageRef.current = null;
        layerRef.current = null;
      }
    };
  }, []);

  // ==================== 图片加载 ====================
  useEffect(() => {
    if (!isStageReady || !layerRef.current || !images || images.length === 0) return;

    const layer = layerRef.current;

    // 清空旧图片
    layer.children.forEach((child) => {
      if (child instanceof Konva.Image) {
        child.destroy();
      }
    });

    // 加载新图片
    images.forEach((imageUrl, index) => {
      loadImageAsBlob(imageUrl)
        .then((blob) => {
          const objectUrl = URL.createObjectURL(blob);
          const img = new Image();
          img.src = objectUrl;

          img.onload = () => {
            const konvaImage = createKonvaImage(img, index);
            setupImageEvents(konvaImage, layer);

            setImagesData((prev) => new Map(prev).set(konvaImage, { url: objectUrl, imageUrl }));
            layer.add(konvaImage);
            layer.draw();
          };

          img.onerror = () => {
            console.error(`Failed to load image element at index ${index}`);
          };
        })
        .catch((error) => {
          console.error(`Failed to load image at index ${index}:`, error);
        });
    });

    return () => {
      Array.from(imagesData.values()).forEach(({ url }) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [images, isStageReady]);

  // ==================== 工具函数 ====================
  function createTransformer(layer: Konva.Layer) {
    const transformer = new Konva.Transformer({
      enabledAnchors: ["top-left", "top-right", "bottom-left", "bottom-right"],
      anchorSize: 16,
      anchorCornerRadius: 8,
      borderStroke: "rgb(59, 130, 246)",
      borderStrokeWidth: 2,
      anchorFill: "rgb(59, 130, 246)",
      anchorStroke: "white",
      anchorStrokeWidth: 2,
      rotateEnabled: false,
    });
    layer.add(transformer);
    // 确保 Transformer 始终在最顶层，高于所有图片
    transformer.moveToTop();
    return transformer;
  }

  function setupStageEvents(stage: Konva.Stage, transformer: Konva.Transformer, layer: Konva.Layer) {
    stage.on("click", (e) => {
      if (e.target === stage) {
        setSelectedImage(null);
        transformer.nodes([]);
        layer.draw();
      }
    });
  }

  function setupResizeObserver(stage: Konva.Stage, container: HTMLDivElement) {
    const resizeObserver = new ResizeObserver(() => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      if (newWidth > 0 && newHeight > 0) {
        stage.width(newWidth);
        stage.height(newHeight);
      }
    });
    resizeObserver.observe(container);
  }

  function createKonvaImage(img: HTMLImageElement, index: number) {
    const maxWidth = 300;
    const maxHeight = 300;
    const scale = Math.min(maxWidth / img.width, maxHeight / img.height);

    return new Konva.Image({
      image: img,
      x: 100 + index * 50,
      y: 100 + index * 50,
      width: img.width,
      height: img.height,
      scaleX: scale,
      scaleY: scale,
      draggable: true,
      name: `image-${index}`,
    });
  }

  function setupImageEvents(konvaImage: Konva.Image, layer: Konva.Layer) {
    // 点击选中
    konvaImage.on("click", () => {
      const transformer = (stageRef.current as any)?.transformer;
      if (transformer) {
        transformer.nodes([konvaImage]);
        // 确保 Transformer 在最顶层
        transformer.moveToTop();
      }
      setSelectedImage(konvaImage);
      layer.draw();
    });

    // 拖动结束时限制边界
    konvaImage.on("dragend", () => {
      constrainImagePosition(konvaImage, layer);
    });
  }

  function constrainImagePosition(konvaImage: Konva.Image, layer: Konva.Layer) {
    const stage = stageRef.current!;
    const imageWidth = konvaImage.width() * konvaImage.scaleX();
    const imageHeight = konvaImage.height() * konvaImage.scaleY();

    let x = konvaImage.x();
    let y = konvaImage.y();

    // 限制水平边界
    if (x < 0) x = 0;
    if (x + imageWidth > stage.width()) x = stage.width() - imageWidth;

    // 限制垂直边界
    if (y < 0) y = 0;
    if (y + imageHeight > stage.height()) y = stage.height() - imageHeight;

    konvaImage.position({ x, y });
    layer.draw();
  }

  // ==================== 事件处理器 ====================
  const handleZoomIn = () => {
    if (!selectedImage || !layerRef.current) return;
    const scale = selectedImage.scaleX()! * 1.2;
    selectedImage.scale({ x: scale, y: scale });
    layerRef.current.draw();
  };

  const handleZoomOut = () => {
    if (!selectedImage || !layerRef.current) return;
    const scale = Math.max(selectedImage.scaleX()! * 0.8, 0.1);
    selectedImage.scale({ x: scale, y: scale });
    layerRef.current.draw();
  };

  const handleResetPosition = () => {
    if (!selectedImage || !layerRef.current) return;
    selectedImage.position({ x: 100, y: 100 });
    selectedImage.scale({ x: 0.25, y: 0.25 });
    selectedImage.rotation(0);
    layerRef.current.draw();
  };

  const handleDeleteImage = () => {
    if (!selectedImage || !layerRef.current) return;
    selectedImage.destroy();
    setSelectedImage(null);
    layerRef.current.draw();
  };

  const handleDownloadSelected = () => {
    if (!selectedImage) return;
    const imageData = imagesData.get(selectedImage);
    if (imageData?.imageUrl) {
      onDownload?.(imageData.imageUrl);
    }
  };

  // ==================== 渲染 ====================
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 bg-background"
      style={{ zIndex: 0 }}
    >
      {/* 画板区域 */}
      <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
        {isLoading && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="flex h-16 w-16 items-center justify-center"
          >
            <RefreshCw className="h-8 w-8 text-muted" />
          </motion.div>
        )}

        {error && (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
              <span className="text-2xl text-red-500">!</span>
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">{t("error")}</p>
              <p className="text-sm text-muted mt-2">{error}</p>
            </div>
          </div>
        )}

        {!isEmpty && !isLoading && !error && (
          <div ref={containerRef} className="w-full h-full overflow-hidden" />
        )}

        {isEmpty && !isLoading && !error && (
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/10">
              <span className="text-2xl text-muted">📷</span>
            </div>
            <p className="text-sm text-muted">生成结果会显示在这里</p>
          </div>
        )}
      </div>

      {/* 工具栏 */}
      {selectedImage && !isEmpty && !isLoading && !error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className="fixed top-8 left-1/2 transform -translate-x-1/2 flex gap-2 bg-card rounded-lg shadow-lg border border-border p-3 z-20"
        >
          <ToolbarButton onClick={handleZoomIn} icon={ZoomIn} title="放大" />
          <ToolbarButton onClick={handleZoomOut} icon={ZoomOut} title="缩小" />
          <div className="h-6 w-px bg-border" />
          <ToolbarButton onClick={handleResetPosition} icon={RotateCcw} title="重置位置" />
          <ToolbarButton onClick={handleDeleteImage} icon={X} title="删除" />
        </motion.div>
      )}

      {/* 底部按钮 */}
      {selectedImage && !isEmpty && !isLoading && !error && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-10">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownloadSelected}
            className={cn(
              "flex items-center justify-center gap-2 px-4 py-3 rounded-lg",
              "bg-primary text-white text-sm font-medium transition-all",
              "hover:bg-primary/90"
            )}
          >
            <Download className="h-4 w-4" />
            {t("download")}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRegenerate}
            className={cn(
              "flex items-center justify-center gap-2 px-4 py-3 rounded-lg",
              "border border-border text-foreground text-sm font-medium transition-all",
              "hover:bg-sidebar-hover"
            )}
          >
            <RefreshCw className="h-4 w-4" />
            {t("regenerate")}
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}

// ==================== 子组件 ====================
interface ToolbarButtonProps {
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
}

function ToolbarButton({ onClick, icon: Icon, title }: ToolbarButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-2 px-3 py-2 rounded-md",
        "text-foreground transition-colors",
        "hover:bg-sidebar-hover"
      )}
      title={title}
    >
      <Icon className="h-4 w-4" />
    </motion.button>
  );
}
