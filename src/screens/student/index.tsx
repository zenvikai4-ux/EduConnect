import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, TextInput, KeyboardAvoidingView, Platform,
  ActivityIndicator, Animated,
} from 'react-native';
// expo-linear-gradient removed for stability
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store';
import { colors, typography, spacing, radius, shadows, ROLES } from '../../utils/design';
import { Card, Badge, StatCard, ProgressBar, EmptyState, Avatar, SectionHeader, Chip, Button, ListItem } from '../../components/shared/index';
import {
  useStudentXP, useAttendanceRate, useHomework, useSchedule,
  useStudentRank, useTestScores, useSubjectProgress, useLeaderboard,
  useActiveCompetition, useSubmitCompetition, useSubmitHomework,
  useAttendanceCalendar,
} from '../../utils/api';
import { askAIDoubt } from '../../utils/aiService';

// ─── Logout Button ────────────────────────────────────────────────────────────
function LogoutBtn() {
  const { logout } = useStore();
  return (
    <TouchableOpacity onPress={logout} style={s.logoutBtn} activeOpacity={0.8}>
      <Ionicons name="log-out-outline" size={18} color={colors.danger} />
    </TouchableOpacity>
  );
}

// ─── Student Home ─────────────────────────────────────────────────────────────
export function StudentHome({ navigation }: any) {
  const { user } = useStore();
  const { data: xp } = useStudentXP(user?.id);
  const { data: attendance } = useAttendanceRate(user?.id);
  const { data: homework } = useHomework(user?.classId);
  const { data: schedule } = useSchedule(user?.classId);
  const { data: rank } = useStudentRank(user?.id, user?.classId);

  const pendingHW = homework?.filter(h => !h.homework_submissions?.length) ?? [];
  const roleColor = ROLES.student.color;

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[s.header, { backgroundColor: roleColor }]}>
          <View style={s.headerRow}>
            <View>
              <Text style={s.headerGreeting}>Good {getTimeGreeting()} 👋</Text>
              <Text style={s.headerName}>{user?.name?.split(' ')[0]}</Text>
              <Text style={s.headerSub}>{user?.className} · {user?.school}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <Avatar name={user?.name ?? 'S'} size={42} color={colors.white} />
              <LogoutBtn />
            </View>
          </View>
          {/* XP Bar */}
          <View style={s.xpCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ fontSize: 16 }}>⭐</Text>
                <Text style={{ fontSize: typography.sm, fontWeight: typography.bold, color: colors.white }}>Level {xp?.current_level ?? 1}</Text>
              </View>
              <Text style={{ fontSize: typography.sm, color: 'rgba(255,255,255,0.8)' }}>{xp?.total_xp ?? 0} XP</Text>
            </View>
            <View style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, overflow: 'hidden' }}>
              <View style={{ width: `${Math.min(100, ((xp?.total_xp ?? 0) / (xp?.xp_to_next_level ?? 500)) * 100)}%`, height: 6, backgroundColor: colors.white, borderRadius: 3 }} />
            </View>
          </View>
        </View>

        <View style={s.content}>
          {/* Stats */}
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: spacing.md }}>
            <StatCard value={`${attendance ?? 0}%`} label="Attendance" icon="calendar-outline" color={attendance && attendance >= 75 ? colors.success : colors.danger} style={{ flex: 1 }} />
            <StatCard value={rank ? `#${rank.rank}` : '–'} label={`of ${rank?.total ?? '–'}`} icon="trophy-outline" color="#f59e0b" style={{ flex: 1 }} />
            <StatCard value={pendingHW.length} label="Pending HW" icon="book-outline" color={pendingHW.length > 0 ? colors.warning : colors.success} style={{ flex: 1 }} />
          </View>

          {/* Today's schedule */}
          <SectionHeader title="Today's Classes" subtitle={new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })} />
          {!schedule?.length ? (
            <EmptyState emoji="🎉" title="No classes today!" subtitle="Enjoy your free time" />
          ) : (
            <Card>
              {schedule.map((period: any, i: number) => (
                <View key={period.id} style={[s.periodRow, i < schedule.length - 1 && s.periodBorder]}>
                  <View style={[s.periodNum, { backgroundColor: roleColor + '18' }]}>
                    <Text style={[s.periodNumText, { color: roleColor }]}>{period.period_number}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.periodSubject}>{(period as any).subjects?.name}</Text>
                    <Text style={s.periodTime}>{period.start_time} – {period.end_time}</Text>
                  </View>
                  <Text style={s.periodRoom}>{period.room}</Text>
                </View>
              ))}
            </Card>
          )}

          {/* Pending homework */}
          {pendingHW.length > 0 && (
            <>
              <SectionHeader title="Pending Homework" subtitle={`${pendingHW.length} assignments due`} action="See all" onAction={() => navigation.navigate('Homework')} />
              {pendingHW.slice(0, 2).map((hw: any) => (
                <Card key={hw.id} onPress={() => navigation.navigate('Homework')}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={[s.hwIcon, { backgroundColor: '#f59e0b18' }]}>
                      <Text style={{ fontSize: 20 }}>📝</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.hwTitle}>{hw.title}</Text>
                      <Text style={s.hwSub}>{(hw as any).subjects?.name} · Due {new Date(hw.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</Text>
                    </View>
                    <Badge label="Pending" variant="warning" />
                  </View>
                </Card>
              ))}
            </>
          )}

          {/* Quick actions */}
          <SectionHeader title="Quick Access" />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {[
              { icon: '🤖', label: 'Ask AI', screen: 'AskAI', color: '#6366f1' },
              { icon: '🏆', label: 'Compete', screen: 'Competition', color: '#f59e0b' },
              { icon: '📊', label: 'Progress', screen: 'Progress', color: colors.success },
            ].map(item => (
              <TouchableOpacity key={item.screen} style={[s.quickAction, { backgroundColor: item.color + '12', borderColor: item.color + '30' }]} onPress={() => navigation.navigate(item.screen)} activeOpacity={0.8}>
                <Text style={{ fontSize: 26, marginBottom: 6 }}>{item.icon}</Text>
                <Text style={{ fontSize: typography.xs, fontWeight: typography.semibold, color: item.color }}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Homework Screen ──────────────────────────────────────────────────────────
export function HomeworkScreen() {
  const { user } = useStore();
  const { data: homework = [], isLoading } = useHomework(user?.classId);
  const submitHW = useSubmitHomework();
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleSubmit = async (hwId: string) => {
    setSubmitting(hwId);
    try {
      await submitHW.mutateAsync({ homeworkId: hwId, studentId: user!.id });
      showToast('✅ Homework submitted! +50 XP');
    } catch { showToast('❌ Already submitted'); }
    finally { setSubmitting(null); }
  };

  return (
    <SafeAreaView style={s.safe}>
      {!!toast && <View style={s.toast}><Text style={s.toastText}>{toast}</Text></View>}
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.content}>
          {isLoading ? <ActivityIndicator style={{ padding: 40 }} color={colors.brand} /> :
            homework.length === 0 ? <EmptyState emoji="🎉" title="All caught up!" subtitle="No homework assigned" /> :
            homework.map((hw: any) => {
              const submitted = (hw.homework_submissions?.length ?? 0) > 0;
              const overdue = new Date(hw.due_date) < new Date() && !submitted;
              return (
                <Card key={hw.id} variant="elevated">
                  <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
                    <View style={[s.hwIcon, { backgroundColor: submitted ? colors.successBg : overdue ? colors.dangerBg : '#fef3c718' }]}>
                      <Text style={{ fontSize: 22 }}>{submitted ? '✅' : overdue ? '⚠️' : '📝'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.hwTitle}>{hw.title}</Text>
                      <Text style={s.hwDesc}>{hw.description}</Text>
                      <View style={{ flexDirection: 'row', gap: 8, marginTop: 8, alignItems: 'center' }}>
                        <Badge label={(hw as any).subjects?.name ?? ''} variant="brand" />
                        <Badge label={`Due ${new Date(hw.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`} variant={overdue ? 'danger' : 'default'} />
                      </View>
                    </View>
                  </View>
                  {!submitted && (
                    <Button
                      label={submitting === hw.id ? 'Submitting...' : 'Mark as Done'}
                      onPress={() => handleSubmit(hw.id)}
                      loading={submitting === hw.id}
                      variant="success"
                      size="sm"
                      style={{ marginTop: 12 }}
                    />
                  )}
                  {submitted && <Text style={{ fontSize: typography.xs, color: colors.success, marginTop: 8, fontWeight: typography.semibold }}>✓ Submitted — awaiting teacher verification</Text>}
                </Card>
              );
            })
          }
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Progress Screen ──────────────────────────────────────────────────────────
export function ProgressScreen() {
  const { user } = useStore();
  const { data: scores = [] } = useTestScores(user?.id);
  const { data: subjectProgress = [] } = useSubjectProgress(user?.id);
  const { data: attendance } = useAttendanceRate(user?.id);
  const { data: cal = [] } = useAttendanceCalendar(user?.id);
  const { data: xp } = useStudentXP(user?.id);
  const { data: leaderboard = [] } = useLeaderboard(user?.classId);

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.content}>
          {/* XP & Level */}
          <View style={[s.xpBanner, { backgroundColor: '#0f172a' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <View>
                <Text style={{ color: '#94a3b8', fontSize: typography.xs, fontWeight: typography.semibold, textTransform: 'uppercase', letterSpacing: 1 }}>Your Level</Text>
                <Text style={{ color: colors.white, fontSize: 36, fontWeight: typography.extrabold }}>Level {xp?.current_level ?? 1}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: '#f59e0b', fontSize: 24, fontWeight: typography.extrabold }}>{xp?.total_xp?.toLocaleString() ?? 0}</Text>
                <Text style={{ color: '#94a3b8', fontSize: typography.xs }}>Total XP</Text>
              </View>
            </View>
            <View style={{ height: 8, backgroundColor: '#334155', borderRadius: 4, overflow: 'hidden' }}>
              <View style={{ width: `${Math.min(100, ((xp?.total_xp ?? 0) / (xp?.xp_to_next_level ?? 500)) * 100)}%`, height: 8, backgroundColor: '#f59e0b', borderRadius: 4 }} />
            </View>
            <Text style={{ color: '#64748b', fontSize: typography.xs, marginTop: 6 }}>{(xp?.xp_to_next_level ?? 500) - (xp?.total_xp ?? 0)} XP to next level</Text>
          </View>

          {/* Subject performance */}
          <SectionHeader title="Subject Performance" />
          <Card>
            {subjectProgress.length === 0 ? <EmptyState emoji="📊" title="No scores yet" subtitle="Your test scores will appear here" /> :
              subjectProgress.map((sub: any, i: number) => (
                <View key={i} style={{ marginBottom: i < subjectProgress.length - 1 ? 16 : 0 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={{ fontSize: typography.sm, fontWeight: typography.semibold, color: colors.gray700 }}>{sub.name}</Text>
                    <Text style={{ fontSize: typography.sm, fontWeight: typography.bold, color: sub.avg >= 75 ? colors.success : sub.avg >= 50 ? colors.warning : colors.danger }}>{sub.avg}%</Text>
                  </View>
                  <ProgressBar value={sub.avg} color={sub.avg >= 75 ? colors.success : sub.avg >= 50 ? '#f59e0b' : colors.danger} />
                </View>
              ))
            }
          </Card>

          {/* Attendance */}
          <SectionHeader title="Attendance" />
          <Card>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 40, fontWeight: typography.extrabold, color: attendance && attendance >= 75 ? colors.success : colors.danger }}>{attendance ?? 0}%</Text>
              <Badge label={attendance && attendance >= 75 ? '✓ Good standing' : '⚠ Needs improvement'} variant={attendance && attendance >= 75 ? 'success' : 'warning'} size="md" />
            </View>
            {/* Calendar dots */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {cal.slice(0, 30).map((day: any, i: number) => (
                <View key={i} style={[s.calDot, { backgroundColor: day.status === 'present' ? colors.success : day.status === 'absent' ? colors.danger : colors.gray200 }]} />
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: 16, marginTop: 12 }}>
              {[['Present', colors.success], ['Absent', colors.danger], ['Holiday', colors.gray200]].map(([label, color]) => (
                <View key={label} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <View style={[s.calDot, { backgroundColor: color as string }]} />
                  <Text style={{ fontSize: typography.xs, color: colors.gray500 }}>{label}</Text>
                </View>
              ))}
            </View>
          </Card>

          {/* Class leaderboard */}
          <SectionHeader title="Class Leaderboard" />
          <Card>
            {leaderboard.length === 0 ? <EmptyState emoji="🏆" title="No data yet" subtitle="Complete assignments to earn XP" /> :
              leaderboard.map((entry: any, i: number) => (
                <View key={entry.student_id} style={[s.leaderRow, i < leaderboard.length - 1 && s.periodBorder]}>
                  <Text style={[s.leaderRank, i < 3 && { color: ['#f59e0b', '#9ca3af', '#b45309'][i] }]}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                  </Text>
                  <Text style={{ flex: 1, fontSize: typography.sm, fontWeight: typography.semibold, color: colors.gray800 }}>{(entry as any).users?.name}</Text>
                  <Text style={{ fontSize: typography.sm, fontWeight: typography.bold, color: '#f59e0b' }}>{entry.total_xp} XP</Text>
                </View>
              ))
            }
          </Card>

          {/* Recent test scores */}
          <SectionHeader title="Recent Tests" />
          {scores.slice(0, 5).map((score: any) => (
            <Card key={score.id}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: typography.sm, fontWeight: typography.bold, color: colors.gray900 }}>{score.test_name}</Text>
                  <Text style={{ fontSize: typography.xs, color: colors.gray400, marginTop: 2 }}>{(score as any).subjects?.name} · {new Date(score.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[s.scoreText, { color: (score.score / score.max_score) >= 0.75 ? colors.success : colors.danger }]}>{score.score}/{score.max_score}</Text>
                  <Text style={{ fontSize: typography.xs, color: colors.gray400 }}>{Math.round((score.score / score.max_score) * 100)}%</Text>
                </View>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Ask AI Screen ────────────────────────────────────────────────────────────
export function AskAIScreen() {
  const { user } = useStore();
  const [messages, setMessages] = useState([{
    id: '0', text: `Hi ${user?.name?.split(' ')[0] ?? 'there'}! 👋 I'm your AI study assistant. Ask me anything — homework, concepts, exam prep. I'm here to help!`, isUser: false,
  }]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const quickQ = ['Explain Newton\'s laws', 'How to solve quadratic equations?', 'What is photosynthesis?', 'Explain osmosis', 'Pythagoras theorem'];

  const send = async (text: string) => {
    if (!text.trim() || typing) return;
    setMessages(prev => [...prev, { id: Date.now().toString(), text, isUser: true }]);
    setInput('');
    setTyping(true);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    const answer = await askAIDoubt(text);
    setTyping(false);
    setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: answer, isUser: false }]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 200);
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        <View style={s.aiBanner}>
          <View style={s.aiDot} />
          <Text style={s.aiBannerText}>AI Study Assistant · Powered by Groq</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, gap: 8 }}>
          {quickQ.map((q, i) => <Chip key={i} label={q} onPress={() => send(q)} />)}
        </ScrollView>
        <ScrollView ref={scrollRef} style={{ flex: 1, backgroundColor: colors.gray50 }} contentContainerStyle={{ padding: spacing.lg, gap: 12 }} keyboardShouldPersistTaps="handled" onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>
          {messages.map(msg => (
            <View key={msg.id} style={{ alignSelf: msg.isUser ? 'flex-end' : 'flex-start', maxWidth: '88%' }}>
              {!msg.isUser && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                  <View style={s.aiDot} />
                  <Text style={{ fontSize: 10, fontWeight: typography.bold, color: colors.gray400, textTransform: 'uppercase', letterSpacing: 0.5 }}>EduSpark AI</Text>
                </View>
              )}
              <View style={[s.bubble, msg.isUser ? { backgroundColor: colors.brand, borderBottomRightRadius: 4 } : { backgroundColor: colors.white, borderBottomLeftRadius: 4, borderWidth: 0.5, borderColor: colors.gray200 }]}>
                <Text style={[{ fontSize: typography.sm, lineHeight: 20 }, msg.isUser ? { color: colors.white } : { color: colors.gray800 }]}>{msg.text}</Text>
              </View>
            </View>
          ))}
          {typing && (
            <View style={[s.bubble, { backgroundColor: colors.white, alignSelf: 'flex-start', borderWidth: 0.5, borderColor: colors.gray200 }]}>
              <Text style={{ fontSize: typography.sm, color: colors.gray400, fontStyle: 'italic' }}>AI is thinking...</Text>
            </View>
          )}
        </ScrollView>
        <View style={s.aiInput}>
          <TextInput style={s.aiTextField} placeholder="Ask a question..." value={input} onChangeText={setInput} multiline maxLength={500} placeholderTextColor={colors.gray400} returnKeyType="send" onSubmitEditing={() => send(input)} />
          <TouchableOpacity style={[s.aiSendBtn, { backgroundColor: (!input.trim() || typing) ? colors.gray200 : colors.brand }]} onPress={() => send(input)} disabled={!input.trim() || typing} activeOpacity={0.85}>
            <Ionicons name="send" size={18} color={(!input.trim() || typing) ? colors.gray400 : colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Competition Screen ───────────────────────────────────────────────────────
export function CompetitionScreen() {
  const { user } = useStore();
  const { data: competition, isLoading } = useActiveCompetition(user?.classId);
  const submitComp = useSubmitCompetition();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleSubmit = async () => {
    if (!competition) return;
    const questions = competition.questions as any[];
    let correct = 0;
    questions.forEach((q: any, i: number) => { if (answers[i] === q.answer) correct++; });
    const finalScore = Math.round((correct / questions.length) * 100);
    setScore(finalScore);
    setSubmitted(true);
    try { await submitComp.mutateAsync({ competitionId: competition.id, studentId: user!.id, answers: Object.values(answers), score: finalScore }); } catch {}
  };

  if (isLoading) return <View style={[s.safe, { alignItems: 'center', justifyContent: 'center' }]}><ActivityIndicator color={colors.brand} /></View>;
  if (!competition) return <SafeAreaView style={s.safe}><EmptyState emoji="🏆" title="No Active Competition" subtitle="Check back soon for new challenges!" /></SafeAreaView>;

  const questions = competition.questions as any[];

  if (submitted) {
    return (
      <SafeAreaView style={s.safe}>
        <ScrollView contentContainerStyle={[s.content, { alignItems: 'center', paddingTop: 40 }]}>
          <Text style={{ fontSize: 72 }}>{score >= 80 ? '🏆' : score >= 60 ? '🥈' : '📚'}</Text>
          <Text style={{ fontSize: typography['3xl'], fontWeight: typography.extrabold, color: colors.gray900, marginTop: 16 }}>{score}%</Text>
          <Text style={{ fontSize: typography.lg, color: colors.gray500, marginTop: 8 }}>{score >= 80 ? 'Excellent work!' : score >= 60 ? 'Good effort!' : 'Keep practicing!'}</Text>
          <Badge label={`+${Math.round(score / 10) * 10} XP earned`} variant="success" size="md" />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.content}>
          <Card color={colors.brandLight}>
            <Text style={{ fontSize: typography.xs, color: colors.brand, fontWeight: typography.bold, textTransform: 'uppercase', letterSpacing: 1 }}>{(competition as any).subjects?.name}</Text>
            <Text style={{ fontSize: typography.xl, fontWeight: typography.extrabold, color: colors.gray900, marginTop: 4 }}>{competition.title}</Text>
          </Card>
          {questions.map((q: any, qi: number) => (
            <Card key={qi}>
              <Text style={{ fontSize: typography.base, fontWeight: typography.semibold, color: colors.gray800, marginBottom: 12 }}>Q{qi + 1}. {q.q}</Text>
              {q.options.map((opt: string, oi: number) => (
                <TouchableOpacity key={oi} style={[s.optionBtn, answers[qi] === oi && { borderColor: colors.brand, backgroundColor: colors.brandLight }]} onPress={() => setAnswers(a => ({ ...a, [qi]: oi }))} activeOpacity={0.8}>
                  <View style={[s.optionDot, answers[qi] === oi && { backgroundColor: colors.brand }]} />
                  <Text style={[s.optionText, answers[qi] === oi && { color: colors.brand, fontWeight: typography.semibold }]}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </Card>
          ))}
          <Button label={`Submit (${Object.keys(answers).length}/${questions.length} answered)`} onPress={handleSubmit} disabled={Object.keys(answers).length < questions.length} loading={submitComp.isPending} gradient />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getTimeGreeting() {
  const h = new Date().getHours();
  return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.gray50 },
  scroll: { paddingBottom: 90 },
  content: { padding: spacing.lg },
  header: { paddingTop: 12, paddingBottom: 20, paddingHorizontal: spacing.lg },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  headerGreeting: { fontSize: typography.sm, color: 'rgba(255,255,255,0.75)', marginBottom: 2 },
  headerName: { fontSize: typography['3xl'], fontWeight: typography.extrabold, color: colors.white, letterSpacing: -0.5 },
  headerSub: { fontSize: typography.xs, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  xpCard: { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: radius.md, padding: 12 },
  logoutBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.dangerBg, alignItems: 'center', justifyContent: 'center' },
  periodRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  periodBorder: { borderBottomWidth: 0.5, borderColor: colors.gray100 },
  periodNum: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  periodNumText: { fontSize: typography.sm, fontWeight: typography.bold },
  periodSubject: { fontSize: typography.sm, fontWeight: typography.semibold, color: colors.gray900 },
  periodTime: { fontSize: typography.xs, color: colors.gray400, marginTop: 1 },
  periodRoom: { fontSize: typography.xs, color: colors.gray400 },
  hwIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  hwTitle: { fontSize: typography.base, fontWeight: typography.semibold, color: colors.gray900, marginBottom: 2 },
  hwSub: { fontSize: typography.xs, color: colors.gray400 },
  hwDesc: { fontSize: typography.sm, color: colors.gray600, marginTop: 4 },
  quickAction: { flex: 1, borderRadius: radius.lg, padding: 16, alignItems: 'center', borderWidth: 1 },
  toast: { position: 'absolute', top: 16, left: 20, right: 20, backgroundColor: colors.gray800, borderRadius: radius.lg, padding: 12, zIndex: 999 },
  toastText: { color: colors.white, fontSize: typography.sm, textAlign: 'center', fontWeight: typography.medium },
  xpBanner: { borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md },
  calDot: { width: 10, height: 10, borderRadius: 5 },
  leaderRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  leaderRank: { fontSize: typography.lg, fontWeight: typography.extrabold, color: colors.gray400, width: 36 },
  scoreText: { fontSize: typography.lg, fontWeight: typography.extrabold },
  aiBanner: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.brandLight, paddingHorizontal: spacing.lg, paddingVertical: 8 },
  aiDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#22c55e' },
  aiBannerText: { fontSize: typography.xs, color: colors.brand, fontWeight: typography.semibold },
  bubble: { borderRadius: 16, padding: 12, maxWidth: '100%' },
  aiInput: { flexDirection: 'row', alignItems: 'flex-end', padding: spacing.md, gap: 10, borderTopWidth: 0.5, borderColor: colors.gray200, backgroundColor: colors.white },
  aiTextField: { flex: 1, backgroundColor: colors.gray100, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: typography.sm, color: colors.gray900, maxHeight: 120 },
  aiSendBtn: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  optionBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.gray200, padding: 12, marginBottom: 8 },
  optionDot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: colors.gray300 },
  optionText: { fontSize: typography.sm, color: colors.gray700 },
});
