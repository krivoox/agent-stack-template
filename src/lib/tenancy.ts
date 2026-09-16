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
 * Lives in `lib/` so Server Actions and any feature can call it without
 * reaching into `features/workspaces/services`.
 *
 * Memoised per RSC request with primitive arguments. No cross-request cache:
 * a revoked membership must take effect immediately.
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
