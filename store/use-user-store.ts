import type { UserProfile } from '@/types/user';
import { create } from 'zustand';

const DEFAULT_PROFILE: UserProfile = {
  id: 'local-user',
  name: 'User',
  goals: ['general-wellness'],
  intensityPreference: 'moderate',
  dietaryPreferences: [],
  wakeTime: '06:00',
  sleepTime: '22:00',
  dailyWaterGoalMl: 2500,
};

interface UserState {
  profile: UserProfile;
  updateProfile: (partial: Partial<UserProfile>) => void;
}

export const useUserStore = create<UserState>((set) => ({
  profile: DEFAULT_PROFILE,
  updateProfile: (partial) =>
    set((state) => ({ profile: { ...state.profile, ...partial } })),
}));
