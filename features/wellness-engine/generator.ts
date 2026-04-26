import { enrichMealWithPrices } from '@/features/meals/ingredient-calculator';
import { FILIPINO_MEALS } from '@/features/meals/recipes';
import type { HealthSnapshot } from '@/types/health';
import type { Meal } from '@/types/meals';
import type {
    ActivitySlot,
    DailyRoutine,
    HydrationSlot,
    IntensityLevel,
    MealSlot,
    RoutineBlock,
    RoutineCategoryTag,
    SlotAlternative,
} from '@/types/routine';
import type { UserProfile, WellnessGoal } from '@/types/user';
import {
    JSON_LIGHT_MOVEMENT,
    JSON_MEDIUM_MOVEMENT,
    JSON_MINDFULNESS,
    JSON_STRENGTH,
} from './json-routines';

// ─── Seeded PRNG (mulberry32) ───────────────────────────────────

function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = ((hash << 5) - hash + ch) | 0;
  }
  return hash;
}

function buildSeed(date: string, userId: string, stressLevel: number): number {
  const stressBucket = Math.floor(stressLevel / 10);
  const raw = date + ":" + userId + ":" + String(stressBucket);
  return hashString(raw);
}

// ─── Helpers ────────────────────────────────────────────────────

function parseTime(hhmm: string): { h: number; m: number } {
  const [h, m] = hhmm.split(':').map(Number);
  return { h, m };
}

function fmt(h: number, m: number): string {
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function advanceTime(t: { h: number; m: number }, minutes: number): void {
  t.m += minutes;
  if (t.m >= 60) {
    t.h += Math.floor(t.m / 60);
    t.m %= 60;
  }
}

let _rng: () => number = Math.random;
let _uidCounter = 0;

function uid(): string {
  _uidCounter++;
  const r = _rng();
  return "s-" + _uidCounter.toString(36) + "-" + Math.floor(r * 2176782336).toString(36);
}

function pick<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => _rng() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

function pickOne<T>(arr: T[]): T {
  return arr[Math.floor(_rng() * arr.length)];
}

function mealsByCategory(cat: Meal['category']): Meal[] {
  return FILIPINO_MEALS.filter((m) => m.category === cat);
}

// ─── Pork-related ingredient IDs for dietary filtering ──────────

const PORK_INGREDIENT_IDS = new Set([
  "pork-belly",
  "pork-ground",
  "pork-kasim",
  "longganisa",
]);

const PORK_NAME_KEYWORDS = ["pork", "longganisa", "baboy"];

function mealContainsPork(meal: Meal): boolean {
  for (const ing of meal.ingredients) {
    if (PORK_INGREDIENT_IDS.has(ing.id)) return true;
    const lower = ing.name.toLowerCase();
    for (const kw of PORK_NAME_KEYWORDS) {
      if (lower.includes(kw)) return true;
    }
  }
  const nameLower = meal.name.toLowerCase();
  for (const kw of PORK_NAME_KEYWORDS) {
    if (nameLower.includes(kw)) return true;
  }
  return false;
}

function filterMealsByDiet(meals: Meal[], prefs: string[]): Meal[] {
  let filtered = meals;
  for (const pref of prefs) {
    const p = pref.toLowerCase();
    if (p === "no-pork") {
      filtered = filtered.filter((m) => !mealContainsPork(m));
    } else if (p === "vegetarian" || p === "vegan") {
      const meatIds = new Set([
        "pork-belly", "pork-ground", "pork-kasim", "longganisa",
        "chicken", "bangus", "egg",
      ]);
      filtered = filtered.filter((m) =>
        m.ingredients.every((ing) => !meatIds.has(ing.id))
      );
    }
  }
  if (filtered.length === 0) return meals;
  return filtered;
}

// ─── Activity pools ─────────────────────────────────────────────

interface ActivityDef {
  title: string;
  duration: number;
  intensity: IntensityLevel;
  category: RoutineCategoryTag;
  type: 'activity' | 'mindfulness';
  description?: string;
}

const FITNESS_MORNING: ActivityDef[] = [
  { title: "Morning Stretch Routine", duration: 10, intensity: "light", category: "Fitness", type: "activity", description: "Full-body stretching to wake up joints and muscles." },
  { title: "Bodyweight Squats & Lunges", duration: 15, intensity: "moderate", category: "Fitness", type: "activity", description: "3 sets of 15 squats and 10 lunges per leg." },
  { title: "Jump Rope Cardio", duration: 12, intensity: "intense", category: "Fitness", type: "activity", description: "4 rounds of 2 min jumping, 1 min rest." },
  { title: "Sun Salutation Yoga Flow", duration: 15, intensity: "light", category: "Fitness", type: "activity", description: "5 rounds of Surya Namaskar for flexibility and calm." },
  { title: "Push-ups & Planks", duration: 10, intensity: "moderate", category: "Fitness", type: "activity", description: "3 sets of 12 push-ups, 30s plank between sets." },
  { title: "Brisk Morning Walk", duration: 20, intensity: "light", category: "Fitness", type: "activity", description: "Walk around the neighborhood at a quick pace." },
];

const FITNESS_AFTERNOON: ActivityDef[] = [
  { title: "Stair Climbing", duration: 15, intensity: "moderate", category: "Fitness", type: "activity", description: "Climb up and down stairs for 15 minutes." },
  { title: "Dancing Exercise", duration: 20, intensity: "moderate", category: "Fitness", type: "activity", description: "Free-form dance to upbeat music for cardio." },
  { title: "Wall Sit & Calf Raises", duration: 10, intensity: "moderate", category: "Fitness", type: "activity", description: "Hold wall sit 45s x 3, calf raises 20 x 3." },
  { title: "Household Chore Workout", duration: 25, intensity: "light", category: "Fitness", type: "activity", description: "Active cleaning — mopping, sweeping, laundry." },
  { title: "Resistance Band Training", duration: 15, intensity: "moderate", category: "Fitness", type: "activity", description: "Upper body pulls, rows, and curls with bands." },
];

const FITNESS_EVENING: ActivityDef[] = [
  { title: "Evening Stretching", duration: 10, intensity: "light", category: "Fitness", type: "activity", description: "Gentle stretches to release tension before bed." },
  { title: "Walking in Place", duration: 15, intensity: "light", category: "Fitness", type: "activity", description: "Light movement while watching TV or listening to a podcast." },
  { title: "Gentle Yoga Wind-Down", duration: 15, intensity: "light", category: "Fitness", type: "activity", description: "Child's pose, cat-cow, supine twist sequence." },
];

const MINDFULNESS_POOL: ActivityDef[] = [
  { title: "Box Breathing", duration: 5, intensity: "light", category: "Mindfulness", type: "mindfulness", description: "Breathe in 4s, hold 4s, out 4s, hold 4s. Repeat 5 cycles." },
  { title: "4-7-8 Breathing", duration: 5, intensity: "light", category: "Mindfulness", type: "mindfulness", description: "Inhale 4s, hold 7s, exhale 8s. Calms the nervous system." },
  { title: "Body Scan Meditation", duration: 10, intensity: "light", category: "Mindfulness", type: "mindfulness", description: "Mentally scan from head to toe, relaxing each body part." },
  { title: "5-4-3-2-1 Grounding", duration: 5, intensity: "light", category: "Mindfulness", type: "mindfulness", description: "Name 5 things you see, 4 you feel, 3 you hear, 2 you smell, 1 you taste." },
  { title: "Gratitude Journaling", duration: 10, intensity: "light", category: "Mindfulness", type: "mindfulness", description: "Write 3 things you are grateful for today." },
  { title: "Progressive Muscle Relaxation", duration: 10, intensity: "light", category: "Mindfulness", type: "mindfulness", description: "Tense and release each muscle group for deep relaxation." },
  { title: "Mindful Breathing", duration: 5, intensity: "light", category: "Mindfulness", type: "mindfulness", description: "Focus solely on your breath for 5 minutes." },
  { title: "Loving-Kindness Meditation", duration: 10, intensity: "light", category: "Mindfulness", type: "mindfulness", description: "Send wishes of wellbeing to yourself and others." },
];

const RECOVERY_POOL: ActivityDef[] = [
  { title: "Foam Rolling Self-Massage", duration: 10, intensity: "light", category: "Fitness", type: "activity", description: "Roll out tight spots in legs, back, and shoulders." },
  { title: "Restorative Yoga", duration: 20, intensity: "light", category: "Fitness", type: "activity", description: "Supported poses held for several minutes for deep recovery." },
  { title: "Guided Sleep Preparation", duration: 15, intensity: "light", category: "Mindfulness", type: "mindfulness", description: "A guided visualization to prepare mind and body for restful sleep." },
  { title: "Gentle Neck & Shoulder Release", duration: 10, intensity: "light", category: "Fitness", type: "activity", description: "Slow stretches targeting neck and shoulder tension." },
];

const ENERGIZING_POOL: ActivityDef[] = [
  { title: "Dance to Your Favorite Song", duration: 10, intensity: "moderate", category: "Fitness", type: "activity", description: "Pick a song you love and dance freely to boost mood." },
  { title: "Power Posing & Affirmations", duration: 5, intensity: "light", category: "Mindfulness", type: "mindfulness", description: "Hold confident poses while reciting positive affirmations." },
  { title: "Quick Declutter Sprint", duration: 15, intensity: "light", category: "Fitness", type: "activity", description: "Tidy up a small area — tidying as a mood booster." },
  { title: "Call or Message a Friend", duration: 10, intensity: "light", category: "Mindfulness", type: "mindfulness", description: "Reach out to someone you care about for a quick connection." },
];

const STRENGTH_POOL: ActivityDef[] = [
  { title: "Bodyweight Circuit", duration: 20, intensity: "moderate", category: "Fitness", type: "activity", description: "Push-ups, squats, and lunges in a timed circuit." },
  { title: "Resistance Band Full Body", duration: 25, intensity: "moderate", category: "Fitness", type: "activity", description: "Full body workout using resistance bands for all major groups." },
  { title: "Core Crusher", duration: 15, intensity: "moderate", category: "Fitness", type: "activity", description: "Planks, crunches, and leg raises for a strong core." },
];

const STRESS_RELIEF_BREATHING: ActivityDef = {
  title: "Stress Relief Breathing",
  duration: 10,
  intensity: "light",
  category: "Mindfulness",
  type: "mindfulness",
  description: "Extended deep breathing session focused on releasing tension and calming the nervous system.",
};

const WALKING_ACTIVITY: ActivityDef = {
  title: "Go for a Walk",
  duration: 20,
  intensity: "light",
  category: "Fitness",
  type: "activity",
  description: "A 20-minute walk to get your steps in and enjoy fresh air.",
};

const EVENING_WIND_DOWN: ActivityDef = {
  title: "Evening Wind-Down Routine",
  duration: 15,
  intensity: "light",
  category: "Mindfulness",
  type: "mindfulness",
  description: "Dim lights, no screens, gentle stretching and breathing to prepare for sleep.",
};

// ─── Merge JSON-defined exercises into hardcoded pools ──────────

(() => {
  const seen = new Set<string>();
  const collect = (pool: ActivityDef[]) => {
    for (const a of pool) seen.add(a.title.toLowerCase());
  };
  collect(FITNESS_MORNING);
  collect(FITNESS_AFTERNOON);
  collect(FITNESS_EVENING);
  collect(MINDFULNESS_POOL);
  collect(RECOVERY_POOL);
  collect(ENERGIZING_POOL);
  collect(STRENGTH_POOL);

  const pushUnique = (pool: ActivityDef[], items: ActivityDef[]) => {
    for (const it of items) {
      const key = it.title.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      pool.push(it);
    }
  };

  // Breathing + stationary → mindfulness
  pushUnique(MINDFULNESS_POOL, JSON_MINDFULNESS);
  // Light movement → recovery + evening fitness (both are light-intensity buckets)
  pushUnique(RECOVERY_POOL, JSON_LIGHT_MOVEMENT);
  pushUnique(FITNESS_EVENING, JSON_LIGHT_MOVEMENT);
  // Medium cardio → morning + afternoon fitness pools
  pushUnique(FITNESS_MORNING, JSON_MEDIUM_MOVEMENT);
  pushUnique(FITNESS_AFTERNOON, JSON_MEDIUM_MOVEMENT);
  // Heavy weightlifting → strength pool
  pushUnique(STRENGTH_POOL, JSON_STRENGTH);
})();

// ─── Health analysis helpers ────────────────────────────────────

type AllowedIntensity = 'light' | 'moderate' | 'intense';

interface HealthProfile {
  maxIntensity: AllowedIntensity;
  mindfulnessCount: number;
  isRecoveryDay: boolean;
  addStressRelief: boolean;
  addEnergizing: boolean;
  addStrength: boolean;
  addWalking: boolean;
  addWindDown: boolean;
  prioritizeBreathing: boolean;
  extraCardio: boolean;
  preferLowCalMeals: boolean;
  preferHighProteinMeals: boolean;
  preferComfortFood: boolean;
  preferEnergizingBreakfast: boolean;
  calorieTarget: number;
}

function estimateDailyCalories(user: UserProfile): number {
  const weight = user.weightKg ?? 65;
  const age = user.age ?? 30;
  const gender = user.gender ?? "male";
  let bmr: number;
  if (gender === "male") {
    bmr = 10 * weight + 6.25 * (user.heightCm ?? 170) - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * (user.heightCm ?? 160) - 5 * age - 161;
  }
  return Math.round(bmr * 1.4);
}

function analyzeHealth(user: UserProfile, health: HealthSnapshot): HealthProfile {
  const goals = new Set<WellnessGoal>(user.goals);
  const stress = health.latest.stressLevel;
  const hr = health.latest.heartRate;
  const hrv = health.latest.hrv;
  const spo2 = health.latest.spo2;
  const steps = health.latest.steps;
  const state = health.detectedState;
  const sleepQuality = health.sleep?.quality ?? "fair";
  const sleepDuration = health.sleep?.durationMinutes ?? 420;
  const age = user.age ?? 30;
  const calTarget = estimateDailyCalories(user);

  let maxIntensity: AllowedIntensity = "intense";
  let mindfulnessCount = 2;
  let isRecoveryDay = false;
  let addStressRelief = false;
  let addEnergizing = false;
  let addStrength = false;
  let addWalking = false;
  let addWindDown = false;
  let prioritizeBreathing = false;
  let extraCardio = false;
  let preferLowCalMeals = false;
  let preferHighProteinMeals = false;
  let preferComfortFood = false;
  let preferEnergizingBreakfast = false;

  // --- Sleep quality ---
  if (sleepQuality === "poor" || sleepDuration < 300) {
    maxIntensity = "light";
    mindfulnessCount = 4;
    preferEnergizingBreakfast = true;
  } else if (sleepQuality === "fair") {
    if (maxIntensity === "intense") maxIntensity = "moderate";
    mindfulnessCount = Math.max(mindfulnessCount, 3);
  }

  // --- Emotional state ---
  if (state === "stressed" || state === "anxious") {
    mindfulnessCount = Math.max(mindfulnessCount, 4);
    if (maxIntensity === "intense") maxIntensity = "moderate";
    if (maxIntensity === "moderate") maxIntensity = "light";
    addStressRelief = true;
    preferComfortFood = true;
  } else if (state === "sad") {
    addEnergizing = true;
    mindfulnessCount = Math.max(mindfulnessCount, 3);
  } else if (state === "energized") {
    addStrength = true;
  }

  // --- Heart rate ---
  if (hr > 100) {
    if (maxIntensity === "intense") maxIntensity = "light";
    if (maxIntensity === "moderate") maxIntensity = "light";
    mindfulnessCount = Math.max(mindfulnessCount, 3);
  } else if (hr < 60) {
    addEnergizing = true;
  }

  // --- HRV ---
  if (hrv < 20) {
    isRecoveryDay = true;
    maxIntensity = "light";
    mindfulnessCount = Math.max(mindfulnessCount, 4);
  } else if (hrv < 40) {
    if (maxIntensity === "intense") maxIntensity = "moderate";
  }

  // --- SPO2 ---
  if (spo2 < 95) {
    prioritizeBreathing = true;
    mindfulnessCount = Math.max(mindfulnessCount, 3);
  }

  // --- Steps ---
  if (steps < 2000) {
    addWalking = true;
  }

  // --- Age ---
  if (age > 60) {
    if (maxIntensity === "intense") maxIntensity = "moderate";
  } else if (age < 18) {
    if (maxIntensity === "intense") maxIntensity = "moderate";
  }

  // --- User intensity preference ---
  if (user.intensityPreference === "light") {
    maxIntensity = "light";
  } else if (user.intensityPreference === "moderate" && maxIntensity === "intense") {
    maxIntensity = "moderate";
  }

  // --- Goals ---
  if (goals.has("stress-reduction")) {
    mindfulnessCount = Math.max(mindfulnessCount, 3);
    if (maxIntensity === "intense") maxIntensity = "moderate";
  }
  if (goals.has("weight-loss")) {
    preferLowCalMeals = true;
    extraCardio = true;
  }
  if (goals.has("muscle-gain")) {
    preferHighProteinMeals = true;
    addStrength = true;
  }
  if (goals.has("better-sleep")) {
    addWindDown = true;
  }

  return {
    maxIntensity,
    mindfulnessCount,
    isRecoveryDay,
    addStressRelief,
    addEnergizing,
    addStrength,
    addWalking,
    addWindDown,
    prioritizeBreathing,
    extraCardio,
    preferLowCalMeals,
    preferHighProteinMeals,
    preferComfortFood,
    preferEnergizingBreakfast,
    calorieTarget: calTarget,
  };
}

// ─── Filtering helpers ──────────────────────────────────────────

function filterByIntensity(pool: ActivityDef[], max: AllowedIntensity): ActivityDef[] {
  const rank: Record<AllowedIntensity, number> = { light: 0, moderate: 1, intense: 2 };
  const maxRank = rank[max];
  const filtered = pool.filter((a) => rank[a.intensity] <= maxRank);
  return filtered.length > 0 ? filtered : pool.filter((a) => a.intensity === "light");
}

function sortMealsByCalorie(meals: Meal[], preferLow: boolean): Meal[] {
  return [...meals].sort((a, b) => {
    const ca = a.calories ?? 300;
    const cb = b.calories ?? 300;
    return preferLow ? ca - cb : cb - ca;
  });
}

function filterMealsByTags(meals: Meal[], tags: string[]): Meal[] {
  if (tags.length === 0) return meals;
  const preferred = meals.filter((m) => m.tags.some((t) => tags.includes(t)));
  return preferred.length > 0 ? preferred : meals;
}

// ─── Slot builders ──────────────────────────────────────────────

function buildAlternatives(pool: ActivityDef[], exclude: string, count = 2): SlotAlternative[] {
  const candidates = pool.filter((a) => a.title !== exclude);
  return pick(candidates, count).map((a) => ({
    title: a.title,
    durationMinutes: a.duration,
    intensity: a.intensity,
    category: a.category,
    description: a.description,
  }));
}

function makeActivitySlot(
  def: ActivityDef,
  time: string,
  pool: ActivityDef[],
): ActivitySlot {
  return {
    id: uid(),
    type: def.type,
    time,
    title: def.title,
    durationMinutes: def.duration,
    intensity: def.intensity,
    completed: false,
    description: def.description,
    category: def.category,
    alternatives: buildAlternatives(pool, def.title),
  };
}

function makeMealSlot(
  time: string,
  mealType: MealSlot['mealType'],
  primary: Meal,
  alternatives: Meal[],
): MealSlot {
  return {
    id: uid(),
    type: 'meal',
    time,
    mealType,
    suggestedMealId: primary.id,
    suggestedMeal: primary,
    loggedMealId: null,
    completed: false,
    category: 'Consumption',
    alternativeMeals: alternatives.filter((m) => m.id !== primary.id),
  };
}

function makeHydrationSlot(time: string, targetMl: number): HydrationSlot {
  return {
    id: uid(),
    type: 'hydration',
    time,
    targetMl,
    loggedMl: 0,
    completed: false,
    category: 'Consumption',
  };
}

// ─── Main generator ─────────────────────────────────────────────

/**
 * Generates a complete daily routine locally — no AI required.
 * Uses a seeded PRNG so the same date + user + health bucket = same routine.
 */
export async function generateLocalRoutine(
  user: UserProfile,
  health: HealthSnapshot,
  date: string,
): Promise<DailyRoutine> {
  // Seed the PRNG deterministically
  const seed = buildSeed(date, user.id, health.latest.stressLevel);
  _rng = mulberry32(seed);
  _uidCounter = 0;

  const wake = parseTime(user.wakeTime);
  const sleep = parseTime(user.sleepTime);
  const hp = analyzeHealth(user, health);

  // Use stub prices for instant generation — live prices are fetched separately by the UI
  const { getStubPrices } = await import('@/features/meals/market-api');
  const prices = getStubPrices();

  const enrich = (meal: Meal) =>
    prices.length > 0 ? enrichMealWithPrices(meal, prices) : meal;

  // Filter meals by dietary preferences
  const dietPrefs = user.dietaryPreferences;
  let breakfasts = filterMealsByDiet(mealsByCategory("breakfast"), dietPrefs);
  let lunches = filterMealsByDiet(mealsByCategory("lunch"), dietPrefs);
  let dinners = filterMealsByDiet(mealsByCategory("dinner"), dietPrefs);
  let snacks = filterMealsByDiet(mealsByCategory("snack"), dietPrefs);

  // Apply tag-based preferences
  const mealTags: string[] = [];
  if (hp.preferComfortFood) mealTags.push("comfort-food", "calming", "warm");
  if (hp.preferHighProteinMeals) mealTags.push("high-protein", "protein-rich");

  if (mealTags.length > 0) {
    lunches = filterMealsByTags(lunches, mealTags);
    dinners = filterMealsByTags(dinners, mealTags);
  }

  // Energizing breakfast when sleep is poor
  if (hp.preferEnergizingBreakfast) {
    breakfasts = filterMealsByTags(breakfasts, ["savory", "filling", "high-protein"]);
  }

  // Sort by calorie preference
  if (hp.preferLowCalMeals) {
    breakfasts = sortMealsByCalorie(breakfasts, true);
    lunches = sortMealsByCalorie(lunches, true);
    dinners = sortMealsByCalorie(dinners, true);
    snacks = sortMealsByCalorie(snacks, true);
  } else if (hp.preferHighProteinMeals) {
    breakfasts = sortMealsByCalorie(breakfasts, false);
    lunches = sortMealsByCalorie(lunches, false);
    dinners = sortMealsByCalorie(dinners, false);
  }

  const bfPrimary = enrich(pickOne(breakfasts));
  const bfAlts = pick(breakfasts, 3).map(enrich);
  const lunchPrimary = enrich(pickOne(lunches));
  const lunchAlts = pick(lunches, 3).map(enrich);
  const dinnerPrimary = enrich(pickOne(dinners));
  const dinnerAlts = pick(dinners, 3).map(enrich);
  const snackPrimary = enrich(pickOne(snacks));
  const snackAlts = pick(snacks, 3).map(enrich);

  // Build filtered fitness pools
  const morningPool = filterByIntensity(FITNESS_MORNING, hp.maxIntensity);
  const afternoonPool = filterByIntensity(FITNESS_AFTERNOON, hp.maxIntensity);
  const eveningPool = FITNESS_EVENING; // already all light

  // Mindfulness picks — prioritize breathing exercises if SPO2 low
  let mindfulnessSource = [...MINDFULNESS_POOL];
  if (hp.prioritizeBreathing) {
    const breathing = mindfulnessSource.filter(
      (a) => a.title === "Box Breathing" || a.title === "4-7-8 Breathing"
    );
    const others = mindfulnessSource.filter(
      (a) => a.title !== "Box Breathing" && a.title !== "4-7-8 Breathing"
    );
    mindfulnessSource = [...breathing, ...pick(others, others.length)];
  }
  const mindfulnessPicks = pick(mindfulnessSource, hp.mindfulnessCount);

  // Recovery pool picks for recovery days
  const recoveryPicks = hp.isRecoveryDay ? pick(RECOVERY_POOL, 2) : [];

  // Energizing picks
  const energizingPicks = hp.addEnergizing ? pick(ENERGIZING_POOL, 2) : [];

  // Strength picks
  const strengthPicks = hp.addStrength ? pick(STRENGTH_POOL, 1) : [];

  // Hydration distribution
  const waterGoal = user.dailyWaterGoalMl;
  const waterSlotCount = 3;
  const mlPerSlot = Math.round(waterGoal / waterSlotCount);

  // ─── Morning block ───
  const morningSlots: (ActivitySlot | MealSlot | HydrationSlot)[] = [];
  const t = { ...wake };

  // Mindfulness first
  if (mindfulnessPicks.length > 0) {
    const morningMind = mindfulnessPicks[0];
    morningSlots.push(makeActivitySlot(morningMind, fmt(t.h, t.m), MINDFULNESS_POOL));
    advanceTime(t, morningMind.duration + 5);
  }

  // Stress relief breathing if needed (morning)
  if (hp.addStressRelief) {
    morningSlots.push(makeActivitySlot(STRESS_RELIEF_BREATHING, fmt(t.h, t.m), MINDFULNESS_POOL));
    advanceTime(t, STRESS_RELIEF_BREATHING.duration + 5);
  }

  // Recovery activity in morning
  if (recoveryPicks.length > 0) {
    morningSlots.push(makeActivitySlot(recoveryPicks[0], fmt(t.h, t.m), RECOVERY_POOL));
    advanceTime(t, recoveryPicks[0].duration + 5);
  }

  // Morning fitness (skip if recovery day — already added recovery activity)
  if (!hp.isRecoveryDay) {
    const morningFit = pickOne(morningPool);
    morningSlots.push(makeActivitySlot(morningFit, fmt(t.h, t.m), morningPool));
    advanceTime(t, morningFit.duration + 5);
  }

  // Walking if steps are low
  if (hp.addWalking) {
    morningSlots.push(makeActivitySlot(WALKING_ACTIVITY, fmt(t.h, t.m), [WALKING_ACTIVITY]));
    advanceTime(t, WALKING_ACTIVITY.duration + 5);
  }

  // Hydration
  morningSlots.push(makeHydrationSlot(fmt(t.h, t.m), mlPerSlot));
  advanceTime(t, 5);

  // Breakfast
  morningSlots.push(makeMealSlot(fmt(t.h, t.m), "breakfast", bfPrimary, bfAlts));

  // ─── Afternoon block ───
  const afternoonSlots: (ActivitySlot | MealSlot | HydrationSlot)[] = [];
  const at = { h: 12, m: 0 };

  // Lunch
  afternoonSlots.push(makeMealSlot(fmt(at.h, at.m), "lunch", lunchPrimary, lunchAlts));
  advanceTime(at, 45);

  // Hydration
  afternoonSlots.push(makeHydrationSlot(fmt(at.h, at.m), mlPerSlot));
  advanceTime(at, 5);

  // Afternoon mindfulness
  if (mindfulnessPicks.length > 1) {
    const aftMind = mindfulnessPicks[1];
    afternoonSlots.push(makeActivitySlot(aftMind, fmt(at.h, at.m), MINDFULNESS_POOL));
    advanceTime(at, aftMind.duration + 5);
  }

  // Afternoon fitness (skip if recovery day)
  if (!hp.isRecoveryDay) {
    const aftFit = pickOne(afternoonPool);
    afternoonSlots.push(makeActivitySlot(aftFit, fmt(at.h, at.m), afternoonPool));
    advanceTime(at, aftFit.duration + 5);
  }

  // Recovery afternoon activity
  if (recoveryPicks.length > 1) {
    afternoonSlots.push(makeActivitySlot(recoveryPicks[1], fmt(at.h, at.m), RECOVERY_POOL));
    advanceTime(at, recoveryPicks[1].duration + 5);
  }

  // Strength slot for muscle-gain
  if (strengthPicks.length > 0 && !hp.isRecoveryDay) {
    afternoonSlots.push(makeActivitySlot(strengthPicks[0], fmt(at.h, at.m), STRENGTH_POOL));
    advanceTime(at, strengthPicks[0].duration + 5);
  }

  // Extra cardio for weight-loss goal
  if (hp.extraCardio && !hp.isRecoveryDay) {
    const cardioOptions = filterByIntensity(FITNESS_AFTERNOON, hp.maxIntensity);
    const extraCardioSlot = pickOne(cardioOptions);
    afternoonSlots.push(makeActivitySlot(extraCardioSlot, fmt(at.h, at.m), cardioOptions));
    advanceTime(at, extraCardioSlot.duration + 5);
  }

  // Energizing activities for sad/low-energy
  if (energizingPicks.length > 0) {
    afternoonSlots.push(makeActivitySlot(energizingPicks[0], fmt(at.h, at.m), ENERGIZING_POOL));
    advanceTime(at, energizingPicks[0].duration + 5);
  }

  // Third mindfulness in afternoon if count >= 3
  if (mindfulnessPicks.length > 2) {
    const aftMind2 = mindfulnessPicks[2];
    afternoonSlots.push(makeActivitySlot(aftMind2, fmt(at.h, at.m), MINDFULNESS_POOL));
    advanceTime(at, aftMind2.duration + 5);
  }

  // Snack
  afternoonSlots.push(makeMealSlot(fmt(at.h, at.m), "snack", snackPrimary, snackAlts));

  // ─── Evening block ───
  const eveningSlots: (ActivitySlot | MealSlot | HydrationSlot)[] = [];
  const et = { h: Math.max(18, sleep.h - 3), m: 0 };

  // Dinner
  eveningSlots.push(makeMealSlot(fmt(et.h, et.m), "dinner", dinnerPrimary, dinnerAlts));
  advanceTime(et, 45);

  // Hydration
  eveningSlots.push(makeHydrationSlot(fmt(et.h, et.m), mlPerSlot));
  advanceTime(et, 5);

  // Light evening fitness
  const eveFit = pickOne(eveningPool);
  eveningSlots.push(makeActivitySlot(eveFit, fmt(et.h, et.m), eveningPool));
  advanceTime(et, eveFit.duration + 5);

  // Second energizing activity in evening if available
  if (energizingPicks.length > 1) {
    eveningSlots.push(makeActivitySlot(energizingPicks[1], fmt(et.h, et.m), ENERGIZING_POOL));
    advanceTime(et, energizingPicks[1].duration + 5);
  }

  // Fourth mindfulness or evening mindfulness
  if (mindfulnessPicks.length > 3) {
    const eveMind = mindfulnessPicks[3];
    eveningSlots.push(makeActivitySlot(eveMind, fmt(et.h, et.m), MINDFULNESS_POOL));
    advanceTime(et, eveMind.duration + 5);
  } else if (mindfulnessPicks.length > 2 && hp.mindfulnessCount <= 3) {
    // Use the last pick if we only had 3 and none was placed in evening yet
  }

  // Wind-down for better-sleep goal
  if (hp.addWindDown) {
    eveningSlots.push(makeActivitySlot(EVENING_WIND_DOWN, fmt(et.h, et.m), [EVENING_WIND_DOWN]));
    advanceTime(et, EVENING_WIND_DOWN.duration + 5);
  }

  const blocks: RoutineBlock[] = [
    { id: "morning", label: "Morning", slots: morningSlots },
    { id: "afternoon", label: "Afternoon", slots: afternoonSlots },
    { id: "evening", label: "Evening", slots: eveningSlots },
  ];

  // Trim each block to 1-2 activity slots (randomly), keeping meals & hydration
  const trimmedBlocks = blocks.map((block) => {
    const meals = block.slots.filter(
      (s) => s.type === "meal" || s.type === "hydration"
    );
    const activities = block.slots.filter(
      (s) => s.type !== "meal" && s.type !== "hydration"
    );
    const maxActivities = activities.length <= 2 ? activities.length : (1 + Math.floor(_rng() * 2)); // 1 or 2
    const kept = pick(activities, maxActivities);
    return { ...block, slots: [...meals, ...kept] };
  });

  // Reset RNG to default so other code is unaffected
  _rng = Math.random;

  return {
    date,
    blocks: trimmedBlocks,
    generatedAt: Date.now(),
    adaptedAt: null,
  };
}

/**
 * Generates a daily routine.
 * Always uses the fast local generator for instant results.
 * AI generation is available via generateRoutineWithAI() for future use.
 */
export async function generateRoutine(
  user: UserProfile,
  health: HealthSnapshot,
  date?: string,
): Promise<DailyRoutine> {
  const targetDate = date ?? new Date().toISOString().split('T')[0];
  return generateLocalRoutine(user, health, targetDate);
}
