import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  displayName: string | null;
  timezone: string;
};

/**
 * The signed-in user's profile row, or `null`.
 *
 * Separate from `getSession()` because the session only carries identity;
 * profile columns live in the database and can change without a new session.
 * Memoised per request so layout and page share one query.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await getSession();
  const userId = session?.user?.id;
  if (!userId) return null;

  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      displayName: true,
      timezone: true,
    },
  });
});
