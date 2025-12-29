import Konva from "konva";

// 图片尺寸常量
export const IMAGE_MAX_SIZE = {
  width: 300,
  height: 300,
} as const;

// 布局常量
export const LAYOUT_CONSTANTS = {
  gridPadding: 20,
  gridSpacing: 20,
  defaultOffsetX: 100,
  defaultOffsetY: 100,
  defaultStepX: 50,
  defaultStepY: 50,
} as const;

// 工具栏常量
export const TOOLBAR_CONSTANTS = {
  height: 56,
  spacing: 12,
} as const;

// 缩放常量
export const ZOOM_CONSTANTS = {
  min: 10,
  max: 200,
  step: 10,
} as const;

/**
 * 计算图片缩放比例
 */
export function calculateImageScale(imgWidth: number, imgHeight: number): number {
  return Math.min(
    IMAGE_MAX_SIZE.width / imgWidth,
    IMAGE_MAX_SIZE.height / imgHeight
  );
}

/**
 * 解析比例字符串为宽高值
 */
export function parseRatio(ratio: string): { width: number; height: number } {
  const parts = ratio.split(":");
  if (parts.length !== 2) {
    return { width: 1, height: 1 };
  }
  const [w, h] = parts.map((n) => Number(n));
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) {
    return { width: 1, height: 1 };
  }
  return { width: w, height: h };
}

/**
 * 创建 Konva Image 节点
 */
export function createKonvaImage(img: HTMLImageElement, index: number) {
  const scale = calculateImageScale(img.width, img.height);

  return new Konva.Image({
    image: img,
    x: LAYOUT_CONSTANTS.defaultOffsetX + index * LAYOUT_CONSTANTS.defaultStepX,
    y: LAYOUT_CONSTANTS.defaultOffsetY + index * LAYOUT_CONSTANTS.defaultStepY,
    width: img.width,
    height: img.height,
    scaleX: scale,
    scaleY: scale,
    draggable: true,
    name: `image-${index}`,
  });
}

/**
 * 约束图片位置在舞台边界内
 */
export function constrainImagePosition(
  konvaImage: Konva.Image,
  stage: Konva.Stage,
  layer: Konva.Layer
) {
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

/**
 * 约束 Group 位置在舞台边界内
 */
export function constrainGroupPosition(
  group: Konva.Group,
  stage: Konva.Stage,
  layer: Konva.Layer
) {
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

/**
 * 计算工具栏位置
 */
export function calculateToolbarPosition(
  rect: { x: number; y: number },
  containerRect: DOMRect
): { x: number; y: number } | null {
  return {
    x: rect.x - containerRect.left,
    y: rect.y - containerRect.top - TOOLBAR_CONSTANTS.height - TOOLBAR_CONSTANTS.spacing,
  };
}

/**
 * 获取节点位置（统一位置管理逻辑）
 * 优先级：已存在节点位置 > item.position > 默认位置
 */
export function getNodePosition(
  itemPosition: { x: number; y: number } | undefined,
  existingNode: Konva.Node | undefined,
  index: number
): { x: number; y: number } {
  if (existingNode) {
    return { x: existingNode.x(), y: existingNode.y() };
  }
  if (itemPosition) {
    return itemPosition;
  }
  return {
    x: LAYOUT_CONSTANTS.defaultOffsetX + index * LAYOUT_CONSTANTS.defaultStepX,
    y: LAYOUT_CONSTANTS.defaultOffsetY + index * LAYOUT_CONSTANTS.defaultStepY,
  };
}
