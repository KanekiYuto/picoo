import type { AspectRatio, AspectRatioOption, GeneratorSettings, ModelOption } from "./types";

/**
 * 解析比例字符串为宽高值
 */
export function parseRatio(ratio: AspectRatio): { width: number; height: number } {
  const [w, h] = ratio.split(":").map((n) => Number(n));
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) {
    return { width: 1, height: 1 };
  }
  return { width: w, height: h };
}

/**
 * 计算比例预览的实际尺寸
 */
export function getPreviewSize(
  width: number,
  height: number,
  maxSize: number
): { width: number; height: number } {
  const r = width / height;
  if (r > 1) return { width: maxSize, height: maxSize / r };
  if (r < 1) return { width: maxSize * r, height: maxSize };
  return { width: maxSize, height: maxSize };
}

/**
 * 计算比例值（宽/高）
 */
export function calculateRatioValue(w: number, h: number): number {
  return w / h;
}

/**
 * 查找配对的比例（如果有横竖两种）
 */
export function findPairedRatio(
  currentRatio: AspectRatio,
  option: AspectRatioOption
): AspectRatio | null {
  if (!option.landscape || option.landscape === option.portrait) {
    return null;
  }
  return currentRatio === option.portrait ? option.landscape : option.portrait;
}

/**
 * 检查是否支持该比例
 */
export function isAspectRatioSupported(
  options: readonly AspectRatioOption[],
  ratio: AspectRatio
): boolean {
  return options.some((opt) => opt.portrait === ratio || opt.landscape === ratio);
}

/**
 * 根据ID查找模型
 */
export function getModelById(modelId: string, models: readonly ModelOption[]): ModelOption | undefined {
  return models.find((model) => model.id === modelId);
}

/**
 * 获取默认模型（第一个模型）
 */
export function getDefaultModel(models: readonly ModelOption[]): ModelOption | undefined {
  return models[0];
}

/**
 * 获取模型的默认比例
 */
export function getDefaultAspectRatio(options: readonly AspectRatioOption[] | undefined): AspectRatio {
  return (options?.[0]?.portrait ?? "1:1") as AspectRatio;
}

/**
 * 检查两个设置是否相等
 */
export function areSettingsEqual(
  a: GeneratorSettings,
  b: GeneratorSettings
): boolean {
  // 只比较 model 字段，因为其他字段是动态的
  if (a.model !== b.model) return false;

  // 比较所有公共字段
  const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const key of allKeys) {
    if (a[key] !== b[key]) return false;
  }

  return true;
}

/**
 * 归一化设置（填充默认值，验证数据）
 */
export function normalizeSettings(
  settings: Partial<GeneratorSettings> | undefined,
  models: readonly ModelOption[]
): GeneratorSettings {
  const defaultModel = getDefaultModel(models);
  const defaultModelId = defaultModel?.id ?? "nano-banana-pro";

  const modelId = settings?.model ?? defaultModelId;
  const model = getModelById(modelId, models) ?? defaultModel;

  const variations = ([1, 2, 3, 4] as const).includes(settings?.variations as GeneratorSettings["variations"])
    ? (settings?.variations as GeneratorSettings["variations"])
    : 1;

  const visibility = settings?.visibility === "private" ? "private" : "public";

  return {
    model: model?.id ?? modelId,
    variations,
    visibility,
    ...settings,
  };
}
