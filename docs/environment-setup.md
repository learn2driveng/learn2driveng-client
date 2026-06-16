# Environment Setup Guide

Local development setup for the Learn2Drive mobile application.

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | 20 LTS or 22 | `node -v` |
| npm | 10+ | Bundled with Node |
| Git | Latest | |
| Xcode | 15+ | macOS only, for iOS Simulator |
| Android Studio | Latest | Android SDK, emulator |
| Expo Go or dev build | SDK 56 | Match `package.json` Expo version |

Optional:
- [EAS CLI](https://docs.expo.dev/build/setup/) — `npm install -g eas-cli`
- Watchman (macOS) — `brew install watchman`

---

## 1. Clone & Install

```bash
git clone <repository-url>
cd learn2driveng-client
npm install
```

---

## 2. Environment Variables

```bash
cp .env.example .env
```

| Variable | Required | Description |
|----------|----------|-------------|
| `EXPO_PUBLIC_API_URL` | Yes | REST API base URL |
| `EXPO_PUBLIC_SOCKET_URL` | Yes | Socket.IO server URL |
| `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` | Android maps | Google Maps API key |
| `EXPO_PUBLIC_APP_ENV` | No | `development` \| `staging` \| `production` |

Access in code:

```typescript
const apiUrl = process.env.EXPO_PUBLIC_API_URL;
```

**Never commit `.env`** — it is gitignored via `.env*.local` pattern; keep secrets out of repo.

---

## 3. Install Application Dependencies

After cloning, install the full stack (see `project_plan.md` for details):

```bash
npx expo install \
  @react-navigation/native \
  @react-navigation/native-stack \
  @react-navigation/bottom-tabs \
  react-native-screens \
  react-native-safe-area-context \
  react-native-gesture-handler \
  react-native-reanimated \
  react-native-maps \
  expo-notifications \
  expo-secure-store \
  expo-location \
  @react-native-community/netinfo

npm install \
  @tanstack/react-query \
  zustand \
  react-hook-form \
  @hookform/resolvers \
  zod \
  socket.io-client \
  nativewind \
  tailwindcss
```

---

## 4. NativeWind Configuration

1. Initialize Tailwind:

```bash
npx tailwindcss init
```

2. `tailwind.config.js` — include NativeWind preset and content paths:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#208AEF',
        secondary: '#6366F1',
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444',
      },
    },
  },
  plugins: [],
};
```

3. Add `global.css` and import in root layout (per [NativeWind Expo docs](https://www.nativewind.dev/getting-started/expo-router)).

4. Update `babel.config.js` with NativeWind babel preset if required by installed version.

Refer to Expo SDK 56 + NativeWind v4 docs for exact steps at install time.

---

## 5. Google Maps Setup

### Android

Add to `app.json` under `expo.android.config.googleMaps.apiKey` or use `expo-build-properties` plugin.

Set `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` in `.env`.

### iOS

Enable Maps in Apple Developer account. Configure API key in `app.json` ios config per Expo maps guide.

### Development build

`react-native-maps` requires a **development build** for full native map support — Expo Go has limitations. Run:

```bash
npx expo prebuild
npx expo run:ios
# or
npx expo run:android
```

---

## 6. Running the App

```bash
# Start Metro
npx expo start

# Platform shortcuts
npm run ios
npm run android
npm run web
```

Press `i` for iOS Simulator, `a` for Android emulator.

---

## 7. ESLint & Prettier

```bash
npx expo lint
```

Recommended `.vscode/settings.json` (already partially configured):

- Format on save
- ESLint fix on save

Add Prettier config when Milestone 0 tooling task completes:

```bash
npm install -D prettier eslint-config-prettier
```

---

## 8. TypeScript

Strict mode enabled in `tsconfig.json`. Path aliases:

```json
"@/*": ["./src/*"]
```

Import example: `import { Button } from '@/components/common/Button'`.

---

## 9. Push Notifications (Local Dev)

1. Physical device recommended for push testing
2. Configure `expo-notifications` in `app.json`
3. Request permissions on first relevant screen
4. Register token with backend after login

Simulator: local notifications only; remote push requires device.

---

## 10. Socket.IO Local Development

Point `EXPO_PUBLIC_SOCKET_URL` to local backend:

```
EXPO_PUBLIC_SOCKET_URL=http://localhost:3001
```

For Android emulator, use `10.0.2.2` instead of `localhost` for host machine.

---

## 11. Secure Storage

`expo-secure-store` works on device/simulator. No extra config for MVP.

Test auth token persistence across app restarts during auth milestone.

---

## 12. Troubleshooting

| Issue | Fix |
|-------|-----|
| Metro cache stale | `npx expo start -c` |
| iOS pod errors | `cd ios && pod install` after prebuild |
| Maps blank | Verify API key, use dev build |
| Module not found `@/` | Restart TS server; check `tsconfig paths` |
| Reanimated errors | Ensure babel plugin per Expo 56 docs |

---

## 13. EAS Build (Staging / Production)

```bash
eas login
eas build:configure
eas build --platform all --profile preview
```

Configure `eas.json` profiles for `development`, `preview`, `production`.

---

## 14. Backend Dependency

The mobile app expects a Learn2Drive API implementing:

- `POST /auth/login`, `/auth/register`, `/auth/refresh`, `/auth/forgot-password`
- REST resources for schools, bookings, sessions, etc.
- Socket.IO server with JWT auth on handshake

Use mock server or staging API URL until backend is available.
