import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Progress fill tones (DESIGN.md).
 * - info / progress / success: healthy progress toward a target
 * - caution: approaching a limit (amber)
 * - alert: ONLY for exceeded / critical
 * - chart-*: relative ranking bars (never alert red)
 */
const fillVariants = cva("h-full rounded-full transition-[width]", {
  variants: {
    tone: {
      info: "bg-info",
      progress: "bg-chart-5",
      success: "bg-success",
      caution: "bg-warning",
      alert: "bg-destructive",
      "chart-1": "bg-chart-1",
      "chart-2": "bg-chart-2",
      "chart-3": "bg-chart-3",
    },
  },
  defaultVariants: {
    tone: "info",
  },
});

const trackVariants = cva("w-full overflow-hidden rounded-full bg-muted", {
  variants: {
    size: {
      sm: "h-1",
      md: "h-1.5",
      lg: "h-2",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export type ProgressTone = NonNullable<
  VariantProps<typeof fillVariants>["tone"]
>;

type ProgressBarProps = {
  /** 0–100 (values outside are clamped for width) */
  value: number;
  tone?: ProgressTone;
  size?: VariantProps<typeof trackVariants>["size"];
  className?: string;
  "aria-label"?: string;
};

export function ProgressBar({
  value,
  tone = "info",
  size = "md",
  className,
  "aria-label": ariaLabel,
}: ProgressBarProps) {
  const width = Math.min(100, Math.max(0, value));

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(width)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel}
      className={cn(trackVariants({ size }), className)}
    >
      <div className={fillVariants({ tone })} style={{ width: `${width}%` }} />
    </div>
  );
}

/** Progress toward a target the user wants to reach. Red is never used here. */
export function targetProgressTone(percent: number): ProgressTone {
  if (percent >= 80) return "success";
  if (percent >= 40) return "progress";
  return "info";
}

/** Consumption of a capped resource. Red (`alert`) only when exceeded. */
export function quotaProgressTone(
  status: "on_track" | "warning" | "exceeded",
): ProgressTone {
  if (status === "exceeded") return "alert";
  if (status === "warning") return "caution";
  return "info";
}

/** Relative ranking bars — chart palette, never alert red. */
export function rankTone(index: number): ProgressTone {
  const tones: ProgressTone[] = ["chart-1", "chart-2", "chart-3"];
  return tones[index % tones.length]!;
}
