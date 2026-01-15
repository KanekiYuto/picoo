import type { ComponentType } from "react";
import type {
  FormFieldRenderer,
  RequestConfig,
  GeneratorSettings,
} from "./panels/settings/types";

export type GeneratorMode =
  | "text-to-image"
  | "upscale"
  | "edit-image"
  | "remove-watermark";

export interface DisplayContent {
  label: string;
  value: string;
}

export interface ModelInfo {
  name: string;
  icon: ComponentType<{ className?: string }>;
  features?: string[];
  descriptionKey?: string;
  renderFormFields: FormFieldRenderer;
  defaultSettings: DefaultSettings;
  requestConfig: RequestConfig;
  getCreditsParams: (settings: GeneratorSettings) => Record<string, any>;
  getDisplayContent: (settings: GeneratorSettings) => DisplayContent[];
  getVariations: (settings: GeneratorSettings) => number;
}

export interface DefaultSettings {
  [key: string]: any;
}

export type DisplayField =
  | "model"
  | "aspectRatio"
  | "variations"
  | "resolution"
  | "format";

export interface ModeConfig {
  id: GeneratorMode;
  icon: ComponentType<{ className?: string }>;
  labelKey: string;
  descKey: string;
  models: Record<string, ModelInfo>;
  defaultModel: string;
  displayFields: DisplayField[];
}
