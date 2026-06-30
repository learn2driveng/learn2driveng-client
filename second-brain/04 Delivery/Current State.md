---
type: delivery
status: active
updated: 2026-06-30
tags:
  - status
  - delivery
---

# Current state

## Snapshot

The app has a strong learner-facing presentation layer and a coherent
public-to-purchase-to-booking route structure. Most business data and actions
are still local fixtures or UI state.

## Implemented in the client

| Area                                                  | State                             |
| ----------------------------------------------------- | --------------------------------- |
| Root Expo Router and safe-area/font/theme bootstrap   | Implemented                       |
| Onboarding, location consent, welcome choice          | Implemented UI                    |
| Login, sign-up, OTP recovery/reset                    | Implemented UI                    |
| Public school marketplace                             | Implemented with local typed data |
| Shared public/authenticated discovery screens         | Implemented                       |
| Protected root checkout flow                          | Implemented UI with local data    |
| Learner tabs and dashboard                            | Implemented UI                    |
| No-package and zero-credit learner states             | Implemented UI                    |
| Expired-package display and booking prevention        | Implemented UI                    |
| Package-aware session booking                         | Implemented UI                    |
| Booking history/detail/reschedule/cancel/confirmation | Implemented with local typed data |
| Booking cancellation confirmation sheet               | Implemented UI                    |
| Notification centre and preferences handoff           | Implemented UI                    |
| Help centre, contact and problem-report flows         | Implemented UI                    |
| Shared dashboard accessibility and interaction pass   | Implemented                       |
| Student-flow screen accessibility pass                | Implemented                       |
| Dedicated sample-data boundary                        | Implemented                       |
| Progress overview                                     | Implemented UI                    |
| Profile/account/notifications/location                | Mostly implemented UI             |
| Light/dark theme resolution                           | Implemented                       |

## Not production-ready

| Area           | Gap                                                                                 |
| -------------- | ----------------------------------------------------------------------------------- |
| Authentication | In-memory boolean only; no API, secure tokens, hydration, refresh, or role resolver |
| Server data    | No HTTP client, TanStack Query dependency, query keys, or endpoint hooks            |
| Payments       | Presentation only; no provider/backend verification                                 |
| Booking        | Local choices; no availability, holds, credit ledger, or mutations                  |
| Progress       | Static data; no session/report source                                               |
| Other roles    | No guardian, instructor, school-admin, or platform-admin route trees                |
| Realtime       | No socket service or live location lifecycle                                        |
| Notifications  | No infrastructure                                                                   |
| Maps           | No map implementation                                                               |
| Tests          | No test runner or test suite in current package scripts                             |

## Current source-data fixtures

- `src/sample_data/schools.ts`
- `src/sample_data/bookings.ts`
- `src/sample_data/student-packages.ts`

## Documentation warning

The root planning documents contain intended dependencies and modules that do
not yet exist. For implementation truth, inspect `package.json` and `src/`.

Related: [[04 Delivery/Roadmap]], [[02 Architecture/State and Data]],
[[05 Reference/Source Map]]
