# Live Location Sharing Architecture

## Decision

Live lesson tracking uses learner-controlled, expiring public links. A viewer
does not create a guardian account, install the app, or establish a permanent
relationship with the learner.

The learner creates a private link from an active lesson and shares it through
the device share sheet. Anyone holding that link can view the deliberately
limited public tracking screen until the learner stops sharing, the lesson
ends, or the link expires.

## Why

The viewer’s need is temporary and narrow: confirm that someone they trust is
safe during a driving lesson. A separate guardian identity, invitation,
approval and learner-link lifecycle adds friction without improving that core
experience.

This model keeps the boundaries clearer:

- school discovery remains public;
- learner account data remains protected;
- the shared URL grants access only to one active lesson;
- the learner can revoke access immediately;
- no historical route or permanent learner relationship is created.

## Lifecycle

```text
Instructor starts lesson
  → Learner opens Live location
  → Learner grants foreground location permission
  → Backend creates an opaque, single-purpose share token
  → Learner sends the public HTTPS link through the device share sheet
  → Viewer opens the public tracking page without authentication
  → Learner location updates while the lesson remains active
  → Learner stops sharing, lesson ends, or token expires
  → Public link returns an expired state and no location data
```

## Route ownership

| Route                                        | Authentication | Responsibility                                                 |
| -------------------------------------------- | -------------- | -------------------------------------------------------------- |
| `/student/sessions/:bookingId/live-location` | Learner        | Create, share and revoke the current lesson link               |
| `/track/:shareToken`                         | Public token   | Display limited current-lesson information and latest location |

The public tracking route lives under the public route group. It must never be
redirected through login.

## Client module boundary

`src/features/live-location` owns the shared map and public tracking
presentation. `useTrainingSessionStore` currently provides local UI state while
the backend contract is being integrated.

The client-generated preview token is not the production security boundary.
Production tokens must be generated, hashed and validated by the backend.

## Domain model

`LiveLocationShare` is session-scoped and contains:

- session and learner IDs;
- opaque share token and public URL;
- `requesting_permission`, `sharing`, `stopped`, or `failed` status;
- current coordinates and update timestamp;
- creation/start, expiry and end timestamps;
- location failure reason.

There is no `GuardianLink`, recipient list or guardian user ID in the sharing
model.

## Public data boundary

The public viewer may see:

- learner first/display name;
- active lesson status;
- school and instructor display names;
- general operating area;
- latest location and freshness;
- link-expired or sharing-stopped state.

The viewer must not receive:

- learner phone, email, date of birth or home address;
- payments, package balances or profile data;
- authentication identifiers;
- historical location trails;
- other sessions or learners.

## Production API contract

Suggested endpoints:

- `POST /training-sessions/:id/location-share-links`
- `PUT /training-sessions/:id/location-share-links/current/location`
- `DELETE /training-sessions/:id/location-share-links/current`
- `GET /public/location-share-links/:token`

The create, update and revoke operations require the authenticated learner and
must verify that the learner participates in the active session.

The public read endpoint must:

- hash the presented token before lookup;
- return `404` or `410` for unknown, revoked, ended or expired shares;
- return only the public projection described above;
- be rate-limited and excluded from logs and analytics payloads;
- never return the token hash, learner ID or session ID.

## Expiry and revocation rules

Sharing becomes unavailable immediately when any condition fails:

1. the lesson is no longer `in_progress`;
2. the learner revokes the link;
3. the share reaches its absolute expiry;
4. learner location publishing stops because permission or services fail.

Creating a new share after revocation must issue a new token. Old tokens must
never become valid again.
