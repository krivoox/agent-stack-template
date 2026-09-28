import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { withDbRetry } from "@/lib/prisma";

export const getSession = cache(async () => {
  return withDbRetry(
    async () =>
      auth.api.getSession({
        headers: await headers(),
      }),
    { label: "getSession" },
  );
});

const FRESH_SESSION_MS = 30 * 60 * 1000;

/**
 * Re-reads the session from the database (cookie cache skipped) and requires
 * it to have been created in the last 30 minutes.
 */
export async function requireFreshSession() {
  const session = await withDbRetry(
    async () =>
      auth.api.getSession({
        headers: await headers(),
        query: { disableCookieCache: true },
      }),
    { label: "requireFreshSession" },
  );
  const userId = session?.user?.id;
  const createdAt = session?.session?.createdAt;
  if (!userId || !createdAt) {
    throw new Error("auth.unauthenticated");
  }
  if (Date.now() - new Date(createdAt).getTime() > FRESH_SESSION_MS) {
    throw new Error("auth.stale_session");
  }
  return { userId, session };
}

export type Session = Awaited<ReturnType<typeof getSession>>;
