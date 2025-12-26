export function UsageSkeleton() {
  return (
    <div className="space-y-6 md:space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-sidebar-bg border border-border rounded-2xl p-5 md:p-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="lg:hidden h-9 w-9 rounded-lg bg-sidebar-hover border border-border" />
            <div className="h-8 w-32 bg-sidebar-hover rounded-lg" />
          </div>
          <div className="h-4 w-3/4 bg-sidebar-hover rounded" />
        </div>
      </div>

      {/* 统计卡片 Skeleton */}
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-sidebar-bg border border-border rounded-2xl p-5">
            <div className="space-y-3">
              <div className="h-4 w-24 bg-sidebar-hover rounded" />
              <div className="h-10 w-32 bg-sidebar-hover rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* 表格 Skeleton */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-4 w-20 bg-sidebar-hover rounded" />
          <div className="h-9 w-40 bg-sidebar-hover rounded-lg" />
        </div>

        <div className="bg-sidebar-bg border border-border rounded-2xl overflow-hidden">
          {/* 表头 */}
          <div className="bg-sidebar-hover/50 px-5 py-3 flex gap-4">
            <div className="h-3 w-32 bg-sidebar-hover rounded" />
            <div className="h-3 w-20 bg-sidebar-hover rounded" />
            <div className="h-3 flex-1 bg-sidebar-hover rounded" />
            <div className="h-3 w-20 bg-sidebar-hover rounded" />
            <div className="h-3 w-24 bg-sidebar-hover rounded" />
          </div>

          {/* 表格行 */}
          <div className="divide-y divide-border">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="px-5 py-4 flex gap-4 items-center">
                <div className="h-4 w-32 bg-sidebar-hover rounded" />
                <div className="h-6 w-16 bg-sidebar-hover rounded" />
                <div className="h-4 flex-1 bg-sidebar-hover rounded" />
                <div className="h-4 w-16 bg-sidebar-hover rounded" />
                <div className="h-4 w-20 bg-sidebar-hover rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
