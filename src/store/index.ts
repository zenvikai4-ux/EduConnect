import { create } from 'zustand';
import { supabaseAdmin, UserRole } from '../utils/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type { UserRole };

export interface User {
  id: string;
  name: string;
  role: UserRole;
  school: string;
  schoolId: string;
  phone: string;
  email?: string;
  classId?: string;
  className?: string;
  subjectId?: string;
  subject?: string;
  childId?: string;
  childName?: string;
  childClassId?: string;
  routeId?: string;
}

interface AppState {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  chatOpen: boolean;
  setUser: (u: User | null) => void;
  setChatOpen: (v: boolean) => void;
  logout: () => void;
  hydrate: () => Promise<void>;
}

const STORAGE_KEY = 'eduspark_user';

export const useStore = create<AppState>((set) => ({
  user: null,
  isLoggedIn: false,
  isLoading: true,
  chatOpen: false,

  setUser: (user) => {
    if (user) {
      // Persist to AsyncStorage
      try {
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } catch (e) {}
    }
    set({ user, isLoggedIn: !!user });
  },

  setChatOpen: (chatOpen) => set({ chatOpen }),

  logout: () => {
    try { AsyncStorage.removeItem(STORAGE_KEY); } catch (e) {}
    set({ user: null, isLoggedIn: false });
  },

  hydrate: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const user = JSON.parse(stored) as User;
        // Verify user still exists and is active
        const { data } = await supabaseAdmin
          .from('users')
          .select('id, is_active')
          .eq('id', user.id)
          .single();
        if (data?.is_active) {
          set({ user, isLoggedIn: true });
        } else {
          await AsyncStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (e) {
      console.warn('[hydrate]', e);
    } finally {
      set({ isLoading: false });
    }
  },
}));
