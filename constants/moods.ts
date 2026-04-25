export const MOODS = ['calm', 'anxious', 'stressed', 'sad', 'energized'] as const;

export type Mood = typeof MOODS[number];

export const MOOD_LABELS: Record<Mood, string> = {
  calm: 'Calm 😌',
  anxious: 'Anxious 😰',
  stressed: 'Stressed 😤',
  sad: 'Sad 😔',
  energized: 'Energized ⚡',
};
