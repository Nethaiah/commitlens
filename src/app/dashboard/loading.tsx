import { HeaderSkeleton } from "@/components/header-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <HeaderSkeleton />
      <main className="container mx-auto px-4 py-8">
        {/* Page header */}
        <div className="mb-8">
          <div className="mb-6 flex items-start justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-72" />
              <Skeleton className="h-5 w-96" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-28" />
              <Skeleton className="h-9 w-28" />
              <Skeleton className="h-9 w-28" />
            </div>
          </div>
        </div>

        {/* Overview cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border bg-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-5 w-5 rounded" />
              </div>
              <Skeleton className="mb-2 h-7 w-24" />
              <Skeleton className="h-3 w-40" />
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left col: pie + heatmap */}
          <div className="space-y-8 lg:col-span-2">
            {/* Programming Languages card */}
            <div className="rounded-lg border bg-card">
              <div className="border-b p-6">
                <Skeleton className="mb-2 h-5 w-56" />
                <Skeleton className="h-4 w-80" />
              </div>
              <div className="p-6">
                <div className="flex flex-col items-start gap-8 lg:flex-row">
                  <div className="mx-auto h-64 w-64 rounded-full bg-accent/40" />
                  <div className="w-full flex-1">
                    <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Skeleton className="h-3 w-3 rounded-full" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="rounded-lg bg-muted/50 p-3">
                          <Skeleton className="mb-2 h-4 w-28" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Coding Activity card */}
            <div className="rounded-lg border bg-card">
              <div className="border-b p-6">
                <Skeleton className="mb-2 h-5 w-48" />
                <Skeleton className="h-4 w-72" />
              </div>
              <div className="p-6">
                <div className="space-y-2">
                  <div className="grid grid-cols-8 gap-1 text-xs text-muted-foreground">
                    <div />
                    {Array.from({ length: 7 }).map((_, i) => (
                      <div key={i} className="text-center">
                        <Skeleton className="mx-auto h-3 w-8" />
                      </div>
                    ))}
                  </div>
                  {Array.from({ length: 6 }).map((_, w) => (
                    <div key={w} className="grid grid-cols-8 gap-1">
                      <div className="pr-2 text-right text-xs text-muted-foreground">
                        <Skeleton className="mx-auto h-3 w-10" />
                      </div>
                      {Array.from({ length: 7 }).map((_, d) => (
                        <div key={d} className="h-6 w-6 rounded-sm border bg-accent/30" />
                      ))}
                    </div>
                  ))}
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Less</span>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-3 w-3 rounded-sm bg-accent/30" />
                      ))}
                    </div>
                    <span>More</span>
                    <span className="ml-4">Hover for details</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right col: Most productive days */}
          <div className="space-y-8">
            <div className="rounded-lg border bg-card">
              <div className="border-b p-6">
                <Skeleton className="mb-2 h-5 w-48" />
                <Skeleton className="h-4 w-72" />
              </div>
              <div className="p-6">
                <div className="h-64">
                  <div className="h-full w-full rounded bg-accent/30" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
