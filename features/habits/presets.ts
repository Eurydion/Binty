import { Palette } from '@/constants/theme';

import type { Habit } from './types';

export interface HabitPreset {
  id: string;
  title: string;
  unit: string;
  target: number;
  icon: Habit['icon'];
  color: string;
  category: Habit['category'];
}

export const HABIT_PRESETS: HabitPreset[] = [
  {
    id: 'water-glass',
    title: 'Drink water',
    unit: 'glass',
    target: 8,
    icon: 'water',
    color: Palette.silverBlue,
    category: 'hydration',
  },
  {
    id: 'stretch-2min',
    title: '2-min stretch',
    unit: 'round',
    target: 1,
    icon: 'body',
    color: Palette.kamote,
    category: 'movement',
  },
  {
    id: 'breath-round',
    title: 'Breath round',
    unit: 'round',
    target: 3,
    icon: 'pulse',
    color: Palette.teal,
    category: 'mindfulness',
  },
  {
    id: 'walk-break',
    title: 'Walk break',
    unit: 'walk',
    target: 3,
    icon: 'walk',
    color: Palette.kangkong,
    category: 'movement',
  },
  {
    id: 'gratitude-note',
    title: 'Gratitude note',
    unit: 'note',
    target: 1,
    icon: 'heart',
    color: '#7B68EE',
    category: 'mindfulness',
  },
  {
    id: 'screen-pause',
    title: 'Screen pause',
    unit: 'pause',
    target: 2,
    icon: 'eye-off',
    color: '#D97757',
    category: 'mindfulness',
  },
];
