# INTEGRATIONS.md — External Services & APIs

## External APIs

**None currently integrated.** This is a greenfield Expo starter with no backend, database, or third-party API calls present.

## Authentication

**None.** No auth provider (Clerk, Supabase, Firebase Auth, etc.) is integrated.

## Databases / Storage

**None.** No local storage (AsyncStorage, SQLite, MMKV) or remote database is used.

## Analytics / Observability

**None.** No analytics SDK (Segment, Amplitude, PostHog, Sentry, etc.) installed.

## Push Notifications

**None.** `expo-notifications` is not installed.

## In-App Browser

- **expo-web-browser** is used by `components/external-link.tsx` to open external URLs in-app on iOS/Android
- Uses `WebBrowserPresentationStyle.AUTOMATIC`
- Falls back to default `<Link target="_blank">` on web

## Deep Linking

- **expo-linking** installed but not yet configured beyond Expo Router defaults
- expo-router provides automatic deep link handling based on file-based routes

## Platform Environment Detection

- `process.env.EXPO_OS` used in `components/haptic-tab.tsx` and `components/external-link.tsx` to detect iOS vs. web at runtime

## Fonts

- Platform system fonts used via `constants/theme.ts` `Fonts` export
- No custom font files loaded via `expo-font` yet (package installed but unused)

## Image Assets

- Static local assets in `assets/images/`
- `expo-image` used for performant image rendering (no CDN or remote image URLs present yet)

## Future Integration Opportunities

Based on current setup, likely candidates:
- Backend API (REST or GraphQL)
- Auth provider (Supabase / Clerk are common Expo choices)
- Push notifications via `expo-notifications`
- Analytics / crash reporting (Sentry)
