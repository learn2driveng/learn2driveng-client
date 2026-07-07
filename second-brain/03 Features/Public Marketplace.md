---
type: feature
status: presentation-complete
updated: 2026-06-30
tags:
  - marketplace
  - schools
  - public
---

# Public marketplace

## Product boundary

The public marketplace includes:

- location consent and a fallback when permission is declined
- school search and filters
- school profiles
- FRSC trust status
- ratings
- instructors
- vehicles
- training packages

Authentication starts when a user attempts a transactional or personal action.

## Code organization

Routes under both `(public)/explore` and `(app)/student/explore` reuse:

- `src/features/school-discovery/screens/explore-screen.tsx`
- `school-detail-screen.tsx`
- `package-selection-screen.tsx`

This avoids two divergent discovery experiences.

## Current data

`src/sample_data/schools.ts` contains three typed school fixtures with
packages, instructors, and vehicles. This is presentation data.

The shared Explore screen distinguishes an empty school catalogue from filters
that produce no matches. Both states provide a relevant recovery action.

## Handoff to checkout

Package selection should carry stable school and package identifiers into the
protected checkout route. If signed out, login should preserve and resume that
destination.

## Next implementation needs

- Catalogue/search API
- Loading, failure, offline, and retry states when an async source exists
- Pagination and proper list virtualization
- Server-controlled FRSC status
- Real distance from resolved location
- Image/CDN strategy
- Saved-school behavior
- Map/list view when map dependencies are ready

Related: [[03 Features/Checkout]], [[02 Architecture/Navigation and Route Map]],
[[01 Product/Product Overview]]
