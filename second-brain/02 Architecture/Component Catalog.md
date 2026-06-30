---
type: reference
status: active
updated: 2026-06-30
tags:
  - components
  - reuse
---

# Component catalog

## Auth components

Location: `../src/components/auth/`

| Component           | Responsibility                                          |
| ------------------- | ------------------------------------------------------- |
| `AuthScreen`        | Shared auth layout and safe-area-aware screen shell     |
| `AuthField`         | Labelled icon field with optional secure-entry behavior |
| `AuthPrimaryButton` | Primary auth CTA                                        |
| `AuthDivider`       | Social-auth separator                                   |
| `SocialAuthButtons` | Google and Apple actions                                |
| `AuthFooterLink`    | Login/sign-up cross-link                                |

## Dashboard components

Location: `../src/components/dashboard/`

| Component             | Responsibility                                          |
| --------------------- | ------------------------------------------------------- |
| `DashboardScreen`     | Shared dashboard scroll/safe-area shell                 |
| `DashboardEmptyState` | Reusable dashboard empty state with one recovery action |
| `DashboardPageHeader` | Back navigation and page title                          |
| `SectionHeader`       | Section title and optional action                       |
| `PackageCreditCard`   | Package balance and selectable/navigation states        |
| `StatCard`            | Compact metric card                                     |
| `QuickAction`         | Dashboard action tile                                   |
| `SettingsRow`         | Navigable or destructive settings item                  |
| `ToggleSettingRow`    | Labelled preference switch                              |

## Feature components

### School discovery

- `SchoolCard`
- `FilterChip`
- Shared Explore, school-detail, and package-selection screens

### Booking

- `BookingCard`
- `BookingCancellationModal`
- `BookingOptionCard`
- `BookingStepIndicator`

### Checkout

- `CheckoutShell`

### Location

- `LocationPermissionGate`
- `useLocationPermission`

## Reuse rule

Add a component when a pattern has shared behavior, semantic meaning, or
repeated visual structure. Do not abstract a one-off wrapper only to reduce a
few lines. Route files should remain readable compositions of shared pieces.

Related: [[02 Architecture/Design System]], [[05 Reference/Source Map]]
