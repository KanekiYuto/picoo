"use client";

import { Type, Maximize, Pencil, Wand2 } from "lucide-react";
import type { AspectRatio, AspectRatioOption, ModelOption, FormFieldRenderer, RequestConfig, GeneratorSettings, RequestResponse } from "./panels/settings/types";
import {
  defaultTextToImageFormFields,
  seedream45FormFields,
  flux2ProFormFields,
  gptImage15FormFields,
  nanoBananaProFormFields,
  defaultImageToImageFormFields,
  upscaleFormFields,
  removeWatermarkFormFields,
} from "./panels/settings/formFieldRenderers";
import {
  GoogleMonoIcon,
  GptMonoIcon,
  ByteDanceIcon,
  FluxIcon,
  AliIcon,
} from "./modelIcons";

export type GeneratorMode = "text-to-image" | "upscale" | "edit-image" | "remove-watermark";

// 处理请求参数
const createRequestConfig = (
  apiRoute: string,
  type: 'direct' | 'webhook',
  processParams: (
    prompt: string | undefined,
    mode: string,
    settings: GeneratorSettings,
    images: string[] | undefined
  ) => Record<string, any>
): RequestConfig => {
  return {
    type,
    handler: async (prompt, mode, settings, images): Promise<RequestResponse> => {
      const response = await fetch(`/api/ai-generator/provider/${apiRoute}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(processParams(prompt, mode, settings, images)),
      });

      if (!response.ok) {
        return {
          success: false,
          error: `API request failed: ${response.statusText}`,
        };
      }

      return await response.json();
    },
  }
}

// 辅助函数：生成 webhook 类型的 requestConfig
function createWebhookConfig(apiRoute: string): RequestConfig {
  return {
    type: 'webhook',
    handler: async (prompt, mode, settings, images): Promise<RequestResponse> => {
      // 构建请求体，过滤掉 undefined 的值
      const requestBody: Record<string, any> = {};

      if (prompt !== undefined) requestBody.prompt = prompt;
      if (images?.[0] !== undefined) requestBody.image_url = images[0];
      if (settings.aspectRatio !== undefined) requestBody.aspect_ratio = settings.aspectRatio;
      if (settings.format !== undefined) requestBody.output_format = settings.format;
      if (settings.resolution !== undefined) requestBody.resolution = settings.resolution;
      if (settings.variations !== undefined) requestBody.variations = settings.variations;

      const response = await fetch(`/api/ai-generator/provider/${apiRoute}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        return {
          success: false,
          error: `API request failed: ${response.statusText}`,
        };
      }

      return await response.json();
    },
  };
}

// 默认纵横比选项
export const DEFAULT_ASPECT_RATIO_OPTIONS: readonly AspectRatioOption[] = [
  { portrait: "1:1" },
  { portrait: "21:9" },
  { portrait: "4:5", landscape: "5:4" },
  { portrait: "2:3", landscape: "3:2" },
  { portrait: "3:4", landscape: "4:3" },
  { portrait: "9:16", landscape: "16:9" },
];

// 模型配置接口
export interface ModelInfo {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  features?: string[];
  descriptionKey?: string;
  renderFormFields: FormFieldRenderer;
  defaultSettings: DefaultSettings;
  requestConfig: RequestConfig;
}

// 默认设置接口
export interface DefaultSettings {
  [key: string]: any;
}

// ModelDisplay 显示字段类型
export type DisplayField = "model" | "aspectRatio" | "variations" | "resolution" | "format";

// 模式配置接口
export interface ModeConfig {
  id: GeneratorMode;
  icon: React.ComponentType<{ className?: string }>;
  labelKey: string;
  descKey: string;
  models: Record<string, ModelInfo>; // 支持的模型及其信息
  defaultModel: string; // 默认模型
  displayFields: DisplayField[]; // ModelDisplay 中显示的字段
}

// 模式配置
export const MODE_CONFIGS: Record<GeneratorMode, ModeConfig> = {
  "text-to-image": {
    id: "text-to-image",
    icon: Type,
    labelKey: "prompt",
    descKey: "promptDesc",
    displayFields: ["model", "aspectRatio", "variations"],
    models: {
      "nano-banana-pro": {
        name: "Nano Banana Pro",
        icon: GoogleMonoIcon,
        features: ["fast", "simple"],
        descriptionKey: "nano-banana-pro",
        renderFormFields: nanoBananaProFormFields,
        defaultSettings: {
          aspect_ratio: "1:1",
          resolution: "1k",
          output_format: "png",
        },
        requestConfig: createRequestConfig("wavespeed/nano-banana-pro/text-to-image", "webhook", (prompt, _mode, settings, _images) => {
          return {
            prompt,
            aspect_ratio: settings.aspect_ratio,
            output_format: settings.output_format,
            resolution: settings.resolution,
          };
        }),
      },
      "seedream-v4.5": {
        name: "Seedream v4.5",
        icon: ByteDanceIcon,
        features: ["artistic", "creative"],
        descriptionKey: "seedream-v4-5",
        renderFormFields: seedream45FormFields,
        defaultSettings: {
          size: "1:1",
        },
        requestConfig: createRequestConfig("wavespeed/seedream-v4.5/text-to-image", "webhook", (prompt, mode, settings, images) => {
          return {
            prompt,
            size: settings.size,
          };
        }),
      },
      "gpt-image-1.5": {
        name: "ChatGPT 1.5",
        icon: GptMonoIcon,
        features: ["versatile", "stable"],
        descriptionKey: "chatgpt-1-5",
        renderFormFields: gptImage15FormFields,
        defaultSettings: {
          size: "1024x1024",
          format: "jpeg",
          background: "auto",
          quality: "medium",
        },
        requestConfig: createRequestConfig("fal/gpt-image-1.5/text-to-image", "webhook", (prompt, _mode, settings, _images) => {
          return {
            prompt,
            output_format: settings.format,
            background: settings.background,
            quality: settings.quality,
          };
        }),
      },
      "flux-2-pro": {
        name: "Flux 2 Pro",
        icon: FluxIcon,
        features: ["professional", "highQuality"],
        descriptionKey: "flux-2-pro",
        renderFormFields: flux2ProFormFields,
        defaultSettings: {
          aspect_ratio: "1:1",
        },
        requestConfig: createRequestConfig("wavespeed/flux-2-pro/text-to-image", "webhook", (prompt, _mode, settings, _images) => {
          return {
            prompt,
            aspect_ratio: settings.aspect_ratio,
          };
        }),
      },
      "z-image": {
        name: "Z Image Turbo",
        icon: AliIcon,
        features: ["realtime", "ultraFast"],
        descriptionKey: "z-image-turbo",
        renderFormFields: defaultTextToImageFormFields,
        defaultSettings: {
          aspect_ratio: "1:1",
        },
        requestConfig: createRequestConfig("wavespeed/z-image/turbo", "webhook", (prompt, _mode, settings, _images) => {
          return {
            prompt,
            aspect_ratio: settings.aspect_ratio,
          };
        }),
      },
    },
    defaultModel: "nano-banana-pro",
  },
  "upscale": {
    id: "upscale",
    icon: Maximize,
    labelKey: "upscale",
    descKey: "upscaleDesc",
    displayFields: ["model", "resolution", "format"],
    models: {
      "upscale": {
        name: "Upscale",
        icon: AliIcon,
        features: ["fast", "highQuality"],
        descriptionKey: "upscale",
        renderFormFields: upscaleFormFields,
        defaultSettings: {
          resolution: "2k",
          format: "jpeg",
        },
        requestConfig: createRequestConfig("wavespeed/image-upscaler", "direct", (prompt, _mode, settings, images) => {
          return {
            image: images?.[0],
            target_resolution: settings.resolution,
            output_format: settings.format,
          };
        }),
      },
    },
    defaultModel: "upscale",
  },
  "edit-image": {
    id: "edit-image",
    icon: Pencil,
    labelKey: "edit",
    descKey: "editDesc",
    displayFields: ["model", "aspectRatio", "variations"],
    models: {
      "nano-banana-pro": {
        name: "Nano Banana Pro",
        icon: GoogleMonoIcon,
        features: ["fast", "simple"],
        descriptionKey: "nano-banana-pro",
        renderFormFields: nanoBananaProFormFields,
        defaultSettings: {
          aspect_ratio: "1:1",
          resolution: "1k",
          output_format: "png",
        },
        requestConfig: createRequestConfig("wavespeed/nano-banana-pro/image-to-image", "webhook", (prompt, _mode, settings, images) => {
          return {
            prompt,
            images,
            aspect_ratio: settings.aspect_ratio,
            output_format: settings.output_format,
            resolution: settings.resolution,
          };
        }),
      },
      "seedream-v4.5": {
        name: "Seedream v4.5",
        icon: ByteDanceIcon,
        features: ["artistic", "creative"],
        descriptionKey: "seedream-v4-5",
        renderFormFields: seedream45FormFields,
        defaultSettings: {
          size: "1:1",
        },
        requestConfig: createRequestConfig("wavespeed/seedream-v4.5/image-to-image", "webhook", (prompt, _mode, settings, images) => {
          return {
            prompt,
            images,
            size: settings.size,
          };
        }),
      },
      "gpt-image-1.5": {
        name: "ChatGPT 1.5",
        icon: GptMonoIcon,
        features: ["versatile", "stable"],
        descriptionKey: "chatgpt-1-5",
        renderFormFields: gptImage15FormFields,
        defaultSettings: {
          size: "1024x1024",
          format: "jpeg",
          background: "auto",
          quality: "medium",
        },
        requestConfig: createRequestConfig("fal/gpt-image-1.5/image-to-image", "webhook", (prompt, _mode, settings, images) => {
          return {
            prompt,
            image_urls: images,
            output_format: settings.format,
            num_images: settings.num_images,
            quality: settings.quality,
            size: settings.size,
            background: settings.background,
          };
        }),
      },
      "flux-2-pro": {
        name: "Flux 2 Pro",
        icon: FluxIcon,
        features: ["professional", "highQuality"],
        descriptionKey: "flux-2-pro",
        renderFormFields: flux2ProFormFields,
        defaultSettings: {
          aspect_ratio: "1:1",
        },
        requestConfig: createRequestConfig("wavespeed/flux-2-pro/image-to-image", "webhook", (prompt, _mode, settings, images) => {
          return {
            prompt,
            images: images,
            aspect_ratio: settings.aspect_ratio,
          };
        }),
      },
    },
    defaultModel: "nano-banana-pro",
  },
  "remove-watermark": {
    id: "remove-watermark",
    icon: Wand2,
    labelKey: "removeWatermark",
    descKey: "removeWatermarkDesc",
    displayFields: ["model", "format"],
    models: {
      "remove-watermark": {
        name: "Remove Watermark",
        icon: AliIcon,
        features: ["fast", "simple"],
        descriptionKey: "remove-watermark",
        renderFormFields: removeWatermarkFormFields,
        defaultSettings: {
          format: "png",
        },
        requestConfig: createRequestConfig("wavespeed/image-watermark-remover", "direct", (_prompt, _mode, settings, images) => {
          return {
            image: images?.[0],
            output_format: settings.format,
          };
        }),
      },
    },
    defaultModel: "remove-watermark",
  },
};

// 导出模式选项数组（用于 UI 渲染）
export const MODE_OPTIONS = Object.values(MODE_CONFIGS);

// 从 MODE_CONFIGS 中提取所有模型，生成统一的 MODELS 数组
export const MODELS: ModelOption[] = (() => {
  const modelMap = new Map<string, ModelOption>();

  Object.values(MODE_CONFIGS).forEach((modeConfig) => {
    if (modeConfig.models) {
      Object.entries(modeConfig.models).forEach(([id, modelInfo]) => {
        if (!modelMap.has(id)) {
          modelMap.set(id, {
            id,
            name: modelInfo.name,
            icon: modelInfo.icon,
            features: modelInfo.features,
            descriptionKey: modelInfo.descriptionKey,
            renderFormFields: modelInfo.renderFormFields,
          });
        }
      });
    }
  });

  return Array.from(modelMap.values());
})();
