export type WellnessGoal = 'stress-reduction' | 'weight-loss' | 'muscle-gain' | 'better-sleep' | 'general-wellness';

export type IntensityPreference = 'light' | 'moderate' | 'intense';

export type Gender = 'male' | 'female';

export interface UserProfile {
  id: string;
  name: string;
  gender?: Gender;
  weightKg?: number;
  heightCm?: number;
  age?: number;
  goals: WellnessGoal[];
  intensityPreference: IntensityPreference;
  dietaryPreferences: string[];   // e.g. ["no-pork", "vegetarian"]
  wakeTime: string;               // "HH:mm"
  sleepTime: string;              // "HH:mm"
  dailyWaterGoalMl: number;
}

export interface InterventionFeedback {
  alertId: string;
  respondedAt: number;
  action: 'completed' | 'dismissed' | 'snoozed';
}
