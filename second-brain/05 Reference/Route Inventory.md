---
type: reference
status: active
updated: 2026-08-16
tags:
  - routes
  - expo-router
---

# Route inventory

This inventory is the routing contract for the mobile client. Route groups do
not add URL segments.

## Access boundaries

| Route owner | Access | Guard location |
| --- | --- | --- |
| Entry and `(public)` | Everyone | None |
| `(auth)` | Signed-out users | Root stack |
| `student` and `checkout` | Learner | Shared guard at each tree layout |
| `instructor` | Instructor | Shared guard at the tree layout |
| `school` | Driving school | Shared guard at the tree layout |
| `unsupported-role` | Legacy guardian/admin | Shared guard at the route |

The school layout adds a second, domain-specific verification gate. Draft,
pending, rejected, and suspended schools remain in `/school/onboarding/*`.

## Entry and public routes

| Route | Purpose |
| --- | --- |
| `/` | Native/web splash and session handoff |
| `/onboarding` | First-run introduction |
| `/welcome` | Public Explore-or-sign-in choice |
| `/location` | Public location consent |
| `/explore` | Public school discovery |
| `/explore/:schoolId` | Public school profile |
| `/explore/:schoolId/instructors` | Public instructor catalogue |
| `/explore/:schoolId/vehicles` | Public vehicle catalogue |
| `/explore/:schoolId/packages` | Public package catalogue |
| `/track/:shareToken` | Public, expiring live-location view |

## Authentication routes

| Route | Purpose |
| --- | --- |
| `/login` | Sign in and protected-action handoff |
| `/signup` | Learner registration |
| `/school-signup` | Driving-school administrator registration |
| `/verify-email` | Email verification |
| `/google-onboarding` | Complete a Google registration |
| `/forgot-password` | Request password reset |
| `/reset-password` | Complete password reset |

## Learner checkout

Checkout is a sibling of the learner tabs, never a child of Explore.

| Route | Purpose |
| --- | --- |
| `/checkout/:schoolId/payment` | Payment method |
| `/checkout/:schoolId/review` | Purchase review |
| `/checkout/:schoolId/result` | Purchase result |
| `/checkout/payment-return` | External provider callback |

## Learner routes

| Route | Purpose |
| --- | --- |
| `/student` | Dashboard tab |
| `/student/explore` | Authenticated discovery tab |
| `/student/explore/:schoolId` | School profile inside Explore |
| `/student/explore/:schoolId/instructors` | Instructor catalogue |
| `/student/explore/:schoolId/vehicles` | Vehicle catalogue |
| `/student/explore/:schoolId/packages` | Package selection |
| `/student/sessions` | Sessions tab |
| `/student/sessions/book` | Lesson booking flow |
| `/student/sessions/confirmation` | Booking confirmation |
| `/student/sessions/history` | Booking history |
| `/student/sessions/:bookingId` | Booking detail |
| `/student/sessions/:bookingId/reschedule` | Reschedule booking |
| `/student/sessions/:bookingId/live-location` | Live-location controls |
| `/student/sessions/package/:bookingId` | Package booking detail |
| `/student/progress` | Progress tab |
| `/student/progress/assessments` | Assigned assessments |
| `/student/progress/assessments/:assignmentId` | Assessment attempt |
| `/student/progress/history` | Lesson history |
| `/student/progress/history/:lessonId` | Lesson history detail |
| `/student/profile` | Profile tab |
| `/student/profile/account` | Account details |
| `/student/profile/inbox` | Notification inbox |
| `/student/profile/notifications` | Notification preferences |
| `/student/profile/location` | Location preferences |
| `/student/profile/help` | Help centre |
| `/student/profile/support` | Support request |

## Instructor routes

| Route | Purpose |
| --- | --- |
| `/instructor` | Dashboard tab |
| `/instructor/schedule` | Schedule tab |
| `/instructor/schedule/:lessonId` | Scheduled lesson detail |
| `/instructor/attendance` | Attendance tab |
| `/instructor/availability` | Availability tab |
| `/instructor/sessions/:lessonId` | Active lesson flow |
| `/instructor/sessions/:lessonId/report` | Lesson report |
| `/instructor/profile` | Profile tab |
| `/instructor/profile/account` | Account details |
| `/instructor/profile/security` | Security settings |
| `/instructor/profile/notifications` | Notification preferences |
| `/instructor/profile/location` | Location settings |
| `/instructor/profile/help` | Help centre |
| `/instructor/profile/support` | Support request |

## School routes

Instructor, learner, and booking details remain inside their owning tab stacks.
Operational tools are pushed by the school root stack and do not create tabs.

| Route | Purpose |
| --- | --- |
| `/school` | Dashboard tab |
| `/school/bookings` | Bookings tab |
| `/school/bookings/:bookingId` | Booking detail |
| `/school/bookings/:bookingId/reschedule` | Reschedule booking |
| `/school/bookings/:bookingId/cancel` | Cancel booking |
| `/school/learners` | Learners tab |
| `/school/learners/:learnerId` | Learner detail |
| `/school/learners/assessments` | Assessment assignments |
| `/school/learners/assessments/new` | New assessment assignment |
| `/school/instructors` | Instructors tab |
| `/school/instructors/:instructorId` | Instructor detail |
| `/school/instructors/:instructorId/edit` | Edit instructor |
| `/school/instructors/invite` | Invite instructor |
| `/school/more` | Management tab |
| `/school/onboarding` | School application |
| `/school/onboarding/documents` | Verification documents |
| `/school/onboarding/review` | Verification review/status |
| `/school/profile` | School profile |
| `/school/verification-documents` | Approved-school document maintenance |
| `/school/monitoring` | Active lesson monitoring |
| `/school/operations` | Operations overview |
| `/school/operations/vehicles` | Vehicle inventory |
| `/school/operations/vehicles/new` | Add vehicle |
| `/school/operations/vehicles/:vehicleId` | Vehicle detail |
| `/school/operations/vehicles/:vehicleId/edit` | Edit vehicle |
| `/school/operations/packages` | Package inventory |
| `/school/operations/packages/new` | Add package |
| `/school/operations/packages/:packageId` | Package detail |
| `/school/operations/schedule` | Generated lesson schedule |
| `/school/operations/schedule/new` | Create timetable |
| `/school/operations/schedule/timetables` | Timetable management |
| `/school/operations/schedule/:sessionId` | Scheduled session detail |
| `/school/operations/schedule/:timetableId/edit` | Edit timetable |

## Unsupported authenticated roles

`guardian` and `admin` remain legacy server roles but have no client workspace.
They resolve to `/unsupported-role`, where the user can sign out, instead of
being sent into the public marketplace with an authenticated session.

Related: [[02 Architecture/Navigation and Route Map]]
