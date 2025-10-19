import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb / Page title */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-28" />
          </div>
          <Skeleton className="h-5 w-24" />
        </div>

        {/* Overview cards skeleton */}
        <div className="mb-8 rounded-lg border bg-card">
          <div className="border-b p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-64" />
              </div>
              <div className="hidden gap-2 md:flex">
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="text-center">
                  <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/40">
                    <Skeleton className="h-6 w-6 rounded-md" />
                  </div>
                  <Skeleton className="mx-auto mb-1 h-6 w-16" />
                  <Skeleton className="mx-auto h-4 w-24" />
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-between border-t pt-6">
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
        </div>

        {/* Toolbar skeleton */}
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <Skeleton className="h-10 w-full md:w-80" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>

        {/* Results meta */}
        <div className="mb-8 flex items-center justify-between text-sm text-muted-foreground">
          <Skeleton className="h-4 w-60" />
          <Skeleton className="h-4 w-40" />
        </div>

        {/* Cards grid skeleton */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-4">
              {/* Header */}
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <Skeleton className="h-5 w-32" />
                </div>
                <Skeleton className="h-5 w-8" />
              </div>
              <Skeleton className="mb-2 h-4 w-20" />
              <Skeleton className="mb-1 h-4 w-full" />
              <Skeleton className="mb-4 h-4 w-2/3" />

              {/* Meta row */}
              <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Skeleton className="h-3 w-3 rounded-full" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex items-center gap-1">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-10" />
                </div>
                <div className="flex items-center gap-1">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-10" />
                </div>
              </div>

              {/* Updated */}
              <Skeleton className="mb-4 h-3 w-40" />

              {/* Actions */}
              <div className="mt-auto space-y-2">
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
