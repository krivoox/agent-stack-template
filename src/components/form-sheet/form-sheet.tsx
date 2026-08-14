"use client";

import type { ReactNode } from "react";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { XIcon } from "lucide-react";

type FormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  /** md ≈ 28rem; lg ≈ 32rem for dense, multi-column forms. */
  size?: "md" | "lg";
  trigger?: ReactNode;
  children: ReactNode;
  className?: string;
};

/**
 * Create/edit overlay: full-bleed from the right on mobile, fixed-width drawer
 * on desktop. Prefer it over a centred modal for multi-field forms.
 *
 * The sheet is capped to the viewport and only its body scrolls. Without that
 * cap the flex child grows with the form and the footer becomes unreachable on
 * a phone.
 */
export function FormSheet({
  open,
  onOpenChange,
  title,
  description,
  size = "md",
  trigger,
  children,
  className,
}: FormSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {trigger ? <SheetTrigger asChild>{trigger}</SheetTrigger> : null}
      <SheetContent
        side="right"
        showCloseButton={false}
        className={cn(
          // Full-bleed on mobile; capped drawer from sm+. Use data-[side=…]
          // so we win over SheetContent’s side-specific width/border defaults.
          "gap-0 overflow-hidden p-0",
          "h-dvh max-h-dvh w-full data-[side=right]:h-dvh data-[side=right]:max-h-dvh data-[side=right]:w-full",
          "data-[side=right]:border-l-0 sm:data-[side=right]:border-l",
          "pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]",
          size === "md" && "sm:max-w-md data-[side=right]:sm:max-w-md",
          size === "lg" && "sm:max-w-lg data-[side=right]:sm:max-w-lg",
          className,
        )}
      >
        <SheetHeader className="shrink-0 flex-row items-start gap-3 border-b border-border px-4 py-4 sm:px-5">
          <div className="min-w-0 flex-1 space-y-1">
            <SheetTitle className="text-base font-semibold tracking-tight text-balance">
              {title}
            </SheetTitle>
            {description ? (
              <SheetDescription className="text-pretty">
                {description}
              </SheetDescription>
            ) : null}
          </div>
          <SheetClose asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-10 shrink-0 rounded-full sm:size-8"
            >
              <XIcon className="size-4" strokeWidth={1.75} />
              <span className="sr-only">Close</span>
            </Button>
          </SheetClose>
        </SheetHeader>
        <div className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-y-contain px-4 py-4 pb-8 sm:px-5 sm:py-5 sm:pb-6">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}
