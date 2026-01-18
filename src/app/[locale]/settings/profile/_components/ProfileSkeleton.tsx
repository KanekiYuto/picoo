import { Skeleton } from "@/components/ui/skeleton";

export function ProfileSkeleton() {
  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header Skeleton */}
      <div className="border border-border rounded-2xl p-5 md:p-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            {/* Mobile menu button skeleton */}
            <Skeleton className="lg:hidden h-9 w-9 rounded-lg" />
            {/* Title skeleton */}
            <Skeleton className="h-8 w-32 rounded-lg" />
          </div>
          {/* Description skeleton */}
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>

      {/* Settings section skeleton */}
      <div className="space-y-3">
        {/* Section title skeleton */}
        <Skeleton className="h-4 w-20" />

        {/* User profile card skeleton */}
        <div className="border border-border rounded-2xl p-5 md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Avatar skeleton */}
              <Skeleton className="h-16 w-16 rounded-full" />

              <div className="space-y-2">
                {/* Name skeleton */}
                <Skeleton className="h-5 w-32" />
                {/* Email skeleton */}
                <Skeleton className="h-4 w-48" />
              </div>
            </div>

            {/* Edit button skeleton */}
            <Skeleton className="h-9 w-20 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Billing section skeleton */}
      <div className="space-y-3">
        {/* Section title skeleton */}
        <Skeleton className="h-4 w-20" />

        {/* Billing card skeleton */}
        <div className="border border-border rounded-2xl p-5 md:p-6">
          <div className="space-y-4">
            {/* Plan name skeleton */}
            <Skeleton className="h-6 w-24" />

            {/* Plan description skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>

            {/* Button skeleton */}
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
