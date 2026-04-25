import { Palette } from '@/constants/theme';

export interface Rank {
  id: string;
  label: string;
  /** Inclusive minimum total points to enter this rank. */
  minPoints: number;
  color: string;
  icon: string; // emoji
}

/**
 * Thresholds calibrated against the current catalog (300 total points).
 * Tweak alongside catalog changes to keep progression feeling earnable.
 */
export const RANKS: Rank[] = [
  { id: 'noob', label: 'Noob', minPoints: 0, color: '#8C9097', icon: '🌱' },
  { id: 'rookie', label: 'Rookie', minPoints: 25, color: Palette.silverBlue, icon: '🐣' },
  { id: 'apprentice', label: 'Apprentice', minPoints: 60, color: Palette.teal, icon: '✨' },
  { id: 'pro', label: 'Pro', minPoints: 110, color: Palette.kangkong, icon: '🔥' },
  { id: 'elite', label: 'Elite', minPoints: 170, color: Palette.kamote, icon: '⚡' },
  { id: 'legend', label: 'Legend', minPoints: 230, color: '#E0B84A', icon: '👑' },
  { id: 'chad', label: 'Chad', minPoints: 290, color: '#D97757', icon: '💪' },
];

export interface RankProgress {
  current: Rank;
  next: Rank | null;
  points: number;
  /** 0..1 progress toward `next.minPoints`. 1 if at top rank. */
  toNext: number;
}

export function rankFor(points: number): RankProgress {
  let current = RANKS[0];
  for (const r of RANKS) {
    if (points >= r.minPoints) current = r;
  }
  const idx = RANKS.findIndex((r) => r.id === current.id);
  const next = RANKS[idx + 1] ?? null;
  if (!next) {
    return { current, next: null, points, toNext: 1 };
  }
  const span = next.minPoints - current.minPoints;
  const within = points - current.minPoints;
  return { current, next, points, toNext: span > 0 ? Math.min(1, within / span) : 1 };
}
