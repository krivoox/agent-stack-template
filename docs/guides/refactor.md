# Refactoring

A refactor changes shape, not behaviour. If a user, a spec or a test would
notice, it is a feature or a bug — pick the other guide.

```
name the smell → keep tests still → move code → verify
```

## Hard stops

- Do not change what the product does. No new branches of behaviour, no new
  error `code`s, no copy changes that alter meaning.
- Do not edit a spec to match a refactor. Specs describe what must be true,
  not where the files live. Architecture or `domain-model.md` may need a
  sentence if a boundary moved.
- Do not mix this with a feature or a fix. Two intents, two branches.
- Do not add tests "for coverage" of UI, CSS or snapshots. If the domain was
  untested, that is a missing proof of today's behaviour: write the
  characterisation tests *first*, see them pass, then move the code.

## 0. Branch

```bash
git fetch origin && git checkout develop && git pull
git checkout -b refactor/<name>
```

## 1. Name the smell

One paragraph: what is expensive now, what will be cheaper after, and how you
will know behaviour did not move (which tests, which error codes).

If you cannot name an existing test that pins the behaviour, write those
tests first and stop if they fail — you found a bug, not a refactor.

## 2. Keep the tests still

The domain tests that already pass must still pass, with the same assertions.
Renaming a test to follow a function rename is allowed. Changing an
expectation is not.

## 3. Move the code

Typical legal moves in this repository:

- A calculation that leaked into an action, service or component → `domain/`
  (this is the common one; add tests if they were missing, as characterisation,
  then move)
- Shared rule used by two features → `src/domain/`
- Query shape, indexes, `Promise.all` on independent I/O
- Extract a helper, rename, flatten a nested function
- RSC vs Client Component when the client boundary was unjustified

Illegal here:

- New user-facing behaviour
- A different tenancy or money representation
- Replacing a stack piece (that is an ADR, not a refactor)

Match `src/features/projects/` when you reshuffle a feature folder. Do not
invent a parallel layout.

## 4. Verify

```bash
npm run verify
```

If a test had to change its *expectation* to go green, the refactor failed.
Revert and reclassify.

## 5. Docs

Tick the **Refactor** row in `AGENTS.md` → "Definition of Done — docs". Update
`docs/architecture.md` or `docs/domain-model.md` only when a boundary you
documented became untrue. Leave specs and ADRs alone unless you are proposing
a new ADR.

## Hand-off

Close with: the smell, the tests that pin behaviour, what moved where, and
confirmation that no spec rule changed.
