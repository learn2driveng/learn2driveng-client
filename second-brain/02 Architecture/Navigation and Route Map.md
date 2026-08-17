---
type: architecture
status: active
updated: 2026-08-16
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
  App --> Unsupported[unsupported legacy roles]
  Student --> Home
  Student --> Explore
  Student --> Sessions
  Student --> Progress
  Student --> Profile
  Instructor --> InstructorHome[Home]
  Instructor --> Schedule
  Instructor --> Availability
  Instructor --> InstructorProfile[Profile]
```

## Ownership rules

1. Route groups do not add URL segments.
2. Public and authenticated Explore routes reuse the same screens from
   `src/features/school-discovery/screens`; their layouts provide the correct
   marketplace navigation context.
3. Checkout is a sibling of student tabs, never a child of Explore.
4. Session booking belongs to the Sessions stack.
5. Profile detail pages belong to the Profile stack.
6. Future role trees should mount beside `student`, not inside it.

## Authentication and role handoff

The root stack makes `(auth)` unavailable after authentication. Each top-level
protected tree uses the same `RoleRouteGuard`, placed where Expo Router exposes
the complete child URL. The guard preserves that URL as `returnTo`, redirects
signed-out users to `/login`, and sends wrong-role users to their own home.

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
| Attendance   | `/instructor/attendance`   | Attendance and outstanding lesson reports    |
| Availability | `/instructor/availability` | Teaching hours and unavailable dates         |
| Profile      | `/instructor/profile`      | School affiliation, verification and account |

## Unsupported legacy roles

Guardian and platform-admin accounts do not have client route trees. They land
on `/unsupported-role` instead of being routed to public `/welcome` while still
authenticated. Public live-location sharing remains at `/track/:shareToken`
and does not require a guardian account.

## School routes

`/school-signup` creates a draft administrator application. Draft,
pending-review, and suspended schools are confined to `/school/onboarding/*`;
the operational routes below require `approved` status.

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
