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

These role experiences are planned; no route trees currently exist for them.

## Recommended implementation order

### 1. Instructor

Instructor operations complete the learner's session lifecycle:

- assigned schedule
- availability
- booking detail
- start/end lesson
- location broadcast
- attendance
- progress report

### 2. Guardian

Guardian value depends on active instructor/session data:

- linked learners
- active-session status
- live location
- session history
- progress view
- safety notifications

### 3. School administrator

- operational dashboard
- instructors and availability
- vehicles
- packages
- bookings and assignment
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
