---
type: feature
status: partial
updated: 2026-06-30
tags:
  - profile
  - settings
---

# Profile and settings

## Current areas

- profile summary
- view account
- notification preferences
- notification centre with a preferences handoff
- location settings
- light/dark appearance summary
- FAQ-based help centre
- contact-support and problem-report forms
- logout

## Current state ownership

Theme preference and location-prompt dismissal live in `useSettingsStore`.
Profile identity is currently presentation content, not fetched user data.

## Production needs

- Profile query and edit mutation
- Verified phone/email states
- Notification permission and backend preference split
- Default/manual location separate from device permission
- Full appearance selection UI
- Support-service endpoint and delivery status
- Account deletion and legal/privacy links
- Logout that clears secure tokens and query caches

## Permission principle

Location settings should explain:

1. device permission state
2. what location improves
3. fallback/default area
4. whether another OS prompt is possible
5. when device Settings must be opened

Related: [[03 Features/Authentication and Entry]],
[[02 Architecture/State and Data]]
