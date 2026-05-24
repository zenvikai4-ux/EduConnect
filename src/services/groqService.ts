// ─── Groq AI Service ─────────────────────────────────────────────
// All Aria AI calls go through here. Swap the URL to your backend
// /api/companion/* once you have the server running.

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama3-70b-8192';

// Key is configured here — in production move to backend proxy
// Get your free key at console.groq.com
const GROQ_KEY = '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';

// ─── SYSTEM PROMPTS ───────────────────────────────────────────────

export const buildAriaSystemPrompt = (ctx: {
  studentName: string;
  grade: string;
  schoolName: string;
  subjects: string[];
  upcomingExams: { subject: string; date: string }[];
  pendingHomework: { subject: string; title: string; dueDate: string }[];
}) => `You are Aria, an AI study companion for ${ctx.studentName}, a Grade ${ctx.grade} student at ${ctx.schoolName}.

Your personality:
- Warm, encouraging, patient — like a brilliant older sibling
- Never condescending. Always curious. Genuinely excited about learning.
- Use simple language for Grade ${ctx.grade}. Use emojis occasionally.
- Keep responses concise — 2-4 sentences usually, more only when needed.

What you know about ${ctx.studentName}:
- Subjects: ${ctx.subjects.join(', ')}
- Upcoming exams: ${ctx.upcomingExams.map(e => `${e.subject} on ${e.date}`).join(', ')}
- Pending homework: ${ctx.pendingHomework.map(h => `${h.subject} (${h.title}) due ${h.dueDate}`).join(', ')}

Your rules — non-negotiable:
- NEVER discuss anything unrelated to learning or personal development
- NEVER give direct exam/homework answers — guide and explain instead
- If the student seems frustrated, acknowledge feelings first before helping
- Celebrate small wins genuinely
- Occasionally remind about pending homework naturally
- You are Aria by EduConnect. Never mention the underlying AI model.`;

const PARENT_DIGEST_PROMPT = (data: {
  studentName: string; grade: string;
  sessions: number; topics: string[]; quizAvg: number;
  hwRate: number; topSubject: string; weakSubject: string;
  attendance: string;
}) => `Write a weekly learning digest for the parent of ${data.studentName}, Grade ${data.grade}.

Week data:
- Aria sessions: ${data.sessions}
- Topics explored: ${data.topics.join(', ')}
- Quiz average: ${data.quizAvg}/10
- Homework completion: ${data.hwRate}%
- Attendance: ${data.attendance}
- Strongest subject this week: ${data.topSubject}
- Subject that needs attention: ${data.weakSubject}

Write 4 flowing paragraphs (no bullets):
1. Warm opening summary of the week (2 sentences)
2. One specific strength with a concrete example
3. One area needing attention — framed constructively, never alarming
4. One actionable suggestion for the weekend + encouraging close

Tone: Like a caring teacher writing to a parent. Under 200 words.`;

const TEACHER_INSIGHT_PROMPT = (data: {
  className: string; schoolName: string;
  totalSessions: number; topTopics: string[];
  confusionTopics: string[]; inactiveCount: number; totalStudents: number;
}) => `Generate a brief teaching insight for the teacher of ${data.className} at ${data.schoolName}.

This week's Aria data:
- Total sessions: ${data.totalSessions}
- Most explored topics: ${data.topTopics.join(', ')}
- Topics with most confusion signals: ${data.confusionTopics.join(', ')}
- Students who didn't engage: ${data.inactiveCount} of ${data.totalStudents}

Write 2-3 direct, actionable sentences. Start with "This week,". Teachers are busy.`;

// ─── CORE CALLER ──────────────────────────────────────────────────

interface GroqMessage { role: 'system' | 'user' | 'assistant'; content: string; }

export async function callGroq(messages: GroqMessage[], maxTokens = 400, temperature = 0.75): Promise<string | null> {
  if (!GROQ_KEY) return null;
  try {
    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${GROQ_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: GROQ_MODEL, messages, temperature, max_tokens: maxTokens }),
    });
    if (!res.ok) return null;
    const data = await res.json() as any;
    return data.choices?.[0]?.message?.content ?? null;
  } catch { return null; }
}

export async function callGroqJSON<T>(messages: GroqMessage[], maxTokens = 800): Promise<T | null> {
  const text = await callGroq(messages, maxTokens, 0.4);
  if (!text) return null;
  try {
    const match = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    return match ? JSON.parse(match[0]) as T : null;
  } catch { return null; }
}

// ─── ARIA CHAT ────────────────────────────────────────────────────

export async function ariaChat(
  systemPrompt: string,
  history: { role: 'user' | 'assistant'; content: string }[],
  newMessage: string,
  extraContext?: string,
): Promise<string> {
  const fullPrompt = extraContext ? systemPrompt + extraContext : systemPrompt;
  const messages: GroqMessage[] = [
    { role: 'system', content: fullPrompt },
    ...history.slice(-10).map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: newMessage },
  ];
  const reply = await callGroq(messages, 400, 0.75);
  if (reply) return reply;

  // Fallback responses keyed by topic
  const lower = newMessage.toLowerCase();
  if (lower.includes('photosynthesis')) return 'Photosynthesis is how plants make food using sunlight, water and CO₂! 🌿 The chlorophyll in leaves captures sunlight energy. The equation is: 6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂. Want me to break down any part?';
  if (lower.includes('quadratic')) return 'Quadratic equations are in the form ax² + bx + c = 0. 📐 The easiest method is factoring — you split the middle term. Try x² + 5x + 6 = 0 with me!';
  if (lower.includes('exam')) return 'Your upcoming exams: Science Apr 14, Math Apr 15, English Apr 16. 📝 Focus on Chapter 9 for Science — that is also your pending homework. Want a quick quiz?';
  return 'That is a great question! Tell me a bit more about what you are finding tricky and I will help you work through it. 😊';
}

// ─── QUIZ GENERATOR ───────────────────────────────────────────────

export interface QuizItem {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export async function generateQuiz(topic: string, grade: string, count = 3): Promise<QuizItem[]> {
  const prompt = `Generate ${count} multiple-choice questions for Grade ${grade} CBSE on the topic: "${topic}".
Return ONLY valid JSON array:
[{"question":"...","options":["A","B","C","D"],"correct":0,"explanation":"..."}]
No extra text. Just the JSON array.`;

  const result = await callGroqJSON<QuizItem[]>([{ role: 'user', content: prompt }]);
  if (result && Array.isArray(result) && result.length > 0) return result;

  // Fallback
  return [
    {
      question: `Which process do plants use to make their own food?`,
      options: ['Respiration', 'Photosynthesis', 'Digestion', 'Excretion'],
      correct: 1,
      explanation: 'Photosynthesis is the process by which plants use sunlight, water, and CO₂ to produce glucose and oxygen.',
    },
    {
      question: 'What is the green pigment in leaves called?',
      options: ['Carotene', 'Xanthophyll', 'Chlorophyll', 'Anthocyanin'],
      correct: 2,
      explanation: 'Chlorophyll is the green pigment in plant cells that absorbs sunlight energy for photosynthesis.',
    },
    {
      question: 'Which gas is released as a by-product of photosynthesis?',
      options: ['Carbon dioxide', 'Nitrogen', 'Hydrogen', 'Oxygen'],
      correct: 3,
      explanation: 'Oxygen (O₂) is released as a by-product when plants split water molecules during the light reactions.',
    },
  ];
}

// ─── GOAL PLAN ────────────────────────────────────────────────────

export interface GoalWeek {
  week: number;
  focus: string;
  tasks: string[];
  milestone: string;
  completed: boolean;
}

export async function generateGoalPlan(goalText: string, grade: string, subjects: string[]): Promise<GoalWeek[]> {
  const prompt = `Create a 4-week study plan for a Grade ${grade} student who wants to: "${goalText}".
Their subjects: ${subjects.join(', ')}.
Return ONLY valid JSON array:
[{"week":1,"focus":"...","tasks":["...","...","..."],"milestone":"...","completed":false},...]
No extra text. Just the JSON array.`;

  const result = await callGroqJSON<GoalWeek[]>([{ role: 'user', content: prompt }]);
  if (result && Array.isArray(result)) return result;

  return [
    { week: 1, focus: 'Foundation & Assessment', tasks: ['Review all notes from this term', 'Complete 2 practice tests', 'List topics you find most difficult'], milestone: 'Know your weak areas clearly', completed: false },
    { week: 2, focus: 'Deep Practice', tasks: ['Solve 10 past exam questions daily', 'Ask Aria to explain weak topics', 'Revise one full subject per day'], milestone: 'Finish 2 full practice papers', completed: false },
    { week: 3, focus: 'Speed & Confidence', tasks: ['Timed practice — 1 hour per subject', 'Quiz mode with Aria every evening', 'Review all incorrect answers carefully'], milestone: 'Score 85%+ in practice tests', completed: false },
    { week: 4, focus: 'Final Revision', tasks: ['Light revision — no new topics', 'Focus on formulae and key terms', 'Rest well and eat well before exams'], milestone: 'Feel confident and ready', completed: false },
  ];
}

// ─── PARENT DIGEST ────────────────────────────────────────────────

export async function generateParentDigest(data: Parameters<typeof PARENT_DIGEST_PROMPT>[0]): Promise<string> {
  const prompt = PARENT_DIGEST_PROMPT(data);
  const result = await callGroq([{ role: 'user', content: prompt }], 400);
  if (result) return result;

  return `It was a productive week for ${data.studentName}! With ${data.sessions} Aria sessions and a ${data.hwRate}% homework completion rate, the effort is clearly showing.\n\n${data.topSubject} is ${data.studentName}'s strongest area this week — the quiz scores and depth of questions asked both reflect genuine understanding.\n\n${data.weakSubject} needs a bit more attention before the upcoming exams. This is not alarming — just a signal to focus there this weekend.\n\nTry asking ${data.studentName} to explain one concept to you out loud — teaching is the best form of revision. Heading into exam week in good shape! 🌟`;
}

// ─── TEACHER INSIGHTS ─────────────────────────────────────────────

export async function generateTeacherInsight(data: Parameters<typeof TEACHER_INSIGHT_PROMPT>[0]): Promise<string> {
  const prompt = TEACHER_INSIGHT_PROMPT(data);
  const result = await callGroq([{ role: 'user', content: prompt }], 200);
  if (result) return result;
  return `This week, ${data.confusionTopics[0] || data.topTopics[0]} generated the most repeated questions from students, suggesting a conceptual gap worth addressing in class. ${data.inactiveCount} students have not used Aria at all — a personal nudge could help. Consider a 10-minute focused review next class on the most-confused topic.`;
}
