# Environment Setup Guide

Local development setup for the Learn2Drive mobile application.

---

## Prerequisites

| Tool                 | Version      | Notes                             |
| -------------------- | ------------ | --------------------------------- |
| Node.js              | 20 LTS or 22 | `node -v`                         |
| npm                  | 10+          | Bundled with Node                 |
| Git                  | Latest       |                                   |
| Xcode                | 15+          | macOS only, for iOS Simulator     |
| Android Studio       | Latest       | Android SDK, emulator             |
| Expo Go or dev build | SDK 56       | Match `package.json` Expo version |

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

| Variable                              | Required        | Description                                           |
| ------------------------------------- | --------------- | ----------------------------------------------------- |
| `EXPO_PUBLIC_API_URL`                 | Yes             | REST API base URL                                     |
| `EXPO_PUBLIC_SOCKET_URL`              | No              | Socket.IO server URL; defaults to the REST API origin |
| `EXPO_PUBLIC_GOOGLE_MAPS_WEB_API_KEY` | Web maps        | Browser/referrer-restricted Maps JavaScript API key   |
| `EXPO_PUBLIC_GOOGLE_MAPS_MAP_ID`      | No              | Google Cloud map ID for the web marker style          |
| `GOOGLE_MAPS_ANDROID_API_KEY`         | Android maps    | Android app-restricted Maps SDK key                   |
| `GOOGLE_MAPS_IOS_API_KEY`             | iOS Google maps | iOS app-restricted Maps SDK key                       |
| `EXPO_PUBLIC_APP_ENV`                 | No              | `development` \| `staging` \| `production`            |

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
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#208AEF",
        secondary: "#6366F1",
        success: "#22C55E",
        warning: "#F59E0B",
        error: "#EF4444",
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

Use separate Google Cloud keys so each platform can enforce the correct
application restriction. Enable Maps JavaScript API, Maps SDK for Android, and
Maps SDK for iOS in the Google Cloud project.

### Web

Set `EXPO_PUBLIC_GOOGLE_MAPS_WEB_API_KEY` and restrict it to the production web
domain plus the local origins used for development. The key is loaded with
Google's `@googlemaps/js-api-loader`; it is intentionally present in the web
bundle, so HTTP referrer restrictions are required.

### Android

Set `GOOGLE_MAPS_ANDROID_API_KEY`. Restrict the key to package
`com.learn2drive.ng` and every signing certificate SHA-1 used by development,
preview, and Play builds.

`app.config.ts` passes the key to the Expo SDK 56 `react-native-maps` config
plugin at build time.

### iOS

Set `GOOGLE_MAPS_IOS_API_KEY` and restrict it to bundle identifier
`com.learn2drive.ng`. `app.config.ts` configures the native Google map provider.

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

1. Use a physical device or a compatible Android emulator with Google Play services
2. Configure `expo-notifications` in `app.json`
3. Request permissions on first relevant screen
4. Register token with backend after login

Remote push must be tested in an updated development build. Expo Go does not
provide this project's native push configuration.

---

## 10. Socket.IO Local Development

If realtime traffic uses a different origin from the REST API, point
`EXPO_PUBLIC_SOCKET_URL` to the local backend:

```
EXPO_PUBLIC_SOCKET_URL=http://localhost:7777
```

For Android emulator, use `10.0.2.2` instead of `localhost` for host machine.

---

## 11. Secure Storage

`expo-secure-store` works on device/simulator. No extra config for MVP.

Test auth token persistence across app restarts during auth milestone.

---

## 12. Troubleshooting

| Issue                 | Fix                                       |
| --------------------- | ----------------------------------------- |
| Metro cache stale     | `npx expo start -c`                       |
| iOS pod errors        | `cd ios && pod install` after prebuild    |
| Maps blank            | Verify API key, use dev build             |
| Module not found `@/` | Restart TS server; check `tsconfig paths` |
| Reanimated errors     | Ensure babel plugin per Expo 56 docs      |

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
