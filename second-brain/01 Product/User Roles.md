---
type: product
status: active
updated: 2026-06-30
tags:
  - roles
  - rbac
---

# User roles

The planned role union is defined in `../src/types/auth.ts`.

| Role                   | Code             | Primary need                                        | Current UI            |
| ---------------------- | ---------------- | --------------------------------------------------- | --------------------- |
| Learner/student        | `learner`        | Discover, purchase, book, train, track progress     | Active implementation |
| Guardian               | `guardian`       | Monitor linked learner sessions and progress        | Planned               |
| Instructor             | `instructor`     | Manage availability and conduct assigned sessions   | Planned               |
| School administrator   | `school_admin`   | Manage staff, fleet, packages, bookings, operations | Planned               |
| Platform administrator | `platform_admin` | Approve schools and oversee platform trust/safety   | Planned               |

## RBAC rule

The backend must enforce all authorization. Route guards in the app improve UX
but are not a security boundary.

## Naming decision needed

The code currently mixes “student” in routes with `learner` in the role union
and project documentation. Pick one product term and document whether route
migration is worthwhile before more role trees are added.

Related: [[03 Features/Future Role Dashboards]],
[[04 Delivery/Open Questions and Risks]], [[04 Delivery/Decision Index]]
