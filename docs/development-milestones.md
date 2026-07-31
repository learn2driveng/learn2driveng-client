# Development Milestones

Sprint-oriented milestones for Learn2Drive mobile. Adjust dates with team capacity.

**Assumption:** 2-week sprints, 1–2 mobile engineers, backend API available in parallel from Sprint 2.

---

## M0 — Project Bootstrap (Week 1)

**Goal:** Repo ready for feature development.

### Tasks

- [x] Folder structure (`src/api`, `features`, `navigation`, etc.)
- [x] `project_plan.md`, `.cursorrules`, ADRs, architecture docs
- [ ] Install full dependency stack
- [ ] Configure NativeWind + design tokens (`src/constants/theme.ts`)
- [ ] Configure ESLint + Prettier
- [ ] Add `QueryClientProvider` bootstrap
- [ ] Add placeholder `RootNavigator`
- [ ] Jest + RNTL scaffold (`jest.config.js`, sample test)

### Exit Criteria

- `npx expo start` runs without errors
- NativeWind class renders on index screen
- Docs reviewed by team

### Deliverables

- Documented setup (`docs/environment-setup.md`)
- `.env.example`

---

## M1 — Authentication & RBAC Shell (Weeks 2–3)

**Goal:** Users can log in and land on role-specific empty dashboards.

### Tasks

- [ ] `auth.store.ts` + `expo-secure-store` service
- [ ] API client with auth interceptor
- [ ] `useLogin`, `useRegister`, `useForgotPassword` hooks
- [ ] Auth screens (Login, Register, ForgotPassword, Splash)
- [ ] Zod schemas for auth forms
- [ ] `RoleResolver` + `RootNavigator`
- [ ] Empty tab navigators for all 5 roles
- [ ] Logout flow + query cache clear

### Exit Criteria

- Login with mock/staging API redirects learner vs instructor correctly
- Token persists across app restart
- Invalid token forces re-login

### Dependencies

- Backend: `POST /auth/*` endpoints

---

## M2 — Learner Discovery (Weeks 4–5)

**Goal:** Learners find and view driving schools.

### Tasks

- [ ] `AppMap` component + school markers
- [ ] `useNearbySchools`, `useSchoolDetail` queries
- [ ] School list + search + filter screens
- [ ] `SchoolCard`, school detail UI
- [ ] Instructor and vehicle sections on detail
- [ ] `useSelectionStore` for selected school
- [ ] Location permission flow

### Exit Criteria

- Map and list show schools from API
- Search/filter works client or server-side per API
- FRSC approval badge visible

### Dependencies

- Backend: schools, instructors, vehicles endpoints
- Google Maps API key configured

---

## M3 — Booking & Packages (Weeks 6–7)

**Goal:** Learners purchase packages and book lessons.

### Tasks

- [ ] Package listing on school detail
- [ ] Package purchase flow (payment intent from API)
- [ ] Book lesson form (RHF + Zod)
- [ ] Booking confirmation screen
- [ ] Booking history list + detail
- [ ] Query invalidation on create booking

### Exit Criteria

- End-to-end booking on staging
- Booking appears in history
- Error states for payment failure

### Dependencies

- Backend: packages, bookings, payments

---

## M4 — Sessions & Realtime (Weeks 8–10)

**Goal:** Live driving sessions with map tracking.

### Tasks

- [ ] `socket.ts` service + connection lifecycle
- [ ] `session.store.ts` for active session + coordinates
- [ ] Instructor: start/end session screens
- [ ] Instructor: background location updates
- [ ] Public expiring-link tracking map
- [ ] Session history + detail for learner
- [ ] Route polyline on map

### Exit Criteria

- Public viewer sees the learner’s current location during a shared session
- Session status updates in real time
- Session ends cleanly; socket disconnects

### Dependencies

- Backend: sessions API + Socket.IO server

---

## M5 — Safety Sharing & Instructor Polish (Weeks 11–12)

**Goal:** Complete public safety-link tracking and instructor daily workflow.

### Tasks

- [ ] Learner: create, share and revoke tracking link
- [ ] Public: expired and active tracking states
- [ ] Instructor: assigned bookings + upcoming
- [ ] Instructor: availability management (MVP)
- [ ] Instructor: progress report form
- [ ] Push notifications: session start/end

### Exit Criteria

- Shared link expires when the session ends
- Instructor sees today's lessons

---

## M6 — School & Platform Admin (Weeks 13–15)

**Goal:** Operational dashboards for school and platform admins.

### Tasks

- [ ] School admin: instructor CRUD
- [ ] School admin: vehicle CRUD
- [ ] School admin: package CRUD
- [ ] School admin: bookings list
- [ ] School admin: school profile edit
- [ ] Platform admin: school approval queue
- [ ] Platform admin: user list (read/manage)
- [ ] Platform admin: basic analytics charts

### Exit Criteria

- School admin can add instructor and vehicle
- Platform admin can approve pending school

---

## M7 — Beta Readiness (Weeks 16–18)

**Goal:** Production-quality MVP for limited beta in Nigeria.

### Tasks

- [ ] Offline banner + graceful degradation
- [ ] Error boundaries + crash reporting hook
- [ ] Profile edit all roles
- [ ] Notification preferences
- [ ] Performance pass (list virtualization)
- [ ] Accessibility pass (labels, contrast)
- [ ] EAS production build + TestFlight / Play internal
- [ ] Security review (tokens, location, RBAC)

### Exit Criteria

- Beta build distributed to 20–50 testers
- No P0 bugs open
- Crash-free rate target agreed with team

---

## Milestone Summary

| Milestone | Weeks | Theme                     | Release     |
| --------- | ----- | ------------------------- | ----------- |
| M0        | 1     | Bootstrap                 | —           |
| M1        | 2–3   | Auth + RBAC               | Internal    |
| M2        | 4–5   | Discovery                 | Internal    |
| M3        | 6–7   | Booking                   | Alpha       |
| M4        | 8–10  | Live tracking             | Alpha       |
| M5        | 11–12 | Safety Sharing/Instructor | Beta        |
| M6        | 13–15 | Admin                     | Beta        |
| M7        | 16–18 | Hardening                 | Public beta |

---

## Risk Register

| Risk                           | Mitigation                            |
| ------------------------------ | ------------------------------------- |
| Backend API delays             | MSW mocks; contract-first OpenAPI     |
| Maps in Expo Go                | Early dev builds                      |
| Battery drain (GPS)            | Throttle updates; end on session stop |
| Payment integration complexity | WebView checkout MVP                  |
| FRSC data accuracy             | Display disclaimer; server validation |

---

## Definition of Done (per feature)

- TypeScript strict, no lint errors
- Loading / error / empty states
- RBAC: only correct role sees screen
- Forms use RHF + Zod
- Server data via TanStack Query only
- Manual test notes in PR description
