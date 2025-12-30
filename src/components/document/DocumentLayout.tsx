"use client";

import { useState, useEffect } from "react";
import { DocumentViewer } from "./DocumentViewer";
import { DocumentNav, DocumentNavItem, extractHeadingsFromMarkdown } from "./DocumentNav";
import { Menu, X } from "lucide-react";
import { useTranslations } from 'next-intl';

interface DocumentLayoutProps {
  /** Markdown 内容 */
  content: string;
  /** 自定义导航项（如果不提供，将从内容自动提取） */
  navItems?: DocumentNavItem[];
  /** 是否显示导航 */
  showNav?: boolean;
  /** 导航宽度 */
  navWidth?: string;
  /** 自定义类名 */
  className?: string;
}

/**
 * 文档布局组件
 * 整合了文档查看器和侧边栏导航，提供完整的文档阅读体验
 */
export function DocumentLayout({
  content,
  navItems,
  showNav = true,
  navWidth = "280px",
  className = "",
}: DocumentLayoutProps) {
  const t = useTranslations('document.nav');
  const [activeId, setActiveId] = useState<string>("");
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [headings, setHeadings] = useState<DocumentNavItem[]>([]);

  // 提取或使用提供的导航项
  useEffect(() => {
    if (navItems) {
      setHeadings(navItems);
    } else {
      const extracted = extractHeadingsFromMarkdown(content);
      setHeadings(extracted);
    }
  }, [content, navItems]);

  // 监听滚动，更新当前激活的导航项
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-20% 0px -80% 0px",
      }
    );

    // 观察所有标题元素
    const headingElements = document.querySelectorAll("h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]");
    headingElements.forEach((element) => observer.observe(element));

    return () => {
      headingElements.forEach((element) => observer.unobserve(element));
    };
  }, [content]);

  // 处理导航项点击
  const handleNavItemClick = (id: string) => {
    setActiveId(id);
    setIsMobileNavOpen(false);
  };

  return (
    <div className={`document-layout ${className}`}>
      <div className="flex min-h-screen bg-background">
        {/* 移动端导航按钮 */}
        {showNav && (
          <button
            className="fixed top-4 left-4 z-50 lg:hidden p-2 bg-card rounded-lg border border-border hover:bg-muted transition-colors"
            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            aria-label={isMobileNavOpen ? t('closeNav') : t('openNav')}
          >
            {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        )}

        {/* 侧边栏导航 */}
        {showNav && (
          <>
            {/* 移动端遮罩 */}
            {isMobileNavOpen && (
              <div
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                onClick={() => setIsMobileNavOpen(false)}
              />
            )}

            {/* 导航面板 */}
            <aside
              className={`
                fixed lg:sticky top-0 left-0 h-screen z-40
                bg-card border-r border-border
                overflow-y-auto custom-scrollbar
                transition-transform duration-300 ease-in-out
                ${isMobileNavOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
              `}
              style={{ width: navWidth }}
            >
              <div className="p-6">
                <DocumentNav
                  items={headings}
                  activeId={activeId}
                  onItemClick={handleNavItemClick}
                />
              </div>
            </aside>
          </>
        )}

        {/* 主内容区域 */}
        <main className="flex-1 min-w-0">
          <div className="max-w-4xl mx-auto px-6 lg:px-12 py-8 lg:py-12">
            <DocumentViewer
              content={content}
              onHeadingClick={setActiveId}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
