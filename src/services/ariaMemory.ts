import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── ARIA MEMORY SERVICE ──────────────────────────────────────────
// Stores last 10 conversation summaries per student
// Injected into system prompt so Aria remembers across sessions

export interface MemoryEntry {
  date: string;
  topics: string[];
  summary: string;
}

const MEMORY_KEY = (studentId: string) => `aria_memory_${studentId}`;
const CURRICULUM_KEY = (schoolId: string) => `curriculum_${schoolId}`;

// ─── SAVE SESSION TO MEMORY ───────────────────────────────────────
export async function saveSessionToMemory(
  studentId: string,
  messages: { role: string; content: string }[],
): Promise<void> {
  try {
    // Extract topics from conversation
    const userMessages = messages.filter(m => m.role === 'user').map(m => m.content).join(' ');
    const topics = extractTopics(userMessages);
    if (topics.length === 0) return;

    const entry: MemoryEntry = {
      date: new Date().toLocaleDateString('en-IN'),
      topics,
      summary: buildSummary(messages),
    };

    const existing = await getMemory(studentId);
    const updated = [entry, ...existing].slice(0, 10); // keep last 10 sessions
    await AsyncStorage.setItem(MEMORY_KEY(studentId), JSON.stringify(updated));
  } catch {}
}

// ─── GET MEMORY ───────────────────────────────────────────────────
export async function getMemory(studentId: string): Promise<MemoryEntry[]> {
  try {
    const data = await AsyncStorage.getItem(MEMORY_KEY(studentId));
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

// ─── BUILD MEMORY CONTEXT for system prompt ───────────────────────
export async function buildMemoryContext(studentId: string): Promise<string> {
  const memory = await getMemory(studentId);
  if (memory.length === 0) return '';

  const lines = memory.slice(0, 5).map(m =>
    `- ${m.date}: Explored ${m.topics.join(', ')}. ${m.summary}`
  );

  return `\n\nWhat you remember about this student from past sessions:\n${lines.join('\n')}\n\nUse this to personalise your responses. Reference past topics naturally when relevant.`;
}

// ─── SAVE CURRICULUM ──────────────────────────────────────────────
export async function saveCurriculum(schoolId: string, subject: string, content: string): Promise<void> {
  try {
    const existing = await getCurriculum(schoolId);
    existing[subject] = content.slice(0, 5000); // limit per subject
    await AsyncStorage.setItem(CURRICULUM_KEY(schoolId), JSON.stringify(existing));
  } catch {}
}

// ─── GET CURRICULUM ───────────────────────────────────────────────
export async function getCurriculum(schoolId: string): Promise<Record<string, string>> {
  try {
    const data = await AsyncStorage.getItem(CURRICULUM_KEY(schoolId));
    return data ? JSON.parse(data) : {};
  } catch { return {}; }
}

// ─── BUILD CURRICULUM CONTEXT ─────────────────────────────────────
export async function buildCurriculumContext(schoolId: string, subjects: string[]): Promise<string> {
  const curriculum = await getCurriculum(schoolId);
  const relevant = subjects.filter(s => curriculum[s]);
  if (relevant.length === 0) return '';

  const excerpts = relevant.map(s =>
    `${s}: ${curriculum[s].slice(0, 800)}`
  ).join('\n\n');

  return `\n\nSchool curriculum notes (use these to give school-specific answers):\n${excerpts}`;
}

// ─── HELPERS ──────────────────────────────────────────────────────
function extractTopics(text: string): string[] {
  const keywords = [
    'photosynthesis', 'quadratic', 'algebra', 'geometry', 'trigonometry',
    'friction', 'gravity', 'force', 'motion', 'electricity', 'magnetism',
    'chemical', 'atom', 'molecule', 'cell', 'ecosystem', 'evolution',
    'history', 'geography', 'civics', 'economics',
    'grammar', 'essay', 'poetry', 'literature',
    'hindi', 'french', 'sanskrit',
  ];
  const lower = text.toLowerCase();
  return keywords.filter(k => lower.includes(k)).slice(0, 4);
}

function buildSummary(messages: { role: string; content: string }[]): string {
  const last = messages[messages.length - 1];
  if (!last) return '';
  // Simple: use last assistant message first 100 chars
  const assistantMsgs = messages.filter(m => m.role === 'assistant');
  const lastAssistant = assistantMsgs[assistantMsgs.length - 1];
  if (!lastAssistant) return '';
  return lastAssistant.content.slice(0, 100) + '...';
}
