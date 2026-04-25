# TESTING.md — Test Structure & Practices

## Current State

**No tests exist.** The codebase is a fresh Expo starter with zero test files.

## Test Infrastructure

- No test framework installed (`jest`, `vitest`, `@testing-library/react-native` are absent from `package.json`)
- No test scripts in `package.json`
- No CI configuration found (no `.github/workflows/`, no `Makefile`)
- No `jest.config.*` or `vitest.config.*` files

## Testing Gaps

Every feature area currently lacks test coverage:

| Area | Status |
|------|--------|
| Themed components (ThemedText, ThemedView) | ❌ No tests |
| Theme hooks (useThemeColor, useColorScheme) | ❌ No tests |
| Navigation / routing | ❌ No tests |
| ParallaxScrollView animation | ❌ No tests |
| ExternalLink browser behavior | ❌ No tests |
| HapticTab platform behavior | ❌ No tests |
| IconSymbol platform switching | ❌ No tests |
| Collapsible open/close | ❌ No tests |

## Recommended Test Setup for Expo

When tests are added, the standard Expo stack is:

```bash
npx expo install jest-expo @testing-library/react-native @testing-library/jest-native
```

With `jest.config.js`:
```js
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
};
```

## Mocking Needs (When Tests Are Added)

| Module | Mock Required |
|--------|--------------|
| `expo-haptics` | Yes — native module |
| `expo-web-browser` | Yes — native module |
| `expo-symbols` | Yes — native module (iOS only) |
| `react-native` `useColorScheme` | Partial — can return `'light'` or `'dark'` |
| `process.env.EXPO_OS` | Yes — for platform branch testing |

## E2E Testing

No E2E framework (Detox, Maestro) configured.
