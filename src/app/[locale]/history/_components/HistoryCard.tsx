"use client";

import { motion } from "framer-motion";
import { Trash2, Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { useModalStore } from "@/store/useModalStore";
import { useImageDownload } from "@/hooks/useImageDownload";
import { formatDate } from "./utils";
import type { HistoryItem } from "./types";

interface HistoryCardProps {
  item: HistoryItem;
  onDelete: (id: string) => Promise<void>;
}

export function HistoryCard({ item, onDelete }: HistoryCardProps) {
  const t = useTranslations("history");
  const { openMediaPreview } = useModalStore();
  const { downloadImages } = useImageDownload();

  const handleDownload = async () => {
    await downloadImages(item.results.map(r => r.url));
  };

  return (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group rounded-lg border border-background-2 bg-background-1 p-4 transition-all hover:border-foreground/20 cursor-pointer"
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
            <button
              onClick={handleDownload}
              className="flex items-center gap-1 rounded-lg border border-background-2 bg-background-2/40 px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-background-2/60 cursor-pointer"
              title={t("download")}
            >
              <Download className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => onDelete(item.id)}
            className="flex items-center gap-1 rounded-lg border border-background-2 bg-background-2/40 px-3 py-2 text-xs font-medium text-foreground transition-colors hover:border-red-500/50 hover:bg-background-2/60 hover:text-red-500 cursor-pointer"
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
              className="aspect-square rounded-lg overflow-hidden bg-background-2/60 border border-background-2 hover:border-foreground/30 transition-colors cursor-pointer"
            >
              {result.type === "image" ? (
                <img
                  src={result.url}
                  alt={`${item.prompt}-${result.id}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                />
              ) : (
                <video
                  src={result.url}
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="h-24 rounded-lg bg-background-2/60 border border-background-2 flex items-center justify-center">
          <p className="text-xs text-muted-foreground">No media</p>
        </div>
      )}
    </motion.div>
  );
}
