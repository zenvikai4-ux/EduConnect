import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  StatusBar, Animated, Easing,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';
import { Colors, Spacing, Radius, Shadow } from '../../constants/theme';

// ─── BADGE DEFINITIONS ───────────────────────────────────────────
const BADGES = [
  { id: 'streak3',   icon: '🔥', label: '3-Day Streak',     xpReq: 0,   streakReq: 3  },
  { id: 'streak7',   icon: '⚡', label: 'Week Warrior',      xpReq: 0,   streakReq: 7  },
  { id: 'xp500',    icon: '⭐', label: 'XP Star',           xpReq: 500, streakReq: 0  },
  { id: 'hw5',      icon: '📚', label: 'Homework Hero',     xpReq: 0,   streakReq: 0  },
  { id: 'maths',    icon: '🧮', label: 'Maths Wizard',      xpReq: 0,   streakReq: 0  },
  { id: 'science',  icon: '🔬', label: 'Science Star',      xpReq: 0,   streakReq: 0  },
];

// ─── XP LEVEL CONFIG ─────────────────────────────────────────────
const getLevel = (xp: number) => {
  if (xp < 200) return { level: 1, label: 'Learner',  next: 200,  color: '#94a3b8' };
  if (xp < 500) return { level: 2, label: 'Explorer', next: 500,  color: '#22c55e' };
  if (xp < 900) return { level: 3, label: 'Scholar',  next: 900,  color: '#3b82f6' };
  if (xp < 1400) return { level: 4, label: 'Ace',     next: 1400, color: '#8b5cf6' };
  if (xp < 2000) return { level: 5, label: 'Genius',  next: 2000, color: '#f59e0b' };
  return { level: 6, label: 'Legend', next: 9999, color: '#ef4444' };
};

export const StudentHomeScreen: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigation = useNavigation<any>();
  const student = user as any;

  const xp = student?.xpPoints ?? 340;
  const streak = student?.streak ?? 4;
  const lvl = getLevel(xp);
  const xpPct = Math.min(100, Math.round(((xp - (getLevel(xp - 1)?.next ?? 0)) / (lvl.next - (getLevel(xp - 1)?.next ?? 0))) * 100));
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const pendingHW = student?.pendingHomework ?? [];
  const exams = student?.upcomingExams ?? [];
  const earnedBadges = BADGES.filter(b =>
    (b.streakReq === 0 || streak >= b.streakReq) &&
    (b.xpReq === 0 || xp >= b.xpReq)
  ).slice(0, 3);

  // Animate XP bar
  const xpAnim = React.useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(xpAnim, { toValue: xpPct, duration: 1200, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.slate50 }}>
      <StatusBar barStyle="light-content" />

      {/* ─── HERO HEADER ──────────────────────────────── */}
      <View style={s.header}>
        <View style={s.headerTop}>
          <View style={{ flex: 1 }}>
            <Text style={s.greeting}>{greeting} 👋</Text>
            <Text style={s.heroName}>{student?.name?.split(' ')[0] ?? 'Aarav'}</Text>
            <Text style={s.heroSub}>
              Class {student?.grade ?? '8'}-{student?.section ?? 'A'} · {student?.schoolId ? 'EduSpark School' : 'Greenfield Academy'}
            </Text>
          </View>
          <TouchableOpacity onPress={logout} style={s.logoutBtn}>
            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: '600' }}>LOGOUT</Text>
          </TouchableOpacity>
        </View>

        {/* XP Card */}
        <View style={s.xpCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 20 }}>⭐</Text>
              <View>
                <Text style={s.xpLevel}>Level {lvl.level} — {lvl.label}</Text>
                <Text style={s.xpPoints}>{xp.toLocaleString()} XP</Text>
              </View>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <View style={s.streakBadge}>
                <Text style={{ fontSize: 14 }}>🔥</Text>
                <Text style={s.streakText}>{streak} day streak</Text>
              </View>
            </View>
          </View>
          <View style={s.xpTrack}>
            <Animated.View style={[s.xpFill, { width: xpAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }), backgroundColor: lvl.color }]} />
          </View>
          <Text style={s.xpNextLabel}>{lvl.next - xp} XP to {lvl.level < 6 ? `Level ${lvl.level + 1}` : 'Max'}</Text>
        </View>

        {/* Quick stats */}
        <View style={s.statsRow}>
          {[
            { icon: '📝', val: pendingHW.length.toString(), label: 'HW Due' },
            { icon: '📅', val: exams.length.toString(),    label: 'Exams' },
            { icon: '🏆', val: `#${student?.rank ?? 4}`,   label: 'Class Rank' },
          ].map(stat => (
            <View key={stat.label} style={s.stat}>
              <Text style={{ fontSize: 18, marginBottom: 2 }}>{stat.icon}</Text>
              <Text style={s.statVal}>{stat.val}</Text>
              <Text style={s.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ─── ARIA AI CARD ───────────────────────────── */}
        <TouchableOpacity style={s.ariaCard} onPress={() => navigation.navigate('Aria')} activeOpacity={0.92}>
          <View style={s.ariaLeft}>
            <Text style={{ fontSize: 32, marginBottom: 4 }}>✨</Text>
            <View style={s.ariaLive}><View style={s.ariaDot} /><Text style={s.ariaLiveText}>AI Active</Text></View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.ariaTitle}>Chat with Aria</Text>
            <Text style={s.ariaSub}>Your personal AI study companion. Ask anything — I explain, never just give answers.</Text>
            <View style={s.ariaTags}>
              {['Doubt Solver', 'Quiz Mode', 'Study Plan'].map(t => (
                <View key={t} style={s.ariaTag}><Text style={s.ariaTagText}>{t}</Text></View>
              ))}
            </View>
          </View>
          <View style={s.ariaArrow}><Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>›</Text></View>
        </TouchableOpacity>

        {/* ─── BADGES ─────────────────────────────────── */}
        {earnedBadges.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>🏅 Your Badges</Text>
            <View style={s.badgeRow}>
              {earnedBadges.map(badge => (
                <View key={badge.id} style={s.badge}>
                  <Text style={{ fontSize: 26 }}>{badge.icon}</Text>
                  <Text style={s.badgeLabel}>{badge.label}</Text>
                </View>
              ))}
              {BADGES.filter(b => !earnedBadges.find(e => e.id === b.id)).slice(0, 3 - earnedBadges.length).map(badge => (
                <View key={badge.id} style={[s.badge, { opacity: 0.35 }]}>
                  <Text style={{ fontSize: 26, filter: undefined }}>🔒</Text>
                  <Text style={s.badgeLabel}>{badge.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ─── TODAY'S SCHEDULE ────────────────────────── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>📅 Today — {today}</Text>
          <View style={s.card}>
            {[
              { time: '8:00', sub: 'Mathematics',   room: '101', color: '#3b82f6' },
              { time: '9:00', sub: 'Science',        room: '102', color: '#22c55e' },
              { time: '10:00', sub: 'English',       room: '103', color: '#f59e0b' },
              { time: '11:00', sub: 'Social Studies', room: '101', color: '#8b5cf6' },
              { time: '12:00', sub: 'Hindi',          room: '104', color: '#ef4444' },
            ].map((p, i) => (
              <View key={i} style={[s.period, i < 4 && s.periodBorder]}>
                <View style={[s.periodDot, { backgroundColor: p.color }]} />
                <View style={{ flex: 1 }}>
                  <Text style={s.periodSub}>{p.sub}</Text>
                  <Text style={s.periodTime}>{p.time} AM · Room {p.room}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ─── HOMEWORK DUE ───────────────────────────── */}
        {pendingHW.length > 0 && (
          <View style={s.section}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <Text style={s.sectionTitle}>📚 Homework Due</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Homework')}>
                <Text style={{ fontSize: 12, color: Colors.primary, fontWeight: '700' }}>See all →</Text>
              </TouchableOpacity>
            </View>
            {pendingHW.slice(0, 2).map((hw: any, i: number) => (
              <TouchableOpacity key={i} style={s.hwCard} onPress={() => navigation.navigate('Homework')} activeOpacity={0.85}>
                <View style={[s.hwDot, { backgroundColor: i === 0 ? Colors.danger : Colors.warning }]} />
                <View style={{ flex: 1 }}>
                  <Text style={s.hwTitle}>{hw.title}</Text>
                  <Text style={s.hwMeta}>{hw.subject} · Due {new Date(hw.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</Text>
                </View>
                <View style={[s.urgencyBadge, { backgroundColor: i === 0 ? '#fde8e8' : '#fef3c7' }]}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: i === 0 ? Colors.danger : Colors.warning }}>
                    {i === 0 ? 'URGENT' : 'DUE SOON'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ─── QUICK ACTIONS ──────────────────────────── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>⚡ Quick Access</Text>
          <View style={s.quickGrid}>
            {[
              { icon: '📊', label: 'My Progress', screen: 'Grades',      color: '#3b82f6', bg: '#dbeafe' },
              { icon: '🏆', label: 'Compete',     screen: 'Compete',     color: '#f59e0b', bg: '#fef3c7' },
              { icon: '🎯', label: 'Goals',        screen: 'Aria',        color: '#8b5cf6', bg: '#ede9fe' },
              { icon: '📝', label: 'Homework',     screen: 'Homework',    color: '#22c55e', bg: '#dcfce7' },
            ].map(item => (
              <TouchableOpacity key={item.label} style={[s.quickItem, { backgroundColor: item.bg }]} onPress={() => navigation.navigate(item.screen)} activeOpacity={0.85}>
                <Text style={{ fontSize: 28, marginBottom: 6 }}>{item.icon}</Text>
                <Text style={[s.quickLabel, { color: item.color }]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ─── UPCOMING EXAMS ─────────────────────────── */}
        {exams.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>🎯 Upcoming Exams</Text>
            <View style={s.card}>
              {exams.map((exam: any, i: number) => {
                const daysLeft = Math.max(0, Math.round((new Date(exam.date).getTime() - Date.now()) / 86400000));
                return (
                  <View key={i} style={[s.examRow, i < exams.length - 1 && s.periodBorder]}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.examSub}>{exam.subject}</Text>
                      <Text style={s.examDate}>{new Date(exam.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</Text>
                    </View>
                    <View style={[s.daysLeft, { backgroundColor: daysLeft <= 3 ? '#fde8e8' : daysLeft <= 7 ? '#fef3c7' : '#dcfce7' }]}>
                      <Text style={{ fontSize: 11, fontWeight: '800', color: daysLeft <= 3 ? Colors.danger : daysLeft <= 7 ? Colors.warning : Colors.success }}>
                        {daysLeft === 0 ? 'TODAY' : `${daysLeft}d`}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  // Header
  header: { backgroundColor: Colors.primaryDark, paddingTop: 52, paddingBottom: 20, paddingHorizontal: 20 },
  headerTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  greeting: { fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  heroName: { fontSize: 28, fontWeight: '900', color: '#fff', letterSpacing: -0.5, marginTop: 2 },
  heroSub: { fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 3 },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  // XP
  xpCard: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 14, padding: 14, marginBottom: 14 },
  xpLevel: { fontSize: 13, fontWeight: '800', color: '#fff' },
  xpPoints: { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 1 },
  streakBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  streakText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  xpTrack: { height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  xpFill: { height: 6, borderRadius: 3 },
  xpNextLabel: { fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: '600' },
  // Stats
  statsRow: { flexDirection: 'row', gap: 10 },
  stat: { flex: 1, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, paddingVertical: 10 },
  statVal: { fontSize: 18, fontWeight: '900', color: '#fff' },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.55)', fontWeight: '600', marginTop: 2 },
  // Content
  scroll: { padding: 16, paddingBottom: 32 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: Colors.slate800, marginBottom: 10, letterSpacing: -0.2 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, ...Shadow.md as any },
  // Aria
  ariaCard: { backgroundColor: Colors.ariaDark, borderRadius: 18, padding: 16, marginBottom: 20, flexDirection: 'row', alignItems: 'center', gap: 14, ...Shadow.lg as any },
  ariaLeft: { alignItems: 'center' },
  ariaLive: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ariaDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ade80' },
  ariaLiveText: { fontSize: 9, color: '#4ade80', fontWeight: '700' },
  ariaTitle: { fontSize: 16, fontWeight: '800', color: '#fff', marginBottom: 4 },
  ariaSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 17, marginBottom: 8 },
  ariaTags: { flexDirection: 'row', gap: 6 },
  ariaTag: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  ariaTagText: { fontSize: 10, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
  ariaArrow: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  // Badges
  badgeRow: { flexDirection: 'row', gap: 10 },
  badge: { flex: 1, alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 14, ...Shadow.sm as any },
  badgeLabel: { fontSize: 10, fontWeight: '700', color: Colors.slate600, marginTop: 6, textAlign: 'center' },
  // Schedule
  period: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  periodBorder: { borderBottomWidth: 0.5, borderColor: Colors.slate100 },
  periodDot: { width: 10, height: 10, borderRadius: 5 },
  periodSub: { fontSize: 14, fontWeight: '700', color: Colors.slate800 },
  periodTime: { fontSize: 11, color: Colors.slate400, marginTop: 1 },
  // Homework
  hwCard: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12, ...Shadow.sm as any },
  hwDot: { width: 8, height: 8, borderRadius: 4 },
  hwTitle: { fontSize: 14, fontWeight: '700', color: Colors.slate800, marginBottom: 2 },
  hwMeta: { fontSize: 11, color: Colors.slate400 },
  urgencyBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  // Quick actions
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickItem: { width: '47%', borderRadius: 16, padding: 16, alignItems: 'center' },
  quickLabel: { fontSize: 12, fontWeight: '800' },
  // Exams
  examRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  examSub: { fontSize: 14, fontWeight: '700', color: Colors.slate800 },
  examDate: { fontSize: 11, color: Colors.slate400, marginTop: 2 },
  daysLeft: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  hwDueDot: { width: 8, height: 8, borderRadius: 4 },
});
