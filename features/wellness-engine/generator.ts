import type { HealthSnapshot } from '@/types/health';
import type { DailyRoutine } from '@/types/routine';
import type { UserProfile } from '@/types/user';
import { generateRoutineWithAI } from './ai-generator';

/**
 * Generates a daily routine using the AI service.
 * Falls back to an empty routine if the AI is not configured.
 */
export async function generateRoutine(
  user: UserProfile,
  health: HealthSnapshot,
  date?: string,
): Promise<DailyRoutine> {
  const targetDate = date ?? new Date().toISOString().split('T')[0];

  const hasAI = !!process.env.EXPO_PUBLIC_AI_API_KEY;
  if (hasAI) {
    return generateRoutineWithAI(user, health, targetDate);
  }

  // Fallback: empty routine when AI is not configured
  return {
    date: targetDate,
    blocks: [],
    generatedAt: Date.now(),
    adaptedAt: null,
  };
}
