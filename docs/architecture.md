# Learn2Drive Mobile — Architecture

Initial architecture documentation for the Learn2Drive React Native application.

---

## 1. System Context

```
┌─────────────────────────────────────────────────────────────┐
│                    Learn2Drive Mobile App                    │
│  (Expo / React Native — Learner, Instructor, School, Admin) │
│   School Admin, Platform Admin)                             │
└───────────────┬─────────────────────────┬───────────────────┘
                │ HTTPS (REST)            │ WebSocket
                ▼                         ▼
┌───────────────────────────┐   ┌─────────────────────────┐
│   Learn2Drive API         │   │   Socket.IO Server       │
│   (JWT, RBAC)             │   │   (sessions, location)   │
└───────────────────────────┘   └─────────────────────────┘
                │
                ▼
┌───────────────────────────┐
│   PostgreSQL / Redis /     │
│   Payment (Paystack)       │
└───────────────────────────┘
```

The mobile client is a **presentation and realtime consumer**. Authorization is enforced server-side; the app implements UX-level RBAC.

---

## 2. Application Layers

```
┌────────────────────────────────────────────┐
│  Routes (src/app/)                          │  ← Expo Router pages & layouts
├────────────────────────────────────────────┤
│  Components (src/components/)             │  ← Reusable UI
├────────────────────────────────────────────┤
│  Hooks (src/hooks/)                         │  ← Business logic hooks
├────────────────────────────────────────────┤
│  API client (src/lib/api/)                  │  ← HTTP contracts and mappers
├────────────────────────────────────────────┤
│  Store (src/store/)                         │  ← Zustand client state
├────────────────────────────────────────────┤
│  Services (src/services/)                 │  ← Socket, location, push
└────────────────────────────────────────────┘
```

**Dependency rule:** Routes import from components/hooks/api. API layer must not import from routes.

Feature screens shared by multiple route groups live under
`src/features/{domain}/screens`. Expo Router files should remain thin entry
points.

Domain data has three explicit shapes:

1. canonical server entities in `src/types`;
2. feature view models for joined or display-only data;
3. local fixtures in `src/sample_data` that satisfy one of those contracts.

Do not add legacy screen fields to a canonical server entity merely to satisfy
a component. Compose a view model or join the related entity instead. For
example, learner and booking IDs belong to `TrainingSessionParticipant`, not
`TrainingSession`.

---

## 3. App Bootstrap

`src/app/_layout.tsx` responsibilities:

1. Load fonts / hide splash screen
2. Wrap app with providers (`SafeAreaProvider`, `QueryClientProvider` when added)
3. Render root `<Stack />` for Expo Router
4. Public marketplace access and role-based redirects for protected areas

```typescript
// Current root layout
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar />
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}
```

---

## 4. Navigation Architecture

### 4.1 Root Flow

```mermaid
flowchart TD
    A[App Launch] --> B{Token in SecureStore?}
    B -->|No| C[Public Marketplace or AuthStack]
    B -->|Yes| D[Validate / Refresh Token]
    D -->|Invalid| C
    D -->|Valid| E{user.role}
    E -->|learner| F[LearnerNavigator]
    E -->|instructor| H[InstructorNavigator]
    E -->|school_admin| I[SchoolNavigator]
    E -->|platform_admin| J[AdminNavigator]
```

### 4.2 Learner Stack (example)

```
LearnerNavigator (Bottom Tabs)
├── DiscoverTab → Stack
│   ├── SchoolList
│   ├── SchoolSearch
│   └── SchoolDetail
├── BookingsTab → Stack
│   ├── BookingList
│   ├── PackageSelect
│   └── BookingDetail
├── ProgressTab → Stack
│   ├── ProgressOverview
│   └── SessionHistory
└── ProfileTab → Stack
    └── Profile / Settings
```

Other roles follow the same pattern: tabs for primary areas, stacks for drill-down.

### 4.3 Public marketplace

```
PublicStack
├── LocationConsent
├── SchoolList
├── SchoolDetail
└── PackageBrowse
```

The public marketplace exposes non-sensitive school catalogue information
without requiring an account. Location consent is requested after its value is
explained and before nearby results are personalized. A manual/default area
remains available when permission is declined.

Protected actions cross an explicit authentication boundary:

```
Public PackageBrowse
  → Login / Registration
  → Protected root Checkout
  → Learner Booking
```

`(app)/checkout` is a sibling of `(app)/student`, keeping payment screens
outside the learner bottom-tab navigator.

### 4.4 Auth Stack

| Screen          | Route name       |
| --------------- | ---------------- |
| Splash          | `Splash`         |
| Login           | `Login`          |
| Register        | `Register`       |
| Forgot Password | `ForgotPassword` |

---

## 5. Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant App as Mobile App
    participant SS as SecureStore
    participant API as Backend API

    U->>App: Login(email, password)
    App->>API: POST /auth/login
    API-->>App: accessToken, refreshToken, user
    App->>SS: Store tokens
    App->>App: Zustand set auth + role
    App->>App: Navigate to role stack

    Note over App,API: Subsequent requests
    App->>API: GET /resource (Bearer accessToken)
    API-->>App: 401 expired
    App->>API: POST /auth/refresh
    API-->>App: new accessToken
    App->>SS: Update token
```

---

## 6. Data Flow — Server State (TanStack Query)

```
Screen → useSchools() → queryFn → api/schools.getNearby()
                              ↓
                         Query Cache
                              ↓
                    UI renders data / loading / error
```

**Query key convention:**

```typescript
["schools", "nearby", { lat, lng, radius }][
  ("bookings", "list", { status, page })
][("sessions", "detail", sessionId)];
```

**Invalidation examples:**

- After booking created → invalidate `['bookings']`
- After session ended → invalidate `['sessions', sessionId]` and `['bookings']`

---

## 7. Data Flow — Client State (Zustand)

| Store                      | State                                            | Consumers                                               |
| -------------------------- | ------------------------------------------------ | ------------------------------------------------------- |
| `useAuthStore`             | tokens, isAuthenticated, userId, role            | RootNavigator, API client                               |
| `useTrainingSessionStore`  | sessions, participants, expiring location shares | Learner, public tracking, instructor, school monitoring |
| `useSchoolOperationsStore` | school ops fixtures and local mutations          | School admin screens                                    |
| `useLocationStore`         | location consent and latest location             | Public discovery and profile                            |
| `useSettingsStore`         | theme, notifications prefs                       | Settings screens                                        |

---

## 8. Realtime Architecture

```mermaid
sequenceDiagram
    participant L as Learner App
    participant S as Socket Server
    participant V as Public Viewer

    L->>S: join session:{id}
    L->>S: location:update { lat, lng }
    V->>S: read current location with opaque share token
    S-->>V: limited public tracking projection
    L->>S: location:stop or session:end
    S-->>V: link expired
```

**Client modules:**

- `src/services/socket.ts` — connect, disconnect, emit, subscribe
- `src/features/tracking/hooks/useSessionTracking.ts`
- `src/services/location.ts` — expo-location updates while an active learner
  lesson is sharing

---

## 9. Maps Integration

`src/components/maps/AppMap.tsx` wraps `react-native-maps`:

| Use case                   | Markers          | Polylines     |
| -------------------------- | ---------------- | ------------- |
| School discovery           | School pins      | —             |
| Active lesson (instructor) | Vehicle position | Route so far  |
| Public link tracking       | Learner position | Current point |

Default region: Nigeria. User location via `expo-location` with permission prompts.

---

## 10. Notifications

`expo-notifications` + backend push tokens:

| Event             | Recipients   |
| ----------------- | ------------ |
| Booking confirmed | Learner      |
| Session started   | Learner      |
| Session completed | Learner      |
| School approved   | School admin |

Flow: register token on login → `POST /users/push-token` → handle foreground/background handlers in `src/features/notifications/`.

---

## 11. API Module Structure

```
src/lib/api/
├── client.ts           # fetch client and auth handling
├── config.ts           # API configuration
├── discover.ts         # public marketplace requests
└── index.ts
```

---

## 12. Type System

```
src/types/
├── auth.ts       # User, UserRole, AuthTokens
├── school.ts     # School, Package, Vehicle and discovery projections
├── booking.ts
├── training-session.ts
├── instructor.ts
├── school-operations.ts
└── api.ts        # ApiError, PaginatedResponse<T>
```

Canonical status vocabulary must be used end-to-end:

- training sessions: `scheduled`, `in_progress`, `completed`, `cancelled`;
- live-location shares: `requesting_permission`, `sharing`, `stopped`, `failed`;
- packages and vehicles: `isActive`;
- instructor accounts: `pending`, `active`, `suspended` plus local `invited`.

Presentation copy may say “Upcoming”, “Live”, or “Profile pending”, but those
labels must map to canonical values rather than becoming new domain statuses.

---

## 13. Error Handling

| Layer   | Strategy                                     |
| ------- | -------------------------------------------- |
| Render  | `ErrorBoundary` in root + optional per-stack |
| Query   | `isError`, `error`, retry button, toast      |
| Forms   | Zod → RHF `errors` field messages            |
| Network | NetInfo banner + Query `networkMode`         |
| Socket  | Reconnect with exponential backoff           |

---

## 14. Security Considerations

- JWT only in SecureStore
- Certificate pinning — evaluate for production (ADR TBD)
- No PII in logs
- Location shared only during active sessions
- Public tracking uses opaque, single-purpose, expiring tokens
- Live tracking exposes only the current location and limited lesson context
- Revoked, expired, failed, or completed-session links return no location

---

## 15. Scalability Notes

- Paginated list APIs for schools and bookings
- Query `staleTime` tuned per resource (schools: 5m, active session: 0)
- Image CDN URLs from API (expo-image with caching)
- Socket room per session (not global broadcast)
- Feature flags via remote config (post-MVP)

---

## 16. File Naming Conventions

| Type      | Pattern            | Example                |
| --------- | ------------------ | ---------------------- |
| Screen    | `{Name}Screen.tsx` | `SchoolListScreen.tsx` |
| Hook      | `use{Name}.ts`     | `useNearbySchools.ts`  |
| Store     | `{name}.store.ts`  | `auth.store.ts`        |
| Component | PascalCase         | `SchoolCard.tsx`       |
| API       | `{resource}.ts`    | `schools.ts`           |

---

## 17. Next Implementation Steps

1. Install dependencies (see `project_plan.md` §12)
2. Configure NativeWind + design tokens
3. Implement `RootNavigator` + auth store + secure storage
4. Scaffold empty role navigators with placeholder screens
5. Wire login API hook and role resolver
