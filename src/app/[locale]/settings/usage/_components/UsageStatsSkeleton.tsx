"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function UsageStatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-background-1 border border-background-2 rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <Skeleton className="h-4 w-28 rounded" />
          </div>
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

