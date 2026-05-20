"use client";

import { ReactNode, useState } from "react";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { MobileSidebar } from "./MobileSidebar";
import { Footer } from "./Footer";
import { MainContent } from "./MainContent";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: ReactNode;
  className?: string;
}

// 配置不显示 Footer 的路径
const HIDE_FOOTER_PATHS: string[] = [
];

export function AppLayout({
  children,
  className,
}: AppLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const pathname = usePathname();
  const locale = useLocale();

  // 判断是否显示 Footer
  const shouldShowFooter = !HIDE_FOOTER_PATHS.some(path => {
    const localePrefix = `/${locale}`;
    // 移除 locale 前缀
    const pathWithoutLocale = pathname.startsWith(localePrefix)
      ? pathname.slice(localePrefix.length)
      : pathname;
    // 确保根路径为 '/'
    const normalizedPath = pathWithoutLocale || '/';
    
    // 精确匹配或子路径匹配
    return normalizedPath === path || normalizedPath.startsWith(`${path}/`);
  });

  return (
    <div className={cn("flex flex-col h-screen bg-background lg:flex-row overflow-hidden", className)}>
      {/* 桌面端侧边栏 - 正常 flex 布局 */}
      <Sidebar />

      {/* 移动端侧边栏 */}
      <MobileSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* 右侧内容区域 - 占据剩余空间 */}
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        {/* Header - sticky 定位 */}
        <Header
          onMenuClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          isMobileMenuOpen={isMobileSidebarOpen}
        />

        {/* Main 内容区域 - 可滚动 */}
        <main className="relative flex-1 min-h-0 overflow-y-auto custom-scrollbar">
          <MainContent>{children}</MainContent>
          {shouldShowFooter && <Footer />}
        </main>
      </div>
    </div>
  );
}
