import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, ViewStyle, TextStyle,
} from 'react-native';
// LinearGradient removed
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius, shadows } from '../../utils/design';

// ─── Card ────────────────────────────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'flat' | 'colored';
  color?: string;
  onPress?: () => void;
  padding?: number;
}
export function Card({ children, style, variant = 'default', color, onPress, padding }: CardProps) {
  const cardStyle: any[] = [
    styles.card,
    variant === 'elevated' && shadows.lg,
    variant === 'flat' && styles.cardFlat,
    color && { backgroundColor: color },
    padding !== undefined && { padding },
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyle} onPress={onPress} activeOpacity={0.8}>
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={cardStyle}>{children}</View>;
}

// ─── Badge ────────────────────────────────────────────────────────────────────
type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'brand';
interface BadgeProps { label: string; variant?: BadgeVariant; size?: 'sm' | 'md'; dot?: boolean }
export function Badge({ label, variant = 'default', size = 'sm', dot = false }: BadgeProps) {
  const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
    default: { bg: colors.gray100, text: colors.gray600 },
    success: { bg: colors.successBg, text: colors.successText },
    warning: { bg: colors.warningBg, text: colors.warningText },
    danger: { bg: colors.dangerBg, text: colors.dangerText },
    info: { bg: colors.infoBg, text: colors.info },
    brand: { bg: colors.brandLight, text: colors.brand },
  };
  const { bg, text } = variantStyles[variant];
  return (
    <View style={[styles.badge, { backgroundColor: bg }, size === 'md' && styles.badgeMd]}>
      {dot && <View style={[styles.badgeDot, { backgroundColor: text }]} />}
      <Text style={[styles.badgeText, { color: text }, size === 'md' && styles.badgeTextMd]}>{label}</Text>
    </View>
  );
}

// ─── Button ───────────────────────────────────────────────────────────────────
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  gradient?: boolean;
}
export function Button({ label, onPress, variant = 'primary', size = 'md', icon, loading, disabled, style, gradient }: ButtonProps) {
  const variants: Record<ButtonVariant, { bg: string; text: string; border?: string }> = {
    primary: { bg: colors.brand, text: colors.white },
    secondary: { bg: colors.gray100, text: colors.gray700 },
    ghost: { bg: 'transparent', text: colors.brand, border: colors.brand },
    danger: { bg: colors.danger, text: colors.white },
    success: { bg: colors.success, text: colors.white },
  };
  const sizes = {
    sm: { padding: 8, fontSize: 13, height: 36, iconSize: 14 },
    md: { padding: 14, fontSize: 15, height: 48, iconSize: 18 },
    lg: { padding: 16, fontSize: 17, height: 56, iconSize: 20 },
  };
  const v = variants[variant];
  const s = sizes[size];
  const isDisabled = disabled || loading;

  const content = (
    <View style={[styles.btnInner, { height: s.height }]}>
      {loading ? (
        <ActivityIndicator color={v.text} size="small" />
      ) : (
        <>
          {icon && <Ionicons name={icon as any} size={s.iconSize} color={v.text} style={{ marginRight: 6 }} />}
          <Text style={[styles.btnText, { color: v.text, fontSize: s.fontSize }]}>{label}</Text>
        </>
      )}
    </View>
  );

  if (gradient && variant === 'primary') {
    return (
      <TouchableOpacity onPress={onPress} disabled={isDisabled} activeOpacity={0.85} style={[styles.btnWrap, { backgroundColor: colors.brand, borderRadius: radius.md }, isDisabled && styles.btnDisabled, style]}>
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
      style={[
        styles.btnWrap,
        { backgroundColor: v.bg, borderRadius: radius.md },
        v.border && { borderWidth: 1.5, borderColor: v.border },
        isDisabled && styles.btnDisabled,
        style,
      ]}
    >
      {content}
    </TouchableOpacity>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
import { TextInput, KeyboardTypeOptions } from 'react-native';
interface InputProps {
  label?: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  maxLength?: number;
  prefix?: string;
  suffix?: React.ReactNode;
  multiline?: boolean;
  numberOfLines?: number;
  editable?: boolean;
  error?: string;
  returnKeyType?: any;
  onSubmitEditing?: () => void;
  autoFocus?: boolean;
  autoCapitalize?: any;
}
export function Input({
  label, value, onChangeText, placeholder, keyboardType, secureTextEntry,
  maxLength, prefix, suffix, multiline, numberOfLines, editable = true,
  error, returnKeyType, onSubmitEditing, autoFocus, autoCapitalize,
}: InputProps) {
  return (
    <View style={styles.inputWrap}>
      {label && <Text style={styles.inputLabel}>{label}</Text>}
      <View style={[styles.inputBox, error && styles.inputBoxError, !editable && styles.inputBoxDisabled, multiline && { height: (numberOfLines ?? 3) * 22 + 24 }]}>
        {prefix && <Text style={styles.inputPrefix}>{prefix}</Text>}
        <TextInput
          style={[styles.inputField, multiline && styles.inputMultiline]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.gray400}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          maxLength={maxLength}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={editable}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          autoFocus={autoFocus}
          autoCapitalize={autoCapitalize ?? 'sentences'}
          textAlignVertical={multiline ? 'top' : 'center'}
        />
        {suffix}
      </View>
      {error && <Text style={styles.inputError}>{error}</Text>}
    </View>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
interface SectionHeaderProps { title: string; subtitle?: string; action?: string; onAction?: () => void }
export function SectionHeader({ title, subtitle, action, onAction }: SectionHeaderProps) {
  return (
    <View style={styles.sectionHeader}>
      <View style={{ flex: 1 }}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle && <Text style={styles.sectionSub}>{subtitle}</Text>}
      </View>
      {action && (
        <TouchableOpacity onPress={onAction} activeOpacity={0.7}>
          <Text style={styles.sectionAction}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
interface StatCardProps { value: string | number; label: string; icon?: string; color?: string; trend?: string; trendUp?: boolean; style?: any }
export function StatCard({ value, label, icon, color = colors.brand, trend, trendUp, style }: StatCardProps) {
  return (
    <Card style={[styles.statCard, shadows.sm, style] as any}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text style={styles.statLabel}>{label}</Text>
          <Text style={[styles.statValue, { color }]}>{value}</Text>
          {trend && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 }}>
              <Ionicons name={trendUp ? 'trending-up' : 'trending-down'} size={12} color={trendUp ? colors.success : colors.danger} />
              <Text style={{ fontSize: 11, color: trendUp ? colors.success : colors.danger, fontWeight: '600' }}>{trend}</Text>
            </View>
          )}
        </View>
        {icon && (
          <View style={[styles.statIcon, { backgroundColor: color + '18' }]}>
            <Ionicons name={icon as any} size={20} color={color} />
          </View>
        )}
      </View>
    </Card>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
interface ProgressBarProps { value: number; color?: string; height?: number; showLabel?: boolean; animated?: boolean }
export function ProgressBar({ value, color = colors.brand, height = 6, showLabel }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <View style={{ gap: 4 }}>
      {showLabel && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 11, color: colors.gray500 }}>Progress</Text>
          <Text style={{ fontSize: 11, color, fontWeight: '700' }}>{pct}%</Text>
        </View>
      )}
      <View style={[styles.pbTrack, { height }]}>
        <View style={[styles.pbFill, { width: `${pct}%`, backgroundColor: color, height }]} />
      </View>
    </View>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────
interface EmptyStateProps { icon?: string; emoji?: string; title: string; subtitle?: string; action?: string; onAction?: () => void }
export function EmptyState({ icon, emoji, title, subtitle, action, onAction }: EmptyStateProps) {
  return (
    <View style={styles.empty}>
      {emoji ? <Text style={styles.emptyEmoji}>{emoji}</Text> : icon && <Ionicons name={icon as any} size={48} color={colors.gray300} />}
      <Text style={styles.emptyTitle}>{title}</Text>
      {subtitle && <Text style={styles.emptySub}>{subtitle}</Text>}
      {action && onAction && <Button label={action} onPress={onAction} variant="ghost" size="sm" style={{ marginTop: 12 }} />}
    </View>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
interface AvatarProps { name: string; size?: number; color?: string; }
export function Avatar({ name, size = 40, color = colors.brand }: AvatarProps) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: color + '22' }]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.35, color }]}>{initials}</Text>
    </View>
  );
}

// ─── List Item ────────────────────────────────────────────────────────────────
interface ListItemProps { title: string; subtitle?: string; left?: React.ReactNode; right?: React.ReactNode; onPress?: () => void; showBorder?: boolean }
export function ListItem({ title, subtitle, left, right, onPress, showBorder = true }: ListItemProps) {
  return (
    <TouchableOpacity
      style={[styles.listItem, showBorder && styles.listItemBorder]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {left && <View style={{ marginRight: 12 }}>{left}</View>}
      <View style={{ flex: 1 }}>
        <Text style={styles.listTitle} numberOfLines={1}>{title}</Text>
        {subtitle && <Text style={styles.listSub} numberOfLines={1}>{subtitle}</Text>}
      </View>
      {right && <View style={{ marginLeft: 8 }}>{right}</View>}
      {onPress && <Ionicons name="chevron-forward" size={16} color={colors.gray400} style={{ marginLeft: 4 }} />}
    </TouchableOpacity>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
interface ToastProps { message: string; type?: 'success' | 'error' | 'info' }
export function Toast({ message, type = 'info' }: ToastProps) {
  const configs = {
    success: { bg: colors.success, icon: 'checkmark-circle' },
    error: { bg: colors.danger, icon: 'alert-circle' },
    info: { bg: colors.gray800, icon: 'information-circle' },
  };
  const c = configs[type];
  return (
    <View style={[styles.toast, { backgroundColor: c.bg }]}>
      <Ionicons name={c.icon as any} size={18} color={colors.white} />
      <Text style={styles.toastText}>{message}</Text>
    </View>
  );
}

// ─── Divider ─────────────────────────────────────────────────────────────────
export function Divider({ label }: { label?: string }) {
  if (!label) return <View style={styles.divider} />;
  return (
    <View style={styles.dividerRow}>
      <View style={[styles.divider, { flex: 1 }]} />
      <Text style={styles.dividerLabel}>{label}</Text>
      <View style={[styles.divider, { flex: 1 }]} />
    </View>
  );
}

// ─── Chip ────────────────────────────────────────────────────────────────────
interface ChipProps { label: string; selected?: boolean; onPress?: () => void; color?: string }
export function Chip({ label, selected, onPress, color = colors.brand }: ChipProps) {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && { backgroundColor: color, borderColor: color }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.chipText, selected && { color: colors.white }]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Card
  card: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 0.5, borderColor: colors.gray200 },
  cardFlat: { backgroundColor: colors.gray50, borderWidth: 0 },
  // Badge
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 3 },
  badgeMd: { paddingHorizontal: 10, paddingVertical: 5 },
  badgeDot: { width: 5, height: 5, borderRadius: 3 },
  badgeText: { fontSize: typography.xs, fontWeight: typography.semibold },
  badgeTextMd: { fontSize: typography.sm },
  // Button
  btnWrap: { overflow: 'hidden' },
  btnGradient: { overflow: 'hidden' },
  btnInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  btnText: { fontWeight: typography.semibold, letterSpacing: 0.2 },
  btnDisabled: { opacity: 0.5 },
  // Input
  inputWrap: { marginBottom: spacing.md },
  inputLabel: { fontSize: typography.sm, fontWeight: typography.semibold, color: colors.gray700, marginBottom: 6 },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.gray50, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.gray200, paddingHorizontal: 14, minHeight: 50, gap: 8 },
  inputBoxError: { borderColor: colors.danger },
  inputBoxDisabled: { backgroundColor: colors.gray100, opacity: 0.7 },
  inputPrefix: { fontSize: typography.base, color: colors.gray500, fontWeight: typography.medium },
  inputField: { flex: 1, fontSize: typography.base, color: colors.gray900, paddingVertical: 12 },
  inputMultiline: { paddingVertical: 10, textAlignVertical: 'top' },
  inputError: { fontSize: typography.xs, color: colors.danger, marginTop: 4 },
  // Section
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  sectionTitle: { fontSize: typography.md, fontWeight: typography.bold, color: colors.gray900 },
  sectionSub: { fontSize: typography.sm, color: colors.gray500, marginTop: 2 },
  sectionAction: { fontSize: typography.sm, color: colors.brand, fontWeight: typography.semibold },
  // Stat
  statCard: { flex: 1 },
  statLabel: { fontSize: typography.xs, color: colors.gray500, fontWeight: typography.medium, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  statValue: { fontSize: typography['2xl'], fontWeight: typography.extrabold, letterSpacing: -0.5 },
  statIcon: { width: 40, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  // Progress
  pbTrack: { backgroundColor: colors.gray100, borderRadius: 4, overflow: 'hidden' },
  pbFill: { borderRadius: 4 },
  // Empty
  empty: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24 },
  emptyEmoji: { fontSize: 52, marginBottom: 16 },
  emptyTitle: { fontSize: typography.lg, fontWeight: typography.bold, color: colors.gray700, marginBottom: 6, textAlign: 'center' },
  emptySub: { fontSize: typography.sm, color: colors.gray400, textAlign: 'center', lineHeight: 20 },
  // Avatar
  avatar: { alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: typography.bold },
  // List
  listItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  listItemBorder: { borderBottomWidth: 0.5, borderColor: colors.gray100 },
  listTitle: { fontSize: typography.base, fontWeight: typography.medium, color: colors.gray900 },
  listSub: { fontSize: typography.sm, color: colors.gray500, marginTop: 2 },
  // Toast
  toast: { position: 'absolute', top: 16, left: 20, right: 20, flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: radius.lg, padding: 14, zIndex: 9999 },
  toastText: { flex: 1, fontSize: typography.sm, color: colors.white, fontWeight: typography.medium },
  // Divider
  divider: { height: 0.5, backgroundColor: colors.gray200, marginVertical: spacing.md },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: spacing.md },
  dividerLabel: { fontSize: typography.xs, color: colors.gray400, fontWeight: typography.medium },
  // Chip
  chip: { borderRadius: radius.full, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1.5, borderColor: colors.gray200, backgroundColor: colors.white },
  chipText: { fontSize: typography.sm, fontWeight: typography.semibold, color: colors.gray600 },
});
