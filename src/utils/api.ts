import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabase';

// ─── Student hooks ────────────────────────────────────────────────────────────
export function useStudentXP(studentId?: string) {
  return useQuery({
    queryKey: ['xp', studentId],
    enabled: !!studentId,
    queryFn: async () => {
      const { data } = await supabase.from('student_xp').select('*').eq('student_id', studentId!).single();
      return data;
    },
  });
}

export function useAttendanceRate(studentId?: string) {
  return useQuery({
    queryKey: ['attendanceRate', studentId],
    enabled: !!studentId,
    queryFn: async () => {
      const { data } = await supabase.from('attendance').select('status').eq('student_id', studentId!);
      const total = data?.length ?? 0;
      const present = data?.filter(a => a.status === 'present').length ?? 0;
      return total > 0 ? Math.round((present / total) * 100) : 0;
    },
  });
}

export function useAttendanceCalendar(studentId?: string) {
  return useQuery({
    queryKey: ['attendanceCal', studentId],
    enabled: !!studentId,
    queryFn: async () => {
      const { data } = await supabase.from('attendance').select('date, status').eq('student_id', studentId!).order('date', { ascending: false }).limit(60);
      return data ?? [];
    },
  });
}

export function useHomework(classId?: string) {
  return useQuery({
    queryKey: ['homework', classId],
    enabled: !!classId,
    queryFn: async () => {
      const { data } = await supabase.from('homework').select('*, subjects(name)').eq('class_id', classId!).order('due_date').limit(10);
      return data ?? [];
    },
  });
}

export function useSubmitHomework() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ homeworkId, studentId }: { homeworkId: string; studentId: string }) => {
      const { error } = await supabase.from('homework_submissions').insert({ homework_id: homeworkId, student_id: studentId });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['homework'] }),
  });
}

export function useSchedule(classId?: string) {
  return useQuery({
    queryKey: ['schedule', classId],
    enabled: !!classId,
    queryFn: async () => {
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const { data } = await supabase.from('class_schedule').select('*, subjects(name)').eq('class_id', classId!).eq('day_of_week', today).order('period_number');
      return data ?? [];
    },
  });
}

export function useTestScores(studentId?: string) {
  return useQuery({
    queryKey: ['scores', studentId],
    enabled: !!studentId,
    queryFn: async () => {
      const { data } = await supabase.from('test_scores').select('*, subjects(name)').eq('student_id', studentId!).order('date', { ascending: false }).limit(20);
      return data ?? [];
    },
  });
}

export function useSubjectProgress(studentId?: string) {
  return useQuery({
    queryKey: ['subjectProgress', studentId],
    enabled: !!studentId,
    queryFn: async () => {
      const { data } = await supabase.from('test_scores').select('*, subjects(name)').eq('student_id', studentId!);
      if (!data) return [];
      const bySubject: Record<string, { name: string; scores: number[]; max: number[] }> = {};
      data.forEach(s => {
        const key = s.subject_id;
        if (!bySubject[key]) bySubject[key] = { name: (s as any).subjects?.name ?? '', scores: [], max: [] };
        bySubject[key].scores.push(s.score);
        bySubject[key].max.push(s.max_score);
      });
      return Object.values(bySubject).map(sub => ({
        name: sub.name,
        avg: Math.round(sub.scores.reduce((a, b) => a + b, 0) / sub.scores.length),
        max: sub.max[0],
      }));
    },
  });
}

export function useStudentRank(studentId?: string, classId?: string) {
  return useQuery({
    queryKey: ['rank', studentId, classId],
    enabled: !!studentId && !!classId,
    queryFn: async () => {
      const { data: enrolled } = await supabase.from('class_enrollments').select('student_id').eq('class_id', classId!);
      const ids = enrolled?.map(e => e.student_id) ?? [];
      const { data: xpData } = await supabase.from('student_xp').select('student_id, total_xp').in('student_id', ids).order('total_xp', { ascending: false });
      const rank = (xpData?.findIndex(x => x.student_id === studentId) ?? -1) + 1;
      return { rank, total: ids.length };
    },
  });
}

export function useActiveCompetition(classId?: string) {
  return useQuery({
    queryKey: ['competition', classId],
    enabled: !!classId,
    staleTime: 60000,
    queryFn: async () => {
      const { data } = await supabase.from('competitions').select('*, subjects(name)').eq('status', 'active').contains('class_ids', [classId]).order('created_at', { ascending: false }).limit(1).single();
      return data;
    },
  });
}

export function useLeaderboard(classId?: string) {
  return useQuery({
    queryKey: ['leaderboard', classId],
    enabled: !!classId,
    queryFn: async () => {
      const { data: enrolled } = await supabase.from('class_enrollments').select('student_id').eq('class_id', classId!);
      const ids = enrolled?.map(e => e.student_id) ?? [];
      const { data } = await supabase.from('student_xp').select('student_id, total_xp, current_level, users!student_id(name)').in('student_id', ids).order('total_xp', { ascending: false }).limit(10);
      return data ?? [];
    },
  });
}

export function useSubmitCompetition() {
  return useMutation({
    mutationFn: async ({ competitionId, studentId, answers, score }: { competitionId: string; studentId: string; answers: number[]; score: number }) => {
      const { error } = await supabase.from('competition_answers').insert({ competition_id: competitionId, student_id: studentId, answers, score });
      if (error) throw error;
    },
  });
}

// ─── Parent hooks ─────────────────────────────────────────────────────────────
export function useFeeRecords(studentId?: string) {
  return useQuery({
    queryKey: ['fees', studentId],
    enabled: !!studentId,
    queryFn: async () => {
      const { data } = await supabase.from('fee_records').select('*').eq('student_id', studentId!).order('due_date', { ascending: false });
      return data ?? [];
    },
  });
}

export function useMarkFeePaid() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (feeId: string) => {
      await supabase.from('fee_records').update({ status: 'paid', paid_at: new Date().toISOString(), payment_method: 'upi' }).eq('id', feeId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fees'] }),
  });
}

export function useBusRoute(routeId?: string) {
  return useQuery({
    queryKey: ['busRoute', routeId],
    enabled: !!routeId,
    queryFn: async () => {
      const [{ data: route }, { data: stops }, { data: trip }] = await Promise.all([
        supabase.from('bus_routes').select('*, users!driver_id(name)').eq('id', routeId!).single(),
        supabase.from('bus_stops').select('*').eq('route_id', routeId!).order('sequence_order'),
        supabase.from('bus_trips').select('*').eq('route_id', routeId!).eq('date', new Date().toISOString().split('T')[0]).single(),
      ]);
      return { route, stops: stops ?? [], trip };
    },
  });
}

// ─── Teacher hooks ────────────────────────────────────────────────────────────
export function useClassStudents(classId?: string) {
  return useQuery({
    queryKey: ['classStudents', classId],
    enabled: !!classId,
    queryFn: async () => {
      const { data } = await supabase.from('class_enrollments').select('roll_number, users!student_id(id, name, phone)').eq('class_id', classId!).order('roll_number');
      return (data ?? []).map(d => ({ ...((d as any).users), rollNumber: d.roll_number }));
    },
  });
}

export function useTodayAttendance(classId?: string) {
  return useQuery({
    queryKey: ['todayAttendance', classId],
    enabled: !!classId,
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase.from('attendance').select('student_id, status').eq('class_id', classId!).eq('date', today);
      return data ?? [];
    },
  });
}

export function useSaveAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (records: Array<{ classId: string; studentId: string; status: 'present' | 'absent'; markedBy: string }>) => {
      const today = new Date().toISOString().split('T')[0];
      const rows = records.map(r => ({ class_id: r.classId, student_id: r.studentId, date: today, status: r.status, marked_by: r.markedBy }));
      await supabase.from('attendance').upsert(rows, { onConflict: 'class_id,student_id,date' });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['todayAttendance'] }),
  });
}

export function useTeacherHomework(teacherId?: string) {
  return useQuery({
    queryKey: ['teacherHW', teacherId],
    enabled: !!teacherId,
    queryFn: async () => {
      const { data } = await supabase.from('homework').select('*, subjects(name), homework_submissions(id, verified_by_teacher)').eq('teacher_id', teacherId!).order('created_at', { ascending: false }).limit(15);
      return data ?? [];
    },
  });
}

export function useCreateHomework() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (hw: { teacherId: string; classId: string; subjectId: string; title: string; description: string; dueDate: string }) => {
      await supabase.from('homework').insert({ teacher_id: hw.teacherId, class_id: hw.classId, subject_id: hw.subjectId, title: hw.title, description: hw.description, due_date: hw.dueDate });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teacherHW'] }),
  });
}

export function useVerifyHomework() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (submissionId: string) => {
      await supabase.from('homework_submissions').update({ verified_by_teacher: true, verified_at: new Date().toISOString() }).eq('id', submissionId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teacherHW'] }),
  });
}

export function useSyllabus(classId?: string, subjectId?: string) {
  return useQuery({
    queryKey: ['syllabus', classId, subjectId],
    enabled: !!classId && !!subjectId,
    queryFn: async () => {
      const { data } = await supabase.from('syllabus_chapters').select('*').eq('class_id', classId!).eq('subject_id', subjectId!).order('term').order('created_at');
      return data ?? [];
    },
  });
}

export function useSaveChapter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ch: { teacherId: string; classId: string; subjectId: string; chapterName: string; topics: string; term: number }) => {
      await supabase.from('syllabus_chapters').insert({ teacher_id: ch.teacherId, class_id: ch.classId, subject_id: ch.subjectId, chapter_name: ch.chapterName, topics_covered: ch.topics, term: ch.term });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['syllabus'] }),
  });
}

export function useStudentsWithWeakness(classId?: string) {
  return useQuery({
    queryKey: ['weaknesses', classId],
    enabled: !!classId,
    queryFn: async () => {
      const { data: enrolled } = await supabase.from('class_enrollments').select('student_id, roll_number').eq('class_id', classId!);
      if (!enrolled?.length) return [];
      const ids = enrolled.map(e => e.student_id);
      const { data: weakness } = await supabase.from('student_weaknesses').select('*, users!student_id(name), subjects(name)').in('student_id', ids);
      return weakness ?? [];
    },
  });
}

// ─── Admin hooks ──────────────────────────────────────────────────────────────
export function useAdminDashboard(schoolId?: string) {
  return useQuery({
    queryKey: ['adminDash', schoolId],
    enabled: !!schoolId,
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const [students, teachers, attendance, fees, tickets] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }).eq('school_id', schoolId!).eq('role', 'student'),
        supabase.from('users').select('id', { count: 'exact', head: true }).eq('school_id', schoolId!).in('role', ['teacher', 'class_teacher']),
        supabase.from('attendance').select('status').eq('date', today),
        supabase.from('fee_records').select('status').eq('school_id', schoolId!),
        supabase.from('support_tickets').select('id', { count: 'exact', head: true }).eq('school_id', schoolId!).eq('status', 'open'),
      ]);
      const presentToday = attendance.data?.filter(a => a.status === 'present').length ?? 0;
      const totalToday = attendance.data?.length ?? 1;
      const pendingFees = fees.data?.filter(f => f.status === 'pending').length ?? 0;
      return {
        totalStudents: students.count ?? 0,
        totalTeachers: teachers.count ?? 0,
        attendanceToday: Math.round((presentToday / totalToday) * 100),
        pendingFees,
        openTickets: tickets.count ?? 0,
      };
    },
  });
}

export function useAdminFees(schoolId?: string) {
  return useQuery({
    queryKey: ['adminFees', schoolId],
    enabled: !!schoolId,
    queryFn: async () => {
      const { data } = await supabase.from('fee_records').select('*, users!student_id(name, phone)').eq('school_id', schoolId!).order('due_date', { ascending: false }).limit(50);
      return data ?? [];
    },
  });
}

export function useAdminMarkFeePaid() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (feeId: string) => {
      await supabase.from('fee_records').update({ status: 'paid', paid_at: new Date().toISOString() }).eq('id', feeId);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['adminFees'] }); qc.invalidateQueries({ queryKey: ['adminDash'] }); },
  });
}

export function useSendNotification() {
  return useMutation({
    mutationFn: async (n: { schoolId: string; sentBy: string; targetRole?: string; classId?: string; channel: string; title: string; message: string }) => {
      await supabase.from('notifications').insert({ school_id: n.schoolId, sent_by: n.sentBy, target_role: n.targetRole, target_class_id: n.classId, channel: n.channel, title: n.title, message: n.message });
    },
  });
}

export function useTickets(schoolId?: string) {
  return useQuery({
    queryKey: ['tickets', schoolId],
    enabled: !!schoolId,
    queryFn: async () => {
      const { data } = await supabase.from('support_tickets').select('*, users!raised_by(name, role, phone)').eq('school_id', schoolId!).order('raised_at', { ascending: false });
      return data ?? [];
    },
  });
}

export function useResolveTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ticketId: string) => {
      await supabase.from('support_tickets').update({ status: 'resolved', resolved_at: new Date().toISOString() }).eq('id', ticketId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tickets'] }),
  });
}

// ─── Principal hooks ──────────────────────────────────────────────────────────
export function usePrincipalOverview(schoolId?: string) {
  return useQuery({
    queryKey: ['principalOverview', schoolId],
    enabled: !!schoolId,
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const [classes, students, teachers, attendance] = await Promise.all([
        supabase.from('classes').select('id, name').eq('school_id', schoolId!),
        supabase.from('users').select('id', { count: 'exact', head: true }).eq('school_id', schoolId!).eq('role', 'student'),
        supabase.from('users').select('id', { count: 'exact', head: true }).eq('school_id', schoolId!).in('role', ['teacher', 'class_teacher']),
        supabase.from('attendance').select('status, class_id').eq('date', today),
      ]);
      const present = attendance.data?.filter(a => a.status === 'present').length ?? 0;
      const total = attendance.data?.length ?? 1;
      return {
        classes: classes.data ?? [],
        totalStudents: students.count ?? 0,
        totalTeachers: teachers.count ?? 0,
        attendanceRate: Math.round((present / total) * 100),
        alerts: [],
      };
    },
  });
}

export function useClassPerformance(classId?: string) {
  return useQuery({
    queryKey: ['classPerf', classId],
    enabled: !!classId,
    queryFn: async () => {
      const { data: enrolled } = await supabase.from('class_enrollments').select('student_id').eq('class_id', classId!);
      const ids = enrolled?.map(e => e.student_id) ?? [];
      const { data: scores } = await supabase.from('test_scores').select('score, max_score, subjects(name)').in('student_id', ids);
      if (!scores?.length) return [];
      const bySubject: Record<string, number[]> = {};
      scores.forEach((s: any) => { const n = s.subjects?.name ?? 'Unknown'; if (!bySubject[n]) bySubject[n] = []; bySubject[n].push((s.score / s.max_score) * 100); });
      return Object.entries(bySubject).map(([name, vals]) => ({ name, avg: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) }));
    },
  });
}

// ─── Driver hooks ─────────────────────────────────────────────────────────────
export async function updateDriverLocation(tripId: string, lat: number, lng: number) {
  await supabase.from('bus_trips').update({ current_lat: lat, current_lng: lng }).eq('id', tripId);
}

export async function markStopArrived(tripId: string, stopId: string) {
  const { data: trip } = await supabase.from('bus_trips').select('stops_completed').eq('id', tripId).single();
  const completed = { ...(trip?.stops_completed ?? {}), [stopId]: true };
  await supabase.from('bus_trips').update({ stops_completed: completed }).eq('id', tripId);
}

// ─── Super Admin hooks ────────────────────────────────────────────────────────
export function useAllSchools() {
  return useQuery({
    queryKey: ['allSchools'],
    queryFn: async () => {
      const { data } = await supabase.from('schools').select('*').order('created_at', { ascending: false });
      return data ?? [];
    },
  });
}

export function usePlatformStats() {
  return useQuery({
    queryKey: ['platformStats'],
    queryFn: async () => {
      const [schools, students, teachers] = await Promise.all([
        supabase.from('schools').select('id', { count: 'exact', head: true }),
        supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'student'),
        supabase.from('users').select('id', { count: 'exact', head: true }).in('role', ['teacher', 'class_teacher']),
      ]);
      return { schools: schools.count ?? 0, students: students.count ?? 0, teachers: teachers.count ?? 0 };
    },
  });
}
