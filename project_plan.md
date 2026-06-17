# Learn2Drive Mobile — Project Plan

> Nigeria-focused platform connecting learners with FRSC-approved driving schools.  
> Single React Native codebase · Multi-role RBAC · MVP architecture, nationwide scale.

---

## 1. Vision & Scope

Learn2Drive enables learners to discover verified driving schools, purchase training packages, book lessons, and track progress. Guardians monitor sessions in real time. Instructors and school administrators manage operations. Platform administrators oversee approvals, incidents, and analytics.

**MVP goal:** Ship a role-complete learner journey (discover → book → session → progress) with guardian live tracking and instructor session management.

**Scale goal:** Architecture supports thousands of concurrent users across Nigeria with clear feature boundaries, typed APIs, and offline-aware UX.

---

## 2. Supported Roles & RBAC

| Role | Code | Post-auth destination |
|------|------|------------------------|
| Learner | `learner` | Learner stack (tabs: Discover, Bookings, Progress, Profile) |
| Guardian | `guardian` | Guardian stack (tabs: Live, History, Learners, Profile) |
| Driving Instructor | `instructor` | Instructor stack (tabs: Schedule, Sessions, Reports, Profile) |
| Driving School Administrator | `school_admin` | School stack (tabs: Dashboard, Staff, Fleet, Packages, Bookings) |
| Platform Administrator | `platform_admin` | Admin stack (tabs: Overview, Schools, Users, Incidents) |

After JWT validation, a **role resolver** reads `user.role` from the auth store and mounts exactly one root navigation tree. Unauthenticated users see the auth stack only.

See [docs/architecture.md](./docs/architecture.md) for navigation diagrams and [docs/decisions.md](./docs/decisions.md) for RBAC and navigation ADRs.

---

## 3. Technology Stack (Mandatory)

| Layer | Choice | Version target |
|-------|--------|----------------|
| Framework | Expo + React Native | Expo SDK 56, RN 0.79+ (current: 0.85) |
| Language | TypeScript | strict mode |
| Styling | NativeWind | v4 + Tailwind CSS |
| Navigation | Expo Router | file-based; Stack/Tabs in `_layout.tsx` |
| Server state | TanStack Query | v5 |
| Client state | Zustand | v5 |
| Forms | React Hook Form | v7 |
| Validation | Zod | v3 |
| Maps | react-native-maps | Expo-compatible |
| Realtime | socket.io-client | v4 |
| Notifications | expo-notifications | SDK-aligned |
| Secure tokens | expo-secure-store | SDK-aligned |
| Location | expo-location | GPS for sessions |

---

## 4. State Management Rules

### TanStack Query — server state only

- Auth API (login, register, refresh, password reset)
- Driving schools, instructors, vehicles
- Bookings, sessions, reviews
- User profile (fetched data)

**Never** cache API responses in Zustand.

### Zustand — client state only

- Auth: `accessToken`, `refreshToken`, `isAuthenticated`
- User session snapshot (role, id — not full profile cache)
- `selectedSchool`, `selectedPackage`
- `activeSession`, `currentCoordinates`
- UI state (modals, sheets)
- Theme and app settings

Query keys live in `src/api/query-keys.ts`. Stores live in `src/store/`.

---

## 5. Folder Structure

```
src/
├── app/                    # Expo Router — all routes & layouts
│   ├── _layout.tsx         # Root providers + role redirect
│   ├── +not-found.tsx
│   ├── (auth)/             # Splash, login, register (URL: /, /login, …)
│   ├── (learner)/          # Learner tabs & screens
│   ├── (guardian)/
│   ├── (instructor)/
│   ├── (school)/           # Driving school admin
│   └── (admin)/            # Platform admin
├── components/
│   ├── auth/               # Splash, auth forms
│   ├── common/             # Button, Input, Loading, ErrorBoundary
│   ├── forms/              # FormField, FormSelect
│   ├── cards/              # SchoolCard, BookingCard
│   └── maps/               # MapView, markers, polylines
├── hooks/                  # Cross-cutting hooks
├── api/                    # HTTP client, endpoints, query hooks
├── services/               # Socket, notifications, location, secure storage
├── store/                  # Zustand stores
├── types/                  # Shared TypeScript types
├── utils/                  # Pure helpers
├── constants/              # Design tokens, config
└── lib/                    # NativeWind setup, shared utilities
```

**Expo Router notation:** `(group)` = route group (no URL segment), `index.tsx` = default route, `_layout.tsx` = navigator, `[id].tsx` = dynamic param.

Static assets live in project root `assets/` (Expo convention).

---

## 6. Navigation Architecture

Expo Router file-based routing in `src/app/`:

```
src/app/
├── _layout.tsx              # Providers, fonts, role redirect
├── +not-found.tsx
├── (auth)/
│   ├── _layout.tsx          # Auth stack
│   ├── index.tsx            # Splash → /
│   ├── login.tsx            # → /login
│   ├── register.tsx
│   └── forgot-password.tsx
├── (learner)/
│   ├── _layout.tsx          # Learner tabs
│   └── (tabs)/...
├── (guardian)/
├── (instructor)/
├── (school)/
└── (admin)/
```

**Role resolver flow** (in root `_layout.tsx`):

1. App launch → read secure token → hydrate auth store
2. If no token → stay in `(auth)` routes
3. If token valid → `router.replace` to `/(learner)` etc. based on `user.role`
4. Token expiry → refresh or logout → redirect to `/(auth)/login`

---

## 7. Authentication

- JWT access + refresh tokens
- Tokens in `expo-secure-store` (never AsyncStorage)
- `Authorization: Bearer <token>` on API requests
- Role embedded in JWT claims and mirrored in user profile
- Route guards at navigator level (not per-screen checks scattered in UI)

---

## 8. Core Feature Modules

| Module | Learner | Guardian | Instructor | School Admin | Platform Admin |
|--------|---------|----------|------------|--------------|----------------|
| School discovery | ✓ | — | — | — | approve |
| Bookings | ✓ | view | manage | manage | — |
| Sessions | ✓ | live track | start/end | monitor | — |
| Packages | purchase | — | — | CRUD | — |
| Instructors/Vehicles | view | — | — | CRUD | — |
| Progress | ✓ | ✓ | report | view | — |
| Notifications | ✓ | ✓ | ✓ | ✓ | ✓ |
| Analytics | — | — | — | earnings | platform |

---

## 9. Realtime (Socket.IO)

**Events (illustrative):**

- `session:started` / `session:ended`
- `location:update` (instructor → server → guardian subscribers)
- `session:status` (booking state changes)

Service: `src/services/socket.ts`  
Hooks: `src/hooks/` (e.g. `useSessionTracking.ts`)

---

## 10. Error Handling & Offline

- React Error Boundaries on root and per-stack
- TanStack Query `retry`, `staleTime`, error UI components
- Zod + RHF field-level validation messages
- `@react-native-community/netinfo` for offline banner
- Optimistic updates only where rollback is safe (bookings TBD)

---

## 11. Testing Strategy (structure only)

```
__tests__/
├── app/
├── components/
├── hooks/
└── utils/
```

- Jest + React Native Testing Library (configure in Milestone 1)
- MSW for API mocking in integration tests
- E2E (Detox/Maestro) — post-MVP

---

## 12. Dependency Installation

Run from project root after cloning:

```bash
# Expo-managed native modules
npx expo install \
  @react-navigation/native \
  @react-navigation/native-stack \
  @react-navigation/bottom-tabs \
  react-native-screens \
  react-native-safe-area-context \
  react-native-gesture-handler \
  react-native-reanimated \
  react-native-maps \
  expo-notifications \
  expo-secure-store \
  expo-location \
  expo-device \
  @react-native-community/netinfo

# JS dependencies
npm install \
  @tanstack/react-query \
  zustand \
  react-hook-form \
  @hookform/resolvers \
  zod \
  socket.io-client \
  nativewind \
  tailwindcss

# Dev dependencies
npm install -D \
  prettier \
  eslint-config-prettier \
  @testing-library/react-native \
  jest-expo
```

Then configure NativeWind per [docs/environment-setup.md](./docs/environment-setup.md).

---

## 13. Environment Setup

See [docs/environment-setup.md](./docs/environment-setup.md) for:

- Node / Expo CLI prerequisites
- `.env` configuration (copy from `.env.example`)
- iOS Simulator / Android Emulator
- Google Maps keys
- EAS Build (optional)

Quick start:

```bash
cp .env.example .env
npm install
npx expo start
```

---

## 14. Feature Roadmap

See [docs/feature-roadmap.md](./docs/feature-roadmap.md).

**Phases:**

1. **Foundation** — tooling, navigation shell, auth, design system
2. **Learner core** — schools, packages, bookings
3. **Sessions & tracking** — instructor GPS, guardian live map
4. **School operations** — admin dashboards, fleet, packages
5. **Platform admin** — approvals, incidents, analytics
6. **Hardening** — notifications, offline, performance, security audit

---

## 15. Development Milestones

See [docs/development-milestones.md](./docs/development-milestones.md).

| Milestone | Target | Outcome |
|-----------|--------|---------|
| M0 | Week 1 | Repo structure, docs, deps, NativeWind tokens |
| M1 | Week 2–3 | Auth flow + role resolver + empty role stacks |
| M2 | Week 4–6 | Learner discovery & school profiles |
| M3 | Week 7–9 | Booking & package purchase |
| M4 | Week 10–12 | Sessions, Socket.IO, maps |
| M5 | Week 13–15 | Guardian + instructor flows |
| M6 | Week 16–18 | School admin + platform admin |
| M7 | Week 19–20 | Notifications, polish, beta |

---

## 16. Coding Standards

- Functional components only
- TypeScript strict — no `any` without documented exception
- Absolute imports via `@/` (configured in `tsconfig.json`)
- Custom hooks for reusable business logic
- Feature-based modules; screens stay thin
- NativeWind over large `StyleSheet` objects
- Forms: React Hook Form + Zod (not `useState` for form fields)
- ESLint + Prettier enforced in CI

---

## 17. Design Tokens

Defined in `src/constants/theme.ts`:

| Token | Usage |
|-------|--------|
| `primary` | CTAs, links, active tab |
| `secondary` | Secondary actions, accents |
| `success` | Completed sessions, confirmations |
| `warning` | Pending approvals, cautions |
| `error` | Validation errors, incidents |

---

## 18. Related Documents

| Document | Purpose |
|----------|---------|
| [docs/architecture.md](./docs/architecture.md) | System design, data flow, diagrams |
| [docs/decisions.md](./docs/decisions.md) | Architecture decision records |
| [docs/environment-setup.md](./docs/environment-setup.md) | Local dev environment |
| [docs/feature-roadmap.md](./docs/feature-roadmap.md) | Feature backlog by phase |
| [docs/development-milestones.md](./docs/development-milestones.md) | Sprint-level milestones |
| [.cursorrules](./.cursorrules) | AI / Cursor coding constraints |

---

## 19. Governance

All new code MUST:

1. Respect TanStack Query vs Zustand boundaries
2. Place files in the prescribed folder structure
3. Use the mandatory stack (no alternative state libs)
4. Implement RBAC at the navigator level
5. Follow Expo SDK 56 docs: https://docs.expo.dev/versions/v56.0.0/

When in doubt, update `docs/decisions.md` before introducing new patterns.
