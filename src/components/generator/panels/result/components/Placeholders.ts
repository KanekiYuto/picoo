import Konva from "konva";

/**
 * 创建加载占位符
 */
export function createLoadingPlaceholder(index: number) {
  const size = 300;
  const group = new Konva.Group({
    x: 100 + index * 50,
    y: 100 + index * 50,
    name: `loading-${index}`,
  });

  // 背景矩形
  const rect = new Konva.Rect({
    width: size,
    height: size,
    fill: '#262626',
    stroke: '#4b5cc4',
    strokeWidth: 2,
    cornerRadius: 8,
  });

  // 加载文本
  const text = new Konva.Text({
    text: '生成中...',
    fontSize: 16,
    fill: '#9ca3af',
    width: size,
    height: size,
    align: 'center',
    verticalAlign: 'middle',
  });

  group.add(rect);
  group.add(text);

  return group;
}

/**
 * 创建错误占位符
 */
export function createErrorPlaceholder(errorMsg: string, index: number) {
  const size = 300;
  const group = new Konva.Group({
    x: 100 + index * 50,
    y: 100 + index * 50,
    name: `error-${index}`,
    draggable: true,
  });

  // 背景矩形
  const rect = new Konva.Rect({
    width: size,
    height: size,
    fill: '#262626',
    stroke: '#ef4444',
    strokeWidth: 2,
    cornerRadius: 8,
  });

  // 错误图标
  const errorIcon = new Konva.Text({
    text: '!',
    fontSize: 48,
    fill: '#ef4444',
    width: size,
    y: size / 2 - 60,
    align: 'center',
    fontStyle: 'bold',
  });

  // 错误文本
  const text = new Konva.Text({
    text: `生成失败\n${errorMsg}`,
    fontSize: 14,
    fill: '#9ca3af',
    width: size - 40,
    x: 20,
    y: size / 2,
    align: 'center',
  });

  group.add(rect);
  group.add(errorIcon);
  group.add(text);

  return group;
}
