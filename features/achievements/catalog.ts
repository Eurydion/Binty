import { Palette } from '@/constants/theme';
import type { Achievement } from './types';

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-connect',
    title: 'First Connect',
    description: 'Pair your smartwatch for the first time.',
    icon: 'watch',
    color: Palette.teal,
    tier: 'bronze',
  },
  {
    id: 'hydrated',
    title: 'Hydrated',
    description: 'Hit your daily water goal.',
    icon: 'water',
    color: Palette.silverBlue,
    tier: 'silver',
  },
  {
    id: 'calm-mind',
    title: 'Calm Mind',
    description: 'Stay below stress level 25 for a full minute.',
    icon: 'leaf',
    color: Palette.kangkong,
    tier: 'silver',
  },
  {
    id: 'heartbeat-explorer',
    title: 'Heartbeat Explorer',
    description: 'Try every smartwatch scenario.',
    icon: 'compass',
    color: Palette.kamote,
    tier: 'gold',
  },
  {
    id: 'deep-diver',
    title: 'Deep Diver',
    description: 'Log a "good" night of sleep.',
    icon: 'moon',
    color: Palette.silverBlue,
    tier: 'silver',
  },
  {
    id: 'recovery-master',
    title: 'Recovery Master',
    description: 'Reach a recovery score of 85 or higher.',
    icon: 'sparkles',
    color: Palette.kangkong,
    tier: 'gold',
  },
  {
    id: 'step-counter',
    title: 'Step Counter',
    description: 'Walk 1,000 steps in a session.',
    icon: 'walk',
    color: Palette.teal,
    tier: 'bronze',
  },
  {
    id: 'storm-rider',
    title: 'Storm Rider',
    description: 'Survive a Panic Spike scenario.',
    icon: 'flash',
    color: '#D97757',
    tier: 'gold',
  },
  {
    id: 'restful-night',
    title: 'Restful Night',
    description: 'Get at least 90 minutes of deep sleep.',
    icon: 'bed',
    color: Palette.kangkong,
    tier: 'silver',
  },
  {
    id: 'steady-pulse',
    title: 'Steady Pulse',
    description: 'Keep BPM between 60 and 80 for one minute.',
    icon: 'heart',
    color: Palette.kangkong,
    tier: 'bronze',
  },
  {
    id: 'daily-sip',
    title: 'Daily Sip',
    description: 'Log water three times in a single day.',
    icon: 'cafe',
    color: Palette.silverBlue,
    tier: 'bronze',
  },
  {
    id: 'mindful-pause',
    title: 'Mindful Pause',
    description: 'Use a breath intervention.',
    icon: 'pulse',
    color: Palette.teal,
    tier: 'bronze',
  },
];

export const ACHIEVEMENTS_BY_ID: Record<string, Achievement> = ACHIEVEMENTS.reduce(
  (acc, a) => {
    acc[a.id] = a;
    return acc;
  },
  {} as Record<string, Achievement>,
);
