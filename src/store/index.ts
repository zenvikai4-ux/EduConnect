import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserRole = 'student' | 'parent' | 'teacher' | 'class_teacher' | 'admin' | 'principal' | 'driver' | 'super_admin';

export interface User {
  id: string; name: string; role: UserRole;
  school: string; schoolId: string; phone: string;
  email?: string; classId?: string; className?: string;
  subjectId?: string; subject?: string; childId?: string;
  childName?: string; childClassId?: string; routeId?: string;
}

interface AppState {
  user: User | null; isLoggedIn: boolean;
  isLoading: boolean; chatOpen: boolean;
  setUser: (u: User | null) => void;
  setChatOpen: (v: boolean) => void;
  logout: () => void;
  hydrate: () => Promise<void>;
}

const STORAGE_KEY = 'eduspark_user';

export const useStore = create<AppState>((set) => ({
  user: null, isLoggedIn: false,
  isLoading: false, // START FALSE — never block login
  chatOpen: false,

  setUser: (user) => {
    if (user) {
      try { AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user)); } catch {}
    }
    set({ user, isLoggedIn: !!user, isLoading: false });
  },

  setChatOpen: (chatOpen) => set({ chatOpen }),

  logout: () => {
    try { AsyncStorage.removeItem(STORAGE_KEY); } catch {}
    set({ user: null, isLoggedIn: false });
  },

  hydrate: async () => {
    try {
      const stored = await Promise.race([
        AsyncStorage.getItem(STORAGE_KEY),
        new Promise<null>(r => setTimeout(() => r(null), 1500)),
      ]);
      if (stored) {
        const user = JSON.parse(stored as string) as User;
        set({ user, isLoggedIn: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
