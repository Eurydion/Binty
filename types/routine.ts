import type { Meal } from './meals';

export type SlotType = 'activity' | 'meal' | 'hydration' | 'rest' | 'mindfulness' | 'custom';

export type IntensityLevel = 'light' | 'moderate' | 'intense';

export type RoutineCategoryTag = 'Fitness' | 'Consumption' | 'Work' | 'Mindfulness';

export interface SlotAlternative {
  title: string;
  durationMinutes: number;
  intensity: IntensityLevel;
  category?: RoutineCategoryTag;
  description?: string;
}

export interface ActivitySlot {
  id: string;
  type: 'activity' | 'rest' | 'custom' | 'mindfulness';
  time: string;            // "HH:mm"
  title: string;
  durationMinutes: number;
  intensity: IntensityLevel;
  completed: boolean;
  description?: string;
  category?: RoutineCategoryTag;
  alternatives?: SlotAlternative[];
}

export interface MealSlot {
  id: string;
  type: 'meal';
  time: string;            // "HH:mm"
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  suggestedMealId: string | null;
  suggestedMeal: Meal | null;
  loggedMealId: string | null;
  completed: boolean;
  category?: RoutineCategoryTag;
  alternativeMeals?: Meal[];
}

export interface HydrationSlot {
  id: string;
  type: 'hydration';
  time: string;
  targetMl: number;
  loggedMl: number;
  completed: boolean;
  category?: RoutineCategoryTag;
}

export type RoutineSlot = ActivitySlot | MealSlot | HydrationSlot;

export interface RoutineBlock {
  id: string;
  label: 'Morning' | 'Afternoon' | 'Evening';
  slots: RoutineSlot[];
}

export interface DailyRoutine {
  date: string;            // YYYY-MM-DD
  blocks: RoutineBlock[];
  generatedAt: number;
  adaptedAt: number | null;
}
