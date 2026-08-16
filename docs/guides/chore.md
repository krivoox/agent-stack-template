# Chores

A chore is maintenance that does not change product behaviour: tooling,
dependencies, CI, environment, config, or documentation that already matches
the code. New capability is [new-feature.md](./new-feature.md). Wrong
behaviour is [bugfix.md](./bugfix.md). Same behaviour, new shape is
[refactor.md](./refactor.md).

```
name the job → smallest change → verify → docs only if they were untrue
```

## Hard stops

- Do not sneak in behaviour. A dependency bump that "also" changes a rule is
  two patches; split them.
- Do not put business logic in a config file, a script, or CI.
- Do not read `process.env` outside `src/lib/env.ts`. A new variable means
  that schema, `.env.example`, and the hosting provider — all three.
- Do not run `db:push` against a shared database. Do not commit secrets.

## 0. Branch

```bash
git fetch origin && git checkout develop && git pull
git checkout -b chore/<name>
```

Documentation-only work may use `docs/<name>` instead. Same playbook.

## 1. Name the job

One sentence: what is broken or stale in the *machine*, not in the product.
Examples: a lint rule, a lockfile, a workflow, a README that lies, a Prisma
CLI flag, an env example.

If the sentence names a user-facing outcome, you are in the wrong guide.

## 2. Smallest change

Touch the fewest files that finish the job.

| Job | Where |
|-----|--------|
| Env var | `src/lib/env.ts`, `.env.example`, host config |
| Prisma generate / migrate mechanics | `prisma/`, `package.json` scripts — not domain rules |
| CI, hooks, commitlint, release | `.github/`, `scripts/`, `commitlint.config.*` |
| Docs that drifted from the code | The document that is now untrue, nothing else |
| Dependency bump | Lockfile + the import sites that fail typecheck |

Hand risky migrations and production env to `devops-engineer`. This guide is
the shape of the work, not a licence to run destructive commands.

## 3. Verify

```bash
npm run verify
```

Skip verify only when the change cannot affect TypeScript, lint or tests
(for example a comment in `docs/`). If you are unsure, run it.

A chore that makes `verify` red is not finished, even if the chore itself
"worked".

## 4. Docs

Update a document when this change made it untrue. Do not add a spec. Do not
write an ADR for a linter version.

## Hand-off

Close with: the job, the files touched, whether `verify` ran, and any manual
step the user must take (env var, migrate, host setting).
