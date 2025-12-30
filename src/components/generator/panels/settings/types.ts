import type { ReactElement } from "react";

export type AspectRatio = `${number}:${number}`;

export type AspectRatioOption = {
  portrait: AspectRatio;
  landscape?: AspectRatio;
};

// 表单字段渲染函数类型
export type FormFieldRenderer = (props: {
  settings: GeneratorSettings;
  onChange: (settings: GeneratorSettings) => void;
  aspectRatioOptions: readonly AspectRatioOption[];
  canReset: boolean;
  onReset: () => void;
}) => ReactElement;

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
  renderFormFields?: FormFieldRenderer;
}

export interface GeneratorSettings {
  model: string;
  aspectRatio: AspectRatio;
  variations: 1 | 2 | 3 | 4;
  visibility: "public" | "private";
  resolution?: string;
  format?: string;
}
