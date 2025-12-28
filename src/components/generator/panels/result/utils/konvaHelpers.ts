import Konva from "konva";

/**
 * 解析比例字符串为宽高值
 */
export function parseRatio(ratio: string): { width: number; height: number } {
  const [w, h] = ratio.split(":").map((n) => Number(n));
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) {
    return { width: 1, height: 1 };
  }
  return { width: w, height: h };
}

/**
 * 创建 Konva Image 节点
 */
export function createKonvaImage(img: HTMLImageElement, index: number) {
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
  const toolbarHeight = 56;
  const spacing = 12;
  return {
    x: rect.x - containerRect.left,
    y: rect.y - containerRect.top - toolbarHeight - spacing,
  };
}
