import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import { Card, SectionHeader, ProgressBar, AppHeader } from '../../components/shared';
import { Colors } from '../../constants/theme';
import { generateParentDigest } from '../../services/groqService';
import { useAuthStore } from '../../store/authStore';

const STATS = [
  ['💬 Aria Sessions', '8 conversations'],
  ['🧠 Quiz Average', '8.2 / 10'],
  ['📚 HW Completion', '75% on time'],
  ['⏱️ Study Time', '~42 minutes'],
  ['🌿 Top Subject', 'Science (Photosynthesis)'],
  ['⚠️ Needs Work', 'Hindi (no sessions)'],
];

export const ParentAriaScreen: React.FC = () => {
  const { logout } = useAuthStore();
  const [digest, setDigest] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadDigest = async () => {
    setLoading(true);
    const text = await generateParentDigest({
      studentName: 'Aarav', grade: '8',
      sessions: 8,
      topics: ['Photosynthesis', 'Quadratic equations', 'Essay writing'],
      quizAvg: 8.2, hwRate: 75,
      topSubject: 'Science', weakSubject: 'Hindi',
      attendance: '5/5 days',
    });
    setDigest(text);
    setLoading(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.slate50 }}>
      <StatusBar barStyle="light-content" />
      <AppHeader title="Aria — Aarav's Companion" subtitle="Weekly insights & digest"
        initials="RS" gradientColors={['#4C1D95', '#6D28D9']} onLogout={logout} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Weekly digest card */}
        <View style={styles.digestCard}>
          <View style={styles.digestHdr}>
            <View style={styles.av}><Text style={{ fontSize: 18 }}>✨</Text></View>
            <View>
              <Text style={styles.digestTitle}>Aria's Weekly Digest</Text>
              <Text style={styles.digestSub}>Week of Apr 7–13, 2026 · Aarav Sharma</Text>
            </View>
          </View>
          {loading && (
            <View style={{ alignItems: 'center', padding: 20 }}>
              <ActivityIndicator color={Colors.aria} />
              <Text style={{ color: Colors.aria, fontWeight: '600', marginTop: 8, fontSize: 13 }}>
                {'Aria is writing the digest...'}
              </Text>
            </View>
          )}
          {!loading && digest && (
            <Text style={styles.digestBody}>{digest}</Text>
          )}
          {!loading && !digest && (
            <TouchableOpacity style={styles.genBtn} onPress={loadDigest}>
              <Text style={styles.genBtnText}>Generate This Week's Digest ✨</Text>
            </TouchableOpacity>
          )}
          {!loading && digest && (
            <TouchableOpacity style={[styles.genBtn, { backgroundColor: Colors.ariaSurface, marginTop: 12 }]} onPress={loadDigest}>
              <Text style={[styles.genBtnText, { color: Colors.aria }]}>Regenerate</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* This week's stats */}
        <SectionHeader title="This Week's Numbers" />
        <Card>
          {STATS.map(([k, v]) => (
            <View key={k} style={styles.statRow}>
              <Text style={styles.statKey}>{k}</Text>
              <Text style={styles.statVal}>{v}</Text>
            </View>
          ))}
        </Card>

        {/* Subject engagement */}
        <SectionHeader title="Subject Engagement" />
        <Card>
          {[['Science', 89, Colors.aria], ['Math', 72, Colors.primary], ['English', 58, Colors.success], ['Hindi', 12, Colors.danger]].map(([s, p, c]) => (
            <View key={s as string} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ fontSize: 14, color: Colors.slate700 }}>{s}</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: c as string }}>{p}%</Text>
              </View>
              <ProgressBar value={p as number} color={c as string} height={6} />
            </View>
          ))}
        </Card>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: { paddingTop: 56, paddingHorizontal: 16, paddingBottom: 24 },
  title: { fontSize: 20, fontWeight: '900', color: '#fff', marginBottom: 4 },
  sub: { fontSize: 13, color: 'rgba(255,255,255,0.65)' },
  content: { padding: 16, paddingBottom: 100 },
  digestCard: { backgroundColor: '#F5F3FF', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(124,58,237,0.2)' },
  digestHdr: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  av: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.aria, alignItems: 'center', justifyContent: 'center' },
  digestTitle: { fontSize: 14, fontWeight: '700', color: Colors.ariaDark },
  digestSub: { fontSize: 11, color: Colors.aria },
  digestBody: { fontSize: 13, color: Colors.slate700, lineHeight: 22 },
  genBtn: { backgroundColor: Colors.aria, borderRadius: 10, padding: 12, alignItems: 'center' },
  genBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 9, borderBottomWidth: 0.5, borderBottomColor: Colors.slate100 },
  statKey: { fontSize: 13, color: Colors.slate700 },
  statVal: { fontSize: 13, fontWeight: '700', color: Colors.aria },
});
