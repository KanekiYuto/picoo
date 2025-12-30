import { Skeleton } from "@/components/ui/skeleton";

export function UsageSkeleton() {
  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header Skeleton */}
      <div className="border border-border rounded-2xl p-5 md:p-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="lg:hidden h-9 w-9 rounded-lg" />
            <Skeleton className="h-8 w-32 rounded-lg" />
          </div>
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>

      {/* 统计卡片 Skeleton */}
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border border-border rounded-2xl p-5">
            <div className="space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        ))}
      </div>

      {/* 表格 Skeleton */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-9 w-40 rounded-lg" />
        </div>

        <div className="border border-border rounded-2xl overflow-hidden">
          {/* 表头 */}
          <div className="px-5 py-3 flex gap-4">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 flex-1" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-24" />
          </div>

          {/* 表格行 */}
          <div className="divide-y divide-border">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="px-5 py-4 flex gap-4 items-center">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
