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

export const STORAGE_KEYS = {
  USER_PROFILE: 'binty:user-profile',
  ROUTINE: 'binty:routine',
  MEAL_LOGS: 'binty:meal-logs',
  WATER_LOG: 'binty:water-log',
} as const;
