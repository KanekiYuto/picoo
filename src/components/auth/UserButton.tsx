"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  LogOut,
  Settings,
  CreditCard,
  ChevronRight,
  Info,
  Gem
} from "lucide-react";
import { signOut } from "@/lib/auth-client";
import Link from "next/link";
import Image from "next/image";
import { useUserStore } from "@/store/useUserStore";
import { useTranslations } from "next-intl";

export function UserButton() {
  const { user, clearUser } = useUserStore();
  const t = useTranslations("common.userMenu");
  const [isOpen, setIsOpen] = useState(false);

  // 未登录不显示
  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    clearUser();
    setIsOpen(false);
  };

  const closeMenu = () => setIsOpen(false);

  // TODO: 积分功能待实现
  const userPoints = 100;

  return (
    <div className="relative">
      {/* 用户头像按钮 */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-10 items-center justify-center rounded-full overflow-hidden bg-gradient-to-br ring-2 ring-border cursor-pointer"
      >
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name || "User"}
            width={40}
            height={40}
            className="h-full w-full object-cover"
          />
        ) : (
          <User className="h-5 w-5 text-white" />
        )}
      </motion.button>

      {/* 下拉菜单 */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* 点击外部关闭 */}
            <div
              className="fixed inset-0 z-40"
              onClick={closeMenu}
            />

            {/* 菜单内容 */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-12 z-50 w-80 rounded-2xl bg-card border border-border shadow-2xl overflow-hidden"
            >
              {/* 用户信息区域 - 可点击跳转 */}
              <Link
                href="/settings/profile"
                onClick={closeMenu}
                className="block p-4 border-b border-border bg-secondary hover:bg-secondary/80 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full overflow-hidden bg-gradient-to-br from-primary to-primary-hover flex-shrink-0 ring-2 ring-border">
                    {user.image ? (
                      <Image
                        src={user.image}
                        alt={user.name || "User"}
                        width={48}
                        height={48}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-white font-bold">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate text-sm">
                      {user.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              </Link>

              {/* 积分和升级 */}
              <div className="p-3 border-b border-border">
                <div className="flex items-center gap-1.5 mb-3">
                  <Gem className="h-4 w-4 text-foreground" />
                  <span className="text-base font-semibold text-foreground">
                    {userPoints}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {t("points")}
                  </span>
                  <button
                    className="group relative ml-0.5"
                    title={t("pointsDetails")}
                    aria-label={t("pointsDetails")}
                  >
                    <Info className="h-3.5 w-3.5 text-muted hover:text-foreground transition-colors cursor-pointer" />
                  </button>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 px-3 py-2 bg-sidebar-active hover:bg-sidebar-active/80 text-xs font-medium text-foreground rounded-lg transition-colors">
                    {t("upgrade")}
                  </button>
                  <button className="flex-1 px-3 py-2 bg-sidebar-hover hover:bg-sidebar-active border border-border text-xs font-medium text-foreground rounded-lg transition-colors">
                    {t("usageAnalysis")}
                  </button>
                </div>
              </div>

              {/* 菜单项 */}
              <div className="py-2 px-2">
                <Link
                  href="/settings"
                  onClick={closeMenu}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-foreground hover:bg-sidebar-hover transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Settings className="h-4 w-4 text-muted group-hover:text-foreground" />
                    <span>{t("settings")}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted group-hover:text-foreground" />
                </Link>

                <Link
                  href="/settings/billing"
                  onClick={closeMenu}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-foreground hover:bg-sidebar-hover transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-4 w-4 text-muted group-hover:text-foreground" />
                    <span>{t("manageSubscription")}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted group-hover:text-foreground" />
                </Link>

                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-foreground hover:bg-sidebar-hover transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <LogOut className="h-4 w-4 text-muted group-hover:text-foreground" />
                    <span>{t("logout")}</span>
                  </div>
                </button>
              </div>

              {/* 底部链接 */}
              <div className="p-3 border-t border-border bg-secondary/50">
                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                  <Link href="/legal/terms" onClick={closeMenu} className="hover:text-foreground transition-colors">
                    {t("terms")}
                  </Link>
                  <span>|</span>
                  <Link href="/legal/privacy" onClick={closeMenu} className="hover:text-foreground transition-colors">
                    {t("privacy")}
                  </Link>
                  {/* <span>|</span> */}
                  {/* <Link href="/blog" onClick={closeMenu} className="hover:text-foreground transition-colors">
                    {t("blog")}
                  </Link> */}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
