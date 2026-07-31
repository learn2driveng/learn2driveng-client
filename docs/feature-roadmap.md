# Feature Roadmap

Prioritized feature backlog for Learn2Drive mobile MVP → nationwide scale.

**Legend:** P0 = MVP blocker · P1 = MVP important · P2 = post-MVP · P3 = future

---

## Phase 1 — Foundation (P0)

| ID   | Feature                                   | Roles | Priority |
| ---- | ----------------------------------------- | ----- | -------- |
| F1.1 | Project structure & design tokens         | All   | P0       |
| F1.2 | Root navigator + role resolver            | All   | P0       |
| F1.3 | Auth: login, register, forgot password    | All   | P0       |
| F1.4 | JWT secure storage + refresh              | All   | P0       |
| F1.5 | API client + TanStack Query setup         | All   | P0       |
| F1.6 | Zustand stores (auth, settings)           | All   | P0       |
| F1.7 | Shared UI: Button, Input, Screen, Loading | All   | P0       |
| F1.8 | ESLint, Prettier, Jest scaffold           | All   | P0       |

---

## Phase 2 — Learner Core (P0)

| ID    | Feature                               | Roles                 | Priority |
| ----- | ------------------------------------- | --------------------- | -------- |
| F2.1  | Nearby schools (map + list)           | Learner               | P0       |
| F2.2  | School search & filters               | Learner               | P0       |
| F2.3  | School profile (FRSC status, info)    | Learner               | P0       |
| F2.4  | Instructor list on school profile     | Learner               | P0       |
| F2.5  | Vehicle list on school profile        | Learner               | P0       |
| F2.6  | Training packages listing             | Learner               | P0       |
| F2.7  | Package purchase flow                 | Learner               | P0       |
| F2.8  | Book lesson (date/time picker)        | Learner               | P0       |
| F2.9  | Booking history                       | Learner               | P0       |
| F2.10 | Training progress overview            | Learner               | P1       |
| F2.11 | Session history                       | Learner               | P1       |
| F2.12 | School-assigned readiness assessments | Learner, School admin | P1       |

---

## Phase 3 — Sessions & Live Tracking (P0)

| ID   | Feature                            | Roles               | Priority |
| ---- | ---------------------------------- | ------------------- | -------- |
| F3.1 | Realtime session transport         | Learner, Instructor | P0       |
| F3.2 | Instructor: start/end session      | Instructor          | P0       |
| F3.3 | Instructor: GPS broadcast          | Instructor          | P0       |
| F3.4 | Public expiring live-tracking link | Learner, Public     | P0       |
| F3.5 | Current-location visualization     | Public, Learner     | P1       |
| F3.6 | Session detail screen              | All relevant        | P1       |
| F3.7 | Active session monitoring (school) | School admin        | P1       |
| F3.8 | Instructor progress report submit  | Instructor          | P1       |

---

## Phase 4 — Public Safety Sharing (P1)

| ID   | Feature                                 | Roles   | Priority |
| ---- | --------------------------------------- | ------- | -------- |
| F4.1 | Create and revoke private tracking link | Learner | P0       |
| F4.2 | Public token-based tracking page        | Public  | P0       |
| F4.3 | Automatic lesson-end expiry             | System  | P0       |
| F4.4 | Share-sheet handoff                     | Learner | P1       |

---

## Phase 5 — Instructor (P1)

| ID   | Feature                   | Roles      | Priority |
| ---- | ------------------------- | ---------- | -------- |
| F5.1 | Assigned bookings list    | Instructor | P0       |
| F5.2 | Availability management   | Instructor | P1       |
| F5.3 | Upcoming lessons calendar | Instructor | P1       |
| F5.4 | Start/end session UI      | Instructor | P0       |
| F5.5 | Progress report form      | Instructor | P1       |

---

## Phase 6 — Driving School Admin (P1)

| ID    | Feature                                          | Roles        | Priority |
| ----- | ------------------------------------------------ | ------------ | -------- |
| F6.0  | School registration and verification application | School admin | P1       |
| F6.1  | School dashboard                                 | School admin | P1       |
| F6.2  | Instructor invite and activation lifecycle       | School admin | P1       |
| F6.3  | Vehicle CRUD                                     | School admin | P1       |
| F6.4  | Package CRUD                                     | School admin | P1       |
| F6.5  | Bookings management                              | School admin | P1       |
| F6.6  | Active sessions monitor                          | School admin | P2       |
| F6.7  | Earnings & analytics                             | School admin | P2       |
| F6.8  | School profile edit                              | School admin | P1       |
| F6.9  | Learner roster and learner oversight             | School admin | P1       |
| F6.10 | Assessment assignment and readiness review       | School admin | P1       |

---

## Phase 7 — Platform Admin (P2)

| ID   | Feature                  | Roles          | Priority |
| ---- | ------------------------ | -------------- | -------- |
| F7.1 | School approval workflow | Platform admin | P2       |
| F7.2 | User management          | Platform admin | P2       |
| F7.3 | Incident / report review | Platform admin | P2       |
| F7.4 | Platform analytics       | Platform admin | P2       |
| F7.5 | System activity log      | Platform admin | P3       |

---

## Phase 8 — Cross-Cutting (P1–P2)

| ID   | Feature                            | Roles   | Priority |
| ---- | ---------------------------------- | ------- | -------- |
| F8.1 | Push notifications infrastructure  | All     | P1       |
| F8.2 | Booking confirmation notifications | Learner | P1       |
| F8.3 | Offline detection banner           | All     | P1       |
| F8.4 | Reviews & ratings                  | Learner | P2       |
| F8.5 | Profile edit                       | All     | P1       |
| F8.6 | Theme (light/dark)                 | All     | P2       |
| F8.7 | Deep linking                       | All     | P2       |
| F8.8 | Accessibility audit                | All     | P2       |

---

## Phase 9 — Hardening & Scale (P2–P3)

| ID   | Feature                          | Notes               | Priority |
| ---- | -------------------------------- | ------------------- | -------- |
| F9.1 | Performance: list virtualization | Large school lists  | P2       |
| F9.2 | Image optimization (expo-image)  | CDN                 | P2       |
| F9.3 | Error reporting (Sentry)         | Production          | P2       |
| F9.4 | Analytics (product)              | PostHog / Amplitude | P3       |
| F9.5 | Multi-language (English + local) | Pidgin, Hausa, etc. | P3       |
| F9.6 | Certificate pinning              | Security            | P3       |

---

## MVP Definition (Release 1.0)

**In scope:**

- F1.\*, F2.1–F2.9, F3.1–F3.4, F4.2, F5.1, F5.4, F8.1, F8.3

**Out of scope (R1):**

- Platform admin full suite
- School earnings analytics
- Reviews
- Multi-language

---

## Dependency Graph (Simplified)

```
F1 (Foundation)
 └── F1.3 Auth
      └── F2 (Learner discovery & booking)
           └── F3 (Sessions & tracking)
                ├── F4 (Public safety sharing)
                └── F5 (Instructor)
                     └── F6 (School admin)
                          └── F7 (Platform admin)
```

---

## Backend API Dependencies

Each feature maps to API endpoints — track in API contract doc (server repo). Mobile can stub with MSW until endpoints exist.
