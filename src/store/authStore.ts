import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User, UserRole, LoginCredentials, StudentUser } from '../types';

// ─── DEMO USERS ───────────────────────────────────────────────────
const DEMO_USERS: Record<string, { password: string; user: any }> = {
  superadmin: {
    password: 'Admin@123',
    user: { id: 'sa_001', name: 'Platform Admin', email: 'superadmin@educonnect.in', phone: '+91 9999999999', role: 'superadmin', isActive: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  },
  schooladmin: {
    password: 'School@456',
    user: { id: 'admin_001', name: 'Ravi Shankar', email: 'ravi.shankar@greenfield.edu.in', phone: '+91 9876501234', role: 'admin', schoolId: 'school_001', isActive: true, createdAt: '2024-04-01T00:00:00Z', updatedAt: '2024-04-01T00:00:00Z' },
  },
  'kavitha.rao': {
    password: 'Teacher@789',
    user: { id: 'tchr_001', name: 'Ms. Kavitha Rao', email: 'kavitha.rao@greenfield.edu.in', phone: '+91 9876543210', role: 'teacher', schoolId: 'school_001', isActive: true, createdAt: '2018-06-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  },
  'ramesh.sharma': {
    password: 'Parent@321',
    user: { id: 'par_001', name: 'Ramesh Sharma', email: 'ramesh.sharma@email.com', phone: '+91 9000000001', role: 'parent', schoolId: 'school_001', isActive: true, createdAt: '2024-04-01T00:00:00Z', updatedAt: '2024-04-01T00:00:00Z' },
  },
  'aarav.sharma': {
    password: 'Student@101',
    user: {
      id: 'stu_001', name: 'Aarav Sharma', email: 'aarav.sharma@greenfield.edu.in', phone: '', role: 'student',
      schoolId: 'school_001', isActive: true, classId: 'class_8a', grade: '8', section: 'A',
      rollNumber: '8A-01', parentId: 'par_001',
      subjects: ['Science', 'Mathematics', 'English', 'Social Studies', 'Hindi'],
      upcomingExams: [{ subject: 'Science', date: '2026-04-14' }, { subject: 'Mathematics', date: '2026-04-15' }, { subject: 'English', date: '2026-04-16' }],
      pendingHomework: [{ subject: 'Science', title: 'Chapter 9 Reading', dueDate: '2026-04-10' }, { subject: 'Mathematics', title: 'Exercise 5.3', dueDate: '2026-04-11' }, { subject: 'Social Studies', title: 'Map Work', dueDate: '2026-04-14' }],
      xpPoints: 340, level: 4, createdAt: '2024-04-01T00:00:00Z', updatedAt: '2024-04-01T00:00:00Z',
    },
  },
  'ramu.driver': {
    password: 'Driver@999',
    user: { id: 'drv_001', name: 'Ramu Yadav', email: 'ramu@greenfield.edu.in', phone: '+91 9876500001', role: 'driver', schoolId: 'school_001', busNumber: 'Bus #12', routeName: 'Route A · Jubilee Hills', isActive: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  },
};

interface AuthStore {
  user: any | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null, token: null, isAuthenticated: false, isLoading: true, error: null,

  restoreSession: async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const userJson = await AsyncStorage.getItem('auth_user');
      if (token && userJson) {
        set({ user: JSON.parse(userJson), token, isAuthenticated: true, isLoading: false });
      } else { set({ isLoading: false }); }
    } catch { set({ isLoading: false }); }
  },

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    await new Promise(r => setTimeout(r, 500));
    const found = DEMO_USERS[credentials.username];
    if (found && found.password === credentials.password && found.user.role === credentials.role) {
      const token = `demo_${credentials.username}_${Date.now()}`;
      await AsyncStorage.setItem('auth_token', token);
      await AsyncStorage.setItem('auth_user', JSON.stringify(found.user));
      set({ user: found.user, token, isAuthenticated: true, isLoading: false, error: null });
    } else {
      set({ isLoading: false, error: 'Invalid credentials. Tap the hint box to autofill.' });
    }
  },

  logout: async () => {
    await AsyncStorage.multiRemove(['auth_token', 'auth_user']);
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  clearError: () => set({ error: null }),
}));
