# Building a feature, end to end

The order is not stylistic. Each step produces the input the next one needs, so
skipping one means inventing that input later — usually in the wrong layer.

```
spec → domain test → domain → service → action → UI → docs
```

Read `src/features/projects/` alongside this guide; it is the same walkthrough
in code.

## 0. Branch

```bash
git fetch origin && git checkout develop && git pull
git checkout -b feat/<name>
```

## 1. Spec

Copy `docs/specs/_template.md`, fill in the rules and the acceptance criteria,
add it to the table in `docs/README.md`.

If the rules are obvious, this takes ten minutes. If they are not, you have
just discovered the actual work — and it is much cheaper to discover it here
than three layers down. Ambiguity that survives this step gets resolved by
whoever writes the code, silently, usually wrongly.

## 2. Domain tests

```ts
// src/features/<name>/domain/<thing>.test.ts
describe("prepareThingName", () => {
  it("collapses internal whitespace before validating", () => {
    expect(prepareThingName("  My   Thing ", [])).toBe("My Thing");
  });

  it("rejects a duplicate case-insensitively", () => {
    expect(() => prepareThingName("thing", [{ id: "1", name: "Thing" }]))
      .toThrow(ConflictError);
  });
});
```

One test per acceptance criterion. Name them after the behaviour, not the
function — the test list should read as the spec.

**Run them and watch them fail.** A test that has never failed has not been
shown to test anything.

## 3. Domain

```ts
// src/features/<name>/domain/<thing>.ts
import { ConflictError, ValidationError } from "@/domain";
```

Pure. No Prisma, no React, no Next, no `Date.now()`, no `Math.random()`, no
environment access. Anything ambient is a parameter — that is exactly what
makes the tests above possible without mocks.

Throw the shared errors from `src/domain/errors.ts` with a stable `code`
(`thing.name_taken`). The action layer translates them; the domain does not
decide copy.

Green now.

## 4. Schema

```ts
// src/features/<name>/schemas/index.ts
export const createThingSchema = z.object({
  workspaceId: z.string().min(1),
  name: z.string().min(2).max(80),
});
```

Zod guards the shape at the boundary. It does **not** own business rules: a
rule expressed only in Zod cannot be unit-tested without constructing a
request, and cannot be reused by a service. Overlap on length is fine and
useful — the client gets fast feedback, the domain keeps the guarantee.

## 5. Service

```ts
// src/features/<name>/services/index.ts
import "server-only";
```

The only layer allowed to call Prisma. It loads rows, hands them to the domain,
persists the result.

Every query filters by `workspaceId`. Every write is scoped by it too — an
`update` keyed only on `id` will happily modify another tenant's row, and that
is the single most likely serious bug in a multi-tenant codebase.

Services contain no rules. If you find yourself writing a condition here, ask
whether it belongs in `domain/`; it usually does.

## 6. Action

```ts
"use server";

export const createThingAction = defineWorkspaceAction({
  input: createThingSchema,
  handler: async ({ input, ctx }) => {
    assertCanWrite(ctx.role);
    await createThing({ workspaceId: ctx.workspaceId, name: input.name });
    revalidatePath("/things");
  },
});
```

`defineWorkspaceAction` has already authenticated the caller, parsed the input
and resolved the membership before the handler runs, and maps thrown
`DomainError`s to an `ActionResult` afterwards. Never write those four steps by
hand — that is how one of them ends up missing.

Use `defineAction` when the operation is not workspace-scoped (profile,
account settings).

## 7. UI

Server Component for reading, `"use client"` only where interaction requires
it.

- Semantic tokens only. No hex, no `zinc-*`.
- Mobile-first: base styles are the phone, `sm:` / `md:` enrich upward.
- Forms: React Hook Form + `zodResolver`, `mode: "onSubmit"`.
- `loading.tsx` for every new `(app)` segment.
- New nav destinations go in `nav-config.ts` so they are prefetched.
- No business rules. If a component computes something a spec describes, that
  computation belongs in `domain/`.

Branch on the result:

```tsx
const result = await createThingAction(values);
if (!result.ok) {
  toast.error(result.error);
  return;
}
```

## 8. Verify

```bash
npm run verify   # typecheck + lint + test
```

## 9. Docs

Update whatever the change made untrue: the spec, `domain-model.md`, the ADR
index. A stale document is worse than a missing one, because an agent trusts it.

If the change was an architectural choice with a real trade-off, write an ADR.

## 10. PR

Conventional Commit title targeting `develop`. Then delete the branch and
prune.

---

## Where things go

| It is… | It lives in… |
|--------|-------------|
| A calculation or an invariant | `features/<name>/domain/` |
| A rule shared by several features | `src/domain/` |
| A database read or write | `features/<name>/services/` |
| The authenticated entry point | `features/<name>/actions/` |
| Input shape validation | `features/<name>/schemas/` |
| Presentation | `features/<name>/components/` |
| A route | `src/app/` — thin, delegating |

Cross-feature reuse goes through `src/domain/` or `src/lib/`. A feature must
never import another feature's `services/`: that is a hidden coupling the
folder structure is specifically there to prevent.
