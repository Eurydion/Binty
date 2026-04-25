import type { Ionicons } from '@expo/vector-icons';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  /** Points awarded when this achievement is unlocked. Drives rank progression. */
  points: number;
}

export interface AchievementState {
  id: string;
  unlockedAt: number | null;
}
