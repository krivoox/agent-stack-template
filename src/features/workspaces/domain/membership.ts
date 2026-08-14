/**
 * Pure membership rules — the tenancy primitive of the template.
 *
 * A Workspace is the unit of multi-tenancy (ADR-003): every business row
 * belongs to exactly one, and every mutation re-checks membership. These
 * helpers are pure so the authorisation matrix is testable without a database.
 */
import { ConflictError, ForbiddenError, NotFoundError } from "@/domain";

export type MembershipRole = "owner" | "admin" | "member" | "viewer";

export type WorkspaceType = "personal" | "group";

export type MembershipEntry = {
  readonly userId: string;
  readonly role: MembershipRole;
};

export type WorkspacePreferenceEntry = {
  readonly id: string;
  readonly type: WorkspaceType;
};

/** Ascending privilege. Index comparison keeps role checks declarative. */
const ROLE_RANK: Record<MembershipRole, number> = {
  viewer: 0,
  member: 1,
  admin: 2,
  owner: 3,
};

export function hasAtLeastRole(
  role: MembershipRole,
  minimum: MembershipRole,
): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[minimum];
}

/**
 * Generic write gate: viewers read, everyone else writes.
 *
 * Features with stricter rules should call `assertRole(role, "admin")` rather
 * than inventing a parallel predicate.
 */
export function assertCanWrite(role: MembershipRole): void {
  if (role === "viewer") {
    throw new ForbiddenError(
      "workspace.viewer_readonly",
      "Viewers have read-only access to this workspace.",
    );
  }
}

export function assertRole(
  role: MembershipRole,
  minimum: MembershipRole,
): void {
  if (!hasAtLeastRole(role, minimum)) {
    throw new ForbiddenError(
      "workspace.insufficient_role",
      `This action requires the ${minimum} role.`,
    );
  }
}

/** Only owners and admins may add, remove or re-role members. */
export function assertCanManageMembers(role: MembershipRole): void {
  assertRole(role, "admin");
}

/** Personal workspaces are the user's own space and cannot be deleted. */
export function assertCanDeleteWorkspace(
  role: MembershipRole,
  type: WorkspaceType,
): void {
  if (type === "personal") {
    throw new ConflictError(
      "workspace.personal_undeletable",
      "A personal workspace cannot be deleted.",
    );
  }
  assertRole(role, "owner");
}

/**
 * A workspace must always keep at least one owner, otherwise it becomes
 * unadministrable. Guards both "remove member" and "leave workspace".
 */
export function assertNotRemovingLastOwner(
  members: readonly MembershipEntry[],
  userIdToRemove: string,
): void {
  const target = members.find((m) => m.userId === userIdToRemove);
  if (!target) {
    throw new NotFoundError(
      "workspace.not_a_member",
      "That user is not a member of this workspace.",
    );
  }
  if (target.role !== "owner") return;

  const remainingOwners = members.filter(
    (m) => m.role === "owner" && m.userId !== userIdToRemove,
  );
  if (remainingOwners.length === 0) {
    throw new ConflictError(
      "workspace.last_owner",
      "Transfer ownership before removing the last owner.",
    );
  }
}

/**
 * Ownership transfer demotes the previous owner to admin so they keep working
 * access. Returns a new list; the input is never mutated.
 */
export function applyTransferOwnership(
  members: readonly MembershipEntry[],
  fromUserId: string,
  toUserId: string,
): MembershipEntry[] {
  if (fromUserId === toUserId) {
    throw new ConflictError(
      "workspace.transfer_to_self",
      "You already own this workspace.",
    );
  }

  const from = members.find((m) => m.userId === fromUserId);
  if (!from || from.role !== "owner") {
    throw new ForbiddenError(
      "workspace.not_owner",
      "Only the current owner can transfer ownership.",
    );
  }

  if (!members.some((m) => m.userId === toUserId)) {
    throw new NotFoundError(
      "workspace.not_a_member",
      "The new owner must already be a member of this workspace.",
    );
  }

  return members.map((m) => {
    if (m.userId === fromUserId) return { userId: m.userId, role: "admin" };
    if (m.userId === toUserId) return { userId: m.userId, role: "owner" };
    return { userId: m.userId, role: m.role };
  });
}

/**
 * After leaving or deleting the active workspace, prefer the personal one so
 * the user never lands on an empty shell.
 */
export function pickPreferredActiveWorkspace(
  remaining: readonly WorkspacePreferenceEntry[],
): string | null {
  if (remaining.length === 0) return null;
  const personal = remaining.find((w) => w.type === "personal");
  return personal?.id ?? remaining[0]!.id;
}
