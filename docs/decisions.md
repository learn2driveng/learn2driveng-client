# Architecture Decision Records (ADRs)

Learn2Drive mobile — key technical decisions. Update this file when changing patterns.

---

## ADR-001: Single Codebase, Multi-Role RBAC

**Status:** Accepted
**Date:** 2025-06-15

**Context:** Five user roles share overlapping domains (bookings, sessions) but different UX.

**Decision:** One React Native app. Role determined post-login from JWT/profile. Root navigator swaps entire tree per role.

**Consequences:**

- Shared components in `schools`, `bookings`, `sessions` features
- Role-specific UI in `learner`, `instructor`, `driving-school`, `admin`
- Backend must enforce authorization; client RBAC is UX-only

---

## ADR-002: TanStack Query vs Zustand Split

**Status:** Accepted
**Date:** 2025-06-15

**Decision:**

- TanStack Query: all server/async data
- Zustand: auth tokens, session snapshot, selections, GPS, UI, settings

**Consequences:**

- No duplicate source of truth for API data
- Auth store holds tokens + minimal user identity; full profile via `useProfile()` query

---

## ADR-003: Expo Router File-Based Navigation

**Status:** Accepted (supersedes prior React Navigation–only ADR)  
**Date:** 2025-06-15 · **Revised:** 2026-06-15

**Context:** The original plan used separate `src/screens/`, `src/features/`, and `src/navigation/` layers alongside Expo Router, which added indirection. Expo SDK 56 recommends Expo Router as the primary navigation model.

**Decision:** Use **Expo Router** file-based routing in `src/app/`. Navigation is defined by the filesystem:

- `_layout.tsx` — stack/tab navigators per route group
- `(group)/` — route groups (auth, public, learner, instructor, etc.) without URL segments
- `index.tsx` — default route for a directory (`/`)
- `[param].tsx` — dynamic routes

React Navigation (`Stack`, `Tabs`) is used **inside** `_layout.tsx` files as Expo Router documents — not as a separate `src/navigation/` tree.

**Consequences:**

- Routes live in `src/app/`; no `src/screens/` or `src/navigation/` folders
- Reusable UI in `src/components/`; hooks in `src/hooks/`; API in `src/api/`
- RBAC enforced in root `src/app/_layout.tsx` via redirects (authenticated role → correct route group)
- Typed routes via Expo Router experiments (`typedRoutes: true`)
- Deep linking is automatic from file paths

### Public marketplace boundary

School discovery is public marketplace content. The `(public)` route group owns
location consent, school search, school profiles, instructor/vehicle
information, and package browsing. Authentication is required only when a user
starts a transactional or personal action such as checkout, booking, saving a
school, or viewing learner data.

Public discovery and authenticated learner routes compose the same feature
screens from `src/features/school-discovery/screens`; route files do not
duplicate marketplace UI.

Checkout belongs to the protected app root at `(app)/checkout`, not inside the
Explore tab. This prevents transaction screens from becoming tab-owned routes.

---

## ADR-004: JWT + expo-secure-store

**Status:** Accepted  
**Date:** 2025-06-15

**Decision:** Access + refresh JWT pair stored in `expo-secure-store`. Axios/fetch interceptor attaches Bearer token and handles 401 refresh flow.

**Consequences:**

- No tokens in Zustand persistence (memory only during session)
- Logout clears secure store and query cache

---

## ADR-005: Socket.IO for Realtime Sessions

**Status:** Accepted  
**Date:** 2025-06-15

**Decision:** `socket.io-client` connects after auth. Rooms are keyed by
`sessionId`. The learner publishes location only after creating a private share
for an active lesson. Public viewers read a deliberately limited projection
through an opaque, expiring token.

**Consequences:**

- Reconnection logic in `src/services/socket.ts`
- Location throttling (e.g. 5s / 10m) to reduce battery and bandwidth
- Fallback: poll session status if socket disconnected

---

## ADR-008: Learner-Managed Guardian Access

**Status:** Superseded by ADR-013
**Date:** 2026-07-11

**Decision:** Guardian access is represented as learner-managed safety contacts,
not broad guardian ownership of the learner account. A guardian link is invited,
accepted, expirable, revocable, and only grants live-location visibility when
the learner selects that link for an active lesson share.

**Consequences:**

- Learner Profile owns safety-contact management.
- Guardian dashboard remains a limited viewing surface.
- Live location is session-bound and stops when the lesson ends.
- Backend authorization must validate guardian link status, expiry, selected
  share recipients, and session state for every guardian read.

---

## ADR-013: Public Expiring Live-Location Links

**Status:** Accepted
**Date:** 2026-07-29

**Decision:** Live lesson tracking does not require a guardian account or a
permanent learner relationship. The learner creates an opaque, single-purpose
link for one active lesson and shares it through the device share sheet. The
public viewer receives only the current location and essential lesson context.

**Consequences:**

- Guardian signup, dashboards, invitations and safety-contact linking are
  removed from the client.
- `/track/:shareToken` remains public and must never redirect through login.
- Links expire on learner revocation, lesson completion, failure or absolute
  timeout.
- Production tokens are generated and hashed by the backend; the client token
  used during the UI phase is not a security boundary.
- Historical routes, learner contact details and account data are never part of
  the public response.

---

## ADR-009: School-Owned Instructor Onboarding

**Status:** Accepted
**Date:** 2026-07-12

**Decision:** Instructors are school-affiliated operators, not independent
marketplace sellers in the MVP. A school admin invites, reviews, and activates
instructors before they can receive learner assignments.

**Consequences:**

- School operations start with instructor lifecycle, not bookings.
- Learners may express instructor preference, but final assignment belongs to
  the school.
- Instructor availability is constrained by school locations, vehicles, and
  operating rules.
- School admin UI owns instructor invite/roster workflows.

---

## ADR-013: Verification-Gated School Operations

**Status:** Accepted
**Date:** 2026-07-12

**Decision:** A school account begins as a draft application. Operational
school routes unlock only after platform verification. Required evidence is the
FRSC operating licence, CAC registration, proof of address, and accountable
administrator identity.

**Consequences:**

- Creating a school administrator account does not publish the school.
- Draft, pending-review, and suspended schools cannot manage instructors,
  packages, bookings, vehicles, or active sessions.
- The mobile client selects and validates local document metadata; the backend
  must own secure upload, scanning, reviewer decisions, and audit history.
- Verification status is an authorization input, not a decorative badge.

---

## ADR-006: NativeWind v4 for Styling

**Status:** Accepted  
**Date:** 2025-06-15

**Decision:** NativeWind + Tailwind with design tokens mapped in `tailwind.config.js` and `src/constants/theme.ts`.

**Alternatives considered:** StyleSheet-only, Tamagui, Uniwind — rejected for spec compliance.

---

## ADR-007: Feature-Based Module Layout

**Status:** Accepted  
**Date:** 2025-06-15

**Decision:** Domain logic lives under `src/features/{domain}/`. Cross-cutting UI
in `src/components/`. Expo Router entry files in `src/app/` compose feature
screens; there is no separate `src/screens/` navigation tree.

**Consequences:**

- Features may export hooks and components; avoid circular imports via `src/types/` and `src/api/`

---

## ADR-008: API Client Pattern

**Status:** Accepted  
**Date:** 2025-06-15

**Decision:**

- `src/api/client.ts` — base HTTP client with auth interceptor
- `src/api/{resource}.ts` — endpoint functions
- `src/api/hooks/use{Resource}.ts` — TanStack Query hooks
- `src/api/query-keys.ts` — centralized query keys

**Consequences:** Consistent invalidation and typing across features.

---

## ADR-009: Nigeria-First Assumptions

**Status:** Accepted  
**Date:** 2025-06-15

**Decision:**

- Default map region: Nigeria center (~9.0820° N, 8.6753° E)
- Currency display: NGN (₦)
- Phone validation: Nigerian formats
- FRSC approval status on school entities

---

## ADR-010: MVP Payment Abstraction

**Status:** Accepted  
**Date:** 2025-06-15

**Decision:** Payment flow UI and API contract defined in MVP; integrate Paystack/Flutterwave via backend webhook (client receives payment intent URL or SDK token from API).

**Consequences:** No payment secrets in mobile app; provider choice is server-side ADR.

---

## ADR-011: Testing Deferred, Structure Ready

**Status:** Accepted  
**Date:** 2025-06-15

**Decision:** Jest + RNTL configured in Milestone 1; test files added incrementally with features.

---

## ADR-012: Role Type Union

**Status:** Accepted  
**Date:** 2025-06-15

```typescript
type UserRole =
  | "learner"
  | "guardian"
  | "instructor"
  | "school_admin"
  | "platform_admin";
```

Stored in `src/types/auth.ts`. Must match backend enum exactly.

---

## Change Log

| Date       | ADR | Change                          |
| ---------- | --- | ------------------------------- |
| 2025-06-15 | All | Initial ADRs from project setup |
