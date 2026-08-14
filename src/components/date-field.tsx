"use client";

import * as React from "react";
import { CalendarIcon, XIcon } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatDateOnly } from "@/lib/format-date";
import { cn } from "@/lib/utils";

/** Convierte un `Date` local a `DateOnly` (`YYYY-MM-DD`) sin desplazamiento de zona. */
function toDateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Interpreta `YYYY-MM-DD` como día calendario local (no UTC) para evitar off-by-one. */
function parseDateOnly(value: string | undefined): Date | undefined {
  if (!value) return undefined;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return undefined;
  const date = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
  );
  return Number.isNaN(date.getTime()) ? undefined : date;
}

type DateFieldProps = {
  id: string;
  /** `DateOnly` (`YYYY-MM-DD`) o cadena vacía. */
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  name?: string;
  disabled?: boolean;
  invalid?: boolean;
  /** Muestra la acción de limpiar cuando hay valor (campos opcionales). */
  clearable?: boolean;
  placeholder?: string;
  /** Límites en `DateOnly`. */
  min?: string;
  max?: string;
  className?: string;
  /** Ajustes del control visible (p. ej. alto táctil en filtros). */
  triggerClassName?: string;
  align?: "start" | "center" | "end";
};

export function DateField({
  id,
  value,
  onChange,
  onBlur,
  name,
  disabled,
  invalid,
  clearable = false,
  placeholder = "Elegir fecha",
  min,
  max,
  className,
  triggerClassName,
  align = "start",
}: DateFieldProps) {
  const [open, setOpen] = React.useState(false);
  const selected = parseDateOnly(value);
  const minDate = parseDateOnly(min);
  const maxDate = parseDateOnly(max);

  const commit = (next: string) => {
    onChange(next);
    onBlur?.();
  };

  const handleSelect = (date: Date | undefined) => {
    if (!date) return;
    commit(toDateOnly(date));
    setOpen(false);
  };

  const showClear = clearable && Boolean(value) && !disabled;

  return (
    <div className={cn("relative", className)}>
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) onBlur?.();
        }}
      >
        <PopoverTrigger
          id={id}
          name={name}
          type="button"
          disabled={disabled}
          aria-invalid={invalid || undefined}
          className={cn(
            "flex h-8 w-full min-w-0 items-center gap-2 rounded-lg border border-input bg-transparent px-2.5 py-1 text-left text-base transition-colors outline-none",
            "hover:border-ring/40 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            "data-[state=open]:border-ring data-[state=open]:ring-3 data-[state=open]:ring-ring/50",
            "disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50",
            "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
            "md:text-sm dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
            showClear && "pr-8",
            triggerClassName,
          )}
        >
          <CalendarIcon
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden
          />
          {value ? (
            <span className="truncate tabular-nums">
              {formatDateOnly(value)}
            </span>
          ) : (
            <span className="truncate text-muted-foreground">
              {placeholder}
            </span>
          )}
        </PopoverTrigger>
        <PopoverContent
          align={align}
          collisionPadding={12}
          className="w-auto gap-0 p-2"
        >
          <Calendar
            mode="single"
            autoFocus
            selected={selected}
            defaultMonth={selected ?? new Date()}
            onSelect={handleSelect}
            startMonth={minDate}
            endMonth={maxDate}
            disabled={[
              ...(minDate ? [{ before: minDate }] : []),
              ...(maxDate ? [{ after: maxDate }] : []),
            ]}
          />
          <div className="mt-1 flex items-center justify-between gap-2 border-t border-border pt-2">
            <button
              type="button"
              className="rounded-md px-2 py-1 text-xs font-medium text-info transition-colors outline-none hover:bg-info-muted focus-visible:ring-3 focus-visible:ring-ring/50"
              onClick={() => {
                const today = new Date();
                if (minDate && today < minDate) return;
                if (maxDate && today > maxDate) return;
                commit(toDateOnly(today));
                setOpen(false);
              }}
            >
              Hoy
            </button>
            {clearable ? (
              <button
                type="button"
                className="rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                onClick={() => {
                  commit("");
                  setOpen(false);
                }}
              >
                Limpiar
              </button>
            ) : null}
          </div>
        </PopoverContent>
      </Popover>
      {showClear ? (
        <button
          type="button"
          aria-label="Quitar fecha"
          onClick={() => commit("")}
          className="absolute top-1/2 right-1.5 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <XIcon className="size-3.5" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}
