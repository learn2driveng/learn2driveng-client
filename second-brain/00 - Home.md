---
type: map
status: active
updated: 2026-06-30
tags:
  - learn2drive
  - home
---

# Learn2Drive project brain

> [!summary]
> Learn2Drive is a Nigeria-first mobile marketplace and training platform that
> connects learners to FRSC-verified driving schools, paid training packages,
> bookable sessions, and measurable driving progress.

Open the visual overview: [[Learn2Drive Map.canvas]]

## Product

- [[01 Product/Product Overview]]
- [[01 Product/Domain Model]]
- [[01 Product/User Roles]]
- [[01 Product/Core Journeys]]
- [[01 Product/Glossary]]

## Architecture

- [[02 Architecture/Architecture Overview]]
- [[02 Architecture/Navigation and Route Map]]
- [[02 Architecture/State and Data]]
- [[02 Architecture/Design System]]
- [[02 Architecture/Component Catalog]]
- [[02 Architecture/Engineering Principles]]

## Feature knowledge

- [[03 Features/Authentication and Entry]]
- [[03 Features/Public Marketplace]]
- [[03 Features/Checkout]]
- [[03 Features/Session Booking]]
- [[03 Features/Learner Experience]]
- [[03 Features/Profile and Settings]]
- [[03 Features/Future Role Dashboards]]

## Delivery

- [[04 Delivery/Current State]]
- [[04 Delivery/Roadmap]]
- [[04 Delivery/Decision Index]]
- [[04 Delivery/Open Questions and Risks]]
- [[Inbox]]

## Reference

- [[05 Reference/Route Inventory]]
- [[05 Reference/Developer Commands]]
- [[05 Reference/Source Map]]
- [[06 Templates/Feature Note Template]]
- [[06 Templates/ADR Template]]
- [[06 Templates/Work Session Template]]

## Current focus

The learner vertical is the active implementation slice:

`public discovery → package purchase → session booking → session management → progress`

The next major technical shift is replacing presentation mock data with a real
API layer while preserving the public marketplace boundary.
