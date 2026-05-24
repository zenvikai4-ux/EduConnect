import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, KeyboardAvoidingView, Platform, ActivityIndicator,
  Animated, StatusBar,
} from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { Colors, Radius } from '../../constants/theme';
import {
  ariaChat, generateQuiz, generateGoalPlan, buildAriaSystemPrompt,
  type QuizItem, type GoalWeek,
} from '../../services/groqService';
import {
  saveSessionToMemory, buildMemoryContext, buildCurriculumContext,
} from '../../services/ariaMemory';
import type { StudentUser } from '../../types';

type Mode = 'chat' | 'quiz' | 'goals';
interface ChatMsg { id: string; role: 'user' | 'assistant'; content: string; time: string }
const now = () => new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

// ─── TYPING DOTS ──────────────────────────────────────────────────
const TypingDots: React.FC = () => {
  const dots = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];
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
    <View style={styles.typingRow}>
      {dots.map((d, i) => (
        <Animated.View key={i} style={[styles.typingDot, { transform: [{ translateY: d }] }]} />
      ))}
    </View>
  );
};

// ─── MAIN SCREEN ──────────────────────────────────────────────────
export const StudentAriaScreen: React.FC = () => {
  const { user, logout } = useAuthStore();
  const student = user as StudentUser;
  const [mode, setMode] = useState<Mode>('chat');
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [memoryContext, setMemoryContext] = useState('');
  const [curriculumContext, setCurriculumContext] = useState('');
  const [sessionCount, setSessionCount] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const systemPrompt = buildAriaSystemPrompt({
    studentName: student?.name ?? 'Student',
    grade: student?.grade ?? '8',
    schoolName: 'Greenfield Academy',
    subjects: student?.subjects ?? ['Science', 'Mathematics', 'English'],
    upcomingExams: student?.upcomingExams ?? [],
    pendingHomework: student?.pendingHomework ?? [],
  });

  // Load memory and curriculum on mount
  useEffect(() => {
    const loadContext = async () => {
      const studentId = student?.id ?? 'stu_001';
      const schoolId = student?.schoolId ?? 'school_001';
      const [mem, curr] = await Promise.all([
        buildMemoryContext(studentId),
        buildCurriculumContext(schoolId, student?.subjects ?? ['Science', 'Mathematics']),
      ]);
      setMemoryContext(mem);
      setCurriculumContext(curr);

      // Personalised greeting based on memory
      const hasMemory = mem.length > 0;
      const firstName = student?.name?.split(' ')[0] ?? 'there';
      const greeting = hasMemory
        ? `Hey ${firstName}! 👋 Welcome back! I remember we worked on some topics recently. What would you like to explore today?`
        : `Hey ${firstName}! 👋 I am Aria, your study companion. Your Science exam is on April 14 and Chapter 9 reading is due tomorrow. Want a quick warmup, or is there something you are stuck on?`;

      setMessages([{ id: '0', role: 'assistant', time: now(), content: greeting }]);
    };
    loadContext();
  }, []);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages, isTyping]);

  // Save session to memory when leaving (when messages > 3)
  useEffect(() => {
    return () => {
      if (messages.length > 3) {
        const studentId = student?.id ?? 'stu_001';
        saveSessionToMemory(studentId, messages.map(m => ({ role: m.role, content: m.content })));
      }
    };
  }, [messages]);

  const send = useCallback(async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg) return;
    setInput('');
    const userMsg: ChatMsg = { id: Date.now().toString(), role: 'user', content: msg, time: now() };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);
    setSessionCount(c => c + 1);

    const history = messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));
    const extraContext = memoryContext + curriculumContext;
    const reply = await ariaChat(systemPrompt, history, msg, extraContext || undefined);

    setIsTyping(false);
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: reply, time: now() }]);
  }, [input, messages, systemPrompt, memoryContext, curriculumContext]);

  const QUICK_PROMPTS = [
    'Explain photosynthesis', 'Help with quadratic equations',
    'What is on my Science exam?', 'Quiz me on Chapter 9',
  ];

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="light-content" />
      <View style={{ flex: 1, backgroundColor: Colors.slate50 }}>

        {/* Header */}
        <View style={{backgroundColor: "#4C1D95"}}>
          <View style={styles.headerRow}>
            <View style={styles.ariaAv}><Text style={{ fontSize: 22 }}>✨</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.ariaName}>Aria</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <View style={styles.onlineDot} />
                <Text style={styles.ariaStatus}>
                  {memoryContext ? 'Remembers your sessions 🧠' : 'Ready to help'}
                </Text>
              </View>
            </View>
            {sessionCount > 0 && (
              <View style={styles.sessionBadge}>
                <Text style={styles.sessionText}>{sessionCount} msgs</Text>
              </View>
            )}
            <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '700' }}>Exit</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Mode switcher */}
        <View style={styles.modeBar}>
          {(['chat', 'quiz', 'goals'] as Mode[]).map(m => (
            <TouchableOpacity key={m} style={[styles.modeBtn, mode === m && styles.modeBtnActive]}
              onPress={() => setMode(m)}>
              <Text style={[styles.modeTxt, mode === m && styles.modeTxtActive]}>
                {m === 'chat' ? '💬 Chat' : m === 'quiz' ? '🧠 Quiz Me' : '🎯 Goals'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Chat */}
        {mode === 'chat' && (
          <>
            <ScrollView ref={scrollRef} style={{ flex: 1 }}
              contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
              showsVerticalScrollIndicator={false}>
              {memoryContext !== '' && messages.length <= 1 && (
                <View style={styles.memoryBanner}>
                  <Text style={styles.memoryText}>🧠 Aria remembers your past sessions</Text>
                </View>
              )}
              {messages.map(m => (
                <View key={m.id} style={[styles.bubble, m.role === 'user' ? styles.bubbleUser : styles.bubbleAria]}>
                  <Text style={[styles.bubbleText, m.role === 'user' ? { color: '#fff' } : { color: Colors.slate800 }]}>
                    {m.content}
                  </Text>
                  <Text style={styles.bubbleTime}>{m.time}</Text>
                </View>
              ))}
              {isTyping && (
                <View style={styles.bubbleAria}><TypingDots /></View>
              )}
            </ScrollView>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}
              style={styles.quickBar} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, alignItems: 'center' }}>
              {QUICK_PROMPTS.map(q => (
                <TouchableOpacity key={q} style={styles.quickChip} onPress={() => send(q)}>
                  <Text style={styles.quickChipText}>{q}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.inputBar}>
              <TextInput
                style={styles.textInput}
                placeholder="Ask Aria anything..."
                placeholderTextColor={Colors.slate400}
                value={input}
                onChangeText={setInput}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[styles.sendBtn, (!input.trim() || isTyping) && { opacity: 0.4 }]}
                onPress={() => send()} disabled={!input.trim() || isTyping}>
                <Text style={{ color: '#fff', fontSize: 18 }}>➤</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {mode === 'quiz' && <QuizMode student={student} />}
        {mode === 'goals' && <GoalsMode student={student} />}
      </View>
    </KeyboardAvoidingView>
  );
};

// ─── QUIZ MODE ────────────────────────────────────────────────────
const QuizMode: React.FC<{ student: StudentUser }> = ({ student }) => {
  const [phase, setPhase] = useState<'start' | 'loading' | 'active' | 'done'>('start');
  const [questions, setQuestions] = useState<QuizItem[]>([]);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [chosen, setChosen] = useState<Record<number, number>>({});

  const startQuiz = async () => {
    setPhase('loading');
    const q = await generateQuiz('Photosynthesis and Plant Life', student?.grade ?? '8');
    setQuestions(q); setScore(0); setAnswered(0); setChosen({});
    setPhase('active');
  };

  const answer = (qi: number, oi: number) => {
    if (chosen[qi] !== undefined) return;
    setChosen(prev => ({ ...prev, [qi]: oi }));
    if (oi === questions[qi].correct) setScore(s => s + 1);
    const newAnswered = answered + 1;
    setAnswered(newAnswered);
    if (newAnswered === questions.length) setTimeout(() => setPhase('done'), 600);
  };

  if (phase === 'start') return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <Text style={{ fontSize: 40, marginBottom: 16 }}>🧠</Text>
      <Text style={styles.quizTitle}>Quiz Mode</Text>
      <Text style={{ fontSize: 13, color: Colors.slate500, textAlign: 'center', marginBottom: 28 }}>
        Science · Chapter 9 · 3 questions · AI-generated
      </Text>
      <TouchableOpacity style={[styles.sendBtn, { width: 160, height: 48, borderRadius: 12 }]} onPress={startQuiz}>
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>Start Quiz ✨</Text>
      </TouchableOpacity>
    </View>
  );

  if (phase === 'loading') return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={Colors.aria} size="large" />
      <Text style={{ color: Colors.aria, fontWeight: '600', marginTop: 12 }}>Generating with Groq AI...</Text>
    </View>
  );

  if (phase === 'done') return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <Text style={{ fontSize: 50, marginBottom: 16 }}>🎉</Text>
      <Text style={styles.quizTitle}>Quiz Complete!</Text>
      <Text style={{ fontSize: 16, color: Colors.slate600, marginBottom: 24, textAlign: 'center' }}>
        {score}/{questions.length} · {score === questions.length ? 'Perfect! 🌟' : score >= 2 ? 'Great job! 💪' : 'Keep practising! 🚀'}
      </Text>
      <TouchableOpacity style={[styles.sendBtn, { width: 180, height: 48, borderRadius: 12 }]} onPress={() => setPhase('start')}>
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
      {questions.map((q, qi) => (
        <View key={qi} style={styles.quizCard}>
          <Text style={styles.quizQNum}>Question {qi + 1} of {questions.length}</Text>
          <Text style={styles.quizQ}>{q.question}</Text>
          {q.options.map((opt, oi) => {
            const sel = chosen[qi];
            const isCorrect = oi === q.correct;
            const isChosen = sel === oi;
            let bg = '#fff', border = Colors.slate200, textC = Colors.slate800;
            if (sel !== undefined) {
              if (isCorrect) { bg = Colors.successSurface; border = Colors.success; textC = Colors.success; }
              else if (isChosen) { bg = Colors.dangerSurface; border = Colors.danger; textC = Colors.danger; }
            }
            return (
              <TouchableOpacity key={oi} onPress={() => answer(qi, oi)} disabled={sel !== undefined}
                style={[styles.quizOpt, { backgroundColor: bg, borderColor: border }]}>
                <Text style={{ fontSize: 13, color: textC }}>{String.fromCharCode(65 + oi)}. {opt}</Text>
              </TouchableOpacity>
            );
          })}
          {chosen[qi] !== undefined && (
            <View style={styles.quizExp}>
              <Text style={{ fontSize: 12, color: Colors.slate700, lineHeight: 18 }}>💡 {q.explanation}</Text>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
};

// ─── GOALS MODE ───────────────────────────────────────────────────
const GoalsMode: React.FC<{ student: StudentUser }> = ({ student }) => {
  const [phase, setPhase] = useState<'input' | 'loading' | 'plan'>('input');
  const [goalText, setGoalText] = useState('');
  const [plan, setPlan] = useState<GoalWeek[]>([]);

  const generate = async () => {
    if (!goalText.trim()) return;
    setPhase('loading');
    const result = await generateGoalPlan(goalText, student?.grade ?? '8', student?.subjects ?? []);
    setPlan(result);
    setPhase('plan');
  };

  if (phase === 'loading') return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={Colors.aria} size="large" />
      <Text style={{ color: Colors.aria, fontWeight: '600', marginTop: 12 }}>Aria is building your plan...</Text>
    </View>
  );

  if (phase === 'plan') return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
      <View style={{backgroundColor: "#4C1D95"}}>
        <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', marginBottom: 4 }}>YOUR GOAL</Text>
        <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>{goalText}</Text>
      </View>
      {plan.map(w => (
        <View key={w.week} style={styles.goalCard}>
          <Text style={styles.goalWeek}>Week {w.week}</Text>
          <Text style={styles.goalFocus}>{w.focus}</Text>
          {w.tasks.map((t, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: 8, marginBottom: 6, alignItems: 'flex-start' }}>
              <View style={[styles.goalCheck, i === 0 && w.week === 1 && styles.goalCheckDone]}>
                {i === 0 && w.week === 1 && <Text style={{ fontSize: 10, color: '#fff' }}>✓</Text>}
              </View>
              <Text style={{ fontSize: 13, color: Colors.slate700, flex: 1, lineHeight: 18 }}>{t}</Text>
            </View>
          ))}
          <View style={styles.goalMilestone}>
            <Text style={{ fontSize: 11, color: Colors.aria, fontWeight: '600' }}>🏁 {w.milestone}</Text>
          </View>
        </View>
      ))}
      <TouchableOpacity style={[styles.resetBtn]} onPress={() => { setPhase('input'); setGoalText(''); setPlan([]); }}>
        <Text style={{ color: Colors.slate600, fontWeight: '600', fontSize: 13 }}>Set New Goal</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.slate800, marginBottom: 4 }}>🎯 Set a Learning Goal</Text>
      <Text style={{ fontSize: 12, color: Colors.slate500, marginBottom: 16 }}>
        Aria will build a personalised 4-week study plan for you
      </Text>
      <TextInput
        style={[styles.textInput, { height: 90, textAlignVertical: 'top', borderRadius: 12, marginBottom: 16, flex: 0 }]}
        placeholder="e.g. Score above 90% in Science this term..."
        placeholderTextColor={Colors.slate400}
        value={goalText}
        onChangeText={setGoalText}
        multiline
      />
      <TouchableOpacity
        style={[styles.sendBtn, { width: '100%', height: 50, borderRadius: 12 }]}
        onPress={generate} disabled={!goalText.trim()}>
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>✨ Build My Plan</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  header: { paddingTop: 56, paddingHorizontal: 16, paddingBottom: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  ariaAv: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)' },
  ariaName: { fontSize: 15, fontWeight: '700', color: '#fff' },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ADE80' },
  ariaStatus: { fontSize: 11, color: 'rgba(255,255,255,0.65)' },
  sessionBadge: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  sessionText: { fontSize: 10, color: '#fff', fontWeight: '600' },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  modeBar: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Colors.slate200, paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  modeBtn: { flex: 1, paddingVertical: 8, borderRadius: Radius.full, backgroundColor: Colors.slate100, alignItems: 'center' },
  modeBtnActive: { backgroundColor: Colors.aria },
  modeTxt: { fontSize: 12, fontWeight: '700', color: Colors.slate600 },
  modeTxtActive: { color: '#fff' },
  memoryBanner: { backgroundColor: Colors.ariaSurface, borderRadius: 10, padding: 10, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(124,58,237,0.2)' },
  memoryText: { fontSize: 12, color: Colors.aria, fontWeight: '600', textAlign: 'center' },
  bubble: { maxWidth: '82%', padding: 12, borderRadius: 16, marginBottom: 8 },
  bubbleAria: { backgroundColor: '#fff', borderBottomLeftRadius: 4, alignSelf: 'flex-start', borderWidth: 0.5, borderColor: Colors.slate200, maxWidth: '82%', padding: 12, borderRadius: 16, marginBottom: 8 },
  bubbleUser: { backgroundColor: Colors.aria, borderBottomRightRadius: 4, alignSelf: 'flex-end' },
  bubbleText: { fontSize: 14, lineHeight: 21 },
  bubbleTime: { fontSize: 9, color: 'rgba(0,0,0,0.3)', marginTop: 4, textAlign: 'right' },
  typingRow: { flexDirection: 'row', gap: 4, alignItems: 'center', paddingVertical: 4 },
  typingDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.slate400 },
  quickBar: { maxHeight: 48, borderTopWidth: 0.5, borderTopColor: Colors.slate100, backgroundColor: '#fff' },
  quickChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.full, backgroundColor: Colors.ariaSurface },
  quickChipText: { fontSize: 12, fontWeight: '600', color: Colors.aria },
  inputBar: { flexDirection: 'row', gap: 8, padding: 12, paddingBottom: 24, backgroundColor: '#fff', borderTopWidth: 0.5, borderTopColor: Colors.slate200, alignItems: 'flex-end' },
  textInput: { flex: 1, borderWidth: 1.5, borderColor: Colors.slate200, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: Colors.slate800, maxHeight: 80 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.aria, alignItems: 'center', justifyContent: 'center' },
  quizTitle: { fontSize: 20, fontWeight: '800', color: Colors.slate800, marginBottom: 8 },
  quizCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 14, borderWidth: 0.5, borderColor: Colors.slate200 },
  quizQNum: { fontSize: 10, fontWeight: '700', color: Colors.aria, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 8 },
  quizQ: { fontSize: 15, fontWeight: '700', color: Colors.slate800, marginBottom: 14, lineHeight: 22 },
  quizOpt: { padding: 13, borderRadius: 10, borderWidth: 1.5, marginBottom: 8 },
  quizExp: { backgroundColor: Colors.slate50, borderRadius: 10, padding: 12, marginTop: 8, borderWidth: 0.5, borderColor: Colors.slate200 },
  goalCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 0.5, borderColor: Colors.slate200 },
  goalWeek: { fontSize: 10, fontWeight: '700', color: Colors.aria, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 4 },
  goalFocus: { fontSize: 15, fontWeight: '700', color: Colors.slate800, marginBottom: 12 },
  goalCheck: { width: 18, height: 18, borderRadius: 4, borderWidth: 1.5, borderColor: Colors.slate300, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  goalCheckDone: { backgroundColor: Colors.success, borderColor: Colors.success },
  goalMilestone: { marginTop: 12, paddingTop: 10, borderTopWidth: 0.5, borderTopColor: Colors.slate200 },
  resetBtn: { backgroundColor: Colors.slate100, borderRadius: 10, padding: 12, alignItems: 'center', marginTop: 4 },
});
