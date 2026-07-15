# School Operations Architecture

## Decision

Schools own instructor onboarding and operations. Instructors are not treated as
independent marketplace operators in the MVP.

An instructor must be invited, affiliated, reviewed, and activated by a school
before receiving learner lesson assignments.

## MVP lifecycle

```text
School administrator creates a draft school account
  → School completes identity and operating details
  → School uploads FRSC, CAC, address, and administrator evidence
  → School submits verification application
  → Platform reviews and approves the school
  → Verified school admin invites instructor
  → Instructor accepts invite
  → Instructor completes profile
  → School reviews and activates instructor
  → Instructor sets availability within school rules
  → School assigns or confirms learner bookings
  → Instructor conducts session and submits report
```

## Verification gate

School registration does not grant operational access. A school with `draft`,
`pending_review`, or `suspended` verification status remains inside the
onboarding/review route tree. Only `verified` schools can access instructors,
packages, bookings, vehicles, and live operations.

Required onboarding evidence:

- current FRSC driving-school operating licence;
- CAC registration certificate;
- proof of the operating address;
- government-issued identity for the accountable administrator.

Vehicle insurance evidence is optional in the initial application. The client
uses Expo DocumentPicker for local PDF/JPG/PNG selection with a 10 MB per-file
limit. Backend upload, secure object storage, document scanning, reviewer audit
history, and final approval remain server/platform responsibilities.

## Assignment policy

Use a hybrid MVP policy:

- learners may see instructor profiles;
- learners may express instructor preference;
- final assignment belongs to the school;
- the school is responsible for vehicle, location, instructor eligibility, and
  delivery quality.

This avoids direct instructor booking before the school has operational control.

## Client boundary

School admin route ownership starts under `(app)/school`.

Initial screens:

- school administrator registration;
- school identity onboarding;
- verification document upload;
- application review and pending-review gate;
- school dashboard;
- instructor roster;
- instructor invite;
- instructor detail with local activate/suspend/resend actions;
- focused vehicle inventory with detail/add/status management;
- focused package inventory with detail/add/status management;
- lesson assignment queue and booking-level instructor/vehicle matching;
- booking rescheduling and cancellation controls;
- active-session operational monitoring;
- editable marketplace profile and verification status;
- editable operating areas and theme preferences;
- work-focused booking filters and active/upcoming session monitoring.
- learner roster with enrolment, instructor, lesson, and readiness oversight;
- learner-level assessment assignment, school-owned assessment library, and
  guided question authoring with review and publishing.

School operation fixtures live in `src/sample_data/school-operations.ts` and
types live in `src/types/school-operations.ts`. These are presentation
structures until backend contracts are introduced.

## Implemented MVP sequence

Build in this order:

1. instructor roster and invite lifecycle;
2. vehicles;
3. package definitions;
4. booking assignment, rescheduling, and cancellation operations;
5. active session monitoring;
6. school profile and verification maintenance;
7. learner management and readiness assessment oversight.

Earnings, analytics, backend persistence, notification delivery, and platform
verification review remain later integrations rather than school MVP gaps.
