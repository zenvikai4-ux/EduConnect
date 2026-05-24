import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';
import { Card, StatBox, ListRow, AlertBanner, Badge, SectionHeader, AppHeader } from '../../components/shared';
import { Colors, Spacing } from '../../constants/theme';
import type { StudentUser } from '../../types';

export const StudentHomeScreen: React.FC = () => {
  const { user, logout } = useAuthStore();
  const student = user as StudentUser;
  const navigation = useNavigation<any>();

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <View style={{ flex: 1, backgroundColor: Colors.slate50 }}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <AppHeader title={"Hey " + (student?.name?.split(' ')[0] ?? 'Aarav') + "! 👋"}
        subtitle={(student?.grade ? 'Class ' + student.grade + '-' + (student?.section ?? 'A') : 'Class 8-A') + ' · Greenfield Academy'}
        initials="AS" gradientColors={['#4C1D95', '#6D28D9']} onLogout={logout}>
        <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 2, marginBottom: 12 }}>{today}</Text>
        <View style={styles.statsRow}>
          <StatBox value="8/10" label="Last Quiz" color="#fff" />
          <StatBox value={String(student?.pendingHomework?.length ?? 3)} label="HW Due" color="#fff" />
          <StatBox value="5" label="Days to Exam" color="#fff" />
        </View>
      </AppHeader>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Aria Card — front and centre */}
        <TouchableOpacity style={styles.ariaCard} onPress={() => navigation.navigate('Aria')} activeOpacity={0.9}>
          <View style={styles.ariaDecor} />
          <View style={styles.ariaHdr}>
            <View style={styles.ariaAv}><Text style={{ fontSize: 22 }}>✨</Text></View>
            <View>
              <Text style={styles.ariaTitle}>Chat with Aria</Text>
              <Text style={styles.ariaSub}>Your personal AI study companion</Text>
            </View>
            <View style={styles.xpBadge}><Text style={styles.xpText}>{student?.xpPoints ?? 340} XP</Text></View>
          </View>
          <Text style={styles.ariaMsg}>
            Ready to help with Photosynthesis, Quadratic Equations, or anything you are stuck on.
            Your Science exam is in 5 days! 🌿
          </Text>
          <View style={styles.ariaStats}>
            {[['8', 'Sessions'], ['🥇', 'Rank'], ['340', 'XP']].map(([v, l]) => (
              <View key={l} style={styles.ariaStat}>
                <Text style={styles.ariaStatVal}>{v}</Text>
                <Text style={styles.ariaStatLbl}>{l}</Text>
              </View>
            ))}
          </View>
          <View style={styles.ariaBtn}>
            <Text style={styles.ariaBtnText}>Talk to Aria ✨</Text>
          </View>
        </TouchableOpacity>

        {/* Alerts */}
        <AlertBanner icon="📝" title="Exam Week Starts April 14" message="Science → Math → English on consecutive days. Aria has personalised prep ready." bg="#EDE9FE" border="rgba(124,58,237,0.3)" />
        <AlertBanner icon="⚠️" title="Science due tomorrow!" message="Chapter 9 reading. Tap Homework to see all pending." bg={Colors.dangerSurface} border="#FECACA" />

        {/* Today's schedule */}
        <SectionHeader title="Today's Schedule" />
        <Card>
          <ListRow icon="📐" iconBg={Colors.infoSurface} title="Mathematics" subtitle="Period 2 · 9:30 AM · Mr. Prakash" />
          <ListRow icon="🌿" iconBg={Colors.successSurface} title="Science" subtitle="Period 3 · 10:30 AM · Ms. Kavitha" />
          <ListRow icon="📖" iconBg={Colors.warningSurface} title="English" subtitle="Period 5 · 12:30 PM · Ms. Lalitha" />
        </Card>

        {/* Homework */}
        <SectionHeader title="Homework Due Soon" action="See All" onAction={() => navigation.navigate('Homework')} />
        <Card>
          <ListRow icon="📗" iconBg={Colors.infoSurface} title="Science — Chapter 9 Reading" subtitle="Due tomorrow"
            right={<Badge text="Urgent" bg={Colors.dangerSurface} color={Colors.danger} />} />
          <ListRow icon="📘" iconBg={Colors.infoSurface} title="Math — Exercise 5.3" subtitle="Due Apr 11"
            right={<Badge text="Soon" bg={Colors.warningSurface} color={Colors.warning} />} />
          <ListRow icon="📙" iconBg={Colors.successSurface} title="English Essay Draft" subtitle="Due Apr 12"
            right={<Badge text="Done" bg={Colors.successSurface} color={Colors.success} />} />
        </Card>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: { paddingTop: 56, paddingHorizontal: 16, paddingBottom: 28, position: 'relative', overflow: 'hidden' },
  headerDecor: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.06)', top: -60, right: -40 },
  date: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 4 },
  greeting: { fontSize: 24, fontWeight: '900', color: '#fff', marginBottom: 4 },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 16 },
  statsRow: { flexDirection: 'row', gap: 8 },
  content: { padding: 16, paddingBottom: 100 },
  ariaCard: { borderRadius: 20, padding: 18, marginBottom: 12, backgroundColor: '#4C1D95', overflow: 'hidden' },
  ariaDecor: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.06)', top: -60, right: -40 },
  ariaHdr: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  ariaAv: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.25)' },
  ariaTitle: { fontSize: 15, fontWeight: '700', color: '#fff' },
  ariaSub: { fontSize: 11, color: 'rgba(255,255,255,0.65)' },
  xpBadge: { marginLeft: 'auto', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  xpText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  ariaMsg: { fontSize: 13, color: 'rgba(255,255,255,0.9)', lineHeight: 20, marginBottom: 14 },
  ariaStats: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  ariaStat: { flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: 8, alignItems: 'center' },
  ariaStatVal: { fontSize: 20, fontWeight: '800', color: '#fff' },
  ariaStatLbl: { fontSize: 9, color: 'rgba(255,255,255,0.6)', marginTop: 1 },
  ariaBtn: { backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', borderRadius: 10, padding: 10, alignItems: 'center' },
  ariaBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
});
