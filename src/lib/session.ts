import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { withDbRetry } from "@/lib/prisma";

/**
 * Per-request memoization: layout + pages often call getSession in the same RSC
 * render; without cache() each call repeats Better Auth work.
 *
 * Session reads hit Postgres via Better Auth → Prisma. A single retry absorbs
 * intermittent "Connection terminated unexpectedly" from Supabase pooler idle
 * drops (see `src/lib/prisma.ts` pool settings).
 */
export const getSession = cache(async () => {
  return withDbRetry(
    async () =>
      auth.api.getSession({
        headers: await headers(),
      }),
    { label: "getSession" },
  );
});

export type Session = Awaited<ReturnType<typeof getSession>>;
