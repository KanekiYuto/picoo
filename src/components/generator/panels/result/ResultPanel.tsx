"use client";

import { motion } from "framer-motion";
import { Download, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export interface ResultPanelProps {
  imageUrl?: string;
  isLoading?: boolean;
  error?: string;
  onRegenerate?: () => void;
  onDownload?: () => void;
  onClose?: () => void;
}

/**
 * 生成结果面板
 * 全屏背景面板，显示在所有组件底层
 */
export function ResultPanel({
  imageUrl,
  isLoading = false,
  error,
  onRegenerate,
  onDownload,
  onClose,
}: ResultPanelProps) {
  const t = useTranslations("generator.resultPanel");

  const isEmpty = !imageUrl && !isLoading && !error;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 flex items-center justify-center bg-background"
      style={{ zIndex: 0 }}
    >
      {/* 中央内容容器 */}
      <div className="flex flex-col items-center gap-6 max-w-2xl">
        {/* 图片/内容区域 */}
        <div className="w-full flex items-center justify-center">
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="flex h-16 w-16 items-center justify-center"
            >
              <RefreshCw className="h-8 w-8 text-muted" />
            </motion.div>
          ) : error ? (
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
                <span className="text-2xl text-red-500">!</span>
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">{t("error")}</p>
                <p className="text-sm text-muted mt-2">{error}</p>
              </div>
            </div>
          ) : imageUrl ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-center w-full"
            >
              <img
                src={imageUrl}
                alt="生成结果"
                className="max-h-96 rounded-2xl object-contain shadow-2xl"
              />
            </motion.div>
          ) : (
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/10">
                <span className="text-2xl text-muted">📷</span>
              </div>
              <p className="text-sm text-muted">生成结果会显示在这里</p>
            </div>
          )}
        </div>

        {/* 操作按钮区域 */}
        {!isEmpty && (
          <div className="flex gap-3 w-full">
            {!isLoading && !error && imageUrl && (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onDownload}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg",
                    "bg-primary text-white text-sm font-medium transition-all",
                    "hover:bg-primary/90"
                  )}
                >
                  <Download className="h-4 w-4" />
                  {t("download")}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onRegenerate}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg",
                    "border border-border text-foreground text-sm font-medium transition-all",
                    "hover:bg-sidebar-hover"
                  )}
                >
                  <RefreshCw className="h-4 w-4" />
                  {t("regenerate")}
                </motion.button>
              </>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
