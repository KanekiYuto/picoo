import { useEffect, useRef, useState } from "react";
import Konva from "konva";
import { loadImageAsBlob } from "@/lib/image-utils";
import type { ImageItem } from "../ResultPanel";
import {
  constrainImagePosition,
  constrainGroupPosition,
  calculateToolbarPosition
} from "../utils/konvaHelpers";
import { createLoadingPlaceholder, createErrorPlaceholder } from "../components/Placeholders";

interface ImageData {
  url: string;
  imageUrl: string;
}

export function useKonvaStage(
  containerRef: React.RefObject<HTMLDivElement | null>,
  images?: ImageItem[]
) {
  const stageRef = useRef<Konva.Stage | null>(null);
  const layerRef = useRef<Konva.Layer | null>(null);
  const selectionBoxRef = useRef<Konva.Rect | null>(null);
  const selectionStartRef = useRef<{ x: number; y: number } | null>(null);
  const groupRef = useRef<Konva.Group | null>(null);
  const loadingIdsRef = useRef<Set<string>>(new Set());

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
    const transformer = (stageRef.current as any)?.transformer;

    // 优先使用错误节点
    if (selectedErrorNode) {
      targetNode = selectedErrorNode;
    }
    // 优先使用 Group
    else if (groupRef.current && selectedImages.length > 1) {
      targetNode = groupRef.current;
    }
    // 多个图片被选中但还没有 Group
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

  // 监听选中状态变化，更新工具栏位置
  useEffect(() => {
    updateToolbarPosition();
  }, [selectedImage, selectedImages, selectedErrorNode, groupRef.current]);

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
      (stage as any).transformer = transformer;

      // 事件监听
      setupStageEvents(stage, transformer, layer);
      setupResizeObserver(stage, container);

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
          setSelectedImage(null);
          setSelectedImages([]);
          setSelectedErrorNode(null);
          transformer.nodes([]);
          layer.draw();
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

      if (item.type === 'loading') {
        if (!existingNode) {
          const loadingGroup = createLoadingPlaceholder(index);
          loadingGroup.name(`item-${item.id}`);
          layer.add(loadingGroup);
          layer.draw();
        }
      } else if (item.type === 'error') {
        if (existingNode) {
          existingNode.destroy();
        }
        const errorGroup = createErrorPlaceholder(item.error, index);
        errorGroup.name(`item-${item.id}`);

        // 添加点击事件
        errorGroup.on("click", () => {
          const transformer = (stageRef.current as any)?.transformer;
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
              const loadingNode = layer.children.find((child) => child.name() === `item-${item.id}`);
              let targetX = 100 + index * 50;
              let targetY = 100 + index * 50;

              if (loadingNode) {
                targetX = loadingNode.x();
                targetY = loadingNode.y();
                loadingNode.destroy();
              }

              const maxWidth = 300;
              const maxHeight = 300;
              const scale = Math.min(maxWidth / img.width, maxHeight / img.height);

              const konvaImage = new Konva.Image({
                image: img,
                x: targetX,
                y: targetY,
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

    function setupImageEvents(konvaImage: Konva.Image, layer: Konva.Layer) {
      konvaImage.on("click", () => {
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

      konvaImage.on("dragend", () => {
        if (konvaImage.parent && konvaImage.parent.name() === "images-group") {
          if (stageRef.current) {
            constrainGroupPosition(konvaImage.parent as Konva.Group, stageRef.current, layer);
          }
        } else {
          if (stageRef.current) {
            constrainImagePosition(konvaImage, stageRef.current, layer);
          }
        }
        updateToolbarPosition();
      });

      konvaImage.on("dragmove", updateToolbarPosition);
    }

    return () => {
      Array.from(imagesData.values()).forEach(({ url }) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [images, isStageReady]);

  return {
    stageRef,
    layerRef,
    groupRef,
    selectedImage,
    selectedImages,
    selectedErrorNode,
    imagesData,
    toolbarPos,
    setSelectedImage,
    setSelectedImages,
    setSelectedErrorNode,
    updateToolbarPosition,
  };
}
