import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, TextInput, Alert, Linking } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useStore } from '../../store';
import { SCHOOL, CLASS_PERFORMANCE, WEEKLY_ATTENDANCE, SUPPORT_TICKETS, ALL_FEE_RECORDS, NOTIFICATIONS_LIST } from '../../data/demoData';

const Tab = createBottomTabNavigator();
const ADMIN_FEE_SUMMARY = { totalCollected: 4189200, totalExpected: 5244000, pending: 1054800, overdueCount: 23, paidCount: 261, pendingCount: 23, collectionRate: 79.9 };
const C = { brand:'#1E3A8A', brandLight:'#EEF2FF', success:'#059669', successBg:'#D1FAE5', warning:'#D97706', warningBg:'#FEF3C7', danger:'#DC2626', dangerBg:'#FEE2E2', purple:'#7C3AED', slate900:'#0F172A', slate700:'#334155', slate500:'#64748B', slate200:'#E2E8F0', slate100:'#F1F5F9', white:'#FFFFFF' };

const SH = ({ title, sub }: any) => (
  <View style={{ marginBottom: 10, marginTop: 4 }}>
    <Text style={s.sectionTitle}>{title}</Text>
    {sub && <Text style={{ fontSize: 11, color: C.slate500, marginTop: 1 }}>{sub}</Text>}
  </View>
);

const Hdr = ({ color, title, sub, onLogout }: any) => (
  <View style={[s.header, { backgroundColor: color }]}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <View>
        <Text style={s.headerLabel}>SCHOOL ADMIN</Text>
        <Text style={s.headerTitle}>{title}</Text>
        {sub && <Text style={s.headerSub}>{sub}</Text>}
      </View>
      <TouchableOpacity style={s.logoutBtn} onPress={onLogout}>
        <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '700' }}>LOGOUT</Text>
      </TouchableOpacity>
    </View>
  </View>
);

// ─── DASHBOARD ───────────────────────────────────────────────────
const DashScreen: React.FC = () => {
  const { user, logout } = useStore();
  const openTickets = SUPPORT_TICKETS.filter(t => t.status === 'open').length;

  const sendWhatsApp = (msg: string) => {
    Linking.openURL(`whatsapp://send?text=${encodeURIComponent(msg)}`).catch(() =>
      Alert.alert('WhatsApp not found', 'Please install WhatsApp to send messages.')
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.slate100 }}>
      <StatusBar barStyle="light-content" />
      <Hdr color={C.success} title={user?.name ?? 'Rajesh Kumar'} sub={SCHOOL.name} onLogout={logout} />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* KPIs */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
          {[
            { icon: '👥', val: SCHOOL.totalStudents, label: 'Students',    color: C.brand   },
            { icon: '👩‍🏫', val: SCHOOL.totalTeachers,  label: 'Teachers',   color: C.purple  },
            { icon: '📅', val: '87%',                 label: 'Attendance', color: C.success },
            { icon: '💰', val: '₹41.9L',              label: 'Collected',  color: '#D97706' },
            { icon: '🎫', val: openTickets,            label: 'Open Tickets', color: C.danger  },
            { icon: '📚', val: SCHOOL.totalClasses,   label: 'Classes',    color: C.purple  },
          ].map((kpi, i) => (
            <View key={i} style={s.kpiBox}>
              <Text style={{ fontSize: 20 }}>{kpi.icon}</Text>
              <Text style={[s.kpiVal, { color: kpi.color }]}>{kpi.val}</Text>
              <Text style={s.kpiLabel}>{kpi.label}</Text>
            </View>
          ))}
        </View>

        {/* Fee collection summary */}
        <SH title="💰 Fee Collection — Term 2" />
        <View style={s.card}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            <View>
              <Text style={{ fontSize: 12, color: C.slate500 }}>Total Collected</Text>
              <Text style={{ fontSize: 26, fontWeight: '900', color: C.success }}>₹{(ADMIN_FEE_SUMMARY.totalCollected / 100000).toFixed(1)}L</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 12, color: C.slate500 }}>Outstanding</Text>
              <Text style={{ fontSize: 26, fontWeight: '900', color: C.danger }}>₹{(ADMIN_FEE_SUMMARY.pending / 100000).toFixed(1)}L</Text>
            </View>
          </View>
          <View style={{ height: 8, backgroundColor: C.slate100, borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
            <View style={{ width: `${ADMIN_FEE_SUMMARY.collectionRate}%`, height: 8, backgroundColor: C.success, borderRadius: 4 }} />
          </View>
          <Text style={{ fontSize: 12, color: C.slate500 }}>{ADMIN_FEE_SUMMARY.collectionRate}% collected · {ADMIN_FEE_SUMMARY.overdueCount} students overdue</Text>
        </View>

        {/* Weekly attendance */}
        <SH title="📅 This Week's Attendance" />
        <View style={s.card}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            {WEEKLY_ATTENDANCE.map((day, i) => {
              const pct = Math.round((day.present / day.total) * 100);
              return (
                <View key={i} style={{ alignItems: 'center', flex: 1 }}>
                  <Text style={{ fontSize: 11, fontWeight: '800', color: pct >= 90 ? C.success : pct >= 75 ? C.warning : C.danger, marginBottom: 4 }}>{pct}%</Text>
                  <View style={{ width: 28, backgroundColor: C.slate100, borderRadius: 4, overflow: 'hidden', height: 60, justifyContent: 'flex-end' }}>
                    <View style={{ width: 28, height: pct * 0.6, backgroundColor: pct >= 90 ? C.success : pct >= 75 ? C.warning : C.danger, borderRadius: 4 }} />
                  </View>
                  <Text style={{ fontSize: 11, color: C.slate500, fontWeight: '600', marginTop: 4 }}>{day.day}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Class performance */}
        <SH title="🏆 Class Performance Ranking" />
        <View style={s.card}>
          {CLASS_PERFORMANCE.map((cls, i) => (
            <View key={i} style={[{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 }, i < CLASS_PERFORMANCE.length - 1 && { borderBottomWidth: 0.5, borderColor: C.slate100 }]}>
              <Text style={{ fontSize: 16, width: 28, fontWeight: '800', color: i < 3 ? ['#F59E0B','#94A3B8','#B45309'][i] : C.slate500 }}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`}
              </Text>
              <Text style={{ flex: 1, fontSize: 14, fontWeight: '700', color: C.slate900 }}>Class {cls.class}</Text>
              <View style={{ width: 80, height: 5, backgroundColor: C.slate100, borderRadius: 3, overflow: 'hidden', marginRight: 8 }}>
                <View style={{ width: `${cls.avg}%`, height: 5, backgroundColor: cls.avg >= 80 ? C.success : cls.avg >= 70 ? C.warning : C.danger, borderRadius: 3 }} />
              </View>
              <Text style={{ fontSize: 13, fontWeight: '900', color: cls.avg >= 80 ? C.success : cls.avg >= 70 ? C.warning : C.danger, width: 36, textAlign: 'right' }}>{cls.avg}%</Text>
              <Text style={{ fontSize: 11, color: cls.trend > 0 ? C.success : C.danger, fontWeight: '700', width: 32 }}>{cls.trend > 0 ? `▲${cls.trend}` : `▼${Math.abs(cls.trend)}`}</Text>
            </View>
          ))}
        </View>

        {/* Quick WhatsApp broadcasts */}
        <SH title="💬 Quick WhatsApp Broadcasts" sub="Tap to open WhatsApp with pre-filled message" />
        <View style={s.card}>
          {[
            { label: '📅 Daily Attendance Summary', msg: `Greenfield International School\n📊 Attendance Summary — ${new Date().toLocaleDateString('en-IN')}\n✅ Present: 247/284 (87%)\n❌ Absent: 37 students\n\nFor details, check EduSpark app.` },
            { label: '💸 Fee Payment Reminder',     msg: `Dear Parent,\n\nTerm 2 fee of ₹18,500 is due by June 15, 2026.\n\nPay via UPI: greenfield.school@okaxis\n\nFor queries: 080-41234567\n\n— Greenfield International School` },
            { label: '📝 Exam Schedule Alert',      msg: `Greenfield International School\n📝 EXAM SCHEDULE — Term 2\n\nJune 10 — Science\nJune 11 — Mathematics\nJune 12 — English\nJune 13 — Social Studies\nJune 14 — Hindi\n\nBest wishes to all students! 🙏` },
            { label: '🏖️ Holiday Notice',           msg: `Greenfield International School\n\n🏖️ HOLIDAY NOTICE\n\nDear Parents,\nSchool will remain CLOSED on [Date] due to [Reason].\n\nClasses resume on [Date].\n\nRegards,\nAdmin Team` },
          ].map((item, i) => (
            <TouchableOpacity key={i} style={[{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13 }, i < 3 && { borderBottomWidth: 0.5, borderColor: C.slate100 }]}
              onPress={() => sendWhatsApp(item.msg)} activeOpacity={0.75}>
              <Text style={{ flex: 1, fontSize: 13, fontWeight: '700', color: C.slate900 }}>{item.label}</Text>
              <View style={{ backgroundColor: '#D1FAE5', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 }}>
                <Text style={{ fontSize: 11, color: C.success, fontWeight: '800' }}>SEND 💬</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

// ─── FEES ────────────────────────────────────────────────────────
const FeesScreen: React.FC = () => {
  const { logout } = useStore();
  const [filter, setFilter] = useState<'all'|'pending'|'paid'>('pending');
  const [fees, setFees] = useState(ALL_FEE_RECORDS);
  const [search, setSearch] = useState('');

  const filtered = fees.filter(f => (filter === 'all' || f.status === filter) && (search === '' || f.student.toLowerCase().includes(search.toLowerCase()) || f.class.toLowerCase().includes(search.toLowerCase())));
  const totalPending = fees.filter(f => f.status === 'pending').reduce((a, f) => a + f.amount, 0);
  const totalPaid = fees.filter(f => f.status === 'paid').reduce((a, f) => a + f.amount, 0);

  const markPaid = (id: string, name: string) => {
    Alert.alert('Mark as Paid', `Confirm fee payment from ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm', onPress: () => setFees(prev => prev.map(f => f.id === id ? { ...f, status: 'paid' } : f)) },
    ]);
  };

  const sendReminder = (fee: any) => {
    const msg = `Dear Parent of ${fee.student},\n\n${fee.term} fee of ₹${fee.amount.toLocaleString()} is still pending.\n\nPay via UPI: greenfield.school@okaxis\n\nFor queries: 080-41234567\n\n— Greenfield International School`;
    Linking.openURL(`whatsapp://send?phone=91${fee.phone}&text=${encodeURIComponent(msg)}`).catch(() => Alert.alert('WhatsApp', 'Could not open WhatsApp.'));
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.slate100 }}>
      <StatusBar barStyle="light-content" />
      <Hdr color="#1E3A8A" title="Fee Management" sub={`₹${(totalPaid/100000).toFixed(1)}L collected · ₹${(totalPending/100000).toFixed(1)}L pending`} onLogout={logout} />

      <View style={s.searchBox}>
        <Text>🔍</Text>
        <TextInput style={s.searchInput} placeholder="Search student or class..." value={search} onChangeText={setSearch} placeholderTextColor={C.slate500} />
      </View>
      <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: C.white, borderBottomWidth: 0.5, borderColor: C.slate200 }}>
        {(['all','pending','paid'] as const).map(f => (
          <TouchableOpacity key={f} style={[s.filterChip, filter === f && { backgroundColor: C.brand, borderColor: C.brand }]} onPress={() => setFilter(f)}>
            <Text style={[{ fontSize: 12, fontWeight: '700', color: C.slate700 }, filter === f && { color: '#fff' }]}>{f.charAt(0).toUpperCase() + f.slice(1)} ({fees.filter(x => f === 'all' || x.status === f).length})</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        {filtered.map((fee, i) => (
          <View key={fee.id} style={s.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <View>
                <Text style={{ fontSize: 15, fontWeight: '800', color: C.slate900 }}>{fee.student}</Text>
                <Text style={{ fontSize: 12, color: C.slate500, marginTop: 1 }}>Class {fee.class} · {fee.term}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 20, fontWeight: '900', color: fee.status === 'paid' ? C.success : C.danger }}>₹{fee.amount.toLocaleString()}</Text>
                <View style={[{ borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginTop: 4 }, { backgroundColor: fee.status === 'paid' ? C.successBg : C.dangerBg }]}>
                  <Text style={{ fontSize: 10, fontWeight: '800', color: fee.status === 'paid' ? C.success : C.danger }}>{fee.status === 'paid' ? '✓ PAID' : 'PENDING'}</Text>
                </View>
              </View>
            </View>
            {fee.status === 'pending' && (
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity style={[s.actionBtn, { flex: 1 }]} onPress={() => markPaid(fee.id, fee.student)} activeOpacity={0.85}>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: C.success }}>✓ Mark Paid</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.actionBtn, { flex: 1.5, backgroundColor: '#F0FDF4' }]} onPress={() => sendReminder(fee)} activeOpacity={0.85}>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: '#25D366' }}>💬 WhatsApp Reminder</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

// ─── NOTIFY ──────────────────────────────────────────────────────
const NotifyScreen: React.FC = () => {
  const { logout } = useStore();
  const [target, setTarget] = useState('All Parents');
  const [msg, setMsg] = useState('');
  const [sent, setSent] = useState(false);

  const send = () => {
    if (!msg.trim()) { Alert.alert('Error', 'Please enter a message'); return; }
    Linking.openURL(`whatsapp://send?text=${encodeURIComponent(msg)}`).catch(() => {});
    setSent(true);
    setTimeout(() => { setSent(false); setMsg(''); }, 3000);
  };

  const templates = [
    { l: '📅 Attendance', m: `Greenfield School — ${new Date().toLocaleDateString('en-IN')}\n✅ Present: 247/284 (87%)\n❌ Absent: 37 students` },
    { l: '💸 Fee Reminder', m: 'Dear Parent,\nTerm 2 fee of ₹18,500 is due by June 15.\nPay via UPI: greenfield.school@okaxis' },
    { l: '📝 Exam Alert', m: 'Term 2 exams begin June 10.\nScience: June 10 | Maths: June 11 | English: June 12\nBest wishes! 🙏' },
    { l: '🏖️ Holiday', m: 'School will remain CLOSED on [Date] due to [Reason].\nClasses resume on [Date].\n— Admin' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: C.slate100 }}>
      <StatusBar barStyle="light-content" />
      <Hdr color={C.purple} title="Send Notification" sub="Broadcast to parents, teachers, students" onLogout={logout} />
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        {sent && <View style={{ backgroundColor: C.successBg, borderRadius: 12, padding: 14, marginBottom: 14 }}><Text style={{ color: C.success, fontWeight: '800', textAlign: 'center' }}>✅ Message sent to WhatsApp!</Text></View>}

        <Text style={s.sectionTitle}>Target Audience</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {['All Parents', 'All Students', 'All Teachers', 'Class 8A', 'Class 8B', 'Class 7A', 'Class 7B'].map(t => (
              <TouchableOpacity key={t} style={[s.filterChip, target === t && { backgroundColor: C.purple, borderColor: C.purple }]} onPress={() => setTarget(t)}>
                <Text style={[{ fontSize: 12, fontWeight: '700', color: C.slate700 }, target === t && { color: '#fff' }]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <Text style={s.sectionTitle}>Quick Templates</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {templates.map((t, i) => (
              <TouchableOpacity key={i} style={{ backgroundColor: C.brandLight, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: '#BFDBFE' }} onPress={() => setMsg(t.m)}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: C.brand }}>{t.l}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <Text style={s.sectionTitle}>Message</Text>
        <TextInput style={s.textArea} value={msg} onChangeText={setMsg} placeholder="Type your message or select a template above..." placeholderTextColor={C.slate500} multiline numberOfLines={6} textAlignVertical="top" />
        <Text style={{ fontSize: 11, color: C.slate500, textAlign: 'right', marginBottom: 16 }}>{msg.length} chars</Text>

        <TouchableOpacity style={[s.sendBtn, !msg.trim() && { opacity: 0.5 }]} onPress={send} disabled={!msg.trim()} activeOpacity={0.85}>
          <Text style={s.sendBtnText}>💬 Send via WhatsApp to {target}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

// ─── TICKETS ─────────────────────────────────────────────────────
const TicketsScreen: React.FC = () => {
  const { logout } = useStore();
  const [tickets, setTickets] = useState(SUPPORT_TICKETS);
  const [filter, setFilter] = useState<'open'|'resolved'>('open');

  const resolve = (id: string) => {
    Alert.alert('Resolve Ticket', 'Mark this ticket as resolved?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Resolve', onPress: () => setTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'resolved' } : t)) },
    ]);
  };

  const filtered = tickets.filter(t => t.status === filter);
  const priorityColor = (p: string) => p === 'high' ? C.danger : p === 'medium' ? C.warning : C.success;
  const priorityBg = (p: string) => p === 'high' ? C.dangerBg : p === 'medium' ? C.warningBg : C.successBg;

  return (
    <View style={{ flex: 1, backgroundColor: C.slate100 }}>
      <StatusBar barStyle="light-content" />
      <Hdr color="#DC2626" title="Support Tickets" sub={`${tickets.filter(t=>t.status==='open').length} open · ${tickets.filter(t=>t.status==='resolved').length} resolved`} onLogout={logout} />
      <View style={{ flexDirection: 'row', gap: 8, padding: 16, backgroundColor: C.white, borderBottomWidth: 0.5, borderColor: C.slate200 }}>
        {(['open','resolved'] as const).map(f => (
          <TouchableOpacity key={f} style={[s.filterChip, { flex: 1, justifyContent: 'center' }, filter === f && { backgroundColor: f === 'open' ? C.danger : C.success, borderColor: f === 'open' ? C.danger : C.success }]} onPress={() => setFilter(f)}>
            <Text style={[{ fontSize: 12, fontWeight: '700', color: C.slate700, textAlign: 'center' }, filter === f && { color: '#fff' }]}>{f === 'open' ? '🔴 Open' : '✅ Resolved'} ({tickets.filter(t=>t.status===f).length})</Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        {filtered.length === 0 && (
          <View style={{ alignItems: 'center', padding: 40 }}>
            <Text style={{ fontSize: 48 }}>🎉</Text>
            <Text style={{ fontSize: 16, fontWeight: '800', color: C.slate700, marginTop: 12 }}>No {filter} tickets</Text>
          </View>
        )}
        {filtered.map((ticket, i) => (
          <View key={ticket.id} style={s.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <View>
                <Text style={{ fontSize: 14, fontWeight: '800', color: C.slate900 }}>{ticket.from}</Text>
                <Text style={{ fontSize: 11, color: C.slate500 }}>{ticket.role} · {ticket.time}</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <View style={[{ borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }, { backgroundColor: priorityBg(ticket.priority) }]}>
                  <Text style={{ fontSize: 10, fontWeight: '800', color: priorityColor(ticket.priority) }}>{ticket.priority.toUpperCase()}</Text>
                </View>
                <View style={{ backgroundColor: C.brandLight, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
                  <Text style={{ fontSize: 10, fontWeight: '800', color: C.brand }}>{ticket.type}</Text>
                </View>
              </View>
            </View>
            <Text style={{ fontSize: 13, color: C.slate700, lineHeight: 20, marginBottom: ticket.status === 'open' ? 12 : 0 }}>{ticket.issue}</Text>
            {ticket.status === 'open' && (
              <TouchableOpacity style={[s.actionBtn, { backgroundColor: C.successBg }]} onPress={() => resolve(ticket.id)} activeOpacity={0.85}>
                <Text style={{ fontSize: 13, fontWeight: '800', color: C.success }}>✓ Mark as Resolved</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

// ─── NAVIGATOR ───────────────────────────────────────────────────
export const AdminNavigator: React.FC = () => (
  <Tab.Navigator screenOptions={{ headerShown: false,
    tabBarStyle: { backgroundColor: C.white, borderTopWidth: 0.5, borderTopColor: C.slate200, height: 64, paddingBottom: 8, paddingTop: 6 },
    tabBarActiveTintColor: C.brand, tabBarInactiveTintColor: '#94A3B8',
    tabBarLabelStyle: { fontSize: 10, fontWeight: '700' },
  }}>
    <Tab.Screen name="Dashboard" component={DashScreen}    options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🏠</Text>, tabBarLabel: 'Dashboard' }} />
    <Tab.Screen name="Fees"      component={FeesScreen}    options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>💰</Text>, tabBarLabel: 'Fees' }} />
    <Tab.Screen name="Notify"    component={NotifyScreen}  options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>📢</Text>, tabBarLabel: 'Notify' }} />
    <Tab.Screen name="Tickets"   component={TicketsScreen} options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🎫</Text>, tabBarLabel: 'Tickets' }} />
  </Tab.Navigator>
);

const s = StyleSheet.create({
  header: { paddingTop: 52, paddingBottom: 16, paddingHorizontal: 18 },
  headerLabel: { fontSize: 10, color: 'rgba(255,255,255,0.55)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#fff' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 2 },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  scroll: { padding: 16, paddingBottom: 32 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#0F172A', marginBottom: 10, marginTop: 4 },
  card: { backgroundColor: C.white, borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  kpiBox: { width: '30%', alignItems: 'center', backgroundColor: C.white, borderRadius: 14, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  kpiVal: { fontSize: 22, fontWeight: '900', marginTop: 4 },
  kpiLabel: { fontSize: 10, color: C.slate500, fontWeight: '600', marginTop: 2, textAlign: 'center' },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.white, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, borderColor: C.slate200 },
  searchInput: { flex: 1, fontSize: 14, color: C.slate900 },
  filterChip: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1.5, borderColor: C.slate200, backgroundColor: C.white },
  filterTextActive: { color: C.white },
  
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: C.successBg, borderRadius: 12, paddingVertical: 11 },
  textArea: { backgroundColor: C.white, borderRadius: 14, borderWidth: 1.5, borderColor: C.slate200, padding: 14, fontSize: 14, color: C.slate900, minHeight: 140, marginBottom: 8 },
  sendBtn: { backgroundColor: '#25D366', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  sendBtnText: { color: C.white, fontSize: 15, fontWeight: '800' },
});
