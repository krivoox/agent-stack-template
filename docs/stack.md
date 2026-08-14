# Stack

Fixed choices. Substituting one needs an ADR and the user's approval — not
because these are sacred, but because an agent silently swapping a library is
how a codebase ends up with three ways to do everything.

| Concern | Choice | Notes |
|---------|--------|-------|
| Framework | Next.js, App Router | This version may differ from your training data. Check `node_modules/next/dist/docs/`. |
| UI runtime | React, React Compiler on | Manual `memo` / `useMemo` is usually unnecessary. |
| Language | TypeScript, strict | Plus `noUncheckedIndexedAccess`. |
| Styling | Tailwind v4 | Tokens in `src/app/globals.css`. |
| Components | shadcn/ui + CVA | `src/components/ui/`. Extend with variants. |
| Icons | `lucide-react` | One icon library. Adding a second is a review comment. |
| Auth | **Better Auth** | Not NextAuth, not a database vendor's auth product. |
| ORM | **Prisma** | Client generated to `src/generated/prisma`. |
| Database | PostgreSQL | Any provider. |
| Validation | Zod | Same schema on client and server. |
| Forms | React Hook Form | With `@hookform/resolvers/zod`. |
| Server state | TanStack Query | Client islands only; lists stay RSC. |
| UI state | Zustand | **UI state only.** Server data belongs in RSC or Query. |
| Tests | Vitest | Domain only. |
| Dates | `date-fns` + `@date-fns/tz` | Explicit timezones. |
| Notifications | `sonner` | |
| Hosting | Vercel-shaped | Nothing depends on Vercel-only APIs. |

## Deliberate omissions

- **No state management library for server data.** RSC plus Server Actions
  covers it; adding Redux-shaped state for data the server already owns creates
  two sources of truth.
- **No component testing library.** See [ADR-004](./adr/004-tdd-domain-only.md).
- **No CSS-in-JS.** Tokens plus Tailwind, so the theme has one home.
- **No second icon or date library.** Duplicates cost bundle size and give
  agents an arbitrary choice to make on every file.

## Version discipline

Dependencies are pinned by `package-lock.json`. Upgrade deliberately, in its
own PR, with `npm run verify` green — not incidentally inside a feature branch.

## Environment variables

Declared in `src/lib/env.ts`, documented in `.env.example`.

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | production | Pooled connection |
| `DIRECT_URL` | production | Direct connection, migrations only |
| `BETTER_AUTH_SECRET` | production | Session signing, ≥ 32 chars |
| `BETTER_AUTH_URL` | optional | Canonical URL; derived on Vercel |
| `BETTER_AUTH_TRUSTED_ORIGINS` | optional | Extra CSRF origins, comma-separated |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | optional | Both or neither; the button hides without them |
| `PRISMA_LOG_QUERIES` | optional | `1` logs SQL in development |
| `CRON_SECRET` | optional | Bearer token for `/api/cron/*` |

No secret is ever committed. `.env.example` carries names and shapes only.
