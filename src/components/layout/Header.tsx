"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Bell, MessageSquare, Users, Menu, X, Moon, Sun } from "lucide-react";
import { UserButton } from "@/components/auth/UserButton";
import { LoginModal } from "@/components/auth/LoginModal";
import { useUserStore } from "@/stores/userStore";
import { useThemeStore } from "@/stores/themeStore";
import { LanguageSwitcher } from "./LanguageSwitcher";

interface HeaderProps {
  className?: string;
  onMenuClick?: () => void;
  isMobileMenuOpen?: boolean;
}

export function Header({ className, onMenuClick, isMobileMenuOpen }: HeaderProps) {
  const { user, isLoading } = useUserStore();
  const { theme, toggleTheme } = useThemeStore();
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 bg-header-bg border-b border-border h-16 flex-shrink-0",
          className
        )}
      >
        <div className="h-full flex items-center justify-between px-4 lg:px-6">
          {/* 左侧：移动端菜单按钮 */}
          <div className="flex items-center gap-3 lg:hidden">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onMenuClick}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label={isMobileMenuOpen ? "关闭菜单" : "打开菜单"}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </motion.button>
          </div>

          {/* Right: Actions */}
          <div className="ml-auto flex items-center gap-2">
            {/* 桌面端显示的按钮 */}
            <div className="hidden items-center gap-2 md:flex">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                aria-label="邀请成员"
              >
                <Users className="h-5 w-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                aria-label="消息"
              >
                <MessageSquare className="h-5 w-5" />
              </motion.button>
            </div>

            {/* 主题切换按钮 */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="切换主题"
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </motion.button>

            {/* 语言切换按钮 */}
            <LanguageSwitcher />

            {/* 通知按钮（移动端和桌面端都显示） */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="通知"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
              </span>
            </motion.button>

            <div className="ml-2 h-8 w-px bg-border"></div>

            {/* 用户按钮或登录按钮 */}
            <div className="ml-2">
              {isLoading ? (
                // 加载骨架屏
                <div className="h-10 w-10 rounded-full bg-secondary animate-pulse ring-2 ring-border" />
              ) : user ? (
                // 已登录显示用户按钮
                <UserButton />
              ) : (
                // 未登录显示登录按钮
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowLoginModal(true)}
                  className="flex h-10 px-4 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-hover text-white font-medium text-sm"
                >
                  登录
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 登录模态框 */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  );
}
