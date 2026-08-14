"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { cn } from "@/lib/utils";

import { MobileMoreSheet } from "./mobile-more-sheet";
import type { SidebarUser } from "./app-sidebar";
import { isNavItemActive, mobileMoreNavItems, mobileTabItems } from "./nav-config";
import { navIntentPrefetchHandlers } from "./use-nav-prefetch";

type MobileTabBarProps = {
  user: SidebarUser;
};

/**
 * Floating bottom navigation, phones only — desktop keeps the sidebar.
 *
 * The grid column count is derived from the config rather than hardcoded, so
 * adding a tab does not silently squash the others.
 */
export function MobileTabBar({ user }: MobileTabBarProps) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const moreActive =
    moreOpen ||
    mobileMoreNavItems.some((item) => isNavItemActive(pathname, item.href));

  return (
    <>
      <nav
        aria-label="Primary"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-40 md:hidden"
      >
        {/* Opaque backdrop so overscroll never reveals the canvas behind the pill. */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-[calc(4.75rem+env(safe-area-inset-bottom))] bg-card"
        />
        <div className="pointer-events-auto relative mx-auto mb-[max(0.5rem,env(safe-area-inset-bottom))] w-[min(100%-1.5rem,28rem)]">
          <div
            className={cn(
              "flex items-end gap-0.5 rounded-full border border-border bg-card/95 px-1.5 py-1.5 shadow-md backdrop-blur-md",
              "dark:border-transparent dark:bg-secondary/95 dark:shadow-[0_8px_28px_oklch(0_0_0/0.4)]",
            )}
          >
            {mobileTabItems.map((item) =>
              item.kind === "more" ? (
                <TabSlot
                  key={item.id}
                  active={moreActive}
                  label={item.title}
                  onClick={() => setMoreOpen(true)}
                  icon={<item.icon className="size-5" strokeWidth={1.75} />}
                />
              ) : (
                <TabSlot
                  key={item.id}
                  active={isNavItemActive(pathname, item.href)}
                  label={item.title}
                  href={item.href}
                  icon={<item.icon className="size-5" strokeWidth={1.75} />}
                />
              ),
            )}
          </div>
        </div>
      </nav>

      <MobileMoreSheet open={moreOpen} onOpenChange={setMoreOpen} user={user} />
    </>
  );
}

type TabSlotProps = {
  active: boolean;
  label: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
};

function TabSlot({ active, label, icon, href, onClick }: TabSlotProps) {
  const router = useRouter();
  const className = cn(
    "relative flex h-11 flex-1 min-w-0 items-center justify-center gap-1 overflow-hidden rounded-full px-1",
    "text-[10px] font-medium leading-none transition-[background-color,color] duration-200 ease-out",
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
    "motion-reduce:transition-none",
    active
      ? "bg-secondary text-foreground dark:bg-muted"
      : "text-muted-foreground hover:text-foreground",
  );

  const body = (
    <>
      <span className="relative flex size-5 shrink-0 items-center justify-center">
        {icon}
      </span>
      {/* The label only appears on the active tab; the rest stay icon-only but
          keep an accessible name. */}
      {active ? (
        <span className="min-w-0 truncate text-foreground">{label}</span>
      ) : (
        <span className="sr-only">{label}</span>
      )}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={className}
        {...navIntentPrefetchHandlers(router, href)}
      >
        {body}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {body}
    </button>
  );
}
