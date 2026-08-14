# ADR-004 — TDD scoped to the domain layer

**Status:** Accepted

## Context

Testing everything is expensive and, past a point, counterproductive: a suite
that breaks on every refactor stops being a safety net and becomes a tax. Not
testing anything means business rules regress silently.

The question is not *how much* to test but *what*. Two properties make a test
worth its maintenance cost:

1. It fails when behaviour breaks.
2. It does **not** fail when only the implementation changes.

Pure functions have both. Component tests have neither: they break when the
markup changes and pass when a rule is quietly wrong behind a correct-looking
render. Snapshot tests are the extreme case — they fail on every intentional
change and are approved without reading.

## Decision

**Test the domain layer with Vitest. Test nothing else by default.**

Tested:

- `src/domain/**` and `src/features/*/domain/**`
- Calculations, invariants, state machines, authorisation predicates

Not tested:

- React components, styles, layout, snapshots
- Prisma queries and services
- Framework behaviour

Services are excluded because they are supposed to contain no rules. A service
worth unit-testing is a service with a rule in the wrong place; the fix is to
move the rule, not to mock a database.

The domain has no mocks. Clock, randomness and rows are arguments — that is
what makes it testable, and it is why domain purity and this ADR are the same
decision seen from two sides.

## Consequences

**Gained.** A fast suite with no infrastructure. Refactors of UI, query shape
or file layout do not touch tests. Test failures point at a rule, not at markup.

**Given up.** Regressions in wiring — a component calling the wrong action, a
service forgetting a filter — are not caught by tests. Review and end-to-end
smoke checks carry that weight.

**When to break it.** A genuinely intricate interactive component, or a
critical end-to-end flow, may justify a targeted test. That is a deliberate
exception with a stated reason, not a new default.
