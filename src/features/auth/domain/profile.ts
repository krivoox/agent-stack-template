/**
 * Pure profile rules.
 *
 * No Prisma, no React, no Next — which is what makes the constraints testable
 * in isolation and reusable from both the schema and the service layer.
 */

export const DISPLAY_NAME_MIN_LENGTH = 2;
export const DISPLAY_NAME_MAX_LENGTH = 60;

/**
 * Validate an IANA timezone using the runtime's own database rather than a
 * hardcoded list, which would drift every time the tz database is updated.
 */
export function isValidTimezone(value: string): boolean {
  if (value.trim().length === 0) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

/** What the UI shows: the chosen display name, else the account name. */
export function resolveDisplayName(user: {
  displayName?: string | null;
  name?: string | null;
  email: string;
}): string {
  const explicit = user.displayName?.trim();
  if (explicit) return explicit;
  const accountName = user.name?.trim();
  if (accountName) return accountName;
  return user.email.split("@")[0] ?? user.email;
}

/** Up to two letters for avatar fallbacks. */
export function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  const letters = parts.map((part) => part.charAt(0)).join("").toUpperCase();
  return letters.length > 0 ? letters : "?";
}
