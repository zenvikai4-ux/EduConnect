import { Platform, StyleSheet } from 'react-native';

export const Colors = {
  primary: '#1E3A8A',
  primaryDark: '#0F1F5C',
  primaryLight: '#3B5FC0',
  primarySurface: '#EEF2FF',

  aria: '#7C3AED',
  ariaDark: '#4C1D95',
  ariaSurface: '#EDE9FE',

  success: '#059669',
  successSurface: '#D1FAE5',
  warning: '#D97706',
  warningSurface: '#FEF3C7',
  danger: '#DC2626',
  dangerSurface: '#FEE2E2',
  info: '#2563EB',
  infoSurface: '#DBEAFE',

  slate900: '#0F172A',
  slate800: '#1E293B',
  slate700: '#334155',
  slate600: '#475569',
  slate500: '#64748B',
  slate400: '#94A3B8',
  slate300: '#CBD5E1',
  slate200: '#E2E8F0',
  slate100: '#F1F5F9',
  slate50: '#F8FAFC',
  white: '#FFFFFF',

  overlay: 'rgba(0,0,0,0.5)',
  overlayLight: 'rgba(0,0,0,0.2)',
};

export const RoleColors: Record<string, string> = {
  superadmin: '#7C3AED',
  admin: '#059669',
  teacher: '#4C1D95',
  parent: '#7C2D12',
  student: '#6D28D9',
};

export const Typography = {
  fontFamily: {
    regular: Platform.select({ ios: 'System', android: 'Roboto' }) || 'System',
    medium: Platform.select({ ios: 'System', android: 'Roboto-Medium' }) || 'System',
    bold: Platform.select({ ios: 'System', android: 'Roboto-Bold' }) || 'System',
  },
  size: {
    xs: 10, sm: 12, base: 14, md: 15,
    lg: 16, xl: 18, '2xl': 20, '3xl': 24,
    '4xl': 28, '5xl': 32, '6xl': 36,
  },
};

export const Spacing = {
  xs: 4, sm: 8, md: 12, base: 16,
  lg: 20, xl: 24, '2xl': 32, '3xl': 48,
};

export const Radius = {
  sm: 6, md: 10, lg: 14, xl: 20, full: 999,
};

export const Shadow = StyleSheet.create({
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
});
