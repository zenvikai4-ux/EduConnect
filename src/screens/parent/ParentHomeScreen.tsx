import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, Linking, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../../store';
import { SCHOOL, FEE_RECORDS, ATTENDANCE_HISTORY, BUS_ROUTE, NOTIFICATIONS_LIST, SUBJECT_SCORES } from '../../data/demoData';

const C = { brand:'#1E3A8A', brandLight:'#EEF2FF', success:'#059669', successBg:'#D1FAE5', warning:'#D97706', warningBg:'#FEF3C7', danger:'#DC2626', dangerBg:'#FEE2E2', slate900:'#0F172A', slate700:'#334155', slate500:'#64748B', slate100:'#F1F5F9', white:'#FFFFFF' };

const CHILD = { name: 'Arjun Patel', class: '8A', roll: '8A-01', attendanceRate: 91, overallGrade: 'B+', overallPct: 82, rank: 3, xp: 1250, streak: 7 };
const pendingFee = FEE_RECORDS.find(f => f.status === 'pending');
const unread = NOTIFICATIONS_LIST.filter(n => !n.read).length;
const presentDays = ATTENDANCE_HISTORY.filter(d => d.status === 'present').length;

export const ParentHomeScreen: React.FC = () => {
  const { logout } = useStore();
  const nav = useNavigation<any>();

  const callSchool = () => Linking.openURL(`tel:${SCHOOL.phone}`);
  const whatsappSchool = () => Linking.openURL(`https://wa.me/91${SCHOOL.phone.replace(/\D/g,'')}`);

  return (
    <View style={{ flex: 1, backgroundColor: C.slate100 }}>
      <StatusBar barStyle="light-content" />
      <View style={s.header}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View>
            <Text style={s.headerLabel}>PARENT DASHBOARD</Text>
            <Text style={s.headerTitle}>Welcome back</Text>
            <Text style={s.headerSub}>{SCHOOL.name}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <TouchableOpacity style={s.notifBtn} onPress={() => nav.navigate('Notifications')} activeOpacity={0.8}>
              <Text style={{ fontSize: 18 }}>🔔</Text>
              {unread > 0 && <View style={s.notifDot}><Text style={{ fontSize: 9, color: C.white, fontWeight: '800' }}>{unread}</Text></View>}
            </TouchableOpacity>
            <TouchableOpacity style={s.logoutBtn} onPress={logout}>
              <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '700' }}>LOGOUT</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* CHILD OVERVIEW CARD */}
        <View style={s.childCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <View style={s.avatar}><Text style={{ fontSize: 22, fontWeight: '900', color: C.brand }}>{CHILD.name.split(' ').map(w=>w[0]).join('')}</Text></View>
            <View>
              <Text style={{ fontSize: 18, fontWeight: '900', color: C.slate900 }}>{CHILD.name}</Text>
              <Text style={{ fontSize: 12, color: C.slate500 }}>Class {CHILD.class} · Roll {CHILD.roll}</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
                <View style={{ backgroundColor: '#F59E0B20', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
                  <Text style={{ fontSize: 11, fontWeight: '800', color: '#D97706' }}>⭐ {CHILD.xp} XP · Lv5</Text>
                </View>
                <View style={{ backgroundColor: '#FEE2E220', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
                  <Text style={{ fontSize: 11, fontWeight: '800', color: '#DC2626' }}>🔥 {CHILD.streak}d streak</Text>
                </View>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {[
              { val: `${CHILD.attendanceRate}%`, label: 'Attendance', color: CHILD.attendanceRate >= 75 ? C.success : C.danger },
              { val: CHILD.overallGrade,         label: 'Grade',      color: C.brand   },
              { val: `#${CHILD.rank}`,           label: 'Class Rank', color: '#D97706' },
              { val: `${presentDays}d`,          label: 'Present',    color: C.success },
            ].map((st, i) => (
              <View key={i} style={s.statBox}>
                <Text style={[s.statVal, { color: st.color }]}>{st.val}</Text>
                <Text style={s.statLabel}>{st.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* FEE ALERT */}
        {pendingFee && (
          <TouchableOpacity style={s.feeAlert} onPress={() => nav.navigate('Fees')} activeOpacity={0.9}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '800', color: C.danger }}>⚠️ Fee Payment Due</Text>
              <Text style={{ fontSize: 12, color: C.danger + 'cc', marginTop: 2 }}>{pendingFee.term} · Due {new Date(pendingFee.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
            </View>
            <View>
              <Text style={{ fontSize: 22, fontWeight: '900', color: C.danger }}>₹{pendingFee.amount.toLocaleString()}</Text>
              <Text style={{ fontSize: 11, color: C.danger, textAlign: 'right', fontWeight: '700' }}>Pay Now →</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* QUICK NAV */}
        <View style={s.quickGrid}>
          {[
            { icon: '📅', label: 'Attendance',  screen: 'Attendance', color: C.brand,   bg: C.brandLight },
            { icon: '💰', label: 'Fees',         screen: 'Fees',       color: C.success, bg: C.successBg  },
            { icon: '🚌', label: 'Bus Tracking', screen: 'Bus',        color: '#D97706', bg: C.warningBg  },
            { icon: '📊', label: 'Performance',  screen: 'Progress',   color: '#7C3AED', bg: '#EDE9FE'    },
          ].map(item => (
            <TouchableOpacity key={item.screen} style={[s.quickItem, { backgroundColor: item.bg }]} onPress={() => nav.navigate(item.screen)} activeOpacity={0.85}>
              <Text style={{ fontSize: 30, marginBottom: 8 }}>{item.icon}</Text>
              <Text style={[s.quickLabel, { color: item.color }]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* SUBJECT PERFORMANCE SNAPSHOT */}
        <Text style={s.sectionTitle}>📊 Academic Performance</Text>
        <View style={s.card}>
          {SUBJECT_SCORES.map((sub, i) => (
            <View key={i} style={[{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 }, i < SUBJECT_SCORES.length - 1 && { borderBottomWidth: 0.5, borderColor: C.slate100 }]}>
              <Text style={{ fontSize: 20, width: 30 }}>{sub.icon}</Text>
              <Text style={{ flex: 1, fontSize: 13, fontWeight: '700', color: C.slate700 }}>{sub.subject}</Text>
              <View style={{ width: 100, height: 5, backgroundColor: C.slate100, borderRadius: 3, overflow: 'hidden', marginRight: 8 }}>
                <View style={{ width: `${sub.score}%`, height: 5, backgroundColor: sub.score >= 85 ? C.success : sub.score >= 70 ? C.warning : C.danger, borderRadius: 3 }} />
              </View>
              <Text style={{ fontSize: 13, fontWeight: '800', color: sub.score >= 85 ? C.success : sub.score >= 70 ? C.warning : C.danger, width: 40, textAlign: 'right' }}>{sub.score}%</Text>
            </View>
          ))}
        </View>

        {/* CONTACT SCHOOL */}
        <Text style={s.sectionTitle}>📞 Contact School</Text>
        <View style={s.card}>
          <Text style={{ fontSize: 14, fontWeight: '800', color: C.slate900, marginBottom: 4 }}>{SCHOOL.name}</Text>
          <Text style={{ fontSize: 12, color: C.slate500, marginBottom: 12 }}>{SCHOOL.address}</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity style={[s.contactBtn, { backgroundColor: C.brandLight }]} onPress={callSchool} activeOpacity={0.85}>
              <Text style={{ fontSize: 18 }}>📞</Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.brand }}>Call School</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.contactBtn, { backgroundColor: '#D1FAE5', flex: 1 }]} onPress={whatsappSchool} activeOpacity={0.85}>
              <Text style={{ fontSize: 18 }}>💬</Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.success }}>WhatsApp</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* RECENT NOTIFICATIONS */}
        <Text style={s.sectionTitle}>🔔 Recent Updates</Text>
        <View style={s.card}>
          {NOTIFICATIONS_LIST.slice(0, 3).map((n, i) => (
            <View key={n.id} style={[{ flexDirection: 'row', gap: 12, paddingVertical: 12 }, i < 2 && { borderBottomWidth: 0.5, borderColor: C.slate100 }]}>
              <View style={[s.notifIcon, { backgroundColor: n.color + '20' }]}>
                <Text style={{ fontSize: 18 }}>{n.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: C.slate900, flex: 1 }}>{n.title}</Text>
                  {!n.read && <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: C.danger, marginTop: 3, marginLeft: 6 }} />}
                </View>
                <Text style={{ fontSize: 12, color: C.slate500, marginTop: 2, lineHeight: 17 }} numberOfLines={2}>{n.msg}</Text>
                <Text style={{ fontSize: 10, color: C.slate500, marginTop: 4 }}>{n.time}</Text>
              </View>
            </View>
          ))}
          <TouchableOpacity onPress={() => nav.navigate('Notifications')} style={{ paddingTop: 12, alignItems: 'center' }}>
            <Text style={{ fontSize: 13, color: C.brand, fontWeight: '700' }}>See all notifications →</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  header: { backgroundColor: '#7C2D12', paddingTop: 52, paddingBottom: 20, paddingHorizontal: 18 },
  headerLabel: { fontSize: 10, color: 'rgba(255,255,255,0.55)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#fff', marginTop: 2 },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 2 },
  notifBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  notifDot: { position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: 8, backgroundColor: C.danger, alignItems: 'center', justifyContent: 'center' },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  scroll: { padding: 16, paddingBottom: 32 },
  childCard: { backgroundColor: C.white, borderRadius: 18, padding: 18, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 3 },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: C.brandLight, alignItems: 'center', justifyContent: 'center' },
  statBox: { flex: 1, alignItems: 'center', backgroundColor: C.slate100, borderRadius: 12, paddingVertical: 10 },
  statVal: { fontSize: 18, fontWeight: '900' },
  statLabel: { fontSize: 10, color: C.slate500, fontWeight: '600', marginTop: 2 },
  feeAlert: { backgroundColor: '#FEE2E2', borderRadius: 16, padding: 16, marginBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#FECACA' },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  quickItem: { width: '47%', borderRadius: 16, padding: 16, alignItems: 'center' },
  quickLabel: { fontSize: 12, fontWeight: '800' },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: C.slate900, marginBottom: 10 },
  card: { backgroundColor: C.white, borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  contactBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 12, paddingVertical: 12 },
  notifIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
