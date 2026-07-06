---
type: feature
status: presentation-complete
updated: 2026-06-30
tags:
  - checkout
  - payments
---

# Checkout

## Route ownership

Checkout lives at `(app)/checkout/[schoolId]` as a protected root stack. It is
intentionally outside the learner tabs and outside Explore.

## Current flow

`package selection → payment method → review → result → session booking`

The screens resolve school/package data from local catalogue fixtures and
present the purchase flow. Payment is not yet integrated.

The result route renders successful, pending, failed, and cancelled
presentations from a status parameter. UI-only outcomes are mapped by payment
method in `src/sample_data/payment-results.ts` so every variation remains
reviewable without implying real provider behavior.

## Payment rules

- Mobile clients must never contain payment-provider secrets.
- The backend creates payment intents/references and verifies webhooks.
- The app displays provider UI or redirects using backend-issued information.
- A successful provider screen is not sufficient proof; backend verification
  is the source of truth.
- Package ownership and credits are created once, idempotently.

## Required API concepts

- payment intent/reference
- amount and currency snapshot
- pending/succeeded/failed state
- verified purchase result
- package-purchase identifier
- idempotency key

## UX states still needed

- network loss during provider handoff
- provider success awaiting backend verification
- duplicate retry

Related: [[01 Product/Domain Model]], [[03 Features/Session Booking]],
[[04 Delivery/Open Questions and Risks]]
