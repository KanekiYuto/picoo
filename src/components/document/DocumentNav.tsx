"use client";

import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { useTranslations } from 'next-intl';

export interface DocumentNavItem {
  /** 导航项 ID */
  id: string;
  /** 导航项标题 */
  title: string;
  /** 层级（1-6，对应 h1-h6） */
  level: number;
  /** 子导航项 */
  children?: DocumentNavItem[];
}

interface DocumentNavProps {
  /** 导航数据 */
  items: DocumentNavItem[];
  /** 当前激活的项 */
  activeId?: string;
  /** 点击导航项回调 */
  onItemClick?: (id: string) => void;
  /** 标题文本 */
  title?: string;
  /** 自定义类名 */
  className?: string;
}

/**
 * 文档导航组件
 * 用于展示文档的目录结构和快速导航
 */
export function DocumentNav({
  items,
  activeId,
  onItemClick,
  className = "",
}: DocumentNavProps) {
  const t = useTranslations('document.nav');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // 初始化展开所有项
  useEffect(() => {
    const allIds = new Set<string>();
    const traverse = (items: DocumentNavItem[]) => {
      items.forEach((item) => {
        if (item.children && item.children.length > 0) {
          allIds.add(item.id);
          traverse(item.children);
        }
      });
    };
    traverse(items);
    setExpandedItems(allIds);
  }, [items]);

  // 切换展开/收起
  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // 处理导航项点击
  const handleItemClick = (id: string) => {
    onItemClick?.(id);
    // 平滑滚动到目标元素
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // 渲染导航项
  const renderItem = (item: DocumentNavItem, index: number) => {
    const isActive = activeId === item.id;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);

    // 根据层级计算缩进
    const paddingLeft = `${(item.level - 1) * 0.75}rem`;

    return (
      <li key={item.id} className="nav-item">
        <div
          className={`
            flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer
            transition-all duration-200
            ${isActive
              ? "bg-[var(--color-sidebar-active)] text-primary font-medium"
              : "text-gray-300 hover:bg-[var(--color-sidebar-hover)] hover:text-foreground"
            }
          `}
          style={{ paddingLeft }}
          onClick={() => handleItemClick(item.id)}
        >
          {hasChildren && (
            <button
              className="flex-shrink-0 p-0.5 hover:bg-[var(--color-sidebar-active)] rounded transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(item.id);
              }}
              aria-label={isExpanded ? t('collapse') : t('expand')}
            >
              <ChevronRight
                className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-90" : ""}`}
              />
            </button>
          )}
          <span className="flex-1 text-sm truncate">{item.title}</span>
        </div>

        {hasChildren && isExpanded && (
          <ul className="mt-1 space-y-1">
            {item.children!.map((child, childIndex) => renderItem(child, childIndex))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <nav className={`document-nav ${className}`}>
      <div className="mb-4 pb-3 border-b border-[var(--color-border)]">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
          {t('title')}
        </h2>
      </div>

      <ul className="space-y-1">
        {items.map((item, index) => renderItem(item, index))}
      </ul>

      {items.length === 0 && (
        <div className="text-center py-8 text-gray-500 text-sm">
          {t('empty')}
        </div>
      )}
    </nav>
  );
}

/**
 * 从 Markdown 内容提取导航结构的工具函数
 */
export function extractHeadingsFromMarkdown(markdown: string): DocumentNavItem[] {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings: DocumentNavItem[] = [];
  const stack: { item: DocumentNavItem; level: number }[] = [];

  let match;
  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const title = match[2].trim();
    const id = title
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fa5]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const item: DocumentNavItem = {
      id,
      title,
      level,
      children: [],
    };

    // 找到合适的父节点
    while (stack.length > 0 && stack[stack.length - 1].level >= level) {
      stack.pop();
    }

    if (stack.length === 0) {
      // 顶层节点
      headings.push(item);
    } else {
      // 子节点
      const parent = stack[stack.length - 1].item;
      if (!parent.children) {
        parent.children = [];
      }
      parent.children.push(item);
    }

    stack.push({ item, level });
  }

  return headings;
}
