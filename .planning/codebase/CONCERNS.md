# CONCERNS.md — Technical Debt & Issues

## High Priority

### 1. No Test Coverage
- **Severity:** High
- **Description:** Zero test files exist. No unit, integration, or E2E tests.
- **Impact:** Any refactor or new feature risks regressions with no safety net.
- **Location:** Entire codebase
- **Fix:** Add `jest-expo` + `@testing-library/react-native` and write tests for hooks and components.

### 2. NativeWind Not Applied to Components
- **Severity:** Medium-High
- **Description:** `tailwind.config.js` content glob only covers `app/**` — not `components/**`. Themed components use `StyleSheet.create()` exclusively. This creates a split styling system.
- **Impact:** Developers may be confused about whether to use Tailwind classes or StyleSheet in components. Components can't use NativeWind classes without updating the config.
- **Location:** `tailwind.config.js`
- **Fix:** Add `"./components/**/*.{js,jsx,ts,tsx}"` to `content` array, or standardize on one styling approach.

### 3. No Error Boundary
- **Severity:** Medium
- **Description:** No React error boundary wraps the app. An uncaught render error will crash the entire app.
- **Location:** `app/_layout.tsx`
- **Fix:** Add an error boundary component wrapping the root layout.

## Medium Priority

### 4. `openBrowserAsync` Unhandled Promise
- **Severity:** Medium
- **Description:** In `components/external-link.tsx`, the `await openBrowserAsync(...)` result is not checked. If the browser fails to open, no error is surfaced to the user.
- **Location:** `components/external-link.tsx`
- **Fix:** Wrap in try/catch and handle failure gracefully.

### 5. `unstable_settings` API in Root Layout
- **Severity:** Low-Medium
- **Description:** `app/_layout.tsx` uses `export const unstable_settings` — a flagged-as-unstable expo-router API. May break across expo-router major versions.
- **Location:** `app/_layout.tsx`
- **Fix:** Monitor expo-router changelog; replace when a stable API is available.

### 6. No Prettier Configuration
- **Severity:** Low-Medium
- **Description:** No Prettier or formatter config present. Code style consistency depends on editor settings and convention.
- **Impact:** Inconsistent formatting across contributors.
- **Fix:** Add `.prettierrc` and integrate with ESLint via `eslint-plugin-prettier`.

### 7. Icon Mapping Requires Manual Maintenance
- **Severity:** Low-Medium
- **Description:** `components/ui/icon-symbol.tsx` has a hardcoded `MAPPING` object mapping SF Symbol names to MaterialIcons. Every new icon requires a manual entry.
- **Location:** `components/ui/icon-symbol.tsx`
- **Fix:** Document the mapping table; consider a type-safe helper or a more complete mapping library.

## Low Priority

### 8. Demo / Starter Content Not Removed
- **Severity:** Low
- **Description:** `app/(tabs)/index.tsx` and `app/(tabs)/explore.tsx` contain Expo starter template content (wave animations, "Step 1: Try it" instructions, etc.). `components/hello-wave.tsx` is a demo component.
- **Location:** `app/(tabs)/index.tsx`, `app/(tabs)/explore.tsx`, `components/hello-wave.tsx`
- **Fix:** Clean up starter content before building real features. Run `npm run reset-project` or manually replace.

### 9. `expo-font` Installed but Unused
- **Severity:** Low
- **Description:** `expo-font` is in `dependencies` but no custom fonts are loaded. Platform system fonts are used via `constants/theme.ts` `Fonts` object.
- **Location:** `package.json`
- **Fix:** Either load a custom font or remove the dependency if not planned.

### 10. No CI/CD Pipeline
- **Severity:** Low
- **Description:** No GitHub Actions, EAS workflows, or other CI configuration exists.
- **Impact:** No automated lint/type-check on PRs; no automated builds.
- **Fix:** Add `expo lint` + `tsc --noEmit` in CI. Configure EAS Build for distribution.

## Security Notes

- No API keys or secrets found in codebase
- No `.env` file management configured (no `dotenv`, no EAS secrets)
- No user input forms yet — no XSS / injection surface currently
- `process.env.EXPO_OS` is a build-time constant, not a user-controllable value
