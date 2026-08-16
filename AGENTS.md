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

Classify the work **before** opening a file. Then follow the matching guide.
Do not start from the layer walkthrough until the type is known.

| The request is… | Do this | Do not |
|-----------------|---------|--------|
| A problem, audience or outcome, no spec | `product-manager` → spec Draft | write product code |
| Spec exists but is Draft, or has open questions | resolve with the user; `domain-architect` if the rules are non-trivial | write product code |
| Spec **Accepted** or **Shipped**, new behaviour | [new-feature.md](docs/guides/new-feature.md) | skip the spec |
| Spec and code disagree | say which is wrong; fix that one | invent a third rule |
| Current behaviour is wrong | [bugfix.md](docs/guides/bugfix.md) | start a feature |
| Same behaviour, new shape | [refactor.md](docs/guides/refactor.md) | change a spec rule |
| Tooling, deps, CI, env, docs-only | [chore.md](docs/guides/chore.md) | sneak in behaviour |
| Copy, layout, existing actions | `ui-ux-developer` | put rules in React |
| Infra, migrations, deploy, secrets | `devops-engineer` | run destructive commands unasked |

**If a feature spec is Draft, do not write product code.** Accepted and
Shipped are the implementable states.

### Small or local models

You implement against a closed contract. You do not invent product.

- Classify, then open the matching guide. Do not skip it.
- If a rule is missing, the spec is Draft, or an ADR would reverse, stop and ask.
- Copy `src/features/projects/`. Do not invent a parallel shape.
- `npm run verify` is the gate. A red verify is not a suggestion.
- Leave scope, missing rules and stack changes to the user.

## Documentation map

| File | Contents |
|------|----------|
| [docs/README.md](./docs/README.md) | Index: specs, ADRs, guides |
| [docs/architecture.md](./docs/architecture.md) | Layers, folders, auth, data, performance |
| [docs/stack.md](./docs/stack.md) | Fixed stack and what may not be substituted |
| [docs/tdd-workflow.md](./docs/tdd-workflow.md) | Red → green → refactor, what is and isn't tested |
| [docs/guides/git-flow.md](./docs/guides/git-flow.md) | Branches, PRs, hygiene |
| [docs/guides/changelog.md](./docs/guides/changelog.md) | Conventional Commits, SemVer, releases |
| [docs/guides/new-feature.md](./docs/guides/new-feature.md) | New behaviour, end to end |
| [docs/guides/bugfix.md](./docs/guides/bugfix.md) | Wrong current behaviour |
| [docs/guides/refactor.md](./docs/guides/refactor.md) | Same behaviour, new shape |
| [docs/guides/chore.md](./docs/guides/chore.md) | Tooling, deps, CI, docs-only |
| [docs/specs/](./docs/specs/) | Feature specs — the business source of truth |
| [docs/adr/](./docs/adr/) | Accepted architecture decisions |
| [DESIGN.md](./DESIGN.md) | Visual system and UI rules |
| [README.md](./README.md) | Local setup |

## Order of truth when implementing

0. Classify the work (table above). Open that guide.
1. `docs/README.md`
2. The relevant spec in `docs/specs/`
3. `docs/architecture.md` + `docs/stack.md` + `docs/adr/`
4. `docs/tdd-workflow.md`
5. `DESIGN.md` (UI only)

**Never invent a business rule.** If a spec is missing detail, update the spec
first, then write the code. A spec that disagrees with the code is a bug in one
of them — say which.

## Stack

Details in [docs/stack.md](./docs/stack.md). Do not substitute these without an
ADR and explicit approval:

- Next.js App Router, React, TypeScript strict, Tailwind, shadcn/ui
- **Better Auth** for authentication
- **Prisma** + PostgreSQL
- Zod + React Hook Form, TanStack Query, Zustand (UI state only)
- Vitest for domain tests

## Layers

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

- **TDD for business logic.** Test first, in `domain/`. Never test React
  components, CSS or snapshots.
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

## Feature checklist

- [ ] Work type classified; matching guide followed
- [ ] For new behaviour: spec **Accepted** or **Shipped**; acceptance criteria covered
- [ ] Domain tests written first and passing (features and domain bugs)
- [ ] No business logic in UI, actions or services
- [ ] No UI tests
- [ ] Every action goes through `defineAction` / `defineWorkspaceAction`
- [ ] Every new table has `workspaceId` + index + `onDelete: Cascade`
- [ ] No `process.env` outside `src/lib/env.ts`
- [ ] `loading.tsx` present for new `(app)` segments
- [ ] New nav destinations added to `nav-config.ts` so they get prefetched
- [ ] `npm run verify` green
- [ ] Branch `feat|fix|chore|refactor|docs/*` from `develop`; PR targets `develop`
