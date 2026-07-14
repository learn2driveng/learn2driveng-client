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
  App --> Instructor[instructor tabs]
  App --> Guardian[guardian tabs]
  Student --> Home
  Student --> Explore
  Student --> Sessions
  Student --> Progress
  Student --> Profile
  Instructor --> InstructorHome[Home]
  Instructor --> Schedule
  Instructor --> Availability
  Instructor --> InstructorProfile[Profile]
  Guardian --> GuardianHome[Home]
  Guardian --> GuardianActivity[Activity]
  Guardian --> GuardianProfile[Profile]
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

## Instructor tabs

| Tab          | URL                        | Purpose                                      |
| ------------ | -------------------------- | -------------------------------------------- |
| Home         | `/instructor`              | Availability, next lesson, daily summary     |
| Schedule     | `/instructor/schedule`     | Assigned lessons and future lesson details   |
| Availability | `/instructor/availability` | Teaching hours and unavailable dates         |
| Profile      | `/instructor/profile`      | School affiliation, verification and account |

## Guardian tabs

| Tab      | URL                  | Purpose                                      |
| -------- | -------------------- | -------------------------------------------- |
| Home     | `/guardian`          | Linked learners and active-session status    |
| Activity | `/guardian/activity` | Shared session history and progress activity |
| Profile  | `/guardian/profile`  | Guardian account and preferences             |

Linked-learner detail lives at `/guardian/learners/:learnerId` and is hidden
from the tab bar. Active-session tracking lives at
`/guardian/sessions/:sessionId` and is also hidden from the tab bar.

## School routes

`/school-signup` creates a draft administrator application. Draft,
pending-review, and suspended schools are confined to `/school/onboarding/*`;
the operational routes below require `verified` status.

| Route                 | Purpose                                             | Tab visibility |
| --------------------- | --------------------------------------------------- | -------------- |
| `/school`             | School operations overview                          | Home           |
| `/school/bookings`    | Lesson assignment queue                             | Bookings       |
| `/school/instructors` | Instructor roster, onboarding, and invite lifecycle | Instructors    |
| `/school/more`        | School management destinations                      | More           |
| `/school/profile`     | School profile and verification maintenance         | Hidden         |
| `/school/operations`  | Vehicle and package operations                      | Hidden         |
| `/school/monitoring`  | Active lesson operational monitoring                | Hidden         |

Instructor and booking detail routes stay within their parent tabs. Profile,
fleet, package, and other operational child routes are reached through More and
do not create additional tab buttons.

See the complete file mapping in [[05 Reference/Route Inventory]].

Related: [[03 Features/Public Marketplace]], [[03 Features/Checkout]],
[[03 Features/Session Booking]]
