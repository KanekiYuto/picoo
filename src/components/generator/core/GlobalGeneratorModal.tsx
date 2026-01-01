"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useGeneratorStore } from "@/stores/generatorStore";
import { downloadImage } from "@/lib/image-utils";
import { handleAIGenerate, startPolling } from "../apiHandler";
import { GlobalGenerator } from "./GlobalGenerator";
import { UploadPanel } from "../panels/upload/UploadPanel";
import { SettingsPanel, type GeneratorSettings } from "../panels/settings";
import { ModeSelectorPanel, type GeneratorMode } from "../panels/mode";
import { ResultPanel, type ImageItem } from "../panels/result/ResultPanel";
import { MobileImagePanel } from "../panels/mobile/MobileImagePanel";
import { MODE_CONFIGS } from "../config";

/**
 * 全局生成器模态框
 */
export function GlobalGeneratorModal() {
  const { isGeneratorModalOpen, closeGeneratorModal } = useGeneratorStore();
  const [activePanel, setActivePanel] = useState<"upload" | "settings" | "mode" | "mobile-images" | null>(null);
  const [uploadImages, setUploadImages] = useState<string[]>([]);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | undefined>(undefined);
  const [mode, setMode] = useState<GeneratorMode>("text-to-image");
  const [replaceIndex, setReplaceIndex] = useState<number | undefined>(undefined);

  // 跟踪 blob URLs 以便清理
  const blobUrlsRef = useRef<Set<string>>(new Set());

  // 清理所有 blob URLs
  useEffect(() => {
    return () => {
      blobUrlsRef.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });
      blobUrlsRef.current.clear();
    };
  }, []);

  // 根据 mode 和 model 获取默认设置
  const getDefaultSettings = (currentMode: GeneratorMode, modelName?: string): GeneratorSettings => {
    const modeConfig = MODE_CONFIGS[currentMode];
    const targetModelName = modelName || modeConfig.defaultModel || "nano-banana-pro";
    const modelInfo = modeConfig.models?.[targetModelName];
    const modelDefaults = modelInfo?.defaultSettings || {};

    return {
      model: targetModelName,
      variations: 1,
      visibility: "public",
      ...modelDefaults,
    };
  };

  // 智能切换模式：如果当前模型在新模式下可用则保留，否则使用新模式的默认模型
  const handleModeChange = (newMode: GeneratorMode) => {
    setMode(newMode);
    // 切换模式时清空上传的图片
    setUploadImages([]);
    setSelectedImageUrl(undefined);
    setReplaceIndex(undefined);

    const newModeConfig = MODE_CONFIGS[newMode];
    const newModeModels = newModeConfig?.models;
    const currentModel = settings.model;

    // 检查当前模型是否在新模式中存在
    const modelExistsInNewMode = newModeModels && currentModel && newModeModels[currentModel];

    if (modelExistsInNewMode) {
      // 模型在新模式中存在，保留模型但更新其默认设置
      const newModelDefaults = getDefaultSettings(newMode, currentModel);
      setSettings({
        ...settings,
        ...newModelDefaults,
      });
    } else {
      // 模型不在新模式中，切换到新模式的默认模型和默认设置
      setSettings(getDefaultSettings(newMode));
    }
  };

  const [settings, setSettings] = useState<GeneratorSettings>(() => getDefaultSettings("text-to-image"));

  // 结果面板状态
  const [resultImages, setResultImages] = useState<ImageItem[]>([]);

  const handleImageSelect = async (file: File) => {
    const localUrl = URL.createObjectURL(file);
    blobUrlsRef.current.add(localUrl);
    setUploadImages((prev) => [...prev, localUrl]);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/asset/upload", {
        method: "POST",
        body: formData,
      });

      const result = (await response.json()) as
        | { success: true; data: { url: string } }
        | { success: false; error?: string };

      if (!result.success) {
        throw new Error(result.error || "Upload failed");
      }

      const uploadedUrl = result.data.url;
      // 替换最后一张图片的URL为真实URL
      setUploadImages((prev) => {
        const newImages = [...prev];
        const oldUrl = newImages[newImages.length - 1];
        // 撤销 blob URL
        if (blobUrlsRef.current.has(oldUrl)) {
          URL.revokeObjectURL(oldUrl);
          blobUrlsRef.current.delete(oldUrl);
        }
        newImages[newImages.length - 1] = uploadedUrl;
        return newImages;
      });
    } catch (error) {
      console.error("Upload image failed:", error);
      // 移除失败的图片并清理 blob URL
      setUploadImages((prev) => {
        const oldUrl = prev[prev.length - 1];
        if (blobUrlsRef.current.has(oldUrl)) {
          URL.revokeObjectURL(oldUrl);
          blobUrlsRef.current.delete(oldUrl);
        }
        return prev.slice(0, -1);
      });
    }
  };

  const handleRecentAssetSelect = (url: string) => {
    setUploadImages((prev) => [...prev, url]);
  };

  const handleRemoveImage = (index: number) => {
    setUploadImages((prev) => {
      const url = prev[index];
      // 清理 blob URL
      if (blobUrlsRef.current.has(url)) {
        URL.revokeObjectURL(url);
        blobUrlsRef.current.delete(url);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleImageClick = (imageUrl: string, index: number) => {
    setSelectedImageUrl(imageUrl);
    setActivePanel("upload");
  };

  const handleImageReplace = async (file: File, index: number) => {
    const localUrl = URL.createObjectURL(file);
    blobUrlsRef.current.add(localUrl);

    setUploadImages((prev) => {
      const newImages = [...prev];
      newImages[index] = localUrl;
      return newImages;
    });

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/asset/upload", {
        method: "POST",
        body: formData,
      });

      const result = (await response.json()) as
        | { success: true; data: { url: string } }
        | { success: false; error?: string };

      if (!result.success) {
        throw new Error(result.error || "Upload failed");
      }

      const uploadedUrl = result.data.url;
      setUploadImages((prev) => {
        const newImages = [...prev];
        const oldUrl = newImages[index];
        // 撤销 blob URL
        if (blobUrlsRef.current.has(oldUrl)) {
          URL.revokeObjectURL(oldUrl);
          blobUrlsRef.current.delete(oldUrl);
        }
        newImages[index] = uploadedUrl;
        return newImages;
      });
      setReplaceIndex(undefined);
    } catch (error) {
      console.error("Replace image failed:", error);
      // 恢复为原始图片
      setUploadImages((prev) => {
        const newImages = [...prev];
        const failedUrl = newImages[index];
        if (blobUrlsRef.current.has(failedUrl)) {
          URL.revokeObjectURL(failedUrl);
          blobUrlsRef.current.delete(failedUrl);
        }
        // 这里应该恢复原始 URL，但我们没有保存它，所以先移除
        return prev;
      });
      setReplaceIndex(undefined);
    }
  };

  const handleRecentAssetReplace = (url: string, index: number) => {
    setUploadImages((prev) => {
      const newImages = [...prev];
      const oldUrl = newImages[index];
      // 清理 blob URL
      if (blobUrlsRef.current.has(oldUrl)) {
        URL.revokeObjectURL(oldUrl);
        blobUrlsRef.current.delete(oldUrl);
      }
      newImages[index] = url;
      return newImages;
    });
    setReplaceIndex(undefined);
  };

  const handleGenerate = async (
    prompt: string,
    modeParam: string,
    settingsParam: GeneratorSettings,
    imagesParam: string[]
  ) => {
    const displayTaskId = `task-${Date.now()}`;
    const variationsCount = settingsParam.variations || 1;
    const loadingItems = Array.from({ length: variationsCount }, (_, index) => ({
      type: 'loading' as const,
      id: `${displayTaskId}-${index}`,
    }));
    setResultImages((prev) => [...prev, ...loadingItems]);

    try {
      const modeConfig = MODE_CONFIGS[modeParam as GeneratorMode];
      const modelInfo = modeConfig.models?.[settingsParam.model];

      if (!modelInfo) {
        throw new Error(`Model ${settingsParam.model} not found`);
      }

      const result = await handleAIGenerate({
        prompt,
        mode: modeParam as GeneratorMode,
        settings: settingsParam,
        images: imagesParam,
      });

      if (!result.success) {
        setResultImages((prev) =>
          prev.map(item =>
            item.type === 'loading' && item.id.startsWith(`${displayTaskId}-`)
              ? { ...item, type: 'error', error: '' }
              : item
          ));
        return;
      }

      console.log('result', result);

      if (modelInfo.requestConfig.type === 'webhook') {
        // Webhook 异步模式：启动轮询
        if (!result.data.task_id) {
          throw new Error('Webhook mode requires taskId in response');
        }

        startPolling(
          result.data.task_id,
          (results) => {
            setResultImages((prev) => {
              // 替换loading项为成功结果，保持顺序
              let resultIndex = 0;
              return prev.map(item =>
                item.type === 'loading' && item.id.startsWith(`${displayTaskId}-`)
                  ? {
                      type: 'success' as const,
                      id: item.id,
                      url: results[resultIndex++].url,
                    }
                  : item
              );
            });
          },
          (error) => {
            setResultImages((prev) =>
              prev.map(item =>
                item.type === 'loading' && item.id.startsWith(`${displayTaskId}-`)
                  ? { ...item, type: 'error', error }
                  : item
              )
            );
          }
        );
      } else if (modelInfo.requestConfig.type === 'direct') {
        // Direct模式：处理多个结果
        if (!result.data.results || !Array.isArray(result.data.results)) {
          throw new Error('Direct mode requires results array in response');
        }

        setResultImages((prev) => {
          // 替换loading项为成功结果，保持顺序
          let resultIndex = 0;
          return prev.map(item =>
            item.type === 'loading' && item.id.startsWith(`${displayTaskId}-`)
              ? {
                  type: 'success' as const,
                  id: item.id,
                  url: result.data.results![resultIndex++].url,
                }
              : item
          );
        });
      }
    } catch (error) {
      console.error("Generate failed:", error);
      const errorMessage =
        error instanceof Error ? error.message : "生成失败";
      setResultImages((prev) =>
        prev.map(item =>
          item.type === 'loading' && item.id.startsWith(`${displayTaskId}-`)
            ? { ...item, type: 'error', error: errorMessage }
            : item
        )
      );
    }
  };

  const handleResultDownload = async (imageUrl: string) => {
    try {
      await downloadImage(imageUrl);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const handleDeleteError = (id: string) => {
    setResultImages((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <AnimatePresence>
      {isGeneratorModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{ position: 'fixed', inset: 0, zIndex: 9999 }}
        >
          {/* 结果面板 - 全屏背景 */}
          <ResultPanel
            images={resultImages}
            onDownload={handleResultDownload}
            onDeleteError={handleDeleteError}
          />

          {/* 关闭按钮 - activePanel 为 null 时显示 */}
          {activePanel === null && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeGeneratorModal}
              className="fixed top-4 right-4 flex h-9 w-9 items-center justify-center rounded-lg bg-background/80 text-foreground transition-colors backdrop-blur-sm hover:bg-sidebar-hover cursor-pointer"
              style={{ zIndex: 60 }}
              aria-label="关闭"
            >
              <X className="h-5 w-5" />
            </motion.button>
          )}

          {/* 模态框内容 */}
          <div className="fixed inset-0 flex flex-col items-center justify-end gap-4 p-4 pointer-events-none" style={{ zIndex: 50 }}>
            {/* 上方面板区域 - 仅在settings或upload时显示 */}
            {(activePanel === "settings" || activePanel === "upload") && (
              <div className="w-full max-w-7xl flex-1 min-h-0 overflow-y-auto pointer-events-auto flex flex-col gap-4 lg:flex-row">
                {/* 左侧：上方面板 */}
                <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-4">
                  <AnimatePresence mode="wait">
                    {activePanel === "settings" && (
                      <motion.div
                        key="settings"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="w-full h-full"
                      >
                        <div className="bg-background rounded-2xl overflow-hidden h-full flex flex-col">
                          <SettingsPanel
                            onClose={() => setActivePanel(null)}
                            settings={settings}
                            onSettingsChange={setSettings}
                            mode={mode}
                          />
                        </div>
                      </motion.div>
                    )}
                    {activePanel === "upload" && (
                      <motion.div
                        key="upload"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="w-full h-full"
                      >
                        <div className="rounded-2xl overflow-hidden h-full flex flex-col">
                          <UploadPanel
                            isOpen={true}
                            onClose={() => {
                              setActivePanel(null);
                              setSelectedImageUrl(undefined);
                              setReplaceIndex(undefined);
                            }}
                            onImageSelect={handleImageSelect}
                            onImageReplace={handleImageReplace}
                            onRecentAssetSelect={handleRecentAssetSelect}
                            onRecentAssetReplace={handleRecentAssetReplace}
                            initialImageUrl={selectedImageUrl}
                            replaceIndex={replaceIndex}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* 底部区域 - 模式面板在上，生成器在下 */}
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="w-full max-w-7xl pointer-events-auto flex-shrink-0 flex flex-col gap-4"
            >
              {/* 模式选择面板 - 显示在生成器上方 */}
              {activePanel === "mode" && (
                <motion.div
                  key="mode-bottom"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ModeSelectorPanel
                    value={mode}
                    onChange={handleModeChange}
                    onClose={() => setActivePanel(null)}
                  />
                </motion.div>
              )}

              {/* 移动端图片管理面板 */}
              {activePanel === "mobile-images" && (
                <MobileImagePanel
                  uploadImages={uploadImages}
                  mode={mode}
                  onClose={() => setActivePanel(null)}
                  onOpenUploadPanel={() => {
                    setSelectedImageUrl(undefined);
                    setReplaceIndex(undefined);
                    setActivePanel("upload");
                  }}
                  onRemoveImage={handleRemoveImage}
                  onImageClick={handleImageClick}
                  onOpenUploadPanelForReplace={(index: number) => {
                    setSelectedImageUrl(undefined);
                    setReplaceIndex(index);
                    setActivePanel("upload");
                  }}
                />
              )}

              {/* 生成器 */}
              <div className="bg-background rounded-2xl p-4">
                <GlobalGenerator
                  onGenerate={handleGenerate}
                  onOpenUploadPanel={() => {
                    setSelectedImageUrl(undefined);
                    setReplaceIndex(undefined);
                    setActivePanel(activePanel === "upload" ? null : "upload");
                  }}
                  onOpenUploadPanelForReplace={(index: number) => {
                    setSelectedImageUrl(undefined);
                    setReplaceIndex(index);
                    setActivePanel("upload");
                  }}
                  onOpenSettingsPanel={() => setActivePanel(activePanel === "settings" ? null : "settings")}
                  onOpenModePanel={() => setActivePanel(activePanel === "mode" ? null : "mode")}
                  onOpenMobileImagePanel={() => setActivePanel(activePanel === "mobile-images" ? null : "mobile-images")}
                  uploadImages={uploadImages}
                  onRemoveImage={handleRemoveImage}
                  onImageClick={handleImageClick}
                  settings={settings}
                  mode={mode}
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
