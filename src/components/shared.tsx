import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors, Spacing, Radius, Shadow, Typography } from '../constants/theme';

// ─── CARD ─────────────────────────────────────────────────────────
export const Card: React.FC<{ children: React.ReactNode; style?: object }> = ({ children, style }) => (
  <View style={[styles.card, Shadow.sm, style]}>{children}</View>
);

// ─── STAT BOX ─────────────────────────────────────────────────────
export const StatBox: React.FC<{ value: string; label: string; color?: string }> = ({ value, label, color }) => (
  <View style={styles.stat}>
    <Text style={[styles.statValue, color ? { color } : {}]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

// ─── BADGE ────────────────────────────────────────────────────────
export const Badge: React.FC<{ text: string; bg: string; color: string }> = ({ text, bg, color }) => (
  <View style={[styles.badge, { backgroundColor: bg }]}>
    <Text style={[styles.badgeText, { color }]}>{text}</Text>
  </View>
);

// ─── LIST ROW ─────────────────────────────────────────────────────
export const ListRow: React.FC<{
  icon: string; iconBg: string; title: string; subtitle: string;
  right?: React.ReactNode; onPress?: () => void;
}> = ({ icon, iconBg, title, subtitle, right, onPress }) => (
  <TouchableOpacity style={styles.listRow} onPress={onPress} disabled={!onPress} activeOpacity={0.7}>
    <View style={[styles.listIcon, { backgroundColor: iconBg }]}>
      <Text style={{ fontSize: 18 }}>{icon}</Text>
    </View>
    <View style={styles.listText}>
      <Text style={styles.listTitle} numberOfLines={1}>{title}</Text>
      <Text style={styles.listSub} numberOfLines={1}>{subtitle}</Text>
    </View>
    {right && <View style={{ flexShrink: 0 }}>{right}</View>}
  </TouchableOpacity>
);

// ─── PROGRESS BAR ─────────────────────────────────────────────────
export const ProgressBar: React.FC<{ value: number; color: string; height?: number }> = ({ value, color, height = 6 }) => (
  <View style={[styles.pb, { height }]}>
    <View style={[styles.pbFill, { width: `${Math.min(100, Math.max(0, value))}%`, backgroundColor: color, height }]} />
  </View>
);

// ─── SECTION HEADER ───────────────────────────────────────────────
export const SectionHeader: React.FC<{ title: string; action?: string; onAction?: () => void }> = ({ title, action, onAction }) => (
  <View style={styles.sectionHdr}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {action && <TouchableOpacity onPress={onAction}><Text style={styles.sectionAction}>{action}</Text></TouchableOpacity>}
  </View>
);

// ─── ALERT BANNER ─────────────────────────────────────────────────
export const AlertBanner: React.FC<{ icon: string; title: string; message: string; bg: string; border: string }> = ({ icon, title, message, bg, border }) => (
  <View style={[styles.alertBanner, { backgroundColor: bg, borderColor: border }]}>
    <Text style={styles.alertIcon}>{icon}</Text>
    <View style={{ flex: 1 }}>
      <Text style={styles.alertTitle}>{title}</Text>
      <Text style={styles.alertMsg}>{message}</Text>
    </View>
  </View>
);

// ─── BUTTON ───────────────────────────────────────────────────────
export const Button: React.FC<{
  title: string; onPress: () => void; color?: string; textColor?: string;
  loading?: boolean; style?: object;
}> = ({ title, onPress, color = Colors.primary, textColor = '#fff', loading, style }) => (
  <TouchableOpacity style={[styles.btn, { backgroundColor: color }, style]} onPress={onPress} disabled={loading} activeOpacity={0.85}>
    {loading ? <ActivityIndicator color={textColor} /> : <Text style={[styles.btnText, { color: textColor }]}>{title}</Text>}
  </TouchableOpacity>
);

// ─── ARIA CARD ────────────────────────────────────────────────────
export const AriaCard: React.FC<{
  studentName: string; sessions: number; quizAvg: string;
  hwRate: string; message: string; onPress: () => void;
}> = ({ studentName, sessions, quizAvg, hwRate, message, onPress }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.ariaCard}>
    <View style={styles.ariaHdr}>
      <View style={styles.ariaAv}><Text style={{ fontSize: 20 }}>✨</Text></View>
      <View>
        <Text style={styles.ariaTitle}>Aria — {studentName}&apos;s Study Companion</Text>
        <Text style={styles.ariaSub}>Active today · {sessions} sessions this week</Text>
      </View>
    </View>
    <Text style={styles.ariaMsg}>{message}</Text>
    <View style={styles.ariaStats}>
      {[['Sessions', String(sessions)], ['Quiz Avg', quizAvg], ['HW Rate', hwRate]].map(([l, v]) => (
        <View key={l} style={styles.ariaStat}>
          <Text style={styles.ariaStatVal}>{v}</Text>
          <Text style={styles.ariaStatLbl}>{l}</Text>
        </View>
      ))}
    </View>
    <View style={styles.ariaBtn}><Text style={styles.ariaBtnText}>Open Aria → Chat or see digest</Text></View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: { backgroundColor: Colors.white, borderRadius: Radius.lg, padding: Spacing.base, marginBottom: 10, borderWidth: 0.5, borderColor: Colors.slate200 },
  stat: { flex: 1, backgroundColor: Colors.white, borderRadius: Radius.md, padding: 12, alignItems: 'center', borderWidth: 0.5, borderColor: Colors.slate200 },
  statValue: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5, color: Colors.slate800 },
  statLabel: { fontSize: 10, color: Colors.slate500, marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  badgeText: { fontSize: 10, fontWeight: '700' },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: Colors.slate200 },
  listIcon: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  listText: { flex: 1 },
  listTitle: { fontSize: 14, fontWeight: '600', color: Colors.slate800 },
  listSub: { fontSize: 11, color: Colors.slate500, marginTop: 1 },
  pb: { backgroundColor: Colors.slate100, borderRadius: Radius.full, overflow: 'hidden' },
  pbFill: { borderRadius: Radius.full },
  sectionHdr: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, marginTop: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.slate800 },
  sectionAction: { fontSize: 12, fontWeight: '600', color: Colors.primary },
  alertBanner: { flexDirection: 'row', gap: 10, padding: 12, borderRadius: Radius.md, borderWidth: 1, marginBottom: 8, alignItems: 'flex-start' },
  alertIcon: { fontSize: 15, marginTop: 1 },
  alertTitle: { fontSize: 12, fontWeight: '700', color: Colors.slate800 },
  alertMsg: { fontSize: 11, color: Colors.slate600, marginTop: 1, lineHeight: 16 },
  btn: { padding: 13, borderRadius: Radius.md, alignItems: 'center' },
  btnText: { fontSize: 14, fontWeight: '700' },
  // Aria card
  ariaCard: { borderRadius: 20, padding: 18, marginBottom: 12, overflow: 'hidden', backgroundColor: '#4C1D95' },
  ariaHdr: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  ariaAv: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.25)' },
  ariaTitle: { fontSize: 14, fontWeight: '700', color: '#fff' },
  ariaSub: { fontSize: 11, color: 'rgba(255,255,255,0.65)' },
  ariaMsg: { fontSize: 13, color: 'rgba(255,255,255,0.9)', lineHeight: 20, marginBottom: 14 },
  ariaStats: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  ariaStat: { flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: 8, alignItems: 'center' },
  ariaStatVal: { fontSize: 18, fontWeight: '800', color: '#fff' },
  ariaStatLbl: { fontSize: 9, color: 'rgba(255,255,255,0.6)', marginTop: 1 },
  ariaBtn: { backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', borderRadius: 10, padding: 10, alignItems: 'center' },
  ariaBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
});

// ─── APP HEADER with logout ───────────────────────────────────────
export const AppHeader: React.FC<{
  title: string; subtitle: string; initials: string;
  gradientColors: [string, string]; onLogout: () => void;
  children?: React.ReactNode;
}> = ({ title, subtitle, initials, gradientColors, onLogout, children }) => (
  <View style={{backgroundColor: "#1a56db"}}>
    <View style={headerStyles.row}>
      <View style={{ flex: 1 }}>
        <Text style={headerStyles.title}>{title}</Text>
        <Text style={headerStyles.sub}>{subtitle}</Text>
      </View>
      <TouchableOpacity style={headerStyles.av} onPress={onLogout} activeOpacity={0.8}>
        <Text style={headerStyles.avText}>{initials}</Text>
      </TouchableOpacity>
    </View>
    {children}
  </View>
);

const headerStyles = StyleSheet.create({
  wrap: { paddingTop: 56, paddingHorizontal: 16, paddingBottom: 20 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  title: { fontSize: 20, fontWeight: '900', color: '#fff', marginBottom: 3 },
  sub: { fontSize: 12, color: 'rgba(255,255,255,0.65)' },
  av: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  avText: { fontSize: 13, fontWeight: '800', color: '#fff' },
});
