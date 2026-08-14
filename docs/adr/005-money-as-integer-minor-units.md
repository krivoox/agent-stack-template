# ADR-005 — Money as integer minor units

**Status:** Accepted
**Applies to:** products that handle money. Delete `src/domain/money/` if yours
does not.

## Context

`0.1 + 0.2 === 0.30000000000000004`. IEEE-754 doubles cannot represent most
decimal fractions, so a running total accumulates error. In a financial context
that error is not academic — it is a balance that does not reconcile.

The options: floating point (fast, wrong), a decimal library (correct, adds a
dependency and a wrapper type at every boundary), or integers in the smallest
unit of the currency.

## Decision

**Amounts are integers in the currency's minor unit** — cents for USD, and
whatever `Currency.decimals` says otherwise.

- Stored as `Int` in PostgreSQL, carried as `number` in TypeScript.
- The `Money` value object in `src/domain/money/` pairs an amount with a
  currency and refuses to add across currencies.
- Formatting for display and parsing from user input happen at the boundary,
  once, never in the middle of a calculation.
- Division that does not divide evenly must distribute the remainder
  explicitly. `splitEvenly` gives the extra minor units to the first shares so
  the parts always sum back to the whole.

## Consequences

**Gained.** Addition and subtraction are exact. Equality is `===`. Sums are
`SUM()` in SQL with no cast. No dependency, no wrapper type in the database
layer.

**Given up.** Every amount crossing the UI boundary needs conversion — a
forgotten one shows a bill of $1,299 as $129,900, which is loud and therefore
caught. Percentages and currency conversion produce fractions that must be
rounded deliberately; the domain forces the choice rather than silently
truncating.

**Constraint.** `Int` caps at ~21 million in a 2-decimal currency at the
JavaScript-safe boundary — far beyond it in practice, but a product handling
hyperinflated currencies should revisit this with `BigInt`.
