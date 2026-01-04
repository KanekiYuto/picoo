"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useGeneratorStore } from "@/stores/generatorStore";
import { downloadImage } from "@/lib/image-utils";
import { GlobalGenerator } from "./GlobalGenerator";
import { UploadPanel } from "../panels/upload/UploadPanel";
import { SettingsPanel } from "../panels/settings";
import { ModeSelectorPanel } from "../panels/mode";
import { ResultPanel } from "../panels/result/ResultPanel";
import { MobileImagePanel } from "../panels/mobile/MobileImagePanel";
import { GeneratorHeader } from "./GeneratorHeader";
import {
  useImageUpload,
  useAIGenerate,
  usePanelState,
  useGeneratorSettings,
} from "../hooks";

/**
 * 全局生成器模态框
 */
export function GlobalGeneratorModal() {
  const { isGeneratorModalOpen, closeGeneratorModal } = useGeneratorStore();

  // 使用 Hooks 管理所有状态
  const {
    uploadImages,
    handleImageSelect,
    handleImageReplace,
    handleRemoveImage,
    handleRecentAssetSelect,
    handleRecentAssetReplace,
  } = useImageUpload();

  const {
    resultImages,
    handleGenerate,
    handleDeleteError,
  } = useAIGenerate();

  const {
    activePanel,
    selectedImageUrl,
    replaceIndex,
    openUploadPanel,
    openUploadPanelForReplace,
    openMobileImagePanel,
    closePanel,
    togglePanel,
    setSelectedImageUrl,
    setReplaceIndex,
  } = usePanelState();

  const {
    mode,
    settings,
    setSettings,
    handleModeChange,
  } = useGeneratorSettings();

  const handleImageClick = (imageUrl: string, index: number) => {
    openUploadPanelForReplace(imageUrl, index);
  };

  const handleResultDownload = async (imageUrl: string) => {
    try {
      await downloadImage(imageUrl);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const handleUploadPanelToggle = () => {
    togglePanel("upload");
  };

  const handleSettingsPanelToggle = () => {
    togglePanel("settings");
  };

  const handleModePanelToggle = () => {
    togglePanel("mode");
  };

  const handleMobileImagePanelToggle = () => {
    activePanel === "mobile-images" ? closePanel() : openMobileImagePanel();
  };

  const handleUploadPanelClose = () => {
    closePanel();
    setSelectedImageUrl(undefined);
    setReplaceIndex(undefined);
  };

  return (
    <AnimatePresence>
      {isGeneratorModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{ position: 'fixed', inset: 0, zIndex: 50 }}
          className="bg-secondary-background custom-scrollbar flex flex-col"
        >
          <GeneratorHeader onClose={closeGeneratorModal} activePanel={activePanel} />

          {/* 结果面板 */}
          <ResultPanel
            images={resultImages}
            onDownload={handleResultDownload}
            onDeleteError={handleDeleteError}
          />

          {/* 固定底部区域 - 包含上方面板和控制区 */}
          <div className="fixed inset-0 flex flex-col justify-end pointer-events-none" style={{ zIndex: 100 }}>
            {/* 上方面板区域 - 仅在settings或upload时显示 */}
            {(activePanel === "settings" || activePanel === "upload") && (
              <div className="flex-1 min-h-0 flex justify-center p-4 pointer-events-auto">
                <div className="w-full max-w-7xl h-full">
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
                        <div className="h-full flex flex-col">
                          <SettingsPanel
                            onClose={closePanel}
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
                        <div className="h-full flex flex-col">
                          <UploadPanel
                            isOpen={true}
                            onClose={handleUploadPanelClose}
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

            {/* 底部控制区域 */}
            <div className="w-full flex flex-col gap-2 p-4 pt-0 bg-secondary-background pointer-events-auto">
              {/* 模式选择面板 */}
              {activePanel === "mode" && (
                <motion.div
                  key="mode-bottom"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex justify-center"
                >
                  <div className="w-full max-w-7xl">
                    <ModeSelectorPanel
                      value={mode}
                      onChange={handleModeChange}
                      onClose={closePanel}
                    />
                  </div>
                </motion.div>
              )}

              {/* 移动端图片管理面板 */}
              {activePanel === "mobile-images" && (
                <div className="flex justify-center">
                  <div className="w-full max-w-7xl">
                    <MobileImagePanel
                      uploadImages={uploadImages}
                      mode={mode}
                      onClose={closePanel}
                      onOpenUploadPanel={openUploadPanel}
                      onRemoveImage={handleRemoveImage}
                      onImageClick={handleImageClick}
                    />
                  </div>
                </div>
              )}

              {/* 生成器 */}
              <div className="flex justify-center">
                <div className="w-full max-w-7xl bg-background rounded-2xl p-4 border border-border">
                  <GlobalGenerator
                    onGenerate={handleGenerate}
                    onOpenUploadPanel={handleUploadPanelToggle}
                    onOpenSettingsPanel={handleSettingsPanelToggle}
                    onOpenModePanel={handleModePanelToggle}
                    onOpenMobileImagePanel={handleMobileImagePanelToggle}
                    uploadImages={uploadImages}
                    onRemoveImage={handleRemoveImage}
                    onImageClick={handleImageClick}
                    settings={settings}
                    mode={mode}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
