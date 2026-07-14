# Guardian Access Architecture

## Decision

Guardian access is learner-managed and session-bound. A guardian is not treated
as a broad learner account owner. The learner creates a trusted safety contact,
invites that person, and chooses whether that contact can view live location
during each active lesson.

In the product UI, use **Safety contacts** or **Trusted guardians**. Avoid
calling this a “temporary account” in learner-facing copy.

## Why

The guardian use case is narrow: help someone trusted monitor a learner during
a driving lesson. That does not justify exposing packages, payments, private
profile details, or full learner history by default.

This keeps the model ethical and easier to reason about:

- catalogue discovery remains public;
- learner personal data remains protected;
- guardian access is explicit, revocable, and time-limited;
- live location is visible only during active training sessions.

## Lifecycle

```text
Learner adds safety contact
  → Backend creates GuardianLink
  → Guardian receives invite link/code
  → Guardian verifies invite, usually by OTP
  → Link becomes active
  → Learner starts live sharing for a specific active lesson
  → Guardian can view the map while included in that session share
  → Lesson ends or learner stops sharing
  → Location visibility stops automatically
```

## Route ownership

| Area | Responsibility |
| --- | --- |
| Learner Profile / Safety contacts | Create, resend, revoke, and inspect guardian links |
| Learner live-location screen | Select which active guardian links can view the current lesson |
| Guardian dashboard | Show linked learners and active session availability |
| Guardian session tracking | Show live map only when the guardian link is included in the active share |

## Client module boundary

Learner-side access management lives in `src/features/guardian-access`. This
includes the safety-contact list, invite form, and local presentation actions.

Guardian-side viewing remains in `src/features/guardian`. That module should
focus on linked learner views, active-session cards, and live map presentation.

During the local UI phase, `useGuardianAccessStore` is the shared state bridge
between both sides. In production, replace it with backend-backed guardian-link
queries and mutations.

## Domain model

`GuardianLink` is the relationship object. It should be owned by the learner and
validated by the backend.

Required concepts:

- learner id
- guardian display name
- guardian phone or email
- relationship label
- invite status
- link status
- expiry
- revoked timestamp
- last accessed timestamp

`LiveLocationShare` is session-bound. It stores the active session id,
learner id, selected guardian link ids, current share status, and latest
location payload.

## Permission rules

A guardian can view live location only when all conditions are true:

1. the learner has an active training session;
2. the guardian link is active, not expired, and not revoked;
3. the learner selected that guardian link for the current session share;
4. the learner’s device is currently publishing location;
5. the backend authorizes the guardian against the selected link and session.

When the lesson ends, sharing stops automatically.

## Data boundaries

Guardians may see:

- learner display name;
- active lesson status;
- school/instructor context needed for safety;
- live map during an active shared lesson;
- “no active session” or “sharing stopped” states.

Guardians should not see by default:

- learner payment data;
- package purchase details beyond basic active training context;
- private account/profile fields;
- full progress reports unless explicitly added later;
- historical location trails unless the product introduces a clear consent
  model for that.

## API notes

Suggested endpoints:

- `POST /learner/guardian-links`
- `POST /learner/guardian-links/:id/resend`
- `POST /learner/guardian-links/:id/revoke`
- `POST /guardian/invites/:token/verify`
- `POST /sessions/:id/location-share`
- `DELETE /sessions/:id/location-share`

The client route boundary is not security. The backend must validate every
guardian read against the guardian link, session, and share state.
