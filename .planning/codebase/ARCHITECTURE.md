# ARCHITECTURE.md — System Architecture

## Pattern

**File-based routing SPA** via expo-router (Expo's implementation of React Navigation with a Next.js-style file system convention). The app is organized around screens (routes) as files, with shared layout files wrapping groups of screens.

## Routing Layer

expo-router uses the `app/` directory as the route root:

```
app/
  _layout.tsx          ← Root layout (ThemeProvider, Stack navigator)
  modal.tsx            ← Modal route (/modal)
  (tabs)/
    _layout.tsx        ← Tab navigator layout
    index.tsx          ← Home tab (/)
    explore.tsx        ← Explore tab (/explore)
```

- `(tabs)` is a route group — it doesn't affect the URL path
- Root layout wraps everything with `ThemeProvider` (dark/light mode) and a `Stack` navigator
- Modal screen uses `presentation: 'modal'` presentation style

## Theming Architecture

Two-layer theme system:

1. **`constants/theme.ts`** — Static color and font tokens
   - `Colors` object with `light` and `dark` variants
   - `Fonts` object with `Platform.select()` for iOS / Android / web

2. **Hooks-based consumption:**
   - `hooks/use-color-scheme.ts` — Re-exports `useColorScheme` from RN (native)
   - `hooks/use-color-scheme.web.ts` — Hydration-safe override for web SSR
   - `hooks/use-theme-color.ts` — Resolves a named color for the current scheme, with per-component override support

3. **Themed components** wrap standard RN primitives:
   - `ThemedText` → `Text` + theme color + type variants
   - `ThemedView` → `View` + background color

## Component Architecture

Flat component tree — no feature/domain directories yet. Components categorized by usage:

```
components/
  themed-text.tsx          ← Themed Text primitive
  themed-view.tsx          ← Themed View primitive
  parallax-scroll-view.tsx ← Animated header scroll layout
  external-link.tsx        ← In-app browser link wrapper
  haptic-tab.tsx           ← Tab bar button with haptic feedback
  hello-wave.tsx           ← Animated wave emoji (demo)
  ui/
    collapsible.tsx        ← Accordion/collapsible section
    icon-symbol.tsx        ← SF Symbol / MaterialIcon adapter (Android/web)
    icon-symbol.ios.tsx    ← SF Symbol native implementation (iOS only)
```

## Platform-Specific Files

expo-router and Metro support platform-specific file resolution:
- `icon-symbol.tsx` — Android/web fallback (MaterialIcons)
- `icon-symbol.ios.tsx` — iOS native (SymbolView)
- `use-color-scheme.web.ts` — Web-specific hydration-safe hook

## Data Flow

```
Screen (app/**/*.tsx)
  ↓ imports
Themed Components (components/)
  ↓ calls
Theme Hooks (hooks/)
  ↓ reads
Theme Constants (constants/theme.ts)
```

No state management library. Color scheme is read from OS via React Native's `useColorScheme`. No global store (Redux, Zustand, Jotai) present.

## Navigation Flow

```
RootLayout (Stack)
  ├─ (tabs) → TabLayout
  │     ├─ index (Home tab)
  │     └─ explore (Explore tab)
  └─ modal (Modal presentation)
```

## Animations

- `ParallaxScrollView` uses `react-native-reanimated` for parallax header animation (interpolated transform/scale on scroll offset)
- `Collapsible` uses inline style transform rotate for chevron toggle (not animated, just toggle)
- `HelloWave` — wave animation (contents not inspected, but uses reanimated based on imports)

## Entry Point

- `main` in `package.json` points to `expo-router/entry` — expo-router bootstraps the app automatically
- `app/_layout.tsx` `unstable_settings.anchor = '(tabs)'` sets the default anchor for navigation
