"use client";

import { motion } from "framer-motion";
import { Image, Video } from "lucide-react";
import { useTranslations } from "next-intl";
import type { FilterType } from "./types";

interface FilterTabsProps {
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export function FilterTabs({ filter, onFilterChange }: FilterTabsProps) {
  const t = useTranslations("assets");

  return (
    <div className="relative flex gap-1 rounded-lg border border-border bg-sidebar-bg p-1">
      {/* 全部 */}
      <motion.button
        onClick={() => onFilterChange("all")}
        className={`relative rounded px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
          filter === "all" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        {filter === "all" && (
          <motion.div
            layoutId="filter-tab"
            className="absolute inset-0 rounded bg-foreground"
            transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
          />
        )}
        <span className={`relative z-10 ${filter === "all" ? "text-background" : ""}`}>
          {t("filters.all")}
        </span>
      </motion.button>

      {/* 图片 */}
      <motion.button
        onClick={() => onFilterChange("image")}
        className={`relative rounded px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
          filter === "image" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        {filter === "image" && (
          <motion.div
            layoutId="filter-tab"
            className="absolute inset-0 rounded bg-foreground"
            transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
          />
        )}
        <span className={`relative z-10 flex items-center gap-1.5 ${filter === "image" ? "text-background" : ""}`}>
          <Image className="h-3.5 w-3.5" />
          {t("filters.image")}
        </span>
      </motion.button>

      {/* 视频 */}
      <motion.button
        onClick={() => onFilterChange("video")}
        className={`relative rounded px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
          filter === "video" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        {filter === "video" && (
          <motion.div
            layoutId="filter-tab"
            className="absolute inset-0 rounded bg-foreground"
            transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
          />
        )}
        <span className={`relative z-10 flex items-center gap-1.5 ${filter === "video" ? "text-background" : ""}`}>
          <Video className="h-3.5 w-3.5" />
          {t("filters.video")}
        </span>
      </motion.button>
    </div>
  );
}
