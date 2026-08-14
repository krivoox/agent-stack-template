"use client";

import { usePathname } from "next/navigation";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { AppSidebar, type AppSidebarProps } from "./app-sidebar";
import { MobileTabBar } from "./mobile-tab-bar";
import { getPageTitle } from "./nav-config";
import { useNavPrefetch } from "./use-nav-prefetch";

type AppShellProps = AppSidebarProps & {
  children: React.ReactNode;
};

/** Room for the floating tab bar plus the home indicator. */
const MOBILE_TAB_BAR_CLEARANCE =
  "pb-[calc(4.75rem+env(safe-area-inset-bottom))] md:pb-3";

/**
 * Persistent shell around every authenticated route.
 *
 * Because it lives in the `(app)` layout, a soft-nav swaps only the page body:
 * sidebar state, scroll position and the mobile drawer survive navigation.
 *
 * Mobile lets the document scroll; from `md` up the viewport is capped and
 * scrolling happens inside `ContentPanel`.
 */
export function AppShell({ children, user, workspaceSlot }: AppShellProps) {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  useNavPrefetch();

  return (
    <SidebarProvider className="min-h-svh md:h-svh md:overflow-hidden">
      <AppSidebar user={user} workspaceSlot={workspaceSlot} />

      <SidebarInset className="flex min-h-svh flex-col bg-card md:h-svh md:max-h-svh md:overflow-hidden md:bg-background">
        {/* Desktop only: on mobile the tab bar is the nav and ContentPanel owns
            the H1, so a title bar here would just duplicate it. */}
        <header className="hidden h-12 shrink-0 items-center gap-2 px-3 sm:px-4 md:flex">
          <SidebarTrigger className="-ml-1 size-9" />
          <p className="min-w-0 truncate text-sm font-medium text-foreground">
            {title}
          </p>
        </header>

        <div
          className={`flex flex-1 flex-col p-0 pt-[env(safe-area-inset-top)] md:min-h-0 md:overflow-hidden md:p-3 ${MOBILE_TAB_BAR_CLEARANCE}`}
        >
          {children}
        </div>
      </SidebarInset>

      <MobileTabBar user={user} />
    </SidebarProvider>
  );
}
