/**
 * One shared contract for every Server Action.
 *
 * Actions never throw at the UI: they return a discriminated result so the
 * client can branch without try/catch and without leaking stack traces.
 * Domain errors are translated here — exactly once — instead of every feature
 * re-implementing its own mapper.
 */
import { DomainError, isDomainError } from "@/domain";

export type ActionResult<T = void> =
  | (T extends void ? { ok: true } : { ok: true; data: T })
  | { ok: false; error: string; code?: string };

const FALLBACK_MESSAGE_BY_KIND: Record<DomainError["kind"], string> = {
  validation: "Some of the data is invalid. Review the form and try again.",
  not_found: "We couldn't find what you were looking for.",
  forbidden: "You don't have permission to do that.",
  conflict: "That conflicts with something that already exists.",
  unauthenticated: "Sign in to continue.",
};

/**
 * Translate a thrown error into user-facing copy.
 *
 * `overrides` lets a feature map its own stable `code` to specific copy
 * without duplicating the whole taxonomy:
 *
 * ```ts
 * toActionError(err, { "project.name_taken": "That project name is taken." })
 * ```
 */
export function toActionError(
  error: unknown,
  overrides: Record<string, string> = {},
): { ok: false; error: string; code?: string } {
  if (isDomainError(error)) {
    return {
      ok: false,
      error:
        overrides[error.code] ??
        error.message ??
        FALLBACK_MESSAGE_BY_KIND[error.kind],
      code: error.code,
    };
  }

  // Unexpected errors are logged server-side and generalised for the client:
  // an internal message is never useful to a user and can leak internals.
  console.error("[action] unexpected error:", error);
  return {
    ok: false,
    error: "Something went wrong. Please try again.",
  };
}

/** Narrow a Zod `safeParse` failure into the same result shape. */
export function invalidInput(message?: string): {
  ok: false;
  error: string;
  code?: string;
} {
  return {
    ok: false,
    error: message ?? FALLBACK_MESSAGE_BY_KIND.validation,
    code: "input.invalid",
  };
}
