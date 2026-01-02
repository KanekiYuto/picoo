"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { FilterTabs } from "./_components/FilterTabs";
import { AssetsGrid } from "./_components/AssetsGrid";
import { AssetDetail } from "./_components/AssetDetail";
import { Pagination } from "./_components/Pagination";
import type { AssetInfo, FilterType } from "./_components/types";

export default function AssetsPage() {
  const t = useTranslations("assets");
  const [assets, setAssets] = useState<AssetInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedAsset, setSelectedAsset] = useState<AssetInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 30;

  // 当 filter 或 currentPage 变化时立即重置加载状态
  useEffect(() => {
    setIsLoading(true);
    setMinTimeElapsed(false);
  }, [currentPage, filter]);

  // 获取数据
  useEffect(() => {
    let timer: NodeJS.Timeout;

    const fetchAssets = async () => {
      try {
        // 设置最小显示时间
        timer = setTimeout(() => {
          setMinTimeElapsed(true);
        }, 600);

        const offset = (currentPage - 1) * itemsPerPage;

        const params = new URLSearchParams();
        if (filter !== "all") {
          params.append("type", filter);
        }
        params.append("offset", String(offset));
        params.append("limit", String(itemsPerPage));

        const response = await fetch(`/api/asset?${params.toString()}`);
        if (!response.ok) {
          throw new Error("Failed to fetch assets");
        }

        const data = await response.json();
        setAssets(data.data?.assets || []);
        setTotalCount(data.data?.total || 0);
      } catch (error) {
        console.error("Failed to fetch assets:", error);
        setAssets([]);
        setTotalCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssets();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [currentPage, filter, itemsPerPage]);

  // 计算总页数
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <div className="bg-background">
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        {/* 标题和筛选器 */}
        <div className="mb-6 flex items-center justify-between">
          {/* 左侧标题 */}
          <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>

          {/* 右侧筛选标签 */}
          <FilterTabs
            filter={filter}
            onFilterChange={(newFilter) => {
              setFilter(newFilter);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* 素材网格 */}
        <AssetsGrid
          assets={assets}
          isLoading={isLoading || !minTimeElapsed}
          filter={filter}
          onAssetClick={setSelectedAsset}
        />

        {/* 分页器 */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          isLoading={isLoading}
          onPageChange={setCurrentPage}
          translationNamespace="assets"
        />
      </div>

      {/* 素材详情弹窗 */}
      <AssetDetail asset={selectedAsset} onClose={() => setSelectedAsset(null)} />
    </div>
  );
}

