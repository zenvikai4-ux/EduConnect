import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  StatusBar, TextInput, Alert, Switch,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useStore } from '../../store';
import { CLASS_STUDENTS, HOMEWORK, SCHEDULE_TODAY, SUBJECT_SCORES, CLASS_PERFORMANCE } from '../../data/demoData';

const Tab = createBottomTabNavigator();
const C = {
  brand:'#1E3A8A', brandLight:'#EEF2FF', success:'#059669', successBg:'#D1FAE5',
  warning:'#D97706', warningBg:'#FEF3C7', danger:'#DC2626', dangerBg:'#FEE2E2',
  purple:'#7C3AED', purpleBg:'#EDE9FE',
  slate900:'#0F172A', slate700:'#334155', slate500:'#64748B',
  slate200:'#E2E8F0', slate100:'#F1F5F9', white:'#FFFFFF',
};

const Hdr = ({ color, role, title, sub, onLogout }: any) => (
  <View style={[s.header, { backgroundColor: color }]}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <View>
        <Text style={s.headerLabel}>{role}</Text>
        <Text style={s.headerTitle}>{title}</Text>
        {sub && <Text style={s.headerSub}>{sub}</Text>}
      </View>
      <TouchableOpacity style={s.logoutBtn} onPress={onLogout}>
        <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '700' }}>LOGOUT</Text>
      </TouchableOpacity>
    </View>
  </View>
);

// ─── HOME ────────────────────────────────────────────────────────
const TeacherHome: React.FC = () => {
  const { user, logout } = useStore();
  const students = CLASS_STUDENTS['cls_8a'] ?? [];
  const pendingHW = HOMEWORK.filter(h => h.status === 'pending');
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <View style={{ flex: 1, backgroundColor: C.slate100 }}>
      <StatusBar barStyle="light-content" />
      <Hdr color="#4C1D95" role="CLASS TEACHER" title={user?.name ?? 'Ms. Kavitha Rao'} sub="Class 8A · Science" onLogout={logout} />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Stats */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
          {[
            { val: students.length, label: 'Students',    color: C.brand,   icon: '👥' },
            { val: `${Math.round(students.reduce((a,s)=>a+s.attendance,0)/students.length)}%`, label: 'Avg Attend.', color: C.success, icon: '📅' },
            { val: pendingHW.length, label: 'HW Pending', color: C.warning,  icon: '📝' },
            { val: students.filter(s=>s.feeStatus==='pending').length, label: 'Fee Due', color: C.danger, icon: '💰' },
          ].map((st, i) => (
            <View key={i} style={s.miniStat}>
              <Text style={{ fontSize: 16 }}>{st.icon}</Text>
              <Text style={[s.miniStatVal, { color: st.color }]}>{st.val}</Text>
              <Text style={s.miniStatLabel}>{st.label}</Text>
            </View>
          ))}
        </View>

        {/* Today */}
        <Text style={s.sectionTitle}>📅 Today — {today}</Text>
        <View style={s.card}>
          {SCHEDULE_TODAY.filter(p => p.subject !== '☕ Break').slice(0, 4).map((p, i) => (
            <View key={i} style={[{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 }, i < 3 && { borderBottomWidth: 0.5, borderColor: C.slate100 }]}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: p.color }} />
              <Text style={{ flex: 1, fontSize: 13, fontWeight: '700', color: C.slate900 }}>{p.subject}</Text>
              <Text style={{ fontSize: 11, color: C.slate500 }}>{p.time} · {p.room}</Text>
            </View>
          ))}
        </View>

        {/* Quick actions */}
        <Text style={s.sectionTitle}>⚡ Quick Actions</Text>
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
          {[
            { icon: '✅', label: 'Mark Attendance', color: C.success, bg: C.successBg },
            { icon: '📝', label: 'Assign Homework', color: C.brand,   bg: C.brandLight },
          ].map((item, i) => (
            <View key={i} style={[s.quickAction, { backgroundColor: item.bg }]}>
              <Text style={{ fontSize: 28, marginBottom: 6 }}>{item.icon}</Text>
              <Text style={{ fontSize: 12, fontWeight: '800', color: item.color, textAlign: 'center' }}>{item.label}</Text>
              <Text style={{ fontSize: 10, color: item.color + '99', marginTop: 2 }}>Use the tab below</Text>
            </View>
          ))}
        </View>

        {/* Homework summary */}
        <Text style={s.sectionTitle}>📚 Homework Overview</Text>
        <View style={s.card}>
          {HOMEWORK.slice(0, 4).map((hw, i) => (
            <View key={hw.id} style={[{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 }, i < 3 && { borderBottomWidth: 0.5, borderColor: C.slate100 }]}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: C.slate900 }} numberOfLines={1}>{hw.title}</Text>
                <Text style={{ fontSize: 11, color: C.slate500 }}>{hw.subject} · {hw.submissions}/{hw.total} submitted</Text>
              </View>
              <View style={{ height: 32, width: 32, borderRadius: 16, backgroundColor: hw.status === 'verified' ? C.successBg : hw.status === 'submitted' ? C.brandLight : C.warningBg, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 14 }}>{hw.status === 'verified' ? '✓' : hw.status === 'submitted' ? '⏳' : '📝'}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

// ─── ATTENDANCE ──────────────────────────────────────────────────
const AttendanceScreen: React.FC = () => {
  const students = CLASS_STUDENTS['cls_8a'] ?? [];
  const [attendance, setAttendance] = useState<Record<string, boolean>>(
    Object.fromEntries(students.map(s => [s.id, s.attendance >= 80]))
  );
  const [saved, setSaved] = useState(false);
  const presentCount = Object.values(attendance).filter(Boolean).length;

  const toggleAll = (val: boolean) => {
    setAttendance(Object.fromEntries(students.map(s => [s.id, val])));
  };

  const save = () => {
    setSaved(true);
    Alert.alert('✅ Attendance Saved', `${presentCount}/${students.length} students marked present.`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.slate100 }}>
      <StatusBar barStyle="light-content" />
      <View style={[s.header, { backgroundColor: C.success, paddingBottom: 20 }]}>
        <Text style={s.headerLabel}>ATTENDANCE</Text>
        <Text style={s.headerTitle}>Mark Attendance</Text>
        <Text style={s.headerSub}>Class 8A · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>{presentCount}/{students.length} Present</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity style={s.markAllBtn} onPress={() => toggleAll(true)} activeOpacity={0.8}>
              <Text style={{ fontSize: 11, color: C.success, fontWeight: '800' }}>ALL PRESENT</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.markAllBtn, { backgroundColor: '#FEE2E2' }]} onPress={() => toggleAll(false)} activeOpacity={0.8}>
              <Text style={{ fontSize: 11, color: C.danger, fontWeight: '800' }}>ALL ABSENT</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* Progress bar */}
        <View style={{ height: 5, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 3, marginTop: 10, overflow: 'hidden' }}>
          <View style={{ width: `${(presentCount / students.length) * 100}%`, height: 5, backgroundColor: '#fff', borderRadius: 3 }} />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <View style={s.card}>
          {students.map((student, i) => (
            <TouchableOpacity key={student.id} onPress={() => !saved && setAttendance(a => ({ ...a, [student.id]: !a[student.id] }))}
              style={[{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13 }, i < students.length - 1 && { borderBottomWidth: 0.5, borderColor: C.slate100 }]}
              activeOpacity={0.7}>
              <View style={[s.avatar, { backgroundColor: attendance[student.id] ? C.successBg : C.dangerBg }]}>
                <Text style={{ fontSize: 13, fontWeight: '900', color: attendance[student.id] ? C.success : C.danger }}>
                  {student.name.split(' ').map((w:string) => w[0]).join('')}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: C.slate900 }}>{student.name}</Text>
                <Text style={{ fontSize: 11, color: C.slate500 }}>{student.roll} · {student.attendance}% overall</Text>
              </View>
              <Switch
                value={attendance[student.id]}
                onValueChange={(val) => !saved && setAttendance(a => ({ ...a, [student.id]: val }))}
                trackColor={{ false: '#FEE2E2', true: '#D1FAE5' }}
                thumbColor={attendance[student.id] ? C.success : C.danger}
                disabled={saved}
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {!saved && (
        <View style={s.saveBar}>
          <TouchableOpacity style={s.saveBtn} onPress={save} activeOpacity={0.85}>
            <Text style={s.saveBtnText}>✓ Save Attendance ({presentCount}/{students.length})</Text>
          </TouchableOpacity>
        </View>
      )}
      {saved && (
        <View style={[s.saveBar, { backgroundColor: C.successBg }]}>
          <Text style={{ color: C.success, fontSize: 15, fontWeight: '800', textAlign: 'center' }}>✅ Attendance saved for today</Text>
        </View>
      )}
    </View>
  );
};

// ─── STUDENTS ────────────────────────────────────────────────────
const StudentsScreen: React.FC = () => {
  const students = CLASS_STUDENTS['cls_8a'] ?? [];
  const [search, setSearch] = useState('');
  const filtered = students.filter((s: any) => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <View style={{ flex: 1, backgroundColor: C.slate100 }}>
      <StatusBar barStyle="light-content" />
      <View style={[s.header, { backgroundColor: '#4C1D95', paddingBottom: 16 }]}>
        <Text style={s.headerLabel}>CLASS ROSTER</Text>
        <Text style={s.headerTitle}>Class 8A Students</Text>
        <Text style={s.headerSub}>{students.length} students enrolled</Text>
      </View>
      <View style={s.searchBox}>
        <Text style={{ fontSize: 16 }}>🔍</Text>
        <TextInput style={s.searchInput} placeholder="Search students..." value={search} onChangeText={setSearch} placeholderTextColor={C.slate500} />
        {!!search && <TouchableOpacity onPress={() => setSearch('')}><Text style={{ fontSize: 16, color: C.slate500 }}>✕</Text></TouchableOpacity>}
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <View style={s.card}>
          {filtered.map((st: any, i: number) => (
            <View key={st.id} style={[{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13 }, i < filtered.length - 1 && { borderBottomWidth: 0.5, borderColor: C.slate100 }]}>
              <View style={[s.avatar, { backgroundColor: C.brandLight }]}>
                <Text style={{ fontSize: 14, fontWeight: '900', color: C.brand }}>{st.name.split(' ').map((w: string) => w[0]).join('')}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '800', color: C.slate900 }}>{st.name}</Text>
                <Text style={{ fontSize: 11, color: C.slate500 }}>{st.roll}</Text>
                <View style={{ flexDirection: 'row', gap: 6, marginTop: 5 }}>
                  <View style={[s.miniChip, { backgroundColor: st.attendance >= 75 ? C.successBg : C.dangerBg }]}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: st.attendance >= 75 ? C.success : C.danger }}>{st.attendance}% att</Text>
                  </View>
                  <View style={[s.miniChip, { backgroundColor: C.brandLight }]}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: C.brand }}>{st.gpa}</Text>
                  </View>
                  <View style={[s.miniChip, { backgroundColor: st.feeStatus === 'paid' ? C.successBg : C.dangerBg }]}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: st.feeStatus === 'paid' ? C.success : C.danger }}>Fee {st.feeStatus}</Text>
                  </View>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 12, fontWeight: '800', color: '#F59E0B' }}>⭐ {st.xp}</Text>
                <Text style={{ fontSize: 11, color: C.slate500 }}>XP</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

// ─── HOMEWORK ────────────────────────────────────────────────────
const HomeworkScreen: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [homework, setHomework] = useState(HOMEWORK);
  const [form, setForm] = useState({ title: '', subject: 'Science', dueDate: '', xpReward: '50' });

  const assign = () => {
    if (!form.title || !form.dueDate) { Alert.alert('Error', 'Please fill title and due date'); return; }
    const newHW = { id: `hw_${Date.now()}`, subject: form.subject, title: form.title, dueDate: form.dueDate, status: 'pending', submissions: 0, total: 32, xpReward: parseInt(form.xpReward) || 50 };
    setHomework(prev => [newHW, ...prev]);
    setForm({ title: '', subject: 'Science', dueDate: '', xpReward: '50' });
    setShowForm(false);
    Alert.alert('✅ Homework Assigned', `"${newHW.title}" assigned to Class 8A.`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.slate100 }}>
      <StatusBar barStyle="light-content" />
      <View style={[s.header, { backgroundColor: '#1E3A8A', paddingBottom: 16 }]}>
        <Text style={s.headerLabel}>HOMEWORK</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={s.headerTitle}>Assignments</Text>
          <TouchableOpacity style={s.addBtn} onPress={() => setShowForm(v => !v)} activeOpacity={0.8}>
            <Text style={{ color: '#fff', fontSize: 13, fontWeight: '800' }}>{showForm ? '✕ Cancel' : '+ Assign'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }} keyboardShouldPersistTaps="handled">
        {showForm && (
          <View style={[s.card, { marginBottom: 16, borderLeftWidth: 4, borderLeftColor: C.brand }]}>
            <Text style={{ fontSize: 15, fontWeight: '800', color: C.slate900, marginBottom: 14 }}>New Assignment</Text>
            <Text style={s.formLabel}>Subject</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
              {['Science', 'Mathematics', 'English', 'Social Studies', 'Hindi'].map(sub => (
                <TouchableOpacity key={sub} style={[s.subjectChip, form.subject === sub && { backgroundColor: C.brand, borderColor: C.brand }]} onPress={() => setForm(f => ({ ...f, subject: sub }))}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: form.subject === sub ? '#fff' : C.slate700 }}>{sub}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={s.formLabel}>Assignment Title *</Text>
            <TextInput style={s.formInput} value={form.title} onChangeText={t => setForm(f => ({ ...f, title: t }))} placeholder="e.g. Chapter 9 Exercise 9.3" placeholderTextColor={C.slate500} />
            <Text style={s.formLabel}>Due Date * (YYYY-MM-DD)</Text>
            <TextInput style={s.formInput} value={form.dueDate} onChangeText={t => setForm(f => ({ ...f, dueDate: t }))} placeholder="2026-06-01" placeholderTextColor={C.slate500} keyboardType="numeric" />
            <Text style={s.formLabel}>XP Reward</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
              {['25', '50', '75', '100'].map(xp => (
                <TouchableOpacity key={xp} style={[s.subjectChip, form.xpReward === xp && { backgroundColor: '#F59E0B', borderColor: '#F59E0B' }]} onPress={() => setForm(f => ({ ...f, xpReward: xp }))}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: form.xpReward === xp ? '#fff' : C.slate700 }}>+{xp} XP</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={s.saveBtn} onPress={assign} activeOpacity={0.85}>
              <Text style={s.saveBtnText}>📝 Assign to Class 8A</Text>
            </TouchableOpacity>
          </View>
        )}

        {homework.map((hw, i) => (
          <View key={hw.id} style={s.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <View style={[s.miniChip, { backgroundColor: C.brandLight }]}>
                <Text style={{ fontSize: 11, fontWeight: '800', color: C.brand }}>{hw.subject}</Text>
              </View>
              <Text style={{ fontSize: 12, color: C.slate500 }}>Due {new Date(hw.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</Text>
            </View>
            <Text style={{ fontSize: 14, fontWeight: '800', color: C.slate900, marginBottom: 10 }}>{hw.title}</Text>
            <View style={{ flexDirection: 'row', gap: 14 }}>
              <Text style={{ fontSize: 12, color: C.slate500 }}>👥 {hw.submissions}/{hw.total} submitted</Text>
              <Text style={{ fontSize: 12, color: '#F59E0B', fontWeight: '700' }}>⭐ +{hw.xpReward} XP</Text>
              <View style={[s.miniChip, { backgroundColor: hw.status === 'verified' ? C.successBg : hw.status === 'submitted' ? C.brandLight : C.warningBg }]}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: hw.status === 'verified' ? C.success : hw.status === 'submitted' ? C.brand : C.warning }}>
                  {hw.status.charAt(0).toUpperCase() + hw.status.slice(1)}
                </Text>
              </View>
            </View>
            {/* Submission progress bar */}
            <View style={{ height: 4, backgroundColor: C.slate100, borderRadius: 2, marginTop: 12, overflow: 'hidden' }}>
              <View style={{ width: `${(hw.submissions / hw.total) * 100}%`, height: 4, backgroundColor: C.brand, borderRadius: 2 }} />
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

// ─── NAVIGATOR ───────────────────────────────────────────────────
export const TeacherNavigator: React.FC = () => (
  <Tab.Navigator
    screenOptions={{ headerShown: false,
      tabBarStyle: { backgroundColor: '#fff', borderTopWidth: 0.5, borderTopColor: '#E2E8F0', height: 64, paddingBottom: 8, paddingTop: 6 },
      tabBarActiveTintColor: '#4C1D95', tabBarInactiveTintColor: '#94A3B8',
      tabBarLabelStyle: { fontSize: 10, fontWeight: '700' },
    }}
  >
    <Tab.Screen name="Home"       component={TeacherHome}       options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🏠</Text>, tabBarLabel: 'Home' }} />
    <Tab.Screen name="Attendance" component={AttendanceScreen}  options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>✅</Text>, tabBarLabel: 'Attendance' }} />
    <Tab.Screen name="Homework"   component={HomeworkScreen}    options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>📝</Text>, tabBarLabel: 'Homework' }} />
    <Tab.Screen name="Students"   component={StudentsScreen}    options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>👥</Text>, tabBarLabel: 'Students' }} />
  </Tab.Navigator>
);

const s = StyleSheet.create({
  header: { paddingTop: 52, paddingBottom: 16, paddingHorizontal: 18 },
  headerLabel: { fontSize: 10, color: 'rgba(255,255,255,0.55)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#fff' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 2 },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  scroll: { padding: 16, paddingBottom: 32 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: C.slate900, marginBottom: 10, marginTop: 4 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  miniStat: { flex: 1, alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  miniStatVal: { fontSize: 18, fontWeight: '900', marginTop: 2 },
  miniStatLabel: { fontSize: 9, color: C.slate500, fontWeight: '600', marginTop: 2, textAlign: 'center' },
  quickAction: { flex: 1, borderRadius: 16, padding: 16, alignItems: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, borderColor: C.slate200 },
  searchInput: { flex: 1, fontSize: 14, color: C.slate900 },
  miniChip: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  markAllBtn: { backgroundColor: '#D1FAE5', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  saveBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', padding: 16, borderTopWidth: 0.5, borderColor: C.slate200 },
  saveBtn: { backgroundColor: C.brand, borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  addBtn: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  formLabel: { fontSize: 12, fontWeight: '700', color: C.slate700, marginBottom: 6 },
  formInput: { backgroundColor: C.slate100, borderRadius: 12, padding: 14, fontSize: 14, color: C.slate900, marginBottom: 14, borderWidth: 1, borderColor: C.slate200 },
  subjectChip: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1.5, borderColor: C.slate200, backgroundColor: '#fff' },
});
