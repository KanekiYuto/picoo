"use client";

import { Image, Video } from "lucide-react";
import { useTranslations } from "next-intl";
import { AssetCard } from "./AssetCard";
import { AssetsSkeleton } from "./AssetsSkeleton";
import type { AssetInfo, FilterType } from "./types";

interface AssetsGridProps {
  assets: AssetInfo[];
  isLoading: boolean;
  filter: FilterType;
  onAssetClick: (asset: AssetInfo) => void;
}

export function AssetsGrid({ assets, isLoading, filter, onAssetClick }: AssetsGridProps) {
  const t = useTranslations("assets");

  if (isLoading) {
    return <AssetsSkeleton />;
  }

  if (assets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-sidebar-bg py-16">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-sidebar-bg">
          {filter === "image" ? (
            <Image className="h-10 w-10 text-muted-foreground" />
          ) : filter === "video" ? (
            <Video className="h-10 w-10 text-muted-foreground" />
          ) : (
            <Image className="h-10 w-10 text-muted-foreground" />
          )}
        </div>
        <h3 className="text-lg font-medium text-foreground">{t("empty.title")}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{t("empty.description")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {assets.map((asset) => (
        <AssetCard
          key={asset.id}
          asset={asset}
          onClick={() => onAssetClick(asset)}
        />
      ))}
    </div>
  );
}
