"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Download, RefreshCw, Grid3x3 } from "lucide-react";
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
  const selectionBoxRef = useRef<Konva.Rect | null>(null);
  const selectionStartRef = useRef<{ x: number; y: number } | null>(null);
  const groupRef = useRef<Konva.Group | null>(null);
  const [selectedImage, setSelectedImage] = useState<Konva.Image | null>(null);
  const [selectedImages, setSelectedImages] = useState<Konva.Image[]>([]);
  const [imagesData, setImagesData] = useState<Map<Konva.Image, ImageData>>(new Map());
  const [isStageReady, setIsStageReady] = useState(false);
  const [toolbarPos, setToolbarPos] = useState<{ x: number; y: number } | null>(null);
  const [globalZoom, setGlobalZoom] = useState(100);

  const isEmpty = !images || images.length === 0;

  // ==================== 辅助函数 ====================
  // 计算工具栏位置
  const calculateToolbarPosition = (rect: { x: number; y: number }) => {
    if (!containerRef.current) return null;
    const containerRect = containerRef.current.getBoundingClientRect();
    const toolbarHeight = 56;
    const spacing = 12;
    return {
      x: rect.x - containerRect.left,
      y: rect.y - containerRect.top - toolbarHeight - spacing,
    };
  };

  // 更新工具栏位置
  const updateToolbarPosition = () => {
    if (!stageRef.current || !containerRef.current) return;

    let targetNode: Konva.Node | null = null;
    const transformer = (stageRef.current as any)?.transformer;

    // 优先使用 Group
    if (groupRef.current && selectedImages.length > 1) {
      targetNode = groupRef.current;
    }
    // 多个图片被选中但还没有 Group
    else if (selectedImages.length > 1 && transformer?.nodes().length > 0) {
      const pos = calculateToolbarPosition(transformer.getClientRect());
      setToolbarPos(pos);
      return;
    }
    // 单个图片被选中
    else if (selectedImage) {
      targetNode = selectedImage;
    }

    if (targetNode) {
      const pos = calculateToolbarPosition(targetNode.getClientRect());
      setToolbarPos(pos);
    } else {
      setToolbarPos(null);
    }
  };

  // 监听选中状态变化，更新工具栏位置
  useEffect(() => {
    updateToolbarPosition();
  }, [selectedImage, selectedImages, groupRef.current]);

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

  // ==================== Konva 初始化函数 ====================
  function createTransformer(layer: Konva.Layer) {
    const transformer = new Konva.Transformer({
      enabledAnchors: ["top-left", "top-right", "bottom-left", "bottom-right"],
      anchorSize: 10,
      anchorCornerRadius: 10,
      borderStroke: "#4b5cc4",
      borderStrokeWidth: 3,
      anchorFill: "#ffffff",
      anchorStroke: "#4b5cc4",
      anchorStrokeWidth: 3,
      rotateEnabled: false,
    });
    layer.add(transformer);
    // 确保 Transformer 始终在最顶层，高于所有图片
    transformer.moveToTop();
    return transformer;
  }

  function setupStageEvents(stage: Konva.Stage, transformer: Konva.Transformer, layer: Konva.Layer) {
    // Transformer 变换事件
    transformer.on("transformend", () => {
      updateToolbarPosition();
    });

    transformer.on("transform", () => {
      updateToolbarPosition();
    });

    // 点击空白区域只取消选择，不解散 Group
    stage.on("click", (e) => {
      if (e.target === stage) {
        setSelectedImage(null);
        setSelectedImages([]);
        transformer.nodes([]);
        layer.draw();
      }
    });

    // 框选逻辑
    stage.on("mousedown", (e) => {
      // 仅在点击空白区域时开始框选
      if (e.target !== stage) return;

      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      selectionStartRef.current = { x: pointer.x, y: pointer.y };

      // 创建选择框
      if (!selectionBoxRef.current) {
        const selectionBox = new Konva.Rect({
          x: pointer.x,
          y: pointer.y,
          width: 0,
          height: 0,
          fill: "rgba(75, 92, 196, 0.1)",
          stroke: "#4b5cc4",
          strokeWidth: 2,
          name: "selection-box",
        });
        layer.add(selectionBox);
        selectionBoxRef.current = selectionBox;
      }
    });

    stage.on("mousemove", (e) => {
      if (!selectionStartRef.current || !selectionBoxRef.current) return;

      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const startX = selectionStartRef.current.x;
      const startY = selectionStartRef.current.y;
      const currentX = pointer.x;
      const currentY = pointer.y;

      // 更新选择框大小
      selectionBoxRef.current.setAttrs({
        x: Math.min(startX, currentX),
        y: Math.min(startY, currentY),
        width: Math.abs(currentX - startX),
        height: Math.abs(currentY - startY),
      });

      layer.draw();
    });

    stage.on("mouseup", () => {
      if (!selectionBoxRef.current || !selectionStartRef.current) return;

      const selectionBox = selectionBoxRef.current;
      const boxX = selectionBox.x();
      const boxY = selectionBox.y();
      const boxWidth = selectionBox.width();
      const boxHeight = selectionBox.height();

      // 检测框内的图片
      const selectedList: Konva.Image[] = [];

      layer.children.forEach((child) => {
        if (!(child instanceof Konva.Image) || child.name().startsWith("selection")) return;

        const imageX = child.x();
        const imageY = child.y();
        const imageWidth = child.width() * child.scaleX();
        const imageHeight = child.height() * child.scaleY();

        // 检查图片是否在框选区域内
        if (
          imageX >= boxX &&
          imageY >= boxY &&
          imageX + imageWidth <= boxX + boxWidth &&
          imageY + imageHeight <= boxY + boxHeight
        ) {
          selectedList.push(child);
        }
      });

      // 移除选择框
      selectionBoxRef.current.destroy();
      selectionBoxRef.current = null;
      selectionStartRef.current = null;

      // 框选完成后，直接选中图片，不创建 Group
      if (selectedList.length > 0) {
        transformer.nodes(selectedList);
        transformer.moveToTop();
        setSelectedImages(selectedList);
        setSelectedImage(null);
        updateToolbarPosition();
      } else {
        setSelectedImages([]);
        transformer.nodes([]);
      }

      layer.draw();
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
      // 如果点击的图片在 Group 中，则选中整个 Group
      if (konvaImage.parent && konvaImage.parent.name() === "images-group") {
        const transformer = (stageRef.current as any)?.transformer;
        if (transformer) {
          transformer.nodes([konvaImage.parent]);
          transformer.moveToTop();
        }
      } else {
        const transformer = (stageRef.current as any)?.transformer;
        if (transformer) {
          transformer.nodes([konvaImage]);
          transformer.moveToTop();
        }
      }
      setSelectedImage(konvaImage);
      setSelectedImages([konvaImage]);
      layer.draw();
      updateToolbarPosition();
    });

    // 拖动结束时限制边界
    konvaImage.on("dragend", () => {
      // 如果图片在 Group 中，约束 Group
      if (konvaImage.parent && konvaImage.parent.name() === "images-group") {
        constrainGroupPosition(konvaImage.parent as Konva.Group, layer);
      } else {
        constrainImagePosition(konvaImage, layer);
      }
      updateToolbarPosition();
    });

    // 拖动时更新工具栏位置
    konvaImage.on("dragmove", () => {
      updateToolbarPosition();
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

  function constrainGroupPosition(group: Konva.Group, layer: Konva.Layer) {
    const stage = stageRef.current!;

    // 计算 Group 的总体边界
    const groupBounds = group.getClientRect();
    const groupX = group.x();
    const groupY = group.y();
    const groupWidth = groupBounds.width;
    const groupHeight = groupBounds.height;

    let x = groupX;
    let y = groupY;

    // 限制水平边界
    if (x < 0) x = 0;
    if (x + groupWidth > stage.width()) x = stage.width() - groupWidth;

    // 限制垂直边界
    if (y < 0) y = 0;
    if (y + groupHeight > stage.height()) y = stage.height() - groupHeight;

    group.position({ x, y });
    layer.draw();
  }

  // ==================== 事件处理器 ====================
  const handleDownloadSelected = () => {
    if (!selectedImage) return;
    const imageData = imagesData.get(selectedImage);
    if (imageData?.imageUrl) {
      onDownload?.(imageData.imageUrl);
    }
  };

  const handleAutoLayout = () => {
    if (!layerRef.current || !stageRef.current || selectedImages.length === 0) return;

    const layer = layerRef.current;
    const transformer = (stageRef.current as any)?.transformer;

    // 如果 Group 不存在，创建 Group
    if (!groupRef.current) {
      // 计算组的初始位置（最左上的图片）
      let minX = Infinity;
      let minY = Infinity;
      selectedImages.forEach((img) => {
        minX = Math.min(minX, img.x());
        minY = Math.min(minY, img.y());
      });

      // 创建新的 Group
      const group = new Konva.Group({
        name: "images-group",
        draggable: true,
        x: minX,
        y: minY,
      });

      // 将选中的图片转移到 Group 中
      selectedImages.forEach((img) => {
        const originalX = img.x();
        const originalY = img.y();

        img.remove();
        img.draggable(false);

        // 相对于 Group 重新定位
        img.position({
          x: originalX - minX,
          y: originalY - minY,
        });

        group.add(img);
      });

      // 添加 Group 到 layer
      layer.add(group);

      // 为 Group 设置 Transformer
      if (transformer) {
        transformer.nodes([group]);
        transformer.moveToTop();
      }

      // 为 Group 添加拖动事件
      group.on("dragend", () => {
        constrainGroupPosition(group, layer);
        updateToolbarPosition();
      });

      group.on("dragmove", () => {
        updateToolbarPosition();
      });

      groupRef.current = group;
    }

    const group = groupRef.current;

    // 计算最优的行列数（尽量接近正方形）
    const groupChildren = group.children.filter((child) => child instanceof Konva.Image) as Konva.Image[];
    if (groupChildren.length === 0) return;

    const count = groupChildren.length;
    const cols = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / cols);

    // 定义间距
    const padding = 20;
    const spacing = 20;

    const firstImg = groupChildren[0];
    const imgWidth = firstImg.width() * firstImg.scaleX();
    const imgHeight = firstImg.height() * firstImg.scaleY();

    // 计算 Group 的总宽高
    const totalWidth = cols * (imgWidth + spacing) - spacing + padding * 2;
    const totalHeight = rows * (imgHeight + spacing) - spacing + padding * 2;

    // 添加背景矩形（如果还没有）
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
      // 将背景插入到最前面
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

    // 重新排列每个图片
    groupChildren.forEach((img, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;

      const x = padding + col * (imgWidth + spacing);
      const y = padding + row * (imgHeight + spacing);

      img.position({ x, y });

      // 为 Group 内的图片添加点击事件，显示选中边框
      img.off("click"); // 先移除旧事件
      img.on("click", (e) => {
        e.cancelBubble = true; // 阻止事件冒泡到 Group
        setSelectedImage(img);
        setSelectedImages([img]);

        // 使用 Transformer 仅显示选中边框，不显示缩放锚点
        if (transformer) {
          transformer.nodes([img]);
          transformer.enabledAnchors([]);
          transformer.rotateEnabled(false);
          transformer.moveToTop();
        }
        updateToolbarPosition();
      });
    });

    // 取消 Transformer 选中
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
      {/* 全局缩放控制 */}
      {!isEmpty && !isLoading && !error && (
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

        {/* 框选工具栏 - 显示自动布局 */}
        {selectedImages.length > 1 && toolbarPos && !isEmpty && !isLoading && !error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute flex gap-1 bg-card/80 backdrop-blur-sm rounded-lg shadow-lg border border-border p-2 z-20"
            style={{
              left: `${toolbarPos.x}px`,
              top: `${toolbarPos.y}px`,
            }}
          >
            <ToolbarButton onClick={handleAutoLayout} icon={Grid3x3} title="自动布局" />
          </motion.div>
        )}

        {/* 单个图片工具栏 */}
        {selectedImage && selectedImages.length === 1 && toolbarPos && !isEmpty && !isLoading && !error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute flex gap-1 bg-card/80 backdrop-blur-sm rounded-lg shadow-lg border border-border p-2 z-20"
            style={{
              left: `${toolbarPos.x}px`,
              top: `${toolbarPos.y}px`,
            }}
          >
            <ToolbarButton onClick={handleDownloadSelected} icon={Download} title="下载" />
          </motion.div>
        )}
      </div>

      {/* 底部按钮 */}
      {selectedImage && !isEmpty && !isLoading && !error && (
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

// ==================== 子组件 ====================
interface ToolbarButtonProps {
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
}

function ToolbarButton({ onClick, icon: Icon, title }: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-2 px-2.5 py-2 rounded-md",
        "text-foreground text-sm transition-colors",
        "hover:bg-sidebar-hover"
      )}
      title={title}
    >
      <Icon className="h-4 w-4" />
      <span>{title}</span>
    </button>
  );
}
