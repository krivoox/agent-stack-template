import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type PageSkeletonProps = {
  variant?: "list" | "detail" | "dashboard";
  className?: string;
};

/**
 * Route-level loading UI for `(app)` segments.
 *
 * Mirrors `ContentPanel` chrome exactly so a soft-nav paints the final layout
 * immediately and the streamed content drops in without shifting anything.
 * Every `(app)` segment should export a `loading.tsx` built on this.
 */
export function PageSkeleton({
  variant = "list",
  className,
}: PageSkeletonProps) {
  return (
    <section
      className={cn(
        "flex flex-1 flex-col bg-card md:min-h-0 md:overflow-hidden md:rounded-2xl md:border md:border-border md:shadow-sm",
        "dark:md:border-transparent dark:md:shadow-[0_8px_30px_oklch(0_0_0/0.45)]",
        className,
      )}
      aria-busy
      aria-label="Loading"
    >
      <header className="flex shrink-0 flex-col gap-3 border-b border-border px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6 sm:py-5 lg:px-8">
        <div className="min-w-0 space-y-2">
          <Skeleton className="h-7 w-40 sm:h-8 sm:w-52" />
          <Skeleton className="h-4 w-56 max-w-full" />
        </div>
        <Skeleton className="h-10 w-full rounded-full sm:h-8 sm:w-28" />
      </header>

      <div className="flex-1 space-y-5 px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6">
        {variant === "dashboard" ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-48 rounded-xl" />
          </>
        ) : null}

        {variant === "list" ? (
          <>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-24 rounded-full" />
              ))}
            </div>
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          </>
        ) : null}

        {variant === "detail" ? (
          <>
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-48" />
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-5 w-full max-w-xs" />
                </div>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
