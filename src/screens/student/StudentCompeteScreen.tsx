import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { Card, ListRow, SectionHeader, ProgressBar, Badge, AppHeader } from '../../components/shared';
import { useAuthStore } from '../../store/authStore';
import { Colors } from '../../constants/theme';
import { useNavigation } from '@react-navigation/native';

const LEADERBOARD = [
  { medal: '🥇', name: 'Aarav Sharma', xp: 340, subjects: 'Science, Math', isMe: true },
  { medal: '🥈', name: 'Ananya Rao', xp: 310, subjects: 'English, Science', isMe: false },
  { medal: '🥉', name: 'Priya Mehta', xp: 295, subjects: 'All subjects', isMe: false },
  { medal: '4️⃣', name: 'Dev Gupta', xp: 270, subjects: 'Math', isMe: false },
  { medal: '5️⃣', name: 'Meera Iyer', xp: 255, subjects: 'Science', isMe: false },
];

const PAST = [
  { icon: '🥇', title: 'Science — Food Chains', detail: 'Apr 6 · 1st place · +50 XP', good: true },
  { icon: '🥉', title: 'Math — Algebra Blitz', detail: 'Apr 3 · 3rd place · +20 XP', good: false },
  { icon: '🏅', title: 'English — Vocab Sprint', detail: 'Mar 31 · 5th place · +10 XP', good: false },
];

export const StudentCompeteScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { logout } = useAuthStore();
  const [joined, setJoined] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.slate50 }}>
      <StatusBar barStyle="light-content" />
      <AppHeader title="🏆 Class Challenges" subtitle="Compete with classmates · Earn XP"
        initials="AS" gradientColors={['#0F1F5C', '#1E3A8A']} onLogout={logout} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* XP progress */}
        <Card>
          <View style={styles.xpRow}>
            <View>
              <Text style={styles.xpTitle}>Aarav's XP</Text>
              <Text style={styles.xpSub}>Level 4 · Science Champion 🌿</Text>
            </View>
            <Text style={styles.xpValue}>340</Text>
          </View>
          <ProgressBar value={68} color={Colors.aria} height={8} />
          <Text style={styles.xpNext}>160 XP to Level 5</Text>
        </Card>

        {/* Active challenge */}
        <SectionHeader title="Active Challenge" />
        <View style={{backgroundColor: "#1E3A8A"}}>
          <View style={styles.liveRow}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE · Ends in 2 hours</Text>
          </View>
          <Text style={styles.challengeTitle}>Science Blitz — Chapter 9</Text>
          <Text style={styles.challengeSub}>10 questions · Top 3 win bonus XP · 18 students entered</Text>

          {/* Mini leaderboard */}
          <View style={styles.miniBoard}>
            {[['🥇', 'Aarav', '340'], ['🥈', 'Ananya', '310'], ['🥉', 'Priya', '295']].map(([m, n, p]) => (
              <View key={n} style={styles.miniEntry}>
                <Text style={{ fontSize: 20 }}>{m}</Text>
                <Text style={styles.miniName}>{n}</Text>
                <Text style={styles.miniPts}>{p} XP</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.joinBtn, joined && { backgroundColor: Colors.successSurface }]}
            onPress={() => { setJoined(true); navigation.navigate('Aria'); }}
            activeOpacity={0.85}
          >
            <Text style={[styles.joinBtnText, joined && { color: Colors.success }]}>
              {joined ? '✓ Joined — Open Aria to play' : 'Join Challenge with Aria ✨'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Full leaderboard */}
        <SectionHeader title="Class Leaderboard 🏆" />
        <Card>
          {LEADERBOARD.map(p => (
            <View key={p.name} style={[styles.lbRow, p.isMe && styles.lbRowMe]}>
              <Text style={{ fontSize: 22, width: 28 }}>{p.medal}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.lbName, p.isMe && { color: Colors.aria }]}>{p.name}{p.isMe ? ' (You)' : ''}</Text>
                <Text style={styles.lbSub}>{p.subjects}</Text>
              </View>
              <Text style={styles.lbXp}>{p.xp} XP</Text>
            </View>
          ))}
        </Card>

        {/* Past challenges */}
        <SectionHeader title="Your Past Challenges" />
        <Card>
          {PAST.map(c => (
            <ListRow
              key={c.title}
              icon={c.icon} iconBg={c.good ? Colors.warningSurface : Colors.ariaSurface}
              title={c.title} subtitle={c.detail}
            />
          ))}
        </Card>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: { paddingTop: 56, paddingHorizontal: 16, paddingBottom: 24 },
  title: { fontSize: 22, fontWeight: '900', color: '#fff', marginBottom: 4 },
  sub: { fontSize: 13, color: 'rgba(255,255,255,0.65)' },
  content: { padding: 16, paddingBottom: 100 },
  xpRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  xpTitle: { fontSize: 15, fontWeight: '700', color: Colors.slate800 },
  xpSub: { fontSize: 11, color: Colors.slate500, marginTop: 2 },
  xpValue: { fontSize: 28, fontWeight: '900', color: Colors.aria },
  xpNext: { fontSize: 10, color: Colors.slate400, marginTop: 4 },
  challengeCard: { borderRadius: 16, padding: 16, marginBottom: 10 },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#4ADE80' },
  liveText: { fontSize: 11, color: 'rgba(255,255,255,0.65)' },
  challengeTitle: { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 4 },
  challengeSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 14 },
  miniBoard: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  miniEntry: { flex: 1, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 10, padding: 10, alignItems: 'center' },
  miniName: { fontSize: 12, fontWeight: '700', color: '#fff', marginTop: 2 },
  miniPts: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 1 },
  joinBtn: { backgroundColor: '#fff', borderRadius: 10, padding: 13, alignItems: 'center' },
  joinBtnText: { fontSize: 14, fontWeight: '800', color: Colors.primary },
  lbRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: Colors.slate100, gap: 8 },
  lbRowMe: { backgroundColor: Colors.ariaSurface, marginHorizontal: -4, paddingHorizontal: 4, borderRadius: 8 },
  lbName: { fontSize: 14, fontWeight: '600', color: Colors.slate800 },
  lbSub: { fontSize: 11, color: Colors.slate500, marginTop: 1 },
  lbXp: { fontSize: 15, fontWeight: '800', color: Colors.aria },
});
