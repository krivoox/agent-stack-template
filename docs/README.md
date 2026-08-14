# Documentation

Documentation is part of the product here. An agent reads these files before
writing code, so a document that lies costs more than a missing one.

## Read in this order

| # | Document | When |
|---|----------|------|
| 1 | [architecture.md](./architecture.md) | Always. Layers, auth, data, performance. |
| 2 | [stack.md](./stack.md) | Always. What is fixed and why. |
| 3 | [specs/](./specs/) | Before implementing a feature. |
| 4 | [domain-model.md](./domain-model.md) | Before touching the schema or a domain rule. |
| 5 | [tdd-workflow.md](./tdd-workflow.md) | Before writing a domain test. |
| 6 | [../DESIGN.md](../DESIGN.md) | Before writing UI. |

## Decisions

Accepted architecture decisions live in [adr/](./adr/). They are append-only:
to change one, write a new ADR that supersedes it.

| ADR | Decision | Status |
|-----|----------|--------|
| [001](./adr/001-modular-monolith.md) | Modular monolith on Next.js App Router | Accepted |
| [002](./adr/002-better-auth.md) | Better Auth for authentication | Accepted |
| [003](./adr/003-workspace-tenancy.md) | Workspace as the tenancy primitive | Accepted |
| [004](./adr/004-tdd-domain-only.md) | TDD scoped to the domain layer | Accepted |
| [005](./adr/005-money-as-integer-minor-units.md) | Money as integer minor units | Accepted |
| [006](./adr/006-conventional-commits-semver.md) | Conventional Commits and SemVer releases | Accepted |

## Specs

A spec is the business source of truth. Code that contradicts one is a bug in
the code, or the spec is out of date — either way, say which.

| Spec | Feature |
|------|---------|
| [_template.md](./specs/_template.md) | Start here for a new spec |
| [01-auth.md](./specs/01-auth.md) | Registration, sign-in, password reset, profile |
| [02-workspaces.md](./specs/02-workspaces.md) | Tenancy, membership, roles |
| [03-projects.md](./specs/03-projects.md) | Reference feature — delete with the code |

## Guides

- [guides/git-flow.md](./guides/git-flow.md) — branches, PRs, hygiene
- [guides/changelog.md](./guides/changelog.md) — commits, changelog, releases
- [guides/new-feature.md](./guides/new-feature.md) — the walkthrough, end to end
