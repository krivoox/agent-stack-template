import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import type { MembershipRole, WorkspaceType } from "@/features/workspaces/domain";

/** Which workspace the session is currently looking at. */
export const ACTIVE_WORKSPACE_COOKIE = "active-workspace-id";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export type ActiveWorkspaceContext = {
  id: string;
  name: string;
  type: WorkspaceType;
  role: MembershipRole;
};

/**
 * Resolve the workspace the request is operating on.
 *
 * The cookie is a *hint*, never an authorisation: it is only honoured when it
 * still resolves to a live membership, so a stale or forged value degrades to
 * the fallback instead of granting access. Falls back to the personal
 * workspace, then to the oldest membership.
 *
 * Returns `null` only for a user with no memberships at all (a brand-new user
 * mid-registration).
 */
export const getActiveWorkspaceForUser = cache(
  async (userId: string): Promise<ActiveWorkspaceContext | null> => {
    const cookieStore = await cookies();
    const cookieId = cookieStore.get(ACTIVE_WORKSPACE_COOKIE)?.value;

    if (cookieId) {
      const membership = await prisma.membership.findUnique({
        where: { workspaceId_userId: { workspaceId: cookieId, userId } },
        select: {
          role: true,
          workspace: { select: { id: true, name: true, type: true } },
        },
      });
      if (membership) return toContext(membership);
    }

    // `type: "asc"` puts `personal` before `group` in the enum order.
    const fallback = await prisma.membership.findFirst({
      where: { userId },
      orderBy: [{ workspace: { type: "asc" } }, { joinedAt: "asc" }],
      select: {
        role: true,
        workspace: { select: { id: true, name: true, type: true } },
      },
    });

    return fallback ? toContext(fallback) : null;
  },
);

function toContext(membership: {
  role: string;
  workspace: { id: string; name: string; type: string };
}): ActiveWorkspaceContext {
  return {
    id: membership.workspace.id,
    name: membership.workspace.name,
    type: membership.workspace.type as WorkspaceType,
    role: membership.role as MembershipRole,
  };
}

/** Caller must have verified membership first. */
export async function setActiveWorkspaceCookie(
  workspaceId: string,
): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_WORKSPACE_COOKIE, workspaceId, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    maxAge: ONE_YEAR_SECONDS,
  });
}
