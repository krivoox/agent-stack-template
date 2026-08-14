"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

import type { SidebarUser } from "./app-sidebar";
import { isNavItemActive, mobileMoreNavItems } from "./nav-config";

type MobileMoreSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: SidebarUser;
};

/** Overflow destinations that do not fit in the bottom bar. */
export function MobileMoreSheet({
  open,
  onOpenChange,
  user,
}: MobileMoreSheetProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>{user.name}</SheetTitle>
        </SheetHeader>

        <nav className="flex flex-col gap-1 px-4 pb-2">
          {mobileMoreNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => onOpenChange(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm",
                isNavItemActive(pathname, item.href)
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
              )}
            >
              <item.icon className="size-4" />
              {item.title}
            </Link>
          ))}
        </nav>

        <Separator />

        <div className="flex items-center justify-between px-4 py-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={() =>
              authClient.signOut({
                fetchOptions: { onSuccess: () => router.push("/login") },
              })
            }
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <LogOut className="size-4" />
            Sign out
          </button>
          <ThemeToggle />
        </div>
      </SheetContent>
    </Sheet>
  );
}
