"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { useModalStore } from "@/store/useModalStore";

export type ImageItem =
  | { type: 'loading'; id: string }
  | { type: 'success'; id: string; url: string }
  | { type: 'error'; id: string; error: string };

export interface ResultPanelProps {
  images?: ImageItem[];
  onDownload?: (imageUrl: string) => void;
  onDeleteError?: (id: string) => void;
}

export function ResultPanel({
  images,
  onDownload,
  onDeleteError,
}: ResultPanelProps) {
  const t = useTranslations("generator.resultPanel");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { openMediaPreview } = useModalStore();
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  const handleImageLoad = (id: string) => {
    setLoadedImages((prev) => new Set(prev).add(id));
  };

  console.log(images);

  const isEmpty = !images || images.length === 0;

  const handleOpenPreview = (item: ImageItem) => {
    if (item.type === 'success' && images) {
      const previewItems = images
        .filter(img => img.type === 'success')
        .map(img => ({
          id: img.id,
          url: (img as { url: string }).url,
          type: 'image' as const,
        }));
      const startIndex = previewItems.findIndex(p => p.id === item.id);
      openMediaPreview(previewItems, startIndex);
    }
  };

  const handleDownload = (url: string) => {
    onDownload?.(url);
  };

  const handleDeleteError = (id: string) => {
    onDeleteError?.(id);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 bg-secondary-background"
      style={{ zIndex: 0 }}
    >
      <div className="w-full h-full flex flex-col">
        {/* 空状态 - 不显示任何内容 */}
        {isEmpty && (
          <div className="flex-1" />
        )}

        {/* 结果网格 */}
        {!isEmpty && (
          <div
            ref={containerRef}
            className="flex-1 overflow-auto p-2 custom-scrollbar"
          >
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2">
              {images.map((item) => (
                <motion.div
                  key={item.id}
                  className="relative aspect-square"
                  layout
                >
                  {item.type === 'loading' && (
                    <motion.div
                      className="w-full h-full rounded-lg bg-muted flex items-center justify-center relative overflow-hidden"
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* 波浪闪烁背景 */}
                      <div className="absolute inset-0">
                        <div className="absolute inset-0 opacity-20 animate-pulse" style={{
                          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 25%, transparent 50%, rgba(255,255,255,0.15) 75%, transparent 100%)',
                          backgroundSize: '200% 100%',
                          animation: 'shimmer 2s infinite',
                        }}></div>
                      </div>

                      <style jsx>{`
                        @keyframes shimmer {
                          0% { background-position: -200% 0; }
                          100% { background-position: 200% 0; }
                        }
                      `}</style>

                      {/* 左上角内容 */}
                      <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
                        <div className="relative w-4 h-4">
                          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-foreground border-r-foreground animate-spin"></div>
                        </div>
                        <p className="text-sm text-foreground font-medium">{t("requestInProgress")}</p>
                      </div>
                    </motion.div>
                  )}

                  {item.type === 'success' && (
                    <>
                      {!loadedImages.has(item.id) && (
                        <div className="w-full h-full rounded-lg bg-muted flex items-center justify-center relative overflow-hidden">
                          <div className="absolute inset-0">
                            <div className="absolute inset-0 opacity-20 animate-pulse" style={{
                              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 25%, transparent 50%, rgba(255,255,255,0.15) 75%, transparent 100%)',
                              backgroundSize: '200% 100%',
                              animation: 'shimmer 2s infinite',
                            }}></div>
                          </div>
                          <style jsx>{`
                            @keyframes shimmer {
                              0% { background-position: -200% 0; }
                              100% { background-position: 200% 0; }
                            }
                          `}</style>
                          <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
                            <div className="relative w-4 h-4">
                              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-foreground border-r-foreground animate-spin"></div>
                            </div>
                            <p className="text-sm text-foreground font-medium">{t("loadingImage")}</p>
                          </div>
                        </div>
                      )}
                      {loadedImages.has(item.id) && (
                        <motion.div
                          className="group relative w-full h-full cursor-pointer"
                          onClick={() => handleOpenPreview(item)}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <img
                            src={item.url}
                            alt="result"
                            className="w-full h-full rounded-lg object-cover"
                            onLoad={() => {}}
                          />
                          <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(item.url);
                              }}
                              className={cn(
                                "flex items-center justify-center p-2 rounded-lg cursor-pointer",
                                "bg-black/60 text-foreground transition-all",
                                "hover:bg-black/80"
                              )}
                              title={t("download")}
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        </motion.div>
                      )}
                      <img
                        src={item.url}
                        alt="result"
                        className="hidden"
                        onLoad={() => handleImageLoad(item.id)}
                      />
                    </>
                  )}

                  {item.type === 'error' && (
                    <motion.div
                      className="w-full h-full rounded-lg bg-red-950/20 border border-red-600/50 flex flex-col items-center justify-center p-4"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="text-3xl font-bold text-red-500 mb-2">!</div>
                      <p className="text-xs text-muted-foreground text-center mb-3">
                        {item.error}
                      </p>
                      <button
                        onClick={() => handleDeleteError(item.id)}
                        className={cn(
                          "px-2 py-1 rounded text-xs cursor-pointer",
                          "bg-red-600/50 text-red-100 transition-colors",
                          "hover:bg-red-600"
                        )}
                      >
                        {t("delete")}
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
