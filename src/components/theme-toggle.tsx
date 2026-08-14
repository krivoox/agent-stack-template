"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "@teispace/next-themes";
import { useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

/** Client-only gate so the icon does not flash between SSR and hydration. */
function useMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { isMobile, setOpenMobile } = useSidebar();
  const mounted = useMounted();

  const current =
    THEME_OPTIONS.find((o) => o.value === theme) ?? THEME_OPTIONS[2];

  const CurrentIcon = !mounted
    ? Monitor
    : theme === "system"
      ? resolvedTheme === "dark"
        ? Moon
        : Sun
      : current.icon;

  return (
    <SidebarMenu className={className}>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              tooltip="Theme"
              suppressHydrationWarning
              className={cn(!mounted && "pointer-events-none opacity-70")}
            >
              <CurrentIcon strokeWidth={1.75} />
              <span>Theme</span>
              <span className="ml-auto text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
                {mounted ? current.label : "…"}
              </span>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            side="top"
            className="min-w-44"
            sideOffset={6}
          >
            {THEME_OPTIONS.map((option) => {
              const Icon = option.icon;
              const active = mounted && theme === option.value;

              return (
                <DropdownMenuItem
                  key={option.value}
                  className="gap-2"
                  onSelect={() => {
                    setTheme(option.value);
                    if (isMobile) setOpenMobile(false);
                  }}
                >
                  <Icon className="size-4" strokeWidth={1.75} />
                  {option.label}
                  {active ? (
                    <span className="ml-auto text-xs text-muted-foreground">
                      Active
                    </span>
                  ) : null}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

/** Compact icon control for headers / non-sidebar surfaces. */
export function ThemeToggleButton({ className }: { className?: string }) {
  const { setTheme, resolvedTheme } = useTheme();
  const mounted = useMounted();

  const isDark = mounted && resolvedTheme === "dark";
  const Icon = !mounted ? Monitor : isDark ? Sun : Moon;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn("size-8", className)}
      aria-label={
        !mounted
          ? "Theme"
          : isDark
            ? "Switch to light theme"
            : "Switch to dark theme"
      }
      disabled={!mounted}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      <Icon className="size-4" strokeWidth={1.75} />
    </Button>
  );
}
