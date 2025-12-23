"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, LogOut, Settings } from "lucide-react";
import { signOut } from "@/lib/auth-client";
import Link from "next/link";
import { useUserStore } from "@/stores/userStore";

export function UserButton() {
  const { user, clearUser } = useUserStore();
  const [isOpen, setIsOpen] = useState(false);

  // 未登录不显示
  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    clearUser();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* 用户头像按钮 */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-10 items-center justify-center rounded-full overflow-hidden bg-gradient-to-br from-primary to-primary-hover ring-2 ring-border"
      >
        {user.image ? (
          <img
            src={user.image}
            alt={user.name || "User"}
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
              onClick={() => setIsOpen(false)}
            />

            {/* 菜单内容 */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-12 z-50 w-64 rounded-xl bg-card border border-border shadow-2xl p-2"
            >
              {/* 用户信息 */}
              <div className="p-3 border-b border-border">
                <p className="font-medium text-foreground truncate">
                  {user.name}
                </p>
                <p className="text-sm text-muted truncate">
                  {user.email}
                </p>
              </div>

              {/* 菜单项 */}
              <div className="py-2">
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-sidebar-hover"
                >
                  <User className="h-4 w-4" />
                  个人中心
                </Link>

                <Link
                  href="/settings"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-sidebar-hover"
                >
                  <Settings className="h-4 w-4" />
                  设置
                </Link>
              </div>

              {/* 退出登录 */}
              <div className="border-t border-border pt-2">
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-sidebar-hover hover:text-primary"
                >
                  <LogOut className="h-4 w-4" />
                  退出登录
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
