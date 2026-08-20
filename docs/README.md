# Documentation

Documentation is part of the product here. An agent reads these files before
writing code, so a document that lies costs more than a missing one.

## Open after classify

Do not read this index as a stack. Classify in [../AGENTS.md](../AGENTS.md),
open **one** guide, then only the files that row names.

| Document | When |
|----------|------|
| [../AGENTS.md](../AGENTS.md) | Classify first. Then stop until the type is known. |
| The matching [guide](#guides) | After classify. It names what else to open. |
| [architecture.md](./architecture.md) | The work moves a layer, auth, data or performance boundary — not every turn |
| [stack.md](./stack.md) | Adding or substituting a dependency |
| [specs/](./specs/) | Implementing or fixing behaviour a spec owns |
| [domain-model.md](./domain-model.md) | Touching the schema or a domain rule |
| [tdd-workflow.md](./tdd-workflow.md) | Writing a domain test. Skip if there is no domain rule. |
| [../DESIGN.md](../DESIGN.md) | Writing UI |

Close with the docs row in `AGENTS.md` → "Definition of Done — docs".

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

## Community (GitHub)

- [../CONTRIBUTING.md](../CONTRIBUTING.md) — Contributing tab, how to land a PR
- [../CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md) — Code of conduct tab
- [../SUPPORT.md](../SUPPORT.md) — Questions vs issues vs security
- [../CHANGELOG.md](../CHANGELOG.md) — Keep a Changelog history
- [Releases](https://github.com/krivoox/agent-stack-template/releases) — tagged GitHub Releases
- [Discussions](https://github.com/krivoox/agent-stack-template/discussions) — Q&A and ideas
- [Contributors](https://github.com/krivoox/agent-stack-template/graphs/contributors)

## Guides

- [guides/git-flow.md](./guides/git-flow.md) — branches, PRs, hygiene
- [guides/changelog.md](./guides/changelog.md) — commits, changelog, releases
- [guides/new-feature.md](./guides/new-feature.md) — new behaviour, end to end
- [guides/bugfix.md](./guides/bugfix.md) — wrong current behaviour
- [guides/refactor.md](./guides/refactor.md) — same behaviour, new shape
- [guides/chore.md](./guides/chore.md) — tooling, deps, CI, docs-only
- [AUDIT.md](./AUDIT.md) — what was kept, fixed and dropped from the source patterns
