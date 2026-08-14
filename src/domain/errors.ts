/**
 * Shared domain error taxonomy.
 *
 * Domain code throws; the action layer is the only place allowed to translate
 * these into user-facing copy (see `src/lib/action-result.ts`). Keeping the
 * taxonomy small and shared means every feature maps to the same HTTP-ish
 * semantics without inventing a private hierarchy.
 */

export type DomainErrorKind =
  | "validation"
  | "not_found"
  | "forbidden"
  | "conflict"
  | "unauthenticated";

export class DomainError extends Error {
  readonly kind: DomainErrorKind;
  /** Stable machine-readable code, e.g. `project.name_taken`. */
  readonly code: string;

  constructor(kind: DomainErrorKind, code: string, message: string) {
    super(message);
    this.name = new.target.name;
    this.kind = kind;
    this.code = code;
  }
}

/** Input violates an invariant the domain guarantees. */
export class ValidationError extends DomainError {
  constructor(code: string, message: string) {
    super("validation", code, message);
  }
}

/** The referenced entity does not exist, or the caller may not know it does. */
export class NotFoundError extends DomainError {
  constructor(code: string, message: string) {
    super("not_found", code, message);
  }
}

/** Authenticated but not allowed to perform this operation. */
export class ForbiddenError extends DomainError {
  constructor(code: string, message: string) {
    super("forbidden", code, message);
  }
}

/** The operation conflicts with current state (duplicate, stale version, …). */
export class ConflictError extends DomainError {
  constructor(code: string, message: string) {
    super("conflict", code, message);
  }
}

/** No valid session. Thrown by the action layer, not by pure domain code. */
export class UnauthenticatedError extends DomainError {
  constructor(message = "Sign in to continue") {
    super("unauthenticated", "auth.unauthenticated", message);
  }
}

export function isDomainError(error: unknown): error is DomainError {
  return error instanceof DomainError;
}
