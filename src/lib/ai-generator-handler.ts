import type { GeneratorSettings } from "@/components/generator/panels/settings";
import type { GeneratorMode } from "@/components/generator/config";
import { MODE_CONFIGS } from "@/components/generator/config";

interface GenerateParams {
  prompt: string;
  mode: GeneratorMode;
  settings: GeneratorSettings;
  images: string[];
}

/**
 * 处理AI生成请求
 */
export async function handleAIGenerate(params: GenerateParams) {
  const { prompt, mode, settings, images } = params;

  console.log("AI Generate Request:", { prompt, mode, settings, images });

  switch (mode) {
    case "text-to-image":
      return handleTextToImage({ prompt, settings });
    case "upscale":
      return handleUpscale({ images, settings });
    case "edit-image":
      return handleEditImage({ prompt, images, settings });
    case "remove-watermark":
      return handleRemoveWatermark({ images, settings });
    default:
      throw new Error(`Unsupported mode: ${mode}`);
  }
}

async function handleTextToImage(params: { prompt: string; settings: GeneratorSettings }) {
  const { prompt, settings } = params;

  const modeConfig = MODE_CONFIGS["text-to-image"];
  const modelInfo = modeConfig.models?.[settings.model];
  if (!modelInfo) {
    throw new Error(`Unsupported model: ${settings.model}`);
  }

  const response = await fetch(`/api/ai-generator/provider/${modelInfo.apiRoute}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt,
      aspect_ratio: settings.aspectRatio,
      output_format: "jpeg",
      resolution: "1k",
    }),
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return await response.json();
}

async function handleUpscale(params: { images: string[]; settings: GeneratorSettings }) {
  const { images, settings } = params;

  const modeConfig = MODE_CONFIGS["upscale"];
  if (!modeConfig.apiRoute) {
    throw new Error("Upscale API route not configured");
  }

  const response = await fetch(`/api/ai-generator/provider/${modeConfig.apiRoute}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      image_url: images[0],
    }),
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return await response.json();
}

async function handleEditImage(params: { prompt: string; images: string[]; settings: GeneratorSettings }) {
  const { prompt, images, settings } = params;

  const modeConfig = MODE_CONFIGS["edit-image"];
  const modelInfo = modeConfig.models?.[settings.model];
  if (!modelInfo) {
    throw new Error(`Unsupported model for edit-image: ${settings.model}`);
  }

  const response = await fetch(`/api/ai-generator/provider/${modelInfo.apiRoute}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt,
      image_url: images[0],
      aspect_ratio: settings.aspectRatio,
      output_format: "jpeg",
      resolution: "1k",
    }),
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return await response.json();
}

async function handleRemoveWatermark(params: { images: string[]; settings: GeneratorSettings }) {
  const { images, settings } = params;

  const modeConfig = MODE_CONFIGS["remove-watermark"];
  if (!modeConfig.apiRoute) {
    throw new Error("Remove watermark API route not configured");
  }

  const response = await fetch(`/api/ai-generator/provider/${modeConfig.apiRoute}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      image_url: images[0],
    }),
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return await response.json();
}
