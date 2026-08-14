# Architecture

## 1. Shape

A modular monolith on the Next.js App Router. UI, Server Actions and Route
Handlers deploy as one unit ([ADR-001](./adr/001-modular-monolith.md)).

The boundaries that matter are **layers inside the codebase**, not network
boundaries between services. Enforce them in review; the compiler cannot.

## 2. Folders

```
src/
  domain/              shared pure logic + the error taxonomy
  features/<name>/
    domain/            pure rules for this feature   (tested)
    services/          Prisma access                 (server-only)
    actions/           Server Actions                ("use server")
    schemas/           Zod, shared client + server
    components/        feature UI
  lib/                 env, auth, prisma, session, action helpers
  components/
    ui/                shadcn primitives
    app-shell/         persistent shell and navigation
  app/                 routes — composition only
  hooks/
prisma/schema.prisma
docs/
```

A feature owns its vertical slice. Cross-feature reuse goes through
`src/domain/` or `src/lib/`, never by reaching into another feature's
`services/`.

## 3. The layer contract

```
spec → domain tests → domain → services → actions → UI
```

| Layer | Responsibility | May import | Must never |
|-------|----------------|-----------|------------|
| `domain` | Rules, calculations, invariants | other domain modules | Next, React, Prisma, `Date.now()`, `Math.random()` |
| `services` | Load rows, call the rule, persist | domain, Prisma | React; decide user-facing copy |
| `actions` | Auth, validation, tenancy, revalidation | services, schemas | contain a business rule |
| `components` | Presentation and interaction | actions, UI primitives | contain a business rule |
| `app` | Composition | everything | compute anything |

### Why the domain is pure

Ambient inputs — the clock, randomness, a database row — are passed in as
arguments. That is the whole reason domain tests need no mocks, and a domain
test that needs one is telling you the boundary is in the wrong place.

### Errors

`src/domain/errors.ts` defines five kinds: `validation`, `not_found`,
`forbidden`, `conflict`, `unauthenticated`. Domain code throws; the action
layer translates, exactly once, in `src/lib/action-result.ts`.

Each error carries a stable `code` (`project.name_taken`). The UI branches on
the code; it never parses the message.

## 4. Authentication and tenancy

Better Auth with the Prisma adapter ([ADR-002](./adr/002-better-auth.md)).

**A Workspace is the unit of tenancy** ([ADR-003](./adr/003-workspace-tenancy.md)).
Every business row carries `workspaceId`. Every query filters by it. A personal
workspace is created on sign-up, so a user is never without one.

Three layers of defence, in increasing authority:

1. `src/middleware.ts` — checks for a session *cookie* only. It is a cheap
   redirect, not a security boundary; validating the session here would put a
   database round-trip in front of every request.
2. `(app)/layout.tsx` — resolves the real session and redirects.
3. **`defineWorkspaceAction`** — the actual boundary. A Server Action is a
   public HTTP endpoint that can be invoked directly, so it re-checks session,
   input and membership itself.

Beyond that, services scope by `workspaceId`. An id belonging to another tenant
returns "not found" because the row is not in the filtered set — not because
something checked and refused.

## 5. Data

Prisma against PostgreSQL. `src/lib/prisma.ts` owns the client and the
connection pool.

- Pooled URL at runtime, direct URL for migrations.
- Both sides of every relation, `onDelete: Cascade` from `Workspace`.
- An index for every filter, ordering and join; compound indexes start with
  `workspaceId`.
- Transactions where consistency demands one, not by default.

## 6. Configuration

`src/lib/env.ts` is the only reader of `process.env`. It parses with Zod at
module load, so a missing variable is a startup error naming the variable —
not an `undefined` discovered three layers deep at request time.

Adding a variable means editing three places: the schema, `.env.example`, and
the hosting provider.

## 7. Performance

### 7.1 Rendering

Server Components by default. A Client Component needs a reason: interactivity,
a form, or a browser API. Push the `"use client"` boundary as deep as possible
— a client wrapper around an otherwise static page costs the whole subtree.

Start independent I/O together. `React.cache` deduplicates a read that layout
and page both need.

### 7.2 Navigation

The shell in `(app)/layout.tsx` persists, so a soft-nav swaps only the page
body.

- `experimental.staleTimes.dynamic: 0`. After a mutation, navigating back to a
  list must re-fetch. Perceived speed comes from `loading.tsx` and prefetch,
  never from showing data captured before the write.
- Every `(app)` segment has a `loading.tsx` built on `PageSkeleton`, mirroring
  the real layout so nothing shifts.
- `nav-config.ts` is the single source for navigation; idle prefetch and intent
  prefetch both read from it.
- After a mutation, use `refreshAfterMutation` / `navigateAndRefresh` from
  `src/lib/navigation.ts`. A bare `router.push` can land on a Client Router
  Cache entry captured before the write.

### 7.3 Caching

| Surface | Policy |
|---------|--------|
| `/_next/static/*` | `public, max-age=31536000, immutable` |
| Authenticated routes | `private, no-store` |
| Tenant data | No cross-request cache |

Add new authenticated prefixes to `PRIVATE_ROUTE_PREFIXES` in
`next.config.ts`.

If you add a service worker: static assets only. Caching HTML or `/api/*`
serves one user's data to another after a workspace switch, and stale
authoritative data is worse than a spinner.

## 8. Testing

Vitest, domain only ([ADR-004](./adr/004-tdd-domain-only.md)). Details in
[tdd-workflow.md](./tdd-workflow.md).

## 9. Adding a feature

See [guides/new-feature.md](./guides/new-feature.md). The short version:

1. Spec in `docs/specs/`.
2. Prisma model with `workspaceId`, index and cascade. Migrate.
3. `features/<name>/domain/` — tests first, then rules.
4. `features/<name>/services/` — Prisma, scoped by `workspaceId`.
5. `features/<name>/schemas/` — Zod including `workspaceId`.
6. `features/<name>/actions/` — `defineWorkspaceAction`.
7. `features/<name>/components/` + route + `loading.tsx`.
8. Register the route in `nav-config.ts` and `PRIVATE_ROUTE_PREFIXES`.
