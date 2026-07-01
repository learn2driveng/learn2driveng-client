---
type: design-system
status: active
updated: 2026-06-30
tags:
  - design-system
  - ui
---

# Design system

## Visual character

Learn2Drive uses a dark navy and safety-amber identity with pale neutral
surfaces. The interface should feel trustworthy, calm, modern, and operational,
not playful or visually noisy.

## Theme tokens

Defined in `../src/constants/theme.ts` and resolved through
`../src/hooks/use-app-theme.ts`.

| Token                          | Light value/use                           |
| ------------------------------ | ----------------------------------------- |
| `primary`                      | `#FFB800`, important actions and emphasis |
| `background`                   | `#F8F9FA`, page background                |
| `surface`                      | `#FFFFFF`, cards and fields               |
| `text` / `contrastSurface`     | `#0A192F`, main text and dark hero cards  |
| `textMuted`                    | `#64748B`, secondary copy                 |
| `border`                       | `#E2E8F0`, low-emphasis separation        |
| `success`, `verified`, `error` | Semantic feedback                         |

Every new screen should use `useAppTheme()` instead of hard-coding equivalents.

## Typography

Figtree is the established app UI face for auth and dashboard work:

- `font-figtree`
- `font-figtree-medium`
- `font-figtree-semibold`
- `font-figtree-bold`

Inter and Space Grotesk remain loaded for older onboarding/marketing UI. New
product screens should default to Figtree unless a deliberate design decision
changes this.

## Layout rules

- Respect safe-area insets at screen boundaries.
- Prefer shared `AuthScreen`, `DashboardScreen`, and page-header shells.
- Preserve a clear vertical rhythm; avoid arbitrary per-screen spacing fixes.
- Inputs and major actions should be comfortably touchable.
- Selected and disabled states must be visible and represented through
  accessibility state.
- Shared headings identify themselves as headings for screen readers.
- Interactive components provide deliberate labels instead of relying on
  concatenated child text.
- Controls without handlers must render and announce as disabled.
- Interactive elements must not be nested inside other interactive elements.
- Dynamic success and empty states should announce changes through appropriate
  live regions.
- Use package-specific context during booking.
- A total session balance may be prominent, but package breakdown must remain
  accessible.

## Theme status

Light and dark palettes exist and the app follows the system by default.
NativeWind is configured with `darkMode: "media"`, while runtime components
mostly use explicit theme tokens.

Related: [[02 Architecture/Component Catalog]],
[[03 Features/Learner Experience]]
