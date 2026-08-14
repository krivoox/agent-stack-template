"use client";

import * as React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { es } from "react-day-picker/locale";

import { cn } from "@/lib/utils";

/** Cabecera de columnas: dos letras alcanzan y evita el ruido de "lun."/"mié.". */
const WEEKDAY_LABELS_ES = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"] as const;

const MONTH_FORMATTER = new Intl.DateTimeFormat("es", { month: "long" });

function capitalizeFirst(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function CalendarChevron({
  orientation,
  className,
}: {
  orientation?: "up" | "down" | "left" | "right";
  className?: string;
}) {
  const Icon = orientation === "right" ? ChevronRightIcon : ChevronLeftIcon;
  return <Icon className={cn("size-4", className)} aria-hidden />;
}

type CalendarProps = React.ComponentProps<typeof DayPicker>;

/**
 * DayPicker alineado a los tokens del sistema: superficie `popover`,
 * selección en `info`, hoy en `info-muted`, celdas táctiles en móvil.
 */
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  formatters,
  components,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      locale={es}
      showOutsideDays={showOutsideDays}
      className={cn("w-fit select-none text-foreground", className)}
      formatters={{
        formatWeekdayName: (date) => WEEKDAY_LABELS_ES[date.getDay()],
        formatCaption: (date) =>
          `${capitalizeFirst(MONTH_FORMATTER.format(date))} ${date.getFullYear()}`,
        formatMonthDropdown: (date) =>
          capitalizeFirst(MONTH_FORMATTER.format(date)),
        ...formatters,
      }}
      components={{ Chevron: CalendarChevron, ...components }}
      classNames={{
        root: "w-fit",
        months: "relative flex flex-col gap-4",
        month: "flex flex-col gap-1",
        nav: "absolute inset-x-0 top-0 z-10 flex items-center justify-between",
        button_previous:
          "inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40",
        button_next:
          "inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40",
        month_caption: "flex h-8 items-center justify-center px-9",
        caption_label: "text-sm font-medium text-foreground",
        dropdowns:
          "flex h-8 w-full items-center justify-center gap-1.5 px-9 text-sm font-medium",
        dropdown_root:
          "relative rounded-lg border border-transparent transition-colors hover:border-border has-focus:border-ring has-focus:ring-3 has-focus:ring-ring/50",
        dropdown: "absolute inset-0 cursor-pointer opacity-0",
        month_grid: "border-collapse",
        weekdays: "flex",
        weekday:
          "w-10 pb-1.5 text-[0.7rem] font-medium tracking-wide text-muted-foreground uppercase sm:w-9",
        week: "flex w-full",
        day: "relative size-10 p-0 text-center sm:size-9",
        // Los estados viven en el `td` (data-selected / data-today / …); se
        // resuelven por selector de padre para que no compitan por orden de CSS.
        day_button: cn(
          "flex size-full items-center justify-center rounded-lg text-sm tabular-nums transition-colors outline-none hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          "[[data-outside]>&]:text-muted-foreground/60",
          "[[data-today]:not([data-selected])>&]:bg-info-muted [[data-today]:not([data-selected])>&]:font-semibold [[data-today]:not([data-selected])>&]:text-info-muted-foreground [[data-today]:not([data-selected])>&]:hover:bg-info-muted",
          "[[data-selected]>&]:bg-info [[data-selected]>&]:font-medium [[data-selected]>&]:text-info-foreground [[data-selected]>&]:hover:bg-info",
          "[[data-disabled]>&]:pointer-events-none [[data-disabled]>&]:text-muted-foreground/40",
        ),
        range_start: "rounded-l-lg bg-info-muted",
        range_middle: "bg-info-muted",
        range_end: "rounded-r-lg bg-info-muted",
        hidden: "invisible",
        outside: "",
        disabled: "",
        today: "",
        selected: "",
        footer: "pt-2 text-xs text-muted-foreground",
        ...classNames,
      }}
      {...props}
    />
  );
}

export { Calendar };
