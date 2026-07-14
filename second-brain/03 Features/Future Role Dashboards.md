---
type: feature
status: planned
updated: 2026-06-30
tags:
  - guardian
  - instructor
  - school-admin
  - platform-admin
---

# Future role dashboards

The instructor route tree and dashboard foundation now exist. The remaining
instructor operations and other role experiences are planned.

## Recommended implementation order

### 1. Instructor

Instructor operations complete the learner's session lifecycle:

- assigned schedule
- availability
- booking detail
- start/end lesson
- attendance
- progress report

Current UI includes role-aware login, Home, Schedule, Availability, and Profile
tabs, the instructor dashboard, and a dated assigned schedule with status
filters and empty-day handling. Lesson detail now covers the full assignment and
pre-lesson brief. The session UI now covers gated pre-lesson checks, an active
timer, end confirmation, and completion. Attendance and reporting now cover
presence, skill assessment, notes, next-focus guidance, and confirmation.
Availability covers assignment status, weekly teaching shifts, time-off dates,
and save confirmation. Profile now covers account and instructor details,
notifications, location, security, help requests, and logout.
The instructor flow has also received an empty-state, interaction-consistency,
and accessibility pass.

Starting and ending a lesson now updates one shared local training-session
store, and all instructor schedule surfaces reflect that status. The store also
prevents two lessons from being active simultaneously. Live-location sharing
remains controlled by the learner and visible only to an attached guardian; it
is not an instructor broadcast responsibility.

### 2. Guardian

Guardian value depends on active instructor/session data:

- linked learners
- active-session status
- learner-shared live location during an active session
- session history
- progress view
- safety notifications

The guarded Guardian tab shell now exists with Home, Activity, and Profile.
Shared types model guardian links, training-session lifecycle, and
learner-controlled location-sharing state. Home now presents typed linked
learners, package progress, upcoming sessions, privacy boundaries, genuine
empty handling, and learner detail.

The learner dashboard now surfaces an active lesson and links to explicit
per-session sharing controls. The learner selects linked guardians, approves
foreground location permission, sees sharing accuracy and failure feedback,
and can stop at any time. Sharing also stops when the instructor ends the
lesson. Foreground updates are published from the learner tab layout so they
survive navigation within the learner experience.

Guardian Home and learner detail now surface active sessions from the shared
store. The tracking route verifies the active guardian link and per-session
recipient list before showing a native map. Waiting, not-selected, unavailable,
stopped, stale/delayed, and ended states are distinct. Web receives a safe
coordinate fallback because the native map package targets Android and iOS.

The default Guardian fixtures seed Alex Jordan in an active lesson with a
fresh, guardian-authorized Lekki coordinate. This makes the map and active
session visible immediately while retaining genuine empty and failure branches
for later API responses. Fixture sharing does not start a device location
subscription; only learner consent does.

### 3. School administrator

Schools own instructor onboarding and operations. Instructors are not
independent marketplace operators in the MVP; a school admin invites, reviews,
and activates instructors before learner assignment.

- operational dashboard
- instructor invite, roster, activation, and availability oversight
- vehicles
- packages
- bookings and assignment
- learner roster with enrolment, instructor, lesson, and readiness oversight
- school-assigned, scenario-based learner readiness assessments
- active sessions
- profile and verification
- earnings/analytics later

### 4. Platform administrator

- school approval and suspension
- trust and safety
- user/incident oversight
- platform analytics

## Shared-domain principle

Do not create unrelated copies of booking/session models per role. All role
screens should consume role-appropriate projections of the same backend
entities and events.

Related: [[01 Product/User Roles]], [[01 Product/Domain Model]],
[[04 Delivery/Roadmap]]
