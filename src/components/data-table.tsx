"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TableCell, TableHead } from "@/components/ui/table";
import { cn } from "@/lib/utils";

/**
 * Selección de filas para las tablas de producto (DESIGN.md §8 "Lista / tabla").
 * Mantiene el estado en memoria y deriva lo visible de las filas actuales, así
 * una fila que desaparece tras una mutación no queda seleccionada de forma
 * fantasma.
 */
export type RowSelection = {
  selectedIds: readonly string[];
  count: number;
  isSelected: (id: string) => boolean;
  toggle: (id: string) => void;
  toggleAll: () => void;
  clear: () => void;
  headerState: boolean | "indeterminate";
  hasSelectableRows: boolean;
};

export function useRowSelection(
  selectableIds: readonly string[],
): RowSelection {
  const [selected, setSelected] = useState<ReadonlySet<string>>(
    () => new Set<string>(),
  );

  const selectedIds = useMemo(
    () => selectableIds.filter((id) => selected.has(id)),
    [selectableIds, selected],
  );

  const toggle = useCallback((id: string) => {
    setSelected((curr) => {
      const next = new Set(curr);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const allSelected =
    selectableIds.length > 0 && selectedIds.length === selectableIds.length;

  const toggleAll = useCallback(() => {
    setSelected((curr) => {
      const isAll =
        selectableIds.length > 0 &&
        selectableIds.every((id) => curr.has(id));
      return isAll ? new Set<string>() : new Set(selectableIds);
    });
  }, [selectableIds]);

  const clear = useCallback(() => setSelected(new Set<string>()), []);

  return {
    selectedIds,
    count: selectedIds.length,
    isSelected: (id) => selected.has(id),
    toggle,
    toggleAll,
    clear,
    headerState: allSelected
      ? true
      : selectedIds.length > 0
        ? "indeterminate"
        : false,
    hasSelectableRows: selectableIds.length > 0,
  };
}

const SELECT_CELL_CLASS = "w-10 pl-3";

export function SelectAllHead({
  selection,
  label = "Seleccionar todo",
  className,
}: {
  selection: RowSelection;
  label?: string;
  className?: string;
}) {
  return (
    <TableHead className={cn(SELECT_CELL_CLASS, className)}>
      <Checkbox
        checked={selection.headerState}
        onCheckedChange={selection.toggleAll}
        disabled={!selection.hasSelectableRows}
        aria-label={label}
      />
    </TableHead>
  );
}

export function SelectRowCell({
  selection,
  id,
  label,
  disabled = false,
  className,
}: {
  selection: RowSelection;
  id: string;
  label: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <TableCell className={cn("relative z-10", SELECT_CELL_CLASS, className)}>
      <Checkbox
        checked={selection.isSelected(id)}
        onCheckedChange={() => selection.toggle(id)}
        disabled={disabled}
        aria-label={label}
      />
    </TableCell>
  );
}

/**
 * Barra de acciones masivas. Se renderiza solo con selección activa para no
 * ocupar altura fija encima de la tabla.
 */
export function BulkActionsBar({
  selection,
  singular,
  plural,
  children,
}: {
  selection: RowSelection;
  singular: string;
  plural: string;
  children?: ReactNode;
}) {
  if (selection.count === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
      <span className="text-sm text-foreground tabular-nums">
        {selection.count} {selection.count === 1 ? singular : plural}
      </span>
      <div className="ml-auto flex flex-wrap items-center gap-2">
        {children}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-muted-foreground"
          onClick={selection.clear}
        >
          <X className="size-3.5" strokeWidth={1.75} aria-hidden />
          Limpiar
        </Button>
      </div>
    </div>
  );
}
