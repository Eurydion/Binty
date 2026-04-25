import type { Ionicons } from '@expo/vector-icons';

export type AchievementTier = 'bronze' | 'silver' | 'gold';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  tier: AchievementTier;
}

export interface AchievementState {
  id: string;
  unlockedAt: number | null;
}
