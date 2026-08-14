import type { ReactNode } from "react";
import Link from "next/link";

import { APP_DESCRIPTION, APP_NAME } from "@/lib/app-config";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-svh flex-col bg-background">
      <div className="flex flex-1 items-center justify-center px-4 py-10 pt-[max(2.5rem,env(safe-area-inset-top))] pb-[max(2.5rem,env(safe-area-inset-bottom))] sm:py-12">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2 text-center">
            <Link
              href="/"
              className="text-sm font-semibold tracking-tight text-foreground"
            >
              {APP_NAME}
            </Link>
            <p className="text-xs text-muted-foreground">{APP_DESCRIPTION}</p>
          </div>
          {children}
        </div>
      </div>
    </main>
  );
}
