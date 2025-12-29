import { useEffect, useRef, useState } from "react";
import Konva from "konva";
import { loadImageAsBlob } from "@/lib/image-utils";
import type { ImageItem } from "../ResultPanel";
import {
  constrainImagePosition,
  constrainGroupPosition,
  calculateToolbarPosition,
  calculateImageScale,
  getNodePosition,
  LAYOUT_CONSTANTS,
} from "../utils/konvaHelpers";
import { createLoadingPlaceholder, createErrorPlaceholder } from "../components/Placeholders";

// 扩展 Konva 类型以包含自定义属性
interface StageWithTransformer extends Konva.Stage {
  transformer?: Konva.Transformer;
}

interface NodeWithAnimation extends Konva.Node {
  textAnimation?: Konva.Animation;
}

interface ImageData {
  url: string;
  imageUrl: string;
}

export function useKonvaStage(
  containerRef: React.RefObject<HTMLDivElement | null>,
  images?: ImageItem[],
  onImagePositionChange?: (id: string, position: { x: number; y: number }) => void
) {
  const stageRef = useRef<StageWithTransformer | null>(null);
  const layerRef = useRef<Konva.Layer | null>(null);
  const selectionBoxRef = useRef<Konva.Rect | null>(null);
  const selectionStartRef = useRef<{ x: number; y: number } | null>(null);
  const loadingIdsRef = useRef<Set<string>>(new Set());
  const resizeObserverCleanupRef = useRef<(() => void) | null>(null);

  const [selectedImage, setSelectedImage] = useState<Konva.Image | null>(null);
  const [selectedImages, setSelectedImages] = useState<Konva.Image[]>([]);
  const [selectedErrorNode, setSelectedErrorNode] = useState<Konva.Group | null>(null);
  const [imagesData, setImagesData] = useState<Map<Konva.Image, ImageData>>(new Map());
  const [isStageReady, setIsStageReady] = useState(false);
  const [toolbarPos, setToolbarPos] = useState<{ x: number; y: number } | null>(null);

  // 更新工具栏位置
  const updateToolbarPosition = () => {
    if (!stageRef.current || !containerRef.current) return;

    let targetNode: Konva.Node | null = null;
    const transformer = stageRef.current.transformer;

    // 优先使用错误节点
    if (selectedErrorNode) {
      targetNode = selectedErrorNode;
    }
    // 多个图片被选中
    else if (selectedImages.length > 1 && transformer?.nodes().length > 0) {
      const pos = calculateToolbarPosition(
        transformer.getClientRect(),
        containerRef.current.getBoundingClientRect()
      );
      setToolbarPos(pos);
      return;
    }
    // 单个图片被选中
    else if (selectedImage) {
      targetNode = selectedImage;
    }

    if (targetNode) {
      const pos = calculateToolbarPosition(
        targetNode.getClientRect(),
        containerRef.current.getBoundingClientRect()
      );
      setToolbarPos(pos);
    } else {
      setToolbarPos(null);
    }
  };

  // 清除所有选择状态
  const clearAllSelections = () => {
    const transformer = stageRef.current?.transformer;
    if (transformer) {
      transformer.nodes([]);
    }
    setSelectedImage(null);
    setSelectedImages([]);
    setSelectedErrorNode(null);
    if (layerRef.current) {
      layerRef.current.draw();
    }
  };

  // 监听选中状态变化，更新工具栏位置
  useEffect(() => {
    updateToolbarPosition();
  }, [selectedImage, selectedImages, selectedErrorNode]);

  // 舞台初始化
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
      (stage as StageWithTransformer).transformer = transformer;

      // 事件监听
      setupStageEvents(stage, transformer, layer);
      const cleanupResizeObserver = setupResizeObserver(stage, container);
      resizeObserverCleanupRef.current = cleanupResizeObserver;

      // 保存引用
      stageRef.current = stage;
      layerRef.current = layer;
      setIsStageReady(true);
    }

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
        flipEnabled: false,
        boundBoxFunc: (oldBox, newBox) => {
          // 禁止翻转：如果新的宽度或高度小于最小值，返回旧的边界框
          const minWidth = 5;
          const minHeight = 5;

          if (Math.abs(newBox.width) < minWidth || Math.abs(newBox.height) < minHeight) {
            return oldBox;
          }

          return newBox;
        },
      });
      layer.add(transformer);
      transformer.moveToTop();
      return transformer;
    }

    function setupStageEvents(stage: Konva.Stage, transformer: Konva.Transformer, layer: Konva.Layer) {
      // Transformer 变换事件
      transformer.on("transformend", updateToolbarPosition);
      transformer.on("transform", updateToolbarPosition);

      // 点击空白区域只取消选择
      stage.on("click", (e) => {
        if (e.target === stage) {
          clearAllSelections();
        }
      });

      // 框选逻辑
      stage.on("mousedown", (e) => {
        if (e.target !== stage) return;

        const pointer = stage.getPointerPosition();
        if (!pointer) return;

        selectionStartRef.current = { x: pointer.x, y: pointer.y };

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

        selectionBoxRef.current.setAttrs({
          x: Math.min(startX, pointer.x),
          y: Math.min(startY, pointer.y),
          width: Math.abs(pointer.x - startX),
          height: Math.abs(pointer.y - startY),
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

        const selectedList: Konva.Image[] = [];

        layer.children.forEach((child) => {
          if (!(child instanceof Konva.Image) || child.name().startsWith("selection")) return;

          const imageX = child.x();
          const imageY = child.y();
          const imageWidth = child.width() * child.scaleX();
          const imageHeight = child.height() * child.scaleY();

          if (
            imageX >= boxX &&
            imageY >= boxY &&
            imageX + imageWidth <= boxX + boxWidth &&
            imageY + imageHeight <= boxY + boxHeight
          ) {
            selectedList.push(child);
          }
        });

        selectionBoxRef.current.destroy();
        selectionBoxRef.current = null;
        selectionStartRef.current = null;

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
      return () => resizeObserver.disconnect();
    }

    return () => {
      clearTimeout(initTimer);
      if (stageRef.current) {
        // 清理所有动画
        if (layerRef.current) {
          layerRef.current.children.forEach((child) => {
            const anim = (child as NodeWithAnimation).textAnimation;
            if (anim) {
              anim.stop();
            }
          });
        }
        // 清理所有 blob URLs
        Array.from(imagesData.values()).forEach(({ url }) => {
          URL.revokeObjectURL(url);
        });
        // 清理 ResizeObserver
        if (resizeObserverCleanupRef.current) {
          resizeObserverCleanupRef.current();
          resizeObserverCleanupRef.current = null;
        }
        stageRef.current.destroy();
        stageRef.current = null;
        layerRef.current = null;
      }
    };
  }, []);

  // 图片加载
  useEffect(() => {
    if (!isStageReady || !layerRef.current) return;

    const layer = layerRef.current;

    console.log('ResultPanel: loading images', images);

    // 如果没有图片，清空画布
    if (!images || images.length === 0) {
      const toDestroy: Konva.Node[] = [];
      layer.children.forEach((child) => {
        if (child.name().startsWith('item-')) {
          toDestroy.push(child);
        }
      });
      toDestroy.forEach((node) => node.destroy());
      layer.draw();
      return;
    }

    // 处理每个图片项
    images.forEach((item, index) => {
      const existingNode = layer.children.find((child) => child.name() === `item-${item.id}`);

      if (item.type === 'uploading') {
        if (existingNode) {
          // 如果节点存在但动画已停止，重新启动动画
          if (!(existingNode as NodeWithAnimation).textAnimation) {
            const children = (existingNode as Konva.Group).children || [];
            const overlay = children.find((c) => c instanceof Konva.Rect);
            const text = children.find((c) => c instanceof Konva.Text);

            if (overlay && text) {
              const anim = new Konva.Animation((frame) => {
                if (!frame) return;
                const t = frame.time / 1000;
                const opacity = (Math.sin(t * 2) + 1) / 2;
                overlay.opacity(0.3 + opacity * 0.4);
                text.opacity(0.5 + opacity * 0.5);
              }, layer);
              anim.start();
              (existingNode as NodeWithAnimation).textAnimation = anim;
            }
          }
          return;
        }

        const img = new Image();
        img.src = item.localUrl;

        img.onload = () => {
          const position = getNodePosition(item.position, existingNode, index);
          const scale = calculateImageScale(img.width, img.height);

          const konvaImage = new Konva.Image({
            image: img,
            x: 0,
            y: 0,
            width: img.width,
            height: img.height,
            scaleX: scale,
            scaleY: scale,
            draggable: false,
          });

          // 添加蒙层
          const overlay = new Konva.Rect({
            x: 0,
            y: 0,
            width: img.width * scale,
            height: img.height * scale,
            fill: 'black',
            opacity: 0.5,
            listening: false,
          });

          // 添加加载文本
          const text = new Konva.Text({
            x: 0,
            y: (img.height * scale) / 2 - 10,
            width: img.width * scale,
            text: '上传中...',
            fontSize: 16,
            fill: 'white',
            align: 'center',
            listening: false,
          });

          // 添加呼吸动画
          const anim = new Konva.Animation((frame) => {
            if (!frame) return;
            const t = frame.time / 1000;
            const opacity = (Math.sin(t * 2) + 1) / 2;
            overlay.opacity(0.3 + opacity * 0.4);
            text.opacity(0.5 + opacity * 0.5);
          }, layer);
          anim.start();

          const group = new Konva.Group({
            name: `item-${item.id}`,
            x: position.x,
            y: position.y,
            draggable: true,
          });

          // 保存动画引用，方便清理
          (group as NodeWithAnimation).textAnimation = anim;

          group.add(konvaImage);
          group.add(overlay);
          group.add(text);

          group.on("dragend", () => {
            if (stageRef.current) {
              constrainGroupPosition(group, stageRef.current, layer);
            }
            const nodeId = group.name().replace('item-', '');
            onImagePositionChange?.(nodeId, { x: group.x(), y: group.y() });
          });

          layer.add(group);
          layer.draw();
        };

        img.onerror = () => {
          console.error(`Failed to load pasted image`);
        };
      } else if (item.type === 'loading') {
        if (!existingNode) {
          const loadingGroup = createLoadingPlaceholder(index);
          loadingGroup.name(`item-${item.id}`);

          // 使用 item.position 如果存在
          if (item.position) {
            loadingGroup.position(item.position);
          }

          // 添加拖动事件
          loadingGroup.on("dragend", () => {
            if (stageRef.current) {
              constrainGroupPosition(loadingGroup, stageRef.current, layer);
            }
            const nodeId = loadingGroup.name().replace('item-', '');
            onImagePositionChange?.(nodeId, { x: loadingGroup.x(), y: loadingGroup.y() });
          });

          layer.add(loadingGroup);
          layer.draw();
        }
      } else if (item.type === 'error') {
        const position = getNodePosition(item.position, existingNode, index);

        if (existingNode) {
          // 停止动画
          const anim = (existingNode as NodeWithAnimation).textAnimation;
          if (anim) {
            anim.stop();
          }
          existingNode.destroy();
        }

        const errorGroup = createErrorPlaceholder(item.error, index);
        errorGroup.name(`item-${item.id}`);
        errorGroup.position(position);

        // 添加点击事件
        errorGroup.on("click", () => {
          const transformer = stageRef.current?.transformer;
          if (transformer) {
            transformer.nodes([]);
          }
          setSelectedImage(null);
          setSelectedImages([]);
          setSelectedErrorNode(errorGroup);
          layer.draw();
          updateToolbarPosition();
        });

        // 添加拖动事件
        errorGroup.on("dragend", () => {
          if (stageRef.current) {
            constrainGroupPosition(errorGroup, stageRef.current, layer);
          }
          const nodeId = errorGroup.name().replace('item-', '');
          onImagePositionChange?.(nodeId, { x: errorGroup.x(), y: errorGroup.y() });
          updateToolbarPosition();
        });

        errorGroup.on("dragmove", updateToolbarPosition);

        layer.add(errorGroup);
        layer.draw();
        loadingIdsRef.current.delete(item.id);
      } else if (item.type === 'success') {
        if (loadingIdsRef.current.has(item.id)) return;

        loadingIdsRef.current.add(item.id);

        loadImageAsBlob(item.url)
          .then((blob) => {
            const objectUrl = URL.createObjectURL(blob);
            const img = new Image();
            img.src = objectUrl;

            img.onload = () => {
              const existingNode = layer.children.find((child) => child.name() === `item-${item.id}`);
              const position = getNodePosition(item.position, existingNode, index);

              // 删除旧节点（uploading group 或 loading placeholder）
              if (existingNode) {
                // 停止动画
                const anim = (existingNode as NodeWithAnimation).textAnimation;
                if (anim) {
                  anim.stop();
                }
                existingNode.destroy();
              }

              const scale = calculateImageScale(img.width, img.height);

              const konvaImage = new Konva.Image({
                image: img,
                x: position.x,
                y: position.y,
                width: img.width,
                height: img.height,
                scaleX: scale,
                scaleY: scale,
                draggable: true,
                name: `item-${item.id}`,
              });

              setupImageEvents(konvaImage, layer);

              setImagesData((prev) => new Map(prev).set(konvaImage, { url: objectUrl, imageUrl: item.url }));
              layer.add(konvaImage);
              layer.draw();

              loadingIdsRef.current.delete(item.id);
            };

            img.onerror = () => {
              console.error(`Failed to load image`);
              loadingIdsRef.current.delete(item.id);
            };
          })
          .catch((error) => {
            console.error(`Failed to load image:`, error);
            loadingIdsRef.current.delete(item.id);
          });
      }
    });

    // 清理不在 images 数组中的节点
    const imageIds = new Set(images.map(item => item.id));
    const toDestroy: Konva.Node[] = [];
    layer.children.forEach((child) => {
      if (child.name().startsWith('item-')) {
        const nodeId = child.name().replace('item-', '');
        if (!imageIds.has(nodeId)) {
          // 停止动画
          const anim = (child as NodeWithAnimation).textAnimation;
          if (anim) {
            anim.stop();
          }
          toDestroy.push(child);
        }
      }
    });
    toDestroy.forEach((node) => node.destroy());
    if (toDestroy.length > 0) {
      layer.draw();
    }

    function setupImageEvents(konvaImage: Konva.Image, layer: Konva.Layer) {
      konvaImage.on("click", () => {
        const transformer = stageRef.current?.transformer;
        if (transformer) {
          transformer.nodes([konvaImage]);
          transformer.moveToTop();
        }
        setSelectedImage(konvaImage);
        setSelectedImages([konvaImage]);
        setSelectedErrorNode(null);
        layer.draw();
        updateToolbarPosition();
      });

      konvaImage.on("dragend", () => {
        if (stageRef.current) {
          constrainImagePosition(konvaImage, stageRef.current, layer);
        }
        const nodeId = konvaImage.name().replace('item-', '');
        onImagePositionChange?.(nodeId, { x: konvaImage.x(), y: konvaImage.y() });
        updateToolbarPosition();
      });

      konvaImage.on("dragmove", updateToolbarPosition);
    }

    // 不在依赖项变化时清理，动画和 URLs 由其他逻辑管理
    // 动画在节点删除时清理（第 524-527, 575-579 行）
    // blob URLs 在舞台销毁时清理（第 269-285 行）
  }, [images, isStageReady]);

  return {
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
  };
}
