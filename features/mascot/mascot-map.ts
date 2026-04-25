import type { EmotionalState } from '@/types/health';

/**
 * Maps each emotional state to a mascot portrait image.
 * Drop PNGs into `assets/images/mascot/` named `binty-<state>.png` to enable.
 * Until art exists, leave entries as `null` and the `<MascotPortrait />`
 * component will render a styled placeholder.
 */
export const MascotMap: Record<EmotionalState, number | null> = {
  calm: null,
  energized: null,
  anxious: null,
  stressed: null,
  sad: null,
};

export const MascotDefault: number | null = null;

export function getMascotSource(state: EmotionalState): number | null {
  return MascotMap[state] ?? MascotDefault;
}
