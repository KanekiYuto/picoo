"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function UsageTableSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-xl bg-background-1">
        <div className="bg-sidebar-hover/50 px-5 py-3 flex gap-4">
          <Skeleton className="h-3 w-32 rounded" />
          <Skeleton className="h-3 w-20 rounded" />
          <Skeleton className="h-3 flex-1 rounded" />
          <Skeleton className="h-3 w-20 rounded" />
          <Skeleton className="h-3 w-24 rounded" />
        </div>

        <div className="divide-y divide-border">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="px-5 py-4 flex gap-4 items-center">
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-4 flex-1 rounded" />
              <Skeleton className="h-4 w-16 rounded" />
              <Skeleton className="h-4 w-20 rounded" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24 rounded" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
