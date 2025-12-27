export function AssetsSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        {/* 标题和筛选器骨架 */}
        <div className="mb-6 flex items-center justify-between">
          {/* 左侧标题骨架 */}
          <div className="h-8 w-32 animate-pulse rounded-lg bg-sidebar-bg" />

          {/* 右侧筛选器骨架 */}
          <div className="h-8 w-64 animate-pulse rounded-lg bg-sidebar-bg" />
        </div>

        {/* 素材网格骨架 */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, index) => (
            <div
              key={index}
              className="aspect-square animate-pulse rounded-lg bg-sidebar-bg"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
