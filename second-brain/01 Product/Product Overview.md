---
type: product
status: active
updated: 2026-06-30
tags:
  - product
  - vision
---

# Product overview

## Product promise

Learn2Drive helps a learner find a trusted driving school, pay for an
appropriate training package, book the sessions included in that package, and
understand their progress.

The trust layer is important: schools are presented as FRSC-verified, with
location, ratings, instructors, vehicles, and package details visible before
authentication.

## Core product principles

1. **Browse before login.** School discovery and package comparison are public.
2. **Authenticate at intent.** Login is required for payment, booking, saved or
   personal information.
3. **Packages own credits.** A learner can own multiple packages. The dashboard
   may show a total balance, but each credit remains attributable to a package.
4. **Booking consumes a package session.** Select package first, then choose an
   available date/time and instructor.
5. **Role-specific experiences share one domain.** Learners, guardians,
   instructors, schools, and platform administrators see different views of the
   same bookings and sessions.
6. **Nigeria first.** NGN, Nigerian locations and phone formats, and FRSC trust
   signals are defaults.

## MVP outcome

A learner should be able to complete this usable loop:

[[03 Features/Public Marketplace|Discover school]]
→ [[03 Features/Checkout|buy package]]
→ [[03 Features/Session Booking|book session]]
→ manage the booking
→ see progress.

## Product boundaries

The mobile client owns presentation, local interaction state, and device
capabilities. The backend must own identity, authorization, inventory,
availability, payment truth, credit balances, booking rules, and session state.

Related: [[01 Product/Domain Model]], [[01 Product/Core Journeys]],
[[04 Delivery/Current State]]
