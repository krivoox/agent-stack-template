/**
 * Reference domain module.
 *
 * Everything here is pure: no Prisma, no React, no `Date.now()`. That is what
 * lets the rules be specified as plain input/output tests and reused from both
 * the service layer and the UI. Anything that needs I/O or the clock is passed
 * in as an argument.
 */
import { ConflictError, ValidationError } from "@/domain";

export const PROJECT_NAME_MIN_LENGTH = 2;
export const PROJECT_NAME_MAX_LENGTH = 80;

export type ProjectStatus = "active" | "archived";

export type ProjectSummary = {
  readonly id: string;
  readonly name: string;
  readonly status: ProjectStatus;
  readonly updatedAt: Date;
};

/**
 * Collapse internal whitespace and trim.
 *
 * Normalising before validating means `"  My   Project "` and `"My Project"`
 * are the same name everywhere: in the length check, in the duplicate check
 * and in storage.
 */
export function normalizeProjectName(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

export function assertValidProjectName(name: string): void {
  if (name.length < PROJECT_NAME_MIN_LENGTH) {
    throw new ValidationError(
      "project.name_too_short",
      `A project name needs at least ${PROJECT_NAME_MIN_LENGTH} characters.`,
    );
  }
  if (name.length > PROJECT_NAME_MAX_LENGTH) {
    throw new ValidationError(
      "project.name_too_long",
      `A project name can be at most ${PROJECT_NAME_MAX_LENGTH} characters.`,
    );
  }
}

/**
 * Names are unique per workspace, case-insensitively.
 *
 * Enforced here rather than with a database constraint because Postgres has no
 * case-insensitive unique index without an expression index, and because the
 * error message belongs to the domain. `excludeId` lets a rename keep its own
 * name.
 */
export function assertNameAvailable(
  existing: readonly { id: string; name: string }[],
  candidate: string,
  excludeId?: string,
): void {
  const target = candidate.toLocaleLowerCase();
  const clash = existing.some(
    (project) =>
      project.id !== excludeId && project.name.toLocaleLowerCase() === target,
  );
  if (clash) {
    throw new ConflictError(
      "project.name_taken",
      "A project with that name already exists in this workspace.",
    );
  }
}

/** Validate and normalise in one step; the only entry point services need. */
export function prepareProjectName(
  raw: string,
  existing: readonly { id: string; name: string }[],
  excludeId?: string,
): string {
  const name = normalizeProjectName(raw);
  assertValidProjectName(name);
  assertNameAvailable(existing, name, excludeId);
  return name;
}

export function assertCanArchive(status: ProjectStatus): void {
  if (status === "archived") {
    throw new ConflictError(
      "project.already_archived",
      "That project is already archived.",
    );
  }
}

export function assertCanRestore(status: ProjectStatus): void {
  if (status === "active") {
    throw new ConflictError(
      "project.already_active",
      "That project is already active.",
    );
  }
}

/**
 * Active projects first, then most recently updated.
 *
 * `toSorted` keeps the input array untouched, which matters because the caller
 * may be rendering it.
 */
export function sortProjectsForList<T extends ProjectSummary>(
  projects: readonly T[],
): T[] {
  return projects.toSorted((a, b) => {
    if (a.status !== b.status) return a.status === "active" ? -1 : 1;
    return b.updatedAt.getTime() - a.updatedAt.getTime();
  });
}
