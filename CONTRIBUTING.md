# Contributing

This file is the GitHub **Contributing** tab. Follow it before opening an
issue or a pull request. The same contract for humans and coding agents lives
in [AGENTS.md](./AGENTS.md).

## Ways to contribute

| You want to… | Use |
|--------------|-----|
| Ask a question, propose an idea, show a fork | [Discussions](https://github.com/krivoox/agent-stack-template/discussions) |
| Report a bug or request a product change | [Issues](https://github.com/krivoox/agent-stack-template/issues/new/choose) |
| Change the code, docs or CI | Pull request against `develop` |

Do not open an issue for a question. Use Discussions so the answer stays
searchable and does not sit in the bug tracker.

## Contributors

Everyone who lands a commit on this repository appears automatically on
[Insights → Contributors](https://github.com/krivoox/agent-stack-template/graphs/contributors)
and in the avatars below. No extra signup.

<a href="https://github.com/krivoox/agent-stack-template/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=krivoox/agent-stack-template" alt="Contributors to Agent Stack Template" />
</a>

Credit follows git authorship. Use a real name or handle in your commits;
do not force-push over someone else's work.

## Before you start

1. Read [AGENTS.md](./AGENTS.md) and classify the work (`feat`, `fix`,
   `refactor`, `chore`, `docs`).
2. Open **that** playbook under `docs/guides/` only. Do not read the others.
3. Never invent a business rule. If `docs/specs/` lacks the detail, update
   the spec first. TDD only if the change adds or breaks a domain rule.

## Branch and pull request

```bash
git fetch origin
git checkout develop && git pull
git checkout -b feat/<short-name>   # or fix/ chore/ refactor/ docs/
# … Conventional Commits …
git push -u origin HEAD
gh pr create --base develop
```

- PRs target **`develop`**. `main` is production; only a documented hotfix
  or a `develop` → `main` release PR goes there.
- The PR title **is** the commit that lands (squash merge). It must be a
  [Conventional Commit](https://www.conventionalcommits.org/):
  `feat(projects): add archive action`.
- `npm run verify` must be green locally.

Full branching rules: [docs/guides/git-flow.md](./docs/guides/git-flow.md).

## Changelog and releases

Commit types drive both. `feat` / `fix` / `perf` / `refactor` / breaking
changes appear in [CHANGELOG.md](./CHANGELOG.md) and in the next
[GitHub Release](https://github.com/krivoox/agent-stack-template/releases).
`docs`, `chore`, `test`, `ci` and `build` usually do not.

Do not edit `CHANGELOG.md` by hand. CI regenerates `[Unreleased]` on
`develop` and cuts a dated release on `main`. Details:
[docs/guides/changelog.md](./docs/guides/changelog.md).

## Code rules (non-negotiable)

- Business logic in `domain/`. Never in a component, action or service.
- Every business row carries `workspaceId`; every query filters by it.
- Server Actions go through `defineAction` / `defineWorkspaceAction`.
- TDD for domain rules only. If there is no domain rule, skip. No React / CSS / snapshot tests.
- Semantic Tailwind tokens only. Mobile-first.
- `process.env` is read in `src/lib/env.ts` only.

The PR template checklist repeats these. Tick them honestly.

## Conduct

Participation is governed by the [Code of Conduct](./CODE_OF_CONDUCT.md).
Security reports go to [SECURITY.md](./SECURITY.md), not a public issue.
