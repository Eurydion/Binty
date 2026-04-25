import { Palette } from '@/constants/theme';
import type { Achievement } from './types';

/**
 * Point values:
 *   small  10 — quick / first-time actions
 *   medium 25 — sustained behaviour or threshold reached
 *   large  50 — rare / hard-won milestones
 */
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-connect',
    title: 'First Connect',
    description: 'Pair your smartwatch for the first time.',
    icon: 'watch',
    color: Palette.teal,
    points: 10,
  },
  {
    id: 'hydrated',
    title: 'Hydrated',
    description: 'Hit your daily water goal.',
    icon: 'water',
    color: Palette.silverBlue,
    points: 25,
  },
  {
    id: 'calm-mind',
    title: 'Calm Mind',
    description: 'Stay below stress level 25 for a full minute.',
    icon: 'leaf',
    color: Palette.kangkong,
    points: 25,
  },
  {
    id: 'heartbeat-explorer',
    title: 'Heartbeat Explorer',
    description: 'Try every smartwatch scenario.',
    icon: 'compass',
    color: Palette.kamote,
    points: 50,
  },
  {
    id: 'deep-diver',
    title: 'Deep Diver',
    description: 'Log a "good" night of sleep.',
    icon: 'moon',
    color: Palette.silverBlue,
    points: 25,
  },
  {
    id: 'recovery-master',
    title: 'Recovery Master',
    description: 'Reach a recovery score of 85 or higher.',
    icon: 'sparkles',
    color: Palette.kangkong,
    points: 50,
  },
  {
    id: 'step-counter',
    title: 'Step Counter',
    description: 'Walk 1,000 steps in a session.',
    icon: 'walk',
    color: Palette.teal,
    points: 10,
  },
  {
    id: 'storm-rider',
    title: 'Storm Rider',
    description: 'Survive a Panic Spike scenario.',
    icon: 'flash',
    color: '#D97757',
    points: 50,
  },
  {
    id: 'restful-night',
    title: 'Restful Night',
    description: 'Get at least 90 minutes of deep sleep.',
    icon: 'bed',
    color: Palette.kangkong,
    points: 25,
  },
  {
    id: 'steady-pulse',
    title: 'Steady Pulse',
    description: 'Keep BPM between 60 and 80 for one minute.',
    icon: 'heart',
    color: Palette.kangkong,
    points: 10,
  },
  {
    id: 'daily-sip',
    title: 'Daily Sip',
    description: 'Log water three times in a single day.',
    icon: 'cafe',
    color: Palette.silverBlue,
    points: 10,
  },
  {
    id: 'mindful-pause',
    title: 'Mindful Pause',
    description: 'Use a breath intervention.',
    icon: 'pulse',
    color: Palette.teal,
    points: 10,
  },
  {
    id: 'streak-3',
    title: 'Three-Day Spark',
    description: 'Keep a habit alive for 3 days in a row.',
    icon: 'flame',
    color: '#D97757',
    points: 10,
  },
  {
    id: 'streak-7',
    title: 'Weekly Rhythm',
    description: '7-day habit streak — momentum is real.',
    icon: 'flame',
    color: '#D97757',
    points: 25,
  },
  {
    id: 'streak-14',
    title: 'Fortnight Strong',
    description: 'Two-week habit streak.',
    icon: 'flame',
    color: '#E1AD01',
    points: 25,
  },
  {
    id: 'streak-30',
    title: 'Monthly Anchor',
    description: '30-day streak — this is who you are now.',
    icon: 'flame',
    color: '#E1AD01',
    points: 50,
  },
  {
    id: 'streak-100',
    title: 'Century Club',
    description: '100 consecutive days. Legend.',
    icon: 'trophy',
    color: '#7B68EE',
    points: 50,
  },
];

export const ACHIEVEMENTS_BY_ID: Record<string, Achievement> = ACHIEVEMENTS.reduce(
  (acc, a) => {
    acc[a.id] = a;
    return acc;
  },
  {} as Record<string, Achievement>,
);

/** Total points obtainable across all achievements. */
export const TOTAL_POINTS: number = ACHIEVEMENTS.reduce((sum, a) => sum + a.points, 0);
