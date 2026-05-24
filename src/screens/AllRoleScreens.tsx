import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, TextInput, Switch, ActivityIndicator, Alert,
} from 'react-native';
// LinearGradient removed for APK stability
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useStore } from '../store';
import { colors, typography, spacing, radius, shadows, ROLES } from '../utils/design';
import { Card, Badge, StatCard, ProgressBar, EmptyState, Avatar, SectionHeader, Button, ListItem, Chip, Input } from '../components/shared/index';
import {
  useFeeRecords, useMarkFeePaid, useBusRoute,
  useClassStudents, useTodayAttendance, useSaveAttendance,
  useTeacherHomework, useCreateHomework, useSyllabus, useSaveChapter,
  useStudentsWithWeakness, useAdminDashboard, useAdminFees,
  useAdminMarkFeePaid, useSendNotification, useTickets, useResolveTicket,
  usePrincipalOverview, useClassPerformance, useAllSchools,
  usePlatformStats, updateDriverLocation, markStopArrived,
  useHomework, useAttendanceCalendar, useAttendanceRate,
} from '../utils/api';
import { supabase } from '../utils/supabase';
import { useQueryClient } from '@tanstack/react-query';

// ─── Shared ───────────────────────────────────────────────────────────────────
function LogoutBtn() {
  const { logout } = useStore();
  return (
    <TouchableOpacity onPress={logout} style={s.logoutBtn} activeOpacity={0.8}>
      <Ionicons name="log-out-outline" size={18} color={colors.danger} />
    </TouchableOpacity>
  );
}

function RoleHeader({ role, title, subtitle, color, icon }: { role: string; title: string; subtitle: string; color: string; icon: string }) {
  return (
    <View style={[s.roleHeader, { backgroundColor: color }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Text style={{ fontSize: 18 }}>{icon}</Text>
            <Text style={s.roleHeaderTag}>{role}</Text>
          </View>
          <Text style={s.roleHeaderTitle}>{title}</Text>
          <Text style={s.roleHeaderSub}>{subtitle}</Text>
        </View>
        <LogoutBtn />
      </View>
    </View>
  );
}

function useToast() {
  const [toast, setToast] = useState('');
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };
  const ToastView = toast ? (
    <View style={s.toastOverlay}><Text style={s.toastText}>{toast}</Text></View>
  ) : null;
  return { showToast, ToastView };
}

// ═══════════════════════════════════════════════════════════════════════════════
// PARENT SCREENS
// ═══════════════════════════════════════════════════════════════════════════════
export function ParentHome({ navigation }: any) {
  const { user } = useStore();
  const { data: fees = [] } = useFeeRecords(user?.childId);
  const { data: attendance } = useAttendanceRate(user?.childId);
  const pendingFee = fees.find((f: any) => f.status === 'pending');
  const roleInfo = ROLES.parent;

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scrollPb} showsVerticalScrollIndicator={false}>
        <RoleHeader role="Parent" title={user?.name ?? ''} subtitle={`Guardian of ${user?.childName ?? 'your child'}`} color={roleInfo.color} icon={roleInfo.icon} />

        <View style={s.content}>
          {/* Child overview */}
          <Card variant="elevated">
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <Avatar name={user?.childName ?? 'S'} size={52} color={colors.brand} />
              <View>
                <Text style={{ fontSize: typography.lg, fontWeight: typography.extrabold, color: colors.gray900 }}>{user?.childName}</Text>
                <Text style={{ fontSize: typography.sm, color: colors.gray400 }}>{user?.school}</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <StatCard value={`${attendance ?? 0}%`} label="Attendance" color={attendance && attendance >= 75 ? colors.success : colors.danger} style={{ flex: 1 }} />
              <StatCard value={pendingFee ? `₹${pendingFee.amount.toLocaleString()}` : '✓'} label="Fees" color={pendingFee ? colors.danger : colors.success} style={{ flex: 1 }} />
            </View>
          </Card>

          {/* Pending fee alert */}
          {pendingFee && (
            <Card color={colors.dangerBg} style={{ borderWidth: 1, borderColor: colors.dangerText + '40' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={{ fontSize: typography.sm, fontWeight: typography.bold, color: colors.dangerText }}>⚠️ Fee Due</Text>
                  <Text style={{ fontSize: typography.xs, color: colors.dangerText + 'cc', marginTop: 2 }}>{pendingFee.term} · Due {new Date(pendingFee.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</Text>
                </View>
                <Text style={{ fontSize: typography.xl, fontWeight: typography.extrabold, color: colors.dangerText }}>₹{pendingFee.amount.toLocaleString()}</Text>
              </View>
              <Button label="Pay via UPI" onPress={() => navigation.navigate('Fees')} variant="danger" size="sm" style={{ marginTop: 10 }} />
            </Card>
          )}

          {/* Quick nav */}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {[
              { icon: '📅', label: 'Attendance', screen: 'Attendance', color: colors.brand },
              { icon: '💰', label: 'Fees', screen: 'Fees', color: colors.success },
              { icon: '🚌', label: 'Bus', screen: 'Bus', color: colors.warning },
            ].map(item => (
              <TouchableOpacity key={item.screen} style={[s.navCard, { backgroundColor: item.color + '12', borderColor: item.color + '30' }]} onPress={() => navigation.navigate(item.screen)} activeOpacity={0.8}>
                <Text style={{ fontSize: 28, marginBottom: 6 }}>{item.icon}</Text>
                <Text style={{ fontSize: typography.xs, fontWeight: typography.semibold, color: item.color }}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function AttendanceCalendarScreen() {
  const { user } = useStore();
  const { data: cal = [] } = useAttendanceCalendar(user?.childId);
  const { data: rate } = useAttendanceRate(user?.childId);
  const presentCount = cal.filter((d: any) => d.status === 'present').length;
  const absentCount = cal.filter((d: any) => d.status === 'absent').length;

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scrollPb}>
        <View style={s.content}>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: spacing.md }}>
            <StatCard value={`${rate ?? 0}%`} label="Overall Rate" color={rate && rate >= 75 ? colors.success : colors.danger} icon="calendar" style={{ flex: 1 }} />
            <StatCard value={presentCount} label="Present" color={colors.success} style={{ flex: 1 }} />
            <StatCard value={absentCount} label="Absent" color={colors.danger} style={{ flex: 1 }} />
          </View>
          <SectionHeader title="Last 60 Days" />
          <Card>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {cal.slice(0, 60).map((day: any, i: number) => (
                <View key={i} style={{ alignItems: 'center', gap: 2 }}>
                  <View style={[s.calDot, { backgroundColor: day.status === 'present' ? colors.success : day.status === 'absent' ? colors.danger : colors.gray200 }]} />
                </View>
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: 16, marginTop: 14 }}>
              {[['Present', colors.success], ['Absent', colors.danger], ['Holiday', colors.gray200]].map(([l, c]: any) => (
                <View key={l} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <View style={[s.calDot, { backgroundColor: c as string }]} />
                  <Text style={{ fontSize: typography.xs, color: colors.gray500 }}>{l}</Text>
                </View>
              ))}
            </View>
          </Card>
          <SectionHeader title="Recent Records" />
          <Card>
            {cal.slice(0, 15).map((day: any, i: number) => (
              <View key={i} style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 }, i < 14 && { borderBottomWidth: 0.5, borderColor: colors.gray100 }]}>
                <Text style={{ fontSize: typography.sm, color: colors.gray700 }}>{new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</Text>
                <Badge label={day.status === 'present' ? '✓ Present' : '✗ Absent'} variant={day.status === 'present' ? 'success' : 'danger'} />
              </View>
            ))}
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function FeePaymentScreen() {
  const { user } = useStore();
  const { data: fees = [] } = useFeeRecords(user?.childId);
  const markPaid = useMarkFeePaid();
  const [paying, setPaying] = useState<string | null>(null);
  const { showToast, ToastView } = useToast();

  const handlePay = async (feeId: string, amount: number) => {
    setPaying(feeId);
    await markPaid.mutateAsync(feeId);
    setPaying(null);
    showToast(`✅ ₹${amount.toLocaleString()} payment recorded`);
  };

  const total = fees.reduce((a: number, f: any) => a + (f.status === 'pending' ? f.amount : 0), 0);

  return (
    <SafeAreaView style={s.safe}>
      {ToastView}
      <ScrollView contentContainerStyle={s.scrollPb}>
        <View style={s.content}>
          {total > 0 && (
            <Card color={colors.dangerBg} style={{ borderWidth: 1, borderColor: colors.dangerText + '40', marginBottom: spacing.md }}>
              <Text style={{ fontSize: typography.sm, color: colors.dangerText, fontWeight: typography.semibold }}>Total Pending</Text>
              <Text style={{ fontSize: typography['3xl'], fontWeight: typography.extrabold, color: colors.dangerText, marginTop: 4 }}>₹{total.toLocaleString()}</Text>
            </Card>
          )}
          <SectionHeader title="Fee Records" />
          {fees.map((fee: any) => (
            <Card key={fee.id} variant="elevated">
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <View>
                  <Text style={{ fontSize: typography.base, fontWeight: typography.bold, color: colors.gray900 }}>{fee.term}</Text>
                  <Text style={{ fontSize: typography.xs, color: colors.gray400, marginTop: 2 }}>Due: {new Date(fee.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: typography.xl, fontWeight: typography.extrabold, color: fee.status === 'paid' ? colors.success : colors.danger }}>₹{Number(fee.amount).toLocaleString()}</Text>
                  <Badge label={fee.status === 'paid' ? '✓ Paid' : '⚠ Pending'} variant={fee.status === 'paid' ? 'success' : 'danger'} />
                </View>
              </View>
              {fee.status === 'pending' && (
                <Button label={paying === fee.id ? 'Recording...' : 'Mark as Paid'} onPress={() => handlePay(fee.id, fee.amount)} loading={paying === fee.id} variant="success" size="sm" />
              )}
              {fee.status === 'paid' && fee.paid_at && (
                <Text style={{ fontSize: typography.xs, color: colors.success }}>Paid on {new Date(fee.paid_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
              )}
            </Card>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function BusTrackingScreen() {
  const { user } = useStore();
  const { data: busData } = useBusRoute(user?.routeId);

  if (!user?.routeId) return (
    <SafeAreaView style={s.safe}>
      <EmptyState emoji="🚌" title="No Bus Route" subtitle="Contact admin to be assigned to a bus route" />
    </SafeAreaView>
  );

  const { route, stops = [], trip } = (busData ?? {}) as any;
  const completedStops = trip?.stops_completed ?? {};

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scrollPb}>
        <View style={s.content}>
          <Card color={ROLES.driver.bg}>
            <Text style={{ fontSize: typography.xs, color: ROLES.driver.color, fontWeight: typography.bold, textTransform: 'uppercase', letterSpacing: 1 }}>Bus Route</Text>
            <Text style={{ fontSize: typography.xl, fontWeight: typography.extrabold, color: colors.gray900, marginTop: 4 }}>{route?.route_name}</Text>
            <Text style={{ fontSize: typography.sm, color: colors.gray500, marginTop: 2 }}>Vehicle: {route?.vehicle_number} · Driver: {(route as any)?.users?.name}</Text>
          </Card>
          <SectionHeader title="Stops" subtitle={`${Object.keys(completedStops).length} of ${stops.length} completed`} />
          <Card>
            {stops.map((stop: any, i: number) => {
              const done = !!completedStops[stop.id];
              const isCurrent = !done && Object.keys(completedStops).length === i;
              return (
                <View key={stop.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: i < stops.length - 1 ? 0.5 : 0, borderColor: colors.gray100 }}>
                  <View style={[s.stopDot, done ? { backgroundColor: colors.success } : isCurrent ? { backgroundColor: colors.brand, ...shadows.sm } : { backgroundColor: colors.gray200 }]}>
                    {done ? <Ionicons name="checkmark" size={12} color={colors.white} /> : <Text style={{ fontSize: 10, fontWeight: typography.bold, color: isCurrent ? colors.white : colors.gray400 }}>{i + 1}</Text>}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[{ fontSize: typography.sm, fontWeight: typography.semibold }, done ? { color: colors.gray400 } : { color: colors.gray900 }]}>{stop.stop_name}</Text>
                    <Text style={{ fontSize: typography.xs, color: colors.gray400 }}>{stop.estimated_time}</Text>
                  </View>
                  {isCurrent && <Badge label="Next stop" variant="brand" dot />}
                  {done && <Badge label="Arrived" variant="success" />}
                </View>
              );
            })}
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEACHER SCREENS
// ═══════════════════════════════════════════════════════════════════════════════
export function TeacherHome({ navigation }: any) {
  const { user } = useStore();
  const { data: hw = [] } = useTeacherHomework(user?.id);
  const { data: attendance } = useTodayAttendance(user?.classId);
  const { data: students = [] } = useClassStudents(user?.classId);
  const roleInfo = ROLES.teacher;
  const pendingVerify = hw.filter((h: any) => (h.homework_submissions ?? []).some((s: any) => !s.verified_by_teacher)).length;
  const markedToday = attendance?.length ?? 0;

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scrollPb} showsVerticalScrollIndicator={false}>
        <RoleHeader role="Teacher" title={user?.name ?? ''} subtitle={`${user?.subject} · Class ${user?.className}`} color={roleInfo.color} icon={roleInfo.icon} />
        <View style={s.content}>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: spacing.md }}>
            <StatCard value={students.length} label="Students" icon="people-outline" color={colors.brand} style={{ flex: 1 }} />
            <StatCard value={markedToday} label="Marked Today" icon="calendar-outline" color={markedToday === students.length ? colors.success : colors.warning} style={{ flex: 1 }} />
            <StatCard value={pendingVerify} label="To Verify" icon="checkmark-circle-outline" color={pendingVerify > 0 ? colors.danger : colors.success} style={{ flex: 1 }} />
          </View>
          {[
            { icon: '✅', label: 'Mark Attendance', sub: `${markedToday}/${students.length} marked today`, screen: 'Attendance', color: colors.brand },
            { icon: '📝', label: 'Homework', sub: `${pendingVerify} submissions to verify`, screen: 'Homework', color: '#f59e0b' },
            { icon: '📚', label: 'Syllabus', sub: 'Manage chapters and topics', screen: 'Syllabus', color: colors.success },
            { icon: '👥', label: 'Students', sub: 'View class roster and performance', screen: 'Students', color: '#7c3aed' },
          ].map(item => (
            <Card key={item.screen} onPress={() => navigation.navigate(item.screen)} variant="elevated">
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <View style={[s.hwIcon, { backgroundColor: item.color + '15' }]}>
                  <Text style={{ fontSize: 24 }}>{item.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: typography.base, fontWeight: typography.bold, color: colors.gray900 }}>{item.label}</Text>
                  <Text style={{ fontSize: typography.xs, color: colors.gray400, marginTop: 2 }}>{item.sub}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.gray300} />
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function TeacherAttendanceScreen() {
  const { user } = useStore();
  const { data: students = [], isLoading } = useClassStudents(user?.classId);
  const { data: existing = [] } = useTodayAttendance(user?.classId);
  const saveAttendance = useSaveAttendance();
  const { showToast, ToastView } = useToast();
  const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent'>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const map: Record<string, 'present' | 'absent'> = {};
    existing.forEach((a: any) => { map[a.student_id] = a.status; });
    if (Object.keys(map).length > 0) setAttendance(map);
  }, [existing]);

  const toggle = (id: string) => {
    if (saved) return;
    setAttendance(a => ({ ...a, [id]: a[id] === 'present' ? 'absent' : 'present' }));
  };

  const markAll = (status: 'present' | 'absent') => {
    const map: Record<string, 'present' | 'absent'> = {};
    students.forEach((s: any) => { map[s.id] = status; });
    setAttendance(map);
  };

  const handleSave = async () => {
    const records = students.map((st: any) => ({
      classId: user!.classId!, studentId: st.id,
      status: attendance[st.id] ?? 'absent', markedBy: user!.id,
    }));
    await saveAttendance.mutateAsync(records);
    setSaved(true);
    const presentCount = Object.values(attendance).filter(v => v === 'present').length;
    showToast(`✅ Attendance saved · ${presentCount}/${students.length} present`);
  };

  const presentCount = students.filter((s: any) => attendance[s.id] === 'present').length;

  return (
    <SafeAreaView style={s.safe}>
      {ToastView}
      <ScrollView contentContainerStyle={s.scrollPb} keyboardShouldPersistTaps="handled">
        <View style={s.content}>
          <Card variant="elevated">
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <View>
                <Text style={{ fontSize: typography.xl, fontWeight: typography.extrabold, color: colors.gray900 }}>{presentCount}/{students.length}</Text>
                <Text style={{ fontSize: typography.xs, color: colors.gray400 }}>Present today</Text>
              </View>
              <ProgressBar value={students.length > 0 ? (presentCount / students.length) * 100 : 0} color={colors.success} />
            </View>
            {!saved && (
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Button label="All Present" onPress={() => markAll('present')} variant="success" size="sm" style={{ flex: 1 }} />
                <Button label="All Absent" onPress={() => markAll('absent')} variant="danger" size="sm" style={{ flex: 1 }} />
              </View>
            )}
          </Card>
          {isLoading ? <ActivityIndicator color={colors.brand} style={{ padding: 40 }} /> :
            <Card>
              {students.map((st: any, i: number) => {
                const isPresent = attendance[st.id] === 'present';
                return (
                  <TouchableOpacity key={st.id} onPress={() => toggle(st.id)} style={[{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 }, i < students.length - 1 && { borderBottomWidth: 0.5, borderColor: colors.gray100 }]} activeOpacity={0.8}>
                    <Text style={{ fontSize: typography.sm, color: colors.gray400, width: 28 }}>#{st.rollNumber}</Text>
                    <Avatar name={st.name} size={36} color={isPresent ? colors.success : colors.danger} />
                    <Text style={{ flex: 1, fontSize: typography.sm, fontWeight: typography.semibold, color: colors.gray900 }}>{st.name}</Text>
                    <View style={[s.attendToggle, { backgroundColor: isPresent ? colors.success : colors.gray200 }]}>
                      <Ionicons name={isPresent ? 'checkmark' : 'close'} size={14} color={colors.white} />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </Card>
          }
          {!saved && students.length > 0 && (
            <Button label={saveAttendance.isPending ? 'Saving...' : 'Save Attendance'} onPress={handleSave} loading={saveAttendance.isPending} gradient style={{ borderRadius: radius.md }} />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function TeacherHomeworkScreen() {
  const { user } = useStore();
  const { data: homework = [] } = useTeacherHomework(user?.id);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', dueDate: '', subjectId: user?.subjectId ?? '' });
  const createHW = useCreateHomework();
  const { showToast, ToastView } = useToast();
  const { data: subjects = [] } = useQuery({ queryKey: ['subjects', user?.schoolId], queryFn: async () => { const { data } = await supabase.from('subjects').select('id, name').eq('school_id', user!.schoolId); return data ?? []; }, enabled: !!user?.schoolId });

  const handleCreate = async () => {
    if (!form.title || !form.dueDate) { showToast('⚠️ Title and due date required'); return; }
    await createHW.mutateAsync({ teacherId: user!.id, classId: user!.classId!, subjectId: form.subjectId || user!.subjectId!, title: form.title, description: form.description, dueDate: form.dueDate });
    setForm({ title: '', description: '', dueDate: '', subjectId: user?.subjectId ?? '' });
    setShowCreate(false);
    showToast('✅ Homework assigned');
  };

  return (
    <SafeAreaView style={s.safe}>
      {ToastView}
      <ScrollView contentContainerStyle={s.scrollPb} keyboardShouldPersistTaps="handled">
        <View style={s.content}>
          <Button label={showCreate ? 'Cancel' : '+ Assign Homework'} onPress={() => setShowCreate(v => !v)} variant={showCreate ? 'secondary' : 'primary'} style={{ marginBottom: spacing.md, borderRadius: radius.md }} />
          {showCreate && (
            <Card variant="elevated">
              <Input label="Title *" value={form.title} onChangeText={t => setForm(p => ({ ...p, title: t }))} placeholder="e.g. Chapter 4 Exercise" />
              <Input label="Description" value={form.description} onChangeText={t => setForm(p => ({ ...p, description: t }))} placeholder="Instructions for students" multiline numberOfLines={3} />
              <Input label="Due Date *" value={form.dueDate} onChangeText={t => setForm(p => ({ ...p, dueDate: t }))} placeholder="YYYY-MM-DD" />
              <Button label={createHW.isPending ? 'Assigning...' : 'Assign'} onPress={handleCreate} loading={createHW.isPending} variant="success" />
            </Card>
          )}
          {homework.map((hw: any) => {
            const submissions = hw.homework_submissions ?? [];
            const pending = submissions.filter((s: any) => !s.verified_by_teacher).length;
            return (
              <Card key={hw.id} variant="elevated">
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: typography.base, fontWeight: typography.bold, color: colors.gray900, marginBottom: 2 }}>{hw.title}</Text>
                    <Text style={{ fontSize: typography.xs, color: colors.gray400 }}>{(hw as any).subjects?.name} · Due {new Date(hw.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</Text>
                  </View>
                  {pending > 0 && <Badge label={`${pending} to verify`} variant="warning" />}
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Badge label={`${submissions.length} submitted`} variant="info" />
                  <Badge label={`${submissions.filter((s: any) => s.verified_by_teacher).length} verified`} variant="success" />
                </View>
              </Card>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function useQuery({ queryKey, queryFn, enabled }: any) {
  const [data, setData] = useState<any>(undefined);
  useEffect(() => {
    if (enabled === false) return;
    queryFn().then(setData).catch(console.warn);
  }, [JSON.stringify(queryKey)]);
  return { data };
}

export function TeacherSyllabusScreen() {
  const { user } = useStore();
  const { data: chapters = [] } = useSyllabus(user?.classId, user?.subjectId);
  const saveChapter = useSaveChapter();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ chapterName: '', topics: '', term: '1' });
  const { showToast, ToastView } = useToast();

  const handleSave = async () => {
    if (!form.chapterName) { showToast('⚠️ Chapter name required'); return; }
    await saveChapter.mutateAsync({ teacherId: user!.id, classId: user!.classId!, subjectId: user!.subjectId!, chapterName: form.chapterName, topics: form.topics, term: Number(form.term) });
    setForm({ chapterName: '', topics: '', term: '1' });
    setShowAdd(false);
    showToast('✅ Chapter added');
  };

  const term1 = chapters.filter((c: any) => c.term === 1);
  const term2 = chapters.filter((c: any) => c.term === 2);

  return (
    <SafeAreaView style={s.safe}>
      {ToastView}
      <ScrollView contentContainerStyle={s.scrollPb} keyboardShouldPersistTaps="handled">
        <View style={s.content}>
          <Button label={showAdd ? 'Cancel' : '+ Add Chapter'} onPress={() => setShowAdd(v => !v)} variant={showAdd ? 'secondary' : 'primary'} style={{ marginBottom: spacing.md, borderRadius: radius.md }} />
          {showAdd && (
            <Card variant="elevated">
              <Input label="Chapter Name *" value={form.chapterName} onChangeText={t => setForm(p => ({ ...p, chapterName: t }))} placeholder="e.g. Chapter 4 - Quadratic Equations" />
              <Input label="Topics Covered" value={form.topics} onChangeText={t => setForm(p => ({ ...p, topics: t }))} placeholder="List of topics" multiline numberOfLines={2} />
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: spacing.md }}>
                {['1', '2'].map(t => <Chip key={t} label={`Term ${t}`} selected={form.term === t} onPress={() => setForm(p => ({ ...p, term: t }))} />)}
              </View>
              <Button label={saveChapter.isPending ? 'Saving...' : 'Save Chapter'} onPress={handleSave} loading={saveChapter.isPending} variant="success" />
            </Card>
          )}
          {[{ term: 1, data: term1 }, { term: 2, data: term2 }].map(({ term, data }) => (
            <View key={term}>
              <SectionHeader title={`Term ${term}`} subtitle={`${data.length} chapters`} />
              {data.length === 0 ? <EmptyState emoji="📚" title="No chapters yet" subtitle="Add chapters above" /> :
                data.map((ch: any) => (
                  <Card key={ch.id}>
                    <Text style={{ fontSize: typography.base, fontWeight: typography.bold, color: colors.gray900, marginBottom: 4 }}>{ch.chapter_name}</Text>
                    {ch.topics_covered && <Text style={{ fontSize: typography.sm, color: colors.gray500 }}>{ch.topics_covered}</Text>}
                  </Card>
                ))
              }
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function TeacherStudentsScreen() {
  const { user } = useStore();
  const { data: students = [] } = useClassStudents(user?.classId);
  const { data: weaknesses = [] } = useStudentsWithWeakness(user?.classId);
  const [search, setSearch] = useState('');
  const filtered = students.filter((s: any) => s.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scrollPb} keyboardShouldPersistTaps="handled">
        <View style={s.content}>
          <View style={s.searchBox}>
            <Ionicons name="search-outline" size={16} color={colors.gray400} />
            <TextInput style={s.searchInput} placeholder="Search students..." value={search} onChangeText={setSearch} placeholderTextColor={colors.gray400} />
            {!!search && <TouchableOpacity onPress={() => setSearch('')}><Ionicons name="close-circle" size={16} color={colors.gray400} /></TouchableOpacity>}
          </View>
          <Card>
            {filtered.map((st: any, i: number) => {
              const weak = (weaknesses as any[]).find(w => w.student_id === st.id);
              return (
                <View key={st.id} style={[{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 }, i < filtered.length - 1 && { borderBottomWidth: 0.5, borderColor: colors.gray100 }]}>
                  <Text style={{ fontSize: typography.xs, color: colors.gray400, width: 24 }}>#{i + 1}</Text>
                  <Avatar name={st.name} size={38} color={colors.brand} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: typography.sm, fontWeight: typography.semibold, color: colors.gray900 }}>{st.name}</Text>
                    {weak && <Text style={{ fontSize: typography.xs, color: colors.warning, marginTop: 1 }}>⚠ Weak: {weak.weak_topics?.join(', ')}</Text>}
                  </View>
                  <Text style={{ fontSize: typography.xs, color: colors.gray400 }}>{st.phone}</Text>
                </View>
              );
            })}
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN SCREENS
// ═══════════════════════════════════════════════════════════════════════════════
export function AdminHome({ navigation }: any) {
  const { user } = useStore();
  const { data: stats } = useAdminDashboard(user?.schoolId);
  const roleInfo = ROLES.admin;

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scrollPb} showsVerticalScrollIndicator={false}>
        <RoleHeader role="School Admin" title={user?.name ?? ''} subtitle={user?.school ?? ''} color={roleInfo.color} icon={roleInfo.icon} />
        <View style={s.content}>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
            <StatCard value={stats?.totalStudents ?? 0} label="Students" icon="people-outline" color={colors.brand} style={{ flex: 1 }} />
            <StatCard value={stats?.totalTeachers ?? 0} label="Teachers" icon="school-outline" color={colors.success} style={{ flex: 1 }} />
          </View>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: spacing.md }}>
            <StatCard value={`${stats?.attendanceToday ?? 0}%`} label="Today's Attendance" icon="calendar-outline" color={stats?.attendanceToday && stats.attendanceToday >= 75 ? colors.success : colors.warning} style={{ flex: 1 }} />
            <StatCard value={stats?.openTickets ?? 0} label="Open Tickets" icon="help-circle-outline" color={stats?.openTickets ? colors.danger : colors.success} style={{ flex: 1 }} />
          </View>
          {[
            { icon: '👥', label: 'User Management', sub: 'Create and manage school accounts', screen: 'Users', color: colors.brand },
            { icon: '💰', label: 'Fee Management', sub: `${stats?.pendingFees ?? 0} pending payments`, screen: 'Fees', color: colors.success },
            { icon: '📢', label: 'Send Notification', sub: 'Notify parents, teachers, or students', screen: 'Notify', color: '#7c3aed' },
            { icon: '🎫', label: 'Support Tickets', sub: `${stats?.openTickets ?? 0} open tickets`, screen: 'Tickets', color: colors.warning },
          ].map(item => (
            <Card key={item.screen} onPress={() => navigation.navigate(item.screen)} variant="elevated">
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <View style={[s.hwIcon, { backgroundColor: item.color + '15' }]}>
                  <Text style={{ fontSize: 24 }}>{item.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: typography.base, fontWeight: typography.bold, color: colors.gray900 }}>{item.label}</Text>
                  <Text style={{ fontSize: typography.xs, color: colors.gray400, marginTop: 2 }}>{item.sub}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.gray300} />
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function AdminFeesScreen() {
  const { user } = useStore();
  const { data: fees = [] } = useAdminFees(user?.schoolId);
  const markPaid = useAdminMarkFeePaid();
  const { showToast, ToastView } = useToast();
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('pending');

  const filtered = fees.filter((f: any) => filter === 'all' || f.status === filter);
  const totalPending = fees.filter((f: any) => f.status === 'pending').reduce((a: number, f: any) => a + Number(f.amount), 0);

  return (
    <SafeAreaView style={s.safe}>
      {ToastView}
      <ScrollView contentContainerStyle={s.scrollPb}>
        <View style={s.content}>
          <Card color={colors.successBg} style={{ borderWidth: 1, borderColor: colors.success + '40' }}>
            <Text style={{ fontSize: typography.xs, color: colors.successText, fontWeight: typography.semibold }}>Total Outstanding</Text>
            <Text style={{ fontSize: typography['3xl'], fontWeight: typography.extrabold, color: colors.successText }}>₹{totalPending.toLocaleString()}</Text>
          </Card>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: spacing.md }}>
            {(['all', 'pending', 'paid'] as const).map(f => <Chip key={f} label={f.charAt(0).toUpperCase() + f.slice(1)} selected={filter === f} onPress={() => setFilter(f)} />)}
          </View>
          {filtered.map((fee: any) => (
            <Card key={fee.id}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: fee.status === 'pending' ? 10 : 0 }}>
                <View>
                  <Text style={{ fontSize: typography.sm, fontWeight: typography.bold, color: colors.gray900 }}>{(fee as any).users?.name}</Text>
                  <Text style={{ fontSize: typography.xs, color: colors.gray400, marginTop: 1 }}>{fee.term}</Text>
                  <Text style={{ fontSize: typography.xs, color: colors.gray400 }}>Due: {new Date(fee.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Text style={{ fontSize: typography.xl, fontWeight: typography.extrabold, color: fee.status === 'paid' ? colors.success : colors.danger }}>₹{Number(fee.amount).toLocaleString()}</Text>
                  <Badge label={fee.status === 'paid' ? '✓ Paid' : 'Pending'} variant={fee.status === 'paid' ? 'success' : 'danger'} />
                </View>
              </View>
              {fee.status === 'pending' && (
                <Button label="Mark as Paid" onPress={async () => { await markPaid.mutateAsync(fee.id); showToast('✅ Fee marked as paid'); }} variant="success" size="sm" loading={markPaid.isPending} />
              )}
            </Card>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function AdminNotifyScreen() {
  const { user } = useStore();
  const sendNotif = useSendNotification();
  const { showToast, ToastView } = useToast();
  const [form, setForm] = useState({ title: '', message: '', channel: 'app', targetRole: 'all' });

  const handleSend = async () => {
    if (!form.title || !form.message) { showToast('⚠️ Title and message required'); return; }
    await sendNotif.mutateAsync({ schoolId: user!.schoolId, sentBy: user!.id, targetRole: form.targetRole !== 'all' ? form.targetRole : undefined, channel: form.channel, title: form.title, message: form.message });
    setForm({ title: '', message: '', channel: 'app', targetRole: 'all' });
    showToast('✅ Notification sent');
  };

  return (
    <SafeAreaView style={s.safe}>
      {ToastView}
      <ScrollView contentContainerStyle={s.scrollPb} keyboardShouldPersistTaps="handled">
        <View style={s.content}>
          <SectionHeader title="Target Audience" />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.md }}>
            {[['all', 'Everyone'], ['student', 'Students'], ['parent', 'Parents'], ['teacher', 'Teachers']].map(([val, label]: any) => (
              <Chip key={val} label={label} selected={form.targetRole === val} onPress={() => setForm(p => ({ ...p, targetRole: val }))} />
            ))}
          </View>
          <SectionHeader title="Channel" />
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: spacing.md }}>
            {[['app', '📱 In-App'], ['whatsapp', '💬 WhatsApp'], ['email', '📧 Email']].map(([val, label]: any) => (
              <Chip key={val} label={label} selected={form.channel === val} onPress={() => setForm(p => ({ ...p, channel: val }))} />
            ))}
          </View>
          <Input label="Title *" value={form.title} onChangeText={t => setForm(p => ({ ...p, title: t }))} placeholder="e.g. School Holiday on Monday" />
          <Input label="Message *" value={form.message} onChangeText={t => setForm(p => ({ ...p, message: t }))} placeholder="Write your message here..." multiline numberOfLines={4} />
          <Button label={sendNotif.isPending ? 'Sending...' : 'Send Notification'} onPress={handleSend} loading={sendNotif.isPending} gradient style={{ borderRadius: radius.md }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function SupportTicketsScreen() {
  const { user } = useStore();
  const { data: tickets = [] } = useTickets(user?.schoolId);
  const resolve = useResolveTicket();
  const { showToast, ToastView } = useToast();
  const [filter, setFilter] = useState<'open' | 'resolved'>('open');

  const filtered = tickets.filter((t: any) => t.status === filter || (filter === 'open' && t.status === 'in_progress'));

  return (
    <SafeAreaView style={s.safe}>
      {ToastView}
      <ScrollView contentContainerStyle={s.scrollPb}>
        <View style={s.content}>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: spacing.md }}>
            <Chip label={`Open (${tickets.filter((t: any) => t.status === 'open').length})`} selected={filter === 'open'} onPress={() => setFilter('open')} />
            <Chip label="Resolved" selected={filter === 'resolved'} onPress={() => setFilter('resolved')} />
          </View>
          {filtered.length === 0 ? <EmptyState emoji="🎉" title={filter === 'open' ? 'No open tickets' : 'No resolved tickets'} /> :
            filtered.map((ticket: any) => (
              <Card key={ticket.id} variant="elevated">
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: typography.sm, fontWeight: typography.bold, color: colors.gray900 }}>{(ticket as any).users?.name}</Text>
                    <Text style={{ fontSize: typography.xs, color: colors.gray400 }}>{(ticket as any).users?.role} · {new Date(ticket.raised_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</Text>
                  </View>
                  <Badge label={ticket.priority} variant={ticket.priority === 'high' ? 'danger' : ticket.priority === 'medium' ? 'warning' : 'default'} />
                </View>
                <Text style={{ fontSize: typography.sm, color: colors.gray600, lineHeight: 20, marginBottom: 10 }}>{ticket.description}</Text>
                {ticket.status === 'open' && (
                  <Button label={resolve.isPending ? 'Resolving...' : 'Mark Resolved'} onPress={async () => { await resolve.mutateAsync(ticket.id); showToast('✅ Ticket resolved'); }} loading={resolve.isPending} variant="success" size="sm" />
                )}
              </Card>
            ))
          }
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Admin User Management
export function AdminUsersScreen() {
  const { user } = useStore();
  const qc = useQueryClient();
  const { showToast, ToastView } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', role: 'student' as any, classId: '', subjectId: '' });
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [creating, setCreating] = useState(false);
  const [lastCreated, setLastCreated] = useState<{ name: string; password: string } | null>(null);

  useEffect(() => {
    if (!user?.schoolId) return;
    supabase.from('users').select('id, name, phone, role, is_active, created_at').eq('school_id', user.schoolId).order('created_at', { ascending: false }).then(({ data }) => setUsers(data ?? []));
    supabase.from('classes').select('id, name').eq('school_id', user.schoolId).then(({ data }) => setClasses(data ?? []));
    supabase.from('subjects').select('id, name').eq('school_id', user.schoolId).then(({ data }) => setSubjects(data ?? []));
  }, [user?.schoolId]);

  const generatePassword = () => {
    const words = ['Star', 'Moon', 'Fire', 'Wave', 'Hill'];
    return `${words[Math.floor(Math.random() * words.length)]}@${Math.floor(1000 + Math.random() * 9000)}`;
  };

  const handleCreate = async () => {
    if (!form.name || !form.phone || form.phone.length !== 10) { showToast('⚠️ Name and 10-digit phone required'); return; }
    setCreating(true);
    try {
      const password = generatePassword();
      const email = `${form.phone}@eduspark.in`;
      const { data: authData, error: authErr } = await supabase.auth.signUp({ email, password });
      if (authErr) throw authErr;
      if (!authData.user) throw new Error('Failed to create account');
      await supabase.from('users').insert({ id: authData.user.id, school_id: user!.schoolId, name: form.name, phone: form.phone, email, role: form.role, is_active: true });
      if (form.role === 'student' && form.classId) {
        await supabase.from('class_enrollments').insert({ class_id: form.classId, student_id: authData.user.id, academic_year: '2024-25' });
        await supabase.from('student_xp').insert({ student_id: authData.user.id, total_xp: 0, current_level: 1, xp_to_next_level: 500 });
      }
      if ((form.role === 'teacher' || form.role === 'class_teacher') && form.classId && form.subjectId) {
        await supabase.from('teacher_assignments').insert({ teacher_id: authData.user.id, class_id: form.classId, subject_id: form.subjectId, academic_year: '2024-25' });
      }
      setLastCreated({ name: form.name, password });
      setForm({ name: '', phone: '', role: 'student', classId: '', subjectId: '' });
      supabase.from('users').select('id, name, phone, role, is_active, created_at').eq('school_id', user!.schoolId).order('created_at', { ascending: false }).then(({ data }) => setUsers(data ?? []));
      showToast(`✅ ${form.name} created`);
    } catch (e: any) { showToast('❌ ' + e.message); }
    finally { setCreating(false); }
  };

  const roleColors: Record<string, string> = { student: colors.brand, parent: colors.success, teacher: colors.warning, admin: ROLES.admin.color, principal: colors.rolePrincipal, driver: ROLES.driver.color };

  return (
    <SafeAreaView style={s.safe}>
      {ToastView}
      <ScrollView contentContainerStyle={s.scrollPb} keyboardShouldPersistTaps="handled">
        <View style={s.content}>
          <Button label={showCreate ? 'Cancel' : '+ Create User'} onPress={() => setShowCreate(v => !v)} variant={showCreate ? 'secondary' : 'primary'} style={{ marginBottom: spacing.md, borderRadius: radius.md }} />
          {lastCreated && (
            <Card color={colors.successBg} style={{ borderWidth: 1, borderColor: colors.success + '40' }}>
              <Text style={{ fontSize: typography.sm, fontWeight: typography.bold, color: colors.successText, marginBottom: 8 }}>✅ {lastCreated.name} created!</Text>
              <Text style={{ fontSize: typography.xs, color: colors.successText }}>Credentials:</Text>
              <Text style={{ fontSize: typography.xl, fontWeight: typography.extrabold, color: colors.successText, fontFamily: 'monospace' }}>{lastCreated.password}</Text>
              <TouchableOpacity onPress={() => setLastCreated(null)}><Text style={{ fontSize: typography.xs, color: colors.gray400, marginTop: 8 }}>Dismiss</Text></TouchableOpacity>
            </Card>
          )}
          {showCreate && (
            <Card variant="elevated">
              <SectionHeader title="New User" />
              <Input label="Full Name *" value={form.name} onChangeText={t => setForm(p => ({ ...p, name: t }))} placeholder="e.g. Rahul Sharma" />
              <Input label="Mobile Number *" value={form.phone} onChangeText={t => setForm(p => ({ ...p, phone: t.replace(/\D/g, '') }))} placeholder="10-digit number" keyboardType="phone-pad" maxLength={10} />
              <Text style={{ fontSize: typography.sm, fontWeight: typography.semibold, color: colors.gray700, marginBottom: 8 }}>Role *</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.md }}>
                {['student', 'parent', 'teacher', 'class_teacher', 'admin', 'principal', 'driver'].map(r => (
                  <Chip key={r} label={ROLES[r as keyof typeof ROLES]?.label ?? r} selected={form.role === r} onPress={() => setForm(p => ({ ...p, role: r }))} color={roleColors[r]} />
                ))}
              </View>
              {(form.role === 'student' || form.role === 'teacher' || form.role === 'class_teacher') && classes.length > 0 && (
                <View style={{ marginBottom: spacing.md }}>
                  <Text style={{ fontSize: typography.sm, fontWeight: typography.semibold, color: colors.gray700, marginBottom: 8 }}>Class</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {classes.map(c => <Chip key={c.id} label={c.name} selected={form.classId === c.id} onPress={() => setForm(p => ({ ...p, classId: c.id }))} />)}
                  </View>
                </View>
              )}
              {(form.role === 'teacher' || form.role === 'class_teacher') && subjects.length > 0 && (
                <View style={{ marginBottom: spacing.md }}>
                  <Text style={{ fontSize: typography.sm, fontWeight: typography.semibold, color: colors.gray700, marginBottom: 8 }}>Subject</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {subjects.map(s => <Chip key={s.id} label={s.name} selected={form.subjectId === s.id} onPress={() => setForm(p => ({ ...p, subjectId: s.id }))} />)}
                  </View>
                </View>
              )}
              <View style={s.infoBox}>
                <Ionicons name="information-circle-outline" size={14} color={colors.brand} />
                <Text style={{ flex: 1, fontSize: typography.xs, color: colors.brand }}>A secure password will be auto-generated. Share it with the user.</Text>
              </View>
              <Button label={creating ? 'Creating...' : 'Create User'} onPress={handleCreate} loading={creating} gradient />
            </Card>
          )}
          <SectionHeader title={`All Users (${users.length})`} />
          <Card>
            {users.map((u: any, i: number) => (
              <View key={u.id} style={[{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 }, i < users.length - 1 && { borderBottomWidth: 0.5, borderColor: colors.gray100 }]}>
                <Avatar name={u.name} size={38} color={roleColors[u.role] ?? colors.brand} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: typography.sm, fontWeight: typography.semibold, color: colors.gray900 }}>{u.name}</Text>
                  <Text style={{ fontSize: typography.xs, color: colors.gray400 }}>📱 {u.phone} · {ROLES[u.role as keyof typeof ROLES]?.label ?? u.role}</Text>
                </View>
                <Badge label={u.is_active ? 'Active' : 'Inactive'} variant={u.is_active ? 'success' : 'danger'} />
              </View>
            ))}
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRINCIPAL SCREENS
// ═══════════════════════════════════════════════════════════════════════════════
export function PrincipalHome({ navigation }: any) {
  const { user } = useStore();
  const { data: overview } = usePrincipalOverview(user?.schoolId);
  const roleInfo = ROLES.principal;
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const { data: classPerf = [] } = useClassPerformance(selectedClass ?? overview?.classes?.[0]?.id);

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scrollPb} showsVerticalScrollIndicator={false}>
        <RoleHeader role="Principal" title={user?.name ?? ''} subtitle={user?.school ?? ''} color={roleInfo.color} icon={roleInfo.icon} />
        <View style={s.content}>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
            <StatCard value={overview?.totalStudents ?? 0} label="Students" icon="people-outline" color={colors.brand} style={{ flex: 1 }} />
            <StatCard value={overview?.totalTeachers ?? 0} label="Teachers" icon="school-outline" color={colors.success} style={{ flex: 1 }} />
          </View>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: spacing.md }}>
            <StatCard value={`${overview?.attendanceRate ?? 0}%`} label="Today's Attendance" icon="calendar-outline" color={overview?.attendanceRate && overview.attendanceRate >= 75 ? colors.success : colors.warning} style={{ flex: 1 }} />
            <StatCard value={overview?.classes?.length ?? 0} label="Classes" icon="grid-outline" color={colors.rolePrincipal} style={{ flex: 1 }} />
          </View>
          <SectionHeader title="Class Performance" />
          {overview?.classes?.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginBottom: spacing.md }}>
              {overview.classes.map((c: any) => <Chip key={c.id} label={c.name} selected={selectedClass === c.id || (!selectedClass && overview.classes[0].id === c.id)} onPress={() => setSelectedClass(c.id)} />)}
            </ScrollView>
          )}
          <Card>
            {classPerf.length === 0 ? <EmptyState emoji="📊" title="No scores recorded yet" /> :
              classPerf.map((sub: any, i: number) => (
                <View key={i} style={{ marginBottom: i < classPerf.length - 1 ? 16 : 0 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={{ fontSize: typography.sm, fontWeight: typography.semibold, color: colors.gray700 }}>{sub.name}</Text>
                    <Text style={{ fontSize: typography.sm, fontWeight: typography.bold, color: sub.avg >= 75 ? colors.success : sub.avg >= 50 ? colors.warning : colors.danger }}>{sub.avg}%</Text>
                  </View>
                  <ProgressBar value={sub.avg} color={sub.avg >= 75 ? colors.success : sub.avg >= 50 ? '#f59e0b' : colors.danger} />
                </View>
              ))
            }
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DRIVER SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
export function DriverHome() {
  const { user } = useStore();
  const { data: busData } = useBusRoute(user?.routeId);
  const { showToast, ToastView } = useToast();
  const [locationOn, setLocationOn] = useState(false);
  const [tripId, setTripId] = useState<string | null>(null);
  const { route, stops = [], trip } = (busData ?? {}) as any;

  useEffect(() => {
    if (trip?.id) setTripId(trip.id);
  }, [trip]);

  const toggleLocation = async () => {
    if (!locationOn) {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { showToast('⚠️ Location permission required'); return; }
      setLocationOn(true);
      showToast('✅ Location sharing started');
    } else {
      setLocationOn(false);
      showToast('Location sharing stopped');
    }
  };

  const handleArrived = async (stopId: string, stopName: string) => {
    if (!tripId) { showToast('⚠️ No active trip'); return; }
    await markStopArrived(tripId, stopId);
    showToast(`✅ Arrived at ${stopName}`);
  };

  const completedStops = trip?.stops_completed ?? {};

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.dark }]}>
      {ToastView}
      <ScrollView contentContainerStyle={s.scrollPb} showsVerticalScrollIndicator={false}>
        {/* Dark header */}
        <View style={[s.roleHeader, { backgroundColor: colors.darkCard }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ fontSize: typography.xs, color: colors.darkMuted, fontWeight: typography.semibold, textTransform: 'uppercase', letterSpacing: 1 }}>Driver</Text>
              <Text style={{ fontSize: typography['2xl'], fontWeight: typography.extrabold, color: colors.darkText, marginTop: 2 }}>{user?.name}</Text>
              <Text style={{ fontSize: typography.sm, color: colors.darkMuted, marginTop: 2 }}>{route?.route_name ?? 'No route assigned'}</Text>
            </View>
            <LogoutBtn />
          </View>
        </View>

        <View style={[s.content, { backgroundColor: colors.dark }]}>
          {/* Location toggle */}
          <View style={[s.darkCard, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={[s.locationDot, { backgroundColor: locationOn ? colors.success : colors.gray500 }]} />
              <View>
                <Text style={{ fontSize: typography.sm, fontWeight: typography.bold, color: colors.darkText }}>GPS Location Sharing</Text>
                <Text style={{ fontSize: typography.xs, color: colors.darkMuted }}>{locationOn ? 'Live · Parents can see you' : 'Offline'}</Text>
              </View>
            </View>
            <Switch value={locationOn} onValueChange={toggleLocation} trackColor={{ false: colors.darkBorder, true: colors.success + '60' }} thumbColor={locationOn ? colors.success : colors.gray400} />
          </View>

          {/* Stats */}
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: spacing.md }}>
            <View style={[s.darkCard, { flex: 1, alignItems: 'center' }]}>
              <Text style={{ fontSize: 28, fontWeight: typography.extrabold, color: colors.darkText }}>{stops.length}</Text>
              <Text style={{ fontSize: typography.xs, color: colors.darkMuted }}>Total Stops</Text>
            </View>
            <View style={[s.darkCard, { flex: 1, alignItems: 'center' }]}>
              <Text style={{ fontSize: 28, fontWeight: typography.extrabold, color: colors.success }}>{Object.keys(completedStops).length}</Text>
              <Text style={{ fontSize: typography.xs, color: colors.darkMuted }}>Completed</Text>
            </View>
            <View style={[s.darkCard, { flex: 1, alignItems: 'center' }]}>
              <Text style={{ fontSize: 28, fontWeight: typography.extrabold, color: colors.brand }}>{stops.length - Object.keys(completedStops).length}</Text>
              <Text style={{ fontSize: typography.xs, color: colors.darkMuted }}>Remaining</Text>
            </View>
          </View>

          {/* Route */}
          <View style={s.darkCard}>
            <Text style={{ fontSize: typography.base, fontWeight: typography.bold, color: colors.darkText, marginBottom: 16 }}>Today's Route</Text>
            {stops.map((stop: any, i: number) => {
              const done = !!completedStops[stop.id];
              const isCurrent = !done && Object.keys(completedStops).length === i;
              return (
                <View key={stop.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: i < stops.length - 1 ? 0.5 : 0, borderColor: colors.darkBorder }}>
                  <View style={[s.stopDot, done ? { backgroundColor: colors.success } : isCurrent ? { backgroundColor: colors.brand } : { backgroundColor: colors.darkBorder }]}>
                    {done ? <Ionicons name="checkmark" size={12} color={colors.white} /> : <Text style={{ fontSize: 10, fontWeight: typography.bold, color: isCurrent ? colors.white : colors.darkMuted }}>{i + 1}</Text>}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[{ fontSize: typography.sm, fontWeight: typography.semibold }, done ? { color: colors.darkMuted } : { color: colors.darkText }]}>{stop.stop_name}</Text>
                    <Text style={{ fontSize: typography.xs, color: colors.darkMuted }}>{stop.estimated_time}</Text>
                  </View>
                  {isCurrent && !done && (
                    <TouchableOpacity style={s.arrivedBtn} onPress={() => handleArrived(stop.id, stop.stop_name)} activeOpacity={0.85}>
                      <Text style={{ fontSize: typography.xs, color: colors.white, fontWeight: typography.bold }}>Arrived</Text>
                    </TouchableOpacity>
                  )}
                  {done && <Ionicons name="checkmark-circle" size={20} color={colors.success} />}
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUPER ADMIN SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
export function SuperAdminHome({ navigation }: any) {
  const { user } = useStore();
  const { data: stats } = usePlatformStats();
  const { data: schools = [] } = useAllSchools();
  const qc = useQueryClient();
  const { showToast, ToastView } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', address: '', phone: '' });
  const [saving, setSaving] = useState(false);

  const createSchool = async () => {
    if (!form.name || !form.phone) { showToast('⚠️ Name and phone required'); return; }
    setSaving(true);
    await supabase.from('schools').insert({ name: form.name, address: form.address, phone: form.phone });
    setSaving(false);
    setForm({ name: '', address: '', phone: '' });
    setShowAdd(false);
    qc.invalidateQueries({ queryKey: ['allSchools'] });
    showToast('✅ School created');
  };

  return (
    <SafeAreaView style={s.safe}>
      {ToastView}
      <ScrollView contentContainerStyle={s.scrollPb} showsVerticalScrollIndicator={false}>
        <View style={[s.roleHeader, { backgroundColor: colors.gray900 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Text style={{ fontSize: 18 }}>⚡</Text>
                <Text style={{ fontSize: typography.xs, color: '#94a3b8', fontWeight: typography.bold, textTransform: 'uppercase', letterSpacing: 1 }}>Zenvik AI Platform</Text>
              </View>
              <Text style={{ fontSize: typography['2xl'], fontWeight: typography.extrabold, color: colors.white }}>Super Admin</Text>
              <Text style={{ fontSize: typography.sm, color: '#94a3b8', marginTop: 2 }}>{user?.name}</Text>
            </View>
            <LogoutBtn />
          </View>
        </View>

        <View style={s.content}>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: spacing.md }}>
            <StatCard value={stats?.schools ?? 0} label="Schools" icon="business-outline" color={colors.brand} style={{ flex: 1 }} />
            <StatCard value={stats?.students ?? 0} label="Students" icon="people-outline" color={colors.success} style={{ flex: 1 }} />
            <StatCard value={stats?.teachers ?? 0} label="Teachers" icon="school-outline" color={colors.warning} style={{ flex: 1 }} />
          </View>

          <Button label={showAdd ? 'Cancel' : '+ Add School'} onPress={() => setShowAdd(v => !v)} variant={showAdd ? 'secondary' : 'primary'} style={{ marginBottom: spacing.md, borderRadius: radius.md }} />

          {showAdd && (
            <Card variant="elevated">
              <Input label="School Name *" value={form.name} onChangeText={t => setForm(p => ({ ...p, name: t }))} placeholder="e.g. Delhi Public School" />
              <Input label="Address" value={form.address} onChangeText={t => setForm(p => ({ ...p, address: t }))} placeholder="City, State" />
              <Input label="Admin Phone *" value={form.phone} onChangeText={t => setForm(p => ({ ...p, phone: t.replace(/\D/g, '') }))} placeholder="10-digit number" keyboardType="phone-pad" maxLength={10} />
              <Button label={saving ? 'Creating...' : 'Create School'} onPress={createSchool} loading={saving} variant="primary" gradient />
            </Card>
          )}

          <SectionHeader title={`All Schools (${schools.length})`} />
          {schools.map((school: any) => (
            <Card key={school.id} variant="elevated" onPress={() => navigation.navigate('SchoolDetail', { schoolId: school.id, schoolName: school.name })}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <View style={[s.hwIcon, { backgroundColor: colors.brandLight }]}>
                  <Text style={{ fontSize: 22 }}>🏫</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: typography.base, fontWeight: typography.bold, color: colors.gray900 }}>{school.name}</Text>
                  <Text style={{ fontSize: typography.xs, color: colors.gray400, marginTop: 1 }}>{school.address ?? 'No address'}</Text>
                  <Text style={{ fontSize: typography.xs, color: colors.gray400 }}>{school.phone}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.gray300} />
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.gray50 },
  scrollPb: { paddingBottom: 90 },
  content: { padding: spacing.lg },
  roleHeader: { paddingTop: 12, paddingBottom: 24, paddingHorizontal: spacing.lg },
  roleHeaderTag: { fontSize: typography.xs, fontWeight: typography.bold, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 1 },
  roleHeaderTitle: { fontSize: typography['2xl'], fontWeight: typography.extrabold, color: colors.white, letterSpacing: -0.3, marginTop: 4 },
  roleHeaderSub: { fontSize: typography.sm, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  logoutBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  toastOverlay: { position: 'absolute', top: 16, left: 20, right: 20, backgroundColor: colors.gray800, borderRadius: radius.lg, padding: 12, zIndex: 9999 },
  toastText: { color: colors.white, fontSize: typography.sm, textAlign: 'center', fontWeight: typography.medium },
  calDot: { width: 11, height: 11, borderRadius: 6 },
  navCard: { flex: 1, borderRadius: radius.lg, padding: 16, alignItems: 'center', borderWidth: 1 },
  hwIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  attendToggle: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.white, borderRadius: radius.md, borderWidth: 1, borderColor: colors.gray200, paddingHorizontal: 12, paddingVertical: 10, marginBottom: spacing.md },
  searchInput: { flex: 1, fontSize: typography.sm, color: colors.gray800 },
  infoBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: colors.brandLight, borderRadius: radius.sm, padding: 10, marginBottom: spacing.md },
  stopDot: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  darkCard: { backgroundColor: colors.darkCard, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md },
  locationDot: { width: 10, height: 10, borderRadius: 5 },
  arrivedBtn: { backgroundColor: colors.brand, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 6 },
});
