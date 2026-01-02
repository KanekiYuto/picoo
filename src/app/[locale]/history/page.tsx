"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trash2, Download, Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { useMediaPreviewStore } from "@/store/useMediaPreviewStore";

// 历史记录结果类型
interface HistoryResult {
  id: string;
  url: string;
  mimeType: string;
  type: string;
}

// 历史记录类型
interface HistoryItem {
  id: string;
  prompt: string;
  results: HistoryResult[];
  createdAt: string;
  updatedAt: string;
}

export default function HistoryPage() {
  const t = useTranslations("history");
  const [histories, setHistories] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const { open: openMediaPreview } = useMediaPreviewStore();
  const itemsPerPage = 20;

  // 获取历史数据
  useEffect(() => {
    const fetchHistories = async () => {
      try {
        setIsLoading(true);
        const offset = (currentPage - 1) * itemsPerPage;

        const params = new URLSearchParams();
        params.append("offset", String(offset));
        params.append("limit", String(itemsPerPage));

        const response = await fetch(`/api/history?${params.toString()}`);
        if (!response.ok) {
          throw new Error("Failed to fetch histories");
        }

        const data = await response.json();
        setHistories(data.data?.histories || []);
        setTotalCount(data.data?.total || 0);
      } catch (error) {
        console.error("Failed to fetch histories:", error);
        setHistories([]);
        setTotalCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistories();
  }, [currentPage, itemsPerPage]);

  // 格式化日期
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 删除历史记录
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/history/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setHistories(histories.filter((item) => item.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete history:", error);
    }
  };

  // 计算总页数
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <div className="bg-background">
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        {/* 标题 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("description")}</p>
        </div>

        {/* 历史列表 */}
        {histories.length === 0 && !isLoading ? (
          <Empty className="border border-border rounded-2xl bg-sidebar-bg py-16 border-solid">
            <EmptyHeader>
              <EmptyMedia variant="icon" className="bg-sidebar-bg">
                <Clock className="h-6 w-6" />
              </EmptyMedia>
              <EmptyTitle>{t("empty.title")}</EmptyTitle>
              <EmptyDescription>{t("empty.description")}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            <div className="space-y-4">
              {histories.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group rounded-lg border border-border bg-sidebar-bg p-4 transition-all hover:border-foreground/20 hover:shadow-md"
                >
                  {/* 上方：标题、日期、操作按钮 */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground line-clamp-2">
                        {item.prompt}
                      </h3>
                      <div className="mt-2 text-xs text-muted-foreground">
                        {formatDate(item.createdAt)}
                      </div>
                    </div>

                    {/* 右侧操作按钮 */}
                    <div className="flex-shrink-0 flex gap-2">
                      {item.results && item.results.length > 0 && (
                        <a
                          href={item.results[0].url}
                          download
                          className="flex items-center gap-1 rounded-lg border border-border bg-muted/10 px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted/20 cursor-pointer"
                          title={t("download")}
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      )}
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="flex items-center gap-1 rounded-lg border border-border bg-muted/10 px-3 py-2 text-xs font-medium text-foreground transition-colors hover:border-red-500/50 hover:bg-muted/20 hover:text-red-500 cursor-pointer"
                        title={t("delete")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* 下方：缩略图网格 */}
                  {item.results && item.results.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
                      {item.results.map((result, idx) => (
                        <div
                          key={result.id}
                          onClick={() => openMediaPreview(
                            item.results.map(r => ({
                              id: r.id,
                              url: r.url,
                              type: r.type as 'image' | 'video',
                            })),
                            idx
                          )}
                          className="aspect-square rounded-lg overflow-hidden bg-muted border border-border hover:border-foreground/30 transition-colors cursor-pointer group"
                        >
                          {result.type === "image" ? (
                            <img
                              src={result.url}
                              alt={`${item.prompt}-${result.id}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <video
                              src={result.url}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-24 rounded-lg bg-muted border border-border flex items-center justify-center">
                      <p className="text-xs text-muted-foreground">No media</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* 分页器 */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-1">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1 || isLoading}
                  className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg border border-border transition-colors hover:bg-muted/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  title={t("pagination.previous")}
                >
                  <span className="text-xs sm:text-sm font-medium">‹</span>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    disabled={isLoading}
                    className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${currentPage === page
                        ? "border border-foreground/20 bg-muted/20 text-foreground"
                        : "border border-border hover:bg-muted/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages || isLoading}
                  className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg border border-border transition-colors hover:bg-muted/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  title={t("pagination.next")}
                >
                  <span className="text-xs sm:text-sm font-medium">›</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
