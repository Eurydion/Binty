export type SlotType = 'activity' | 'meal' | 'hydration' | 'rest' | 'custom';

export type IntensityLevel = 'light' | 'moderate' | 'intense';

export interface ActivitySlot {
  id: string;
  type: 'activity' | 'rest' | 'custom';
  time: string;            // "HH:mm"
  title: string;
  durationMinutes: number;
  intensity: IntensityLevel;
  completed: boolean;
  description?: string;
}

export interface MealSlot {
  id: string;
  type: 'meal';
  time: string;            // "HH:mm"
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  suggestedMealId: string | null;
  loggedMealId: string | null;
  completed: boolean;
}

export interface HydrationSlot {
  id: string;
  type: 'hydration';
  time: string;
  targetMl: number;
  loggedMl: number;
  completed: boolean;
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
