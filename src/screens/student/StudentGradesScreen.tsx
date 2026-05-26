import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { useStore } from '../../store';
import { SUBJECT_SCORES, LEADERBOARD, ATTENDANCE_HISTORY, COMPETITIONS } from '../../data/demoData';

const C = { brand:'#1E3A8A', brandLight:'#EEF2FF', success:'#059669', successBg:'#D1FAE5', warning:'#D97706', warningBg:'#FEF3C7', danger:'#DC2626', dangerBg:'#FEE2E2', slate900:'#0F172A', slate700:'#334155', slate500:'#64748B', slate100:'#F1F5F9', white:'#FFFFFF' };

const XP = 1250; const LEVEL = 5; const XP_NEXT = 1500; const STREAK = 7;
const ATTENDANCE_RATE = 91;

export const StudentGradesScreen: React.FC = () => {
  const { user, logout } = useStore();
  const [activeTab, setActiveTab] = useState<'grades' | 'attendance' | 'leaderboard'>('grades');
  const present = ATTENDANCE_HISTORY.filter(d => d.status === 'present').length;
  const absent = ATTENDANCE_HISTORY.filter(d => d.status === 'absent').length;

  return (
    <View style={{ flex: 1, backgroundColor: C.slate100 }}>
      <StatusBar barStyle="light-content" />
      <View style={s.header}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={s.headerLabel}>PROGRESS REPORT</Text>
            <Text style={s.headerTitle}>My Performance</Text>
            <Text style={s.headerSub}>Term 2 · Class 8A</Text>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 6 }}>
            <View style={s.xpPill}><Text style={{ color: '#F59E0B', fontWeight: '800', fontSize: 13 }}>⭐ {XP.toLocaleString()} XP · Lv {LEVEL}</Text></View>
            <View style={s.streakPill}><Text style={{ color: '#f87171', fontWeight: '800', fontSize: 12 }}>🔥 {STREAK} day streak</Text></View>
          </View>
        </View>
        {/* Tabs */}
        <View style={s.tabs}>
          {[['grades', '📊 Grades'], ['attendance', '📅 Attendance'], ['leaderboard', '🏆 Leaderboard']].map(([tab, label]) => (
            <TouchableOpacity key={tab} style={[s.tab, activeTab === tab && s.tabActive]} onPress={() => setActiveTab(tab as any)}>
              <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {activeTab === 'grades' && (
          <>
            {/* Overall */}
            <View style={s.overallCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <View>
                  <Text style={{ fontSize: 12, color: C.slate500, fontWeight: '600', textTransform: 'uppercase' }}>Overall Grade</Text>
                  <Text style={{ fontSize: 40, fontWeight: '900', color: C.brand }}>B+</Text>
                  <Text style={{ fontSize: 13, color: C.slate500 }}>82% average · Class rank #3</Text>
                </View>
                <View style={s.trendBox}>
                  <Text style={{ fontSize: 22 }}>📈</Text>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: C.success }}>+5%</Text>
                  <Text style={{ fontSize: 10, color: C.slate500 }}>vs last term</Text>
                </View>
              </View>
              <View style={{ height: 6, backgroundColor: '#E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
                <View style={{ width: '82%', height: 6, backgroundColor: C.brand, borderRadius: 3 }} />
              </View>
            </View>

            {/* Subject breakdown */}
            {SUBJECT_SCORES.map((sub, i) => (
              <View key={i} style={s.card}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={[s.subIcon, { backgroundColor: sub.color + '20' }]}>
                      <Text style={{ fontSize: 20 }}>{sub.icon}</Text>
                    </View>
                    <View>
                      <Text style={{ fontSize: 14, fontWeight: '800', color: C.slate900 }}>{sub.subject}</Text>
                      <Text style={{ fontSize: 11, color: C.slate500, marginTop: 1 }}>Grade: {sub.grade} · {sub.score}/{sub.max}</Text>
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[s.score, { color: sub.score >= 85 ? C.success : sub.score >= 70 ? C.warning : C.danger }]}>{sub.score}%</Text>
                    <Text style={{ fontSize: 11, color: sub.trend > 0 ? C.success : C.danger, fontWeight: '700' }}>
                      {sub.trend > 0 ? '▲' : '▼'} {Math.abs(sub.trend)}%
                    </Text>
                  </View>
                </View>
                <View style={{ height: 6, backgroundColor: '#E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
                  <View style={{ width: `${sub.score}%`, height: 6, backgroundColor: sub.score >= 85 ? C.success : sub.score >= 70 ? C.warning : C.danger, borderRadius: 3 }} />
                </View>
              </View>
            ))}

            {/* Exam history */}
            <Text style={s.sectionTitle}>📋 Recent Tests</Text>
            <View style={s.card}>
              {[
                { name: 'Unit Test 2 — Science',   score: 88, date: 'May 15' },
                { name: 'Unit Test 2 — Maths',     score: 82, date: 'May 16' },
                { name: 'Unit Test 2 — English',   score: 91, date: 'May 17' },
                { name: 'Unit Test 1 — Science',   score: 83, date: 'Mar 10' },
                { name: 'Unit Test 1 — Maths',     score: 79, date: 'Mar 11' },
              ].map((test, i) => (
                <View key={i} style={[{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }, i < 4 && { borderBottomWidth: 0.5, borderColor: C.slate100 }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: C.slate900 }}>{test.name}</Text>
                    <Text style={{ fontSize: 11, color: C.slate500 }}>{test.date}</Text>
                  </View>
                  <View style={[s.scorePill, { backgroundColor: test.score >= 85 ? '#D1FAE5' : test.score >= 70 ? '#FEF3C7' : '#FEE2E2' }]}>
                    <Text style={{ fontSize: 13, fontWeight: '900', color: test.score >= 85 ? C.success : test.score >= 70 ? C.warning : C.danger }}>{test.score}%</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {activeTab === 'attendance' && (
          <>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
              {[
                { val: `${ATTENDANCE_RATE}%`, label: 'Rate', color: ATTENDANCE_RATE >= 75 ? C.success : C.danger },
                { val: present, label: 'Present', color: C.success },
                { val: absent, label: 'Absent', color: C.danger },
              ].map((st, i) => (
                <View key={i} style={[s.card, { flex: 1, alignItems: 'center', padding: 14 }]}>
                  <Text style={{ fontSize: 24, fontWeight: '900', color: st.color }}>{st.val}</Text>
                  <Text style={{ fontSize: 11, color: C.slate500, fontWeight: '600' }}>{st.label}</Text>
                </View>
              ))}
            </View>
            {ATTENDANCE_RATE < 75 && (
              <View style={s.alertBox}>
                <Text style={{ fontSize: 13, fontWeight: '800', color: C.danger }}>⚠️ Attendance Warning</Text>
                <Text style={{ fontSize: 12, color: C.danger, marginTop: 4, lineHeight: 17 }}>Your attendance is below 75%. Regular attendance is required to appear in exams.</Text>
              </View>
            )}
            <Text style={s.sectionTitle}>📅 Last 30 Days</Text>
            <View style={s.card}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                {ATTENDANCE_HISTORY.map((day, i) => (
                  <View key={i} style={[s.calDay, { backgroundColor: day.status === 'present' ? '#D1FAE5' : day.status === 'absent' ? '#FEE2E2' : C.slate100 }]}>
                    <Text style={{ fontSize: 10, fontWeight: '800', color: day.status === 'present' ? C.success : day.status === 'absent' ? C.danger : C.slate500 }}>
                      {day.date.getDate()}
                    </Text>
                  </View>
                ))}
              </View>
              <View style={{ flexDirection: 'row', gap: 16, marginTop: 14 }}>
                {[['Present', C.success, '#D1FAE5'], ['Absent', C.danger, '#FEE2E2'], ['Holiday', C.slate500, C.slate100]].map(([l, c, bg]) => (
                  <View key={l} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: bg as string }} />
                    <Text style={{ fontSize: 11, color: C.slate500 }}>{l}</Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}

        {activeTab === 'leaderboard' && (
          <>
            <View style={[s.card, { marginBottom: 16, alignItems: 'center', padding: 20 }]}>
              <Text style={{ fontSize: 14, color: C.slate500, marginBottom: 4 }}>Your Position</Text>
              <Text style={{ fontSize: 48 }}>🥉</Text>
              <Text style={{ fontSize: 32, fontWeight: '900', color: C.brand }}>#3</Text>
              <Text style={{ fontSize: 13, color: C.slate500 }}>of 32 students · {XP.toLocaleString()} XP</Text>
            </View>
            <View style={s.card}>
              {LEADERBOARD.map((entry, i) => (
                <View key={i} style={[{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 }, i < LEADERBOARD.length - 1 && { borderBottomWidth: 0.5, borderColor: C.slate100 }]}>
                  <Text style={{ fontSize: i < 3 ? 22 : 14, fontWeight: '900', color: ['#F59E0B','#94A3B8','#B45309'][i] ?? C.slate500, width: 36 }}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontWeight: entry.name === user?.name ? '900' : '600', color: entry.name === user?.name ? C.brand : C.slate900 }}>
                      {entry.name}{entry.name === user?.name ? ' ← You' : ''}
                    </Text>
                    <Text style={{ fontSize: 11, color: C.slate500 }}>Lv {entry.level} · 🔥 {entry.streak}d</Text>
                  </View>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: '#F59E0B' }}>{entry.xp.toLocaleString()}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  header: { backgroundColor: C.brand, paddingTop: 52, paddingBottom: 0, paddingHorizontal: 18 },
  headerLabel: { fontSize: 10, color: 'rgba(255,255,255,0.55)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#fff', marginTop: 2 },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 2, marginBottom: 14 },
  xpPill: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  streakPill: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  tabs: { flexDirection: 'row', borderTopWidth: 0.5, borderColor: 'rgba(255,255,255,0.2)', marginTop: 8 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderColor: '#F59E0B' },
  tabText: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.5)' },
  tabTextActive: { color: '#F59E0B' },
  scroll: { padding: 16, paddingBottom: 32 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: C.slate900, marginBottom: 10, marginTop: 4 },
  card: { backgroundColor: C.white, borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  overallCard: { backgroundColor: C.white, borderRadius: 18, padding: 18, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  trendBox: { alignItems: 'center', backgroundColor: '#D1FAE5', borderRadius: 14, padding: 14, gap: 2 },
  subIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  score: { fontSize: 22, fontWeight: '900' },
  scorePill: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  alertBox: { backgroundColor: '#FEE2E2', borderRadius: 12, padding: 14, marginBottom: 14, borderLeftWidth: 4, borderLeftColor: C.danger },
  calDay: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
});
