import { Palette } from '@/constants/theme';

export interface Rank {
  id: string;
  label: string;
  /** Inclusive minimum number of unlocked achievements to enter this rank. */
  minUnlocked: number;
  color: string;
  icon: string; // emoji
}

export const RANKS: Rank[] = [
  { id: 'noob', label: 'Noob', minUnlocked: 0, color: '#8C9097', icon: '🌱' },
  { id: 'rookie', label: 'Rookie', minUnlocked: 2, color: Palette.silverBlue, icon: '🐣' },
  { id: 'apprentice', label: 'Apprentice', minUnlocked: 4, color: Palette.teal, icon: '✨' },
  { id: 'pro', label: 'Pro', minUnlocked: 6, color: Palette.kangkong, icon: '🔥' },
  { id: 'elite', label: 'Elite', minUnlocked: 8, color: Palette.kamote, icon: '⚡' },
  { id: 'legend', label: 'Legend', minUnlocked: 10, color: '#E0B84A', icon: '👑' },
  { id: 'chad', label: 'Chad', minUnlocked: 12, color: '#D97757', icon: '💪' },
];

export interface RankProgress {
  current: Rank;
  next: Rank | null;
  unlocked: number;
  /** 0..1 progress toward `next.minUnlocked`. 1 if at top rank. */
  toNext: number;
}

export function rankFor(unlocked: number): RankProgress {
  let current = RANKS[0];
  for (const r of RANKS) {
    if (unlocked >= r.minUnlocked) current = r;
  }
  const idx = RANKS.findIndex((r) => r.id === current.id);
  const next = RANKS[idx + 1] ?? null;
  if (!next) {
    return { current, next: null, unlocked, toNext: 1 };
  }
  const span = next.minUnlocked - current.minUnlocked;
  const within = unlocked - current.minUnlocked;
  return { current, next, unlocked, toNext: span > 0 ? Math.min(1, within / span) : 1 };
}
