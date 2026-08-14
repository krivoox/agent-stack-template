# ADR-003 — Workspace as the tenancy primitive

**Status:** Accepted

## Context

Data must be shareable between users — a team, a household, a client account —
without every feature inventing its own sharing model. Scoping rows to a
`userId` makes the single-user case trivial and every collaborative case a
migration.

The alternatives were: scope by user and add sharing tables later; scope by an
`Organization` that only exists once a user creates one; or scope everything by
a workspace that always exists.

The second option is the tempting one, and it is a trap: every query then needs
a null branch, and half of them will forget it.

## Decision

**Every business row belongs to exactly one `Workspace`.** There is no
unscoped business data.

- A `personal` workspace is created on sign-up, so the null case never exists.
- `Membership` joins users to workspaces with a role: `owner`, `admin`,
  `member`, `viewer`.
- Every business model carries `workspaceId`, a cascade from `Workspace`, and
  an index starting with `workspaceId`.
- Every query filters by `workspaceId`.
- `requireMembership(userId, workspaceId)` is the single authorisation choke
  point, called by `defineWorkspaceAction` before any handler runs.

The active workspace is carried in a cookie, but the cookie is a *hint*: it is
honoured only when it still resolves to a live membership, so a stale or forged
value degrades to a fallback instead of granting access.

## Consequences

**Gained.** Sharing works from day one; a personal workspace is just a
workspace with one member. Authorisation is one function rather than a rule per
feature. Deleting a workspace removes its data through the cascade. A
cross-tenant id returns "not found" because the row is outside the filtered
set, not because a check refused it — which is both safer and less leaky.

**Given up.** Every table carries an extra column and an extra index. Every
query carries an extra filter. Genuinely global data needs a deliberate
exception with a comment.

**Enforcement.** No compiler check exists. This is the first thing
`code-reviewer` looks for.
