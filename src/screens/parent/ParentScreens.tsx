import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, TextInput } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { Card, ListRow, SectionHeader, ProgressBar, Badge, AppHeader } from '../../components/shared';
import { Colors } from '../../constants/theme';

// ─── PROGRESS ────────────────────────────────────────────────────
export const ParentProgressScreen: React.FC = () => {
  const { logout } = useAuthStore();
  return (
    <View style={{ flex: 1, backgroundColor: Colors.slate50 }}>
      <StatusBar barStyle="light-content" />
      <AppHeader title="Aarav's Progress" subtitle="Term 1 · Greenfield Academy"
        initials="RS" gradientColors={['#7C2D12', '#9A3412']} onLogout={logout} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.overviewCard}>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, marginBottom: 4 }}>Overall Grade — Term 1</Text>
          <Text style={{ color: '#fff', fontSize: 32, fontWeight: '800', marginBottom: 4 }}>
            B+ <Text style={{ fontSize: 18, opacity: 0.8 }}>82%</Text>
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11 }}>Class rank: 12 of 34 · Trend: ↑ Improving</Text>
        </View>
        <SectionHeader title="Subject Performance" />
        <Card>
          {[
            ['🌿', 'Science', 'A', 91, Colors.aria],
            ['📖', 'English', 'B+', 88, Colors.primary],
            ['📐', 'Mathematics', 'B', 79, Colors.success],
            ['🗺️', 'Social Studies', 'B-', 74, Colors.warning],
            ['📝', 'Hindi', 'C+', 68, Colors.danger],
          ].map(([ic, s, g, p, c]) => (
            <View key={s as string} style={{ marginBottom: 14 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                <Text style={{ fontSize: 14, color: Colors.slate700 }}>{ic} {s}</Text>
                <Text style={{ fontSize: 14, fontWeight: '800', color: c as string }}>{g} — {p}%</Text>
              </View>
              <ProgressBar value={p as number} color={c as string} height={6} />
            </View>
          ))}
        </Card>
        <SectionHeader title="Achievements 🏆" />
        <Card>
          <ListRow icon="🥇" iconBg={Colors.warningSurface} title="Science Quiz — 1st Place" subtitle="March 2026 · School level" />
          <ListRow icon="📚" iconBg={Colors.successSurface} title="100% Homework — January" subtitle="Perfect submission streak" />
        </Card>
      </ScrollView>
    </View>
  );
};

// ─── FEES ─────────────────────────────────────────────────────────
export const ParentFeesScreen: React.FC = () => {
  const [paid, setPaid] = useState(false);
  const { logout } = useAuthStore();
  return (
    <View style={{ flex: 1, backgroundColor: Colors.slate50 }}>
      <StatusBar barStyle="light-content" />
      <AppHeader title="Fee Payment" subtitle="Outstanding Balance · ₹12,500"
        initials="RS" gradientColors={['#7C2D12', '#9A3412']} onLogout={logout} />
      <View style={{backgroundColor: "#7C2D12"}}>
        <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11, marginBottom: 4 }}>Due April 15, 2026</Text>
        <Text style={{ color: '#fff', fontSize: 32, fontWeight: '900', marginBottom: 12 }}>₹12,500</Text>
        {!paid ? (
          <TouchableOpacity style={styles.payBtn} onPress={() => setPaid(true)}>
            <Text style={styles.payBtnText}>Pay ₹12,500 via UPI / Card →</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.paidBadge}>
            <Text style={{ color: Colors.success, fontWeight: '700', fontSize: 13 }}>✅ Payment Successful!</Text>
          </View>
        )}
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SectionHeader title="Payment History" />
        <Card>
          <ListRow icon="💳" iconBg={Colors.successSurface} title="Term 1 Tuition"
            subtitle="₹12,500 · UPI · Jan 3, 2026" right={<Badge text="Paid" bg={Colors.successSurface} color={Colors.success} />} />
          <ListRow icon="💳" iconBg={Colors.successSurface} title="Activities Fee"
            subtitle="₹5,000 · Card · Apr 10, 2025" right={<Badge text="Paid" bg={Colors.successSurface} color={Colors.success} />} />
          <ListRow icon="💳" iconBg={Colors.successSurface} title="Transport Fee"
            subtitle="₹8,000 · Cash · Apr 8, 2025" right={<Badge text="Paid" bg={Colors.successSurface} color={Colors.success} />} />
        </Card>
      </ScrollView>
    </View>
  );
};

// ─── MESSAGES ─────────────────────────────────────────────────────
const INIT_MSGS = [
  { from: 'other', text: 'Quick question — can you clarify the Science project topic for Aarav?', time: '2:30 PM' },
  { from: 'me', text: 'Hi! The topic is Ecosystems. Focus on food chains and energy flow.', time: '3:15 PM' },
  { from: 'other', text: 'Thank you so much! He will work on it this weekend.', time: '3:20 PM' },
];

export const ParentMessagesScreen: React.FC = () => {
  const [msgs, setMsgs] = useState(INIT_MSGS);
  const [input, setInput] = useState('');
  const { logout } = useAuthStore();
  const now = () => new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const send = () => {
    if (!input.trim()) return;
    const newMsg = { from: 'me', text: input.trim(), time: now() };
    setMsgs(prev => [...prev, newMsg]);
    setInput('');
    setTimeout(() => {
      setMsgs(prev => [...prev, { from: 'other', text: 'Thank you for reaching out! I will follow up shortly.', time: now() }]);
    }, 1200);
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.slate50 }}>
      <StatusBar barStyle="light-content" />
      <AppHeader title="Ms. Kavitha Rao" subtitle="Class Teacher · Science · Online"
        initials="KR" gradientColors={['#7C2D12', '#9A3412']} onLogout={logout} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 8 }} showsVerticalScrollIndicator={false}>
        {msgs.map((m, i) => (
          <View key={i} style={[styles.bubble, m.from === 'me' ? styles.bubbleMe : styles.bubbleOther]}>
            <Text style={{ fontSize: 13, color: m.from === 'me' ? '#fff' : Colors.slate800 }}>{m.text}</Text>
            <Text style={{ fontSize: 9, opacity: 0.5, marginTop: 4, textAlign: m.from === 'me' ? 'right' : 'left' }}>{m.time}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.inputBar}>
        <TextInput style={styles.textInput} placeholder="Type a message..."
          value={input} onChangeText={setInput} onSubmitEditing={send} />
        <TouchableOpacity style={styles.sendBtn} onPress={send}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 100 },
  overviewCard: { backgroundColor: '#7C2D12', borderRadius: 16, padding: 16, marginBottom: 12 },
  payBtn: { backgroundColor: '#fff', borderRadius: 10, padding: 13, alignItems: 'center' },
  payBtnText: { fontSize: 14, fontWeight: '800', color: '#7C2D12' },
  paidBadge: { backgroundColor: Colors.successSurface, borderRadius: 10, padding: 12, alignItems: 'center' },
  bubble: { maxWidth: '80%', padding: 12, borderRadius: 14, marginBottom: 8 },
  bubbleMe: { backgroundColor: Colors.primary, alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: '#fff', borderWidth: 0.5, borderColor: Colors.slate200, alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  inputBar: { flexDirection: 'row', gap: 8, padding: 10, paddingBottom: 24, backgroundColor: '#fff', borderTopWidth: 0.5, borderTopColor: Colors.slate200, alignItems: 'center' },
  textInput: { flex: 1, borderWidth: 1, borderColor: Colors.slate200, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, fontSize: 14 },
  sendBtn: { backgroundColor: Colors.primary, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
});
