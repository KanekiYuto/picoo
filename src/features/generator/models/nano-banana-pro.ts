"use client";

import type { GeneratorMode, ModelInfo } from "../types";
import { nanoBananaProFormFields } from "../panels/settings/formFieldRenderers";
import { GoogleMonoIcon } from "../modelIcons";
import { createRequestConfig } from "../api/request-config";

export function createNanoBananaProModel(mode: GeneratorMode): ModelInfo {
  const apiSuffix = mode === "edit-image" ? "image-to-image" : "text-to-image";

  return {
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
    requestConfig: createRequestConfig(
      `wavespeed/nano-banana-pro/${apiSuffix}`,
      "webhook",
      (prompt, _mode, settings, images) => {
        const params: Record<string, any> = {
          prompt,
          aspect_ratio: settings.aspect_ratio,
          output_format: settings.output_format,
          resolution: settings.resolution,
        };
        if (mode === "edit-image" && images) {
          params.images = images;
        }
        return params;
      }
    ),
    getCreditsParams: (settings) => ({
      resolution: settings.resolution,
    }),
    getDisplayContent: (settings) => [
      { label: "Aspect Ratio", value: settings.aspect_ratio || "-" },
      { label: "Resolution", value: settings.resolution || "-" },
      { label: "Format", value: settings.output_format || "-" },
    ],
    getVariations: (_settings) => 1,
  };
}
