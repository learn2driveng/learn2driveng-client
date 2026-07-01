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
| `/forgot-password` | `(auth)/forgot-password.tsx` |
| `/reset-password`  | `(auth)/reset-password.tsx`  |

## Protected checkout

| Route                         | Source                                  |
| ----------------------------- | --------------------------------------- |
| `/checkout/:schoolId/payment` | `(app)/checkout/[schoolId]/payment.tsx` |
| `/checkout/:schoolId/review`  | `(app)/checkout/[schoolId]/review.tsx`  |
| `/checkout/:schoolId/result`  | `(app)/checkout/[schoolId]/result.tsx`  |

## Student tabs and details

| Route                                     | Purpose                           |
| ----------------------------------------- | --------------------------------- |
| `/student`                                | Dashboard                         |
| `/student/explore`                        | Shared authenticated discovery    |
| `/student/explore/:schoolId`              | School profile                    |
| `/student/explore/:schoolId/packages`     | Package selection                 |
| `/student/sessions`                       | Packages and bookings             |
| `/student/sessions/book`                  | Schedule/instructor/review wizard |
| `/student/sessions/confirmation`          | Booking confirmation              |
| `/student/sessions/history`               | Booking history                   |
| `/student/sessions/:bookingId`            | Booking detail                    |
| `/student/sessions/:bookingId/reschedule` | Rescheduling                      |
| `/student/progress`                       | Progress overview                 |
| `/student/profile`                        | Profile/settings index            |
| `/student/profile/account`                | Account detail                    |
| `/student/profile/help`                   | Help centre and FAQs              |
| `/student/profile/inbox`                  | Notification centre               |
| `/student/profile/notifications`          | Notification preferences          |
| `/student/profile/location`               | Location preferences              |
| `/student/profile/support`                | Contact and problem-report form   |

Related: [[02 Architecture/Navigation and Route Map]]
