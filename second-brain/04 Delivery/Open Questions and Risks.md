---
type: risk-register
status: active
updated: 2026-06-30
tags:
  - risks
  - questions
---

# Open questions and risks

## Product questions

- Can a learner hold repeated purchases of the same package?
- Do credits expire? If yes, from purchase, activation, or first lesson?
- When is a credit reserved: slot selection, review, or confirmation?
- What restores a credit after cancellation, school cancellation, or no-show?
- Can learners choose instructors, express a preference, or only accept assignment?
- Are vehicles selected directly or inferred from package/transmission?
- Can one booking span more than one session credit?
- What happens when package curriculum changes after purchase?

## Architecture risks

| Risk                                       | Impact                                        | Mitigation direction                             |
| ------------------------------------------ | --------------------------------------------- | ------------------------------------------------ |
| Docs overstate implementation              | Work may assume missing infrastructure exists | Keep [[04 Delivery/Current State]] current       |
| In-memory auth                             | Protected UX resets and is not secure         | Implement SecureStore hydration and backend auth |
| Fixture IDs/names used as navigation truth | Breaks when API data arrives                  | Pass stable IDs and query detail                 |
| Package name passed into booking           | Name is mutable and ambiguous                 | Pass package-purchase ID                         |
| Static availability                        | Cannot prevent double-booking                 | Backend slot holds and atomic confirmation       |
| Aggregate credit treated as wallet         | Wrong package may be debited                  | Package-purchase-specific ledger                 |
| Mixed typography                           | Product feels inconsistent                    | Use [[02 Architecture/Design System]]            |
| Multi-role duplication                     | Models and logic drift                        | Shared domain contracts and feature services     |
| `returnTo` misuse                          | Open redirects or invalid navigation          | Permit internal typed destinations only          |

## Delivery risks

- No automated tests currently protect route and business-flow changes.
- No API boundary means UI assumptions may harden before contracts are agreed.
- Payment and booking race conditions need backend-first design.
- Live tracking adds privacy, battery, permission, and reconnection complexity.

Related: [[04 Delivery/Roadmap]], [[03 Features/Session Booking]],
[[03 Features/Checkout]]
