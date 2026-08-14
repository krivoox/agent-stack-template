# ADR-002 — Better Auth for authentication

**Status:** Accepted

## Context

The application needs email/password sign-in, optional social providers,
sessions, password reset and account linking. Options considered: a hosted
identity provider, the authentication product bundled with the database vendor,
NextAuth/Auth.js, or Better Auth.

Two constraints drove the choice. First, user rows must live in the same
PostgreSQL database as the business data, so that `Membership.userId` is a real
foreign key rather than a string that happens to match a remote identifier.
Second, the auth tables must be visible to Prisma so that a cascade delete of a
user actually removes their memberships.

A vendor-hosted auth product puts identity in a separate system. Every join
across that boundary becomes application code, and referential integrity
becomes a convention.

## Decision

Better Auth with the Prisma adapter, configured in `src/lib/auth.ts`.

- `User`, `Session`, `Account` and `Verification` live in the application
  schema, with field names dictated by the adapter.
- The personal workspace is created in the `user.create.after` hook, so a user
  can never exist without a tenant.
- The base URL resolves per request, so ephemeral preview deployments pass the
  CSRF origin check.

## Consequences

**Gained.** Identity and business data share one database and one transaction
boundary. Profile columns are added to `User` directly. Sessions are queryable.
No vendor lock-in on the identity layer.

**Given up.** Operational responsibility for sessions and password reset is
ours. Email delivery must be wired before password reset can ship — the
template logs the URL in development instead.

**Constraint.** The Better Auth model field names are not ours to rename.
Regenerate with `npm run auth:generate` after upgrading rather than hand-editing
those models.
