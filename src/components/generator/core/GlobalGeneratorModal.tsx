"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useGeneratorStore } from "@/stores/generatorStore";
import { GlobalGenerator } from "./GlobalGenerator";
import { UploadPanel } from "../panels/upload/UploadPanel";
import { SettingsPanel, type GeneratorSettings } from "../panels/settings";
import { ModeSelectorPanel, ModeSelectorButton, type GeneratorMode } from "../panels/mode";
import { ImageUploadButton } from "../buttons/ImageUploadButton";

/**
 * 全局生成器模态框
 */
export function GlobalGeneratorModal() {
  const { isGeneratorModalOpen, closeGeneratorModal } = useGeneratorStore();
  const [activePanel, setActivePanel] = useState<"upload" | "settings" | "mode" | "mobile-images" | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploadImages, setUploadImages] = useState<string[]>([]);
  const [mode, setMode] = useState<GeneratorMode>("prompt");
  const [settings, setSettings] = useState<GeneratorSettings>({
    model: "nano-banana",
    aspectRatio: "1:1",
    variations: 1,
    visibility: "public",
  });

  const handleImageSelect = async (file: File) => {
    setSelectedImage(file);

    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
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
      setPreviewUrl(uploadedUrl);
      // 替换最后一张图片的URL为真实URL
      setUploadImages((prev) => {
        const newImages = [...prev];
        newImages[newImages.length - 1] = uploadedUrl;
        return newImages;
      });
    } catch (error) {
      console.error("Upload image failed:", error);
      // 移除失败的图片
      setUploadImages((prev) => prev.slice(0, -1));
    }
  };

  const handleRecentAssetSelect = (url: string) => {
    setPreviewUrl(url);
    setUploadImages((prev) => [...prev, url]);
  };

  const handleRemoveImage = (index: number) => {
    setUploadImages((prev) => prev.filter((_, i) => i !== index));
    // 如果删除的是最后一张图片，清空预览
    if (index === uploadImages.length - 1) {
      setPreviewUrl("");
      setSelectedImage(null);
    }
  };

  const handleGenerate = (prompt: string) => {
    console.log("Generating with prompt:", prompt);
    console.log("Image:", selectedImage);
    console.log("Settings:", settings);
    // TODO: 实现生成逻辑
    closeGeneratorModal();
  };

  return (
    <AnimatePresence>
      {isGeneratorModalOpen && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* 模态框内容 */}
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-between gap-4 p-4 pointer-events-none">
            {/* 上方面板区域 - 自适应高度 */}
            <div className="w-full max-w-7xl flex-1 min-h-0 overflow-y-auto pointer-events-auto flex flex-col gap-4">
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
                      onClose={() => setActivePanel(null)}
                      onImageSelect={handleImageSelect}
                      onRecentAssetSelect={handleRecentAssetSelect}
                    />
                  </div>
                </motion.div>
              )}
              </AnimatePresence>
            </div>

            {/* 底部区域 - 模式面板在上，生成器在下 */}
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="w-full max-w-7xl pointer-events-auto flex-shrink-0 flex flex-col gap-4"
            >
              {/* 关闭按钮 */}
              {activePanel === null && (
                <button
                  onClick={closeGeneratorModal}
                  className="absolute -top-12 right-0 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-card/80 text-muted transition-colors backdrop-blur-sm hover:bg-card hover:text-foreground cursor-pointer"
                  aria-label="关闭"
                >
                  <X className="h-5 w-5" />
                </button>
              )}

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
                    onChange={setMode}
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
                          maxUploadCount={4}
                          onClick={() => setActivePanel("upload")}
                          onRemoveImage={handleRemoveImage}
                        />
                      </div>

                      {/* 模式选择按钮 */}
                      <ModeSelectorButton
                        value={mode}
                        onClick={() => setActivePanel("mode")}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 生成器 */}
              <div className="bg-card border border-border rounded-2xl shadow-2xl p-4">
                <GlobalGenerator
                  onGenerate={handleGenerate}
                  onOpenUploadPanel={() => setActivePanel("upload")}
                  onOpenSettingsPanel={() => setActivePanel("settings")}
                  onOpenModePanel={() => setActivePanel("mode")}
                  onOpenMobileImagePanel={() => setActivePanel("mobile-images")}
                  uploadImages={uploadImages}
                  onRemoveImage={handleRemoveImage}
                  settings={settings}
                  mode={mode}
                />
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
