"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useGeneratorStore } from "@/stores/generatorStore";
import { downloadImage } from "@/lib/image-utils";
import { handleAIGenerate } from "@/lib/ai-generator-handler";
import { GlobalGenerator } from "./GlobalGenerator";
import { UploadPanel } from "../panels/upload/UploadPanel";
import { SettingsPanel, type GeneratorSettings } from "../panels/settings";
import { ModeSelectorPanel, ModeSelectorButton, type GeneratorMode } from "../panels/mode";
import { ResultPanel, type ImageItem } from "../panels/result/ResultPanel";
import { ImageUploadButton } from "../buttons/ImageUploadButton";
import { MODE_CONFIGS } from "../config";

// AI 生成结果类型定义
interface AIResultItem {
  type: 'image' | 'text';
  url?: string;
  content?: string;
}

interface AIGenerateResult {
  data?: {
    results?: AIResultItem[];
  };
}

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

  // 根据 mode 获取默认设置
  const getDefaultSettings = (currentMode: GeneratorMode): GeneratorSettings => {
    const modeConfig = MODE_CONFIGS[currentMode];
    const defaults = modeConfig?.defaultSettings || {};
    return {
      model: defaults.model || "nano-banana-pro",
      aspectRatio: (defaults.aspectRatio || "1:1") as `${number}:${number}`,
      variations: defaults.variations || 1,
      visibility: "public",
      resolution: defaults.resolution,
      format: defaults.format,
    };
  };

  // 智能切换模式：如果当前模型在新模式下可用则保留，否则使用新模式的默认模型
  const handleModeChange = (newMode: GeneratorMode) => {
    setMode(newMode);

    const newModeConfig = MODE_CONFIGS[newMode];
    const newModeModels = newModeConfig?.models;
    const defaultSettings = getDefaultSettings(newMode);

    // 如果新模式支持当前模型，保留当前设置
    if (newModeModels && settings.model && newModeModels[settings.model]) {
      const currentModelInNewMode = newModeModels[settings.model];

      // 检查当前的aspectRatio是否被新模式的模型支持
      const aspectRatioOptions = currentModelInNewMode.aspectRatioOptions || [];
      const isAspectRatioSupported = aspectRatioOptions.some(
        option => option.portrait === settings.aspectRatio || option.landscape === settings.aspectRatio
      );

      setSettings({
        ...settings,
        aspectRatio: isAspectRatioSupported ? settings.aspectRatio : defaultSettings.aspectRatio,
        resolution: defaultSettings.resolution,
        format: defaultSettings.format,
      });
      return;
    }

    // 如果新模式不支持当前模型，使用新模式的默认设置
    setSettings(defaultSettings);
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

  const handleGenerate = async (prompt: string, modeParam: string, settingsParam: GeneratorSettings, imagesParam: string[]) => {
    // 创建唯一ID
    const taskId = `task-${Date.now()}`;

    // 添加加载占位符
    setResultImages((prev) => [...prev, { type: 'loading', id: taskId }]);

    try {
      const result = await handleAIGenerate({
        prompt,
        mode: modeParam as GeneratorMode,
        settings: settingsParam,
        images: imagesParam,
      }) as AIGenerateResult;

      // 从返回结果中提取图片 URL，带类型守卫
      if (result?.data?.results && Array.isArray(result.data.results)) {
        const imageUrls = result.data.results
          .filter((item): item is AIResultItem & { url: string } =>
            item.type === "image" && typeof item.url === 'string'
          )
          .map((item) => item.url);

        // 替换加载占位符为成功图片
        setResultImages((prev) =>
          prev.map((item) =>
            item.id === taskId
              ? { type: 'success', id: taskId, url: imageUrls[0] || '' }
              : item
          )
        );

        // 如果有多张图片，添加其他图片
        if (imageUrls.length > 1) {
          const additionalImages = imageUrls.slice(1).map((url, index) => ({
            type: 'success' as const,
            id: `${taskId}-${index + 1}`,
            url,
          }));
          setResultImages((prev) => [...prev, ...additionalImages]);
        }
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Generate failed:", error);
      // 替换加载占位符为错误状态
      setResultImages((prev) =>
        prev.map((item) =>
          item.id === taskId
            ? { type: 'error', id: taskId, error: error instanceof Error ? error.message : "生成失败" }
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
              className="fixed top-4 right-4 flex h-12.5 w-12.5 items-center justify-center rounded-lg bg-card/80 text-foreground transition-colors backdrop-blur-sm border border-border shadow-lg hover:bg-sidebar-hover cursor-pointer"
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
                        <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden h-full flex flex-col">
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
                        <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden h-full flex flex-col">
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
                  <div className="bg-card border border-border rounded-2xl shadow-2xl p-4 md:p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-semibold text-foreground">图片管理</h2>
                      <button
                        onClick={() => setActivePanel(null)}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-sidebar-hover hover:text-foreground cursor-pointer"
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
              <div className="bg-card border border-border rounded-2xl shadow-2xl p-4">
                <GlobalGenerator
                  onGenerate={handleGenerate}
                  onOpenUploadPanel={() => {
                    setSelectedImageUrl(undefined);
                    setActivePanel("upload");
                  }}
                  onOpenSettingsPanel={() => setActivePanel("settings")}
                  onOpenModePanel={() => setActivePanel("mode")}
                  onOpenMobileImagePanel={() => setActivePanel("mobile-images")}
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
