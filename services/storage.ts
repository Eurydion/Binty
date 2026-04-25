import AsyncStorage from '@react-native-async-storage/async-storage';

export async function save<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function load<T>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return null;
  return JSON.parse(raw) as T;
}

export async function remove(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}

export async function getAllKeys(): Promise<string[]> {
  const keys = await AsyncStorage.getAllKeys();
  return keys as string[];
}

export async function removeByPrefix(prefix: string): Promise<void> {
  const allKeys = await getAllKeys();
  const matching = allKeys.filter((k) => k.startsWith(prefix));
  if (matching.length > 0) {
    await AsyncStorage.multiRemove(matching);
  }
}

export const ROUTINE_PREFIX = "binty:routine:";

export const STORAGE_KEYS = {
  USER_PROFILE: 'binty:user-profile',
  ROUTINE: 'binty:routine',
  MEAL_LOGS: 'binty:meal-logs',
  WATER_LOG: 'binty:water-log',
  ACHIEVEMENTS: 'binty:achievements',
  SAVED_TIPS: 'binty:saved-tips',
  HABITS: 'binty:habits',
} as const;
