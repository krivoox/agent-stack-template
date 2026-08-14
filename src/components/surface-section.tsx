import { cn } from "@/lib/utils";

type SurfaceSectionProps = {
  children: React.ReactNode;
  className?: string;
  /** Softer muted fill (pastel landing vibe) */
  muted?: boolean;
  /** Remove padding — for tables flush to edges */
  flush?: boolean;
} & React.ComponentProps<"div">;

/**
 * Shared product surface — landing-aligned chrome:
 * rounded-2xl, hairline border, optional muted fill.
 * Use for dashboard widgets and denser page sections.
 */
export function SurfaceSection({
  children,
  className,
  muted = false,
  flush = false,
  ...props
}: SurfaceSectionProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border",
        /*
          Nested elevation: panel is `card`; widgets step up.
          Dark: secondary charcoal on the elevation ladder.
          Light: soft muted wash on paper.
        */
        muted
          ? "bg-muted/50 dark:bg-muted"
          : "bg-muted/35 dark:bg-secondary",
        "dark:border-transparent dark:shadow-sm",
        flush ? "overflow-hidden" : "p-4 sm:p-5",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

type SurfaceHeaderProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

export function SurfaceHeader({
  title,
  description,
  action,
  className,
}: SurfaceHeaderProps) {
  return (
    <div
      className={cn(
        "mb-4 flex flex-wrap items-end justify-between gap-2",
        className,
      )}
    >
      <div className="min-w-0">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        {description ? (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
