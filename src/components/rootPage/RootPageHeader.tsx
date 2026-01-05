"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Moon, Sun, Menu, X } from "lucide-react";
import { UserButton } from "@/components/auth/UserButton";
import { useUserStore } from "@/store/useUserStore";
import { useThemeStore } from "@/store/useThemeStore";
import { useModalStore } from "@/store/useModalStore";
import { useGeneratorStore } from "@/store/useGeneratorStore";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { siteConfig } from "@/config/site";
import Link from "next/link";
import Image from "next/image";
import { requireAuth } from "@/lib/guards";

interface RootPageHeaderProps {
  className?: string;
}

/**
 * 首页专用 Header 组件
 * 简洁透明设计，固定在页面顶部
 */
export function RootPageHeader({ className }: RootPageHeaderProps) {
  const t = useTranslations("header");
  const tSidebar = useTranslations("sidebar");
  const tFooter = useTranslations("footer.links");
  const { user, isLoading } = useUserStore();
  const { theme, toggleTheme } = useThemeStore();
  const { openLoginModal } = useModalStore();
  const { openGeneratorModal } = useGeneratorStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: tSidebar("home"), href: "/home" },
    { label: tFooter("pricing"), href: "/pricing" },
  ];

  const handleGetStarted = () => {
    requireAuth(() => {
      openGeneratorModal();
    });
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50",
        className
      )}
    >
      <div className="container mx-auto px-4 lg:px-6">
        <div className="h-16 flex items-center justify-between">
          {/* 左侧：汉堡菜单按钮（移动端）+ Logo 和站点名称 */}
          <div className="flex items-center gap-3">
            {/* 汉堡菜单按钮（移动端） */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </motion.button>

            <Link href="/" className="flex items-center gap-3 cursor-pointer group">
              <div className="relative w-8 h-8 transition-transform group-hover:scale-105">
                <Image
                  key={theme}
                  src={theme === 'light' ? siteConfig.logo.light : siteConfig.logo.dark}
                  alt={`${siteConfig.name} Logo`}
                  fill
                  sizes="32px"
                  className="object-contain rounded-lg"
                />
              </div>
              <span className="hidden md:inline text-xl font-bold text-foreground">
                {siteConfig.name}
              </span>
            </Link>
          </div>

          {/* 中间：导航链接（桌面端显示） */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* 右侧：操作按钮 */}
          <div className="flex items-center gap-2">
            {/* 主题切换按钮 */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground cursor-pointer"
              aria-label={t("toggleTheme")}
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </motion.button>

            {/* 语言切换按钮 */}
            <LanguageSwitcher />

            {/* 用户按钮或登录按钮 */}
            <div className="ml-2">
              {isLoading ? (
                <div className="h-10 w-10 rounded-full bg-secondary animate-pulse ring-2 ring-border" />
              ) : user ? (
                <UserButton />
              ) : (
                <motion.button
                  onClick={handleGetStarted}
                  className="flex h-10 px-6 items-center justify-center rounded-full bg-foreground text-background font-medium text-sm cursor-pointer hover:opacity-90 transition-opacity"
                >
                  {t("signIn")}
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 移动端菜单 */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-md"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
