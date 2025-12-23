"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { signIn } from "@/lib/auth-client";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      const callbackURL = pathname === "/" ? siteConfig.auth.defaultRedirectAfterLogin : pathname;
      await signIn.social({
        provider: "google",
        callbackURL,
      });
    } catch (error) {
      console.error("Login failed:", error);
      setIsLoading(false);
    }
  };

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
          <div className="fixed inset-0 z-[501] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-md rounded-2xl bg-card border border-border p-8 shadow-2xl"
            >
              {/* 关闭按钮 */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 rounded-lg p-2 text-muted transition-colors hover:bg-sidebar-hover hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>

              {/* 标题 */}
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold text-foreground">欢迎回来</h2>
                <p className="mt-2 text-sm text-muted">
                  使用 Google 账号登录以继续
                </p>
              </div>

              {/* Google 登录按钮 */}
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-6 py-3 font-medium text-gray-900 transition-all hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="inline-flex items-center"
                    >
                      登录中
                      <span className="inline-flex ml-0.5">
                        <motion.span
                          animate={{ opacity: [0, 1, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                        >
                          .
                        </motion.span>
                        <motion.span
                          animate={{ opacity: [0, 1, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                        >
                          .
                        </motion.span>
                        <motion.span
                          animate={{ opacity: [0, 1, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                        >
                          .
                        </motion.span>
                      </span>
                    </motion.span>
                  </>
                ) : (
                  "使用 Google 登录"
                )}
              </button>

              {/* 服务条款 */}
              <p className="mt-6 text-center text-xs text-muted">
                登录即表示您同意我们的
                <a href="/terms" className="text-primary hover:underline">
                  服务条款
                </a>
                和
                <a href="/privacy" className="text-primary hover:underline">
                  隐私政策
                </a>
              </p>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
