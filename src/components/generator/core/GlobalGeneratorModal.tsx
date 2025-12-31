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
import { ImageUploadButton } from "../buttons/ImageUploadButton";
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

    const newModeConfig = MODE_CONFIGS[newMode];
    const newModeModels = newModeConfig?.models;
    const currentModel = settings.model;

    // 检查当前模型是否在新模式中存在
    const modelExistsInNewMode = newModeModels && currentModel && newModeModels[currentModel];

    if (modelExistsInNewMode) {
      // 模型在新模式中存在，保留模型但更新其默认设置
      const newModelDefaults = getDefaultSettings(newMode, currentModel);
      const currentModelInNewMode = newModeModels[currentModel];

      // 检查当前的 aspectRatio 是否被新模式的模型支持
      const aspectRatioOptions = currentModelInNewMode.aspectRatioOptions || [];
      const isAspectRatioSupported = aspectRatioOptions.some(
        option => option.portrait === settings.aspectRatio || option.landscape === settings.aspectRatio
      );

      setSettings({
        ...settings,
        aspectRatio: isAspectRatioSupported ? settings.aspectRatio : newModelDefaults.aspectRatio,
        resolution: newModelDefaults.resolution,
        format: newModelDefaults.format,
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
              // 移除所有与此任务相关的loading项
              const withoutLoading = prev.filter(item => !item.id.startsWith(`${displayTaskId}-`));
              // 添加所有成功的图片
              const newImages = results.map((item, index) => ({
                type: 'success' as const,
                id: `${displayTaskId}-${index}`,
                url: item.url,
              }));
              return [...withoutLoading, ...newImages];
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
          // 移除所有与此任务相关的loading项
          const withoutLoading = prev.filter(item => !item.id.startsWith(`${displayTaskId}-`));
          // 添加所有成功的图片
          const newImages = result.data.results!.map((item: any, index: number) => ({
            type: 'success' as const,
            id: `${displayTaskId}-${index}`,
            url: item.url,
          }));
          return [...withoutLoading, ...newImages];
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

  const handleResultRegenerate = () => {
    // TODO: 重新生成逻辑
  };

  const handleResultDownload = async (imageUrl: string) => {
    try {
      await downloadImage(imageUrl);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const handleResultUpscale = async (imageUrl: string) => {
    // 切换到图像放大模式
    handleModeChange("upscale");

    // 将图片添加到上传列表
    setUploadImages([imageUrl]);

    // 打开设置面板以便用户调整参数
    setActivePanel("settings");
  };

  const handleImagePositionChange = (id: string, position: { x: number; y: number }) => {
    setResultImages((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, position } : item
      )
    );
  };

  // 根据模式获取最大上传数量
  const getMaxUploadCount = () => {
    switch (mode) {
      case "text-to-image":
        return 0; // 文本生成不需要上传图片
      case "upscale":
        return 1; // 放大支持上传一张
      case "edit-image":
        return 4; // 编辑最多四张
      case "remove-watermark":
        return 1; // 去水印一张
      default:
        return 0;
    }
  };

  const handleDeleteError = (id: string) => {
    setResultImages((prev) => prev.filter((item) => item.id !== id));
  };

  const handlePasteImageStart = (id: string, localUrl: string) => {
    blobUrlsRef.current.add(localUrl);
    setResultImages((prev) => [...prev, { type: 'uploading', id, localUrl }]);
  };

  const handlePasteImageComplete = (id: string, url: string) => {
    setResultImages((prev) =>
      prev.map((item) => {
        if (item.id === id && item.type === 'uploading') {
          // 清理 blob URL
          if (blobUrlsRef.current.has(item.localUrl)) {
            URL.revokeObjectURL(item.localUrl);
            blobUrlsRef.current.delete(item.localUrl);
          }
          return { type: 'success', id, url };
        }
        return item;
      })
    );
  };

  const handlePasteImageError = (id: string, error: string) => {
    setResultImages((prev) =>
      prev.map((item) => {
        if (item.id === id && item.type === 'uploading') {
          // 清理 blob URL
          if (blobUrlsRef.current.has(item.localUrl)) {
            URL.revokeObjectURL(item.localUrl);
            blobUrlsRef.current.delete(item.localUrl);
          }
          return { type: 'error', id, error };
        }
        return item;
      })
    );
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
            onRegenerate={handleResultRegenerate}
            onDownload={handleResultDownload}
            onUpscale={handleResultUpscale}
            onImagePositionChange={handleImagePositionChange}
            onDeleteError={handleDeleteError}
            onPasteImageStart={handlePasteImageStart}
            onPasteImageComplete={handlePasteImageComplete}
            onPasteImageError={handlePasteImageError}
          />

          {/* 关闭按钮 - activePanel 为 null 时显示 */}
          {activePanel === null && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeGeneratorModal}
              className="fixed top-4 right-4 flex h-12.5 w-12.5 items-center justify-center rounded-lg bg-background/80 text-foreground transition-colors backdrop-blur-sm hover:bg-sidebar-hover cursor-pointer"
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
                            }}
                            onImageSelect={handleImageSelect}
                            onRecentAssetSelect={handleRecentAssetSelect}
                            initialImageUrl={selectedImageUrl}
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
                <motion.div
                  key="mobile-images"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="w-full"
                >
                  <div className="bg-background rounded-2xl p-4 md:p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-semibold text-foreground">图片管理</h2>
                      <button
                        onClick={() => setActivePanel(null)}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-sidebar-hover hover:text-foreground cursor-pointer"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="flex flex-col gap-4">
                      {/* 图片堆叠 */}
                      <div className="flex items-center justify-center">
                        <ImageUploadButton
                          size="lg"
                          uploadImages={uploadImages}
                          maxUploadCount={getMaxUploadCount()}
                          onClick={() => {
                            setSelectedImageUrl(undefined);
                            setActivePanel("upload");
                          }}
                          onRemoveImage={handleRemoveImage}
                          onImageClick={handleImageClick}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 生成器 */}
              <div className="bg-background rounded-2xl p-4">
                <GlobalGenerator
                  onGenerate={handleGenerate}
                  onOpenUploadPanel={() => {
                    setSelectedImageUrl(undefined);
                    setActivePanel(activePanel === "upload" ? null : "upload");
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
