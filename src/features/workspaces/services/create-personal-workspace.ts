import "server-only";
import { prisma } from "@/lib/prisma";

export type CreatePersonalWorkspaceInput = {
  userId: string;
  userName: string;
};

/**
 * Give a freshly-registered user a workspace to land in.
 *
 * Called from the Better Auth `user.create.after` hook, so it must be
 * idempotent: social sign-in can re-enter this path, and a duplicate personal
 * workspace is worse than a no-op.
 *
 * Seed per-workspace defaults (categories, settings, sample data…) inside the
 * transaction so a partial onboarding can never be committed.
 */
export async function createPersonalWorkspaceForUser({
  userId,
  userName,
}: CreatePersonalWorkspaceInput): Promise<{ workspaceId: string }> {
  const existing = await prisma.membership.findFirst({
    where: { userId, workspace: { type: "personal" } },
    select: { workspaceId: true },
  });
  if (existing) return { workspaceId: existing.workspaceId };

  const workspace = await prisma.$transaction(async (tx) => {
    const created = await tx.workspace.create({
      data: { name: derivePersonalWorkspaceName(userName), type: "personal" },
      select: { id: true },
    });

    await tx.membership.create({
      data: { workspaceId: created.id, userId, role: "owner" },
    });

    return created;
  });

  return { workspaceId: workspace.id };
}

function derivePersonalWorkspaceName(userName: string): string {
  const trimmed = userName.trim();
  if (trimmed.length === 0) return "Personal";
  const firstName = trimmed.split(/\s+/)[0] ?? trimmed;
  return `${firstName} — Personal`;
}
