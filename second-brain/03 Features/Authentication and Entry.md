---
type: feature
status: partial
updated: 2026-06-30
tags:
  - authentication
  - onboarding
---

# Authentication and entry

## Current screens

- Onboarding
- Location consent
- Welcome choice
- Login
- Sign up
- Forgot password
- Reset password

Auth screens share components from `src/components/auth` and use Figtree.
Password recovery is designed around OTP verification rather than an emailed
reset link.

Login includes a reusable role selector for learner, instructor, school, and
guardian access. Learner, instructor, and guardian route trees are available.
School remains visible but disabled until its route tree exists.

## Current route behavior

- Public browsing is available without authentication.
- Entering `(app)` while signed out redirects to `/login`.
- The protected layout passes an internal `returnTo` value.
- Login currently stores an in-memory authenticated flag and selected role in
  Zustand.
- Location consent uses Expo's foreground-permission hook and stores the current
  coordinates after permission is granted.

## Missing production behavior

- Form schemas and backend requests
- OTP request, verification, expiry, and retry handling
- Secure access/refresh token storage
- Session hydration during launch
- Token refresh and coordinated logout
- Authenticated user and role resolution
- Safe `returnTo` validation
- Social authentication integration

## Acceptance direction

1. Returning authenticated users should not see a login flash.
2. A public visitor can browse without an account.
3. A protected action resumes after successful authentication.
4. Expired sessions recover once or sign out cleanly.
5. Credentials and tokens never live in plain local storage.

Related: [[03 Features/Public Marketplace]],
[[02 Architecture/State and Data]], [[01 Product/Core Journeys]]
