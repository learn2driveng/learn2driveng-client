---
type: feature
status: partial
updated: 2026-06-30
tags:
  - learner
  - dashboard
  - progress
---

# Learner experience

## Primary navigation

`Home · Explore · Sessions · Progress · Profile`

## Home dashboard

The current dashboard presents:

- greeting and profile identity
- aggregate available-session balance
- completed-session and driving-hour metrics
- active package breakdown
- upcoming session
- quick actions

The aggregate balance is intentionally bank-like, but it must link to
package-specific balances because credits belong to purchases.

Current figures are static presentation values.

The dashboard and Sessions screen now handle both package-empty states:

- no purchased training packages, with a direct Explore action
- owned packages with zero remaining credits, with booking disabled

Package cards with no remaining credits cannot be selected for booking.

Expired packages are separated from active packages, excluded from the
available-session balance, and cannot be selected for booking. Their cards show
the expiry date, unused sessions, and a renewal action.

## Progress

The progress overview exists as a presentation screen. A complete progress
model should eventually show:

- completed sessions and driving hours
- curriculum/skill mastery
- instructor assessments
- attendance
- test readiness
- session-linked reports

Progress should derive from completed sessions and assessments, not manually
duplicated dashboard values.

Readiness assessments are authored and assigned by the learner's registered
school. They use short road scenarios, pass thresholds, and answer explanations
rather than generic trivia. Quiz results are a theory-readiness signal only and
must appear alongside practical lesson progress; they do not grant or replace
an FRSC certification or licence.

## Dashboard data needs

One learner-summary endpoint or composed query may provide:

- total remaining credits
- package breakdown
- next booking
- completed-session count
- driving duration
- progress summary

Cache ownership remains with TanStack Query when the API layer lands.

Related: [[03 Features/Session Booking]], [[03 Features/Profile and Settings]],
[[02 Architecture/Design System]]
