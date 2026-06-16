# Learn2Drive Mobile — Architecture

Initial architecture documentation for the Learn2Drive React Native application.

---

## 1. System Context

```
┌─────────────────────────────────────────────────────────────┐
│                    Learn2Drive Mobile App                    │
│  (Expo / React Native — Learner, Guardian, Instructor,      │
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
│  Screens (src/screens/)                     │  ← Navigation targets
├────────────────────────────────────────────┤
│  Features (src/features/)                 │  ← Domain UI + hooks
├────────────────────────────────────────────┤
│  Components (src/components/)             │  ← Shared UI
├────────────────────────────────────────────┤
│  Navigation (src/navigation/)             │  ← Role stacks
├────────────────────────────────────────────┤
│  API Hooks (src/api/)                       │  ← TanStack Query
├────────────────────────────────────────────┤
│  Store (src/store/)                         │  ← Zustand client state
├────────────────────────────────────────────┤
│  Services (src/services/)                 │  ← Socket, location, push
└────────────────────────────────────────────┘
```

**Dependency rule:** Upper layers depend on lower layers. Features must not import from screens. API layer must not import from features.

---

## 3. App Bootstrap

`src/app/_layout.tsx` responsibilities:

1. Load fonts / splash
2. Wrap app with providers:
   - `QueryClientProvider`
   - `NavigationContainer` (if not inside RootNavigator)
   - Theme / SafeArea
3. Render `RootNavigator`

```typescript
// Illustrative — not yet implemented
export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <RootNavigator />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
```

---

## 4. Navigation Architecture

### 4.1 Root Flow

```mermaid
flowchart TD
    A[App Launch] --> B{Token in SecureStore?}
    B -->|No| C[AuthStack]
    B -->|Yes| D[Validate / Refresh Token]
    D -->|Invalid| C
    D -->|Valid| E{user.role}
    E -->|learner| F[LearnerNavigator]
    E -->|guardian| G[GuardianNavigator]
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

### 4.3 Auth Stack

| Screen | Route name |
|--------|------------|
| Splash | `Splash` |
| Login | `Login` |
| Register | `Register` |
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
['schools', 'nearby', { lat, lng, radius }]
['bookings', 'list', { status, page }]
['sessions', 'detail', sessionId]
```

**Invalidation examples:**
- After booking created → invalidate `['bookings']`
- After session ended → invalidate `['sessions', sessionId]` and `['bookings']`

---

## 7. Data Flow — Client State (Zustand)

| Store | State | Consumers |
|-------|-------|-----------|
| `useAuthStore` | tokens, isAuthenticated, userId, role | RootNavigator, API client |
| `useSelectionStore` | selectedSchool, selectedPackage | Booking flow |
| `useSessionStore` | activeSession, coordinates | Instructor tracking, maps |
| `useUIStore` | modals, bottom sheets | Global UI |
| `useSettingsStore` | theme, notifications prefs | Settings screens |

---

## 8. Realtime Architecture

```mermaid
sequenceDiagram
    participant I as Instructor App
    participant S as Socket Server
    participant G as Guardian App

    I->>S: join session:{id}
    I->>S: location:update { lat, lng }
    S->>G: location:update (subscribed)
    I->>S: session:end
    S->>G: session:ended
```

**Client modules:**
- `src/services/socket.ts` — connect, disconnect, emit, subscribe
- `src/features/tracking/hooks/useSessionTracking.ts`
- `src/services/location.ts` — expo-location background updates (instructor)

---

## 9. Maps Integration

`src/components/maps/AppMap.tsx` wraps `react-native-maps`:

| Use case | Markers | Polylines |
|----------|---------|-----------|
| School discovery | School pins | — |
| Active lesson (instructor) | Vehicle position | Route so far |
| Guardian tracking | Learner vehicle | Live route |

Default region: Nigeria. User location via `expo-location` with permission prompts.

---

## 10. Notifications

`expo-notifications` + backend push tokens:

| Event | Recipients |
|-------|------------|
| Booking confirmed | Learner |
| Session started | Guardian, Learner |
| Session completed | Guardian, Learner |
| School approved | School admin |

Flow: register token on login → `POST /users/push-token` → handle foreground/background handlers in `src/features/notifications/`.

---

## 11. API Module Structure

```
src/api/
├── client.ts           # fetch/axios + interceptors
├── query-client.ts     # TanStack QueryClient defaults
├── query-keys.ts
├── auth.ts
├── schools.ts
├── instructors.ts
├── vehicles.ts
├── bookings.ts
├── sessions.ts
├── reviews.ts
└── hooks/
    ├── useLogin.ts
    ├── useSchools.ts
    └── ...
```

---

## 12. Type System

```
src/types/
├── auth.ts       # User, UserRole, AuthTokens
├── school.ts     # DrivingSchool, FRSCStatus
├── booking.ts
├── session.ts
├── vehicle.ts
├── instructor.ts
└── api.ts        # ApiError, PaginatedResponse<T>
```

---

## 13. Error Handling

| Layer | Strategy |
|-------|----------|
| Render | `ErrorBoundary` in root + optional per-stack |
| Query | `isError`, `error`, retry button, toast |
| Forms | Zod → RHF `errors` field messages |
| Network | NetInfo banner + Query `networkMode` |
| Socket | Reconnect with exponential backoff |

---

## 14. Security Considerations

- JWT only in SecureStore
- Certificate pinning — evaluate for production (ADR TBD)
- No PII in logs
- Location shared only during active sessions
- Guardian linked to learner via server-verified relationship

---

## 15. Scalability Notes

- Paginated list APIs for schools and bookings
- Query `staleTime` tuned per resource (schools: 5m, active session: 0)
- Image CDN URLs from API (expo-image with caching)
- Socket room per session (not global broadcast)
- Feature flags via remote config (post-MVP)

---

## 16. File Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Screen | `{Name}Screen.tsx` | `SchoolListScreen.tsx` |
| Hook | `use{Name}.ts` | `useNearbySchools.ts` |
| Store | `{name}.store.ts` | `auth.store.ts` |
| Component | PascalCase | `SchoolCard.tsx` |
| API | `{resource}.ts` | `schools.ts` |

---

## 17. Next Implementation Steps

1. Install dependencies (see `project_plan.md` §12)
2. Configure NativeWind + design tokens
3. Implement `RootNavigator` + auth store + secure storage
4. Scaffold empty role navigators with placeholder screens
5. Wire login API hook and role resolver
