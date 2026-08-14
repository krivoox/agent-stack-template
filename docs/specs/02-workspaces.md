# SPEC-02 — Workspaces, membership and roles

**Status:** Shipped

## Problem

Data has to be shareable — a team, a household, a client account — without
every feature inventing its own sharing model, and without the single-user case
paying for the collaborative one.

## Scope

**In.** The tenant boundary, membership roles, the authorisation matrix, the
active-workspace switch, and the invariants that keep a workspace ownable.

**Out.** Billing, per-resource ACLs, cross-workspace sharing, audit logging.
Each of those is a feature in its own right and none of them changes the
primitive.

## Rules

1. **Every business row belongs to exactly one workspace.** There is no
   unscoped business data ([ADR-003](../adr/003-workspace-tenancy.md)).
2. A `personal` workspace is created at sign-up and cannot be deleted. This is
   what lets every query assume a workspace exists instead of branching on null.
3. Roles are `owner`, `admin`, `member`, `viewer`, in ascending privilege.
4. A workspace has **exactly one owner**, always. Removing the last owner is
   rejected. A transfer demotes the previous owner to `admin` in the same
   operation, so there is never an intermediate state with zero or two owners.
5. Ownership transfers only to someone who is already a member. Granting it to
   a stranger is an invitation, which is a different operation with a different
   check.
6. A `viewer` cannot write. The rule is enforced in the domain, not only hidden
   in the interface, because the Server Action is a public endpoint.
7. Deleting a group workspace cascades to its memberships, invitations and
   business rows. A confirmation naming the workspace is required in the UI —
   the destructive path should be hard to take by reflex.
8. An invitation is addressed to an **email**, not a user id, because the
   invitee may not have an account yet. It is lower-cased, has a role that is
   never `owner`, and expires.
9. Accepting an invitation creates the membership and closes the invitation in
   **one transaction**. A partial apply leaves an invitation that can be
   redeemed twice.
10. The active workspace lives in a cookie, but the cookie is a **hint**: it is
    honoured only when it still resolves to a live membership. A stale or forged
    value falls back to the personal workspace instead of granting access.
11. Losing access to the active workspace falls back to the personal workspace,
    then to any remaining membership.

## Authorisation

| Action | owner | admin | member | viewer |
|--------|:-----:|:-----:|:------:|:------:|
| Read workspace data | ✅ | ✅ | ✅ | ✅ |
| Create / update / delete business rows | ✅ | ✅ | ✅ | ❌ |
| Rename workspace | ✅ | ✅ | ❌ | ❌ |
| Invite / remove members, change roles | ✅ | ✅ | ❌ | ❌ |
| Transfer ownership | ✅ | ❌ | ❌ | ❌ |
| Delete workspace (group only) | ✅ | ❌ | ❌ | ❌ |

Enforced once, in `requireMembership`, called by `defineWorkspaceAction` before
any handler body runs.

## Acceptance criteria

- **Given** a workspace whose only owner is Ada
  **When** Ada is removed
  **Then** it fails with `workspace.last_owner` and membership is unchanged.

- **Given** owner Ada and member Grace
  **When** Ada transfers ownership to Grace
  **Then** Grace is `owner`, Ada is `admin`, and the workspace still has exactly
  one owner.

- **Given** a `viewer`
  **When** they call a write action directly, bypassing the UI
  **Then** it fails with `workspace.viewer_readonly`.

- **Given** a user with a valid session and an active-workspace cookie for a
  workspace they were just removed from
  **When** they load any `(app)` route
  **Then** they see their personal workspace, not an error and not the other
  workspace's data.

- **Given** an id that belongs to another workspace
  **When** it is passed to a scoped action
  **Then** the result is "not found", because the row is outside the filtered
  set — not "forbidden", which would confirm it exists.

- **Given** a personal workspace
  **When** deletion is attempted
  **Then** it fails with `workspace.personal_undeletable`.

## Edge cases

- **Invited address registers before accepting.** The invitation still matches
  on email at sign-up.
- **Two invitations to the same email.** Prevented by the unique constraint on
  `(workspaceId, email)` while pending.
- **Expired invitation.** Treated as revoked; a new one must be sent.
- **Last member leaves a group workspace.** They are the owner, so rule 4
  blocks it: transfer or delete.
