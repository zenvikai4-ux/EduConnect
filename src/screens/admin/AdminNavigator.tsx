import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  StatusBar, TextInput, Alert, Linking, Share, Modal,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '../../store/authStore';
import { Colors, Shadow } from '../../constants/theme';

const Tab = createBottomTabNavigator();
const Ico = ({ e, focused }: { e: string; focused: boolean }) => (
  <Text style={{ fontSize: focused ? 22 : 19, opacity: focused ? 1 : 0.45 }}>{e}</Text>
);

// ─── WHATSAPP HELPER ─────────────────────────────────────────────
const SCHOOL_WA = '919876543210'; // school office WhatsApp

const sendWhatsApp = (to: string, message: string) => {
  const url = `https://wa.me/${to.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
  Linking.openURL(url).catch(() => Alert.alert('Error', 'WhatsApp not installed.'));
};

const broadcastWhatsApp = (message: string) => {
  // Opens WhatsApp with pre-filled message — user selects broadcast list / group
  const url = `whatsapp://send?text=${encodeURIComponent(message)}`;
  Linking.openURL(url).catch(() => {
    Linking.openURL(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`);
  });
};

// ─── SHARED COMPONENTS ───────────────────────────────────────────
const SH = ({ title, right }: { title: string; right?: React.ReactNode }) => (
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
    <Text style={s.sh}>{title}</Text>
    {right}
  </View>
);

const Card = ({ children, style }: any) => <View style={[s.card, style]}>{children}</View>;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DASHBOARD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const DashScreen: React.FC = () => {
  const { user, logout } = useAuthStore();

  const stats = [
    { icon: '👥', val: '284', label: 'Students',   color: Colors.primary },
    { icon: '👩‍🏫', val: '18',  label: 'Teachers',   color: '#7c3aed' },
    { icon: '📊', val: '87%', label: 'Attendance', color: Colors.success },
    { icon: '💰', val: '₹4.2L', label: 'Collected', color: '#f59e0b' },
  ];

  const alerts = [
    { icon: '⚠️', msg: '3 students below 75% attendance this week', color: Colors.danger },
    { icon: '💸', msg: '12 fee payments overdue — Term 2 deadline in 5 days', color: Colors.warning },
    { icon: '🎫', msg: '2 support tickets pending resolution', color: Colors.primary },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: Colors.slate50 }}>
      <StatusBar barStyle="light-content" />
      <View style={[s.header, { backgroundColor: Colors.primary }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View>
            <Text style={s.headerLabel}>SCHOOL ADMIN</Text>
            <Text style={s.headerTitle}>{user?.name ?? 'Ravi Shankar'}</Text>
            <Text style={s.headerSub}>Greenfield Academy</Text>
          </View>
          <TouchableOpacity onPress={logout} style={s.logoutBtn}>
            <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: '700' }}>LOGOUT</Text>
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16 }}>
          {stats.map(st => (
            <View key={st.label} style={s.statBox}>
              <Text style={{ fontSize: 18 }}>{st.icon}</Text>
              <Text style={{ fontSize: 22, fontWeight: '900', color: st.color, marginTop: 2 }}>{st.val}</Text>
              <Text style={{ fontSize: 10, color: Colors.slate500, fontWeight: '600' }}>{st.label}</Text>
            </View>
          ))}
        </View>
      </View>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Alerts */}
        <SH title="⚡ Action Needed" />
        {alerts.map((a, i) => (
          <View key={i} style={[s.alertRow, { borderLeftColor: a.color }]}>
            <Text style={{ fontSize: 18 }}>{a.icon}</Text>
            <Text style={{ flex: 1, fontSize: 13, color: Colors.slate700 }}>{a.msg}</Text>
          </View>
        ))}

        {/* Quick WhatsApp broadcast */}
        <SH title="📢 Quick Broadcasts" />
        <Card>
          {[
            { label: '📅 Attendance Summary', msg: `Greenfield Academy — Daily Attendance\nDate: ${new Date().toLocaleDateString('en-IN')}\nPresent: 247/284 (87%)\nAbsent: 37 students\n\nFor details, check EduSpark app.` },
            { label: '💸 Fee Reminder', msg: `Dear Parent,\nTerm 2 fee of ₹18,500 is due by April 15, 2026.\nPay via UPI: greenfield.school@okaxis\nFor queries: 9876543210` },
            { label: '🏖️ Holiday Notice', msg: `Greenfield Academy\n📢 School Holiday Notice\n\nDear Parents,\nSchool will remain CLOSED on [Date] due to [Reason].\n\nRegards,\nAdmin Team` },
            { label: '📝 Exam Schedule', msg: `Greenfield Academy — Exam Schedule\nTerm 2 Exams: April 14-16, 2026\n• Science: April 14\n• Maths: April 15\n• English: April 16\n\nBest wishes to all students!` },
          ].map((item, i) => (
            <TouchableOpacity key={i} style={[s.broadcastRow, i < 3 && { borderBottomWidth: 0.5, borderColor: Colors.slate100 }]}
              onPress={() => broadcastWhatsApp(item.msg)} activeOpacity={0.75}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.slate800, flex: 1 }}>{item.label}</Text>
              <View style={s.waBadge}>
                <Text style={{ fontSize: 10, color: '#25d366', fontWeight: '800' }}>SEND ↗</Text>
              </View>
            </TouchableOpacity>
          ))}
        </Card>

        {/* Today's schedule */}
        <SH title="📅 Today's Overview" right={<Text style={{ fontSize: 12, color: Colors.slate400 }}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}</Text>} />
        <Card>
          {[
            { time: '8:00 AM', event: 'Morning assembly — All students', icon: '🎓' },
            { time: '9:00 AM', event: 'Staff meeting — Conference Room A', icon: '👥' },
            { time: '2:00 PM', event: 'PTM — Class 8A parents', icon: '🤝' },
            { time: '4:00 PM', event: 'Fee collection closes for Term 2', icon: '💰' },
          ].map((ev, i) => (
            <View key={i} style={[{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 }, i < 3 && { borderBottomWidth: 0.5, borderColor: Colors.slate100 }]}>
              <Text style={{ fontSize: 20 }}>{ev.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.slate800 }}>{ev.event}</Text>
                <Text style={{ fontSize: 11, color: Colors.slate400, marginTop: 1 }}>{ev.time}</Text>
              </View>
            </View>
          ))}
        </Card>
      </ScrollView>
    </View>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FEE MANAGEMENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const FeeScreen: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('pending');
  const [search, setSearch] = useState('');

  const fees = [
    { name: 'Aarav Sharma',   class: '8A', amount: 18500, status: 'pending', phone: '9000000001', term: 'Term 2' },
    { name: 'Priya Mehta',    class: '8A', amount: 18500, status: 'pending', phone: '9000000002', term: 'Term 2' },
    { name: 'Rohan Singh',    class: '8B', amount: 18500, status: 'paid',    phone: '9000000003', term: 'Term 2' },
    { name: 'Ananya Patel',   class: '7A', amount: 16000, status: 'pending', phone: '9000000004', term: 'Term 2' },
    { name: 'Vivek Kumar',    class: '7B', amount: 16000, status: 'paid',    phone: '9000000005', term: 'Term 2' },
    { name: 'Sneha Reddy',    class: '8B', amount: 18500, status: 'pending', phone: '9000000006', term: 'Term 2' },
    { name: 'Arjun Nair',     class: '7A', amount: 16000, status: 'paid',    phone: '9000000007', term: 'Term 2' },
    { name: 'Kavya Iyer',     class: '8A', amount: 18500, status: 'pending', phone: '9000000008', term: 'Term 2' },
  ];

  const filtered = fees.filter(f =>
    (filter === 'all' || f.status === filter) &&
    (search === '' || f.name.toLowerCase().includes(search.toLowerCase()) || f.class.toLowerCase().includes(search.toLowerCase()))
  );

  const totalPending = fees.filter(f => f.status === 'pending').reduce((a, f) => a + f.amount, 0);
  const totalCollected = fees.filter(f => f.status === 'paid').reduce((a, f) => a + f.amount, 0);

  const sendReminder = (fee: any) => {
    const msg = `Dear Parent of ${fee.name},\n\nThis is a reminder that your child's ${fee.term} fee of ₹${fee.amount.toLocaleString()} is due.\n\nPay via UPI: greenfield.school@okaxis\n\nPlease pay at the earliest to avoid late fees.\n\n— Greenfield Academy`;
    sendWhatsApp('91' + fee.phone, msg);
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.slate50 }}>
      <StatusBar barStyle="dark-content" />
      <View style={s.pageHeader}>
        <Text style={s.pageTitle}>💰 Fee Management</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={s.summaryChip}>
            <Text style={{ fontSize: 10, color: Colors.danger, fontWeight: '700' }}>PENDING</Text>
            <Text style={{ fontSize: 15, fontWeight: '900', color: Colors.danger }}>₹{(totalPending / 1000).toFixed(0)}K</Text>
          </View>
          <View style={[s.summaryChip, { backgroundColor: '#dcfce7' }]}>
            <Text style={{ fontSize: 10, color: Colors.success, fontWeight: '700' }}>COLLECTED</Text>
            <Text style={{ fontSize: 15, fontWeight: '900', color: Colors.success }}>₹{(totalCollected / 1000).toFixed(0)}K</Text>
          </View>
        </View>
      </View>

      <View style={s.searchRow}>
        <TextInput style={s.searchInput} placeholder="Search by name or class..." value={search} onChangeText={setSearch} placeholderTextColor={Colors.slate400} />
      </View>

      <View style={s.filterRow}>
        {(['all', 'pending', 'paid'] as const).map(f => (
          <TouchableOpacity key={f} style={[s.filterChip, filter === f && s.filterChipActive]} onPress={() => setFilter(f)}>
            <Text style={[s.filterText, filter === f && s.filterTextActive]}>{f.charAt(0).toUpperCase() + f.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={[s.scroll, { paddingTop: 8 }]} showsVerticalScrollIndicator={false}>
        {filtered.map((fee, i) => (
          <Card key={i} style={{ marginBottom: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '800', color: Colors.slate800 }}>{fee.name}</Text>
                <Text style={{ fontSize: 12, color: Colors.slate400, marginTop: 1 }}>Class {fee.class} · {fee.term}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 18, fontWeight: '900', color: fee.status === 'paid' ? Colors.success : Colors.danger }}>₹{fee.amount.toLocaleString()}</Text>
                <View style={[s.statusBadge, { backgroundColor: fee.status === 'paid' ? '#dcfce7' : '#fde8e8' }]}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: fee.status === 'paid' ? Colors.success : Colors.danger }}>{fee.status.toUpperCase()}</Text>
                </View>
              </View>
            </View>
            {fee.status === 'pending' && (
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity style={[s.actionBtn, { backgroundColor: '#dcfce7' }]} onPress={() => Alert.alert('Mark Paid', `Mark ${fee.name}'s fee as paid?`, [{ text: 'Cancel' }, { text: 'Confirm', onPress: () => Alert.alert('Done', 'Fee marked as paid.') }])}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.success }}>✓ Mark Paid</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.actionBtn, { backgroundColor: '#dcfce7', flex: 1 }]} onPress={() => sendReminder(fee)}>
                  <Text style={{ fontSize: 16 }}>💬</Text>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#25d366' }}> WhatsApp Reminder</Text>
                </TouchableOpacity>
              </View>
            )}
          </Card>
        ))}
      </ScrollView>
    </View>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NOTIFY
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const NotifyScreen: React.FC = () => {
  const [target, setTarget] = useState('All Parents');
  const [message, setMessage] = useState('');
  const [channel, setChannel] = useState<'whatsapp' | 'app'>('whatsapp');
  const [sent, setSent] = useState(false);

  const templates = [
    { label: '📅 Holiday Notice', text: 'Dear Parents,\nSchool will remain CLOSED on [Date] due to [Reason].\nRegards, Greenfield Academy' },
    { label: '💸 Fee Reminder', text: 'Dear Parent,\nTerm 2 fee of ₹18,500 is due by April 15.\nPay via UPI: greenfield.school@okaxis' },
    { label: '📝 Exam Alert', text: 'Dear Parent,\nTerm 2 Exams begin April 14. Please ensure your child revises all chapters.\nBest wishes, Greenfield Academy' },
    { label: '🏃 Sports Day', text: 'Dear Parents,\nAnnual Sports Day is on April 20 at 9 AM. All parents are invited!\nRegards, Greenfield Academy' },
  ];

  const handleSend = () => {
    if (!message.trim()) { Alert.alert('Error', 'Please enter a message'); return; }
    if (channel === 'whatsapp') {
      broadcastWhatsApp(message);
    } else {
      Alert.alert('✅ Sent', `Notification sent to ${target} via in-app push.`);
    }
    setSent(true);
    setTimeout(() => { setSent(false); setMessage(''); }, 3000);
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.slate50 }}>
      <StatusBar barStyle="dark-content" />
      <View style={s.pageHeader}>
        <Text style={s.pageTitle}>📢 Send Notification</Text>
      </View>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {sent && (
          <View style={[s.alertRow, { borderLeftColor: Colors.success, backgroundColor: '#dcfce7' }]}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.success }}>✅ Notification sent successfully!</Text>
          </View>
        )}

        {/* Target */}
        <Text style={s.sh}>Target Audience</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {['All Parents', 'All Students', 'All Teachers', 'Class 8A', 'Class 8B', 'Class 7A'].map(t => (
            <TouchableOpacity key={t} style={[s.filterChip, target === t && s.filterChipActive]} onPress={() => setTarget(t)}>
              <Text style={[s.filterText, target === t && s.filterTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Channel */}
        <Text style={s.sh}>Channel</Text>
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
          <TouchableOpacity style={[s.channelBtn, channel === 'whatsapp' && { borderColor: '#25d366', backgroundColor: '#f0fdf4' }]} onPress={() => setChannel('whatsapp')}>
            <Text style={{ fontSize: 20 }}>💬</Text>
            <Text style={[{ fontSize: 12, fontWeight: '700', marginTop: 4 }, channel === 'whatsapp' ? { color: '#25d366' } : { color: Colors.slate500 }]}>WhatsApp</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.channelBtn, channel === 'app' && { borderColor: Colors.primary, backgroundColor: '#eff6ff' }]} onPress={() => setChannel('app')}>
            <Text style={{ fontSize: 20 }}>📱</Text>
            <Text style={[{ fontSize: 12, fontWeight: '700', marginTop: 4 }, channel === 'app' ? { color: Colors.primary } : { color: Colors.slate500 }]}>In-App</Text>
          </TouchableOpacity>
        </View>

        {/* Templates */}
        <Text style={s.sh}>Quick Templates</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {templates.map((t, i) => (
              <TouchableOpacity key={i} style={s.templateChip} onPress={() => setMessage(t.text)}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.primary }}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Message */}
        <Text style={s.sh}>Message</Text>
        <TextInput
          style={s.textArea}
          value={message}
          onChangeText={setMessage}
          placeholder="Type your message here or use a template above..."
          placeholderTextColor={Colors.slate400}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />
        <Text style={{ fontSize: 11, color: Colors.slate400, marginBottom: 16, textAlign: 'right' }}>{message.length} characters</Text>

        <TouchableOpacity style={s.sendBtn} onPress={handleSend} activeOpacity={0.85}>
          <Text style={{ fontSize: 20 }}>{channel === 'whatsapp' ? '💬' : '📱'}</Text>
          <Text style={s.sendBtnText}>Send via {channel === 'whatsapp' ? 'WhatsApp' : 'In-App'} to {target}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STUDENTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const StudentsScreen: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');

  const students = [
    { name: 'Aarav Sharma',   class: '8A', roll: '8A-01', phone: '9000000001', attendance: 91, fee: 'pending' },
    { name: 'Priya Mehta',    class: '8A', roll: '8A-02', phone: '9000000002', attendance: 85, fee: 'paid' },
    { name: 'Rohan Singh',    class: '8B', roll: '8B-01', phone: '9000000003', attendance: 72, fee: 'pending' },
    { name: 'Ananya Patel',   class: '7A', roll: '7A-01', phone: '9000000004', attendance: 95, fee: 'paid' },
    { name: 'Vivek Kumar',    class: '7B', roll: '7B-01', phone: '9000000005', attendance: 68, fee: 'pending' },
    { name: 'Sneha Reddy',    class: '8B', roll: '8B-02', phone: '9000000006', attendance: 88, fee: 'paid' },
  ];

  const classes = ['All', '8A', '8B', '7A', '7B'];
  const filtered = students.filter(s =>
    (selectedClass === 'All' || s.class === selectedClass) &&
    (search === '' || s.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <View style={{ flex: 1, backgroundColor: Colors.slate50 }}>
      <StatusBar barStyle="dark-content" />
      <View style={s.pageHeader}>
        <Text style={s.pageTitle}>👥 Students ({students.length})</Text>
      </View>
      <View style={s.searchRow}>
        <TextInput style={s.searchInput} placeholder="Search students..." value={search} onChangeText={setSearch} placeholderTextColor={Colors.slate400} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8, gap: 8 }}>
        {classes.map(c => (
          <TouchableOpacity key={c} style={[s.filterChip, selectedClass === c && s.filterChipActive]} onPress={() => setSelectedClass(c)}>
            <Text style={[s.filterText, selectedClass === c && s.filterTextActive]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <ScrollView contentContainerStyle={[s.scroll, { paddingTop: 8 }]} showsVerticalScrollIndicator={false}>
        {filtered.map((st, i) => (
          <Card key={i} style={{ marginBottom: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={s.avatar}>
                <Text style={{ fontSize: 16, fontWeight: '800', color: Colors.primary }}>
                  {st.name.split(' ').map(w => w[0]).join('')}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '800', color: Colors.slate800 }}>{st.name}</Text>
                <Text style={{ fontSize: 11, color: Colors.slate400, marginTop: 1 }}>Class {st.class} · Roll {st.roll}</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
                  <View style={[s.miniChip, { backgroundColor: st.attendance >= 75 ? '#dcfce7' : '#fde8e8' }]}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: st.attendance >= 75 ? Colors.success : Colors.danger }}>{st.attendance}% ATT</Text>
                  </View>
                  <View style={[s.miniChip, { backgroundColor: st.fee === 'paid' ? '#dcfce7' : '#fde8e8' }]}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: st.fee === 'paid' ? Colors.success : Colors.danger }}>FEE {st.fee.toUpperCase()}</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity style={s.waBtn} onPress={() => sendWhatsApp('91' + st.phone, `Dear Parent of ${st.name},\nThis is a message from Greenfield Academy regarding your child.`)}>
                <Text style={{ fontSize: 18 }}>💬</Text>
              </TouchableOpacity>
            </View>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NAVIGATOR
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const AdminNavigator: React.FC = () => (
  <Tab.Navigator
    screenOptions={{ headerShown: false, tabBarStyle: s.tabBar, tabBarActiveTintColor: Colors.primary, tabBarInactiveTintColor: Colors.slate400, tabBarLabelStyle: { fontSize: 10, fontWeight: '700' } }}
  >
    <Tab.Screen name="Dashboard" component={DashScreen} options={{ tabBarIcon: ({ focused }) => <Ico e="🏠" focused={focused} /> }} />
    <Tab.Screen name="Fees" component={FeeScreen} options={{ tabBarIcon: ({ focused }) => <Ico e="💰" focused={focused} /> }} />
    <Tab.Screen name="Notify" component={NotifyScreen} options={{ tabBarIcon: ({ focused }) => <Ico e="📢" focused={focused} /> }} />
    <Tab.Screen name="Students" component={StudentsScreen} options={{ tabBarIcon: ({ focused }) => <Ico e="👥" focused={focused} /> }} />
  </Tab.Navigator>
);

const s = StyleSheet.create({
  header: { paddingTop: 52, paddingBottom: 20, paddingHorizontal: 20 },
  headerLabel: { fontSize: 10, color: 'rgba(255,255,255,0.55)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#fff', marginTop: 2 },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 2 },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  statBox: { flex: 1, minWidth: '45%', backgroundColor: '#fff', borderRadius: 14, padding: 12, alignItems: 'center', ...Shadow.sm as any },
  scroll: { padding: 16, paddingBottom: 40 },
  sh: { fontSize: 13, fontWeight: '800', color: Colors.slate700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 14, ...Shadow.sm as any },
  alertRow: { borderLeftWidth: 4, backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  broadcastRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  waBadge: { backgroundColor: '#f0fdf4', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: '#bbf7d0' },
  pageHeader: { paddingTop: 52, paddingBottom: 14, paddingHorizontal: 16, backgroundColor: '#fff', borderBottomWidth: 0.5, borderColor: Colors.slate200 },
  pageTitle: { fontSize: 20, fontWeight: '900', color: Colors.slate800 },
  searchRow: { padding: 12, backgroundColor: '#fff' },
  searchInput: { backgroundColor: Colors.slate50, borderRadius: 12, borderWidth: 1, borderColor: Colors.slate200, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: Colors.slate800 },
  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingBottom: 10, backgroundColor: '#fff' },
  filterChip: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1.5, borderColor: Colors.slate200, backgroundColor: '#fff' },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { fontSize: 12, fontWeight: '700', color: Colors.slate600 },
  filterTextActive: { color: '#fff' },
  statusBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, marginTop: 4 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 10, paddingVertical: 10 },
  channelBtn: { flex: 1, alignItems: 'center', borderRadius: 14, padding: 14, borderWidth: 2, borderColor: Colors.slate200, backgroundColor: '#fff' },
  templateChip: { backgroundColor: '#eff6ff', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: '#bfdbfe' },
  textArea: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1.5, borderColor: Colors.slate200, padding: 14, fontSize: 14, color: Colors.slate800, minHeight: 140, marginBottom: 8 },
  sendBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 16 },
  sendBtnText: { fontSize: 15, fontWeight: '800', color: '#fff' },
  summaryChip: { backgroundColor: '#fde8e8', borderRadius: 12, padding: 10, alignItems: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' },
  miniChip: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  waBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center' },
  tabBar: { backgroundColor: '#fff', borderTopWidth: 0.5, borderTopColor: Colors.slate200, height: 64, paddingBottom: 8, paddingTop: 6 },
});
