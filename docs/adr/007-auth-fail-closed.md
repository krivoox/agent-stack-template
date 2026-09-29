# ADR-007 — Auth defaults fail closed

**Status:** Accepted

## Context

The template shipped with convenience defaults that weaken production:

- `sendResetPassword` logged tokens and no-op'd in production
- `requireLocalEmailVerified: false` allowed linking Google onto an unverified password account
- `skipStateCookieCheck: true` dropped the OAuth state cookie to paper over iOS/PWA drops

## Decision

1. Mail goes through `src/lib/mail.ts`. Production without `RESEND_API_KEY` fails. Dev may log metadata (never the token). Password-reset UI is hidden when the mailer is not configured in production.
2. Account linking requires a verified local email (`requireLocalEmailVerified: true`). Relax only with `AUTH_RELAX_ACCOUNT_LINKING=1`.
3. OAuth state cookie stays on. Relax only with `AUTH_RELAX_OAUTH_STATE=1`.
4. Minimum password length is 12.

## Consequences

Preview/iOS OAuth may need the explicit relax flag. Password reset will not silently appear to work in production without a mailer.
