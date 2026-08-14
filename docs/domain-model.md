# Domain model

The entities the template ships with, and the rules that constrain them. Add
your own below `Project`; do not weaken what is above it.

## Identity

Owned by Better Auth ([ADR-002](./adr/002-better-auth.md)). The field names are
dictated by the adapter — regenerate with `npm run auth:generate` rather than
renaming them by hand.

| Model | Purpose |
|-------|---------|
| `User` | A person. Product columns (`timezone`, `image`, …) are added here. |
| `Session` | An active sign-in. |
| `Account` | A credential: password hash, or a social provider link. |
| `Verification` | Short-lived tokens: email verification, password reset. |

## Tenancy

The core of the model ([ADR-003](./adr/003-workspace-tenancy.md)).

### Workspace

The tenant. Every business row belongs to exactly one.

| Field | Rule |
|-------|------|
| `type` | `personal` \| `group` |
| `name` | 1–60 characters, trimmed |

- A `personal` workspace is created on sign-up and **cannot be deleted**. This
  is what guarantees a user always has somewhere to write, which is what lets
  every query assume a workspace exists.
- A `group` workspace can be deleted by its owner. The cascade removes its
  memberships, its invitations and all its business rows.

### Membership

Joins `User` to `Workspace` with a role. Unique on `(workspaceId, userId)`.

| Role | May read | May write | May manage members | May delete workspace |
|------|:--------:|:---------:|:------------------:|:--------------------:|
| `owner` | ✅ | ✅ | ✅ | ✅ (group only) |
| `admin` | ✅ | ✅ | ✅ | ❌ |
| `member` | ✅ | ✅ | ❌ | ❌ |
| `viewer` | ✅ | ❌ | ❌ | ❌ |

Invariants, all enforced in `src/features/workspaces/domain/membership.ts` and
covered by tests:

- **A workspace always has exactly one owner.** Removing the last owner is
  rejected; ownership transfers demote the previous owner to `admin` in the same
  operation, so there is no intermediate state with zero or two owners.
- **Ownership transfers only to an existing member.** Promoting a stranger would
  be an invitation, which is a different operation with a different check.
- **A viewer's writes are refused in the domain**, not only hidden in the UI.

### Invitation

A pending membership, addressed to an email rather than a user, because the
invitee may not have an account yet.

| Field | Rule |
|-------|------|
| `email` | Lower-cased on write |
| `role` | The role granted on acceptance. Never `owner`. |
| `status` | `pending` \| `accepted` \| `revoked` |
| `expiresAt` | Past ⇒ treated as revoked |

Unique on `(workspaceId, email)` while `pending`. Accepting creates the
`Membership` and closes the invitation in one transaction — a partial apply
would leave an invitation that can be redeemed twice.

## Reference feature

### Project

**This is scaffolding.** It exists so there is one complete vertical slice to
read: spec → domain test → domain → service → action → UI. Delete it with its
spec, its tests and its route once your real features exist.

| Field | Rule |
|-------|------|
| `workspaceId` | Required. Indexed. Cascade. |
| `name` | 2–80 characters, whitespace-collapsed, unique per workspace (case-insensitive) |
| `description` | Optional, ≤ 500 characters |
| `status` | `active` \| `archived` |

- An archived project is read-only: it can be reopened or deleted, not edited.
- Sorting is `active` before `archived`, then most recently updated first, so
  the list does not reshuffle when unrelated rows change.

## Conventions for new models

Every business model:

- carries `workspaceId` with `onDelete: Cascade`;
- has an index whose **first** column is `workspaceId`, because every query
  filters on it;
- has `createdAt @default(now())` and `updatedAt @updatedAt`;
- uses `cuid()` string ids;
- stores money as integer minor units
  ([ADR-005](./adr/005-money-as-integer-minor-units.md));
- stores instants as `DateTime` in UTC, and carries an explicit IANA timezone
  wherever a calendar day matters — "today" is a question about a place.
