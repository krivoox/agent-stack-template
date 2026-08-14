import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, MoreHorizontal, Settings } from "lucide-react";

/**
 * Single source of truth for navigation.
 *
 * Sidebar, mobile tab bar and idle prefetch all read from here, so adding a
 * destination in one place makes it navigable, prefetched and titled. A link
 * added directly in a component is a link that never gets prefetched.
 */

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  /** Rendered as a sub-menu; hidden when the sidebar is collapsed to icons. */
  children?: NavItem[];
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const mainNavItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
];

/** Optional labelled sections below the primary links. */
export const navGroups: NavGroup[] = [];

export const footerNavItems: NavItem[] = [
  { title: "Settings", href: "/settings", icon: Settings },
];

/**
 * Mobile bottom bar. Five slots at most, including the overflow entry —
 * beyond that, targets get too small to hit reliably.
 */
export type MobileTabItem =
  | { kind: "link"; id: string; title: string; href: string; icon: LucideIcon }
  | { kind: "more"; id: "more"; title: string; icon: LucideIcon };

export const mobileTabItems: MobileTabItem[] = [
  {
    kind: "link",
    id: "dashboard",
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  { kind: "more", id: "more", title: "More", icon: MoreHorizontal },
];

/** Destinations only reachable through the mobile "More" sheet. */
export const mobileMoreNavItems: NavItem[] = [
  { title: "Settings", href: "/settings", icon: Settings },
];

/** Every nav destination, de-duplicated and query-stripped, for idle prefetch. */
export function getPrefetchNavHrefs(): readonly string[] {
  const hrefs = new Set<string>();

  const collect = (items: readonly NavItem[]) => {
    for (const item of items) {
      hrefs.add(item.href.split("?")[0] ?? item.href);
      if (item.children?.length) collect(item.children);
    }
  };

  collect(mainNavItems);
  for (const group of navGroups) collect(group.items);
  collect(footerNavItems);
  collect(mobileMoreNavItems);

  for (const tab of mobileTabItems) {
    if (tab.kind === "link") hrefs.add(tab.href.split("?")[0] ?? tab.href);
  }

  return [...hrefs].sort();
}

/** A nav entry is active on its own route and on anything nested under it. */
export function isNavItemActive(pathname: string, href: string): boolean {
  const [path] = href.split("?");
  if (pathname === path) return true;
  if (path !== "/" && pathname.startsWith(`${path}/`)) return true;
  return false;
}

export function getPageTitle(pathname: string, fallback = "App"): string {
  const all = [
    ...mainNavItems,
    ...mainNavItems.flatMap((item) => item.children ?? []),
    ...navGroups.flatMap((group) => group.items),
    ...footerNavItems,
  ];
  // Longest href first so `/projects/archive` beats `/projects`.
  const match = all
    .toSorted((a, b) => b.href.length - a.href.length)
    .find((item) => isNavItemActive(pathname, item.href));
  return match?.title ?? fallback;
}
