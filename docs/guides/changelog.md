# Changelog and versioning

How changes are recorded and versions published. Companion to
[git-flow.md](./git-flow.md); rationale in
[ADR-006](../adr/006-conventional-commits-semver.md).

## Standards

| Standard | Applied to |
|----------|-----------|
| [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) | `CHANGELOG.md` format |
| [Semantic Versioning](https://semver.org/) | `package.json` and `vX.Y.Z` tags |
| [Conventional Commits](https://www.conventionalcommits.org/) | The input both are derived from |

The application is `"private": true`. Nothing is published to npm; the version
exists to label releases.

## Commit format

```text
<type>[optional scope]: <description>

[optional body]

[optional footer]
```

| Type | Changelog section | Bump |
|------|-------------------|------|
| `feat` | Added | minor |
| `fix` | Fixed | patch |
| `perf`, `refactor` | Changed | patch |
| `feat!` or `BREAKING CHANGE:` | Added + Breaking | major |

Usually omitted from the changelog: `docs`, `style`, `test`, `chore`, `ci`,
`build`.

```bash
feat(projects): add archive action
fix(workspaces): keep active workspace when membership is revoked
feat(api)!: rename membership role field

BREAKING CHANGE: role `viewer` is now `read`.
```

commitlint runs in the husky `commit-msg` hook, so a non-conforming message
fails before the commit exists. Because merges are squashed, **the PR title is
the message that lands** — it must conform too.

## Automation

### Push to `develop`

`.github/workflows/changelog-unreleased.yml`

1. git-cliff regenerates the `[Unreleased]` section from conventional commits
   since the last tag.
2. If anything changed, `github-actions[bot]` commits
   `chore(changelog): update Unreleased [skip ci]`.

This is the documented exception to "no direct commits to `develop`": the bot
touches `CHANGELOG.md` and nothing else.

### Push to `main`

`.github/workflows/release.yml`

1. git-cliff computes the next version from the commit types.
2. `package.json` and `CHANGELOG.md` are updated with a dated section.
3. Bot commit `chore(release): vX.Y.Z [skip ci]`.
4. Annotated tag `vX.Y.Z` and a GitHub Release.

**First release.** With no `v*` tag present, the workflow bootstraps at the
current `package.json` version and publishes the existing `CHANGELOG.md`
baseline rather than regenerating from a pre-convention history. The template
itself starts at **[v0.1.0](https://github.com/krivoox/agent-stack-template/releases/tag/v0.1.0)**.

Published notes live on the repository **Releases** page. `CHANGELOG.md` is
the same history in the tree, with compare links at the bottom.

## Local scripts

```bash
npm run changelog      # refresh [Unreleased] only
npm run release:dry    # show the computed bump, write nothing
npm run release        # write package.json + CHANGELOG.md, no push
```

Running the release locally is not normally necessary — the workflow on `main`
does it.

## Flow

```text
feat/* ──PR──► develop ──► [Unreleased] refreshed by the bot
                 │
                 └──PR──► main ──► bump + tag + GitHub Release
```
