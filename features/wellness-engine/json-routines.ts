// Loads routines from assets/dataset/Routines.json and maps each exercise into
// the ActivityDef shape used by the wellness generator. The mapping below merges
// these JSON-defined routines into the existing hardcoded pools so they get
// surfaced automatically by the daily routine builder.

import type { IntensityLevel, RoutineCategoryTag } from '@/types/routine';
import RoutinesJson from '@/assets/dataset/Routines.json';

export interface JsonExercise {
  id: string;
  title: string;
  duration_minutes?: number;
  sets_reps?: string;
  summary: string;
  steps: string[];
}

export interface JsonCategory {
  id: string;
  title: string;
  intensity: number;
  exercises: JsonExercise[];
}

interface RoutinesJsonShape {
  categories: JsonCategory[];
}

export interface MappedActivity {
  title: string;
  duration: number;
  intensity: IntensityLevel;
  category: RoutineCategoryTag;
  type: 'activity' | 'mindfulness';
  description?: string;
}

// JSON intensity (0..4) → app intensity bucket
function mapIntensity(jsonIntensity: number): IntensityLevel {
  if (jsonIntensity <= 1) return 'light';
  if (jsonIntensity <= 3) return 'moderate';
  return 'intense';
}

// JSON category → activity type + RoutineCategoryTag
function categoryMeta(catId: string): { type: 'activity' | 'mindfulness'; tag: RoutineCategoryTag } {
  switch (catId) {
    case 'breathing':
    case 'stationary':
      return { type: 'mindfulness', tag: 'Mindfulness' };
    default:
      return { type: 'activity', tag: 'Fitness' };
  }
}

// Strength sets/reps → rough minutes estimate so timeline math still works
function estimateDurationFromSetsReps(setsReps: string): number {
  const m = setsReps.match(/(\d+)\s*[x×*]\s*(\d+)/i);
  if (m) {
    const sets = parseInt(m[1], 10);
    return Math.max(8, Math.min(25, sets * 4));
  }
  return 12;
}

function mapExercise(ex: JsonExercise, cat: JsonCategory): MappedActivity {
  const meta = categoryMeta(cat.id);
  const duration =
    ex.duration_minutes ?? (ex.sets_reps ? estimateDurationFromSetsReps(ex.sets_reps) : 10);
  return {
    title: ex.title,
    duration,
    intensity: mapIntensity(cat.intensity),
    category: meta.tag,
    type: meta.type,
    description: ex.summary,
  };
}

const data = RoutinesJson as RoutinesJsonShape;

const allMapped: { categoryId: string; intensity: number; activity: MappedActivity }[] = [];
for (const cat of data.categories) {
  for (const ex of cat.exercises) {
    allMapped.push({
      categoryId: cat.id,
      intensity: cat.intensity,
      activity: mapExercise(ex, cat),
    });
  }
}

// Public buckets, segmented by intent so the generator can merge them into
// matching hardcoded pools.

export const JSON_MINDFULNESS: MappedActivity[] = allMapped
  .filter((e) => e.categoryId === 'breathing' || e.categoryId === 'stationary')
  .map((e) => e.activity);

// Light movement → useful as recovery / evening / morning gentle work
export const JSON_LIGHT_MOVEMENT: MappedActivity[] = allMapped
  .filter((e) => e.categoryId === 'light_movement')
  .map((e) => e.activity);

// Medium movement / cardio → afternoon-fit pool
export const JSON_MEDIUM_MOVEMENT: MappedActivity[] = allMapped
  .filter((e) => e.categoryId === 'medium_movement')
  .map((e) => e.activity);

// Heavy weightlifting → strength pool
export const JSON_STRENGTH: MappedActivity[] = allMapped
  .filter((e) => e.categoryId === 'heavy_weightlifting')
  .map((e) => e.activity);
