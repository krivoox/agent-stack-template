<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Agent guide

> Rename this product in `src/lib/app-config.ts`, `package.json` and this file.
> Everything else is already generic.

## What this repository is

A production-shaped starting point for a multi-tenant web application, built so
that **coding agents produce consistent work without being told the same things
twice**. Conventions live in files an agent reads automatically, not in a
person's head.

The included `projects` feature is a **reference vertical slice**, not a
product. Read it, copy its shape, then delete it.

## Every turn

Classify **before** opening a file. Open **one** matching guide. Do not read
the other playbooks, and do not start from the layer walkthrough until the
type is known.

| The request is… | Do this | Do not |
|-----------------|---------|--------|
| A problem, audience or outcome, no spec | `product-manager` → spec Draft | write product code |
| Spec exists but is Draft, or has open questions | resolve with the user; `domain-architect` if the rules are non-trivial | write product code |
| Spec **Accepted** or **Shipped**, new behaviour **with a domain rule** | [new-feature.md](docs/guides/new-feature.md) | skip the spec |
| Spec **Accepted** or **Shipped**, new behaviour **with no domain rule** (wiring, copy, layout only) | [new-feature.md](docs/guides/new-feature.md), skip domain tests and `domain/` | invent a `domain/` function so TDD has a target |
| Spec and code disagree | say which is wrong; fix that one | invent a third rule |
| Current behaviour is wrong | [bugfix.md](docs/guides/bugfix.md) | start a feature |
| Same behaviour, new shape | [refactor.md](docs/guides/refactor.md) | change a spec rule |
| Tooling, deps, CI, env, docs-only | [chore.md](docs/guides/chore.md) | sneak in behaviour; write a domain test |
| Copy, layout, existing actions | `ui-ux-developer` | put rules in React; TDD the markup |
| Infra, migrations, deploy, secrets | `devops-engineer` | run destructive commands unasked |
| The change does not touch `domain/` and adds no business rule | TDD does not apply. `npm run verify` is the gate | invent a test or a domain wrapper |

**If a feature spec is Draft, do not write product code.** Accepted and
Shipped are the implementable states.

### What to open after classify

The matching guide names the next files. Stop there.

| Type | Open | Leave closed |
|------|------|--------------|
| Feature with a domain rule | The spec, [new-feature.md](docs/guides/new-feature.md), [tdd-workflow.md](docs/tdd-workflow.md) | Other guides |
| Feature, no domain rule | The spec, [new-feature.md](docs/guides/new-feature.md) (skip steps 2–3) | [tdd-workflow.md](docs/tdd-workflow.md) |
| Bugfix | [bugfix.md](docs/guides/bugfix.md), the spec rule that should hold | [new-feature.md](docs/guides/new-feature.md) |
| Refactor | [refactor.md](docs/guides/refactor.md) | Specs (they do not move with files) |
| Chore / docs | [chore.md](docs/guides/chore.md) | Specs, TDD, architecture, stack, DESIGN |
| UI copy / layout | [DESIGN.md](./DESIGN.md) | [tdd-workflow.md](docs/tdd-workflow.md) |

Open [architecture.md](docs/architecture.md) only when the work moves a layer,
auth, data or performance boundary. Open [stack.md](docs/stack.md) only when
adding or substituting a dependency. Open an ADR when that decision already
exists, or when you must propose a new one.

### Small or local models

You implement against a closed contract. You do not invent product.

- Classify, then open the matching guide. Do not skip it. Do not open the others.
- If a rule is missing, the spec is Draft, or an ADR would reverse, stop and ask.
- Copy `src/features/projects/`. Do not invent a parallel shape.
- TDD only when there is a domain rule. Do not invent a function to test.
- `npm run verify` is the gate. A red verify is not a suggestion.
- Tick the docs DoD row in this file before the hand-off.
- Leave scope, missing rules and stack changes to the user.

## Documentation map

Index: [docs/README.md](./docs/README.md). Open the files the router above
names, not a reading list.

## When sources disagree

A spec beats architecture for a business rule. An ADR beats `stack.md` for a
decision already taken. Code that contradicts a spec is a bug in one of them —
say which. Never invent a third rule. If a spec is missing detail, update the
spec first, then write the code.

## Stack

Details in [docs/stack.md](./docs/stack.md). Do not substitute these without an
ADR and explicit approval:

- Next.js App Router, React, TypeScript strict, Tailwind, shadcn/ui
- **Better Auth** for authentication
- **Prisma** + PostgreSQL
- Zod + React Hook Form, TanStack Query, Zustand (UI state only)
- Vitest for domain tests

## Layers

New behaviour **with** a domain rule (not every turn):

```
spec → domain tests → domain → services → actions → UI
```

```
src/
  domain/            shared pure logic (no framework imports)
  features/<name>/   domain/ services/ actions/ schemas/ components/
  lib/               env, auth, prisma, session, action helpers
  app/               thin routes
  components/ui/     shadcn primitives
```

| Layer | May import | Must not |
|-------|-----------|----------|
| `domain` | other domain modules | Next, React, Prisma, `Date.now()` |
| `services` | domain, Prisma | React, decide user-facing copy |
| `actions` | services, schemas | contain business rules |
| `components` | actions, UI primitives | contain business rules |

Business rules live in `domain/`. If a calculation or an invariant is written
anywhere else, it is in the wrong place.

## Non-negotiables

- **TDD for business logic only.** Test first, in `domain/`. If the change
  has no domain rule, TDD does not apply — do not invent a function to test.
  Never test React components, CSS or snapshots.
- **Every Server Action re-checks auth.** Use `defineAction` /
  `defineWorkspaceAction` from `src/lib/action.ts`; they enforce session, Zod
  and workspace membership. A Server Action is a public endpoint.
- **Every business row carries `workspaceId`** and every query filters by it
  ([ADR-003](./docs/adr/003-workspace-tenancy.md)).
- **`process.env` is read in `src/lib/env.ts` only.**
- **Semantic colour tokens only.** No hex, no `zinc-*` / `blue-*` in product UI.
- **Mobile-first.** Base styles target a phone; enrich upward with `sm:` / `md:`.
- **Money is integer minor units** if the product handles money
  ([ADR-005](./docs/adr/005-money-as-integer-minor-units.md)).
- **Git Flow.** Branch from `develop`; never commit to `main` or `develop`.
- **Commit only when asked.**

## Definition of Done — docs

`verify` green is not the close. Tick the row for this work type. Mark **N/A**;
do not skip the row.

| After… | Review (N/A if untouched) |
|--------|---------------------------|
| Feature | Spec still true; add it to `docs/README.md` if new. Status stays **Accepted** until the `develop` → `main` release PR sets it to **Shipped**. `domain-model.md` if a table or rule moved. An ADR only if there was a trade-off. `architecture.md` only if a documented boundary moved. |
| Bugfix | Spec only if it was wrong or silent. No new spec for a typo. |
| Refactor | `architecture.md` / `domain-model.md` only if a documented boundary moved. Do not edit a spec to match a file move. |
| Chore | The document this change made untrue. No new spec. No ADR for a linter version. |

## Feature checklist

- [ ] Work type classified; matching guide followed
- [ ] For new behaviour: spec **Accepted** or **Shipped**; acceptance criteria covered
- [ ] Domain tests written first and passing **if** this change adds or breaks a domain rule; otherwise the PR says there is none
- [ ] Docs DoD row above ticked (or N/A)
- [ ] No business logic in UI, actions or services
- [ ] No UI tests
- [ ] Every action goes through `defineAction` / `defineWorkspaceAction`
- [ ] Every new table has `workspaceId` + index + `onDelete: Cascade`
- [ ] No `process.env` outside `src/lib/env.ts`
- [ ] `loading.tsx` present for new `(app)` segments
- [ ] New nav destinations added to `nav-config.ts` so they get prefetched
- [ ] `npm run verify` green
- [ ] Branch `feat|fix|chore|refactor|docs/*` from `develop`; PR targets `develop`
