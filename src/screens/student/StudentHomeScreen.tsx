import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../../store';
import { SCHOOL, SCHEDULE_TODAY, HOMEWORK, LEADERBOARD, COMPETITIONS, NOTIFICATIONS_LIST } from '../../data/demoData';

const C = {
  brand: '#1E3A8A', brandMid: '#2563EB', brandLight: '#EEF2FF',
  success: '#059669', successBg: '#D1FAE5',
  warning: '#D97706', warningBg: '#FEF3C7',
  danger: '#DC2626', dangerBg: '#FEE2E2',
  purple: '#7C3AED', purpleBg: '#EDE9FE',
  slate900: '#0F172A', slate700: '#334155', slate500: '#64748B',
  slate300: '#CBD5E1', slate100: '#F1F5F9', white: '#FFFFFF',
};

const XP = 1250; const STREAK = 7; const RANK = 3; const LEVEL = 5;
const XP_NEXT = 1500;
const pct = Math.round((XP / XP_NEXT) * 100);

const Badge = ({ label, color, bg }: any) => (
  <View style={[s.badge, { backgroundColor: bg }]}>
    <Text style={[s.badgeText, { color }]}>{label}</Text>
  </View>
);

const StatBox = ({ icon, value, label, color }: any) => (
  <View style={s.statBox}>
    <Text style={{ fontSize: 22 }}>{icon}</Text>
    <Text style={[s.statVal, { color }]}>{value}</Text>
    <Text style={s.statLabel}>{label}</Text>
  </View>
);

export const StudentHomeScreen: React.FC = () => {
  const { user, logout } = useStore();
  const nav = useNavigation<any>();
  const name = user?.name?.split(' ')[0] ?? 'Arjun';
  const h = new Date().getHours();
  const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  const pending = HOMEWORK.filter(h => h.status === 'pending');
  const unread = NOTIFICATIONS_LIST.filter(n => !n.read).length;

  return (
    <View style={{ flex: 1, backgroundColor: C.slate100 }}>
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <View style={s.header}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View>
            <Text style={s.greeting}>{greeting} 👋</Text>
            <Text style={s.heroName}>{name}</Text>
            <Text style={s.heroSub}>Class 8A · {SCHOOL.name}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <TouchableOpacity style={s.notifBtn} onPress={() => nav.navigate('Notifications')} activeOpacity={0.8}>
              <Text style={{ fontSize: 18 }}>🔔</Text>
              {unread > 0 && <View style={s.notifDot}><Text style={{ fontSize: 9, color: C.white, fontWeight: '800' }}>{unread}</Text></View>}
            </TouchableOpacity>
            <TouchableOpacity style={s.logoutBtn} onPress={logout} activeOpacity={0.8}>
              <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '700' }}>LOGOUT</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* XP Bar */}
        <View style={s.xpCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={s.levelBadge}><Text style={s.levelText}>Lv {LEVEL}</Text></View>
              <Text style={{ color: C.white, fontWeight: '700', fontSize: 14 }}>⭐ {XP.toLocaleString()} XP</Text>
            </View>
            <View style={s.streakBadge}>
              <Text style={{ fontSize: 13 }}>🔥</Text>
              <Text style={{ color: C.white, fontWeight: '800', fontSize: 13 }}>{STREAK} day streak</Text>
            </View>
          </View>
          <View style={s.xpTrack}>
            <View style={[s.xpFill, { width: `${pct}%` }]} />
          </View>
          <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, marginTop: 5 }}>
            {(XP_NEXT - XP).toLocaleString()} XP to Level {LEVEL + 1}
          </Text>
        </View>

        {/* Stats */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <StatBox icon="📅" value="91%" label="Attendance" color="#4ade80" />
          <StatBox icon="🏆" value={`#${RANK}`} label="Class Rank" color="#fbbf24" />
          <StatBox icon="📝" value={pending.length} label="HW Pending" color={pending.length > 0 ? '#f87171' : '#4ade80'} />
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* AI ARIA CARD */}
        <TouchableOpacity style={s.ariaCard} onPress={() => nav.navigate('Aria')} activeOpacity={0.92}>
          <View style={s.ariaLeft}>
            <Text style={{ fontSize: 36 }}>✨</Text>
            <View style={s.ariaLive}><View style={s.ariaDot} /><Text style={s.ariaLiveText}>LIVE</Text></View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.ariaTitle}>Chat with Aria</Text>
            <Text style={s.ariaSub}>Your AI study companion. Ask doubts, take quizzes, build study plans.</Text>
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
              {['💬 Doubt Solver', '🧠 Quiz Mode', '🎯 Study Plan'].map(t => (
                <View key={t} style={s.ariaTag}><Text style={s.ariaTagText}>{t}</Text></View>
              ))}
            </View>
          </View>
          <View style={s.ariaArrow}><Text style={{ color: C.white, fontSize: 20, fontWeight: '800' }}>›</Text></View>
        </TouchableOpacity>

        {/* TODAY'S SCHEDULE */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>📅 Today's Schedule</Text>
          <View style={s.card}>
            {SCHEDULE_TODAY.map((p, i) => (
              <View key={i} style={[s.periodRow, i < SCHEDULE_TODAY.length - 1 && s.rowBorder]}>
                {p.subject === '☕ Break' ? (
                  <View style={{ flex: 1, alignItems: 'center', paddingVertical: 4 }}>
                    <Text style={{ fontSize: 12, color: C.slate500, fontWeight: '600' }}>☕ BREAK — {p.time}</Text>
                  </View>
                ) : (
                  <>
                    <View style={[s.subjectDot, { backgroundColor: p.color }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={s.subjectName}>{p.icon} {p.subject}</Text>
                      <Text style={s.subjectMeta}>{p.time} · {p.room}</Text>
                    </View>
                    <Text style={{ fontSize: 11, color: C.slate500 }}>{p.teacher.split(' ').slice(-1)[0]}</Text>
                  </>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* PENDING HOMEWORK */}
        {pending.length > 0 && (
          <View style={s.section}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <Text style={s.sectionTitle}>📚 Pending Homework</Text>
              <TouchableOpacity onPress={() => nav.navigate('Homework')}><Text style={s.seeAll}>See all →</Text></TouchableOpacity>
            </View>
            {pending.slice(0, 2).map((hw, i) => {
              const daysLeft = Math.max(0, Math.round((new Date(hw.dueDate).getTime() - Date.now()) / 86400000));
              return (
                <TouchableOpacity key={hw.id} style={s.hwCard} onPress={() => nav.navigate('Homework')} activeOpacity={0.85}>
                  <View style={[s.hwDot, { backgroundColor: daysLeft <= 1 ? C.danger : C.warning }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={s.hwTitle} numberOfLines={1}>{hw.title}</Text>
                    <Text style={s.hwMeta}>{hw.subject} · Due in {daysLeft === 0 ? 'today' : `${daysLeft}d`} · +{hw.xpReward} XP</Text>
                  </View>
                  <Badge label={daysLeft === 0 ? 'TODAY' : 'DUE SOON'} color={daysLeft === 0 ? C.danger : C.warning} bg={daysLeft === 0 ? C.dangerBg : C.warningBg} />
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* QUICK ACTIONS */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>⚡ Quick Access</Text>
          <View style={s.quickGrid}>
            {[
              { icon: '📊', label: 'My Grades',  screen: 'Grades',   color: C.brand,   bg: C.brandLight },
              { icon: '🏆', label: 'Compete',    screen: 'Compete',  color: '#D97706', bg: C.warningBg  },
              { icon: '🎯', label: 'Study Plan', screen: 'Aria',     color: C.purple,  bg: C.purpleBg   },
              { icon: '📝', label: 'Homework',   screen: 'Homework', color: C.success, bg: C.successBg  },
            ].map(item => (
              <TouchableOpacity key={item.screen} style={[s.quickItem, { backgroundColor: item.bg }]} onPress={() => nav.navigate(item.screen)} activeOpacity={0.85}>
                <Text style={{ fontSize: 30, marginBottom: 8 }}>{item.icon}</Text>
                <Text style={[s.quickLabel, { color: item.color }]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ACTIVE COMPETITION */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>🏆 Active Competitions</Text>
          {COMPETITIONS.filter(c => c.status === 'active').map(comp => (
            <TouchableOpacity key={comp.id} style={s.compCard} onPress={() => nav.navigate('Compete')} activeOpacity={0.85}>
              <View style={{ flex: 1 }}>
                <Badge label={comp.subject} color={C.brand} bg={C.brandLight} />
                <Text style={s.compTitle}>{comp.title}</Text>
                <Text style={s.compMeta}>{comp.participants} participants · Ends {new Date(comp.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</Text>
              </View>
              <View style={s.compArrow}><Text style={{ color: C.brand, fontWeight: '800' }}>Play →</Text></View>
            </TouchableOpacity>
          ))}
        </View>

        {/* CLASS LEADERBOARD */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>🏅 Class Leaderboard</Text>
          <View style={s.card}>
            {LEADERBOARD.slice(0, 5).map((entry, i) => (
              <View key={i} style={[s.leaderRow, i < 4 && s.rowBorder]}>
                <Text style={[s.leaderRank, i < 3 && { color: ['#F59E0B', '#94A3B8', '#B45309'][i], fontSize: 22 }]}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: entry.name === user?.name ? '800' : '600', color: entry.name === user?.name ? C.brand : C.slate700 }}>
                    {entry.name}{entry.name === user?.name ? ' (You)' : ''}
                  </Text>
                  <Text style={{ fontSize: 11, color: C.slate500 }}>Class {entry.class} · Streak {entry.streak}🔥</Text>
                </View>
                <Text style={{ fontSize: 13, fontWeight: '800', color: '#F59E0B' }}>{entry.xp.toLocaleString()} XP</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  header: { backgroundColor: C.brand, paddingTop: 52, paddingBottom: 20, paddingHorizontal: 18 },
  greeting: { fontSize: 12, color: 'rgba(255,255,255,0.65)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  heroName: { fontSize: 28, fontWeight: '900', color: C.white, letterSpacing: -0.5, marginTop: 2 },
  heroSub: { fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 2 },
  notifBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  notifDot: { position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: 8, backgroundColor: C.danger, alignItems: 'center', justifyContent: 'center' },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  xpCard: { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 14, padding: 14, marginVertical: 14 },
  levelBadge: { backgroundColor: '#F59E0B', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  levelText: { fontSize: 11, fontWeight: '900', color: C.white },
  streakBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  xpTrack: { height: 7, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 4, overflow: 'hidden' },
  xpFill: { height: 7, backgroundColor: '#F59E0B', borderRadius: 4 },
  statBox: { flex: 1, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 12, paddingVertical: 10, gap: 2 },
  statVal: { fontSize: 20, fontWeight: '900' },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: '600' },
  scroll: { padding: 16, paddingBottom: 32 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: C.slate900, marginBottom: 10, letterSpacing: -0.2 },
  card: { backgroundColor: C.white, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  seeAll: { fontSize: 13, color: C.brand, fontWeight: '700' },
  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 10, fontWeight: '800' },
  // Aria card
  ariaCard: { backgroundColor: '#4C1D95', borderRadius: 18, padding: 16, marginBottom: 20, flexDirection: 'row', alignItems: 'center', gap: 14, shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  ariaLeft: { alignItems: 'center', gap: 4 },
  ariaLive: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ariaDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ade80' },
  ariaLiveText: { fontSize: 9, color: '#4ade80', fontWeight: '800', letterSpacing: 1 },
  ariaTitle: { fontSize: 16, fontWeight: '900', color: C.white, marginBottom: 4 },
  ariaSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 17 },
  ariaTag: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  ariaTagText: { fontSize: 10, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
  ariaArrow: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  // Schedule
  periodRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11 },
  rowBorder: { borderBottomWidth: 0.5, borderColor: '#F1F5F9' },
  subjectDot: { width: 10, height: 10, borderRadius: 5 },
  subjectName: { fontSize: 13, fontWeight: '700', color: C.slate900 },
  subjectMeta: { fontSize: 11, color: C.slate500, marginTop: 1 },
  // HW
  hwCard: { backgroundColor: C.white, borderRadius: 14, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  hwDot: { width: 8, height: 8, borderRadius: 4 },
  hwTitle: { fontSize: 13, fontWeight: '700', color: C.slate900, marginBottom: 2 },
  hwMeta: { fontSize: 11, color: C.slate500 },
  // Quick actions
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickItem: { width: '47%', borderRadius: 16, padding: 18, alignItems: 'center' },
  quickLabel: { fontSize: 13, fontWeight: '800' },
  // Competition
  compCard: { backgroundColor: C.white, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  compTitle: { fontSize: 14, fontWeight: '800', color: C.slate900, marginTop: 6, marginBottom: 2 },
  compMeta: { fontSize: 11, color: C.slate500 },
  compArrow: { backgroundColor: C.brandLight, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  // Leaderboard
  leaderRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  leaderRank: { fontSize: 16, fontWeight: '800', color: C.slate500, width: 36 },
});
