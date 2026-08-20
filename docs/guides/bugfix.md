# Fixing a bug

A bug is current behaviour that is wrong. It is not a new capability. If the
user asked for something the product has never done, that is
[new-feature.md](./new-feature.md), not this guide.

```
reproduce → classify → failing proof → smallest fix → verify
```

## Hard stops

- Do not start a feature inside a fix. No new tables, no new user-facing
  capability, no "while we are here".
- Do not invent the missing rule. If the spec is silent or disagrees with the
  code, say which is wrong and wait — or update the spec first.
- Do not expand the diff past the failing case and its immediate neighbours.

## 0. Branch

```bash
git fetch origin && git checkout develop && git pull
git checkout -b fix/<name>
```

A hotfix against live `main` follows [git-flow.md](./git-flow.md). Same
playbook, different base.

## 1. Reproduce

Name the expected behaviour and the actual behaviour in one sentence each.
Point at the spec rule, the test, or the error `code` that makes the expected
side true.

If you cannot reproduce it, stop. A fix for a bug you have not seen is a
guess.

## 2. Classify

| Kind | How you know | Proof |
|------|----------------|-------|
| Domain | A spec rule or invariant is broken | Failing domain test first ([tdd-workflow.md](../tdd-workflow.md)) |
| Wiring | Auth, Prisma, action mapping, or a route is wrong; the domain is fine | No domain test can catch it. Keep the diff tiny; say so in the hand-off |
| Spec gap | The code and the spec are both silent, or they contradict | Update the spec (or ask). Do not pick a rule in the patch |

Wiring bugs are a known gap: this repository does not unit-test services,
actions or UI ([ADR-004](../adr/004-tdd-domain-only.md)). Review and
`npm run verify` are the net. Do not add a component, snapshot or Prisma mock
test to close the gap.

## 3. Failing proof (domain bugs)

Write one test named as the broken rule, not as the function. Run it. **Watch
it fail for the right reason.**

If an existing test already describes the rule and it is passing, the bug is
not in the domain — reclassify.

## 4. Smallest fix

The least change that makes the proof pass. Move a leaked rule down into
`domain/` if that is where it should have lived; do not leave a patched
condition in an action or a component.

Same layer contract as a feature: `workspaceId` on every query, no
`process.env` outside `src/lib/env.ts`, actions only through `defineAction` /
`defineWorkspaceAction`.

## 5. Verify

```bash
npm run verify
```

The new test stays red-then-green in the history of the work. A verify that
was already green before the test existed has not proved the fix.

## 6. Docs

Tick the **Bugfix** row in `AGENTS.md` → "Definition of Done — docs". Update the
spec only when it was wrong or silent. Do not write a new spec for a typo.

## Hand-off

Close with: the expected vs actual, the classification, the proof (test name
or why there is none), the files that changed, and anything you deliberately
did not touch.
