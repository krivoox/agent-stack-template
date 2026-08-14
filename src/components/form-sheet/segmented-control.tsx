"use client";

import { cn } from "@/lib/utils";

export type SegmentOption<T extends string> = {
  value: T;
  label: string;
};

type SegmentedControlProps<T extends string> = {
  id?: string;
  value: T;
  options: readonly SegmentOption<T>[];
  onChange: (value: T) => void;
  ariaLabel: string;
  disabled?: boolean;
  className?: string;
};

/** Compact exclusive choice — prefer over a long select for ≤4 options. */
export function SegmentedControl<T extends string>({
  id,
  value,
  options,
  onChange,
  ariaLabel,
  disabled,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      id={id}
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        "grid gap-1 rounded-lg bg-muted p-1",
        options.length === 3 && "grid-cols-3",
        options.length === 2 && "grid-cols-2",
        options.length === 4 && "grid-cols-2 sm:grid-cols-4",
        options.length > 4 && "grid-cols-2",
        className,
      )}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              "h-9 rounded-md px-2 text-sm font-medium transition-[color,background-color,box-shadow] duration-150 ease-out",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
              "disabled:pointer-events-none disabled:opacity-50",
              selected
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
