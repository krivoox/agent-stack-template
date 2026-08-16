# Audit report — Agent Stack Template
>
> Critical review of the source project's patterns, what was kept, what was
> fixed, and what was dropped. Written so the next person (or agent) knows
> *why* the template looks the way it does.

## Verdict

The source project had a strong operating system for agents — layers, TDD on
domain, Git Flow, semantic design tokens, Better Auth + Prisma tenancy — and
enough local debt that copying it verbatim would have reproduced the debt.
The template keeps the operating system, ships one runnable Next.js profile,
and closes the gaps that made agents inefficient.

## What was correct (kept)

| Pattern | Why it stays |
|---------|--------------|
| Spec → domain test → domain → service → action → UI | Forces rules into a testable place before UI invents them |
| Domain purity (no Prisma / React / `Date.now()`) | Makes TDD real instead of ornamental |
| Workspace as tenancy primitive | Sharing works from day one; no null-tenant branch |
| Better Auth in the same DB as business data | Real FKs; cascade deletes; no identity silo |
| Semantic colour tokens only | Dark mode and theming stay coherent |
| Mobile-first base styles | Small screens stop being the exception |
| `process.env` only in `env.ts` | One schema to audit |
| Conventional Commits + SemVer + git-cliff | Changelog cannot drift from history |
| Git Flow (`main` / `develop` / `feat/*`) | Preview vs production stays unambiguous |
| Soft-nav + `staleTimes.dynamic: 0` for money-like data | Correctness over stale speed |

## What was wrong or inefficient (fixed in the template)

### 1. No quality CI
The source had changelog/release workflows but **no** lint / typecheck / test /
build gate. Agents and humans could merge green-looking PRs that did not
compile. **Fix:** `.github/workflows/ci.yml` plus `npm run verify`.

### 2. Duplicated Server Action boilerplate
Every action re-implemented session → Zod → membership → try/catch → map
error. One of them always forgot a step. **Fix:** `defineAction` /
`defineWorkspaceAction` in `src/lib/action.ts` and a shared `ActionResult` /
`DomainError` taxonomy.

### 3. Hardcoded product identity in release tooling
`scripts/release.mjs` and `cliff.toml` pointed at a specific GitHub repo.
**Fix:** resolve the compare URL from `git remote get-url origin`; empty
cliff footer.

### 4. Domain-coupled UI tokens and components
Income / expense / transfer colours, finance-specific badge variants, KPI
tones named after money flows. **Fix:** generic semantic set (`info`,
`success`, `warning`, `destructive`); domain accents documented as an
extension point in `DESIGN.md`.

### 5. Missing / broken agent surface
Marketing agent and a content rule without frontmatter (so Cursor never
loaded them); stray parentheses in agent prompts; no dedicated code-reviewer.
**Fix:** six focused agents with valid frontmatter; `code-reviewer` that
checks the non-negotiables.

### 6. Docs that lied about the stack
Documented TypeScript flags and shadcn presets that did not match
`tsconfig` / `components.json`; dual lockfile noise. **Fix:** single npm
lockfile, docs rewritten to match the code, ADRs for the real decisions.

### 7. No onboarding path for a fresh user
Redirect to `/onboarding` that did not exist. **Fix:** lazily create the
personal workspace in the `(app)` layout (and still in the auth hook).

### 8. Spanish mixed into agent-facing UI strings
Theme toggle, form-sheet labels, comments. Agents generate in the language
of the surrounding files. **Fix:** English throughout the template.

## What was redundant (dropped)

| Dropped | Reason |
|---------|--------|
| Finance domain features (accounts, budgets, goals, FX, Mercado Pago…) | Product-specific; the template is not a finance app |
| Multiple icon libraries | One (`lucide-react`) is enough |
| Always-on hooks that rewrote files after every edit | Noisy; the stop hook that asks about docs sync is enough |
| UI / snapshot testing culture | High maintenance, low signal for this architecture |
| Cross-request caching of balances / membership | Explicitly forbidden; trust > stale speed |

## What is still a conscious trade-off

1. **Middleware → Proxy deprecation** (Next.js 16). The build warns that
   `middleware.ts` should become `proxy`. Kept as middleware for now because
   the auth cookie gate is well understood; migrate when the Next docs for
   `proxy` settle.
2. **No end-to-end tests.** Domain tests cover rules; wiring bugs rely on
   review and CI build. Add Playwright when a product has a critical path
   worth the cost.
3. **`projects` as reference feature.** It will rot if nobody deletes it.
   Spec `03` and the feature folder are marked disposable on purpose.
4. **Personal-repo changelog token.** GitHub still will not let
   `github-actions` bypass rulesets on user accounts. `CHANGELOG_TOKEN` is
   documented; without it, release pushes fail under branch protection.
5. **Layer imports are a review rule, not a compiler rule.** An agent can
   still import Prisma from a component. `code-reviewer` is the enforcement
   until a lint boundary is worth adding.

## Recommendations for generating new projects from this template

1. Use `npm run init -- --name "…" --slug … --repo owner/name`.
2. Delete `src/features/projects/` and `docs/specs/03-projects.md` once the
   first real feature exists.
3. Write the first real spec before writing code, and mark it Accepted before
   anyone implements. Agents that skip the spec invent rules in the UI.
   Classify every request (`AGENTS.md` → "Every turn") so a bug or a chore
   does not run the feature walkthrough.
4. Keep the agent OS thin: do not add a sub-agent per feature. Six roles
   cover the loop; more roles fragment context. Work-type playbooks
   (`docs/guides/new-feature.md`, `bugfix.md`, `refactor.md`, `chore.md`)
   are cheaper than extra agents.
5. Prefer extending `globals.css` tokens over introducing a second design
   system.
6. Turn on branch protection and `Automatically delete head branches` on day
   one.
7. Set `CHANGELOG_TOKEN` before the first merge to `main` if the repo is
   under a personal account.

## Efficiency gains for agents

| Before (source habits) | After (template) |
|------------------------|------------------|
| Re-derive action auth every time | One helper, one review checklist |
| Invent error shapes per feature | Shared `DomainError` + `toActionError` |
| Guess the stack from mixed docs | `docs/stack.md` + ADRs match the code |
| One walkthrough for every kind of work | Classify first; four playbooks |
| Spanish/English oscillation | English contract everywhere |
| No CI signal until production | `verify` job on every PR |
| Finance vocabulary leaks into new products | Generic tenancy + disposable reference feature |

The template's job is not to be clever. It is to make the correct next step
the path of least resistance for both a human and an agent.
