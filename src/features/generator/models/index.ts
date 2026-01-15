"use client";

import { Type, Maximize, Pencil, Wand2 } from "lucide-react";
import type { AspectRatioOption, ModelOption } from "../panels/settings/types";
import {
  seedream45FormFields,
  flux2ProFormFields,
  gptImage15FormFields,
  upscaleFormFields,
  removeWatermarkFormFields,
  zImageFormFields,
} from "../panels/settings/formFieldRenderers";
import {
  GptMonoIcon,
  ByteDanceIcon,
  FluxIcon,
  AliIcon,
} from "../modelIcons";
import { aspectRatioToString, getDimensions } from "@/lib/aspect-ratio-utils";
import { createRequestConfig } from "../api/request-config";
import { createNanoBananaProModel } from "./nano-banana-pro";
import type { GeneratorMode, ModeConfig } from "../types";

export const DEFAULT_ASPECT_RATIO_OPTIONS: readonly AspectRatioOption[] = [
  { portrait: "1:1" },
  { portrait: "21:9" },
  { portrait: "4:5", landscape: "5:4" },
  { portrait: "2:3", landscape: "3:2" },
  { portrait: "3:4", landscape: "4:3" },
  { portrait: "9:16", landscape: "16:9" },
];

export const MODE_CONFIGS: Record<GeneratorMode, ModeConfig> = {
  "text-to-image": {
    id: "text-to-image",
    icon: Type,
    labelKey: "prompt",
    descKey: "promptDesc",
    displayFields: ["model", "aspectRatio", "variations"],
    models: {
      "nano-banana-pro": createNanoBananaProModel("text-to-image"),
      "seedream-v4.5": {
        name: "Seedream v4.5",
        icon: ByteDanceIcon,
        features: ["artistic", "creative"],
        descriptionKey: "seedream-v4-5",
        renderFormFields: seedream45FormFields,
        defaultSettings: {
          size: "1:1",
        },
        requestConfig: createRequestConfig(
          "wavespeed/seedream-v4.5/text-to-image",
          "webhook",
          (prompt, _mode, settings) => {
            const { width, height } = getDimensions(settings.size);
            return {
              prompt,
              size: `${width * 2}*${height * 2}`,
            };
          }
        ),
        getCreditsParams: (_settings) => ({}),
        getDisplayContent: (settings) => [
          { label: "Size", value: settings.size || "-" },
        ],
        getVariations: (_settings) => 1,
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
          num_images: 1,
        },
        requestConfig: createRequestConfig(
          "fal/gpt-image-1.5/text-to-image",
          "webhook",
          (prompt, _mode, settings) => ({
            prompt,
            output_format: settings.format,
            background: settings.background,
            quality: settings.quality,
            num_images: settings.num_images,
          })
        ),
        getCreditsParams: (settings) => ({
          size: settings.size,
          quality: settings.quality,
          num_images: settings.num_images || 1,
        }),
        getDisplayContent: (settings) => [
          { label: "Size", value: settings.size || "-" },
          { label: "Quality", value: settings.quality || "-" },
          { label: "Format", value: settings.format || "-" },
        ],
        getVariations: (settings) => settings.num_images || 1,
      },
      "flux-2-pro": {
        name: "Flux 2 Pro",
        icon: FluxIcon,
        features: ["professional", "highQuality"],
        descriptionKey: "flux-2-pro",
        renderFormFields: flux2ProFormFields,
        defaultSettings: {
          size: "1:1",
        },
        requestConfig: createRequestConfig(
          "wavespeed/flux-2-pro/text-to-image",
          "webhook",
          (prompt, _mode, settings) => ({
            prompt,
            size: aspectRatioToString(settings.size),
          })
        ),
        getCreditsParams: (_settings) => ({}),
        getDisplayContent: (settings) => [
          { label: "Size", value: settings.size || "-" },
        ],
        getVariations: (_settings) => 1,
      },
      "z-image": {
        name: "Z Image Turbo",
        icon: AliIcon,
        features: ["realtime", "ultraFast"],
        descriptionKey: "z-image-turbo",
        renderFormFields: zImageFormFields,
        defaultSettings: {
          size: "1:1",
        },
        requestConfig: createRequestConfig(
          "wavespeed/z-image/turbo",
          "webhook",
          (prompt, _mode, settings) => ({
            prompt,
            size: aspectRatioToString(settings.size),
          })
        ),
        getCreditsParams: (_settings) => ({}),
        getDisplayContent: (settings) => [
          { label: "Size", value: settings.size || "-" },
        ],
        getVariations: (_settings) => 1,
      },
    },
    defaultModel: "nano-banana-pro",
  },
  upscale: {
    id: "upscale",
    icon: Maximize,
    labelKey: "upscale",
    descKey: "upscaleDesc",
    displayFields: ["model", "resolution", "format"],
    models: {
      upscale: {
        name: "Upscale",
        icon: AliIcon,
        features: ["fast", "highQuality"],
        descriptionKey: "upscale",
        renderFormFields: upscaleFormFields,
        defaultSettings: {
          resolution: "2k",
          format: "jpeg",
        },
        requestConfig: createRequestConfig(
          "wavespeed/image-upscaler",
          "direct",
          (_prompt, _mode, settings, images) => ({
            image: images?.[0],
            target_resolution: settings.resolution,
            output_format: settings.format,
          })
        ),
        getCreditsParams: (settings) => ({
          resolution: settings.resolution,
        }),
        getDisplayContent: (settings) => [
          { label: "Resolution", value: settings.resolution || "-" },
          { label: "Format", value: settings.format || "-" },
        ],
        getVariations: () => 1,
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
      "nano-banana-pro": createNanoBananaProModel("edit-image"),
      "seedream-v4.5": {
        name: "Seedream v4.5",
        icon: ByteDanceIcon,
        features: ["artistic", "creative"],
        descriptionKey: "seedream-v4-5",
        renderFormFields: seedream45FormFields,
        defaultSettings: {
          size: "1:1",
        },
        requestConfig: createRequestConfig(
          "wavespeed/seedream-v4.5/image-to-image",
          "webhook",
          (prompt, _mode, settings, images) => ({
            prompt,
            images,
            size: aspectRatioToString(settings.size),
          })
        ),
        getCreditsParams: (_settings) => ({}),
        getDisplayContent: (settings) => [
          { label: "Size", value: settings.size || "-" },
        ],
        getVariations: (_settings) => 1,
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
          num_images: 1,
        },
        requestConfig: createRequestConfig(
          "fal/gpt-image-1.5/image-to-image",
          "webhook",
          (prompt, _mode, settings, images) => ({
            prompt,
            image_urls: images,
            output_format: settings.format,
            num_images: settings.num_images,
            quality: settings.quality,
            size: settings.size,
            background: settings.background,
          })
        ),
        getCreditsParams: (settings) => ({
          size: settings.size,
          quality: settings.quality,
          num_images: settings.num_images || 1,
        }),
        getDisplayContent: (settings) => [
          { label: "Size", value: settings.size || "-" },
          { label: "Quality", value: settings.quality || "-" },
          { label: "Format", value: settings.format || "-" },
        ],
        getVariations: (settings) => settings.num_images || 1,
      },
      "flux-2-pro": {
        name: "Flux 2 Pro",
        icon: FluxIcon,
        features: ["professional", "highQuality"],
        descriptionKey: "flux-2-pro",
        renderFormFields: flux2ProFormFields,
        defaultSettings: {
          size: "1:1",
        },
        requestConfig: createRequestConfig(
          "wavespeed/flux-2-pro/image-to-image",
          "webhook",
          (prompt, _mode, settings, images) => ({
            prompt,
            images,
            size: aspectRatioToString(settings.size),
          })
        ),
        getCreditsParams: (_settings) => ({}),
        getDisplayContent: (settings) => [
          { label: "Size", value: settings.size || "-" },
        ],
        getVariations: (_settings) => 1,
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
        requestConfig: createRequestConfig(
          "wavespeed/image-watermark-remover",
          "direct",
          (_prompt, _mode, settings, images) => ({
            image: images?.[0],
            output_format: settings.format,
          })
        ),
        getCreditsParams: (_settings) => ({
          num_images: 1,
        }),
        getDisplayContent: (settings) => [
          { label: "Format", value: settings.format || "-" },
        ],
        getVariations: () => 1,
      },
    },
    defaultModel: "remove-watermark",
  },
};

export const MODE_OPTIONS = Object.values(MODE_CONFIGS);

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
