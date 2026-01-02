"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { HistoryCard } from "./_components/HistoryCard";
import { Pagination } from "./_components/Pagination";
import { HistorySkeleton } from "./_components/HistorySkeleton";
import type { HistoryItem } from "./_components/types";

export default function HistoryPage() {
  const t = useTranslations("history");
  const [histories, setHistories] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
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
        ) : isLoading ? (
          <>
            <HistorySkeleton />
          </>
        ) : (
          <>
            <div className="space-y-4">
              {histories.map((item) => (
                <HistoryCard
                  key={item.id}
                  item={item}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            {/* 分页器 */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              isLoading={isLoading}
              onPageChange={setCurrentPage}
              translationNamespace="history"
            />
          </>
        )}
      </div>
    </div>
  );
}
