# SPEC-03 — Projects (reference feature)

**Status:** Shipped
**Lifetime:** delete this spec and its code once real features exist.

## Problem

None — this feature has no user. It exists so the repository contains one
complete vertical slice an agent can read end to end before writing its own:

```
this spec → project.test.ts → project.ts → services → actions → components
```

It is deliberately small and deliberately boring. The interesting part is the
shape, not the behaviour.

## Scope

**In.** Create, rename, archive, restore and delete a named item inside a
workspace, with the smallest set of rules that still exercises validation,
normalisation, a uniqueness conflict, a state transition and ordering.

**Out.** Everything else. Resist growing it — a reference that accumulates
features stops being readable, which is its only purpose.

## Rules

1. A project belongs to exactly one workspace.
2. The name is trimmed and internal whitespace is collapsed **before**
   validation, so `"  My   Project "` and `"My Project"` are the same name in
   the length check, in the duplicate check and in storage.
3. The normalised name is 2–80 characters.
4. Names are unique per workspace, compared case-insensitively. A rename may
   keep its own name.
5. The description is optional and at most 500 characters.
6. Status is `active` or `archived`. New projects are `active`.
7. Archiving an archived project fails with `project.already_archived`;
   restoring an active one fails with `project.already_active`. Idempotence is
   not free here — a double-click should be a no-op in the interface, not a
   silent state change in the domain.
8. An archived project is read-only: restore or delete, not edit.
9. The list sorts `active` before `archived`, then most recently updated first,
   so unrelated writes do not reshuffle it.

## Authorisation

| Action | owner | admin | member | viewer |
|--------|:-----:|:-----:|:------:|:------:|
| List / read | ✅ | ✅ | ✅ | ✅ |
| Create / rename / archive / restore | ✅ | ✅ | ✅ | ❌ |
| Delete | ✅ | ✅ | ❌ | ❌ |

Delete requires `admin` to demonstrate a per-action role check layered on top of
the default write gate: the handler calls `assertRole(ctx.role, "admin")`
instead of `assertCanWrite(ctx.role)`.

## Acceptance criteria

- **Given** a member of a workspace with no projects
  **When** they create `"  Roadmap  "`
  **Then** it is stored as `"Roadmap"`, is `active`, and appears first.

- **Given** an existing project `"roadmap"`
  **When** a member creates `"Roadmap"`
  **Then** it fails with `project.name_taken` and nothing is written.

- **Given** a project named `"Roadmap"`
  **When** it is renamed to `"Roadmap"`
  **Then** it succeeds — the uniqueness check excludes the row being renamed.

- **Given** an archived project
  **When** archiving is attempted again
  **Then** it fails with `project.already_archived`.

- **Given** one active and one archived project, the archived one updated more
  recently
  **When** the list renders
  **Then** the active one is first.

- **Given** a `member`
  **When** they attempt to delete
  **Then** it fails with `workspace.insufficient_role`.

- **Given** a project id from another workspace
  **When** any action is called with it
  **Then** the result is "not found".

## Edge cases

- **Name that normalises to fewer than 2 characters** (`"  a  "`): rejected as
  too short, after normalisation.
- **Concurrent creates with the same name.** Both pass the domain check, one
  loses at write time. Acceptable here; a product where this matters needs a
  unique expression index on `lower(name)`.
- **Empty state.** The list renders a call to action, not a blank panel.
