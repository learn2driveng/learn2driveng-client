---
type: architecture
status: active
updated: 2026-06-30
tags:
  - state
  - data
  - zustand
---

# State and data

## Current state

### Zustand

`useAuthStore`

- `isAuthenticated`
- `signIn()`
- `signOut()`

This is currently a UI stub. It does not contain a user, role, tokens,
hydration status, or secure persistence.

`useSettingsStore`

- theme preference: `system | light | dark`
- whether the location prompt was dismissed

`useLocationStore`

- current foreground coordinates
- coordinates remain in memory across navigation
- choosing the manual Lagos fallback clears cached coordinates

### Local screen state

Booking selections, form inputs, and other interaction state currently live
inside route components. This is acceptable for short-lived wizard state, but
API-backed drafts may eventually need a feature hook or server reservation.

### Presentation data

- `src/sample_data/schools.ts`
- `src/sample_data/bookings.ts`
- `src/sample_data/student-packages.ts`

The explicit boundary keeps temporary fixtures out of feature code. These
provide typed local fixtures; they are not backend truth.

## Intended split

| State kind                                            | Owner                                        |
| ----------------------------------------------------- | -------------------------------------------- |
| API catalogue, purchases, bookings, sessions, profile | TanStack Query                               |
| Access/refresh credentials                            | SecureStore plus in-memory auth coordination |
| Theme and local preferences                           | Zustand                                      |
| Temporary screen interaction                          | Component state or focused feature hook      |
| Availability hold and payment status                  | Backend                                      |

## Data migration path

1. Define API contracts and error shapes in `src/types` or generated clients.
2. Add one shared HTTP client and query-key factory.
3. Replace fixture readers feature by feature.
4. Add loading, empty, error, and retry states.
5. Avoid copying query responses into Zustand.
6. Clear sensitive query data on logout.

## Missing domain contracts

- Package purchase and package-specific credit balance
- Availability slots and holds
- Payment intent/result
- Booking creation, reschedule, cancellation
- Session lifecycle and progress report
- Role-specific profile records

Related: [[01 Product/Domain Model]], [[04 Delivery/Open Questions and Risks]]
