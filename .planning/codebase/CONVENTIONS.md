# CONVENTIONS.md — Code Style & Patterns

## Language & Formatting

- **TypeScript** with `strict: true` — all files are `.ts` or `.tsx`
- No Prettier config found — formatting not enforced automatically
- ESLint via flat config (`eslint.config.js`) extending `eslint-config-expo`
- Ignored: `dist/*`

## Naming Conventions

| Construct | Convention | Example |
|-----------|-----------|---------|
| Files | kebab-case | `themed-text.tsx`, `use-color-scheme.ts` |
| React components | PascalCase named exports | `export function ThemedText(...)` |
| Default exports (screens) | PascalCase function | `export default function HomeScreen()` |
| Hooks | camelCase with `use` prefix | `useThemeColor`, `useColorScheme` |
| Constants/objects | PascalCase | `Colors`, `Fonts` |
| Types/interfaces | PascalCase with descriptive suffix | `ThemedTextProps`, `Props` |

## Component Patterns

### Themed Primitive Pattern
Wraps React Native primitives with theme-aware color resolution:

```tsx
export function ThemedText({ style, lightColor, darkColor, type = 'default', ...rest }: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  return <Text style={[{ color }, styles[type], style]} {...rest} />;
}
```

### Platform-Specific Implementations
Platform files are co-located with the default implementation:
```
ui/icon-symbol.tsx        ← Android/web (MaterialIcons)
ui/icon-symbol.ios.tsx    ← iOS (expo-symbols SymbolView)
```
Metro/expo-router resolve the correct file automatically.

### Props Spreading Pattern
Components spread remaining props to the underlying native element:
```tsx
export function HapticTab(props: BottomTabBarButtonProps) {
  return <PlatformPressable {...props} onPressIn={...} />;
}
```

### Type Augmentation Pattern
Extending component prop types with `Omit` + custom fields:
```tsx
type Props = Omit<ComponentProps<typeof Link>, 'href'> & { href: Href & string };
```

## Styling Patterns

Two styling approaches are in use simultaneously:

### 1. StyleSheet (React Native built-in)
Used for fixed styles on themed components:
```tsx
const styles = StyleSheet.create({
  default: { fontSize: 16, lineHeight: 24 },
  title: { fontSize: 32, fontWeight: 'bold', lineHeight: 32 },
});
```

### 2. NativeWind (Tailwind classes)
Installed and configured — available for use in `app/**` files. Not yet observed in component files; components still use StyleSheet.

### Inline Styles
Used for dynamic/conditional values:
```tsx
style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }}
```

## State Management

- **Local state** with `useState` (e.g., `Collapsible` open/close state)
- **No global state library** — React context via React Navigation's `ThemeProvider` for theme only
- Color scheme read from OS via `useColorScheme()`

## Environment / Platform Detection

Two patterns used:
```tsx
// At runtime (component code)
if (process.env.EXPO_OS === 'ios') { ... }

// At build time (config)
Platform.select({ ios: ..., android: ..., web: ..., default: ... })
```

## Imports

- Path alias `@/` used consistently for all internal imports
- External imports before internal imports (no enforced import ordering beyond ESLint)
- Type-only imports use `type` keyword where applicable:
  ```tsx
  import type { PropsWithChildren, ReactElement } from 'react';
  ```

## Error Handling

- No explicit error boundaries or try/catch observed in components
- `openBrowserAsync` result not awaited for error checking in `ExternalLink`
- No global error handler set up

## Comments

- JSDoc comments used sparingly on constants and types
- Inline comments explain platform decisions:
  ```tsx
  // Add a soft haptic feedback when pressing down on the tabs.
  // Prevent the default behavior of linking to the default browser on native.
  ```
