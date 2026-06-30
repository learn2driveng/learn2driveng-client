# Public Marketplace Architecture

## Decision

Driving-school catalogue data is public. Users may browse schools, profiles,
instructors, vehicles, ratings, and packages without creating an account.

Authentication protects transactions and personal learner data, not catalogue
visibility.

## Route ownership

| Route group | Responsibility | Authentication |
| --- | --- | --- |
| `(public)` | Location consent, school discovery, school profiles, package browsing | No |
| `(auth)` | Login, registration, password recovery | No |
| `(app)/checkout` | Payment method, purchase review, purchase result | Yes |
| `(app)/student` | Bookings, sessions, progress, profile, learner dashboard | Yes |

## Entry flow

```text
Splash
  → Onboarding
  → Location consent
      ├─ Permission granted → student entry choice
      └─ Declined → manual/default city → student entry choice
  → Choose Explore or Login
  → School profile
  → Package browsing
  → Login or registration
  → Protected root checkout
```

Checkout is a sibling of the learner tab navigator, not a child of Explore.
Payment screens therefore cannot become tab content or remain selected when a
user returns to Explore.

## Permission principles

- Explain the user benefit before presenting the operating-system prompt.
- Request foreground location only.
- Allow a manual/default city when permission is declined.
- Direct users to device settings only when the OS no longer allows another prompt.
- Do not share discovery location with schools.

## Protected-action boundary

The following actions require authentication:

- Purchasing a package
- Booking, rescheduling, or cancelling a lesson
- Saving a school
- Viewing sessions, progress, profile, or payment results

After login, the app should honor a validated internal `returnTo` route so the
user can resume the action that triggered authentication.

The `(app)` layout enforces the UX boundary by redirecting unauthenticated
navigation to login. The backend must still authorize every protected API
request; client navigation is not a security boundary.

## Code organization

- Route files remain thin Expo Router entry points.
- Shared discovery screens live in `src/features/school-discovery/screens`.
- Domain models live in `src/types`.
- Server catalogue data will use TanStack Query when API integration lands.
- Authentication and API authorization remain server-backed; client route
  boundaries provide UX-level protection only.
