---
type: reference
status: active
updated: 2026-06-30
tags:
  - commands
  - development
---

# Developer commands

Run commands from the repository root.

## Install

```bash
npm install
```

## Static verification

```bash
npx tsc --noEmit
npx prettier --check .
npm run lint
git diff --check
```

## Development

```bash
npm run start
npm run ios
npm run android
npm run web
```

Follow repository instructions in `../AGENTS.md`. UI work requires temporary
visual QA and the development server must be stopped before handoff. Do not
leave local servers running.

## Project rules worth remembering

- Consult the exact Expo SDK 56 documentation before changing Expo code.
- Preserve unrelated changes in a dirty worktree.
- Use Expo Router imports for navigation.
- Keep public discovery public.
- Keep checkout outside learner tabs.
- Reuse feature screens instead of cloning public/authenticated discovery UI.
- TypeScript and formatting checks do not replace device-level visual QA.

Related: [[02 Architecture/Architecture Overview]],
[[04 Delivery/Current State]]
