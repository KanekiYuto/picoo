"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function UsageStatsSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-background-2 bg-background-1">
      <div className="flex items-center gap-2 px-4 py-2.5">
        <Skeleton className="size-4 rounded" />
        <Skeleton className="h-4 w-24 rounded" />
      </div>
      <div className="grid gap-3 rounded-t-2xl border-t border-background-2 bg-background p-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl bg-background-1 p-3">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-3 w-24 rounded" />
              <Skeleton className="h-6 w-20 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
