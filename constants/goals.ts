import type { WellnessGoal } from '@/types/user';

export const GOALS: { value: WellnessGoal; label: string; description: string }[] = [
  { value: 'stress-reduction', label: 'Reduce Stress', description: 'Calm the mind, lower cortisol' },
  { value: 'weight-loss', label: 'Lose Weight', description: 'Calorie-conscious meals and active routines' },
  { value: 'muscle-gain', label: 'Build Muscle', description: 'High-protein meals, strength-focused activities' },
  { value: 'better-sleep', label: 'Sleep Better', description: 'Wind-down routines and sleep hygiene' },
  { value: 'general-wellness', label: 'General Wellness', description: 'Balanced all-around approach' },
];
