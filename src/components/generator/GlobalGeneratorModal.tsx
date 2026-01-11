"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useGeneratorStore } from "@/stores/generatorStore";
import { GlobalGenerator } from "./GlobalGenerator";
import { ImageUploadPanel } from "./ImageUploadPanel";
import { SettingsPanel, type GeneratorSettings } from "./settings-panel";

/**
 * 全局生成器模态框
 */
export function GlobalGeneratorModal() {
  const { isGeneratorModalOpen, closeGeneratorModal } = useGeneratorStore();
  const [activePanel, setActivePanel] = useState<"upload" | "settings" | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
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

    try {
      const formData = new FormData();
      formData.append("file", file);

      const params = new URLSearchParams();
      params.set("modelType", "generator");
      params.set("modelName", settings.model);

      const response = await fetch(`/api/upload?${params.toString()}`, {
        method: "POST",
        body: formData,
      });

      const result = (await response.json()) as
        | { success: true; data: { url: string } }
        | { success: false; error?: string };

      if (!result.success) {
        throw new Error(result.error || "Upload failed");
      }

      setPreviewUrl(result.data.url);
    } catch (error) {
      console.error("Upload image to R2 failed:", error);
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
            onClick={closeGeneratorModal}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* 模态框内容 */}
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-end p-4 pointer-events-none">
            {/* 上方面板区域 - 悬浮显示 */}
            <AnimatePresence mode="wait">
              {activePanel === "settings" && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="w-full max-w-7xl mb-4 pointer-events-auto"
                >
                  <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden h-[calc(90vh-200px)]">
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
                  className="w-full max-w-7xl mb-4 pointer-events-auto"
                >
                  <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden h-[calc(90vh-200px)]">
                    <ImageUploadPanel
                      isOpen={true}
                      onClose={() => setActivePanel(null)}
                      onImageSelect={handleImageSelect}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 底部生成器 - 固定在底部 */}
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="relative w-full max-w-7xl pointer-events-auto"
            >
              {/* 关闭按钮（面板打开时隐藏） */}
              {activePanel === null && (
                <button
                  onClick={closeGeneratorModal}
                  className="absolute -top-12 right-0 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-card/80 text-muted transition-colors backdrop-blur-sm hover:bg-card hover:text-foreground"
                  aria-label="关闭"
                >
                  <X className="h-5 w-5" />
                </button>
              )}

              <div className="bg-card border border-border rounded-2xl shadow-2xl p-4">
                <GlobalGenerator
                  onGenerate={handleGenerate}
                  onOpenUploadPanel={() => setActivePanel("upload")}
                  onOpenSettingsPanel={() => setActivePanel("settings")}
                  previewUrl={previewUrl}
                />
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
