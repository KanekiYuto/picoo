"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "../../../i18n/routing";
import { locales, localeNames, type Locale } from "../../../i18n/config";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from "lucide-react";
import { useLanguageStore } from "@/stores/languageStore";
import { cn } from "@/lib/utils";

/**
 * 语言切换模态框
 */
export function LanguageModal() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const { isLanguageModalOpen, closeLanguageModal } = useLanguageStore();

  const handleLanguageChange = (newLocale: Locale) => {
    closeLanguageModal();
    router.push(pathname, { locale: newLocale });
  };

  return (
    <AnimatePresence>
      {isLanguageModalOpen && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLanguageModal}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* 模态框内容 */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
            >
              {/* 头部 */}
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    选择语言
                  </h2>
                  <p className="text-sm text-muted">
                    Select Language
                  </p>
                </div>
                <motion.button
                  onClick={closeLanguageModal}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-sidebar-hover hover:text-foreground"
                  aria-label="关闭"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>

              {/* 语言列表 */}
              <div className="space-y-2">
                {locales.map((loc) => (
                  <motion.button
                    key={loc}
                    onClick={() => handleLanguageChange(loc)}
                    className={cn(
                      "group w-full rounded-xl px-4 py-3 text-left relative",
                      "transition-all duration-300 ease-out",
                      locale === loc
                        ? "bg-white text-black border-2 border-white font-medium rounded-xl"
                        : "border-2 border-transparent bg-sidebar-hover text-muted hover:border-border hover:text-foreground hover:rounded-full hover:px-5"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base">{localeNames[loc]}</span>
                      {locale === loc ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-black"
                        >
                          <svg
                            className="h-4 w-4 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </motion.div>
                      ) : (
                        <ArrowRight className="h-5 w-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
