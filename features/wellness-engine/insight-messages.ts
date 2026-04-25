import type { EmotionalState } from '@/types/health';

type Period = 'morning' | 'midday' | 'afternoon' | 'evening' | 'night';

export function timeOfDay(hour: number): Period {
  if (hour < 6) return 'night';
  if (hour < 11) return 'morning';
  if (hour < 14) return 'midday';
  if (hour < 18) return 'afternoon';
  if (hour < 22) return 'evening';
  return 'night';
}

const MESSAGES: Record<EmotionalState, Record<Period, string[]>> = {
  calm: {
    morning: ['A calm start, {name}. Set one tiny win for today.', 'You woke up balanced. Breathe deep and begin.'],
    midday: ["You're steady, {name}. Keep that rhythm going.", 'Calm energy — perfect for focused work.'],
    afternoon: ['Holding steady. A short walk will refresh you.', 'Calm afternoon. Hydrate and stretch.'],
    evening: ['You ended the day balanced. Wind down gently.', 'Calm evening — reflect on one good moment.'],
    night: ['Quiet body, quiet mind. Time to rest, {name}.', 'Let the day go. Sleep is part of wellness.'],
  },
  energized: {
    morning: ['Strong start, {name}! Channel it into one big task.', 'Your body is ready. Move while you feel it.'],
    midday: ['Bright energy! Use it for what matters most.', 'Peak hours, {name}. Tackle the hard thing.'],
    afternoon: ['Still buzzing — a short workout would feel great.', 'Energy is high. Try a 10-minute walk outside.'],
    evening: ['High energy this late — wind down gradually.', 'Try light stretching to ease into rest.'],
    night: ['Body still active. Try slow breathing to settle.', 'Late energy can hurt sleep. Dim the lights.'],
  },
  anxious: {
    morning: ['Anxious morning? Ground first — name 5 things you see.', 'Breathe before you scroll, {name}.'],
    midday: ['Heart racing. Pause. 4 in, 7 hold, 8 out.', "Tension is high — let's reset together."],
    afternoon: ['Anxiety spike detected. Try a grounding exercise.', "Step away for 2 minutes. You'll feel lighter."],
    evening: ['Evening anxiety — turn off screens, slow your breath.', 'Worry tends to grow at night. Anchor yourself.'],
    night: ['Mind racing? Try the 4-7-8 breath, {name}.', 'Quiet your body first; the mind will follow.'],
  },
  stressed: {
    morning: ['Already stressed? Start with 3 slow breaths.', 'Lower the stakes for today, {name}. One thing at a time.'],
    midday: ['Stress is high. Step outside for 5 minutes.', "Your body is asking for a pause — give it one."],
    afternoon: ['Stress climbing. I shortened your routine.', 'Try a quick stretch break before continuing.'],
    evening: ["Long day. Don't add more — rest is productive.", 'Stress recovery starts with a slower exhale.'],
    night: ['High stress this late. Skip caffeine, breathe slow.', 'Your nervous system needs rest. Wind down now.'],
  },
  sad: {
    morning: ['Heavy morning? Small steps still count, {name}.', 'Open the curtains. Even a little light helps.'],
    midday: ['Energy is low. Try standing up and stretching.', 'Be kind to yourself today. One small action.'],
    afternoon: ['Low mood — a short walk lifts the body and mind.', 'Reach out to someone you trust today.'],
    evening: ['Feeling low — warm tea and a short walk help.', 'You made it through. That counts, {name}.'],
    night: ['Tomorrow is a fresh page. Rest now.', 'Be gentle with yourself tonight.'],
  },
};

export function pickInsight(state: EmotionalState, hour: number, name: string): string {
  const period = timeOfDay(hour);
  const pool = MESSAGES[state][period];
  const idx = (Math.floor(Date.now() / 60_000) + name.length) % pool.length;
  return pool[idx].replace('{name}', name);
}
