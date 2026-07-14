---
type: reference
status: active
updated: 2026-06-30
tags:
  - routes
  - expo-router
---

# Route inventory

## Entry

| Route         | Source                   |
| ------------- | ------------------------ |
| `/`           | `src/app/index.tsx`      |
| `/onboarding` | `src/app/onboarding.tsx` |
| not found     | `src/app/+not-found.tsx` |

## Public

| Route                         | Source                                     |
| ----------------------------- | ------------------------------------------ |
| `/location`                   | `(public)/location.tsx`                    |
| `/welcome`                    | `(public)/welcome.tsx`                     |
| `/explore`                    | `(public)/explore/index.tsx`               |
| `/explore/:schoolId`          | `(public)/explore/[schoolId]/index.tsx`    |
| `/explore/:schoolId/packages` | `(public)/explore/[schoolId]/packages.tsx` |

## Authentication

| Route              | Source                       |
| ------------------ | ---------------------------- |
| `/login`           | `(auth)/login.tsx`           |
| `/signup`          | `(auth)/signup.tsx`          |
| `/school-signup`   | `(auth)/school-signup.tsx`   |
| `/forgot-password` | `(auth)/forgot-password.tsx` |
| `/reset-password`  | `(auth)/reset-password.tsx`  |

## Protected checkout

| Route                         | Source                                  |
| ----------------------------- | --------------------------------------- |
| `/checkout/:schoolId/payment` | `(app)/checkout/[schoolId]/payment.tsx` |
| `/checkout/:schoolId/review`  | `(app)/checkout/[schoolId]/review.tsx`  |
| `/checkout/:schoolId/result`  | `(app)/checkout/[schoolId]/result.tsx`  |

## Student tabs and details

| Route                                        | Purpose                           |
| -------------------------------------------- | --------------------------------- |
| `/student`                                   | Dashboard                         |
| `/student/explore`                           | Shared authenticated discovery    |
| `/student/explore/:schoolId`                 | School profile                    |
| `/student/explore/:schoolId/packages`        | Package selection                 |
| `/student/sessions`                          | Packages and bookings             |
| `/student/sessions/book`                     | Schedule/instructor/review wizard |
| `/student/sessions/confirmation`             | Booking confirmation              |
| `/student/sessions/history`                  | Booking history                   |
| `/student/sessions/:bookingId`               | Booking detail                    |
| `/student/sessions/:bookingId/reschedule`    | Rescheduling                      |
| `/student/sessions/:bookingId/live-location` | Learner live-location controls    |
| `/student/progress`                          | Progress overview                 |
| `/student/profile`                           | Profile/settings index            |
| `/student/profile/account`                   | Account detail                    |
| `/student/profile/help`                      | Help centre and FAQs              |
| `/student/profile/inbox`                     | Notification centre               |
| `/student/profile/notifications`             | Notification preferences          |
| `/student/profile/location`                  | Location preferences              |
| `/student/profile/guardians`                 | Safety contact management         |
| `/student/profile/guardians/new`             | Safety contact invite form        |
| `/student/profile/support`                   | Contact and problem-report form   |

## Instructor tabs

| Route                                   | Purpose                              |
| --------------------------------------- | ------------------------------------ |
| `/instructor`                           | Instructor dashboard                 |
| `/instructor/schedule`                  | Assigned schedule and filtering      |
| `/instructor/schedule/:lessonId`        | Instructor lesson detail             |
| `/instructor/sessions/:lessonId`        | Start, conduct and end lesson flow   |
| `/instructor/sessions/:lessonId/report` | Attendance and lesson report         |
| `/instructor/availability`              | Weekly hours and time-off management |
| `/instructor/profile`                   | Instructor profile and settings      |
| `/instructor/profile/account`           | Account and instructor details       |
| `/instructor/profile/notifications`     | Notification preferences             |
| `/instructor/profile/location`          | Teaching-session location settings   |
| `/instructor/profile/security`          | Password and verification            |
| `/instructor/profile/help`              | Instructor help centre               |
| `/instructor/profile/support`           | School and app support request form  |

## Guardian tabs

| Route                           | Purpose                            |
| ------------------------------- | ---------------------------------- |
| `/guardian`                     | Linked-learner dashboard           |
| `/guardian/learners/:learnerId` | Linked-learner training detail     |
| `/guardian/sessions/:sessionId` | Active-session location tracking   |
| `/guardian/activity`            | Shared learner activity foundation |
| `/guardian/profile`             | Guardian profile and logout        |

## School routes

| Route                             | Purpose                              |
| --------------------------------- | ------------------------------------ |
| `/school`                         | School operations dashboard          |
| `/school/onboarding`              | School identity onboarding           |
| `/school/onboarding/documents`    | Required evidence selection          |
| `/school/onboarding/review`       | Submission and pending-review gate   |
| `/school/instructors`             | Instructor roster                    |
| `/school/instructors/:id`         | Instructor detail and activation     |
| `/school/instructors/invite`      | Instructor invite form               |
| `/school/operations`              | Vehicle fleet management             |
| `/school/operations/vehicles`     | Focused vehicle inventory            |
| `/school/operations/vehicles/:id` | Vehicle detail and status            |
| `/school/operations/vehicles/new` | Add vehicle                          |
| `/school/operations/packages/:id` | Package detail and status            |
| `/school/operations/packages`     | Focused package inventory            |
| `/school/operations/packages/new` | Add package definition               |
| `/school/bookings`                | Upcoming lesson assignment queue     |
| `/school/bookings/:id`            | Instructor and vehicle assignment    |
| `/school/bookings/:id/reschedule` | School-controlled schedule change    |
| `/school/bookings/:id/cancel`     | School-controlled cancellation       |
| `/school/more`                    | School management destinations       |
| `/school/monitoring`              | Active lesson operational monitoring |
| `/school/profile`                 | School profile and verification view |

Related: [[02 Architecture/Navigation and Route Map]]
