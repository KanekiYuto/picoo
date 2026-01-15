"use client";

import type {
  RequestConfig,
  GeneratorSettings,
  RequestResponse,
} from "../panels/settings/types";

export function createRequestConfig(
  apiRoute: string,
  type: "direct" | "webhook",
  processParams: (
    prompt: string | undefined,
    mode: string,
    settings: GeneratorSettings,
    images: string[] | undefined
  ) => Record<string, any>
): RequestConfig {
  return {
    type,
    handler: async (
      prompt,
      mode,
      settings,
      images
    ): Promise<RequestResponse> => {
      const response = await fetch(`/api/ai-generator/provider/${apiRoute}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
  };
}
