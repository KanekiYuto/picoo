"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Pricing } from "@/components/pricing/Pricing";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 定价模态框组件
 * 显示定价方案，引导用户升级
 */
export function PricingModal({ isOpen, onClose }: PricingModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[500] bg-black/60 backdrop-blur-sm"
          />

          {/* 模态框 */}
          <div className="fixed inset-0 z-[501] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-6xl rounded-2xl bg-card border border-border p-8 shadow-2xl my-8"
            >
              {/* 关闭按钮 */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 z-10 rounded-lg p-2 text-muted transition-colors hover:bg-sidebar-hover hover:text-foreground cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              {/* 定价内容 */}
              <Pricing />
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
