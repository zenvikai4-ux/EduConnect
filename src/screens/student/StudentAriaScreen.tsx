import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, KeyboardAvoidingView, Platform, ActivityIndicator,
  StatusBar, Animated, Easing,
} from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { Colors, Radius, Shadow } from '../../constants/theme';
import {
  ariaChat, generateQuiz, generateGoalPlan,
  buildAriaSystemPrompt, type QuizItem, type GoalWeek,
} from '../../services/groqService';
import {
  saveSessionToMemory, buildMemoryContext, buildCurriculumContext,
} from '../../services/ariaMemory';

type Mode = 'chat' | 'quiz' | 'goals';
interface ChatMsg { id: string; role: 'user' | 'assistant'; content: string; time: string }
const now = () => new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

// ─── TYPING DOTS ──────────────────────────────────────────────────
const TypingDots: React.FC = () => {
  const dots = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];
  useEffect(() => {
    const anims = dots.map((d, i) =>
      Animated.loop(Animated.sequence([
        Animated.delay(i * 180),
        Animated.timing(d, { toValue: -6, duration: 350, useNativeDriver: true }),
        Animated.timing(d, { toValue: 0, duration: 350, useNativeDriver: true }),
      ]))
    );
    anims.forEach(a => a.start());
    return () => anims.forEach(a => a.stop());
  }, []);
  return (
    <View style={s.typingRow}>
      {dots.map((d, i) => (
        <Animated.View key={i} style={[s.typingDot, { transform: [{ translateY: d }] }]} />
      ))}
    </View>
  );
};

export const StudentAriaScreen: React.FC = () => {
  const { user } = useAuthStore();
  const student = user as any;
  const [mode, setMode] = useState<Mode>('chat');
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [memCtx, setMemCtx] = useState('');
  const [currCtx, setCurrCtx] = useState('');
  const [quiz, setQuiz] = useState<QuizItem[]>([]);
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizDone, setQuizDone] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizTopic, setQuizTopic] = useState('');
  const [goalPlan, setGoalPlan] = useState<GoalWeek[]>([]);
  const [goalLoading, setGoalLoading] = useState(false);
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const scrollRef = useRef<ScrollView>(null);

  const systemPrompt = buildAriaSystemPrompt({
    studentName: student?.name ?? 'Student',
    grade: student?.grade ?? '8',
    schoolName: 'Greenfield Academy',
    subjects: student?.subjects ?? ['Science', 'Mathematics', 'English'],
    upcomingExams: student?.upcomingExams ?? [],
    pendingHomework: student?.pendingHomework ?? [],
    xpPoints: student?.xpPoints ?? 340,
    level: student?.level ?? 4,
    streak: student?.streak ?? 4,
  });

  // Load memory context & show greeting
  useEffect(() => {
    const load = async () => {
      const studentId = student?.id ?? 'stu_001';
      const schoolId = student?.schoolId ?? 'school_001';
      const [mem, curr] = await Promise.all([
        buildMemoryContext(studentId),
        buildCurriculumContext(schoolId, student?.subjects ?? ['Science', 'Mathematics']),
      ]);
      setMemCtx(mem);
      setCurrCtx(curr);

      const firstName = student?.name?.split(' ')[0] ?? 'there';
      const hw = student?.pendingHomework ?? [];
      const exams = student?.upcomingExams ?? [];
      const streak = student?.streak ?? 0;

      let greeting = `Hi ${firstName}! I'm Aria, your AI study companion ✨\n\n`;
      if (streak > 0) greeting += `🔥 You're on a ${streak}-day study streak — amazing!\n`;
      if (hw.length > 0) greeting += `📚 You have ${hw.length} pending assignment${hw.length > 1 ? 's' : ''}.\n`;
      if (exams.length > 0) {
        const next = exams[0];
        const daysLeft = Math.max(0, Math.round((new Date(next.date).getTime() - Date.now()) / 86400000));
        greeting += `🎯 ${next.subject} exam in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}.\n`;
      }
      greeting += `\nWhat would you like to work on today?`;

      setMessages([{ id: '0', role: 'assistant', content: greeting, time: now() }]);
    };
    load();
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;
    const userMsg = input.trim();
    setInput('');
    const userEntry: ChatMsg = { id: Date.now().toString(), role: 'user', content: userMsg, time: now() };
    setMessages(prev => [...prev, userEntry]);
    setIsTyping(true);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    const history = [...messages, userEntry].map(m => ({ role: m.role, content: m.content }));
    const fullPrompt = systemPrompt + (memCtx ? `\n\nPast context:\n${memCtx}` : '') + (currCtx ? `\n\nCurriculum:\n${currCtx}` : '');
    const response = await ariaChat(history as any, fullPrompt);

    const aiEntry: ChatMsg = { id: (Date.now() + 1).toString(), role: 'assistant', content: response, time: now() };
    setMessages(prev => [...prev, aiEntry]);
    setIsTyping(false);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    // Save to memory
    await saveSessionToMemory(student?.id ?? 'stu_001', [
      { role: 'user', content: userMsg },
      { role: 'assistant', content: response },
    ]);
  };

  const startQuiz = async (subject: string, topic: string) => {
    setQuizLoading(true);
    setQuizTopic(`${subject} — ${topic}`);
    const questions = await generateQuiz(subject, topic, student?.grade ?? '8');
    setQuiz(questions);
    setQuizIdx(0);
    setQuizScore(0);
    setQuizDone(false);
    setQuizLoading(false);
  };

  const handleAnswer = (selectedIdx: number) => {
    if (!quiz[quizIdx]) return;
    const correct = selectedIdx === quiz[quizIdx].correct;
    if (correct) setQuizScore(s => s + 1);
    if (quizIdx + 1 >= quiz.length) {
      setQuizDone(true);
    } else {
      setQuizIdx(i => i + 1);
    }
  };

  const loadGoalPlan = async (exam: any) => {
    setSelectedExam(exam);
    setGoalLoading(true);
    const plan = await generateGoalPlan(exam.subject, exam.date, student?.name?.split(' ')[0] ?? 'Student');
    setGoalPlan(plan);
    setGoalLoading(false);
  };

  const quickPrompts = ['Explain photosynthesis 🌿', 'Solve: 2x + 5 = 15 📐', 'What is Newton\'s 3rd law? ⚡', 'Help me with my homework 📚', 'Quiz me on Science 🔬'];

  return (
    <View style={{ flex: 1, backgroundColor: '#0F172A' }}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={s.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={s.ariaAvatar}><Text style={{ fontSize: 22 }}>✨</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={s.ariaName}>Aria</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <View style={s.activeDot} />
              <Text style={s.activeTxt}>AI Study Companion · Active</Text>
            </View>
          </View>
          <View style={s.xpPill}>
            <Text style={{ fontSize: 12, fontWeight: '800', color: '#fbbf24' }}>⭐ {student?.xpPoints ?? 340}</Text>
          </View>
          <View style={s.streakPill}>
            <Text style={{ fontSize: 12, fontWeight: '800', color: '#f87171' }}>🔥 {student?.streak ?? 4}</Text>
          </View>
        </View>

        {/* Mode tabs */}
        <View style={s.modeTabs}>
          {([['chat', '💬 Chat'], ['quiz', '🧠 Quiz'], ['goals', '🎯 Goals']] as [Mode, string][]).map(([m, label]) => (
            <TouchableOpacity key={m} style={[s.modeTab, mode === m && s.modeTabActive]} onPress={() => setMode(m)}>
              <Text style={[s.modeTabText, mode === m && s.modeTabTextActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ─── CHAT MODE ────────────────────── */}
      {mode === 'chat' && (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={0}>
          {/* Quick prompts */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10, gap: 8 }}>
            {quickPrompts.map((q, i) => (
              <TouchableOpacity key={i} style={s.quickChip} onPress={() => { setInput(q); }}>
                <Text style={{ fontSize: 12, color: '#a5b4fc', fontWeight: '600' }}>{q}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView ref={scrollRef} style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 12 }} onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>
            {messages.map(msg => (
              <View key={msg.id} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '88%' }}>
                {msg.role === 'assistant' && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                    <Text style={{ fontSize: 14 }}>✨</Text>
                    <Text style={{ fontSize: 10, color: '#7c3aed', fontWeight: '700', textTransform: 'uppercase' }}>Aria</Text>
                  </View>
                )}
                <View style={[s.bubble, msg.role === 'user' ? s.userBubble : s.aiBubble]}>
                  <Text style={[s.bubbleText, msg.role === 'user' && { color: '#fff' }]}>{msg.content}</Text>
                </View>
                <Text style={[s.timeText, msg.role === 'user' && { textAlign: 'right' }]}>{msg.time}</Text>
              </View>
            ))}
            {isTyping && (
              <View style={{ alignSelf: 'flex-start' }}>
                <View style={s.aiBubble}>
                  <TypingDots />
                </View>
              </View>
            )}
          </ScrollView>

          <View style={s.inputRow}>
            <TextInput
              style={s.inputField}
              value={input}
              onChangeText={setInput}
              placeholder="Ask Aria anything..."
              placeholderTextColor="#475569"
              multiline
              maxLength={500}
              onSubmitEditing={sendMessage}
              returnKeyType="send"
            />
            <TouchableOpacity style={[s.sendBtn, (!input.trim() || isTyping) && { opacity: 0.4 }]} onPress={sendMessage} disabled={!input.trim() || isTyping}>
              <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>↑</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}

      {/* ─── QUIZ MODE ────────────────────── */}
      {mode === 'quiz' && (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          {quiz.length === 0 && !quizLoading && (
            <>
              <Text style={{ color: '#94a3b8', fontSize: 14, marginBottom: 16, textAlign: 'center' }}>Choose a subject and topic to start a quiz</Text>
              {[
                { subject: 'Science', topic: 'Photosynthesis & Plant Life' },
                { subject: 'Mathematics', topic: 'Linear Equations' },
                { subject: 'Science', topic: 'Force & Motion' },
                { subject: 'Mathematics', topic: 'Rational Numbers' },
                { subject: 'English', topic: 'Grammar & Comprehension' },
                { subject: 'Social Studies', topic: 'Indian History' },
              ].map((item, i) => (
                <TouchableOpacity key={i} style={s.quizTopicCard} onPress={() => startQuiz(item.subject, item.topic)} activeOpacity={0.85}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '800', color: '#e2e8f0' }}>{item.topic}</Text>
                    <Text style={{ fontSize: 12, color: '#7c3aed', fontWeight: '600', marginTop: 2 }}>{item.subject}</Text>
                  </View>
                  <Text style={{ color: '#7c3aed', fontSize: 20, fontWeight: '700' }}>›</Text>
                </TouchableOpacity>
              ))}
            </>
          )}

          {quizLoading && (
            <View style={{ alignItems: 'center', padding: 40 }}>
              <ActivityIndicator color="#7c3aed" size="large" />
              <Text style={{ color: '#94a3b8', marginTop: 12, fontSize: 14 }}>Aria is preparing your quiz...</Text>
            </View>
          )}

          {quiz.length > 0 && !quizLoading && !quizDone && (
            <View>
              <View style={s.quizHeader}>
                <Text style={{ color: '#94a3b8', fontSize: 12 }}>{quizTopic}</Text>
                <Text style={{ color: '#fff', fontWeight: '800', fontSize: 14 }}>Q {quizIdx + 1}/{quiz.length}</Text>
              </View>
              <View style={s.quizProgress}>
                <View style={{ width: `${((quizIdx + 1) / quiz.length) * 100}%`, height: 4, backgroundColor: '#7c3aed', borderRadius: 2 }} />
              </View>
              <View style={s.questionCard}>
                <Text style={{ color: '#e2e8f0', fontSize: 16, fontWeight: '700', lineHeight: 24 }}>{quiz[quizIdx]?.question}</Text>
              </View>
              {quiz[quizIdx]?.options?.map((opt, i) => (
                <TouchableOpacity key={i} style={s.optionBtn} onPress={() => handleAnswer(i)} activeOpacity={0.85}>
                  <View style={s.optionLetter}><Text style={{ color: '#7c3aed', fontWeight: '800', fontSize: 13 }}>{String.fromCharCode(65 + i)}</Text></View>
                  <Text style={{ color: '#e2e8f0', fontSize: 14, flex: 1 }}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {quizDone && (
            <View style={{ alignItems: 'center', padding: 24 }}>
              <Text style={{ fontSize: 64, marginBottom: 12 }}>{quizScore >= quiz.length * 0.8 ? '🏆' : quizScore >= quiz.length * 0.6 ? '⭐' : '📚'}</Text>
              <Text style={{ fontSize: 32, fontWeight: '900', color: '#fff' }}>{quizScore}/{quiz.length}</Text>
              <Text style={{ fontSize: 20, fontWeight: '700', color: quizScore >= quiz.length * 0.8 ? '#4ade80' : '#f59e0b', marginTop: 8 }}>
                {quizScore >= quiz.length * 0.8 ? 'Excellent!' : quizScore >= quiz.length * 0.6 ? 'Good job!' : 'Keep practicing!'}
              </Text>
              <Text style={{ color: '#94a3b8', fontSize: 14, marginTop: 8 }}>+{quizScore * 20} XP earned</Text>
              <TouchableOpacity style={[s.optionBtn, { backgroundColor: '#7c3aed', marginTop: 24, borderColor: '#7c3aed' }]} onPress={() => setQuiz([])}>
                <Text style={{ color: '#fff', fontWeight: '800', fontSize: 14 }}>Try Another Quiz</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}

      {/* ─── GOALS MODE ───────────────────── */}
      {mode === 'goals' && (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          {goalPlan.length === 0 && !goalLoading && (
            <>
              <Text style={{ color: '#94a3b8', fontSize: 14, marginBottom: 16, textAlign: 'center' }}>
                Select an upcoming exam to generate a personalised study plan
              </Text>
              {(student?.upcomingExams ?? [{ subject: 'Science', date: '2026-04-14' }, { subject: 'Mathematics', date: '2026-04-15' }]).map((exam: any, i: number) => {
                const daysLeft = Math.max(0, Math.round((new Date(exam.date).getTime() - Date.now()) / 86400000));
                return (
                  <TouchableOpacity key={i} style={s.quizTopicCard} onPress={() => loadGoalPlan(exam)} activeOpacity={0.85}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '800', color: '#e2e8f0' }}>{exam.subject}</Text>
                      <Text style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{new Date(exam.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {daysLeft} days left</Text>
                    </View>
                    <View style={{ backgroundColor: daysLeft <= 3 ? '#fde8e8' : daysLeft <= 7 ? '#fef3c7' : '#dcfce7', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 }}>
                      <Text style={{ fontSize: 11, fontWeight: '800', color: daysLeft <= 3 ? Colors.danger : daysLeft <= 7 ? Colors.warning : Colors.success }}>{daysLeft}d</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </>
          )}

          {goalLoading && (
            <View style={{ alignItems: 'center', padding: 40 }}>
              <ActivityIndicator color="#7c3aed" size="large" />
              <Text style={{ color: '#94a3b8', marginTop: 12 }}>Aria is crafting your study plan...</Text>
            </View>
          )}

          {goalPlan.length > 0 && !goalLoading && (
            <>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ color: '#e2e8f0', fontSize: 16, fontWeight: '800' }}>📅 Your Study Plan</Text>
                <TouchableOpacity onPress={() => setGoalPlan([])}>
                  <Text style={{ color: '#7c3aed', fontSize: 12, fontWeight: '700' }}>← Back</Text>
                </TouchableOpacity>
              </View>
              {goalPlan.map((week, i) => (
                <View key={i} style={s.weekCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#7c3aed', alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ color: '#fff', fontWeight: '900', fontSize: 14 }}>W{week.week}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: '#e2e8f0', fontWeight: '800', fontSize: 14 }}>{week.focus}</Text>
                      <Text style={{ color: '#7c3aed', fontSize: 11, marginTop: 1 }}>🏁 {week.milestone}</Text>
                    </View>
                  </View>
                  {week.tasks.map((task, j) => (
                    <View key={j} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                      <Text style={{ color: '#7c3aed', fontSize: 14, marginTop: 1 }}>•</Text>
                      <Text style={{ color: '#94a3b8', fontSize: 13, flex: 1, lineHeight: 19 }}>{task}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const s = StyleSheet.create({
  header: { backgroundColor: '#1e293b', paddingTop: 52, paddingBottom: 0, paddingHorizontal: 16 },
  ariaAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#7c3aed', alignItems: 'center', justifyContent: 'center' },
  ariaName: { fontSize: 18, fontWeight: '900', color: '#fff' },
  activeDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#4ade80' },
  activeTxt: { fontSize: 11, color: '#94a3b8', fontWeight: '600' },
  xpPill: { backgroundColor: 'rgba(251,191,36,0.15)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  streakPill: { backgroundColor: 'rgba(248,113,113,0.15)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  modeTabs: { flexDirection: 'row', marginTop: 14, borderBottomWidth: 0.5, borderColor: '#334155' },
  modeTab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  modeTabActive: { borderBottomWidth: 2, borderColor: '#7c3aed' },
  modeTabText: { fontSize: 13, fontWeight: '700', color: '#64748b' },
  modeTabTextActive: { color: '#7c3aed' },
  quickChip: { backgroundColor: '#1e293b', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: '#334155' },
  bubble: { borderRadius: 18, padding: 14, maxWidth: '100%' },
  userBubble: { backgroundColor: '#7c3aed', borderBottomRightRadius: 4 },
  aiBubble: { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155', borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 14, color: '#e2e8f0', lineHeight: 20 },
  timeText: { fontSize: 10, color: '#475569', marginTop: 4 },
  typingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 4 },
  typingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#7c3aed' },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, padding: 12, borderTopWidth: 0.5, borderColor: '#1e293b', backgroundColor: '#0f172a' },
  inputField: { flex: 1, backgroundColor: '#1e293b', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: '#e2e8f0', maxHeight: 120, borderWidth: 1, borderColor: '#334155' },
  sendBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#7c3aed', alignItems: 'center', justifyContent: 'center' },
  quizTopicCard: { backgroundColor: '#1e293b', borderRadius: 16, padding: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  quizHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  quizProgress: { height: 4, backgroundColor: '#334155', borderRadius: 2, overflow: 'hidden', marginBottom: 16 },
  questionCard: { backgroundColor: '#1e293b', borderRadius: 16, padding: 20, marginBottom: 14, borderWidth: 1, borderColor: '#334155' },
  optionBtn: { backgroundColor: '#1e293b', borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#334155' },
  optionLetter: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#2d1b69', alignItems: 'center', justifyContent: 'center' },
  weekCard: { backgroundColor: '#1e293b', borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#334155' },
});
