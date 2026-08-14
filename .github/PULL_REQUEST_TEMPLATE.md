<!--
The title must be a Conventional Commit — merges are squashed, so the title is
the message that lands on develop and feeds the changelog.

  feat(projects): add archive action
-->

## What changed

One or two sentences on the behaviour, not the diff. A reviewer can read the
files; what they cannot read is your intent.

## Why

The problem this solves. Link the spec or the issue.

Spec: `docs/specs/NN-….md`

## Trade-offs

Anything you chose against, and why. Skip only if there genuinely was no
alternative worth considering.

## Checklist

- [ ] Branched from an updated `develop`; PR targets `develop`
- [ ] Spec read, updated, or added if the rules changed
- [ ] Domain tests written first and passing for every new rule
- [ ] No business logic in components, actions or services
- [ ] No UI tests added
- [ ] Every Server Action goes through `defineAction` / `defineWorkspaceAction`
- [ ] Every new table carries `workspaceId` + index + `onDelete: Cascade`
- [ ] Every new query filters by `workspaceId`
- [ ] No `process.env` outside `src/lib/env.ts`
- [ ] No hex / `zinc-*` / `blue-*` in product UI; semantic tokens only
- [ ] `loading.tsx` present for new `(app)` segments
- [ ] New nav destinations registered in `nav-config.ts`
- [ ] `npm run verify` green locally

## Screenshots

For UI changes: mobile and desktop, light and dark.
