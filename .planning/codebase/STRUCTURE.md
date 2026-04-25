# STRUCTURE.md — Directory Layout & Conventions

## Top-Level Layout

```
binty/
├── app/                    # Expo Router routes (file-based routing)
├── assets/                 # Static assets
│   └── images/             # App images (partial-react-logo.png, etc.)
├── components/             # Shared UI components
│   └── ui/                 # Lower-level UI primitives
├── constants/              # App-wide constants (colors, fonts)
├── hooks/                  # Custom React hooks
├── scripts/                # Dev utility scripts
├── .planning/              # GSD planning artifacts (not shipped)
│   └── codebase/           # Codebase map documents
├── app.json                # Expo configuration
├── eslint.config.js        # ESLint flat config
├── expo-env.d.ts           # Expo TypeScript ambient declarations
├── package.json
├── tailwind.config.js      # NativeWind / Tailwind config
└── tsconfig.json
```

## `app/` — Routes

| File | Route | Notes |
|------|-------|-------|
| `_layout.tsx` | Root | Stack navigator + ThemeProvider |
| `modal.tsx` | `/modal` | Modal presentation |
| `(tabs)/_layout.tsx` | — | Tab navigator |
| `(tabs)/index.tsx` | `/` | Home screen |
| `(tabs)/explore.tsx` | `/explore` | Explore screen |

- Route groups use `(name)` convention (doesn't affect URL)
- Layouts use `_layout.tsx` naming convention

## `components/` — Shared Components

| File | Purpose |
|------|---------|
| `themed-text.tsx` | Themed `Text` with type variants |
| `themed-view.tsx` | Themed `View` with background color |
| `parallax-scroll-view.tsx` | Animated parallax header scroll layout |
| `external-link.tsx` | In-app browser link (wraps expo-router `Link`) |
| `haptic-tab.tsx` | Tab bar button with iOS haptic feedback |
| `hello-wave.tsx` | Animated wave emoji (demo component) |
| `ui/collapsible.tsx` | Accordion UI component |
| `ui/icon-symbol.tsx` | Icon abstraction (Android/web: MaterialIcons) |
| `ui/icon-symbol.ios.tsx` | Icon abstraction (iOS: SF Symbols via SymbolView) |

## `constants/` — Tokens

| File | Contents |
|------|---------|
| `theme.ts` | `Colors` (light/dark variants), `Fonts` (platform-specific) |

## `hooks/` — Custom Hooks

| File | Purpose |
|------|---------|
| `use-color-scheme.ts` | Re-exports RN `useColorScheme` (native) |
| `use-color-scheme.web.ts` | Hydration-safe color scheme hook for web |
| `use-theme-color.ts` | Resolves named theme color for current scheme |

## `scripts/`

| File | Purpose |
|------|---------|
| `reset-project.js` | Resets project to clean Expo starter state |

## Naming Conventions

- **Files:** kebab-case (`themed-text.tsx`, `use-color-scheme.ts`)
- **Components:** PascalCase exports (`ThemedText`, `ParallaxScrollView`)
- **Hooks:** camelCase with `use` prefix (`useColorScheme`, `useThemeColor`)
- **Constants:** PascalCase objects (`Colors`, `Fonts`)
- **Platform variants:** `file.ios.tsx` / `file.web.ts` suffixes for platform-specific implementations

## Path Aliases

`@/*` resolves to the project root, configured in `tsconfig.json`:
```ts
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
```

## Asset Organization

```
assets/
  images/
    partial-react-logo.png   # Used in Home screen header
    # Additional density variants expected: @2x, @3x
```
