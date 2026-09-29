# Ops and ship gate

What has to be true before `develop` is merged to `main`.

## Ship checklist

- [ ] `npm run verify` green locally (typecheck, lint, test, audit gate)
- [ ] Next is on a patched 16.3.x (16.3.6+). 16.2.9 is below the Sep 2026 RCE patch.
- [ ] CI green on the `develop` PR
- [ ] Specs whose behaviour is now on `main` move from Accepted → Shipped after the release PR
- [ ] `BETTER_AUTH_SECRET` is not the dev placeholder
- [ ] `RESEND_API_KEY` set if password reset is offered
- [ ] `CRON_SECRET` set if any `/api/cron/*` route is deployed
- [ ] Production does not set `AUTH_RELAX_*` unless an ADR says why
- [ ] Database migrations applied (`npm run db:deploy`)
- [ ] No pending invitation plaintext tokens (column is `tokenHash`)

## Cron

Handlers under `src/app/api/cron/` must call `assertCronAuth(request)` first.
Invoke with `Authorization: Bearer $CRON_SECRET`. Missing secret → 503.

## Mail

`src/lib/mail.ts` is the only sender. Production without `RESEND_API_KEY` fails
closed and hides reset UI.

## Audit

`npm run audit` runs `scripts/audit.mjs`. It fails on any **critical** advisory
and on **high** advisories that are not in the ignore list (Prisma CLI /
Vitest / other install-time tooling).

Do **not** run `npm audit fix --force` to clear Prisma findings: that
downgrades Prisma 7 → 6.

Bump Next to **16.3.6** in a follow-up (`npm install next@16.3.6 eslint-config-next@16.3.6`) so the critical `next/og` RCE is gone from the tree. The lockfile has to travel with that bump.

## Releases

See [changelog.md](./changelog.md) and [git-flow.md](./git-flow.md). Do not
edit `package.json` version by hand.
