"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

/**
 * Route-level error boundary. The message is intentionally generic: `error`
 * from a Server Component is redacted in production anyway, and raw internals
 * are never useful to a user.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold tracking-tight text-balance">
        Something went wrong
      </h1>
      <p className="max-w-sm text-sm text-muted-foreground text-pretty">
        The page failed to load. Try again — if it keeps happening, the error
        reference is {error.digest ?? "unavailable"}.
      </p>
      <Button onClick={reset}>Try again</Button>
    </main>
  );
}
