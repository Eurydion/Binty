import { chatCompletionJSON } from '@/services/ai';
import type { HealthSnapshot } from '@/types/health';
import type { Meal } from '@/types/meals';
import type {
  ActivitySlot,
  DailyRoutine,
  HydrationSlot,
  MealSlot,
  RoutineBlock,
  RoutineSlot,
  SlotAlternative,
} from '@/types/routine';
import type { UserProfile } from '@/types/user';
import { analyze, type AnalysisResult } from './analyzer';

/* ------------------------------------------------------------------ */
/*  JSON schema the AI must return                                     */
/* ------------------------------------------------------------------ */

interface AIRoutineResponse {
  blocks: AIBlock[];
}

interface AIBlock {
  label: 'Morning' | 'Afternoon' | 'Evening';
  slots: AISlot[];
}

interface AISlot {
  type: 'activity' | 'meal' | 'hydration' | 'mindfulness' | 'rest';
  time: string;
  title: string;
  category?: string;
  durationMinutes?: number;
  intensity?: string;
  description?: string;
  alternatives?: { title: string; durationMinutes: number; intensity: string; description?: string }[];
  // meal-specific
  mealType?: string;
  meal?: AIMeal;
  alternativeMeals?: AIMeal[];
  // hydration-specific
  targetMl?: number;
}

interface AIMeal {
  name: string;
  nameTagalog?: string;
  category: string;
  recipe: string;
  ingredients: { name: string; unit: string; quantity: number }[];
  calories?: number;
  tags: string[];
  prepMinutes: number;
}

/* ------------------------------------------------------------------ */
/*  System prompt                                                      */
/* ------------------------------------------------------------------ */

function buildSystemPrompt(
  user: UserProfile,
  health: HealthSnapshot,
  analysis: AnalysisResult,
  date: string,
): string {
  const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
  const genderLabel = user.gender ?? 'unspecified';

  return `You are Binti, a Filipino wellness AI. Generate a personalized daily routine as JSON.

## USER PROFILE
- Name: ${user.name}
- Gender: ${genderLabel}
- Age: ${user.age ?? 'unknown'}
- Weight: ${user.weightKg ?? 'unknown'} kg, Height: ${user.heightCm ?? 'unknown'} cm
- Goals: ${user.goals.join(', ')}
- Intensity preference: ${user.intensityPreference}
- Dietary preferences: ${user.dietaryPreferences.length ? user.dietaryPreferences.join(', ') : 'none'}
- Wake time: ${user.wakeTime}, Sleep time: ${user.sleepTime}
- Daily water goal: ${user.dailyWaterGoalMl} ml

## HEALTH DATA (today)
- Heart rate: ${health.latest.heartRate} bpm
- HRV: ${health.latest.hrv} ms
- SpO2: ${health.latest.spo2}%
- Steps so far: ${health.latest.steps}
- Stress level: ${health.latest.stressLevel}/100
- Detected state: ${health.detectedState}
- Sleep: ${health.sleep ? `${Math.round(health.sleep.durationMinutes / 60)}h, quality: ${health.sleep.quality}` : 'no data'}

## ANALYSIS FLAGS
${analysis.flags.length ? analysis.flags.map((f) => `- [${f.severity}] ${f.type}: ${f.context}`).join('\n') : '- None'}

## DATE
${dayName}, ${date}

## RULES — FOLLOW STRICTLY

### Activities
- ONLY home-friendly activities: walking, jogging in place, bodyweight exercises (push-ups, squats, lunges, planks, burpees, crunches, leg raises), stretching, jump rope, stair climbing, household chores (cleaning, laundry, sweeping)
- INCLUDE mindfulness activities: breathing exercises, box breathing, 4-7-8 breathing, body scan, grounding (5-4-3-2-1), gratitude journaling, progressive muscle relaxation
- NEVER suggest: yoga, pilates, tai-chi, swimming, gym/equipment workouts, basketball, cycling, or any activity requiring a venue or special equipment
- Gender-aware selection:
  - For males: favor upper body strength (push-ups, planks), jogging, stair climbing
  - For females: favor lower body toning (squats, lunges, leg raises), stretching, light cardio
  - Mindfulness applies equally to all
- Adjust intensity based on health data — if stress is high (>60) or sleep was poor, prefer lighter activities and more mindfulness
- Each activity slot must include 2 alternatives the user can swap to

### Meals
- ONLY Filipino dishes (Sinigang, Adobo, Tinola, Lugaw, Arroz Caldo, Bistek, Torta, Ginisang, Paksiw, Nilaga, Longsilog, Tapsilog, etc.)
- Include: name, nameTagalog, recipe (brief 3-5 step instructions), ingredients with quantities/units, calories, prepMinutes, tags
- Each meal slot: 2 alternative meals
- Respect dietary preferences (e.g. no-pork → skip pork dishes)
- Keep recipes concise — numbered steps, max 5 steps each

### Hydration
- Include 2–3 water intake reminders spread across the day
- targetMl should sum to the user's daily water goal

### Structure
- Return 3 blocks: Morning, Afternoon, Evening
- Slots should be ordered by time within each block
- Time format: "HH:mm" (24h)
- Morning starts at wake time, Evening block ends ~1h before sleep time

### JSON FORMAT — return ONLY this structure, no markdown:
{"blocks":[{"label":"Morning|Afternoon|Evening","slots":[{"type":"activity|meal|hydration|mindfulness|rest","time":"HH:mm","title":"str","category":"Fitness|Consumption|Work|Mindfulness","durationMinutes":N,"intensity":"light|moderate|intense","description":"brief","alternatives":[{"title":"...","durationMinutes":N,"intensity":"...","description":"..."}],"mealType":"breakfast|lunch|dinner|snack","meal":{"name":"...","nameTagalog":"...","category":"...","recipe":"steps...","ingredients":[{"name":"...","unit":"...","quantity":N}],"calories":N,"tags":[...],"prepMinutes":N},"alternativeMeals":[same meal obj],"targetMl":N}]}]}

Only include fields relevant to each slot type. Activity/mindfulness slots need title,category,durationMinutes,intensity,description,alternatives. Meal slots need mealType,meal,alternativeMeals. Hydration slots need targetMl.`;
}

/* ------------------------------------------------------------------ */
/*  Parse AI response → DailyRoutine                                   */
/* ------------------------------------------------------------------ */

let _slotCounter = 0;
function nextId(): string {
  _slotCounter += 1;
  return `ai-slot-${Date.now()}-${_slotCounter}`;
}

function parseMeal(raw: AIMeal, category: string): Meal {
  return {
    id: `meal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: raw.name,
    nameTagalog: raw.nameTagalog,
    category: category as Meal['category'],
    ingredients: raw.ingredients.map((ing, i) => ({
      id: `ing-${i}-${ing.name.toLowerCase().replace(/\s+/g, '-')}`,
      name: ing.name,
      unit: ing.unit,
      quantity: ing.quantity,
    })),
    recipe: raw.recipe,
    calories: raw.calories,
    tags: raw.tags ?? [],
    prepMinutes: raw.prepMinutes ?? 15,
  };
}

function parseSlot(raw: AISlot): RoutineSlot {
  const id = nextId();

  if (raw.type === 'meal' && raw.meal) {
    const slot: MealSlot = {
      id,
      type: 'meal',
      time: raw.time,
      mealType: (raw.mealType ?? raw.meal.category ?? 'lunch') as MealSlot['mealType'],
      suggestedMealId: null,
      suggestedMeal: parseMeal(raw.meal, raw.mealType ?? raw.meal.category ?? 'lunch'),
      loggedMealId: null,
      completed: false,
      category: 'Consumption',
      alternativeMeals: raw.alternativeMeals?.map((m) => parseMeal(m, raw.mealType ?? 'lunch')),
    };
    return slot;
  }

  if (raw.type === 'hydration') {
    const slot: HydrationSlot = {
      id,
      type: 'hydration',
      time: raw.time,
      targetMl: raw.targetMl ?? 500,
      loggedMl: 0,
      completed: false,
      category: 'Consumption',
    };
    return slot;
  }

  // activity, mindfulness, rest
  const slot: ActivitySlot = {
    id,
    type: raw.type === 'mindfulness' ? 'mindfulness' : raw.type === 'rest' ? 'rest' : 'activity',
    time: raw.time,
    title: raw.title,
    durationMinutes: raw.durationMinutes ?? 15,
    intensity: (raw.intensity as ActivitySlot['intensity']) ?? 'light',
    completed: false,
    description: raw.description,
    category: (raw.category as ActivitySlot['category']) ?? (raw.type === 'mindfulness' ? 'Mindfulness' : 'Fitness'),
    alternatives: raw.alternatives?.map((alt) => ({
      title: alt.title,
      durationMinutes: alt.durationMinutes,
      intensity: (alt.intensity as ActivitySlot['intensity']) ?? 'light',
      description: alt.description,
    })),
  };
  return slot;
}

function parseResponse(data: AIRoutineResponse, date: string): DailyRoutine {
  const blocks: RoutineBlock[] = data.blocks.map((b) => ({
    id: b.label.toLowerCase(),
    label: b.label,
    slots: b.slots.map(parseSlot),
  }));

  return {
    date,
    blocks,
    generatedAt: Date.now(),
    adaptedAt: null,
  };
}

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

export async function generateRoutineWithAI(
  user: UserProfile,
  health: HealthSnapshot,
  date: string,
): Promise<DailyRoutine> {
  const analysis = analyze(health, []);

  const systemPrompt = buildSystemPrompt(user, health, analysis, date);

  const data = await chatCompletionJSON<AIRoutineResponse>({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Generate my routine for ${date}. Return JSON only.` },
    ],
    temperature: 0.7,
    maxTokens: 16384,
  });

  return parseResponse(data, date);
}
