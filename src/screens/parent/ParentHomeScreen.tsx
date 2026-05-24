import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, Alert, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';
import { Card, ListRow, AlertBanner, Badge, SectionHeader, AriaCard, AppHeader } from '../../components/shared';
import { Colors } from '../../constants/theme';

export const ParentHomeScreen: React.FC = () => {
  const { logout } = useAuthStore();
  const navigation = useNavigation<any>();
  const [eta, setEta] = useState(4);
  const [busStatus, setBusStatus] = useState('En route');

  // Simulate live bus ETA countdown
  useEffect(() => {
    const t = setInterval(() => {
      setEta(e => {
        if (e <= 1) { setBusStatus('Arrived at stop'); return 0; }
        return e - 1;
      });
    }, 8000);
    return () => clearInterval(t);
  }, []);

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const callDriver = () => {
    Alert.alert('Call Driver', 'Call Ramu (+91 98765 00001)?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Call', onPress: () => Linking.openURL('tel:+919876500001') },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.slate50 }}>
      <StatusBar barStyle="light-content" />
      <AppHeader title="Good morning, Ramesh! 👋" subtitle={today}
        initials="RS" gradientColors={['#7C2D12', '#9A3412']} onLogout={logout}>
        <View style={styles.presentBadge}>
          <View style={styles.greenDot} />
          <Text style={styles.presentText}>Aarav present · 8:02 AM</Text>
        </View>
      </AppHeader>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <View style={styles.statsRow}>
          {[['91%', 'Attendance', Colors.success], ['B+', 'Overall Grade', Colors.primary], ['3', 'HW Pending', Colors.warning]].map(([v, l, c]) => (
            <View key={l} style={styles.stat}>
              <Text style={[styles.statVal, { color: c as string }]}>{v}</Text>
              <Text style={styles.statLbl}>{l}</Text>
            </View>
          ))}
        </View>

        {/* Aria Card */}
        <AriaCard studentName="Aarav" sessions={8} quizAvg="8/10" hwRate="75%"
          message="Aarav asked me about Photosynthesis today 🌿 Great curiosity! Science exam in 5 days — tap to see the weekly learning digest."
          onPress={() => navigation.navigate('Aria')} />

        {/* Alerts */}
        <AlertBanner icon="✅" title="Attendance Confirmed" message="Aarav marked present at 8:02 AM by Ms. Kavitha Rao" bg={Colors.successSurface} border="#BBF7D0" />
        <AlertBanner icon="📝" title="Science Exam — April 14" message="5 days away · Aria is helping Aarav prepare" bg={Colors.infoSurface} border="#BFDBFE" />
        <AlertBanner icon="⚠️" title="Fee Reminder — ₹12,500 due Apr 15" message="Tap the Fees tab to pay via UPI or Card" bg={Colors.warningSurface} border="#FDE68A" />

        {/* Homework */}
        <SectionHeader title="Homework Due" />
        <Card>
          <ListRow icon="📖" iconBg={Colors.dangerSurface} title="Science — Ch. 9 Reading" subtitle="Due tomorrow · Apr 10" right={<Badge text="Urgent" bg={Colors.dangerSurface} color={Colors.danger} />} />
          <ListRow icon="📐" iconBg={Colors.warningSurface} title="Math — Exercise 5.3" subtitle="Due Apr 11" right={<Badge text="Pending" bg={Colors.warningSurface} color={Colors.warning} />} />
          <ListRow icon="✅" iconBg={Colors.successSurface} title="English Essay Draft" subtitle="Submitted Apr 8" right={<Badge text="Done" bg={Colors.successSurface} color={Colors.success} />} />
        </Card>

        {/* Live Bus Tracking */}
        <SectionHeader title="🚌 Live Bus Tracking" />
        <Card>
          <View style={styles.busHeader}>
            <View style={[styles.busBadge, { backgroundColor: eta === 0 ? Colors.successSurface : Colors.warningSurface }]}>
              <View style={[styles.busLiveDot, { backgroundColor: eta === 0 ? Colors.success : Colors.warning }]} />
              <Text style={[styles.busLiveText, { color: eta === 0 ? Colors.success : Colors.warning }]}>
                {eta === 0 ? 'Arrived' : 'Live'}
              </Text>
            </View>
            <Text style={styles.busNumber}>Bus #12</Text>
          </View>

          <View style={styles.busMapPlaceholder}>
            <Text style={{ fontSize: 36 }}>🗺️</Text>
            <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.slate600, marginTop: 8 }}>
              {eta === 0 ? '✅ Bus at your stop!' : `Bus is ${eta} min away`}
            </Text>
            <Text style={{ fontSize: 11, color: Colors.slate400, marginTop: 2 }}>{busStatus}</Text>
          </View>

          <View style={styles.busDetails}>
            <View style={styles.busDetailItem}>
              <Text style={styles.busLabel}>Driver</Text>
              <Text style={styles.busVal}>Ramu Yadav</Text>
            </View>
            <View style={styles.busDetailItem}>
              <Text style={styles.busLabel}>Your Stop</Text>
              <Text style={styles.busVal}>Stop 3 · Jubilee Hills</Text>
            </View>
            <View style={styles.busDetailItem}>
              <Text style={styles.busLabel}>ETA</Text>
              <Text style={[styles.busVal, { color: eta === 0 ? Colors.success : Colors.warning }]}>
                {eta === 0 ? 'Here now' : `~${eta} mins`}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.callDriverBtn} onPress={callDriver}>
            <Text style={styles.callDriverText}>📞 Call Driver</Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  presentBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5, alignSelf: 'flex-start', marginTop: 10 },
  greenDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ADE80' },
  presentText: { fontSize: 12, color: '#fff', fontWeight: '600' },
  content: { padding: 16, paddingBottom: 100 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  stat: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 0.5, borderColor: Colors.slate200 },
  statVal: { fontSize: 20, fontWeight: '800' },
  statLbl: { fontSize: 10, color: Colors.slate500, marginTop: 2, textAlign: 'center' },
  busHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  busBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  busLiveDot: { width: 6, height: 6, borderRadius: 3 },
  busLiveText: { fontSize: 11, fontWeight: '700' },
  busNumber: { fontSize: 14, fontWeight: '700', color: Colors.slate700 },
  busMapPlaceholder: { height: 120, backgroundColor: '#E8F5E9', borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  busDetails: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  busDetailItem: { flex: 1 },
  busLabel: { fontSize: 10, fontWeight: '700', color: Colors.slate400, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  busVal: { fontSize: 12, fontWeight: '600', color: Colors.slate700 },
  callDriverBtn: { backgroundColor: Colors.primary, borderRadius: 10, padding: 12, alignItems: 'center' },
  callDriverText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
