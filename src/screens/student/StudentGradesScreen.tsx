import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { AppHeader, Card, SectionHeader, ProgressBar, Badge } from '../../components/shared';
import { useAuthStore } from '../../store/authStore';
import { Colors, Spacing } from '../../constants/theme';

const SUBJECTS = [
  { name: 'Science', grade: 'A', pct: 91, color: Colors.aria, icon: '🌿', teacher: 'Ms. Kavitha', exams: [{ name: 'Unit Test 1', score: 34, total: 40, date: 'Apr 5' }, { name: 'Mid Term', score: 38, total: 40, date: 'Feb 20' }] },
  { name: 'English', grade: 'B+', pct: 88, color: Colors.primary, icon: '📖', teacher: 'Ms. Lalitha', exams: [{ name: 'Essay Test', score: 17, total: 20, date: 'Apr 3' }] },
  { name: 'Mathematics', grade: 'B', pct: 79, color: Colors.success, icon: '📐', teacher: 'Mr. Prakash', exams: [{ name: 'Algebra Test', score: 31, total: 40, date: 'Mar 28' }] },
  { name: 'Social Studies', grade: 'B-', pct: 74, color: Colors.warning, icon: '🗺️', teacher: 'Ms. Rekha', exams: [{ name: 'Map Test', score: 22, total: 30, date: 'Mar 15' }] },
  { name: 'Hindi', grade: 'C+', pct: 68, color: Colors.danger, icon: '📝', teacher: 'Mr. Sharma', exams: [{ name: 'Dictation', score: 14, total: 20, date: 'Mar 10' }] },
];

export const StudentGradesScreen: React.FC = () => {
  const { logout } = useAuthStore();
  const [expanded, setExpanded] = useState<string | null>(null);
  const overall = Math.round(SUBJECTS.reduce((a, s) => a + s.pct, 0) / SUBJECTS.length);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.slate50 }}>
      <StatusBar barStyle="light-content" />
      <AppHeader title="My Grades" subtitle="Term 1 · Greenfield Academy · Class 8-A"
        initials="AS" gradientColors={['#4C1D95', '#6D28D9']} onLogout={logout} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Overall card */}
        <View style={styles.overallCard}>
          <Text style={styles.overallLabel}>OVERALL GRADE · TERM 1</Text>
          <Text style={styles.overallGrade}>B+ <Text style={styles.overallPct}>{overall}%</Text></Text>
          <Text style={styles.overallSub}>Class rank: 12 of 34 · Trend: ↑ Improving</Text>
          <View style={styles.overallStats}>
            {[['5', 'Subjects'], ['3', 'Exams done'], ['2', 'Top scores']].map(([v, l]) => (
              <View key={l} style={styles.oStat}>
                <Text style={styles.oStatVal}>{v}</Text>
                <Text style={styles.oStatLbl}>{l}</Text>
              </View>
            ))}
          </View>
        </View>

        <SectionHeader title="Subject Performance" />
        <Text style={{ fontSize: 12, color: Colors.slate400, marginBottom: 12 }}>Tap a subject to see exam details</Text>

        {SUBJECTS.map(sub => (
          <TouchableOpacity key={sub.name} onPress={() => setExpanded(expanded === sub.name ? null : sub.name)}
            style={styles.subjectCard} activeOpacity={0.85}>
            <View style={styles.subjectHeader}>
              <View style={styles.subjectIconBox}><Text style={{ fontSize: 22 }}>{sub.icon}</Text></View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                  <View>
                    <Text style={styles.subjectName}>{sub.name}</Text>
                    <Text style={styles.subjectTeacher}>{sub.teacher}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.subjectGrade, { color: sub.color }]}>{sub.grade}</Text>
                    <Text style={[styles.subjectPct, { color: sub.color }]}>{sub.pct}%</Text>
                  </View>
                </View>
                <ProgressBar value={sub.pct} color={sub.color} height={6} />
              </View>
            </View>

            {expanded === sub.name && (
              <View style={styles.examList}>
                <Text style={styles.examListTitle}>Recent Exams</Text>
                {sub.exams.map((e, i) => (
                  <View key={i} style={styles.examRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.examName}>{e.name}</Text>
                      <Text style={styles.examDate}>{e.date}</Text>
                    </View>
                    <Text style={styles.examScore}>{e.score}/{e.total}</Text>
                    <Badge
                      text={`${Math.round(e.score / e.total * 100)}%`}
                      bg={e.score / e.total >= 0.8 ? Colors.successSurface : e.score / e.total >= 0.6 ? Colors.warningSurface : Colors.dangerSurface}
                      color={e.score / e.total >= 0.8 ? Colors.success : e.score / e.total >= 0.6 ? Colors.warning : Colors.danger}
                    />
                  </View>
                ))}
              </View>
            )}

            <Text style={[styles.expandHint, { color: sub.color }]}>
              {expanded === sub.name ? '▲ Hide details' : '▼ Show exam details'}
            </Text>
          </TouchableOpacity>
        ))}

        <SectionHeader title="Achievements 🏆" />
        <Card>
          {[['🥇', 'Science Quiz — 1st Place', 'March 2026 · School level'], ['📚', '100% Homework — January', 'Perfect submission streak'], ['⭐', 'Most Improved — English', 'February 2026']].map(([ic, t, s]) => (
            <View key={t} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: Colors.slate100 }}>
              <Text style={{ fontSize: 22 }}>{ic}</Text>
              <View><Text style={{ fontSize: 14, fontWeight: '600', color: Colors.slate800 }}>{t}</Text><Text style={{ fontSize: 11, color: Colors.slate500, marginTop: 1 }}>{s}</Text></View>
            </View>
          ))}
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  content: { padding: Spacing.base, paddingBottom: 100 },
  overallCard: { backgroundColor: '#4C1D95', borderRadius: 20, padding: 20, marginBottom: 16 },
  overallLabel: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.6)', letterSpacing: 0.8, marginBottom: 8 },
  overallGrade: { fontSize: 40, fontWeight: '900', color: '#fff', marginBottom: 4 },
  overallPct: { fontSize: 24, opacity: 0.8 },
  overallSub: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginBottom: 16 },
  overallStats: { flexDirection: 'row', gap: 8 },
  oStat: { flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: 10, alignItems: 'center' },
  oStatVal: { fontSize: 18, fontWeight: '800', color: '#fff' },
  oStatLbl: { fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  subjectCard: { backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 0.5, borderColor: Colors.slate200 },
  subjectHeader: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  subjectIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.slate50, alignItems: 'center', justifyContent: 'center', borderWidth: 0.5, borderColor: Colors.slate200 },
  subjectName: { fontSize: 15, fontWeight: '700', color: Colors.slate800 },
  subjectTeacher: { fontSize: 11, color: Colors.slate400, marginBottom: 2 },
  subjectGrade: { fontSize: 20, fontWeight: '800' },
  subjectPct: { fontSize: 12, fontWeight: '600' },
  expandHint: { fontSize: 11, fontWeight: '600', textAlign: 'center', marginTop: 10 },
  examList: { backgroundColor: Colors.slate50, borderRadius: 10, padding: 12, marginTop: 12, borderWidth: 0.5, borderColor: Colors.slate200 },
  examListTitle: { fontSize: 11, fontWeight: '700', color: Colors.slate500, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10 },
  examRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  examName: { fontSize: 13, fontWeight: '600', color: Colors.slate700 },
  examDate: { fontSize: 11, color: Colors.slate400 },
  examScore: { fontSize: 13, fontWeight: '700', color: Colors.slate700 },
});
