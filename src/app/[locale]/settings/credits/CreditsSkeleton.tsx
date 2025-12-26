export function CreditsSkeleton() {
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

      {/* 积分总览 Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-sidebar-bg border border-border rounded-2xl p-5">
            <div className="space-y-3">
              <div className="h-4 w-24 bg-sidebar-hover rounded" />
              <div className="h-10 w-32 bg-sidebar-hover rounded" />
              <div className="h-3 w-20 bg-sidebar-hover rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* 积分详情 Skeleton */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-4 w-20 bg-sidebar-hover rounded" />
          <div className="h-9 w-48 bg-sidebar-hover rounded-lg" />
        </div>

        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-sidebar-bg border border-border rounded-2xl p-5 md:p-6">
              <div className="space-y-4">
                {/* 标题和状态 */}
                <div className="flex items-center justify-between">
                  <div className="h-5 w-32 bg-sidebar-hover rounded" />
                  <div className="h-6 w-16 bg-sidebar-hover rounded" />
                </div>

                {/* 日期范围 */}
                <div className="h-8 w-56 bg-sidebar-hover/50 rounded-lg" />

                {/* 主要数据 */}
                <div className="space-y-2">
                  <div className="h-10 w-48 bg-sidebar-hover rounded" />
                </div>

                {/* 进度条 */}
                <div className="h-3 bg-sidebar-hover rounded-full" />

                {/* 统计卡片 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-sidebar-hover/50 rounded-xl p-3 border border-border/50">
                    <div className="space-y-2">
                      <div className="h-3 w-16 bg-sidebar-hover rounded" />
                      <div className="h-6 w-20 bg-sidebar-hover rounded" />
                    </div>
                  </div>
                  <div className="bg-sidebar-hover/50 rounded-xl p-3 border border-border/50">
                    <div className="space-y-2">
                      <div className="h-3 w-16 bg-sidebar-hover rounded" />
                      <div className="h-6 w-20 bg-sidebar-hover rounded" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
