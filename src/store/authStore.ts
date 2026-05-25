import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

// Phone number → credentials map (for phone-based login)
const PHONE_MAP: Record<string, { username: string; internalPassword: string }> = {
  '9059717476': { username: 'superadmin',    internalPassword: 'Admin@123'   },
  '9876500001': { username: 'schooladmin',   internalPassword: 'School@456'  },
  '9876500002': { username: 'schooladmin',   internalPassword: 'School@456'  },
  '9876500003': { username: 'kavitha.rao',   internalPassword: 'Teacher@789' },
  '9876500004': { username: 'aarav.sharma',  internalPassword: 'Student@101' },
  '9876500005': { username: 'ramesh.sharma', internalPassword: 'Parent@321'  },
  '9876500006': { username: 'ramu.driver',   internalPassword: 'Driver@999'  },
};

// What user types → accepted
const ACCEPTED_PASSWORDS: Record<string, string[]> = {
  '9059717476': ['Admin@123'],
  '9876500001': ['Admin@1234', 'School@456'],
  '9876500002': ['Principal@1234', 'School@456'],
  '9876500003': ['Teacher@1234', 'Teacher@789'],
  '9876500004': ['Student@1234', 'Student@101'],
  '9876500005': ['Parent@1234', 'Parent@321'],
  '9876500006': ['Driver@1234', 'Driver@999'],
};

interface AuthStore {
  user: any | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  loginWithPhone: (phone: string, password: string) => void;
  login: (credentials: any) => Promise<void>;
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
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  // NEW: phone-based login — synchronous, no async issues
  loginWithPhone: (phone: string, password: string) => {
    const cleanPhone = phone.replace(/\s/g, '');
    const mapping = PHONE_MAP[cleanPhone];
    if (!mapping) { set({ error: 'Mobile number not registered.' }); return; }

    const accepted = ACCEPTED_PASSWORDS[cleanPhone] ?? [];
    if (!accepted.includes(password)) { set({ error: 'Incorrect password.' }); return; }

    const found = DEMO_USERS[mapping.username];
    if (!found) { set({ error: 'Account not found.' }); return; }

    const token = `demo_${cleanPhone}_${Date.now()}`;

    // Set state immediately — no async, no loading state
    set({ user: found.user, token, isAuthenticated: true, isLoading: false, error: null });

    // Persist in background — don't await
    AsyncStorage.setItem('auth_token', token).catch(() => {});
    AsyncStorage.setItem('auth_user', JSON.stringify(found.user)).catch(() => {});
  },

  // Keep old login for compatibility
  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const found = DEMO_USERS[credentials.username];
      if (found && found.password === credentials.password && found.user.role === credentials.role) {
        const token = `demo_${credentials.username}_${Date.now()}`;
        await AsyncStorage.setItem('auth_token', token);
        await AsyncStorage.setItem('auth_user', JSON.stringify(found.user));
        set({ user: found.user, token, isAuthenticated: true, isLoading: false, error: null });
      } else {
        set({ isLoading: false, error: 'Invalid credentials.' });
      }
    } catch {
      set({ isLoading: false, error: 'Login failed.' });
    }
  },

  logout: async () => {
    try { await AsyncStorage.multiRemove(['auth_token', 'auth_user']); } catch {}
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  clearError: () => set({ error: null }),
}));
