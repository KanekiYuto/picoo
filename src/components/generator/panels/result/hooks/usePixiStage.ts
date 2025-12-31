import { useEffect, useRef, useState, useCallback } from "react";
import * as PIXI from "pixi.js";
import { loadImageAsBlob } from "@/lib/image-utils";
import type { ImageItem } from "../ResultPanel";

interface ImageData {
  url: string;
  imageUrl: string;
}

interface PixiImageSprite extends PIXI.Sprite {
  imageData?: ImageData;
  imageId?: string;
}

interface PixiErrorContainer extends PIXI.Container {
  errorId?: string;
}

export function usePixiStage(
  containerRef: React.RefObject<HTMLDivElement | null>,
  images?: ImageItem[],
  onImagePositionChange?: (id: string, position: { x: number; y: number }) => void
) {
  const appRef = useRef<PIXI.Application | null>(null);
  const containerSpriteRef = useRef<PIXI.Container | null>(null);
  const selectionBoxRef = useRef<PIXI.Graphics | null>(null);
  const selectionStartRef = useRef<{ x: number; y: number } | null>(null);
  const loadingIdsRef = useRef<Set<string>>(new Set());
  const resizeObserverCleanupRef = useRef<(() => void) | null>(null);
  const transformControlsRef = useRef<PIXI.Graphics | null>(null);

  const [selectedImage, setSelectedImage] = useState<PixiImageSprite | null>(null);
  const [selectedImages, setSelectedImages] = useState<PixiImageSprite[]>([]);
  const [selectedErrorNode, setSelectedErrorNode] = useState<PixiErrorContainer | null>(null);
  const [imagesData, setImagesData] = useState<Map<PixiImageSprite, ImageData>>(new Map());
  const [isStageReady, setIsStageReady] = useState(false);
  const [toolbarPos, setToolbarPos] = useState<{ x: number; y: number } | null>(null);
  const [globalZoom, setGlobalZoom] = useState(100);

  const ZOOM_CONSTANTS = {
    min: 10,
    max: 200,
    step: 10,
  };

  // 清除所有选择
  const clearAllSelections = useCallback(() => {
    setSelectedImage(null);
    setSelectedImages([]);
    setSelectedErrorNode(null);
    setToolbarPos(null);

    if (transformControlsRef.current) {
      transformControlsRef.current.clear();
      transformControlsRef.current.removeChildren();
    }
  }, []);

  // 更新工具栏位置
  const updateToolbarPosition = useCallback(() => {
    if (!appRef.current || !containerRef.current) return;

    let targetSprite: PIXI.Container | null = null;

    // 优先使用错误节点
    if (selectedErrorNode) {
      targetSprite = selectedErrorNode;
    }
    // 多个图片被选中
    else if (selectedImages.length > 1) {
      const bounds = getMultipleSelectionBounds(selectedImages);
      if (bounds) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const pos = calculateToolbarPosition(bounds, containerRect);
        setToolbarPos(pos);
        return;
      }
    }
    // 单个图片被选中
    else if (selectedImage) {
      targetSprite = selectedImage;
    }

    if (targetSprite && !targetSprite.destroyed) {
      try {
        const bounds = targetSprite.getBounds();
        const containerRect = containerRef.current.getBoundingClientRect();
        const pos = calculateToolbarPosition(bounds, containerRect);
        setToolbarPos(pos);
      } catch (e) {
        // 对象已销毁，清除工具栏
        setToolbarPos(null);
      }
    } else {
      setToolbarPos(null);
    }
  }, [selectedImage, selectedImages, selectedErrorNode, containerRef]);

  // 计算多个选中对象的边界
  const getMultipleSelectionBounds = (sprites: PixiImageSprite[]) => {
    if (sprites.length === 0) return null;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    sprites.forEach(sprite => {
      if (sprite.destroyed) return;
      try {
        const bounds = sprite.getBounds();
        minX = Math.min(minX, bounds.x);
        minY = Math.min(minY, bounds.y);
        maxX = Math.max(maxX, bounds.x + bounds.width);
        maxY = Math.max(maxY, bounds.y + bounds.height);
      } catch (e) {
        // Sprite 已销毁，跳过
      }
    });

    if (minX === Infinity) return null;

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  };

  // 计算工具栏位置
  const calculateToolbarPosition = (
    bounds: { x: number; y: number; width: number; height: number },
    containerRect: DOMRect
  ) => {
    const TOOLBAR_OFFSET = 10;
    const x = bounds.x + bounds.width / 2;
    const y = bounds.y - TOOLBAR_OFFSET;
    return { x, y };
  };

  // 初始化 PixiJS 应用
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    // 防止重复初始化
    if (appRef.current || container.querySelector('canvas')) return;

    (async () => {
      const app = new PIXI.Application();
      await app.init({
        width: container.clientWidth,
        height: container.clientHeight,
        backgroundColor: 0x1a1a1a,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      });

      // 再次检查，防止 async 期间有其他实例创建
      if (container.querySelector('canvas')) {
        app.destroy(true);
        return;
      }

      container.appendChild(app.canvas);
      appRef.current = app;

      // 创建主容器
      const mainContainer = new PIXI.Container();
      app.stage.addChild(mainContainer);
      containerSpriteRef.current = mainContainer;

      // 创建变换控制容器
      const transformControls = new PIXI.Graphics();
      app.stage.addChild(transformControls);
      transformControlsRef.current = transformControls;

      // 设置舞台交互
      app.stage.eventMode = 'static';
      app.stage.hitArea = app.screen;

      // 框选逻辑
      setupSelectionBox(app, mainContainer, transformControls, onImagePositionChange);

      // 设置窗口大小监听
      setupResizeObserver(app, container);

      setIsStageReady(true);
    })();

    return () => {
      // 清理所有 canvas 元素
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }

      if (appRef.current) {
        appRef.current.destroy(true, { children: true, texture: true });
        appRef.current = null;
      }
      if (resizeObserverCleanupRef.current) {
        resizeObserverCleanupRef.current();
        resizeObserverCleanupRef.current = null;
      }
      setIsStageReady(false);
    };
  }, [containerRef]);

  // 框选逻辑设置
  function setupSelectionBox(
    app: PIXI.Application,
    container: PIXI.Container,
    transformControls: PIXI.Graphics,
    onImagePositionChange?: (id: string, position: { x: number; y: number }) => void
  ) {
    // 点击 stage 清除选择
    app.stage.on('click', (event: PIXI.FederatedPointerEvent) => {
      if (event.target === app.stage) {
        clearAllSelections();
      }
    });

    app.stage.on('pointerdown', (event: PIXI.FederatedPointerEvent) => {
      if (event.target !== app.stage) return;

      const pos = event.global;
      selectionStartRef.current = { x: pos.x, y: pos.y };

      if (!selectionBoxRef.current) {
        const selectionBox = new PIXI.Graphics();
        selectionBox.rect(pos.x, pos.y, 0, 0);
        selectionBox.stroke({ width: 2, color: 0x4b5cc4 });
        selectionBox.fill({ color: 0x4b5cc4, alpha: 0.1 });
        app.stage.addChild(selectionBox);
        selectionBoxRef.current = selectionBox;
      }
    });

    app.stage.on('pointermove', (event: PIXI.FederatedPointerEvent) => {
      if (!selectionStartRef.current || !selectionBoxRef.current) return;

      const pos = event.global;
      const startX = selectionStartRef.current.x;
      const startY = selectionStartRef.current.y;

      selectionBoxRef.current.clear();
      selectionBoxRef.current.rect(
        Math.min(startX, pos.x),
        Math.min(startY, pos.y),
        Math.abs(pos.x - startX),
        Math.abs(pos.y - startY)
      );
      selectionBoxRef.current.stroke({ width: 2, color: 0x4b5cc4 });
      selectionBoxRef.current.fill({ color: 0x4b5cc4, alpha: 0.1 });
    });

    app.stage.on('pointerup', () => {
      if (!selectionBoxRef.current || !selectionStartRef.current) return;

      const boxBounds = selectionBoxRef.current.getBounds();
      const selectedList: PixiImageSprite[] = [];

      container.children.forEach((child) => {
        if (!(child instanceof PIXI.Sprite) || !('imageId' in child)) return;

        const childBounds = child.getBounds();

        // 相交检测
        const hasIntersection = !(
          boxBounds.x + boxBounds.width < childBounds.x ||
          boxBounds.x > childBounds.x + childBounds.width ||
          boxBounds.y + boxBounds.height < childBounds.y ||
          boxBounds.y > childBounds.y + childBounds.height
        );

        if (hasIntersection) {
          selectedList.push(child as PixiImageSprite);
        }
      });

      selectionBoxRef.current.destroy();
      selectionBoxRef.current = null;
      selectionStartRef.current = null;

      if (selectedList.length > 0) {
        setSelectedImages(selectedList);
        setSelectedImage(null);
        drawTransformControls(selectedList, transformControls, onImagePositionChange);
        updateToolbarPosition();
      } else {
        setSelectedImages([]);
        transformControls.clear();
        transformControls.removeChildren();
      }
    });
  }

  // 绘制变换控制
  function drawTransformControls(
    sprites: PixiImageSprite[],
    graphics: PIXI.Graphics,
    onImagePositionChange?: (id: string, position: { x: number; y: number }) => void
  ) {
    graphics.clear();
    graphics.removeChildren();

    if (sprites.length === 0) return;

    const bounds = getMultipleSelectionBounds(sprites);
    if (!bounds) return;

    // 绘制边框
    graphics.rect(bounds.x, bounds.y, bounds.width, bounds.height);
    graphics.stroke({ width: 2, color: 0x4b5cc4 });

    // 四个角的控制点
    const handleSize = 8;
    const handles = [
      { x: bounds.x, y: bounds.y, cursor: 'nwse-resize', dir: 'nw' },
      { x: bounds.x + bounds.width, y: bounds.y, cursor: 'nesw-resize', dir: 'ne' },
      { x: bounds.x, y: bounds.y + bounds.height, cursor: 'nesw-resize', dir: 'sw' },
      { x: bounds.x + bounds.width, y: bounds.y + bounds.height, cursor: 'nwse-resize', dir: 'se' },
    ];

    // 单个图片：可交互的控制点
    if (sprites.length === 1) {
      const sprite = sprites[0];

      handles.forEach(handle => {
        const handleGraphic = new PIXI.Graphics();
        handleGraphic.rect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
        handleGraphic.fill({ color: 0xffffff });
        handleGraphic.stroke({ width: 1, color: 0x4b5cc4 });
        handleGraphic.eventMode = 'static';
        handleGraphic.cursor = handle.cursor;

        let resizeStart: {
          x: number; y: number;
          spriteX: number; spriteY: number;
          spriteWidth: number; spriteHeight: number;
          spriteScaleX: number; spriteScaleY: number;
        } | null = null;

        const handleMove = (event: PIXI.FederatedPointerEvent) => {
          if (!resizeStart) return;

          const dx = event.global.x - resizeStart.x;
          const dy = event.global.y - resizeStart.y;

          // 计算等比缩放因子
          let scaleFactor = 1;
          if (handle.dir === 'se') {
            scaleFactor = Math.max((resizeStart.spriteWidth + dx) / resizeStart.spriteWidth, (resizeStart.spriteHeight + dy) / resizeStart.spriteHeight);
          } else if (handle.dir === 'sw') {
            scaleFactor = Math.max((resizeStart.spriteWidth - dx) / resizeStart.spriteWidth, (resizeStart.spriteHeight + dy) / resizeStart.spriteHeight);
          } else if (handle.dir === 'ne') {
            scaleFactor = Math.max((resizeStart.spriteWidth + dx) / resizeStart.spriteWidth, (resizeStart.spriteHeight - dy) / resizeStart.spriteHeight);
          } else if (handle.dir === 'nw') {
            scaleFactor = Math.max((resizeStart.spriteWidth - dx) / resizeStart.spriteWidth, (resizeStart.spriteHeight - dy) / resizeStart.spriteHeight);
          }

          scaleFactor = Math.max(scaleFactor, 0.1);
          sprite.scale.set(resizeStart.spriteScaleX * scaleFactor, resizeStart.spriteScaleY * scaleFactor);

          // 调整位置保持对角固定
          if (handle.dir === 'se') {
            sprite.x = resizeStart.spriteX;
            sprite.y = resizeStart.spriteY;
          } else if (handle.dir === 'sw') {
            sprite.x = resizeStart.spriteX + resizeStart.spriteWidth - sprite.width;
            sprite.y = resizeStart.spriteY;
          } else if (handle.dir === 'ne') {
            sprite.x = resizeStart.spriteX;
            sprite.y = resizeStart.spriteY + resizeStart.spriteHeight - sprite.height;
          } else if (handle.dir === 'nw') {
            sprite.x = resizeStart.spriteX + resizeStart.spriteWidth - sprite.width;
            sprite.y = resizeStart.spriteY + resizeStart.spriteHeight - sprite.height;
          }

          drawTransformControls([sprite], graphics, onImagePositionChange);
          updateToolbarPosition();
        };

        const handleUp = () => {
          if (resizeStart && sprite.imageId) {
            onImagePositionChange?.(sprite.imageId, { x: sprite.x, y: sprite.y });
            resizeStart = null;
          }
          if (appRef.current) {
            appRef.current.stage.off('pointermove', handleMove);
            appRef.current.stage.off('pointerup', handleUp);
            appRef.current.stage.off('pointerupoutside', handleUp);
          }
        };

        handleGraphic.on('pointerdown', (event: PIXI.FederatedPointerEvent) => {
          event.stopPropagation();
          resizeStart = {
            x: event.global.x, y: event.global.y,
            spriteX: sprite.x, spriteY: sprite.y,
            spriteWidth: sprite.width, spriteHeight: sprite.height,
            spriteScaleX: sprite.scale.x, spriteScaleY: sprite.scale.y,
          };

          if (appRef.current) {
            appRef.current.stage.on('pointermove', handleMove);
            appRef.current.stage.on('pointerup', handleUp);
            appRef.current.stage.on('pointerupoutside', handleUp);
          }
        });

        graphics.addChild(handleGraphic);
      });
    } else {
      // 多选：静态控制点
      handles.forEach(handle => {
        graphics.rect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
        graphics.fill({ color: 0xffffff });
        graphics.stroke({ width: 1, color: 0x4b5cc4 });
      });
    }
  }

  // 设置窗口大小监听
  function setupResizeObserver(app: PIXI.Application, container: HTMLElement) {
    const resizeObserver = new ResizeObserver(() => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      app.renderer.resize(newWidth, newHeight);
    });

    resizeObserver.observe(container);

    resizeObserverCleanupRef.current = () => {
      resizeObserver.disconnect();
    };
  }

  // 加载图片
  useEffect(() => {
    if (!isStageReady || !images || !appRef.current || !containerSpriteRef.current) return;

    const app = appRef.current;
    const container = containerSpriteRef.current;

    if (images.length === 0) {
      container.removeChildren();
      return;
    }

    // 处理每个图片项
    images.forEach((item, index) => {
      const existingChild = container.children.find(
        (child) => (child as any).itemId === item.id
      );

      if (item.type === 'loading') {
        if (!existingChild) {
          const placeholder = createLoadingPlaceholder(index, item);
          container.addChild(placeholder);
        }
      } else if (item.type === 'uploading') {
        if (loadingIdsRef.current.has(item.id)) return;
        loadingIdsRef.current.add(item.id);

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = item.localUrl;

        img.onload = () => {
          const texture = PIXI.Texture.from(img);
          const sprite = new PIXI.Sprite(texture);

          const uploadingContainer = new PIXI.Container();
          (uploadingContainer as any).itemId = item.id;
          (uploadingContainer as any).imageId = item.id;

          const maxSize = Math.min(app.screen.width, app.screen.height) * 0.4;
          const scale = Math.min(maxSize / texture.width, maxSize / texture.height);
          sprite.scale.set(scale);

          // 添加半透明遮罩表示上传中
          const overlay = new PIXI.Graphics();
          overlay.rect(0, 0, sprite.width, sprite.height);
          overlay.fill({ color: 0x000000, alpha: 0.5 });

          const text = new PIXI.Text({
            text: '上传中...',
            style: { fontSize: 16, fill: 0xffffff },
          });
          text.x = sprite.width / 2 - text.width / 2;
          text.y = sprite.height / 2 - text.height / 2;

          uploadingContainer.addChild(sprite);
          uploadingContainer.addChild(overlay);
          uploadingContainer.addChild(text);

          if (item.position) {
            uploadingContainer.x = item.position.x;
            uploadingContainer.y = item.position.y;
          } else {
            uploadingContainer.x = (app.screen.width - sprite.width) / 2;
            uploadingContainer.y = (app.screen.height - sprite.height) / 2;
          }

          uploadingContainer.eventMode = 'static';
          uploadingContainer.cursor = 'pointer';

          // 拖拽功能
          let dragStart: { x: number; y: number } | null = null;

          uploadingContainer.on('pointerdown', (event: PIXI.FederatedPointerEvent) => {
            event.stopPropagation();
            dragStart = { x: event.global.x - uploadingContainer.x, y: event.global.y - uploadingContainer.y };
          });

          uploadingContainer.on('pointermove', (event: PIXI.FederatedPointerEvent) => {
            if (dragStart) {
              uploadingContainer.x = event.global.x - dragStart.x;
              uploadingContainer.y = event.global.y - dragStart.y;
            }
          });

          uploadingContainer.on('pointerup', () => {
            if (dragStart) {
              onImagePositionChange?.(item.id, { x: uploadingContainer.x, y: uploadingContainer.y });
              dragStart = null;
            }
          });

          uploadingContainer.on('pointerupoutside', () => {
            dragStart = null;
          });

          container.addChild(uploadingContainer);
          loadingIdsRef.current.delete(item.id);
        };

        img.onerror = () => {
          loadingIdsRef.current.delete(item.id);
        };
      } else if (item.type === 'success') {
        // 如果已经是成功加载的 Sprite，跳过
        if (existingChild && existingChild instanceof PIXI.Sprite) {
          // 只更新位置（如果有变化）
          if (item.position && (existingChild.x !== item.position.x || existingChild.y !== item.position.y)) {
            existingChild.x = item.position.x;
            existingChild.y = item.position.y;
          }
          return;
        }

        // 防止重复加载
        if (loadingIdsRef.current.has(item.id)) return;
        loadingIdsRef.current.add(item.id);

        (async () => {
          try {
            // 加载图片纹理
            const texture = await PIXI.Assets.load(item.url);

            // 删除旧节点（uploading 或 loading）并保存位置
            const oldChild = container.children.find(
              (child) => (child as any).itemId === item.id
            );
            let savedPosition: { x: number; y: number } | null = null;
            if (oldChild) {
              savedPosition = { x: oldChild.x, y: oldChild.y };

              // 如果旧节点被选中，清除选中状态
              if (selectedImage === oldChild) {
                setSelectedImage(null);
              }
              if (selectedImages.includes(oldChild as any)) {
                setSelectedImages(prev => prev.filter(img => img !== oldChild));
              }
              if (selectedErrorNode === oldChild) {
                setSelectedErrorNode(null);
              }

              oldChild.destroy({ children: true, texture: true });
            }

            const sprite = new PIXI.Sprite(texture) as PixiImageSprite;

            // 设置属性
            sprite.imageId = item.id;
            (sprite as any).itemId = item.id;
            sprite.imageData = {
              url: item.url,
              imageUrl: item.url,
            };

            // 计算缩放以适应舞台
            const maxSize = Math.min(app.screen.width, app.screen.height) * 0.4;
            const scale = Math.min(maxSize / texture.width, maxSize / texture.height);
            sprite.scale.set(scale);

            // 设置位置 - 如果旧节点存在，使用保存的位置
            if (savedPosition) {
              sprite.x = savedPosition.x;
              sprite.y = savedPosition.y;
            } else if (item.position) {
              sprite.x = item.position.x;
              sprite.y = item.position.y;
            } else {
              // 居中
              sprite.x = (app.screen.width - sprite.width) / 2;
              sprite.y = (app.screen.height - sprite.height) / 2;
            }

            // 设置交互
            sprite.eventMode = 'static';
            sprite.cursor = 'pointer';

            // 拖拽功能
            setupDragHandlers(sprite, app, onImagePositionChange);

            container.addChild(sprite);

            // 更新图片数据映射
            setImagesData(prev => {
              const newMap = new Map(prev);
              newMap.set(sprite, sprite.imageData!);
              return newMap;
            });

            loadingIdsRef.current.delete(item.id);
          } catch (error) {
            loadingIdsRef.current.delete(item.id);
          }
        })();
      } else if (item.type === 'error') {
        if (!existingChild) {
          const placeholder = createErrorPlaceholder(item.error, index, item);
          container.addChild(placeholder);
        }
      }
    });

    // 移除不存在的图片
    const imageIds = new Set(images.map(img => img.id));
    const childrenToRemove: PIXI.Container[] = [];

    container.children.forEach((child) => {
      const itemId = (child as any).itemId;
      if (itemId && !imageIds.has(itemId)) {
        childrenToRemove.push(child);
      }
    });

    childrenToRemove.forEach(child => {
      child.destroy({ texture: true });
      if (child instanceof PIXI.Sprite) {
        setImagesData(prev => {
          const newMap = new Map(prev);
          newMap.delete(child as PixiImageSprite);
          return newMap;
        });
      }
    });

  }, [images, isStageReady, onImagePositionChange, updateToolbarPosition]);

  // 拖拽处理函数
  function setupDragHandlers(
    sprite: PixiImageSprite,
    app: PIXI.Application,
    onImagePositionChange?: (id: string, position: { x: number; y: number }) => void
  ) {
    let dragStart: { x: number; y: number } | null = null;

    sprite.on('pointerdown', (event: PIXI.FederatedPointerEvent) => {
      event.stopPropagation();
      dragStart = { x: event.global.x - sprite.x, y: event.global.y - sprite.y };
      setSelectedImage(sprite);
      setSelectedImages([sprite]);
      setSelectedErrorNode(null);
      if (transformControlsRef.current) {
        drawTransformControls([sprite], transformControlsRef.current, onImagePositionChange);
      }
      updateToolbarPosition();
    });

    sprite.on('pointermove', (event: PIXI.FederatedPointerEvent) => {
      if (dragStart) {
        sprite.x = event.global.x - dragStart.x;
        sprite.y = event.global.y - dragStart.y;
        if (transformControlsRef.current) {
          drawTransformControls([sprite], transformControlsRef.current, onImagePositionChange);
        }
        updateToolbarPosition();
      }
    });

    sprite.on('pointerup', () => {
      if (dragStart && sprite.imageId) {
        onImagePositionChange?.(sprite.imageId, { x: sprite.x, y: sprite.y });
        dragStart = null;
      }
    });

    sprite.on('pointerupoutside', () => {
      dragStart = null;
    });
  }

  // 创建加载占位符
  function createLoadingPlaceholder(index: number, item: ImageItem) {
    const size = 300;
    const container = new PIXI.Container();
    (container as any).itemId = item.id;

    const rect = new PIXI.Graphics();
    rect.rect(0, 0, size, size);
    rect.fill({ color: 0x262626 });
    rect.stroke({ width: 2, color: 0x4b5cc4 });

    const text = new PIXI.Text({
      text: '生成中...',
      style: { fontSize: 16, fill: 0x9ca3af },
    });
    text.x = size / 2 - text.width / 2;
    text.y = size / 2 - text.height / 2;

    container.addChild(rect);
    container.addChild(text);

    setContainerPosition(container, item.position, index);
    setupDragForPlaceholder(container, item.id);

    return container;
  }

  // 创建错误占位符
  function createErrorPlaceholder(errorMsg: string, index: number, item: ImageItem) {
    const size = 300;
    const container = new PIXI.Container() as PixiErrorContainer;
    (container as any).itemId = item.id;
    container.errorId = item.id;

    const rect = new PIXI.Graphics();
    rect.rect(0, 0, size, size);
    rect.fill({ color: 0x262626 });
    rect.stroke({ width: 2, color: 0xef4444 });

    const errorIcon = new PIXI.Text({
      text: '!',
      style: { fontSize: 48, fill: 0xef4444, fontWeight: 'bold' },
    });
    errorIcon.x = size / 2 - errorIcon.width / 2;
    errorIcon.y = size / 2 - 60;

    const text = new PIXI.Text({
      text: `生成失败\n${errorMsg}`,
      style: { fontSize: 14, fill: 0x9ca3af, align: 'center', wordWrap: true, wordWrapWidth: size - 40 },
    });
    text.x = size / 2 - text.width / 2;
    text.y = size / 2;

    container.addChild(rect);
    container.addChild(errorIcon);
    container.addChild(text);

    setContainerPosition(container, item.position, index);
    setupErrorNodeEvents(container, item.id);

    return container;
  }

  // 设置容器位置
  function setContainerPosition(container: PIXI.Container, position: { x: number; y: number } | undefined, index: number) {
    if (position) {
      container.x = position.x;
      container.y = position.y;
    } else {
      container.x = 100 + index * 50;
      container.y = 100 + index * 50;
    }
    container.eventMode = 'static';
    container.cursor = 'move';
  }

  // 为占位符设置拖拽
  function setupDragForPlaceholder(container: PIXI.Container, itemId: string) {
    let dragStart: { x: number; y: number } | null = null;

    container.on('pointerdown', (event: PIXI.FederatedPointerEvent) => {
      event.stopPropagation();
      dragStart = { x: event.global.x - container.x, y: event.global.y - container.y };
    });

    container.on('pointermove', (event: PIXI.FederatedPointerEvent) => {
      if (dragStart) {
        container.x = event.global.x - dragStart.x;
        container.y = event.global.y - dragStart.y;
      }
    });

    container.on('pointerup', () => {
      if (dragStart) {
        onImagePositionChange?.(itemId, { x: container.x, y: container.y });
        dragStart = null;
      }
    });

    container.on('pointerupoutside', () => {
      dragStart = null;
    });
  }

  // 为错误节点设置事件
  function setupErrorNodeEvents(container: PixiErrorContainer, itemId: string) {
    let dragStart: { x: number; y: number } | null = null;

    container.on('pointerdown', (event: PIXI.FederatedPointerEvent) => {
      event.stopPropagation();
      dragStart = { x: event.global.x - container.x, y: event.global.y - container.y };
      setSelectedErrorNode(container);
      setSelectedImage(null);
      setSelectedImages([]);
      updateToolbarPosition();
    });

    container.on('pointermove', (event: PIXI.FederatedPointerEvent) => {
      if (dragStart) {
        container.x = event.global.x - dragStart.x;
        container.y = event.global.y - dragStart.y;
        updateToolbarPosition();
      }
    });

    container.on('pointerup', () => {
      if (dragStart) {
        onImagePositionChange?.(itemId, { x: container.x, y: container.y });
        dragStart = null;
      }
    });

    container.on('pointerupoutside', () => {
      dragStart = null;
    });
  }

  // 全局缩放功能
  const handleGlobalZoomIn = useCallback(() => {
    if (!appRef.current || !containerSpriteRef.current) return;

    clearAllSelections();

    const container = containerSpriteRef.current;
    const app = appRef.current;
    const oldScale = container.scale.x;
    const newZoom = Math.min(globalZoom + ZOOM_CONSTANTS.step, ZOOM_CONSTANTS.max);
    const newScale = newZoom / 100;

    // 以舞台中心为缩放原点
    const centerX = app.screen.width / 2;
    const centerY = app.screen.height / 2;

    const mousePointTo = {
      x: centerX / oldScale - container.x / oldScale,
      y: centerY / oldScale - container.y / oldScale,
    };

    const newPos = {
      x: centerX - mousePointTo.x * newScale,
      y: centerY - mousePointTo.y * newScale,
    };

    container.scale.set(newScale);
    container.position.set(newPos.x, newPos.y);
    setGlobalZoom(newZoom);
  }, [globalZoom, clearAllSelections, ZOOM_CONSTANTS]);

  const handleGlobalZoomOut = useCallback(() => {
    if (!appRef.current || !containerSpriteRef.current) return;

    clearAllSelections();

    const container = containerSpriteRef.current;
    const app = appRef.current;
    const oldScale = container.scale.x;
    const newZoom = Math.max(globalZoom - ZOOM_CONSTANTS.step, ZOOM_CONSTANTS.min);
    const newScale = newZoom / 100;

    // 以舞台中心为缩放原点
    const centerX = app.screen.width / 2;
    const centerY = app.screen.height / 2;

    const mousePointTo = {
      x: centerX / oldScale - container.x / oldScale,
      y: centerY / oldScale - container.y / oldScale,
    };

    const newPos = {
      x: centerX - mousePointTo.x * newScale,
      y: centerY - mousePointTo.y * newScale,
    };

    container.scale.set(newScale);
    container.position.set(newPos.x, newPos.y);
    setGlobalZoom(newZoom);
  }, [globalZoom, clearAllSelections, ZOOM_CONSTANTS]);

  return {
    stageRef: appRef,
    layerRef: containerSpriteRef,
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
    globalZoom,
    handleGlobalZoomIn,
    handleGlobalZoomOut,
  };
}
