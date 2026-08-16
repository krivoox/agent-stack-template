# TDD workflow

Test-first, for business logic only. The scope is narrow on purpose — see
[ADR-004](./adr/004-tdd-domain-only.md). New behaviour uses this loop inside
[guides/new-feature.md](./guides/new-feature.md); a broken rule uses it inside
[guides/bugfix.md](./guides/bugfix.md). A refactor must not change
expectations — [guides/refactor.md](./guides/refactor.md).

## Scope

| Tested | Not tested |
|--------|-----------|
| `src/domain/**` | React components |
| `src/features/*/domain/**` | Styles and layout |
| Calculations, invariants, state machines | Snapshots |
| Authorisation predicates | Prisma queries |
| Pure formatting and parsing | Framework behaviour |

Services and actions are not unit-tested. They contain no rules — if one does,
the fix is to move the rule into `domain/`, not to write a test with a mocked
Prisma client.

## The loop

### 1. Red

Write the test. Run it. **Watch it fail, and read the failure.** A test that
passes before the implementation exists is testing nothing; a test that fails
with the wrong error is testing the wrong thing.

```ts
it("rejects a duplicate name regardless of casing", () => {
  expect(() =>
    assertNameAvailable([{ id: "1", name: "Website" }], "WEBSITE"),
  ).toThrow(ConflictError);
});
```

### 2. Green

The least code that makes it pass. Not the general solution — the specific one.
Generality that no test demands is speculation.

### 3. Refactor

Now improve it, with the test as the safety net. Extract, rename, simplify. The
test does not change.

## Writing good tests here

**Name the rule, not the function.** `"rejects a duplicate name regardless of
casing"` survives a rename; `"assertNameAvailable works"` tells a future reader
nothing about what broke.

**Assert on the error type, not the message.** Copy is edited constantly;
`ConflictError` and the `code` are the contract.

**Cover the boundary.** For a rule with a limit, that is: below it, exactly at
it, one past it. Bugs live at the edges, and the happy path is the case least
likely to be wrong.

**Prove immutability where you promise it.** If a function returns a new array,
assert the input is untouched — otherwise the promise erodes silently.

**No mocks.** If a rule needs the clock, take a `Date` argument. If it needs
rows, take an array. This is not a testing trick; it is what keeps the rule
callable from a service, a script or another rule.

## Given / When / Then

Write the table in the spec before the code. It is the test list.

| Given | When | Then |
|-------|------|------|
| A workspace with a project named "Website" | Creating "website" | `ConflictError` (`project.name_taken`) |
| An archived project | Archiving it again | `ConflictError` (`project.already_archived`) |
| An empty workspace | Creating "Web" | The project is created |

## Commands

```bash
npm test              # once
npm run test:watch    # while working
npm run test:coverage # coverage
npm run verify        # typecheck + lint + test — run before a PR
```

Coverage is a diagnostic, not a target. An untested branch is a question worth
asking; a coverage percentage is not worth gaming.
