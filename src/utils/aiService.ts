const GROQ_KEY = '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';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

async function chat(messages: Array<{ role: string; content: string }>, maxTokens = 400): Promise<string> {
  try {
    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_KEY}` },
      body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, messages }),
    });
    if (!res.ok) return 'AI is temporarily unavailable.';
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? 'No response.';
  } catch {
    return 'AI is offline. Check your connection.';
  }
}

export async function askAIDoubt(question: string): Promise<string> {
  return chat([
    { role: 'system', content: 'You are an expert tutor for school students. Answer clearly and concisely in under 150 words.' },
    { role: 'user', content: question },
  ], 300);
}

const ROLE_PROMPTS: Record<string, string> = {
  student: 'You are an AI study assistant. Help with homework, exam prep, and concepts. Be encouraging and concise.',
  parent: 'You are an EduSpark parent assistant. Help with fees, attendance, bus tracking, and child performance queries.',
  teacher: 'You are a teaching assistant. Help with lesson planning, attendance, syllabus management, and student analytics.',
  admin: 'You are a school admin assistant. Help with fee management, user creation, notifications, and school operations.',
  principal: 'You are a school leadership assistant. Provide analytics insights on performance, attendance, and teacher activity.',
  driver: 'You are a bus route assistant. Help with stop sequences, timing, and parent notifications.',
  super_admin: 'You are the EduSpark platform assistant. Help with school management and platform analytics.',
};

export async function chatbotMessage(role: string, message: string, history: Array<{ role: 'user' | 'assistant'; content: string }>): Promise<string> {
  return chat([
    { role: 'system', content: ROLE_PROMPTS[role] ?? ROLE_PROMPTS.student },
    ...history.slice(-6),
    { role: 'user', content: message },
  ], 250);
}

export async function generateCompetitionQuestions(subject: string, topic: string) {
  const res = await chat([{
    role: 'user',
    content: `Generate 5 MCQ questions for Class 8 students on ${subject} - ${topic}. Return ONLY JSON array: [{"q":"...","options":["A","B","C","D"],"answer":0}]`,
  }], 600);
  try {
    const s = res.indexOf('['); const e = res.lastIndexOf(']') + 1;
    return s >= 0 ? JSON.parse(res.slice(s, e)) : [];
  } catch { return []; }
}

export async function extractSyllabusChapters(text: string) {
  const res = await chat([{
    role: 'user',
    content: `Extract chapters from this syllabus text. Return ONLY JSON: [{"chapter":"...","topics":"...","term":1}]\nText: ${text.slice(0, 800)}`,
  }], 500);
  try {
    const s = res.indexOf('['); const e = res.lastIndexOf(']') + 1;
    return s >= 0 ? JSON.parse(res.slice(s, e)) : [];
  } catch { return []; }
}
