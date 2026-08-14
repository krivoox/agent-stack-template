# `src/domain` — shared pure domain

Rules that are true for the whole product, not for one feature. Everything here
is **pure**: no Next.js, no React, no Prisma, no `process.env`, no I/O. That is
what makes it cheap to test and safe to reuse.

| Module | Status | Purpose |
|--------|--------|---------|
| `errors.ts` | Keep | Shared error taxonomy every feature throws from |
| `calendar/` | Keep if the product filters by date | Timezone-aware period boundaries |
| `money/` | Reference — delete if unused | Value object showing the pattern end to end |

Feature-specific rules do **not** live here. They live in
`src/features/<feature>/domain/` and follow the same purity constraint.

## Adding a module

1. Write the failing test first (`<module>.test.ts`) from a spec scenario.
2. Implement the minimum that makes it pass.
3. Refactor with the test green.

If a module needs a database, a request, or the clock, it is not domain code —
it belongs in `src/features/<feature>/services/`. Inject the value instead
(`now: Date`, `timeZone: string`) so the domain stays deterministic.
