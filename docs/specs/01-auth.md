# SPEC-01 — Authentication and profile

**Status:** Shipped

## Problem

Every tenant-scoped feature needs to know who is asking. Without identity there
is no workspace, and without a workspace there is nowhere to write.

## Scope

**In.** Email/password registration, sign-in, sign-out, password reset,
optional Google sign-in, and the profile fields the interface needs to address a
person by name.

**Out.** Email verification enforcement, two-factor, organisation-level SSO,
account deletion. Better Auth supports these; enable them when a product needs
them.

## Rules

1. Registration takes an email, a password and a name. The email is stored
   lower-cased and is unique.
2. A password is at least 8 characters. No composition rules — length is what
   correlates with strength, and arbitrary symbol requirements push people
   toward `Password1!`.
3. A **personal workspace is created as part of registration**
   ([ADR-003](../adr/003-workspace-tenancy.md)). A user without a workspace is
   not a valid state.
4. Sign-in with an unknown email and sign-in with a wrong password fail
   identically. A distinguishable error is an account-enumeration oracle.
5. Password reset always reports success, for the same reason. In development
   the reset URL is logged to the server console instead of emailed.
6. A reset token is single-use and expires. Consuming it invalidates the
   user's other sessions.
7. Google sign-in links to an existing account **when the provider asserts the
   email is verified**, and otherwise creates a separate account. Linking on an
   unverified claim lets an attacker take over an account by registering the
   address with a provider that does not check.
8. The display name falls back, in order: the explicit `displayName`, the
   account `name`, then the local part of the email. The interface never renders
   an empty name.
9. A timezone is validated against the runtime's IANA database rather than a
   hardcoded list, which would go stale.

## Authorisation

A user may read and update only their own profile. There is no admin surface
for other users' profiles in the template.

## Acceptance criteria

- **Given** a valid email, name and 8-character password
  **When** the person registers
  **Then** the account is created, a personal workspace exists for them, and
  they land on the dashboard already signed in.

- **Given** an email already registered
  **When** someone registers with it again
  **Then** the operation fails without revealing whether the address exists.

- **Given** a signed-in user
  **When** they submit a display name of `"  Ada  "`
  **Then** the stored value is `"Ada"` and the header updates on the next render.

- **Given** a display name of one character
  **When** they submit
  **Then** the form rejects it client-side and the action rejects it server-side.
  Both checks are required; the client one is a courtesy, the server one is the
  guarantee.

- **Given** a used or expired reset token
  **When** it is submitted again
  **Then** the reset fails and the password is unchanged.

## Edge cases

- **Sign-up race on the same email.** The unique constraint decides; the loser
  gets the same generic failure.
- **OAuth cancelled at the provider.** The user returns to `/login` with a
  toast, not a stack trace.
- **Session expiring mid-request.** Middleware redirects to `/login` with the
  attempted path preserved.
- **Invalid stored timezone** (renamed in the tz database): reads fall back to
  UTC rather than throwing.
