---
type: reference
status: active
updated: 2026-06-30
tags:
  - codebase
  - documentation
---

# Source map

## Code

| Path                             | Responsibility                              |
| -------------------------------- | ------------------------------------------- |
| `src/app/`                       | Expo Router routes and navigator layouts    |
| `src/components/auth/`           | Shared authentication UI                    |
| `src/components/common/`         | Generic screen/logo primitives              |
| `src/components/dashboard/`      | Dashboard, package, metric, and settings UI |
| `src/features/checkout/`         | Shared checkout shell                       |
| `src/features/location/`         | Location permission behavior and UI         |
| `src/features/school-discovery/` | Shared marketplace screens and cards        |
| `src/features/session-booking/`  | Booking UI                                  |
| `src/hooks/`                     | Fonts and theme behavior                    |
| `src/sample_data/`               | Temporary typed presentation fixtures       |
| `src/store/`                     | Zustand client state                        |
| `src/types/`                     | Shared domain and API-facing types          |
| `src/constants/`                 | Fonts, typography, theme tokens             |

## Configuration

| File                 | Responsibility                       |
| -------------------- | ------------------------------------ |
| `package.json`       | Runtime dependencies and scripts     |
| `app.json`           | Expo application configuration       |
| `tailwind.config.js` | NativeWind tokens and font utilities |
| `fonts.config.cjs`   | Shared font-family names             |
| `tsconfig.json`      | TypeScript and path aliases          |
| `AGENTS.md`          | Durable repository instructions      |

## Existing documents

| File                                      | Use                                      |
| ----------------------------------------- | ---------------------------------------- |
| `project_plan.md`                         | Original scope and proposed architecture |
| `docs/architecture.md`                    | Architecture narrative                   |
| `docs/decisions.md`                       | Historical ADRs                          |
| `docs/public-marketplace-architecture.md` | Public/protected boundary                |
| `docs/learner-screen-map.md`              | Learner screen progress                  |
| `docs/feature-roadmap.md`                 | Original phased backlog                  |
| `docs/development-milestones.md`          | Delivery milestones                      |
| `docs/environment-setup.md`               | Environment guidance                     |

## Truth hierarchy

1. Current source and `package.json` for implemented behavior.
2. `AGENTS.md` for repository working rules.
3. Accepted ADRs for intended durable direction.
4. Roadmaps/plans for future work.
5. This vault as a linked synthesis—update it when any layer changes.

Related: [[04 Delivery/Current State]], [[04 Delivery/Decision Index]]
