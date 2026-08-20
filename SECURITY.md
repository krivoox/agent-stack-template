# Security policy

## Supported versions

This repository is a template. Security fixes land on `develop` and ship in
the next GitHub Release on `main`. Use the latest tagged release.

| Version | Supported |
|---------|-----------|
| Latest `v*` release | Yes |
| Unreleased `develop` | Yes (report against HEAD) |
| Older tags | No — rebase onto the latest release |

## Reporting a vulnerability

**Do not open a public issue.**

1. Open a private [GitHub Security advisory](https://github.com/krivoox/agent-stack-template/security/advisories/new).
2. Include the impact, a reproduction if you have one, and affected versions
   or commits.
3. You should hear back within 7 days. If the report is accepted, a fix is
   prepared on a private branch and credited in the advisory unless you ask
   otherwise.

Good-faith research against a local clone is welcome. Do not probe a
deployment you do not own.

## Scope

In scope: authentication, workspace tenancy isolation, Server Actions,
secrets handling, dependency CVEs that affect this template.

Out of scope: issues that only exist after someone has customised a fork,
and theoretical findings without a realistic path to user data.
