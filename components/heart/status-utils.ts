import { Palette } from '@/constants/theme';

export interface BpmStatus {
  label: string;
  color: string;
}

export function bpmStatus(bpm: number): BpmStatus {
  if (bpm < 60) return { label: 'Low', color: Palette.silverBlue };
  if (bpm <= 100) return { label: 'Normal', color: Palette.kangkong };
  if (bpm <= 120) return { label: 'Elevated', color: Palette.kamote };
  return { label: 'High', color: '#D97757' };
}

export function trendFromHistory(values: number[], threshold = 3): 'up' | 'down' | 'flat' {
  if (values.length < 4) return 'flat';
  const half = Math.floor(values.length / 2);
  const a = values.slice(0, half).reduce((s, v) => s + v, 0) / half;
  const b = values.slice(half).reduce((s, v) => s + v, 0) / (values.length - half);
  if (b - a > threshold) return 'up';
  if (a - b > threshold) return 'down';
  return 'flat';
}
