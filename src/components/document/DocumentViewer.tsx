"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
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
    <article className={`document-viewer ${className}`}>
      <div className="document-content space-y-4">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[
            rehypeSlug,
            rehypePrism,
          ]}
          components={{
            // 自定义标题渲染
            h1: ({ node, ...props }) => (
              <h1 className="scroll-m-20 text-3xl font-semibold tracking-tight mt-8 mb-5" {...props} />
            ),
            h2: ({ node, ...props }) => (
              <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight mt-8 mb-5" {...props} />
            ),
            h3: ({ node, ...props }) => (
              <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mt-6 mb-3" {...props} />
            ),
            h4: ({ node, ...props }) => (
              <h4 className="scroll-m-20 text-xl font-semibold tracking-tight mt-5 mb-2" {...props} />
            ),
            // 自定义段落
            p: ({ node, ...props }) => <p className="leading-7 [&:not(:first-child)]:mt-6" {...props} />,
            // 自定义链接
            a: ({ node, ...props }) => (
              <a
                className="font-medium text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
                {...props}
              />
            ),
            // 自定义列表
            ul: ({ node, ...props }) => <ul className="my-6 ml-6 list-disc [&>li]:mt-2" {...props} />,
            ol: ({ node, ...props }) => <ol className="my-6 ml-6 list-decimal [&>li]:mt-2" {...props} />,
            li: ({ node, ...props }) => <li className="leading-7" {...props} />,
            // 自定义代码块
            code: ({ node, className, children, ...props }) => {
              const match = /language-(\w+)/.exec(className || "");
              const isInline = !match;

              if (isInline) {
                return (
                  <code
                    className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold"
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
                className="mb-4 mt-6 overflow-x-auto rounded-lg border bg-black p-4"
                {...props}
              />
            ),
            // 自定义引用块
            blockquote: ({ node, ...props }) => (
              <blockquote
                className="mt-6 border-l-2 pl-6 italic"
                {...props}
              />
            ),
            // 自定义表格
            table: ({ node, ...props }) => (
              <div className="my-6 w-full overflow-y-auto">
                <table className="w-full" {...props} />
              </div>
            ),
            thead: ({ node, ...props }) => <thead {...props} />,
            tbody: ({ node, ...props }) => <tbody {...props} />,
            tr: ({ node, ...props }) => <tr className="m-0 border-t p-0 even:bg-muted" {...props} />,
            th: ({ node, ...props }) => (
              <th className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right" {...props} />
            ),
            td: ({ node, ...props }) => <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right" {...props} />,
            // 自定义水平线
            hr: ({ node, ...props }) => <hr className="my-4 md:my-8" {...props} />,
            // 加粗文本
            strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </article>
  );
}
