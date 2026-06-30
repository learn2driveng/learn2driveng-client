---
type: feature
status: presentation-complete
updated: 2026-06-30
tags:
  - sessions
  - booking
---

# Session booking

## Product rule

Package selection happens before the booking wizard:

`select owned package → Book → available date/time → instructor → review`

The wizard must not ask for the package again. It displays the chosen package
as fixed context and debits one session from that package.

## Current implementation

The Sessions screen:

- shows total available credits
- shows an upcoming booking
- lists active packages
- requires selecting a package before enabling **Book**

The booking screen:

- receives `packageName` and optional `schoolName`
- uses three steps: Schedule, Instructor, Review
- displays the selected package
- forwards the final selection to confirmation

Related screens include history, detail, reschedule, cancellation, and
confirmation. They use typed presentation data from
`src/sample_data/bookings.ts`.

Cancellation uses a dedicated confirmation sheet that repeats the lesson and
package, explains that credit return depends on school policy, preserves a
clear “Keep lesson” escape, and shows confirmation after cancellation.

## Availability model needed

A real slot should identify:

- school
- package/purchase eligibility
- start and end time
- timezone
- location
- eligible instructors
- vehicle/transmission constraints
- capacity
- hold expiry

## Credit behavior

The backend should reserve or debit the selected package purchase atomically
with booking confirmation. The UI may show `10 → 9`, but cannot calculate the
authoritative balance itself.

## Missing states

- no available dates
- no instructors for a chosen slot
- slot taken while reviewing
- insufficient/expired package credit
- booking hold expiry
- cancellation and reschedule policy
- API loading and errors

Related: [[01 Product/Domain Model]], [[01 Product/Core Journeys]],
[[04 Delivery/Open Questions and Risks]]
