import { Skeleton } from "@/components/ui/skeleton";

export function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-2xl border border-background-2 bg-background-1">
        <div className="flex items-center gap-2 px-4 py-2.5">
          <Skeleton className="size-4 rounded" />
          <Skeleton className="h-4 w-20 rounded" />
        </div>
        <div className="rounded-t-2xl border-t border-background-2 bg-background p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <Skeleton className="size-14 rounded-full" />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
            <Skeleton className="size-8 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
