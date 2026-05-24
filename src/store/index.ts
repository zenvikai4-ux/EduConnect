import { create } from 'zustand';
import { supabase, UserRole } from '../utils/supabase';

export type { UserRole };

export interface User {
  id: string;
  name: string;
  role: UserRole;
  school: string;
  schoolId: string;
  phone: string;
  email?: string;
  // Role-specific
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
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useStore = create<AppState>((set) => ({
  user: null, isLoggedIn: false, isLoading: true, chatOpen: false,
  setUser: (user) => set({ user, isLoggedIn: !!user }),
  setChatOpen: (chatOpen) => set({ chatOpen }),
  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, isLoggedIn: false });
  },
  hydrate: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { set({ isLoading: false }); return; }
      const profile = await fetchUserProfile(session.user.id);
      if (profile) set({ user: profile, isLoggedIn: true });
    } catch (e) {
      console.warn('[hydrate]', e);
    } finally {
      set({ isLoading: false });
    }
  },
}));

export async function fetchUserProfile(authId: string): Promise<User | null> {
  try {
    // Fetch user row
    const { data: u, error } = await supabase
      .from('users').select('*').eq('id', authId).single();
    if (error || !u) { console.error('[profile] user error:', error); return null; }

    // Fetch school separately
    let school = '', schoolId = u.school_id ?? '';
    if (u.school_id) {
      const { data: s } = await supabase.from('schools').select('id, name').eq('id', u.school_id).single();
      school = s?.name ?? '';
      schoolId = s?.id ?? u.school_id;
    }

    const base: User = { id: u.id, name: u.name, role: u.role, school, schoolId, phone: u.phone, email: u.email };

    // Role-specific data
    if (u.role === 'student') {
      const { data: en } = await supabase.from('class_enrollments')
        .select('class_id, classes(name)').eq('student_id', u.id).limit(1).single();
      base.classId = en?.class_id;
      base.className = (en as any)?.classes?.name;
    }

    if (u.role === 'parent') {
      const { data: link } = await supabase.from('parent_student_links')
        .select('student_id, users!student_id(name)').eq('parent_id', u.id).limit(1).single();
      base.childId = link?.student_id;
      base.childName = (link as any)?.users?.name;
    }

    if (u.role === 'teacher' || u.role === 'class_teacher') {
      const { data: ta } = await supabase.from('teacher_assignments')
        .select('class_id, subject_id, classes(name), subjects(name, id)')
        .eq('teacher_id', u.id).limit(1).single();
      base.classId = ta?.class_id;
      base.className = (ta as any)?.classes?.name;
      base.subject = (ta as any)?.subjects?.name;
      base.subjectId = (ta as any)?.subjects?.id;
    }

    if (u.role === 'driver') {
      const { data: route } = await supabase.from('bus_routes')
        .select('id').eq('driver_id', u.id).single();
      base.routeId = route?.id;
    }

    return base;
  } catch (e) {
    console.error('[profile] exception:', e);
    return null;
  }
}

supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === 'SIGNED_OUT') useStore.getState().setUser(null);
  else if (event === 'SIGNED_IN' && session?.user) {
    const p = await fetchUserProfile(session.user.id);
    if (p) useStore.getState().setUser(p);
  }
});
