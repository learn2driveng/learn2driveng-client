---
type: architecture
status: active
updated: 2026-06-30
tags:
  - navigation
  - expo-router
---

# Navigation and route map

## Root groups

```mermaid
flowchart TD
  Root[src/app/_layout] --> Entry[index and onboarding]
  Root --> Public[(public)]
  Root --> Auth[(auth)]
  Root --> App[(app) protected]
  App --> Checkout[checkout stack]
  App --> Student[student tabs]
  Student --> Home
  Student --> Explore
  Student --> Sessions
  Student --> Progress
  Student --> Profile
```

## Ownership rules

1. Route groups do not add URL segments.
2. Public and authenticated Explore routes reuse the same screens from
   `src/features/school-discovery/screens`.
3. Checkout is a sibling of student tabs, never a child of Explore.
4. Session booking belongs to the Sessions stack.
5. Profile detail pages belong to the Profile stack.
6. Future role trees should mount beside `student`, not inside it.

## Authentication handoff

The protected `(app)` layout builds a `returnTo` path from pathname and string
query parameters, then redirects unauthenticated users to `/login`.

Security note: only validated internal destinations should be honored when the
login flow resumes.

## Learner tabs

| Tab      | URL                 | Purpose                                                  |
| -------- | ------------------- | -------------------------------------------------------- |
| Home     | `/student`          | Balance, active packages, upcoming lesson, quick actions |
| Explore  | `/student/explore`  | Authenticated access to shared school discovery          |
| Sessions | `/student/sessions` | Package balances, bookings, booking workflow             |
| Progress | `/student/progress` | Training statistics and progress                         |
| Profile  | `/student/profile`  | Account, notifications, location, appearance, support    |

See the complete file mapping in [[05 Reference/Route Inventory]].

Related: [[03 Features/Public Marketplace]], [[03 Features/Checkout]],
[[03 Features/Session Booking]]
