import type { AnalysisFlag } from './analyzer';

export interface Intervention {
  id: string;
  alertType: AnalysisFlag['type'];
  title: string;
  body: string;
  steps: string[];
  priority: number;   // higher = shown first
}

/**
 * Maps analysis flags to intervention alerts with mitigation steps.
 */
export function buildInterventions(flags: AnalysisFlag[]): Intervention[] {
  return flags
    .map((flag): Intervention | null => {
      switch (flag.type) {
        case 'high-hr':
          return {
            id: `intervention-${flag.type}-${Date.now()}`,
            alertType: flag.type,
            title: 'High Heart Rate Detected',
            body: flag.context,
            steps: [
              'Sit or lie down comfortably',
              'Inhale slowly for 4 counts',
              'Hold your breath for 4 counts',
              'Exhale slowly for 4 counts',
              'Repeat 4 times',
            ],
            priority: flag.severity === 'high' ? 3 : 2,
          };
        case 'low-hrv':
          return {
            id: `intervention-${flag.type}-${Date.now()}`,
            alertType: flag.type,
            title: 'Stress Levels Elevated',
            body: flag.context,
            steps: [
              'Find a quiet space if possible',
              'Close your eyes and breathe naturally',
              'Notice 5 things you can hear around you',
              'Take 3 deep, slow breaths',
              'Gently roll your shoulders back',
            ],
            priority: 3,
          };
        case 'poor-sleep':
          return {
            id: `intervention-${flag.type}-${Date.now()}`,
            alertType: flag.type,
            title: 'Low Sleep Detected',
            body: flag.context,
            steps: [
              "Today's routine has been adjusted to light intensity",
              'Avoid caffeine after 2:00 PM today',
              'Take a 20-min rest break this afternoon if possible',
              'Aim to sleep 30 minutes earlier tonight',
            ],
            priority: 2,
          };
        case 'skipped-meal':
          return {
            id: `intervention-${flag.type}-${Date.now()}`,
            alertType: flag.type,
            title: 'Meal Skipped',
            body: flag.context,
            steps: [
              'Low blood sugar can raise stress and heart rate',
              'Eat a light balanced meal soon',
              'Include a carb + protein combination',
              'Drink a glass of water alongside your meal',
            ],
            priority: 2,
          };
        case 'low-water':
          return {
            id: `intervention-${flag.type}-${Date.now()}`,
            alertType: flag.type,
            title: 'Hydration Reminder',
            body: flag.context,
            steps: [
              'Drink 300ml of water now',
              'Set a reminder to drink again in 1 hour',
              'Avoid caffeinated drinks as your next drink',
            ],
            priority: 1,
          };
        default:
          return null;
      }
    })
    .filter((i): i is Intervention => i !== null)
    .sort((a, b) => b.priority - a.priority);
}
