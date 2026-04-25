# STACK.md — Technology Stack

## Runtime & Language

| Layer | Technology | Version |
|-------|-----------|---------|
| Language | TypeScript | ~5.9.2 |
| Runtime | React Native (via Expo) | 0.81.5 |
| React | React | 19.1.0 |
| Expo SDK | expo | ~54.0.33 |

## Frameworks & Core Libraries

### Navigation
- **expo-router** (~6.0.23) — File-based routing (similar to Next.js App Router)
- **@react-navigation/native** (~7.1.8) — Underlying navigator
- **@react-navigation/bottom-tabs** (~7.4.0) — Bottom tab navigator
- **@react-navigation/elements** (~2.6.3) — Shared UI elements (PlatformPressable)

### Styling
- **NativeWind** (^4.2.3) — Tailwind CSS utility classes for React Native
- **Tailwind CSS** (^3.4.19) — CSS utility framework (config: `tailwind.config.js`)
- **StyleSheet** (React Native built-in) — Also used inline alongside NativeWind

### Animation
- **react-native-reanimated** (~4.1.1) — Performant JS-driven animations (worklet-based)
- **react-native-worklets** (0.5.1) — Worklet runtime for Reanimated
- **react-native-gesture-handler** (~2.28.0) — Native gesture recognition

### UI / Icons
- **expo-symbols** (~1.0.8) — SF Symbols on iOS
- **@expo/vector-icons** (^15.0.3) — MaterialIcons fallback on Android/web
- **expo-image** (~3.0.11) — Performant image component

### Platform APIs
- **expo-haptics** (~15.0.8) — Haptic feedback (iOS only)
- **expo-web-browser** (~15.0.10) — In-app browser for external links
- **expo-linking** (~8.0.11) — Deep linking
- **expo-constants** (~18.0.13) — App constants / env info
- **expo-font** (~14.0.11) — Custom font loading
- **expo-splash-screen** (~31.0.13) — Splash screen control
- **expo-status-bar** (~3.0.9) — Status bar management
- **expo-system-ui** (~6.0.9) — System UI color control

### Web Support
- **react-dom** (19.1.0) — DOM rendering
- **react-native-web** (~0.21.0) — RN API polyfills for web
- **react-native-safe-area-context** (~5.6.0) — Safe area insets
- **react-native-screens** (~4.16.0) — Native screen primitives

## Development Tooling

| Tool | Version | Config |
|------|---------|--------|
| ESLint | ^9.25.0 | `eslint.config.js` (flat config) |
| eslint-config-expo | ~10.0.0 | Extended in eslint.config.js |
| TypeScript | ~5.9.2 | `tsconfig.json` extends `expo/tsconfig.base` |
| Path aliases | — | `@/*` → `./*` (tsconfig paths) |

## TypeScript Configuration

- Strict mode enabled (`"strict": true`)
- Path alias `@/*` maps to project root
- Includes: `**/*.ts`, `**/*.tsx`, `.expo/types/**/*.ts`, `expo-env.d.ts`

## Tailwind Configuration (`tailwind.config.js`)

```js
content: ["./App.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}"]
// Note: components/ not included — currently NativeWind classes only apply within app/
```

## Platform Targets

- **iOS** — Primary (SF Symbols, haptics, native browser)
- **Android** — Full support (Material Icons fallback, haptics suppressed)
- **Web** — Supported via react-native-web (static rendering considerations in `use-color-scheme.web.ts`)
