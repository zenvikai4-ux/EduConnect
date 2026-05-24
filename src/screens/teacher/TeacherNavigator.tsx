import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, TextInput, ActivityIndicator } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Card, ListRow, SectionHeader, ProgressBar, Badge, AlertBanner, Button, AppHeader } from '../../components/shared';
import { useAuthStore } from '../../store/authStore';
import { Colors } from '../../constants/theme';
import { generateTeacherInsight } from '../../services/groqService';
import { saveCurriculum, getCurriculum } from '../../services/ariaMemory';

const Tab = createBottomTabNavigator();
const COLOR = '#4C1D95';
const Icon = ({ e, focused }: { e: string; focused: boolean }) => (
  <Text style={{ fontSize: focused ? 22 : 20, opacity: focused ? 1 : 0.5 }}>{e}</Text>
);

// ─── NAVIGATOR ────────────────────────────────────────────────────
export const TeacherNavigator: React.FC = () => (
  <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: COLOR, tabBarInactiveTintColor: '#94A3B8', tabBarLabelStyle: { fontSize: 10, fontWeight: '600' }, tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#E2E8F0', paddingBottom: 6, height: 60 } }}>
    <Tab.Screen name="Home" component={TeacherHomeScreen} options={{ tabBarIcon: ({ focused }) => <Icon e="🏠" focused={focused} /> }} />
    <Tab.Screen name="Attendance" component={TeacherAttendanceScreen} options={{ tabBarIcon: ({ focused }) => <Icon e="📋" focused={focused} /> }} />
    <Tab.Screen name="Homework" component={TeacherHomeworkScreen} options={{ tabBarIcon: ({ focused }) => <Icon e="📚" focused={focused} /> }} />
    <Tab.Screen name="AriaInsights" component={TeacherAriaInsightsScreen} options={{ tabBarIcon: ({ focused }) => (
      <View style={{ position: 'relative' }}>
        <Icon e="✨" focused={focused} />
        {!focused && <View style={{ position: 'absolute', top: -2, right: -4, width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.aria, borderWidth: 1.5, borderColor: '#F8FAFC' }} />}
      </View>
    ), tabBarLabel: 'Aria' }} />
    <Tab.Screen name="Curriculum" component={TeacherCurriculumScreen} options={{ tabBarIcon: ({ focused }) => (
      <View style={{ position: 'relative' }}>
        <Icon e="📂" focused={focused} />
        <View style={{ position: 'absolute', top: -2, right: -4, width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.aria, borderWidth: 1.5, borderColor: '#F8FAFC' }} />
      </View>
    ), tabBarLabel: 'Curriculum' }} />
    <Tab.Screen name="Messages" component={TeacherMessagesScreen} options={{ tabBarIcon: ({ focused }) => <Icon e="💬" focused={focused} /> }} />
  </Tab.Navigator>
);

// ─── HOME ─────────────────────────────────────────────────────────
const TeacherHomeScreen: React.FC = () => {
  const { logout } = useAuthStore();
  return (
  <View style={{ flex: 1, backgroundColor: Colors.slate50 }}>
    <StatusBar barStyle="light-content" />
    <AppHeader title="Class 8-A" subtitle="34 students · Ms. Kavitha Rao"
      initials="KR" gradientColors={['#4C1D95', '#6D28D9']} onLogout={logout} />
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.statsRow}>
        {[['32', 'Present', Colors.success], ['2', 'Absent', Colors.danger], ['28', 'Aria Active', Colors.aria]].map(([v, l, c]) => (
          <View key={l} style={styles.stat}><Text style={[styles.statVal, { color: c as string }]}>{v}</Text><Text style={styles.statLbl}>{l}</Text></View>
        ))}
      </View>
      <AlertBanner icon="⚠️" title="2 Students Absent" message="Arjun Sharma & Priya Mehta — parents notified" bg={Colors.warningSurface} border="#FDE68A" />
      <View style={styles.ariaInsight}>
        <View style={styles.ariaInsightHdr}><View style={styles.ariaAv}><Text>✨</Text></View><Text style={styles.ariaInsightTitle}>Aria Insight → tap for full report</Text></View>
        <Text style={styles.ariaInsightBody}>Photosynthesis light reactions are generating the most confusion in class. 6 students have not used Aria this week.</Text>
      </View>
      <SectionHeader title="Homework Status" />
      <Card>
        <ListRow icon="📖" iconBg={Colors.infoSurface} title="Science: Ch. 9 Reading" subtitle="Due tomorrow · 28/34 submitted" right={<Badge text="Open" bg={Colors.infoSurface} color={Colors.info} />} />
        <ListRow icon="📖" iconBg={Colors.successSurface} title="Math: Exercise 5.3" subtitle="Due Apr 11 · 34/34 submitted" right={<Badge text="Done" bg={Colors.successSurface} color={Colors.success} />} />
      </Card>
      <SectionHeader title="Subject Performance" />
      <Card>
        {[['Science', 91, Colors.aria], ['Math', 87, Colors.primary], ['English', 93, Colors.success], ['Social', 79, Colors.warning]].map(([s, p, c]) => (
          <View key={s as string} style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ fontSize: 14, color: Colors.slate700 }}>{s}</Text>
              <Text style={{ fontSize: 14, fontWeight: '800', color: c as string }}>{p}%</Text>
            </View>
            <ProgressBar value={p as number} color={c as string} height={6} />
          </View>
        ))}
      </Card>
    </ScrollView>
  </View>
  );
};

// ─── ATTENDANCE ───────────────────────────────────────────────────
const STUDENTS = ['Aarav Sharma', 'Arjun Kumar', 'Priya Mehta', 'Dev Gupta', 'Ananya Rao', 'Karthik Nair', 'Sana Khan', 'Vijay Reddy', 'Meera Iyer', 'Rahul Verma'];
type AttStatus = 'P' | 'A' | 'L' | null;

const TeacherAttendanceScreen: React.FC = () => {
  const [att, setAtt] = useState<Record<number, AttStatus>>({});
  const [saved, setSaved] = useState(false);

  const present = Object.values(att).filter(s => s === 'P').length;
  const absent = Object.values(att).filter(s => s === 'A').length;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.slate50 }}>
      <StatusBar barStyle="light-content" />
      <View style={{backgroundColor: "#4C1D95"}}>
        <Text style={styles.title}>Mark Attendance</Text>
        <Text style={styles.sub}>Class 8-A · April 9, 2026</Text>
      </View>
      <View style={styles.attSummary}>
        <Text style={styles.attSumText}>{present} present · {absent} absent · {STUDENTS.length - present - absent} unmarked</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card>
          {STUDENTS.map((name, i) => (
            <View key={i} style={styles.attRow}>
              <Text style={{ fontSize: 12, color: Colors.slate400, width: 24 }}>{i + 1}.</Text>
              <Text style={{ flex: 1, fontSize: 14, color: Colors.slate800 }}>{name}</Text>
              <View style={{ flexDirection: 'row', gap: 4 }}>
                {(['P', 'A', 'L'] as AttStatus[]).map(s => (
                  <TouchableOpacity key={s!} onPress={() => setAtt(prev => ({ ...prev, [i]: s }))}
                    style={[styles.attBtn, att[i] === s && (s === 'P' ? styles.attP : s === 'A' ? styles.attA : styles.attL)]}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: att[i] === s ? '#fff' : Colors.slate500 }}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </Card>
        {!saved ? (
          <Button title="Save & Notify Parents" onPress={() => setSaved(true)} color={COLOR} />
        ) : (
          <View style={styles.savedBanner}><Text style={{ color: Colors.success, fontWeight: '700', fontSize: 13 }}>✅ Attendance saved! Parents of absent students notified.</Text></View>
        )}
      </ScrollView>
    </View>
  );
};

// ─── HOMEWORK ─────────────────────────────────────────────────────
const TeacherHomeworkScreen: React.FC = () => {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [assigned, setAssigned] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.slate50 }}>
      <StatusBar barStyle="light-content" />
      <View style={{backgroundColor: "#4C1D95"}}>
        <Text style={styles.title}>Homework</Text>
        <Text style={styles.sub}>Class 8-A · Assign & track</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card>
          <Text style={styles.formLabel}>ASSIGN NEW HOMEWORK</Text>
          <TextInput style={styles.formInput} placeholder="Title" value={title} onChangeText={setTitle} />
          <TextInput style={[styles.formInput, { height: 72, textAlignVertical: 'top' }]} placeholder="Description / instructions" value={desc} onChangeText={setDesc} multiline />
          <View style={styles.subjectChips}>
            {['Science', 'Math', 'English', 'Social', 'Hindi'].map(s => (
              <TouchableOpacity key={s} style={styles.chip}><Text style={styles.chipText}>{s}</Text></TouchableOpacity>
            ))}
          </View>
          {!assigned ? (
            <Button title="✔ Assign + Notify Parents" onPress={() => { setAssigned(true); setTitle(''); setDesc(''); setTimeout(() => setAssigned(false), 3000); }} color={COLOR} />
          ) : (
            <View style={styles.savedBanner}><Text style={{ color: Colors.success, fontWeight: '700', fontSize: 13 }}>✅ Assigned! Parents notified + Aria will remind students.</Text></View>
          )}
        </Card>
        <SectionHeader title="All Assignments" />
        <Card>
          <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.slate800, marginBottom: 4 }}>Science: Chapter 9 Reading</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={{ fontSize: 12, color: Colors.slate500 }}>Due tomorrow · 28/34 submitted</Text>
            <Badge text="Open" bg={Colors.infoSurface} color={Colors.info} />
          </View>
          <ProgressBar value={82} color={Colors.primary} height={5} />
        </Card>
        <Card>
          <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.slate800, marginBottom: 4 }}>Math: Exercise 5.3</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={{ fontSize: 12, color: Colors.slate500 }}>Due Apr 11 · 34/34 submitted</Text>
            <Badge text="Done" bg={Colors.successSurface} color={Colors.success} />
          </View>
          <ProgressBar value={100} color={Colors.success} height={5} />
        </Card>
      </ScrollView>
    </View>
  );
};

// ─── ARIA INSIGHTS ─────────────────────────────────────────────────
const TeacherAriaInsightsScreen: React.FC = () => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadInsight = async () => {
    setLoading(true);
    const text = await generateTeacherInsight({
      className: 'Class 8-A', schoolName: 'Greenfield Academy',
      totalSessions: 112,
      topTopics: ['Photosynthesis', 'Quadratic Equations', 'Rivers of India'],
      confusionTopics: ['Light reactions in photosynthesis', 'Factoring quadratics'],
      inactiveCount: 6, totalStudents: 34,
    });
    setInsight(text);
    setLoading(false);
  };

  React.useEffect(() => { loadInsight(); }, []);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.slate50 }}>
      <StatusBar barStyle="light-content" />
      <View style={{backgroundColor: "#4C1D95"}}>
        <Text style={styles.title}>Aria Class Insights</Text>
        <Text style={styles.sub}>Week of Apr 7–13 · Class 8-A · 34 students</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsRow}>
          {[['28', 'Active', Colors.aria], ['112', 'Sessions', Colors.primary], ['8.2', 'Quiz Avg', Colors.success]].map(([v, l, c]) => (
            <View key={l} style={styles.stat}><Text style={[styles.statVal, { color: c as string }]}>{v}</Text><Text style={styles.statLbl}>{l}</Text></View>
          ))}
        </View>
        <View style={styles.ariaInsight}>
          <View style={styles.ariaInsightHdr}>
            <View style={styles.ariaAv}><Text>✨</Text></View>
            <Text style={styles.ariaInsightTitle}>AI Insight <Text style={{ fontSize: 10, color: Colors.aria }}>{'(Groq AI)'}</Text></Text>
          </View>
          {loading ? <ActivityIndicator color={Colors.aria} style={{ marginTop: 8 }} /> : (
            <Text style={styles.ariaInsightBody}>{insight ?? 'Loading insight...'}</Text>
          )}
        </View>
        <SectionHeader title="Topics — Most Questions" />
        <Card>
          {[['Photosynthesis', 89, Colors.aria], ['Quadratic Equations', 72, Colors.primary], ['Rivers of India', 58, Colors.warning], ['Essay Structure', 41, Colors.info]].map(([t, p, c]) => (
            <View key={t as string} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ fontSize: 14, color: Colors.slate700 }}>{t}</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: c as string }}>{p}%</Text>
              </View>
              <ProgressBar value={p as number} color={c as string} height={6} />
            </View>
          ))}
        </Card>
        <SectionHeader title="Students Needing Attention" />
        <Card>
          <ListRow icon="👦" iconBg={Colors.dangerSurface} title="Rahul Verma" subtitle="0 Aria sessions · Math quiz 3/10" right={<Badge text="Inactive" bg={Colors.dangerSurface} color={Colors.danger} />} />
          <ListRow icon="👧" iconBg={Colors.warningSurface} title="Divya Krishnan" subtitle="Avoids Hindi · 2 sessions only" right={<Badge text="Low" bg={Colors.warningSurface} color={Colors.warning} />} />
          <ListRow icon="👦" iconBg={Colors.warningSurface} title="Karthik Nair" subtitle="Repeated same topic questions" right={<Badge text="Struggling" bg={Colors.warningSurface} color={Colors.warning} />} />
        </Card>
        <SectionHeader title="Competition Leaderboard 🏆" />
        <Card>
          {[['🥇', 'Aarav Sharma', 340], ['🥈', 'Ananya Rao', 310], ['🥉', 'Priya Mehta', 295], ['4️⃣', 'Dev Gupta', 270]].map(([m, n, p]) => (
            <View key={n as string} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 9, borderBottomWidth: 0.5, borderBottomColor: Colors.slate100, gap: 10 }}>
              <Text style={{ fontSize: 20, width: 26 }}>{m}</Text>
              <Text style={{ flex: 1, fontSize: 14, fontWeight: '600', color: Colors.slate800 }}>{n}</Text>
              <Text style={{ fontSize: 15, fontWeight: '800', color: Colors.aria }}>{p} XP</Text>
            </View>
          ))}
        </Card>
      </ScrollView>
    </View>
  );
};


// ─── CURRICULUM UPLOAD ────────────────────────────────────────────
const SUBJECTS = ['Science', 'Mathematics', 'English', 'Social Studies', 'Hindi'];

const TeacherCurriculumScreen: React.FC = () => {
  const { logout } = useAuthStore();
  const [selectedSubject, setSelectedSubject] = useState('Science');
  const [content, setContent] = useState('');
  const [saved, setSaved] = useState(false);
  const [existing, setExisting] = useState<Record<string, string>>({});

  useEffect(() => {
    getCurriculum('school_001').then(setExisting);
  }, []);

  const handleSave = async () => {
    if (!content.trim()) return;
    await saveCurriculum('school_001', selectedSubject, content.trim());
    setExisting(prev => ({ ...prev, [selectedSubject]: content.trim() }));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleSubjectSelect = (subject: string) => {
    setSelectedSubject(subject);
    setContent(existing[subject] || '');
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.slate50 }}>
      <StatusBar barStyle="light-content" />
      <AppHeader title="Curriculum Upload" subtitle="Add notes · Aria learns from them"
        initials="KR" gradientColors={['#4C1D95', '#6D28D9']} onLogout={logout} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Info banner */}
        <View style={styles.infoBanner}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.aria, marginBottom: 4 }}>
            🧠 How this works
          </Text>
          <Text style={{ fontSize: 12, color: Colors.ariaDark, lineHeight: 18 }}>
            Paste your chapter notes, key concepts, or exam topics below. Aria will use this
            to give students answers specific to your school's curriculum — not generic textbook answers.
          </Text>
        </View>

        {/* Subject selector */}
        <Text style={styles.formLabel}>SELECT SUBJECT</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}
          contentContainerStyle={{ gap: 8 }}>
          {SUBJECTS.map(s => (
            <TouchableOpacity key={s}
              style={[styles.subjectChip, selectedSubject === s && styles.subjectChipActive,
                      existing[s] && styles.subjectChipHasContent]}
              onPress={() => handleSubjectSelect(s)}>
              <Text style={[styles.subjectChipText, selectedSubject === s && { color: '#fff' }]}>
                {existing[s] ? '✓ ' : ''}{s}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Content input */}
        <Text style={styles.formLabel}>CHAPTER NOTES / KEY CONCEPTS FOR {selectedSubject.toUpperCase()}</Text>
        <TextInput
          style={styles.curriculumInput}
          placeholder={`Paste your ${selectedSubject} notes here...

Example:
Chapter 9: Photosynthesis
- Plants make food using sunlight, water and CO2
- Chlorophyll is the green pigment in leaves
- Equation: 6CO2 + 6H2O → C6H12O6 + O2

The more detail you add, the better Aria answers your students.`}
          placeholderTextColor={Colors.slate400}
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
        />

        <Text style={{ fontSize: 11, color: Colors.slate400, marginBottom: 16 }}>
          {content.length}/5000 characters
        </Text>

        {!saved ? (
          <TouchableOpacity
            style={[styles.saveBtn, !content.trim() && { opacity: 0.4 }]}
            onPress={handleSave} disabled={!content.trim()}>
            <Text style={styles.saveBtnText}>💾 Save to Aria's Knowledge</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.savedBanner}>
            <Text style={{ color: Colors.success, fontWeight: '700', fontSize: 14 }}>
              ✅ Saved! Aria now knows your {selectedSubject} curriculum.
            </Text>
          </View>
        )}

        {/* Status of all subjects */}
        <Text style={[styles.formLabel, { marginTop: 20 }]}>CURRICULUM STATUS</Text>
        <View style={{ backgroundColor: '#fff', borderRadius: 14, borderWidth: 0.5, borderColor: Colors.slate200, overflow: 'hidden' }}>
          {SUBJECTS.map((s, i) => (
            <View key={s} style={{ flexDirection: 'row', alignItems: 'center', padding: 14,
              borderBottomWidth: i < SUBJECTS.length - 1 ? 0.5 : 0, borderBottomColor: Colors.slate100 }}>
              <Text style={{ flex: 1, fontSize: 14, color: Colors.slate700 }}>{s}</Text>
              {existing[s] ? (
                <View style={{ backgroundColor: Colors.successSurface, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 3 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.success }}>✓ Uploaded</Text>
                </View>
              ) : (
                <View style={{ backgroundColor: Colors.slate100, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 3 }}>
                  <Text style={{ fontSize: 11, color: Colors.slate400 }}>Not uploaded</Text>
                </View>
              )}
            </View>
          ))}
        </View>

      </ScrollView>
    </View>
  );
};

// ─── MESSAGES ─────────────────────────────────────────────────────
const MSGS = [
  { from: 'other', text: 'Can you clarify the Science project topic for Aarav?', time: '2:30 PM' },
  { from: 'me', text: 'Hi! The topic is Ecosystems. Focus on food chains and energy flow.', time: '3:15 PM' },
  { from: 'other', text: 'Thank you! He will work on it this weekend.', time: '3:20 PM' },
];
const TeacherMessagesScreen: React.FC = () => {
  const [msgs, setMsgs] = useState(MSGS);
  const [input, setInput] = useState('');
  const now = () => new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const send = () => {
    if (!input.trim()) return;
    setMsgs(prev => [...prev, { from: 'me', text: input.trim(), time: now() }]);
    setInput('');
    setTimeout(() => setMsgs(prev => [...prev, { from: 'other', text: 'Thanks for the update! Will follow up.', time: now() }]), 1200);
  };
  return (
    <View style={{ flex: 1, backgroundColor: Colors.slate50 }}>
      <StatusBar barStyle="light-content" />
      <View style={{backgroundColor: "#4C1D95"}}>
        <View style={styles.chatAv}><Text style={{ fontWeight: '700', color: '#fff' }}>RS</Text></View>
        <View><Text style={{ fontSize: 15, fontWeight: '700', color: '#fff' }}>Ramesh Sharma</Text><Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>Parent of Aarav · 8A</Text></View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 8 }}>
        {msgs.map((m, i) => (
          <View key={i} style={[styles.bubble, m.from === 'me' ? styles.bMe : styles.bOther]}>
            <Text style={{ fontSize: 13, color: m.from === 'me' ? '#fff' : Colors.slate800 }}>{m.text}</Text>
            <Text style={{ fontSize: 9, opacity: 0.5, marginTop: 4, textAlign: m.from === 'me' ? 'right' : 'left' }}>{m.time}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.inputBar}>
        <TextInput style={styles.formInput} placeholder="Type a message..." value={input} onChangeText={setInput} onSubmitEditing={send} />
        <TouchableOpacity style={styles.sendBtn} onPress={send}><Text style={{ color: '#fff', fontWeight: '700' }}>Send</Text></TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: { paddingTop: 56, paddingHorizontal: 16, paddingBottom: 20 },
  title: { fontSize: 20, fontWeight: '900', color: '#fff', marginBottom: 4 },
  sub: { fontSize: 13, color: 'rgba(255,255,255,0.65)' },
  content: { padding: 16, paddingBottom: 100 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  stat: { flex: 1, backgroundColor: '#fff', borderRadius: 10, padding: 12, alignItems: 'center', borderWidth: 0.5, borderColor: Colors.slate200 },
  statVal: { fontSize: 22, fontWeight: '800' },
  statLbl: { fontSize: 10, color: Colors.slate500, marginTop: 2 },
  ariaInsight: { backgroundColor: Colors.ariaSurface, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(124,58,237,0.15)' },
  ariaInsightHdr: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  ariaAv: { width: 30, height: 30, borderRadius: 8, backgroundColor: Colors.aria, alignItems: 'center', justifyContent: 'center' },
  ariaInsightTitle: { fontSize: 13, fontWeight: '700', color: Colors.ariaDark },
  ariaInsightBody: { fontSize: 12, color: Colors.slate700, lineHeight: 18 },
  attSummary: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: Colors.slate200 },
  attSumText: { fontSize: 13, color: Colors.slate600 },
  attRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: Colors.slate100 },
  attBtn: { width: 30, height: 30, borderRadius: 6, backgroundColor: Colors.slate100, alignItems: 'center', justifyContent: 'center' },
  attP: { backgroundColor: Colors.success },
  attA: { backgroundColor: Colors.danger },
  attL: { backgroundColor: Colors.warning },
  savedBanner: { backgroundColor: Colors.successSurface, borderRadius: 10, padding: 12, alignItems: 'center', marginTop: 8 },
  formLabel: { fontSize: 10, fontWeight: '700', color: Colors.slate500, letterSpacing: 0.6, marginBottom: 10 },
  formInput: { borderWidth: 1, borderColor: Colors.slate200, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, marginBottom: 10 },
  subjectChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: Colors.ariaSurface },
  chipText: { fontSize: 12, fontWeight: '600', color: Colors.aria },
  bubble: { maxWidth: '80%', padding: 12, borderRadius: 14, marginBottom: 8 },
  bMe: { backgroundColor: Colors.primary, alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  bOther: { backgroundColor: '#fff', borderWidth: 0.5, borderColor: Colors.slate200, alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  chatAv: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  inputBar: { flexDirection: 'row', gap: 8, padding: 10, paddingBottom: 24, backgroundColor: '#fff', borderTopWidth: 0.5, borderTopColor: Colors.slate200, alignItems: 'center' },
  chatSendBtn: { backgroundColor: Colors.primary, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  // Curriculum screen styles
  infoBanner: { backgroundColor: Colors.ariaSurface, borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(124,58,237,0.2)' },
  subjectChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, backgroundColor: Colors.slate100, borderWidth: 1, borderColor: Colors.slate200 },
  subjectChipActive: { backgroundColor: Colors.aria, borderColor: Colors.aria },
  subjectChipHasContent: { borderColor: Colors.success },
  subjectChipText: { fontSize: 13, fontWeight: '600', color: Colors.slate600 },
  curriculumInput: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: Colors.slate200, borderRadius: 12, padding: 14, fontSize: 14, color: Colors.slate800, height: 220, marginBottom: 8 },
  saveBtn: { backgroundColor: Colors.aria, borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 8 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
