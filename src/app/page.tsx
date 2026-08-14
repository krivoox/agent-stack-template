import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/session";
import {
  APP_DESCRIPTION,
  APP_NAME,
  DEFAULT_AUTHENTICATED_ROUTE,
} from "@/lib/app-config";

/**
 * Public landing page. Replace with real marketing content, or delete it and
 * redirect straight to `/login`.
 */
export default async function HomePage() {
  const session = await getSession();
  if (session?.user?.id) redirect(DEFAULT_AUTHENTICATED_ROUTE);

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {APP_NAME}
        </h1>
        <p className="max-w-md text-sm text-muted-foreground text-pretty">
          {APP_DESCRIPTION}
        </p>
      </div>

      <div className="flex w-full max-w-xs flex-col gap-2 sm:w-auto sm:flex-row">
        <Button asChild className="h-10">
          <Link href="/register">Get started</Link>
        </Button>
        <Button asChild variant="outline" className="h-10">
          <Link href="/login">Sign in</Link>
        </Button>
      </div>
    </main>
  );
}
