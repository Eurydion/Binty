export type TipCategory =
  | 'nutrition'
  | 'movement'
  | 'stress'
  | 'sleep'
  | 'hydration'
  | 'mindfulness';

export interface Tip {
  id: string;
  category: TipCategory;
  title: string;
  preview: string;
  body: string;
}

export const TIP_CATEGORY_META: Record<
  TipCategory,
  { label: string; icon: string; color: string }
> = {
  nutrition:   { label: 'Nutrition',   icon: 'nutrition',  color: '#4F7942' },
  movement:    { label: 'Movement',    icon: 'walk',       color: '#E1AD01' },
  stress:      { label: 'Stress',      icon: 'flash',      color: '#D97757' },
  sleep:       { label: 'Sleep',       icon: 'moon',       color: '#A7C7E7' },
  hydration:   { label: 'Hydration',   icon: 'water',      color: '#4A9B9B' },
  mindfulness: { label: 'Mindfulness', icon: 'sparkles',   color: '#7B68EE' },
};

export const TIPS: Tip[] = [
  {
    id: 'nutri-rainbow',
    category: 'nutrition',
    title: 'Eat the rainbow today',
    preview: 'Aim for 3+ colors on your plate at one meal.',
    body: 'Different colored fruits and vegetables carry different antioxidants and nutrients. A red tomato, green leafy, and yellow squash on the same plate gives you a broader micronutrient base than any single super-food.',
  },
  {
    id: 'nutri-protein-breakfast',
    category: 'nutrition',
    title: 'Front-load your protein',
    preview: 'A protein-rich breakfast steadies energy until lunch.',
    body: 'Eggs, yogurt, tofu, or beans at breakfast can blunt mid-morning crashes. ~20g of protein early helps with satiety, focus, and reduces snack cravings.',
  },
  {
    id: 'nutri-fiber-swap',
    category: 'nutrition',
    title: 'One small fiber swap',
    preview: 'Brown rice instead of white. Whole-grain bread instead of white.',
    body: 'You don’t have to overhaul your diet. Swapping one refined carb for a whole-grain version each day adds 3–5g of fiber, supporting gut health and steadier blood sugar.',
  },
  {
    id: 'nutri-snack-pair',
    category: 'nutrition',
    title: 'Pair your snacks',
    preview: 'Carb + protein/fat keeps energy stable longer.',
    body: 'An apple alone spikes and dips. An apple with peanut butter releases energy slowly. Pairing turns a quick fix into sustained focus.',
  },
  {
    id: 'nutri-mindful-bite',
    category: 'nutrition',
    title: 'Take 3 mindful bites',
    preview: 'Slow down for the first three bites of any meal.',
    body: 'Chewing thoroughly and noticing flavor for just 3 bites activates your fullness signals earlier. You’ll often feel satisfied with less.',
  },

  {
    id: 'move-2min-rule',
    category: 'movement',
    title: 'The 2-minute rule',
    preview: 'Move for 2 minutes after every hour of sitting.',
    body: 'Short, frequent movement breaks improve circulation more than one long workout after sitting all day. Stand, stretch, or walk to refill water — anything counts.',
  },
  {
    id: 'move-stairs-bonus',
    category: 'movement',
    title: 'Take the stairs once',
    preview: 'One flight a day adds up faster than you think.',
    body: 'Climbing stairs is a built-in cardio + leg strength combo. Even one flight, done daily, builds capacity over weeks. Bonus: it’s free and always available.',
  },
  {
    id: 'move-walk-call',
    category: 'movement',
    title: 'Walk while you talk',
    preview: 'Take a phone call on your feet today.',
    body: 'Pacing during a 15-minute call adds ~1,000 steps and gets blood moving. It also helps with focus — many people think more clearly while walking.',
  },
  {
    id: 'move-mobility-min',
    category: 'movement',
    title: 'One minute of mobility',
    preview: 'Roll your shoulders, neck, and ankles before bed.',
    body: 'Small joints accumulate stiffness from screens and posture. A daily 60-second mobility check (neck circles, shoulder rolls, ankle rotations) prevents tomorrow’s tightness.',
  },
  {
    id: 'move-bodyweight-snack',
    category: 'movement',
    title: 'Exercise snack',
    preview: '10 squats. Anywhere. Right now.',
    body: 'A handful of bodyweight reps scattered through the day (squats, push-ups, calf raises) builds strength without needing a gym or 30-minute block.',
  },

  {
    id: 'stress-box-breath',
    category: 'stress',
    title: 'Box breathing reset',
    preview: 'Inhale 4, hold 4, exhale 4, hold 4. Three rounds.',
    body: 'Box breathing slows your heart rate and signals safety to your nervous system. It’s used by Navy SEALs and ER nurses. Three rounds (about 48 seconds) is enough to feel a shift.',
  },
  {
    id: 'stress-name-it',
    category: 'stress',
    title: 'Name what you feel',
    preview: 'Label the emotion to lower its intensity.',
    body: '“Name it to tame it.” Studies show that just labeling an emotion (“I’m anxious about this meeting”) reduces amygdala activation. Specificity helps — “anxious” is more useful than “bad.”',
  },
  {
    id: 'stress-shoulder-drop',
    category: 'stress',
    title: 'Drop your shoulders',
    preview: 'Right now — notice them, exhale, let them fall.',
    body: 'Tension hides in your shoulders, jaw, and brow. A quick body scan + intentional release can interrupt a stress loop in under 10 seconds.',
  },
  {
    id: 'stress-cold-water',
    category: 'stress',
    title: 'Cold water on your wrists',
    preview: 'Rinse your wrists with cool water for 30 seconds.',
    body: 'The cool sensation activates the dive reflex and slows your heart rate. It’s a fast, physical reset when you can’t step away or breathe deeply.',
  },
  {
    id: 'stress-worry-window',
    category: 'stress',
    title: 'Schedule a worry window',
    preview: 'Save anxious thoughts for a 10-minute slot later.',
    body: 'When a worry intrudes, jot it down and tell yourself “I’ll think about this at 6pm.” Most worries lose urgency by then. Containing them frees the rest of your day.',
  },

  {
    id: 'sleep-wind-down',
    category: 'sleep',
    title: 'A 30-minute wind-down',
    preview: 'Dim lights and slow down 30 min before bed.',
    body: 'Bright light and bright screens delay melatonin. Dimming lamps and switching to slower activities (reading, stretching) tells your brain it’s safe to sleep.',
  },
  {
    id: 'sleep-cool-room',
    category: 'sleep',
    title: 'Cool the room slightly',
    preview: '18–20°C (65–68°F) is the sweet spot for most.',
    body: 'Your core temperature naturally drops as you fall asleep. A slightly cool room helps the process. If you can’t adjust thermostat, a cracked window or thinner blanket helps.',
  },
  {
    id: 'sleep-consistent-wake',
    category: 'sleep',
    title: 'Anchor your wake time',
    preview: 'Wake at the same time, even on weekends.',
    body: 'A consistent wake-up time is the single biggest lever for sleep quality. Bedtime can flex; wake time should not. Your circadian rhythm rewards predictability.',
  },
  {
    id: 'sleep-no-doom',
    category: 'sleep',
    title: 'No doom-scrolling in bed',
    preview: 'Put the phone across the room tonight.',
    body: 'Phones in bed train your brain that bed = stimulation. Charging your phone in another room (and using a real alarm) breaks the cycle in days, not weeks.',
  },
  {
    id: 'sleep-magnesium-meal',
    category: 'sleep',
    title: 'Magnesium-rich dinner',
    preview: 'Leafy greens, nuts, beans — small boost to sleep.',
    body: 'Magnesium supports calming neurotransmitters. You don’t need supplements — spinach, almonds, black beans, or a square of dark chocolate at dinner can nudge you toward deeper sleep.',
  },

  {
    id: 'hydra-morning-glass',
    category: 'hydration',
    title: 'Glass of water on waking',
    preview: 'Before coffee, drink a full glass.',
    body: 'You wake up mildly dehydrated after 7–8 hours without fluid. Front-loading water rehydrates you faster than coffee — and many “morning headaches” are actually thirst.',
  },
  {
    id: 'hydra-thirst-cue',
    category: 'hydration',
    title: 'Don’t wait for thirst',
    preview: 'Thirst means you’re already mildly dehydrated.',
    body: 'Sip on a regular cadence rather than waiting for the thirst signal. Keeping a water bottle visible doubles intake for most people without thinking about it.',
  },
  {
    id: 'hydra-flavor-it',
    category: 'hydration',
    title: 'Flavor your water',
    preview: 'Lemon, mint, cucumber — anything to drink more.',
    body: 'If plain water bores you, add fruit, herbs, or a splash of juice. The hydration is the goal, not the purity. Flavored sparkling water counts too.',
  },
  {
    id: 'hydra-electrolytes',
    category: 'hydration',
    title: 'Salt + water after sweat',
    preview: 'Replenish electrolytes after exercise or heat.',
    body: 'Plain water alone after heavy sweat can dilute electrolytes and leave you feeling worse. A pinch of salt + a citrus squeeze in water restores balance — no fancy drinks needed.',
  },
  {
    id: 'hydra-mealtime-cup',
    category: 'hydration',
    title: 'A cup with every meal',
    preview: 'Anchor water to existing eating habits.',
    body: 'Habit-stacking works: if you always have water with breakfast, lunch, and dinner, you’re already at ~750ml without effort. Add snacks and you’re at goal.',
  },

  {
    id: 'mind-three-good',
    category: 'mindfulness',
    title: 'Three good things',
    preview: 'Note 3 small wins from today before bed.',
    body: 'Tiny gratitude practices have measurable effects on mood and sleep. They don’t need to be profound — “sun on my walk,” “a good coffee,” “finished one task” all count.',
  },
  {
    id: 'mind-5-senses',
    category: 'mindfulness',
    title: '5-4-3-2-1 grounding',
    preview: 'Name 5 see, 4 feel, 3 hear, 2 smell, 1 taste.',
    body: 'When your mind is spinning, this sensory scan brings you back to the present. It works on planes, in meetings, anywhere — and takes about 90 seconds.',
  },
  {
    id: 'mind-single-task',
    category: 'mindfulness',
    title: 'Pick one thing',
    preview: 'Single-task for the next 25 minutes.',
    body: 'Multitasking is mostly task-switching with a cost. Pick one task, close other tabs, and give it your full attention for one Pomodoro. The relief is often immediate.',
  },
  {
    id: 'mind-check-in',
    category: 'mindfulness',
    title: 'Mid-day check-in',
    preview: 'Pause: how am I, really, right now?',
    body: 'Set a single midday alarm with the question “how am I?” No fix needed — just notice. Awareness is often enough to course-correct (water, food, a stretch, a breath).',
  },
  {
    id: 'mind-screen-sunset',
    category: 'mindfulness',
    title: 'A screen sunset',
    preview: 'Pick one window each day to be screen-free.',
    body: 'Even 20 minutes — your morning coffee, a walk, dinner — without a screen lets your attention rebuild. It often becomes the favorite part of your day.',
  },
];

export const TIPS_BY_ID: Record<string, Tip> = TIPS.reduce<Record<string, Tip>>(
  (acc, t) => {
    acc[t.id] = t;
    return acc;
  },
  {},
);
