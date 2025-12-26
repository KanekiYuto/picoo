export function ProfileSkeleton() {
  return (
    <div className="space-y-6 md:space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-sidebar-bg border border-border rounded-2xl p-5 md:p-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            {/* Mobile menu button skeleton */}
            <div className="lg:hidden h-9 w-9 rounded-lg bg-sidebar-hover border border-border" />
            {/* Title skeleton */}
            <div className="h-8 w-32 bg-sidebar-hover rounded-lg" />
          </div>
          {/* Description skeleton */}
          <div className="h-4 w-3/4 bg-sidebar-hover rounded" />
        </div>
      </div>

      {/* Settings section skeleton */}
      <div className="space-y-3">
        {/* Section title skeleton */}
        <div className="h-4 w-20 bg-sidebar-hover rounded" />

        {/* User profile card skeleton */}
        <div className="bg-sidebar-bg border border-border rounded-2xl p-5 md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Avatar skeleton */}
              <div className="h-16 w-16 rounded-full bg-sidebar-hover" />

              <div className="space-y-2">
                {/* Name skeleton */}
                <div className="h-5 w-32 bg-sidebar-hover rounded" />
                {/* Email skeleton */}
                <div className="h-4 w-48 bg-sidebar-hover rounded" />
              </div>
            </div>

            {/* Edit button skeleton */}
            <div className="h-9 w-20 bg-sidebar-hover rounded-lg" />
          </div>
        </div>
      </div>

      {/* Billing section skeleton */}
      <div className="space-y-3">
        {/* Section title skeleton */}
        <div className="h-4 w-20 bg-sidebar-hover rounded" />

        {/* Billing card skeleton */}
        <div className="bg-sidebar-bg border border-border rounded-2xl p-5 md:p-6">
          <div className="space-y-4">
            {/* Plan name skeleton */}
            <div className="h-6 w-24 bg-sidebar-hover rounded" />

            {/* Plan description skeleton */}
            <div className="space-y-2">
              <div className="h-4 w-full bg-sidebar-hover rounded" />
              <div className="h-4 w-3/4 bg-sidebar-hover rounded" />
            </div>

            {/* Button skeleton */}
            <div className="h-10 w-32 bg-sidebar-hover rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
