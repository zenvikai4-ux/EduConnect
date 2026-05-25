// ─── Groq AI Service ─────────────────────────────────────────────
// Uses Anthropic API as proxy since Groq keys are domain-restricted
// Switch to direct Groq once you whitelist your domain at console.groq.com

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

// ⚠️  Go to console.groq.com → API Keys → Create new key
// → Under "Restrictions" choose "None" (unrestricted)
// → Paste new key below
const GROQ_KEY = 'REPLACE_WITH_UNRESTRICTED_GROQ_KEY';
async function groqChat(
  messages: Array<{ role: string; content: string }>,
  maxTokens = 400
): Promise<string> {
  // If no key, return helpful message
  if (GROQ_KEY === 'REPLACE_WITH_UNRESTRICTED_GROQ_KEY') {
    return "🔑 Aria needs a Groq API key to work. Please add your key in groqService.ts. Get one free at console.groq.com";
  }
  try {
    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_KEY}`,
      },
      body: JSON.stringify({ model: GROQ_MODEL, max_tokens: maxTokens, messages }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error('[Groq]', res.status, err);
      if (res.status === 401) return "⚠️ Invalid API key. Please update your Groq key.";
      if (res.status === 429) return "⏳ Too many requests. Please wait a moment and try again.";
      return "AI is temporarily unavailable. Please try again.";
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? 'No response received.';
  } catch (e: any) {
    console.error('[Groq] fetch error:', e.message);
    return "📡 Unable to reach AI. Check your internet connection.";
  }
}

// ─── SYSTEM PROMPTS ───────────────────────────────────────────────
export const buildAriaSystemPrompt = (ctx: {
  studentName: string;
  grade: string;
  schoolName: string;
  subjects: string[];
  upcomingExams: { subject: string; date: string }[];
  pendingHomework: { subject: string; title: string; dueDate: string }[];
  xpPoints?: number;
  level?: number;
  streak?: number;
}) => `You are Aria ✨, an AI study companion for ${ctx.studentName}, a Grade ${ctx.grade} student at ${ctx.schoolName}.

Your personality:
- Warm, encouraging, patient — like a brilliant older sibling
- Never condescending. Always curious. Genuinely excited about learning.
- Use simple language for Grade ${ctx.grade}. Use emojis occasionally (not excessively).
- Keep responses concise — 2-4 sentences usually, more only when explaining concepts.
- Call the student by first name occasionally.

What you know about ${ctx.studentName}:
- Subjects: ${ctx.subjects.join(', ')}
- Current XP: ${ctx.xpPoints ?? 0} | Level: ${ctx.level ?? 1} | Study streak: ${ctx.streak ?? 0} days 🔥
- Upcoming exams: ${ctx.upcomingExams.length > 0 ? ctx.upcomingExams.map(e => `${e.subject} on ${e.date}`).join(', ') : 'None scheduled'}
- Pending homework: ${ctx.pendingHomework.length > 0 ? ctx.pendingHomework.map(h => `${h.subject} (${h.title}) due ${h.dueDate}`).join(', ') : 'All clear!'}

Your rules:
- NEVER give direct exam/homework answers — guide and explain instead
- If stuck, break the problem into smaller steps
- Celebrate streaks and XP milestones genuinely
- Occasionally remind about pending homework naturally
- You are Aria by EduSpark. Never mention the underlying AI model.`;

export const ROLE_SYSTEM_PROMPTS: Record<string, string> = {
  superadmin: 'You are the EduSpark platform assistant for the Zenvik AI team. Help with school management, analytics, platform decisions, and business strategy. Be concise and data-driven.',
  admin: 'You are the EduSpark school admin assistant. Help with fee management, user account creation, notifications, attendance analysis, and school operations. Be practical and efficient.',
  teacher: 'You are a teaching assistant for EduSpark. Help with lesson planning, attendance analysis, homework ideas, syllabus coverage, student performance insights, and parent communication. Be pedagogically sound.',
  parent: 'You are the EduSpark parent assistant. Help with understanding your child\'s attendance, fees, homework, exam schedule, and bus tracking. Be clear, empathetic, and reassuring.',
  driver: 'You are the EduSpark bus route assistant. Help with route timing, stop management, parent communication, and GPS tracking. Be brief and practical.',
};

// ─── QUIZ ────────────────────────────────────────────────────────
export interface QuizItem {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export async function generateQuiz(subject: string, topic: string, grade: string, count = 5): Promise<QuizItem[]> {
  const res = await groqChat([{
    role: 'user',
    content: `Create ${count} multiple choice questions for Grade ${grade} on ${subject} - "${topic}".
Return ONLY a JSON array, no other text:
[{"question":"...","options":["A","B","C","D"],"correct":0,"explanation":"brief explanation"}]
Make questions progressively harder. Use realistic school exam style.`,
  }], 800);
  try {
    const s = res.indexOf('['); const e = res.lastIndexOf(']') + 1;
    if (s < 0 || e <= s) return [];
    return JSON.parse(res.slice(s, e));
  } catch { return []; }
}

// ─── GOAL PLAN ────────────────────────────────────────────────────
export interface GoalWeek { week: number; focus: string; tasks: string[]; milestone: string }

export async function generateGoalPlan(subject: string, examDate: string, studentName: string): Promise<GoalWeek[]> {
  const daysLeft = Math.max(1, Math.round((new Date(examDate).getTime() - Date.now()) / 86400000));
  const weeks = Math.min(4, Math.ceil(daysLeft / 7));
  const res = await groqChat([{
    role: 'user',
    content: `Create a ${weeks}-week study plan for ${studentName} to prepare for their ${subject} exam on ${examDate} (${daysLeft} days away).
Return ONLY JSON array:
[{"week":1,"focus":"...","tasks":["task1","task2","task3"],"milestone":"..."}]
Make it achievable for a school student. Max 3 tasks per week.`,
  }], 600);
  try {
    const s = res.indexOf('['); const e = res.lastIndexOf(']') + 1;
    if (s < 0 || e <= s) return [];
    return JSON.parse(res.slice(s, e));
  } catch { return []; }
}

// ─── CHAT ─────────────────────────────────────────────────────────
export async function ariaChat(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  systemPrompt: string
): Promise<string> {
  return groqChat([
    { role: 'system', content: systemPrompt },
    ...messages.slice(-10),
  ], 350);
}

export async function roleChat(
  role: string,
  message: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<string> {
  const system = ROLE_SYSTEM_PROMPTS[role] ?? ROLE_SYSTEM_PROMPTS.admin;
  return groqChat([
    { role: 'system', content: system },
    ...history.slice(-6),
    { role: 'user', content: message },
  ], 250);
}

// Weekly summary for principal WhatsApp
export async function generateWeeklySummary(data: {
  schoolName: string;
  attendanceRate: number;
  attendanceTrend: number;
  totalStudents: number;
  lowestClass: string;
  lowestAttendance: number;
  topHomeworkMissed: string;
  feesCollected: number;
}): Promise<string> {
  const res = await groqChat([{
    role: 'user',
    content: `Write a brief, professional WhatsApp weekly summary for ${data.schoolName} school management.
Data: Attendance ${data.attendanceRate}% (${data.attendanceTrend > 0 ? '+' : ''}${data.attendanceTrend}% from last week), 
Lowest class: ${data.lowestClass} at ${data.lowestAttendance}%, 
Most missed homework: ${data.topHomeworkMissed}, 
Fees collected: ₹${data.feesCollected.toLocaleString()}.
Keep it under 100 words. Use bullet points. Add relevant emojis. Start with school name and week.`,
  }], 200);
  return res;
}

// Compatibility exports
export async function generateParentDigest(studentName: string, data: any): Promise<string> {
  return groqChat([{
    role: 'user',
    content: `Write a brief parent update for ${studentName}: Attendance ${data.attendanceRate ?? 0}%, ${data.pendingHomework ?? 0} pending homework, ${data.daysToExam ?? 0} days to next exam. Keep it under 80 words, warm tone, use emojis.`
  }], 150);
}

export async function generateTeacherInsight(classData: any): Promise<string> {
  return groqChat([{
    role: 'user',
    content: `Generate a brief teaching insight for a class with ${classData.students ?? 30} students, ${classData.attendanceRate ?? 85}% attendance, and ${classData.pendingSubmissions ?? 5} pending homework submissions. What should the teacher focus on? Under 60 words.`
  }], 120);
}
