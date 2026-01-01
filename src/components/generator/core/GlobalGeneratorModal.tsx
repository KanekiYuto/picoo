"use client";

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
    openSettingsPanel,
    openModePanel,
    openMobileImagePanel,
    closePanel,
    togglePanel,
    setSelectedImageUrl,
    setReplaceIndex,
    setActivePanel,
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
                        <div className="rounded-2xl overflow-hidden h-full flex flex-col">
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
                    onClose={closePanel}
                  />
                </motion.div>
              )}

              {/* 移动端图片管理面板 */}
              {activePanel === "mobile-images" && (
                <MobileImagePanel
                  uploadImages={uploadImages}
                  mode={mode}
                  onClose={closePanel}
                  onOpenUploadPanel={openUploadPanel}
                  onRemoveImage={handleRemoveImage}
                  onImageClick={handleImageClick}
                />
              )}

              {/* 生成器 */}
              <div className="bg-background rounded-2xl p-4">
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
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
