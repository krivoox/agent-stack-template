# SPEC-NN — <Feature name>

**Status:** Draft | Accepted | Shipped
**Owner:** <who decides when this is ambiguous>

> Copy this file, keep the headings, delete this quote.
>
> A spec describes **what must be true**, not how to build it. If you find
> yourself naming a component or a table, you are writing the wrong document —
> that belongs in the PR.
>
> **Draft is not implementable.** Product code starts only when Status is
> Accepted. Shipped means the acceptance criteria are true in `main`. The
> `develop` → `main` release PR flips Accepted → Shipped — not the feature PR.

## Problem

Who has the problem, and what does it cost them today? One paragraph. If you
cannot name the user, the feature is speculative.

## Scope

**In.** The behaviour this spec is responsible for.

**Out.** The adjacent things people will assume are included. Being explicit
here prevents scope drift more effectively than anything else in the document.

## Rules

Numbered, testable statements. Each one should be falsifiable by reading the
code, and most should map to a domain test.

1. …
2. …

Prefer the specific over the safe:

- ✅ "A name is 1–80 characters after trimming and must be unique per
  workspace, compared case-insensitively."
- ❌ "Names should be reasonable and unique."

## Authorisation

| Role | Read | Create | Update | Delete |
|------|:----:|:------:|:------:|:------:|
| `owner` | | | | |
| `admin` | | | | |
| `member` | | | | |
| `viewer` | | | | |

## Acceptance criteria

Given / When / Then. These become the test names, so write them as the
behaviour, not as the implementation.

- **Given** an active workspace and a `member`
  **When** they create an item named `"  Roadmap  "`
  **Then** it is stored as `"Roadmap"` and appears at the top of the list.

- **Given** an existing item named `"roadmap"`
  **When** a member creates `"Roadmap"`
  **Then** the operation is rejected with `project.name_taken`.

## Edge cases

The ones a reviewer would otherwise have to ask about: empty state, the maximum
size, concurrent writes, deleted references, timezone boundaries, an actor who
loses access mid-operation.

## Open questions

Anything blocking. Resolve these before implementing — an agent that reaches an
open question will otherwise invent an answer.
