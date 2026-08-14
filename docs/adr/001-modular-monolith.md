# ADR-001 — Modular monolith on the Next.js App Router

**Status:** Accepted

## Context

The application needs a server for authentication, database access and
mutations, and a client for the interface. The options were a single Next.js
deployment, a separate API service with a thin frontend, or services split by
domain.

Distribution has a fixed cost regardless of team size: network boundaries,
serialisation contracts, independent deployments, distributed debugging. That
cost buys independent scaling and independent release cadence — neither of
which a product at this stage needs.

## Decision

One Next.js App Router application. UI, Server Actions and Route Handlers
deploy together.

Modularity is enforced **inside** the codebase, by layer and by feature folder,
not by network boundaries:

- `domain` — pure rules
- `services` — the only Prisma callers
- `actions` — the authenticated boundary
- `components` / `app` — presentation

A feature owns a vertical slice; cross-feature reuse goes through `src/domain/`
or `src/lib/`.

## Consequences

**Gained.** One deployment and one set of environment variables. Server
Components read the database directly, with no API layer to keep in sync.
Refactoring across the "boundary" is a rename, not a versioned contract.
End-to-end type safety with no code generation.

**Given up.** No independent scaling per module. A slow build is slow for
everyone. Layer discipline is a review responsibility — the compiler will
happily let a component import Prisma.

**Reversibility.** Moderate. Because `services` is the only Prisma caller, a
feature can be extracted behind an HTTP client without touching its domain or
its UI. That is precisely why the layer rule is non-negotiable.
