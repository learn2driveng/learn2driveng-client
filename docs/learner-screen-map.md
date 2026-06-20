# Learner Screen Map

This screen map follows the dependency order in `feature-roadmap.md` and
`development-milestones.md`: foundation → discovery → purchase → booking →
session progress. Screens should be implemented in this order so each slice
ends in a navigable learner outcome.

## Primary navigation

| Area | Required screens | Priority | Current state |
| --- | --- | --- | --- |
| Home | Learner dashboard, upcoming session, quick actions | P1 | Implemented |
| Explore | School list/search/filter, school profile, packages | P0 | Implemented |
| Sessions | Active packages, booking flow, booking confirmation, booking history/detail | P0 | Implemented with typed presentation data |
| Progress | Overview, assessments, session history/detail | P1 | Overview implemented; detail screens pending |
| Profile | Profile, account, notifications, location, support | P1 | Mostly implemented |

## Required flow screens

### 1. Entry and identity

1. Splash
2. Onboarding
3. Login
4. Registration
5. Forgot password
6. Reset password
7. Location permission

The first six exist. Location permission currently exists as a settings page;
the permission prompt should later be inserted before nearby discovery.

### 2. Discovery — Milestone M2

1. Explore schools (list, search, filters)
2. Optional map/list discovery toggle
3. School profile
4. Instructor list or section
5. Vehicle list or section
6. Training package selection

The list, profile, instructor/vehicle sections, and package selection are now
connected. Map discovery remains blocked on the maps dependency and API key.

### 3. Purchase and booking — Milestone M3

1. Package selection
2. Payment method
3. Purchase review/result
4. Lesson schedule
5. Instructor selection
6. Booking review
7. Booking confirmation
8. Booking history
9. Booking detail/reschedule/cancel

Package selection now hands off to payment method, purchase review/result, and
then the schedule/instructor/booking confirmation flow. Booking history,
booking detail, rescheduling, and cancellation are connected using typed
presentation data while API mutations remain pending.

### 4. Session and learning — Milestone M4+

1. Upcoming/active session
2. Lesson in progress
3. Session detail and route
4. Progress overview
5. Assessments
6. Session history

These depend on the session API and realtime lifecycle. They should follow the
completed booking history slice.

## Implementation strategy

- Build vertical learner outcomes, not isolated screens.
- Keep routes in Expo Router and reusable domain UI under `src/features`.
- Use typed mock data only at the presentation boundary until API hooks exist.
- Replace mock data with TanStack Query; never mirror server responses in Zustand.
- Every completed slice must include loading, error, and empty states when APIs land.
