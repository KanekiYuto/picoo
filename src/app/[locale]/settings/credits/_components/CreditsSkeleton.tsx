import { Skeleton } from "@/components/ui/skeleton";

export function CreditsSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-2xl border border-background-2 bg-background-1">
        <div className="flex items-center gap-2 px-4 py-2.5">
          <Skeleton className="size-4 rounded" />
          <Skeleton className="h-4 w-24 rounded" />
        </div>
        <div className="rounded-t-2xl border-t border-background-2 bg-background p-4">
          <Skeleton className="mb-4 h-10 w-32 rounded-lg" />
          <div className="grid gap-3 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl bg-background-1 p-3">
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-5 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-background-2 bg-background-1">
        <div className="flex items-center justify-between px-4 py-2.5">
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-7 w-36 rounded-full" />
        </div>
        <div className="flex flex-col gap-3 rounded-t-2xl border-t border-background-2 bg-background p-4">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-xl bg-background-1 p-4">
              <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
                <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-8 w-56 rounded-lg" />
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-3 rounded-full" />
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-1">
                  <div className="rounded-xl bg-background p-3">
                    <div className="flex flex-col gap-2">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                  </div>
                  <div className="rounded-xl bg-background p-3">
                    <div className="flex flex-col gap-2">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-6 w-20" />
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
