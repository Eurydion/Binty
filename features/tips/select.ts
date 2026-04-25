import { dayOfYear } from '@/lib/date';

import { TIPS, type Tip } from './catalog';

export function getDailyTip(date = new Date()): Tip {
  const idx = dayOfYear(date) % TIPS.length;
  return TIPS[idx];
}
