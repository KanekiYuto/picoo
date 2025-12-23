"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Home,
  LayoutDashboard,
  FileText,
  Users,
  BarChart,
  Settings,
  HelpCircle,
  MoreHorizontal,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { icon: Home, label: "首页", href: "/" },
  { icon: LayoutDashboard, label: "应用", href: "/dashboard" },
  { icon: FileText, label: "媒体", href: "/media" },
  { icon: Users, label: "视频", href: "/video" },
  { icon: BarChart, label: "编辑", href: "/edit" },
  { icon: Settings, label: "对口型", href: "/lipsync" },
];

const bottomItems: NavItem[] = [
  { icon: HelpCircle, label: "帮助", href: "/help" },
  { icon: MoreHorizontal, label: "更多", href: "/more" },
];

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const pathname = usePathname();

  // 禁止背景滚动
  useEffect(() => {
    const mainElement = document.querySelector('main');

    if (!mainElement) return;

    if (isOpen) {
      // 禁止主内容区域滚动
      mainElement.style.overflow = 'hidden';
    } else {
      // 恢复滚动
      mainElement.style.overflow = 'auto';
    }

    return () => {
      // 清理 - 恢复滚动
      const main = document.querySelector('main');
      if (main) {
        (main as HTMLElement).style.overflow = 'auto';
      }
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 背景遮罩 - 从 Header 下方开始 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-x-0 top-16 bottom-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          />

          {/* 从 Header 下方滑出的全屏面板 */}
          <motion.div
            initial={{ y: "-100vh" }}
            animate={{ y: 0 }}
            exit={{ y: "-100vh" }}
            transition={{
              type: "spring",
              damping: 35,
              stiffness: 400,
              mass: 0.8
            }}
            className="fixed inset-x-0 top-16 z-41 flex h-[calc(100vh-4rem)] flex-col overflow-hidden bg-sidebar-bg lg:hidden"
          >
            {/* 主导航 */}
            <nav className="flex flex-1 flex-col overflow-y-auto custom-scrollbar p-6">
              <div className="flex flex-col gap-2">
                {navItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: index * 0.05,
                        duration: 0.3,
                        ease: "easeOut"
                      }}
                    >
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className="group"
                      >
                        <motion.div
                          whileHover={{ x: 4 }}
                          whileTap={{ scale: 0.98 }}
                          className={cn(
                            "flex items-center gap-4 rounded-xl px-5 py-4 transition-colors",
                            isActive
                              ? "bg-sidebar-active text-white"
                              : "text-muted hover:bg-sidebar-hover hover:text-white"
                          )}
                        >
                          <Icon className="h-6 w-6" />
                          <span className="text-base font-medium">{item.label}</span>
                          {isActive && (
                            <motion.div
                              layoutId="mobile-active-indicator"
                              className="ml-auto h-2 w-2 rounded-full bg-primary"
                            />
                          )}
                        </motion.div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {/* 底部导航 */}
              <div className="mt-auto flex flex-col gap-2 border-t border-border pt-6">
                {bottomItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: (navItems.length + index) * 0.05,
                        duration: 0.3,
                        ease: "easeOut"
                      }}
                    >
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className="group"
                      >
                        <motion.div
                          whileHover={{ x: 4 }}
                          whileTap={{ scale: 0.98 }}
                          className={cn(
                            "flex items-center gap-4 rounded-xl px-5 py-4 transition-colors",
                            isActive
                              ? "bg-sidebar-active text-white"
                              : "text-muted hover:bg-sidebar-hover hover:text-white"
                          )}
                        >
                          <Icon className="h-6 w-6" />
                          <span className="text-base font-medium">{item.label}</span>
                          {isActive && (
                            <motion.div
                              layoutId="mobile-active-indicator"
                              className="ml-auto h-2 w-2 rounded-full bg-primary"
                            />
                          )}
                        </motion.div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
