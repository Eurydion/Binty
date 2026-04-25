/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

/**
 * Binti palette — see design.md for usage rules.
 */
export const Palette = {
  charcoal: '#2C2C2C',
  kangkong: '#4F7942',
  cloud: '#F9F9F9',
  kamote: '#E1AD01',
  teal: '#4A9B9B',
  silverBlue: '#A7C7E7',
} as const;

export const Radii = {
  sm: 8,
  md: 16,
  lg: 24,
  pill: 9999,
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const Borders = {
  hairline: {
    light: 'rgba(44,44,44,0.08)',
    dark: 'rgba(249,249,249,0.08)',
  },
} as const;

export const Colors = {
  light: {
    text: Palette.charcoal,
    background: Palette.cloud,
    surface: '#FFFFFF',
    tint: Palette.kangkong,
    icon: '#6B6B6B',
    iconMuted: 'rgba(44,44,44,0.6)',
    tabIconDefault: 'rgba(44,44,44,0.55)',
    tabIconSelected: Palette.kangkong,
    tabBarBackground: '#FFFFFF',
  },
  dark: {
    text: Palette.cloud,
    background: Palette.charcoal,
    surface: '#1F1F1F',
    tint: Palette.kangkong,
    icon: '#C9C9C9',
    iconMuted: 'rgba(249,249,249,0.6)',
    tabIconDefault: 'rgba(249,249,249,0.55)',
    tabIconSelected: Palette.cloud,
    tabBarBackground: '#1F1F1F',
  },
};




export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});