import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  StatusBar, Switch, Alert, TextInput,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '../../store/authStore';
import { Colors, Radius, Spacing } from '../../constants/theme';
import { Card, SectionHeader, AppHeader } from '../../components/shared';

const Tab = createBottomTabNavigator();
const Icon = ({ e, focused }: { e: string; focused: boolean }) => (
  <Text style={{ fontSize: focused ? 22 : 20, opacity: focused ? 1 : 0.5 }}>{e}</Text>
);

// ─── STOPS ────────────────────────────────────────────────────────
const ROUTE_STOPS = [
  { id: 1, name: 'Greenfield Academy', time: '7:00 AM', type: 'school', students: 0 },
  { id: 2, name: 'Stop 1 · Banjara Hills', time: '7:22 AM', type: 'stop', students: 8 },
  { id: 3, name: 'Stop 2 · Madhapur', time: '7:35 AM', type: 'stop', students: 12 },
  { id: 4, name: 'Stop 3 · Jubilee Hills', time: '7:48 AM', type: 'stop', students: 6 },
  { id: 5, name: 'Stop 4 · Kondapur', time: '8:02 AM', type: 'stop', students: 9 },
  { id: 6, name: 'Stop 5 · Gachibowli', time: '8:15 AM', type: 'stop', students: 7 },
];

const STUDENTS_ON_BUS = [
  { id: 1, name: 'Aarav Sharma', stop: 'Jubilee Hills', grade: '8-A', boarded: false },
  { id: 2, name: 'Ananya Rao', stop: 'Banjara Hills', grade: '7-B', boarded: false },
  { id: 3, name: 'Priya Mehta', stop: 'Madhapur', grade: '9-A', boarded: false },
  { id: 4, name: 'Dev Gupta', stop: 'Kondapur', grade: '8-A', boarded: false },
  { id: 5, name: 'Meera Iyer', stop: 'Gachibowli', grade: '6-C', boarded: false },
  { id: 6, name: 'Riya Patel', stop: 'Jubilee Hills', grade: '7-A', boarded: false },
  { id: 7, name: 'Arjun Reddy', stop: 'Madhapur', grade: '10-B', boarded: false },
  { id: 8, name: 'Kavya Singh', stop: 'Banjara Hills', grade: '8-B', boarded: false },
];

// ─── LIVE TRACKING SCREEN ─────────────────────────────────────────
const DriverHomeScreen: React.FC = () => {
  const { user, logout } = useAuthStore();
  const [isOnDuty, setIsOnDuty] = useState(false);
  const [currentStop, setCurrentStop] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (isOnDuty) {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isOnDuty]);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h > 0 ? h + 'h ' : ''}${m}m ${sec}s`;
  };

  const handleDutyToggle = (val: boolean) => {
    if (val) {
      Alert.alert('Start Duty', 'Starting Bus #12 Route A. Parents will be notified.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Start', onPress: () => { setIsOnDuty(true); setElapsed(0); } },
      ]);
    } else {
      Alert.alert('End Duty', 'End your shift?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'End Shift', style: 'destructive', onPress: () => { setIsOnDuty(false); setCurrentStop(0); } },
      ]);
    }
  };

  const arrivedAtStop = () => {
    if (currentStop < ROUTE_STOPS.length - 1) {
      const next = ROUTE_STOPS[currentStop];
      Alert.alert(`✅ Arrived at ${next.name}`, `${next.students} students boarding here. Mark all boarded?`, [
        { text: 'Later' },
        { text: 'Mark Boarded', onPress: () => setCurrentStop(s => s + 1) },
      ]);
    }
  };

  const stop = ROUTE_STOPS[currentStop];
  const nextStop = ROUTE_STOPS[Math.min(currentStop + 1, ROUTE_STOPS.length - 1)];

  return (
    <View style={{ flex: 1, backgroundColor: Colors.slate50 }}>
      <StatusBar barStyle="light-content" />
      <View style={{backgroundColor: "#0F2027"}}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>🚌 Bus #12</Text>
            <Text style={styles.headerSub}>{(user as any)?.routeName || 'Route A · Jubilee Hills'}</Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '700' }}>Exit</Text>
          </TouchableOpacity>
        </View>

        {/* Duty Toggle */}
        <View style={styles.dutyCard}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>
              {isOnDuty ? '🟢 On Duty' : '🔴 Off Duty'}
            </Text>
            {isOnDuty && <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 }}>Duration: {formatTime(elapsed)}</Text>}
          </View>
          <Switch
            value={isOnDuty}
            onValueChange={handleDutyToggle}
            trackColor={{ false: '#555', true: '#4ADE80' }}
            thumbColor={isOnDuty ? '#fff' : '#aaa'}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {isOnDuty ? (
          <>
            {/* Current location */}
            <View style={styles.locationCard}>
              <Text style={styles.locationLabel}>CURRENT LOCATION</Text>
              <Text style={styles.locationName}>{stop.name}</Text>
              <Text style={styles.locationTime}>Expected: {stop.time}</Text>

              {currentStop < ROUTE_STOPS.length - 1 && (
                <>
                  <View style={styles.divider} />
                  <Text style={styles.locationLabel}>NEXT STOP</Text>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.slate700 }}>{nextStop.name}</Text>
                  <Text style={{ fontSize: 12, color: Colors.slate500 }}>{nextStop.time} · {nextStop.students} students</Text>
                  <TouchableOpacity style={styles.arrivedBtn} onPress={arrivedAtStop}>
                    <Text style={styles.arrivedBtnText}>✅ Arrived at Next Stop</Text>
                  </TouchableOpacity>
                </>
              )}
              {currentStop === ROUTE_STOPS.length - 1 && (
                <View style={{ marginTop: 12, backgroundColor: Colors.successSurface, borderRadius: 10, padding: 12 }}>
                  <Text style={{ color: Colors.success, fontWeight: '700', textAlign: 'center' }}>🏁 Route Complete!</Text>
                </View>
              )}
            </View>

            {/* Route progress */}
            <SectionHeader title="Route Progress" />
            <Card>
              {ROUTE_STOPS.map((s, i) => (
                <View key={s.id} style={styles.stopRow}>
                  <View style={[styles.stopDot, i < currentStop && styles.stopDone, i === currentStop && styles.stopCurrent]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.stopName, i < currentStop && { color: Colors.slate400 }]}>{s.name}</Text>
                    <Text style={styles.stopTime}>{s.time}{s.students > 0 ? ` · ${s.students} students` : ''}</Text>
                  </View>
                  {i < currentStop && <Text style={{ color: Colors.success, fontSize: 12, fontWeight: '700' }}>✓ Done</Text>}
                  {i === currentStop && <Text style={{ color: Colors.warning, fontSize: 12, fontWeight: '700' }}>● Now</Text>}
                </View>
              ))}
            </Card>

            {/* SOS */}
            <TouchableOpacity style={styles.sosBtn} onPress={() => Alert.alert('🚨 SOS Alert Sent', 'School admin and emergency services have been notified.')}>
              <Text style={styles.sosBtnText}>🚨 Emergency SOS</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.offDutyCard}>
            <Text style={{ fontSize: 40, marginBottom: 16 }}>🚌</Text>
            <Text style={{ fontSize: 18, fontWeight: '700', color: Colors.slate700, marginBottom: 8 }}>Ready to Start?</Text>
            <Text style={{ fontSize: 13, color: Colors.slate500, textAlign: 'center', marginBottom: 24 }}>
              Toggle duty above to begin Route A.{'\n'}Parents will receive real-time updates.
            </Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}><Text style={styles.infoKey}>Driver</Text><Text style={styles.infoVal}>{(user as any)?.name}</Text></View>
              <View style={styles.infoRow}><Text style={styles.infoKey}>Bus</Text><Text style={styles.infoVal}>Bus #12</Text></View>
              <View style={styles.infoRow}><Text style={styles.infoKey}>Route</Text><Text style={styles.infoVal}>Route A · Jubilee Hills</Text></View>
              <View style={styles.infoRow}><Text style={styles.infoKey}>Stops</Text><Text style={styles.infoVal}>5 stops · 42 students</Text></View>
              <View style={styles.infoRow}><Text style={styles.infoKey}>Start Time</Text><Text style={styles.infoVal}>7:00 AM</Text></View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

// ─── ATTENDANCE SCREEN ────────────────────────────────────────────
const DriverAttendanceScreen: React.FC = () => {
  const { logout } = useAuthStore();
  const [boarded, setBoarded] = useState<Record<number, boolean>>({});
  const [search, setSearch] = useState('');

  const toggle = (id: number) => setBoarded(prev => ({ ...prev, [id]: !prev[id] }));
  const boardedCount = Object.values(boarded).filter(Boolean).length;

  const filtered = STUDENTS_ON_BUS.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.stop.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={{ flex: 1, backgroundColor: Colors.slate50 }}>
      <StatusBar barStyle="light-content" />
      <AppHeader title="Student Attendance" subtitle={`${boardedCount}/${STUDENTS_ON_BUS.length} boarded`}
        initials="RY" gradientColors={['#0F2027', '#203A43']} onLogout={logout} />

      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search student or stop..."
          placeholderTextColor={Colors.slate400}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
        <View style={styles.attendanceSummary}>
          {[['Boarded', boardedCount, Colors.success], ['Pending', STUDENTS_ON_BUS.length - boardedCount, Colors.warning], ['Total', STUDENTS_ON_BUS.length, Colors.primary]].map(([l, v, c]) => (
            <View key={l as string} style={styles.summaryBox}>
              <Text style={[styles.summaryVal, { color: c as string }]}>{v}</Text>
              <Text style={styles.summaryLbl}>{l}</Text>
            </View>
          ))}
        </View>

        {filtered.map(student => (
          <TouchableOpacity key={student.id} onPress={() => toggle(student.id)} style={styles.studentCard} activeOpacity={0.8}>
            <View style={[styles.studentAvatar, boarded[student.id] && { backgroundColor: Colors.successSurface }]}>
              <Text style={{ fontSize: 18 }}>{boarded[student.id] ? '✅' : '👤'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.studentName}>{student.name}</Text>
              <Text style={styles.studentDetail}>Stop: {student.stop} · Class {student.grade}</Text>
            </View>
            <View style={[styles.boardedBadge, boarded[student.id] && styles.boardedBadgeActive]}>
              <Text style={[styles.boardedText, boarded[student.id] && { color: Colors.success }]}>
                {boarded[student.id] ? 'Boarded' : 'Pending'}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.submitBtn}
          onPress={() => Alert.alert('Attendance Submitted', `${boardedCount} students marked as boarded. School notified.`)}>
          <Text style={styles.submitBtnText}>Submit Attendance to School</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

// ─── ALERTS SCREEN ───────────────────────────────────────────────
const DriverAlertsScreen: React.FC = () => {
  const { logout } = useAuthStore();
  const ALERTS = [
    { icon: '📍', title: 'Route Deviation Detected', msg: 'You moved off Route A near Kondapur. Stay on designated path.', time: '8:03 AM', type: 'warning' },
    { icon: '📞', title: 'Parent Call Request', msg: 'Ramesh Sharma (Aarav - Stop 3) wants to know ETA.', time: '7:55 AM', type: 'info' },
    { icon: '✅', title: 'Stop 2 Confirmed', msg: 'Madhapur stop completed. 12 students boarded.', time: '7:35 AM', type: 'success' },
    { icon: '⚠️', title: 'Student Absent', msg: 'Kavya Singh (Stop 1) not boarded. Parent notified.', time: '7:22 AM', type: 'warning' },
    { icon: '🚦', title: 'Traffic Delay', msg: 'Heavy traffic near Banjara Hills. ETA updated for all parents.', time: '7:18 AM', type: 'info' },
  ];

  const colors: Record<string, string> = { warning: Colors.warningSurface, info: Colors.infoSurface, success: Colors.successSurface };
  const borders: Record<string, string> = { warning: '#FDE68A', info: '#BFDBFE', success: '#BBF7D0' };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.slate50 }}>
      <StatusBar barStyle="light-content" />
      <AppHeader title="Alerts & Notifications" subtitle="Today's route updates"
        initials="RY" gradientColors={['#0F2027', '#203A43']} onLogout={logout} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
        {ALERTS.map((a, i) => (
          <View key={i} style={[styles.alertCard, { backgroundColor: colors[a.type], borderColor: borders[a.type] }]}>
            <Text style={{ fontSize: 20, marginRight: 10 }}>{a.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.slate800, marginBottom: 2 }}>{a.title}</Text>
              <Text style={{ fontSize: 12, color: Colors.slate600, lineHeight: 18 }}>{a.msg}</Text>
              <Text style={{ fontSize: 10, color: Colors.slate400, marginTop: 4 }}>{a.time}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

// ─── NAVIGATOR ────────────────────────────────────────────────────
export const DriverNavigator: React.FC = () => (
  <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: '#203A43', tabBarInactiveTintColor: '#94A3B8', tabBarLabelStyle: { fontSize: 10, fontWeight: '600' }, tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#E2E8F0', paddingBottom: 6, height: 60 } }}>
    <Tab.Screen name="Route" component={DriverHomeScreen} options={{ tabBarIcon: ({ focused }) => <Icon e="🗺️" focused={focused} />, tabBarLabel: 'Live Route' }} />
    <Tab.Screen name="Attendance" component={DriverAttendanceScreen} options={{ tabBarIcon: ({ focused }) => <Icon e="✅" focused={focused} />, tabBarLabel: 'Attendance' }} />
    <Tab.Screen name="Alerts" component={DriverAlertsScreen} options={{ tabBarIcon: ({ focused }) => <Icon e="🔔" focused={focused} />, tabBarLabel: 'Alerts' }} />
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  header: { paddingTop: 56, paddingHorizontal: 16, paddingBottom: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#fff' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  dutyCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  content: { padding: 16, paddingBottom: 100 },
  locationCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 0.5, borderColor: Colors.slate200 },
  locationLabel: { fontSize: 10, fontWeight: '700', color: Colors.slate400, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4 },
  locationName: { fontSize: 18, fontWeight: '800', color: Colors.slate800, marginBottom: 2 },
  locationTime: { fontSize: 12, color: Colors.slate500, marginBottom: 12 },
  divider: { height: 0.5, backgroundColor: Colors.slate200, marginVertical: 12 },
  arrivedBtn: { backgroundColor: Colors.success, borderRadius: 10, padding: 12, alignItems: 'center', marginTop: 14 },
  arrivedBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  stopRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: Colors.slate100 },
  stopDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.slate200, borderWidth: 2, borderColor: Colors.slate300 },
  stopDone: { backgroundColor: Colors.successSurface, borderColor: Colors.success },
  stopCurrent: { backgroundColor: Colors.warning, borderColor: Colors.warning },
  stopName: { fontSize: 14, fontWeight: '600', color: Colors.slate700 },
  stopTime: { fontSize: 11, color: Colors.slate400, marginTop: 1 },
  sosBtn: { backgroundColor: '#DC2626', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8 },
  sosBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  offDutyCard: { alignItems: 'center', padding: 32 },
  infoCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, width: '100%', borderWidth: 0.5, borderColor: Colors.slate200 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: Colors.slate100 },
  infoKey: { fontSize: 13, color: Colors.slate500 },
  infoVal: { fontSize: 13, fontWeight: '600', color: Colors.slate800 },
  searchBar: { padding: 12, backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: Colors.slate200 },
  searchInput: { backgroundColor: Colors.slate50, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: Colors.slate800, borderWidth: 1, borderColor: Colors.slate200 },
  attendanceSummary: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  summaryBox: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 0.5, borderColor: Colors.slate200 },
  summaryVal: { fontSize: 24, fontWeight: '800', marginBottom: 2 },
  summaryLbl: { fontSize: 11, color: Colors.slate500 },
  studentCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 0.5, borderColor: Colors.slate200 },
  studentAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.slate100, alignItems: 'center', justifyContent: 'center' },
  studentName: { fontSize: 14, fontWeight: '600', color: Colors.slate800, marginBottom: 2 },
  studentDetail: { fontSize: 11, color: Colors.slate500 },
  boardedBadge: { backgroundColor: Colors.slate100, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  boardedBadgeActive: { backgroundColor: Colors.successSurface },
  boardedText: { fontSize: 11, fontWeight: '700', color: Colors.slate400 },
  submitBtn: { backgroundColor: '#0F2027', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8 },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  alertCard: { flexDirection: 'row', alignItems: 'flex-start', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1 },
});
