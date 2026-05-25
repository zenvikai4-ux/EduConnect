import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PHONE_TO_USER: Record<string, { username: string; passwords: string[] }> = {
  '9059717476': { username: 'superadmin',    passwords: ['Admin@123'] },
  '9876500001': { username: 'schooladmin',   passwords: ['Admin@1234', 'School@456'] },
  '9876500002': { username: 'schooladmin',   passwords: ['Principal@1234', 'School@456'] },
  '9876500003': { username: 'kavitha.rao',   passwords: ['Teacher@1234', 'Teacher@789'] },
  '9876500004': { username: 'aarav.sharma',  passwords: ['Student@1234', 'Student@101'] },
  '9876500005': { username: 'ramesh.sharma', passwords: ['Parent@1234', 'Parent@321'] },
  '9876500006': { username: 'ramu.driver',   passwords: ['Driver@1234', 'Driver@999'] },
};

const DEMO_USERS: Record<string, { password: string; user: any }> = {
  superadmin: {
    password: 'Admin@123',
    user: { id: 'sa_001', name: 'Platform Admin', phone: '+91 9059717476', role: 'superadmin', isActive: true },
  },
  schooladmin: {
    password: 'School@456',
    user: { id: 'admin_001', name: 'Rajesh Kumar', phone: '+91 9876500001', role: 'admin', schoolId: 'school_001', isActive: true },
  },
  'kavitha.rao': {
    password: 'Teacher@789',
    user: { id: 'tchr_001', name: 'Ms. Kavitha Rao', phone: '+91 9876500003', role: 'teacher', schoolId: 'school_001', isActive: true },
  },
  'ramesh.sharma': {
    password: 'Parent@321',
    user: { id: 'par_001', name: 'Ramesh Sharma', phone: '+91 9876500005', role: 'parent', schoolId: 'school_001', isActive: true },
  },
  'aarav.sharma': {
    password: 'Student@101',
    user: {
      id: 'stu_001', name: 'Arjun Patel', phone: '+91 9876500004', role: 'student',
      schoolId: 'school_001', classId: 'class_8a', grade: '8', section: 'A',
      rollNumber: '8A-01', parentId: 'par_001',
      subjects: ['Science', 'Mathematics', 'English', 'Social Studies', 'Hindi'],
      upcomingExams: [
        { subject: 'Science', date: '2026-06-14' },
        { subject: 'Mathematics', date: '2026-06-15' },
        { subject: 'English', date: '2026-06-16' },
      ],
      pendingHomework: [
        { subject: 'Science', title: 'Chapter 9 Reading', dueDate: '2026-05-28' },
        { subject: 'Mathematics', title: 'Exercise 5.3', dueDate: '2026-05-29' },
        { subject: 'Social Studies', title: 'Map Work', dueDate: '2026-05-30' },
      ],
      xpPoints: 340, level: 4, streak: 4, isActive: true,
    },
  },
  'ramu.driver': {
    password: 'Driver@999',
    user: { id: 'drv_001', name: 'Ramu Yadav', phone: '+91 9876500006', role: 'driver', schoolId: 'school_001', busNumber: 'Bus #12', routeName: 'Route A · HSR Layout', isActive: true },
  },
};

interface AuthStore {
  user: any | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: any) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null, token: null, isAuthenticated: false,
  // KEY FIX: start as false so spinner never blocks login screen
  isLoading: false,
  error: null,

  restoreSession: async () => {
    try {
      const [token, userJson] = await Promise.race([
        Promise.all([
          AsyncStorage.getItem('auth_token'),
          AsyncStorage.getItem('auth_user'),
        ]),
        // Timeout after 2 seconds — never block forever
        new Promise<[null, null]>(r => setTimeout(() => r([null, null]), 2000)),
      ]);
      if (token && userJson) {
        set({ user: JSON.parse(userJson as string), token, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  login: async (credentials) => {
    // Phone-based login
    if (credentials.phone) {
      const phone = String(credentials.phone).replace(/\s/g, '');
      const entry = PHONE_TO_USER[phone];
      if (!entry) { set({ error: 'Mobile number not registered.' }); return; }
      if (!entry.passwords.includes(credentials.password)) { set({ error: 'Incorrect password.' }); return; }
      const found = DEMO_USERS[entry.username];
      const token = `demo_${phone}_${Date.now()}`;
      // Save async in background
      AsyncStorage.setItem('auth_token', token).catch(() => {});
      AsyncStorage.setItem('auth_user', JSON.stringify(found.user)).catch(() => {});
      // Instant state update
      set({ user: found.user, token, isAuthenticated: true, isLoading: false, error: null });
      return;
    }
    // Legacy username login
    const found = DEMO_USERS[credentials.username];
    if (found && found.password === credentials.password && found.user.role === credentials.role) {
      const token = `demo_${credentials.username}_${Date.now()}`;
      AsyncStorage.setItem('auth_token', token).catch(() => {});
      AsyncStorage.setItem('auth_user', JSON.stringify(found.user)).catch(() => {});
      set({ user: found.user, token, isAuthenticated: true, isLoading: false, error: null });
    } else {
      set({ error: 'Invalid credentials.' });
    }
  },

  logout: async () => {
    try { await AsyncStorage.multiRemove(['auth_token', 'auth_user']); } catch {}
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  clearError: () => set({ error: null }),
}));
