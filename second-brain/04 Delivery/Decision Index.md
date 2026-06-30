---
type: decision-index
status: active
updated: 2026-06-30
tags:
  - decisions
  - adr
---

# Decision index

The historical ADR source is `../docs/decisions.md`.

## Accepted direction

| Decision              | Summary                                                                  |
| --------------------- | ------------------------------------------------------------------------ |
| Single multi-role app | One codebase with role-specific route trees                              |
| Server-enforced RBAC  | Client routing is UX-level protection                                    |
| Expo Router           | Filesystem routes and nested layouts are the navigation source           |
| Feature organization  | Shared domain UI in `src/features`; cross-cutting UI in `src/components` |
| Public marketplace    | Discovery is public; transactions and personal data are protected        |
| Checkout ownership    | Protected checkout is a sibling of learner tabs                          |
| State split           | TanStack Query for server data, Zustand for client state                 |
| Token storage         | Planned access/refresh credentials in SecureStore                        |
| Styling               | NativeWind plus shared theme tokens                                      |
| Nigeria-first         | NGN, Nigerian location defaults, FRSC trust signal                       |
| Payment abstraction   | Provider secrets and verification remain on backend                      |

## Product decisions established through implementation

- Avoid overengineering at all costs; choose the simplest correct implementation.
- A learner may own multiple packages.
- Total session balance is an aggregate view.
- Credits remain associated with their package purchase.
- Booking starts after package selection.
- Booking steps are schedule, instructor, and review.
- Password recovery uses OTP.
- Figtree is the default product-screen typeface.

## Decisions still required

- `learner` versus `student` terminology
- credit reservation, cancellation, refund, and expiry rules
- instructor assignment policy
- availability/hold semantics
- package repurchase and concurrent ownership rules
- backend contract ownership and versioning

Use [[06 Templates/ADR Template]] for new durable decisions.

Related: [[04 Delivery/Open Questions and Risks]],
[[01 Product/Domain Model]]
