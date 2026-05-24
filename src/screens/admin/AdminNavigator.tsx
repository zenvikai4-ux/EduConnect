import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, TextInput, Alert } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Card, ListRow, SectionHeader, ProgressBar, Badge, AlertBanner, Button, AppHeader } from '../../components/shared';
import { useAuthStore } from '../../store/authStore';
import { Colors } from '../../constants/theme';

const Tab = createBottomTabNavigator();
const Icon = ({ e, focused }: { e: string; focused: boolean }) => (
  <Text style={{ fontSize: focused ? 22 : 20, opacity: focused ? 1 : 0.5 }}>{e}</Text>
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SUPER ADMIN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const SADashScreen: React.FC = () => {
  const { logout } = useAuthStore();
  return (
    <View style={{ flex: 1, backgroundColor: Colors.slate50 }}>
      <StatusBar barStyle="light-content" />
      <View style={{backgroundColor: "#0F1F5C"}}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View><Text style={styles.title}>EduConnect HQ</Text><Text style={styles.sub}>3 schools · 847 students · Aria active</Text></View>
          <TouchableOpacity onPress={logout} style={styles.avBtn}><Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>SA</Text></TouchableOpacity>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statsRow}>
          {[['3', 'Schools', Colors.primary], ['847', 'Students', Colors.primary], ['412', 'Aria Users', Colors.aria]].map(([v, l, c]) => (
            <View key={l} style={styles.stat}><Text style={[styles.statVal, { color: c as string }]}>{v}</Text><Text style={styles.statLbl}>{l}</Text></View>
          ))}
        </View>
        <View style={styles.ariaInsight}>
          <View style={styles.ariaHdr}><View style={styles.ariaAv}><Text>✨</Text></View><Text style={styles.ariaTitle}>Aria Platform This Week</Text></View>
          <Text style={styles.ariaBody}>2,847 AI companion sessions across all schools. Science and Math are the most engaged subjects. Greenfield leads with 1,204 sessions.</Text>
        </View>
        <SectionHeader title="Managed Schools" action="+ Add School" />
        {[['Greenfield Academy', 'Hyderabad · CBSE · Premium', '🏛️', 312, '1,204'], ['Sunrise International', 'Bangalore · ICSE · Standard', '🌿', 289, '891'], ["St. Mary's School", 'Chennai · State · Trial', '⭐', 246, '—']].map(([n, d, i, s, ar]) => (
          <Card key={n as string}>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
              <View style={styles.schoolLogo}><Text style={{ fontSize: 22 }}>{i}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.slate800, marginBottom: 2 }}>{n}</Text>
                <Text style={{ fontSize: 11, color: Colors.slate500, marginBottom: 6 }}>📍 {d}</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Text style={{ fontSize: 14, fontWeight: '800', color: Colors.slate800 }}>{s} students</Text>
                  {ar !== '—' && <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.aria }}>· ✨ {ar} Aria sessions</Text>}
                </View>
              </View>
            </View>
          </Card>
        ))}
        <SectionHeader title="System Health" />
        <Card>
          {[['🟢', 'API Server', '99.9% uptime'], ['🟢', 'Groq AI (Aria)', '12ms avg · All regions'], ['🟡', 'SMS Gateway', 'Minor delays · 98.2%'], ['🟢', 'Push Notifications', 'FCM + APNs active']].map(([ic, n, d]) => (
            <View key={n as string} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 9, borderBottomWidth: 0.5, borderBottomColor: Colors.slate100 }}>
              <Text style={{ fontSize: 16 }}>{ic}</Text>
              <View style={{ flex: 1 }}><Text style={{ fontSize: 14, fontWeight: '600', color: Colors.slate800 }}>{n}</Text><Text style={{ fontSize: 11, color: Colors.slate500 }}>{d}</Text></View>
            </View>
          ))}
        </Card>
      </ScrollView>
    </View>
  );
};

export const SuperAdminNavigator: React.FC = () => (
  <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: Colors.primaryDark, tabBarInactiveTintColor: '#94A3B8', tabBarLabelStyle: { fontSize: 10, fontWeight: '600' }, tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#E2E8F0', paddingBottom: 6, height: 60 } }}>
    <Tab.Screen name="Dashboard" component={SADashScreen} options={{ tabBarIcon: ({ focused }) => <Icon e="🏠" focused={focused} /> }} />
    <Tab.Screen name="Schools" component={SADashScreen} options={{ tabBarIcon: ({ focused }) => <Icon e="🏫" focused={focused} /> }} />
    <Tab.Screen name="Users" component={SADashScreen} options={{ tabBarIcon: ({ focused }) => <Icon e="👥" focused={focused} /> }} />
    <Tab.Screen name="Settings" component={SADashScreen} options={{ tabBarIcon: ({ focused }) => <Icon e="⚙️" focused={focused} /> }} />
  </Tab.Navigator>
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ADMIN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const AdminHomeScreen: React.FC = () => {
  const { logout } = useAuthStore();
  return (
    <View style={{ flex: 1, backgroundColor: Colors.slate50 }}>
      <StatusBar barStyle="light-content" />
      <View style={{backgroundColor: "#059669"}}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View><Text style={styles.title}>Good morning, Ravi! 👋</Text><Text style={styles.sub}>Greenfield Academy · Thursday, April 9</Text></View>
          <TouchableOpacity onPress={logout} style={styles.avBtn}><Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>RS</Text></TouchableOpacity>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statsRow}>
          {[['294', 'Present', Colors.success], ['18', 'Absent', Colors.danger], ['228', 'Aria Active', Colors.aria]].map(([v, l, c]) => (
            <View key={l} style={styles.stat}><Text style={[styles.statVal, { color: c as string }]}>{v}</Text><Text style={styles.statLbl}>{l}</Text></View>
          ))}
        </View>
        <View style={styles.ariaInsight}>
          <View style={styles.ariaHdr}><View style={styles.ariaAv}><Text>✨</Text></View><Text style={styles.ariaTitle}>Aria Insight This Week</Text></View>
          <Text style={styles.ariaBody}>Photosynthesis is the top confusion topic across Class 8-A and 8-B. 34 students asked repeated questions about light reactions. Consider scheduling a revision session before Apr 14.</Text>
        </View>
        <View style={styles.qgrid}>
          {[['👥', 'Manage Users', 'Teachers & parents'], ['📚', 'Classes', '14 active'], ['💰', 'Fee Mgmt', '₹1.2L pending'], ['✨', 'Aria Stats', '228 active users']].map(([i, t, d]) => (
            <TouchableOpacity key={t as string} style={styles.qi}><Text style={{ fontSize: 24, marginBottom: 6 }}>{i}</Text><Text style={{ fontSize: 13, fontWeight: '700', color: Colors.slate800 }}>{t}</Text><Text style={{ fontSize: 11, color: Colors.slate500 }}>{d}</Text></TouchableOpacity>
          ))}
        </View>
        <SectionHeader title="Today's Absences" />
        <Card>
          <ListRow icon="👦" iconBg={Colors.dangerSurface} title="Arjun Sharma" subtitle="Class 8-A · Parent notified" right={<Badge text="Absent" bg={Colors.dangerSurface} color={Colors.danger} />} />
          <ListRow icon="👧" iconBg={Colors.dangerSurface} title="Priya Mehta" subtitle="Class 8-A · Parent notified" right={<Badge text="Absent" bg={Colors.dangerSurface} color={Colors.danger} />} />
          <ListRow icon="👦" iconBg={Colors.warningSurface} title="Rahul Verma" subtitle="Class 10-A · No response yet" right={<Badge text="Pending" bg={Colors.warningSurface} color={Colors.warning} />} />
        </Card>
        <SectionHeader title="Fee Collection — April" />
        <Card>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ fontSize: 12, color: Colors.slate500 }}>Collected: <Text style={{ fontWeight: '700', color: Colors.slate800 }}>₹3,84,000</Text></Text>
            <Text style={{ fontSize: 12, color: Colors.slate500 }}>Pending: <Text style={{ fontWeight: '700', color: Colors.danger }}>₹1,20,000</Text></Text>
          </View>
          <ProgressBar value={76} color={Colors.success} height={8} />
          <Text style={{ fontSize: 11, color: Colors.slate500, marginTop: 4 }}>76% collected · 24 defaulters</Text>
        </Card>
      </ScrollView>
    </View>
  );
};

const AdminBroadcastScreen: React.FC = () => {
  const [msg, setMsg] = useState('');
  const [sent, setSent] = useState(false);
  return (
    <View style={{ flex: 1, backgroundColor: Colors.slate50 }}>
      <StatusBar barStyle="light-content" />
      <View style={{backgroundColor: "#059669"}}>
        <Text style={styles.title}>Broadcast</Text>
        <Text style={styles.sub}>Send announcements to parents & teachers</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <Text style={{ fontSize: 10, fontWeight: '700', color: Colors.slate500, letterSpacing: 0.6, marginBottom: 12 }}>NEW ANNOUNCEMENT</Text>
          <TextInput style={[styles.formInput, { height: 80, textAlignVertical: 'top' }]} placeholder="Type announcement..." value={msg} onChangeText={setMsg} multiline />
          {!sent ? (
            <Button title="📢 Send to All Parents" onPress={() => { setSent(true); setMsg(''); setTimeout(() => setSent(false), 3000); }} color={Colors.success} />
          ) : (
            <View style={styles.savedBanner}><Text style={{ color: Colors.success, fontWeight: '700', fontSize: 13 }}>✅ Sent! 296 parents notified.</Text></View>
          )}
        </Card>
        <SectionHeader title="Recent Broadcasts" />
        {[['Term 2 Exams Begin April 14', 'Exams begin April 14. Timetable shared on the app.', '284/312 read', 91], ['Fee Reminder — Due April 15', 'Term 3 fees due April 15. Pay online or at school.', '201/296 read', 68]].map(([t, m, r, p]) => (
          <Card key={t as string}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.slate800, flex: 1 }}>{t}</Text>
              <Badge text="High" bg={Colors.warningSurface} color={Colors.warning} />
            </View>
            <Text style={{ fontSize: 12, color: Colors.slate600, marginBottom: 8 }}>{m}</Text>
            <Text style={{ fontSize: 11, color: Colors.slate500, marginBottom: 6 }}>{r}</Text>
            <ProgressBar value={p as number} color={Colors.primary} height={4} />
          </Card>
        ))}
      </ScrollView>
    </View>
  );
};

export const AdminNavigator: React.FC = () => (
  <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: Colors.success, tabBarInactiveTintColor: '#94A3B8', tabBarLabelStyle: { fontSize: 10, fontWeight: '600' }, tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#E2E8F0', paddingBottom: 6, height: 60 } }}>
    <Tab.Screen name="Home" component={AdminHomeScreen} options={{ tabBarIcon: ({ focused }) => <Icon e="🏠" focused={focused} /> }} />
    <Tab.Screen name="Users" component={AdminHomeScreen} options={{ tabBarIcon: ({ focused }) => <Icon e="👥" focused={focused} /> }} />
    <Tab.Screen name="Classes" component={AdminHomeScreen} options={{ tabBarIcon: ({ focused }) => <Icon e="📚" focused={focused} /> }} />
    <Tab.Screen name="Fees" component={AdminHomeScreen} options={{ tabBarIcon: ({ focused }) => <Icon e="💰" focused={focused} /> }} />
    <Tab.Screen name="Broadcast" component={AdminBroadcastScreen} options={{ tabBarIcon: ({ focused }) => <Icon e="📢" focused={focused} /> }} />
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  header: { paddingTop: 56, paddingHorizontal: 16, paddingBottom: 20 },
  title: { fontSize: 20, fontWeight: '900', color: '#fff', marginBottom: 4 },
  sub: { fontSize: 13, color: 'rgba(255,255,255,0.65)' },
  content: { padding: 16, paddingBottom: 100 },
  avBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  stat: { flex: 1, backgroundColor: '#fff', borderRadius: 10, padding: 12, alignItems: 'center', borderWidth: 0.5, borderColor: Colors.slate200 },
  statVal: { fontSize: 22, fontWeight: '800' },
  statLbl: { fontSize: 10, color: Colors.slate500, marginTop: 2 },
  ariaInsight: { backgroundColor: Colors.ariaSurface, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(124,58,237,0.15)' },
  ariaHdr: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  ariaAv: { width: 30, height: 30, borderRadius: 8, backgroundColor: Colors.aria, alignItems: 'center', justifyContent: 'center' },
  ariaTitle: { fontSize: 13, fontWeight: '700', color: Colors.ariaDark },
  ariaBody: { fontSize: 12, color: Colors.slate700, lineHeight: 18 },
  qgrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  qi: { width: '47.5%', backgroundColor: '#fff', borderRadius: 14, padding: 14, borderWidth: 0.5, borderColor: Colors.slate200 },
  schoolLogo: { width: 46, height: 46, borderRadius: 12, backgroundColor: Colors.ariaSurface, alignItems: 'center', justifyContent: 'center' },
  formInput: { borderWidth: 1, borderColor: Colors.slate200, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, marginBottom: 12 },
  savedBanner: { backgroundColor: Colors.successSurface, borderRadius: 10, padding: 12, alignItems: 'center' },
});
