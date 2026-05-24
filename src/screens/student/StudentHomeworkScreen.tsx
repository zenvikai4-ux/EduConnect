import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, Alert } from 'react-native';
import { AppHeader, Badge, SectionHeader } from '../../components/shared';
import { useAuthStore } from '../../store/authStore';
import { Colors, Spacing } from '../../constants/theme';

const HOMEWORK = [
  { id: 1, subject: 'Science', title: 'Chapter 9 — Photosynthesis Reading', due: 'Tomorrow · Apr 10', status: 'urgent', icon: '🌿' },
  { id: 2, subject: 'Mathematics', title: 'Exercise 5.3 — Quadratic Equations', due: 'Apr 11', status: 'pending', icon: '📐' },
  { id: 3, subject: 'Social Studies', title: 'Map Work — Rivers of India', due: 'Apr 14', status: 'pending', icon: '🗺️' },
  { id: 4, subject: 'English', title: 'Essay Draft — My Favourite Season', due: 'Submitted Apr 8', status: 'done', icon: '📝' },
  { id: 5, subject: 'Hindi', title: 'Paragraph Writing', due: 'Submitted Apr 5', status: 'done', icon: '✍️' },
];

export const StudentHomeworkScreen: React.FC = () => {
  const { logout } = useAuthStore();
  const [submitted, setSubmitted] = useState<number[]>([4, 5]);

  const pending = HOMEWORK.filter(h => !submitted.includes(h.id));
  const done = HOMEWORK.filter(h => submitted.includes(h.id));

  const markDone = (id: number, title: string) => {
    Alert.alert('Mark as Done?', `Mark "${title}" as submitted?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Mark Done ✅', onPress: () => setSubmitted(prev => [...prev, id]) },
    ]);
  };

  const getBadge = (status: string, id: number) => {
    if (submitted.includes(id)) return <Badge text="Done ✅" bg={Colors.successSurface} color={Colors.success} />;
    if (status === 'urgent') return <Badge text="Urgent" bg={Colors.dangerSurface} color={Colors.danger} />;
    return <Badge text="Pending" bg={Colors.warningSurface} color={Colors.warning} />;
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.slate50 }}>
      <StatusBar barStyle="light-content" />
      <AppHeader title="Homework" subtitle={`${pending.length} pending · ${done.length} done this week`}
        initials="AS" gradientColors={['#4C1D95', '#6D28D9']} onLogout={logout} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <View style={styles.statsRow}>
          {[['📋', String(HOMEWORK.length), 'Total'], ['⏳', String(pending.length), 'Pending'], ['✅', String(done.length), 'Done']].map(([ic, v, l]) => (
            <View key={l} style={styles.statBox}>
              <Text style={{ fontSize: 20 }}>{ic}</Text>
              <Text style={styles.statVal}>{v}</Text>
              <Text style={styles.statLbl}>{l}</Text>
            </View>
          ))}
        </View>

        {pending.length > 0 && (
          <>
            <SectionHeader title="Pending" />
            {pending.map(hw => (
              <TouchableOpacity key={hw.id} style={styles.hwCard} onPress={() => markDone(hw.id, hw.title)} activeOpacity={0.85}>
                <View style={styles.hwIcon}><Text style={{ fontSize: 22 }}>{hw.icon}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.hwSubject}>{hw.subject}</Text>
                  <Text style={styles.hwTitle} numberOfLines={2}>{hw.title}</Text>
                  <Text style={styles.hwDue}>📅 {hw.due}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 8 }}>
                  {getBadge(hw.status, hw.id)}
                  <Text style={{ fontSize: 10, color: Colors.primary, fontWeight: '600' }}>Tap to mark done</Text>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        {done.length > 0 && (
          <>
            <SectionHeader title="Completed ✅" />
            {done.map(hw => (
              <View key={hw.id} style={[styles.hwCard, { opacity: 0.6 }]}>
                <View style={styles.hwIcon}><Text style={{ fontSize: 22 }}>{hw.icon}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.hwSubject}>{hw.subject}</Text>
                  <Text style={[styles.hwTitle, { textDecorationLine: 'line-through' }]} numberOfLines={2}>{hw.title}</Text>
                  <Text style={styles.hwDue}>{hw.due}</Text>
                </View>
                <Badge text="Done ✅" bg={Colors.successSurface} color={Colors.success} />
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  content: { padding: Spacing.base, paddingBottom: 100 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statBox: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 0.5, borderColor: Colors.slate200 },
  statVal: { fontSize: 24, fontWeight: '800', color: Colors.slate800, marginTop: 4, marginBottom: 2 },
  statLbl: { fontSize: 11, color: Colors.slate500 },
  hwCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 0.5, borderColor: Colors.slate200 },
  hwIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.slate50, alignItems: 'center', justifyContent: 'center', borderWidth: 0.5, borderColor: Colors.slate200 },
  hwSubject: { fontSize: 10, fontWeight: '700', color: Colors.primary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 },
  hwTitle: { fontSize: 14, fontWeight: '600', color: Colors.slate800, lineHeight: 20, marginBottom: 4 },
  hwDue: { fontSize: 11, color: Colors.slate500 },
});
