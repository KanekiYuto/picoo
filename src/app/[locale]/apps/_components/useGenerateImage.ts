"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useAppPreviewStore } from "./app-preview-store";

export interface GenerateImageOptions {
  image: File;
  prompt: string;
  size: string;
}

/** 上传图片到 R2，返回 URL */
async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(
    "/api/upload?modelType=edit-image&modelName=seedream-v4.5",
    { method: "POST", body: formData },
  );

  const json = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.error ?? "Upload failed");
  }

  return json.data.url as string;
}

/** 提交生成任务，返回任务记录 ID */
async function submitGeneration(
  imageUrl: string,
  prompt: string,
  size: string,
): Promise<string> {
  const res = await fetch("/api/ai-generator/provider/wavespeed/seedream-v4.5/image-to-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt,
      size,
      images: [imageUrl],
      enable_base64_output: false,
      enable_sync_mode: false,
      is_private: false,
    }),
  });

  const json = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.error ?? "Generation failed");
  }

  return json.data.task_id as string;
}

/** 轮询任务状态，完成后返回结果图片 URL */
async function pollStatus(
  id: string,
  onProgress: (value: number) => void,
  signal: AbortSignal,
): Promise<string> {
  while (true) {
    if (signal.aborted) throw new Error("Aborted");

    await new Promise<void>((resolve) => setTimeout(resolve, 2000));

    if (signal.aborted) throw new Error("Aborted");

    const res = await fetch(`/api/ai-generator/status/${id}`, { signal });
    const json = await res.json();

    if (!res.ok || !json.success) {
      throw new Error(json.error ?? "Status check failed");
    }

    const { status, progress, results, error } = json.data as {
      status: string;
      progress: number;
      results?: Array<{ url: string }>;
      error?: string;
    };

    if (status === "completed") {
      const url = results?.[0]?.url;
      if (!url) throw new Error("No result image");
      return url;
    }

    if (status === "failed") {
      throw new Error(error ?? "Generation failed");
    }

    // pending / processing：映射到 0.3~0.99
    if (typeof progress === "number") {
      onProgress(0.3 + (progress / 100) * 0.69);
    }
  }
}

export function useGenerateImage() {
  const t = useTranslations("apps.components.preview");
  const begin = useAppPreviewStore((s) => s.begin);
  const setProgress = useAppPreviewStore((s) => s.setProgress);
  const succeed = useAppPreviewStore((s) => s.succeed);
  const fail = useAppPreviewStore((s) => s.fail);

  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      controllerRef.current?.abort();
    };
  }, []);

  async function generate({ image, prompt, size }: GenerateImageOptions) {
    // 终止上一次未完成的轮询
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      // 阶段一：上传
      begin({ value: 0, label: t("uploading") });

      const imageUrl = await uploadImage(image);

      // 阶段二：提交生成任务
      setProgress({ value: 0.2, label: t("generating") });

      const taskId = await submitGeneration(imageUrl, prompt, size);

      // 阶段三：轮询进度
      setProgress({ value: 0.3, label: t("generating") });

      const resultUrl = await pollStatus(
        taskId,
        (value) => setProgress({ value, label: t("generating") }),
        controller.signal,
      );

      succeed({ url: resultUrl });
    } catch (err) {
      if ((err as Error).message === "Aborted") return;
      fail((err as Error).message ?? "Unknown error");
    }
  }

  return { generate };
}
