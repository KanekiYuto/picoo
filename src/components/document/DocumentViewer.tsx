"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrism from "rehype-prism-plus";
import { useEffect, useState } from "react";

interface DocumentViewerProps {
  /** Markdown 内容 */
  content: string;
  /** 是否显示目录 */
  showToc?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 标题点击回调 */
  onHeadingClick?: (id: string) => void;
}

/**
 * 文档查看器组件
 * 用于渲染和展示 Markdown 格式的文档内容
 */
export function DocumentViewer({
  content,
  showToc = false,
  className = "",
  onHeadingClick,
}: DocumentViewerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 处理标题点击
  useEffect(() => {
    if (!mounted || !onHeadingClick) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const heading = target.closest("h1, h2, h3, h4, h5, h6");
      if (heading?.id) {
        onHeadingClick(heading.id);
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [mounted, onHeadingClick]);

  if (!mounted) {
    return (
      <div className={`document-viewer ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  return (
    <article className={`document-viewer prose prose-invert max-w-none ${className}`}>
      <div className="document-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[
            rehypeSlug,
            [
              rehypeAutolinkHeadings,
              {
                behavior: "wrap",
                properties: {
                  className: ["anchor-link"],
                },
              },
            ],
            rehypePrism,
          ]}
          components={{
            // 自定义标题渲染
            h1: ({ node, ...props }) => (
              <h1 className="text-4xl font-bold mt-10 mb-6 text-foreground scroll-mt-20" {...props} />
            ),
            h2: ({ node, ...props }) => (
              <h2 className="text-3xl font-bold mt-8 mb-5 text-foreground scroll-mt-20 border-b border-muted-foreground/10 pb-3" {...props} />
            ),
            h3: ({ node, ...props }) => (
              <h3 className="text-xl font-semibold mt-6 mb-3 text-muted-foreground scroll-mt-20" {...props} />
            ),
            h4: ({ node, ...props }) => (
              <h4 className="text-lg font-medium mt-5 mb-2 text-muted-foreground scroll-mt-20" {...props} />
            ),
            // 自定义段落
            p: ({ node, ...props }) => <p className="mb-4 leading-8 text-muted-foreground" {...props} />,
            // 自定义链接
            a: ({ node, ...props }) => (
              <a
                className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
                {...props}
              />
            ),
            // 自定义列表
            ul: ({ node, ...props }) => <ul className="list-disc list-outside mb-4 ml-6 space-y-2 text-muted-foreground" {...props} />,
            ol: ({ node, ...props }) => <ol className="list-decimal list-outside mb-4 ml-6 space-y-2 text-muted-foreground" {...props} />,
            li: ({ node, ...props }) => <li className="leading-7" {...props} />,
            // 自定义代码块
            code: ({ node, className, children, ...props }) => {
              const match = /language-(\w+)/.exec(className || "");
              const isInline = !match;

              if (isInline) {
                return (
                  <code
                    className="px-2 py-1 rounded bg-muted/50 text-primary text-sm font-mono border border-muted-foreground/20"
                    {...props}
                  >
                    {children}
                  </code>
                );
              }

              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
            pre: ({ node, ...props }) => (
              <pre
                className="bg-muted/30 rounded-lg p-4 overflow-x-auto mb-4 border border-muted-foreground/20"
                {...props}
              />
            ),
            // 自定义引用块
            blockquote: ({ node, ...props }) => (
              <blockquote
                className="border-l-4 border-primary/50 pl-4 italic text-muted-foreground my-6 bg-muted/20 py-2 pr-4 rounded-r"
                {...props}
              />
            ),
            // 自定义表格
            table: ({ node, ...props }) => (
              <div className="overflow-x-auto mb-4 rounded-lg border border-muted-foreground/20">
                <table className="min-w-full divide-y divide-muted-foreground/20" {...props} />
              </div>
            ),
            thead: ({ node, ...props }) => <thead className="bg-muted/40" {...props} />,
            tbody: ({ node, ...props }) => <tbody className="divide-y divide-muted-foreground/20" {...props} />,
            tr: ({ node, ...props }) => <tr className="hover:bg-muted/20 transition-colors" {...props} />,
            th: ({ node, ...props }) => (
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground" {...props} />
            ),
            td: ({ node, ...props }) => <td className="px-4 py-3 text-sm text-muted-foreground" {...props} />,
            // 自定义水平线
            hr: ({ node, ...props }) => <hr className="my-8 border-muted-foreground/10" {...props} />,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </article>
  );
}
