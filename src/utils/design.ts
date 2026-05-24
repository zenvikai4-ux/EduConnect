// ─── EduSpark Design System ───────────────────────────────────────────────────
// International school-grade professional design

export const colors = {
  // Brand
  brand: '#1a56db',
  brandDark: '#1e429f',
  brandLight: '#ebf5ff',
  brandMid: '#3f83f8',

  // Neutrals
  white: '#ffffff',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',

  // Semantic
  success: '#057a55',
  successBg: '#def7ec',
  successText: '#046c4e',
  warning: '#c27803',
  warningBg: '#fdf6b2',
  warningText: '#92400e',
  danger: '#e02424',
  dangerBg: '#fde8e8',
  dangerText: '#9b1c1c',
  info: '#1c64f2',
  infoBg: '#e8f0fe',

  // Role colors
  roleAdmin: '#7e3af2',
  roleAdminBg: '#edebfe',
  rolePrincipal: '#0694a2',
  rolePrincipalBg: '#d5f5f6',
  roleTeacher: '#ff5a1f',
  roleTeacherBg: '#feecdc',
  roleStudent: '#1a56db',
  roleStudentBg: '#ebf5ff',
  roleParent: '#057a55',
  roleParentBg: '#def7ec',
  roleDriver: '#d61f69',
  roleDriverBg: '#fce8f3',
  roleSuperAdmin: '#1f2937',
  roleSuperAdminBg: '#f3f4f6',

  // Dark theme (for RFID / driver screens)
  dark: '#0f172a',
  darkCard: '#1e293b',
  darkBorder: '#334155',
  darkText: '#f1f5f9',
  darkMuted: '#94a3b8',
};

export const typography = {
  // Font sizes
  xs: 11,
  sm: 13,
  base: 15,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,

  // Line heights
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,

  // Weights (as strings for RN)
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
  black: '900' as const,
};

export const spacing = {
  0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20,
  6: 24, 8: 32, 10: 40, 12: 48, 16: 64,
  // Named
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, '2xl': 24, '3xl': 32,
};

export const radius = {
  sm: 6, md: 10, lg: 16, xl: 24, '2xl': 32, full: 999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  xl: {
    shadowColor: '#1a56db',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 10,
  },
};

// Role definitions — single source of truth
export const ROLES = {
  super_admin: {
    label: 'Super Admin',
    sublabel: 'Zenvik AI Platform',
    icon: '⚡',
    color: colors.roleSuperAdmin,
    bg: colors.roleSuperAdminBg,
    description: 'Manage all schools on the platform',
  },
  admin: {
    label: 'School Admin',
    sublabel: 'Administrative Staff',
    icon: '🏛️',
    color: colors.roleAdmin,
    bg: colors.roleAdminBg,
    description: 'Manage school operations, fees, and staff',
  },
  principal: {
    label: 'Principal',
    sublabel: 'School Leadership',
    icon: '👑',
    color: colors.rolePrincipal,
    bg: colors.rolePrincipalBg,
    description: 'School overview, performance analytics',
  },
  teacher: {
    label: 'Teacher',
    sublabel: 'Teaching Staff',
    icon: '📚',
    color: colors.roleTeacher,
    bg: colors.roleTeacherBg,
    description: 'Manage classes, attendance, and assignments',
  },
  class_teacher: {
    label: 'Class Teacher',
    sublabel: 'Teaching Staff',
    icon: '📋',
    color: colors.roleTeacher,
    bg: colors.roleTeacherBg,
    description: 'Class management with additional responsibilities',
  },
  student: {
    label: 'Student',
    sublabel: 'Learner',
    icon: '🎓',
    color: colors.roleStudent,
    bg: colors.roleStudentBg,
    description: 'Access homework, scores, and AI tutoring',
  },
  parent: {
    label: 'Parent / Guardian',
    sublabel: 'Family',
    icon: '👨‍👩‍👦',
    color: colors.roleParent,
    bg: colors.roleParentBg,
    description: 'Monitor your child\'s progress and fees',
  },
  driver: {
    label: 'Bus Driver',
    sublabel: 'Transport Staff',
    icon: '🚌',
    color: colors.roleDriver,
    bg: colors.roleDriverBg,
    description: 'Manage bus route and student transport',
  },
} as const;

export type RoleKey = keyof typeof ROLES;
