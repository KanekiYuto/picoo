"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import {
  Home,
  Image as ImageIcon,
  Settings,
  HelpCircle,
  MoreHorizontal,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import Image from "next/image";

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { icon: Home, label: "首页", href: "/" },
  { icon: ImageIcon, label: "素材", href: "/assets" },
  { icon: Settings, label: "设置", href: "/settings/profile" },
];

const bottomItems: NavItem[] = [
  { icon: HelpCircle, label: "帮助", href: "/help" },
  { icon: MoreHorizontal, label: "更多", href: "/more" },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const locale = useLocale();

  // 判断是否激活的辅助函数（处理国际化路由）
  const isActiveRoute = (href: string) => {
    // 移除当前 locale 前缀来比较路径
    const localePrefix = `/${locale}`;
    const pathWithoutLocale = pathname.startsWith(localePrefix)
      ? pathname.slice(localePrefix.length)
      : pathname;
    const normalizedPath = pathWithoutLocale || '/';

    if (href === '/') {
      return normalizedPath === '/';
    }

    return normalizedPath.startsWith(href);
  };

  return (
    <aside
      className={cn(
        "hidden lg:flex lg:flex-col lg:w-16 flex-shrink-0 bg-sidebar-bg",
        className
      )}
    >
      {/* Logo */}
      <Link href="/" className="flex h-16 items-center justify-center">
        <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-foreground/5">
          <Image
            src={siteConfig.logo}
            alt={`${siteConfig.name} Logo`}
            fill
            className="object-contain"
            priority
            unoptimized
          />
        </div>
      </Link>

      {/* Main Navigation */}
      <nav className="flex flex-1 flex-col py-4">
        <div className="flex flex-col gap-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className="group relative flex flex-col items-center gap-1"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl transition-colors relative",
                    isActive
                      ? "bg-sidebar-active text-foreground before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-8 before:w-1 before:rounded-r before:bg-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </motion.div>
                <span className={cn(
                  "text-[10px] transition-colors",
                  isActive ? "text-foreground font-medium" : "text-muted-foreground"
                )}>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Bottom Navigation */}
        <div className="mt-auto flex flex-col gap-1 px-2 pt-4">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className="group relative flex flex-col items-center gap-1"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl transition-colors relative",
                    isActive
                      ? "bg-sidebar-active text-foreground before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-8 before:w-1 before:rounded-r before:bg-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </motion.div>
                <span className={cn(
                  "text-[10px] transition-colors",
                  isActive ? "text-foreground font-medium" : "text-muted-foreground"
                )}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
