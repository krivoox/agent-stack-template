# Git Flow

The source of truth for branching. Binding for humans and agents alike.

## Permanent branches

| Branch | Role | Deployment |
|--------|------|------------|
| `main` | Production | Production |
| `develop` | Integration / QA | Preview |

Nobody commits directly to either. The one exception is `github-actions[bot]`,
which updates `CHANGELOG.md` and the release commit — see
[changelog.md](./changelog.md).

## Working branches

| Prefix | Use | Base | Target |
|--------|-----|------|--------|
| `feat/` | New capability | `develop` | `develop` |
| `fix/` | Bug fix | `develop` (or `main` for a hotfix) | `develop` (and `main` for a hotfix) |
| `chore/` | Tooling, dependencies, docs | `develop` | `develop` |
| `refactor/` | Restructuring with no behaviour change | `develop` | `develop` |

Names in kebab-case: `feat/invite-members`, `fix/timezone-boundary`,
`chore/upgrade-prisma`.

## The loop

```
main (production)
  ↑
  │  release: PR develop → main
  │
develop (preview)
  ↑
  │  PR feat|fix|chore → develop
  │
feat/*  fix/*  chore/*
```

```bash
git fetch origin
git checkout develop && git pull
git checkout -b feat/<name>
# … work, committing in Conventional Commits …
git push -u origin HEAD
gh pr create --base develop
```

After the merge, CI regenerates the `[Unreleased]` section. When `develop` is
ready to ship, open a PR from `develop` to `main`; the release workflow bumps
the version, tags it and publishes the GitHub Release.

## Hotfix

Only when the bug is live in `main` and cannot wait for the normal cycle:

```bash
git checkout main && git pull
git checkout -b fix/<name>
# … PR → main …
```

Then merge or cherry-pick the same fix into `develop` **immediately**. A hotfix
that only lands on `main` is silently reverted by the next release.

## Repository hygiene

1. Turn on **Settings → General → Pull Requests → Automatically delete head
   branches**.
2. After a merge, clean up locally:

```bash
git checkout develop && git pull origin develop
git branch -d feat/<name>
git fetch --prune
```

3. Never reuse a merged branch for new work. Branch again from an updated
   `develop`.

## Rules for agents

Non-negotiable:

- Never `git commit` or `git push` directly to `main` or `develop`.
- Never open a feature PR against `main`.
- Always branch from an updated `develop`.
- Never force-push to `main` or `develop`.
- Never pass `--no-verify` unless explicitly asked; it bypasses commitlint.
- **Commit only when the user asks.** Producing commits unprompted removes the
  user's chance to review the diff as a whole.

## Branch protection

Protect `main` and `develop`: require a pull request, block force-pushes, block
deletion.

On **personal** (non-organisation) repositories GitHub does not allow
`github-actions` as a ruleset bypass actor, so the default `GITHUB_TOKEN`
cannot push to a protected branch. The workflows therefore use a
`CHANGELOG_TOKEN` secret — a fine-grained PAT scoped to this repository with
**Contents: read and write** — falling back to `GITHUB_TOKEN` when absent. With
the ruleset active and the secret missing, the release job fails at `git push`.

## Pre-PR checklist

- [ ] Branched from an updated `develop`
- [ ] Correct prefix
- [ ] PR targets `develop` (or `main`, for a documented hotfix)
- [ ] `npm run verify` green
- [ ] Domain tests written for any new business rule
- [ ] Branch deleted after merge, local refs pruned
