"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function HistorySkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="rounded-lg border border-border bg-sidebar-bg p-4">
          {/* 标题和日期行 */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1 min-w-0">
              <Skeleton className="h-5 w-3/4 mb-3" />
              <Skeleton className="h-4 w-1/3" />
            </div>
            <div className="flex-shrink-0 flex gap-2">
              <Skeleton className="h-9 w-9 rounded" />
              <Skeleton className="h-9 w-9 rounded" />
            </div>
          </div>

          {/* 缩略图网格 */}
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
            {Array.from({ length: 8 }).map((_, j) => (
              <Skeleton
                key={j}
                className="aspect-square rounded-lg"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

