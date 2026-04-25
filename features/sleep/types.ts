export type SleepStage = 'awake' | 'light' | 'deep' | 'rem';

export interface SleepSegment {
  stage: SleepStage;
  /** epoch ms */
  startMs: number;
  /** epoch ms */
  endMs: number;
}

export interface SleepNight {
  date: string; // YYYY-MM-DD
  startMs: number;
  endMs: number;
  segments: SleepSegment[];
  summary: {
    durationMinutes: number;
    awake: number;
    light: number;
    deep: number;
    rem: number;
    quality: 'poor' | 'fair' | 'good';
    qualityScore: number; // 0..100
  };
}

import { Palette } from '@/constants/theme';

export const STAGE_COLORS: Record<SleepStage, string> = {
  awake: Palette.kamote,
  light: Palette.silverBlue,
  deep: Palette.kangkong,
  rem: Palette.teal,
};

export const STAGE_LABELS: Record<SleepStage, string> = {
  awake: 'Awake',
  light: 'Light',
  deep: 'Deep',
  rem: 'REM',
};

export const STAGE_ORDER: SleepStage[] = ['awake', 'rem', 'light', 'deep'];

export const STAGE_DESCRIPTIONS: Record<SleepStage, string> = {
  awake: 'Brief moments of being awake. Normal — usually too short to remember.',
  light: 'Transitional sleep. Your heart rate and breathing slow as the body relaxes.',
  deep: 'Restorative sleep. Tissue repair, immune function, and physical recovery happen here.',
  rem: 'Dream sleep. Memory consolidation and emotional processing.',
};
