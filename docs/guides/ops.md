# Ops and ship gate

What has to be true before `develop` is merged to `main`.

## Ship checklist

- [ ] `npm run verify` green locally (typecheck, lint, test, `npm audit --audit-level=high`)
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

## Releases

See [changelog.md](./changelog.md) and [git-flow.md](./git-flow.md). Do not
edit `package.json` version by hand.
