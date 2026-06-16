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
- Role-specific UI in `learner`, `guardian`, `instructor`, `driving-school`, `admin`
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

## ADR-003: React Navigation as Primary Navigator

**Status:** Accepted  
**Date:** 2025-06-15

**Context:** Project scaffold uses Expo Router (`src/app/`). Spec requires React Navigation role stacks.

**Decision:** Use `@react-navigation/native` with imperative role-based root navigator in `src/navigation/`. Keep `src/app/_layout.tsx` as a thin bootstrap (providers + `RootNavigator`). Migrate away from file-based routing for feature screens over time.

**Alternatives considered:**
- *Expo Router route groups per role* — good DX but harder to enforce strict RBAC isolation
- *Pure Expo Router* — rejected; spec mandates React Navigation stacks

**Consequences:**
- New screens register in `src/navigation/{role}/` not `src/app/`
- Deep linking configured via React Navigation linking config

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

**Decision:** `socket.io-client` connects after auth. Rooms keyed by `sessionId`. Instructor publishes location; guardians subscribe.

**Consequences:**
- Reconnection logic in `src/services/socket.ts`
- Location throttling (e.g. 5s / 10m) to reduce battery and bandwidth
- Fallback: poll session status if socket disconnected

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

**Decision:** Domain logic lives under `src/features/{domain}/`. Cross-cutting UI in `src/components/`. Screens in `src/screens/` compose features for navigation.

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
  | 'learner'
  | 'guardian'
  | 'instructor'
  | 'school_admin'
  | 'platform_admin';
```

Stored in `src/types/auth.ts`. Must match backend enum exactly.

---

## Change Log

| Date | ADR | Change |
|------|-----|--------|
| 2025-06-15 | All | Initial ADRs from project setup |
