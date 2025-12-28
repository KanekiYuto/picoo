export type AspectRatio = `${number}:${number}`;

export type AspectRatioOption = {
  portrait: AspectRatio;
  landscape?: AspectRatio;
};

export interface ModelOption {
  id: string;
  name: string;
  nameKey?: string; // 国际化key，如 "models.nanoBanana"
  icon?: React.ComponentType<{ className?: string }>;
  glyph?: string;
  locked?: boolean;
  tag?: string;
  availability?: string;
  features?: string[];
  descriptionKey?: string;
  aspectRatioOptions?: readonly AspectRatioOption[];
  modelType?: string; // 模型类别，用于展示
}

export interface GeneratorSettings {
  model: string;
  aspectRatio: AspectRatio;
  variations: 1 | 2 | 3 | 4;
  visibility: "public" | "private";
  resolution?: string;
  format?: string;
}
