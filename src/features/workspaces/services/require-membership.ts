import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { ForbiddenError } from "@/domain";
import type { MembershipRole } from "@/features/workspaces/domain";

export type MembershipContext = {
  userId: string;
  workspaceId: string;
  role: MembershipRole;
};

/**
 * Tenancy choke point: load the caller's membership or refuse.
 *
 * Every workspace-scoped service and Server Action goes through this. Layout
 * and middleware checks are not enough — Server Actions are public endpoints
 * and can be invoked directly.
 *
 * Memoised per RSC request with primitive arguments, so a page that fans out
 * into several services only pays for one membership read. There is no
 * cross-request cache: a revoked membership must take effect immediately.
 */
export const requireMembership = cache(
  async (userId: string, workspaceId: string): Promise<MembershipContext> => {
    const membership = await prisma.membership.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
      select: { role: true },
    });

    if (!membership) {
      throw new ForbiddenError(
        "workspace.not_a_member",
        "You are not a member of this workspace.",
      );
    }

    return {
      userId,
      workspaceId,
      role: membership.role as MembershipRole,
    };
  },
);
