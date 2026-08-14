# Changelog

All notable changes to this project are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and
the project adheres to [Semantic Versioning](https://semver.org/). Entries are
generated from [Conventional Commits](https://www.conventionalcommits.org/) —
see [docs/guides/changelog.md](./docs/guides/changelog.md).

## [Unreleased]

## [0.1.0]

### Added

- Agent operating system: `AGENTS.md`, `.cursor/rules/`, `.cursor/agents/`,
  stop hook, and the curated skills under `.agents/skills/`.
- Documentation set: architecture, stack, TDD workflow, domain model, six ADRs,
  spec template and three specs, git-flow / changelog / new-feature guides.
- Next.js App Router application with Better Auth, Prisma and PostgreSQL.
- Workspace tenancy: membership roles, authorisation matrix, active-workspace
  resolution, personal workspace on sign-up.
- `defineAction` / `defineWorkspaceAction` — session, Zod validation, membership
  and error mapping in one place.
- Shared domain error taxonomy and the `ActionResult` contract.
- Application shell: sidebar, mobile tab bar, nav prefetching, loading
  skeletons.
- Design system in `DESIGN.md` with semantic tokens and light/dark themes.
- `projects` reference feature — one complete vertical slice, meant to be
  deleted.
- CI: typecheck, lint, test, build and commit-message validation; changelog and
  release automation.
