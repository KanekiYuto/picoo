"use client";

import { motion } from "framer-motion";
import { Languages } from "lucide-react";
import { useLanguageStore } from "@/stores/languageStore";

/**
 * 语言切换触发按钮
 */
export function LanguageSwitcher() {
  const { openLanguageModal } = useLanguageStore();

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={openLanguageModal}
      className="flex h-10 w-10 items-center justify-center rounded-lg text-muted transition-colors hover:bg-sidebar-hover hover:text-foreground"
      aria-label="切换语言"
    >
      <Languages className="h-5 w-5" />
    </motion.button>
  );
}
