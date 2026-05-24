// ─── USER ROLES ───────────────────────────────────────────────────
export type UserRole = 'superadmin' | 'admin' | 'teacher' | 'parent' | 'student' | 'driver';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  schoolId?: string;
  isActive: boolean;
  fcmToken?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentUser extends User {
  role: 'student';
  classId: string;
  grade: string;
  section: string;
  rollNumber: string;
  parentId: string;
  subjects: string[];
  upcomingExams: { subject: string; date: string }[];
  pendingHomework: { subject: string; title: string; dueDate: string }[];
  xpPoints: number;
  level: number;
}

// ─── SCHOOL ───────────────────────────────────────────────────────
export interface School {
  id: string;
  name: string;
  code: string;
  logo?: string;
  address: string;
  city: string;
  state: string;
  board: 'CBSE' | 'ICSE' | 'State' | 'IB' | 'IGCSE' | 'Other';
  plan: 'trial' | 'standard' | 'premium';
  planExpiry: string;
  isActive: boolean;
  ariaEnabled: boolean;
  stats: {
    totalStudents: number;
    totalTeachers: number;
    totalClasses: number;
    presentToday: number;
    absentToday: number;
    attendancePercent: number;
    ariaActiveUsers: number;
    ariaSessionsThisWeek: number;
  };
  createdAt: string;
}

// ─── CLASS ────────────────────────────────────────────────────────
export interface Class {
  id: string;
  schoolId: string;
  name: string;
  section: string;
  grade: number;
  classTeacherId: string;
  classTeacher?: User;
  totalStudents: number;
  subjects: { name: string; teacherId: string }[];
}

// ─── STUDENT ──────────────────────────────────────────────────────
export interface Student {
  id: string;
  schoolId: string;
  classId: string;
  name: string;
  rollNumber: string;
  grade: string;
  section: string;
  avatar?: string;
  parentId: string;
  parent?: User;
  dob: string;
  gender: 'male' | 'female' | 'other';
  isActive: boolean;
  xpPoints: number;
  level: number;
}

// ─── ATTENDANCE ────────────────────────────────────────────────────
export interface AttendanceRecord {
  id: string;
  schoolId: string;
  classId: string;
  studentId: string;
  student?: Student;
  date: string;
  status: 'present' | 'absent' | 'late';
  markedBy: string;
  parentNotified: boolean;
}

// ─── HOMEWORK ─────────────────────────────────────────────────────
export interface Homework {
  id: string;
  schoolId: string;
  classId: string;
  teacherId: string;
  subject: string;
  title: string;
  description: string;
  dueDate: string;
  attachments?: string[];
  submissions: { studentId: string; submittedAt: string; status: 'submitted' | 'late' | 'missing' }[];
  totalStudents: number;
  submittedCount: number;
  createdAt: string;
}

// ─── FEE ──────────────────────────────────────────────────────────
export interface FeeRecord {
  id: string;
  schoolId: string;
  studentId: string;
  student?: Student;
  type: string;
  amount: number;
  dueDate: string;
  paidAt?: string;
  status: 'paid' | 'pending' | 'overdue';
  paymentMethod?: 'upi' | 'card' | 'cash' | 'netbanking';
  transactionId?: string;
}

// ─── NOTIFICATION ─────────────────────────────────────────────────
export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'attendance' | 'homework' | 'fee' | 'announcement' | 'aria' | 'exam';
  data?: Record<string, any>;
  read: boolean;
  createdAt: string;
}

// ─── MESSAGE ──────────────────────────────────────────────────────
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  type: 'text' | 'image' | 'file';
  readBy: string[];
  createdAt: string;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
  participantDetails: { id: string; name: string; role: UserRole; avatar?: string }[];
}

// ─── BUS ──────────────────────────────────────────────────────────
export interface BusLocation {
  busId: string;
  driverName: string;
  driverPhone: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  lastUpdated: string;
  routeName: string;
  nextStop: string;
  etaMinutes: number;
}

// ─── ARIA AI ──────────────────────────────────────────────────────
export interface AriaMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AriaSession {
  id: string;
  studentId: string;
  messages: AriaMessage[];
  topic?: string;
  subject?: string;
  durationSeconds: number;
  createdAt: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  chosen?: number;
}

export interface GoalWeek {
  week: number;
  focus: string;
  tasks: string[];
  milestone: string;
  completed: boolean;
}

export interface AriaGoal {
  id: string;
  studentId: string;
  goalText: string;
  plan: GoalWeek[];
  currentWeek: number;
  isActive: boolean;
  createdAt: string;
}

export interface WeeklyDigest {
  studentId: string;
  studentName: string;
  weekOf: string;
  summary: string;
  strength: string;
  improvement: string;
  suggestion: string;
  closing: string;
  stats: {
    sessions: number;
    quizAvg: number;
    homeworkRate: number;
    topSubject: string;
    weakSubject: string;
  };
}

// ─── API ──────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
  role: UserRole;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}
