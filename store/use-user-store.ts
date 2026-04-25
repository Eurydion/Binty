import { create } from 'zustand';

import { load, save, STORAGE_KEYS } from '@/services/storage';
import type { UserProfile } from '@/types/user';

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

interface PersistedShape {
  profile: UserProfile;
  onboardingComplete: boolean;
}

interface UserState extends PersistedShape {
  hydrated: boolean;
  updateProfile: (partial: Partial<UserProfile>) => void;
  completeOnboarding: (profile: Partial<UserProfile>) => void;
  resetOnboarding: () => void;
  hydrate: () => Promise<void>;
}

function persist(profile: UserProfile, onboardingComplete: boolean): void {
  save(STORAGE_KEYS.USER_PROFILE, { profile, onboardingComplete } satisfies PersistedShape);
}

export const useUserStore = create<UserState>((set, get) => ({
  profile: DEFAULT_PROFILE,
  onboardingComplete: false,
  hydrated: false,
  updateProfile: (partial) => {
    const next = { ...get().profile, ...partial };
    persist(next, get().onboardingComplete);
    set({ profile: next });
  },
  completeOnboarding: (partial) => {
    const next = { ...get().profile, ...partial };
    persist(next, true);
    set({ profile: next, onboardingComplete: true });
  },
  resetOnboarding: () => {
    persist(DEFAULT_PROFILE, false);
    set({ profile: DEFAULT_PROFILE, onboardingComplete: false });
  },
  hydrate: async () => {
    const data = await load<PersistedShape>(STORAGE_KEYS.USER_PROFILE);
    if (data) {
      set({
        profile: { ...DEFAULT_PROFILE, ...data.profile },
        onboardingComplete: data.onboardingComplete ?? false,
        hydrated: true,
      });
    } else {
      set({ hydrated: true });
    }
  },
}));
