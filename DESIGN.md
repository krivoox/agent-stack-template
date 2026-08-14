# Design system

The rules an agent must follow to produce interface work that looks like it
belongs. Tokens are defined in `src/app/globals.css`; that file is the
implementation, this one is the reasoning.

## 1. Principles

**Content first, chrome last.** A surface exists to carry information. Borders,
shadows and background tints are there to group things — never to decorate. If
removing an element changes nothing about comprehension, remove it.

**Colour is meaning.** Surfaces are achromatic: white, grey, charcoal. Colour
appears only when it says something — a state, a category, a warning. A blue
button next to a blue heading next to a blue border teaches nothing.

**One accent per view.** If everything is emphasised, nothing is.

**Density over drama.** Data-dense products are read, not admired. Prefer a
compact table to a grid of large cards.

## 2. Colour

### Never write a colour

Forbidden in product code, without exception:

```tsx
❌ className="bg-[#0f172a]"
❌ className="text-zinc-500"
❌ className="border-blue-200"
❌ style={{ color: "rgb(15 23 42)" }}
```

Every colour is a semantic token:

```tsx
✅ className="bg-card text-card-foreground border-border"
✅ className="text-muted-foreground"
✅ className="bg-success-muted text-success"
```

The reason is not tidiness. A hardcoded colour is invisible to dark mode, to
theming and to a future palette change — and it will be found only by someone
looking at the wrong-coloured pixel months later.

### The token set

| Group | Tokens | Use |
|-------|--------|-----|
| Surface | `background`, `card`, `popover`, `sidebar` | Backgrounds, in ascending elevation |
| Text | `foreground`, `muted-foreground` | Primary and secondary text |
| Action | `primary`, `secondary`, `accent` | Buttons and interactive fills |
| Structure | `border`, `input`, `ring` | Edges and focus |
| State | `info`, `success`, `warning`, `destructive` | Meaning, each with `-foreground` and most with `-muted` |
| Data | `chart-1` … `chart-5` | Series colours, in order |

`-muted` variants are tinted backgrounds for badges and callouts; the base
variant is for text and solid fills.

### Adding a domain accent

A finance product needs income and expense; a logistics one needs in-transit
and delivered. Add the token, do not inline the colour:

```css
:root  { --income: oklch(0.52 0.14 155); --income-muted: oklch(0.94 0.045 155); }
.dark  { --income: oklch(0.76 0.10 155); --income-muted: oklch(0.26 0.04 155); }

@theme inline {
  --color-income: var(--income);
  --color-income-muted: var(--income-muted);
}
```

Define both modes at the same time. A token that only exists in light mode is a
dark-mode bug that ships.

## 3. Mobile-first

**Base styles target a phone.** Breakpoint prefixes only ever add.

```tsx
✅ <div className="flex flex-col gap-4 md:flex-row md:gap-6">
❌ <div className="flex flex-row gap-6 max-md:flex-col">
```

Writing desktop-first with `max-*` inverts the cascade and makes the small
screen the exception — which is how the small screen ends up broken.

| Prefix | From | Typical shift |
|--------|------|---------------|
| — | 0 | Single column, tab bar, full-width sheets |
| `sm:` | 640px | Two columns where it helps |
| `md:` | 768px | Sidebar appears, tab bar hides |
| `lg:` | 1024px | Wider content, more columns |

Touch targets are at least 44×44px. Primary actions sit within thumb reach —
bottom of a sheet, not the top-right of a scrolled page.

## 4. Layout

`AppShell` provides the persistent frame: sidebar on desktop, tab bar on
mobile. It does not remount on navigation, which is what makes soft navigation
feel instant.

Inside it:

- `ContentPanel` — the page container, with the standard padding and max width.
- `SurfaceSection` — a titled group of related content.
- `KpiTile` — a single metric. Every tile must carry a real number; a tile that
  shows a label and a dash is worse than no tile.
- `DataTable` — tabular data, with a mobile card fallback.

## 5. Forms

Forms are `FormSheet` — a side sheet on desktop, a bottom sheet on mobile.
Full-page forms are reserved for genuinely long flows.

- React Hook Form with `zodResolver`, `mode: "onSubmit"`. Validating on every
  keystroke means telling someone their email is invalid while they type it.
- One field per row on mobile.
- The label sits above the field. Placeholders are examples, not labels — they
  vanish exactly when the user needs them.
- Errors appear under the field, in `text-destructive`, saying what to do
  rather than what failed.
- The submit button shows a pending state and is disabled while submitting.
- Optional fields are marked. Required ones are not — in most forms the
  majority is required, so marking those is noise.

## 6. Typography

| Role | Classes |
|------|---------|
| Page title | `text-2xl font-semibold tracking-tight` |
| Section title | `text-lg font-semibold` |
| Body | `text-sm` |
| Secondary | `text-sm text-muted-foreground` |
| Metric | `text-2xl font-semibold tabular` |

The `tabular` utility fixes digit width. Without it, numbers in a column
visibly jitter as they update, which reads as instability.

## 7. Motion

Motion clarifies where something came from. It is never decoration.

- 150–200ms for state changes, 200–300ms for a sheet.
- Animate `transform` and `opacity`. Animating `width`, `height` or `top`
  forces layout on every frame.
- Respect `prefers-reduced-motion`.
- Nothing loops. A permanently animated element is a permanent distraction.

## 8. States

Every view that loads data defines four:

| State | Requirement |
|-------|-------------|
| Loading | A skeleton with the shape of the real content, not a spinner |
| Empty | Explain what goes here and offer the action that creates it |
| Error | What failed, and a way to retry |
| Populated | The actual content |

Skeletons live in `loading.tsx` so the shell renders immediately while the
segment streams.

## 9. Accessibility

- Every interactive element is reachable and operable by keyboard.
- Focus is visible — the `ring` token exists for this; never remove the outline
  without replacing it.
- Icon-only buttons carry an `aria-label`.
- Body text meets 4.5:1 contrast; the token pairs are built to.
- Colour never carries meaning alone. A red dot needs a label too.

## 10. Review checklist

- [ ] No hex, `rgb()`, `zinc-*`, `blue-*` in product code
- [ ] Base styles are the mobile layout; prefixes only add
- [ ] Loading, empty and error states exist
- [ ] Touch targets ≥ 44px
- [ ] Focus is visible on every interactive element
- [ ] Numbers use `tabular`
- [ ] shadcn primitive extended rather than reimplemented
- [ ] No business rule computed in a component
