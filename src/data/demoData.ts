export const SCHOOL = {
  id: 'school_001', name: 'Greenfield International School',
  address: 'HSR Layout, Bangalore - 560102', phone: '080-41234567',
  email: 'admin@greenfield.edu.in', upiId: 'greenfield.school@okaxis',
  totalStudents: 284, totalTeachers: 18, totalClasses: 12, established: 2005,
};

export const CLASSES = [
  { id: 'cls_8a', name: 'Class 8A', students: 32, teacher: 'Ms. Kavitha Rao' },
  { id: 'cls_8b', name: 'Class 8B', students: 30, teacher: 'Mr. Arjun Nair' },
  { id: 'cls_7a', name: 'Class 7A', students: 34, teacher: 'Ms. Priya Menon' },
  { id: 'cls_7b', name: 'Class 7B', students: 28, teacher: 'Mr. Suresh Kumar' },
  { id: 'cls_9a', name: 'Class 9A', students: 35, teacher: 'Ms. Anita Sharma' },
  { id: 'cls_9b', name: 'Class 9B', students: 31, teacher: 'Mr. Ravi Teja' },
];

export const CLASS_STUDENTS: Record<string, any[]> = {
  cls_8a: [
    { id: 'stu_001', name: 'Arjun Patel',   roll: '8A-01', attendance: 91, gpa: 'B+', xp: 1250, feeStatus: 'pending' },
    { id: 'stu_002', name: 'Priya Sharma',  roll: '8A-02', attendance: 96, gpa: 'A',  xp: 1820, feeStatus: 'paid'    },
    { id: 'stu_003', name: 'Rohan Mehta',   roll: '8A-03', attendance: 78, gpa: 'B',  xp: 890,  feeStatus: 'paid'    },
    { id: 'stu_009', name: 'Aisha Khan',    roll: '8A-04', attendance: 93, gpa: 'A-', xp: 1420, feeStatus: 'paid'    },
    { id: 'stu_010', name: 'Dev Sharma',    roll: '8A-05', attendance: 85, gpa: 'B+', xp: 1100, feeStatus: 'pending' },
    { id: 'stu_011', name: 'Meera Iyer',    roll: '8A-06', attendance: 97, gpa: 'A+', xp: 2100, feeStatus: 'paid'    },
    { id: 'stu_012', name: 'Rahul Verma',   roll: '8A-07', attendance: 72, gpa: 'C+', xp: 560,  feeStatus: 'pending' },
    { id: 'stu_013', name: 'Sia Kapoor',    roll: '8A-08', attendance: 89, gpa: 'B+', xp: 1180, feeStatus: 'paid'    },
  ],
};

export const HOMEWORK = [
  { id: 'hw_001', subject: 'Science',        title: 'Chapter 9: Force & Motion — Exercise 9.3',    dueDate: '2026-05-28', status: 'pending',   submissions: 28, total: 32, xpReward: 50 },
  { id: 'hw_002', subject: 'Mathematics',    title: 'Linear Equations — Practice Set 5.2',         dueDate: '2026-05-29', status: 'pending',   submissions: 31, total: 32, xpReward: 50 },
  { id: 'hw_003', subject: 'English',        title: 'Essay: My Favourite Season (300 words)',       dueDate: '2026-05-30', status: 'pending',   submissions: 20, total: 32, xpReward: 75 },
  { id: 'hw_004', subject: 'Social Studies', title: 'Map Work: Rivers of India',                    dueDate: '2026-05-27', status: 'submitted', submissions: 32, total: 32, xpReward: 50 },
  { id: 'hw_005', subject: 'Science',        title: 'Chapter 8: Cell Structure Diagram',           dueDate: '2026-05-25', status: 'verified',  submissions: 30, total: 32, xpReward: 50 },
];

export const SCHEDULE_TODAY = [
  { period: 1, subject: 'Science',        time: '8:00–8:45',   room: 'Lab 1',    teacher: 'Ms. Kavitha Rao',  color: '#059669', icon: '🔬' },
  { period: 2, subject: 'Mathematics',    time: '8:50–9:35',   room: 'Room 101', teacher: 'Mr. Arjun Nair',   color: '#2563EB', icon: '📐' },
  { period: 3, subject: 'English',        time: '9:40–10:25',  room: 'Room 102', teacher: 'Ms. Priya Menon',  color: '#D97706', icon: '📖' },
  { period: 4, subject: '☕ Break',       time: '10:25–10:45', room: '',         teacher: '',                  color: '#94A3B8', icon: '' },
  { period: 5, subject: 'Social Studies', time: '10:45–11:30', room: 'Room 103', teacher: 'Mr. Suresh Kumar', color: '#7C3AED', icon: '🗺️' },
  { period: 6, subject: 'Hindi',          time: '11:35–12:20', room: 'Room 104', teacher: 'Ms. Anita Sharma', color: '#DC2626', icon: '📝' },
  { period: 7, subject: 'Physical Ed.',   time: '12:25–1:00',  room: 'Ground',   teacher: 'Mr. Ravi Teja',    color: '#0891B2', icon: '⚽' },
];

export const SUBJECT_SCORES = [
  { subject: 'Science',        score: 88, max: 100, grade: 'A-', trend: 5,  color: '#059669', icon: '🔬' },
  { subject: 'Mathematics',    score: 82, max: 100, grade: 'B+', trend: 3,  color: '#2563EB', icon: '📐' },
  { subject: 'English',        score: 91, max: 100, grade: 'A',  trend: 8,  color: '#D97706', icon: '📖' },
  { subject: 'Social Studies', score: 76, max: 100, grade: 'B+', trend: -2, color: '#7C3AED', icon: '🗺️' },
  { subject: 'Hindi',          score: 69, max: 100, grade: 'B-', trend: 1,  color: '#DC2626', icon: '📝' },
];

export const ATTENDANCE_HISTORY = Array.from({ length: 30 }, (_, i) => {
  const date = new Date(Date.now() - (29 - i) * 86400000);
  const day = date.getDay();
  if (day === 0 || day === 6) return { date, status: 'holiday' as const };
  const absent = [4, 12, 20].includes(i);
  return { date, status: absent ? 'absent' as const : 'present' as const };
});

export const FEE_RECORDS = [
  { id: 'fee_001', term: 'Term 2 — 2025-26',  amount: 18500, dueDate: '2026-06-15', status: 'pending', paidOn: null        },
  { id: 'fee_002', term: 'Term 1 — 2025-26',  amount: 18500, dueDate: '2025-11-15', status: 'paid',    paidOn: '2025-11-10'},
  { id: 'fee_003', term: 'Annual Fee 2025-26', amount: 8000,  dueDate: '2025-06-01', status: 'paid',    paidOn: '2025-05-28'},
  { id: 'fee_004', term: 'Transport 2025-26',  amount: 12000, dueDate: '2025-06-01', status: 'paid',    paidOn: '2025-06-01'},
];

export const ALL_FEE_RECORDS = [
  { id: 'f1',  student: 'Arjun Patel',   class: '8A', amount: 18500, status: 'pending', phone: '9876500004', term: 'Term 2' },
  { id: 'f2',  student: 'Priya Sharma',  class: '8A', amount: 18500, status: 'paid',    phone: '9876500011', term: 'Term 2' },
  { id: 'f3',  student: 'Rohan Mehta',   class: '8A', amount: 18500, status: 'pending', phone: '9876500013', term: 'Term 2' },
  { id: 'f4',  student: 'Sneha Reddy',   class: '8B', amount: 18500, status: 'paid',    phone: '9876500015', term: 'Term 2' },
  { id: 'f5',  student: 'Vivek Kumar',   class: '8B', amount: 18500, status: 'pending', phone: '9876500017', term: 'Term 2' },
  { id: 'f6',  student: 'Ananya Singh',  class: '7A', amount: 16000, status: 'paid',    phone: '9876500019', term: 'Term 2' },
  { id: 'f7',  student: 'Karthik Nair',  class: '7A', amount: 16000, status: 'pending', phone: '9876500021', term: 'Term 2' },
  { id: 'f8',  student: 'Divya Patel',   class: '7B', amount: 16000, status: 'paid',    phone: '9876500023', term: 'Term 2' },
  { id: 'f9',  student: 'Dev Sharma',    class: '8A', amount: 18500, status: 'pending', phone: '9876500025', term: 'Term 2' },
  { id: 'f10', student: 'Meera Iyer',    class: '8A', amount: 18500, status: 'paid',    phone: '9876500026', term: 'Term 2' },
];

export const SUPPORT_TICKETS = [
  { id: 't1', from: 'Suresh Patel',  role: 'Parent',  type: 'Fee',        issue: 'Fee paid via GPay ₹18,500 on May 20 still showing pending. UPI Ref: 435678912', priority: 'high',   status: 'open',     time: '2h ago'   },
  { id: 't2', from: 'Kavitha Rao',   role: 'Teacher', type: 'Technical',  issue: 'Unable to upload homework PDF. Error for files above 2MB.',                      priority: 'medium', status: 'open',     time: '5h ago'   },
  { id: 't3', from: 'Ramesh Kumar',  role: 'Parent',  type: 'Bus',        issue: 'Route A bus was 25 minutes late on May 23. No notification sent.',               priority: 'low',    status: 'open',     time: '1d ago'   },
  { id: 't4', from: 'Priya Sharma',  role: 'Parent',  type: 'Attendance', issue: 'Child marked absent on May 22 but was present. Needs correction.',               priority: 'medium', status: 'resolved', time: '2d ago'   },
  { id: 't5', from: 'Arjun Nair',    role: 'Teacher', type: 'Account',    issue: 'Cannot access Class 8B gradebook. Permission error since yesterday.',            priority: 'high',   status: 'resolved', time: '3d ago'   },
];

export const BUS_ROUTE = {
  routeName: 'Route A — HSR Layout', vehicle: 'KA-01-AB-5678',
  driver: 'Ramu Yadav', driverPhone: '9876500006',
  stops: [
    { id: 'st1', name: 'HSR Sector 1 Gate',    time: '7:10 AM', completed: true  },
    { id: 'st2', name: 'HSR Sector 2 Park',    time: '7:18 AM', completed: true  },
    { id: 'st3', name: 'Agara Lake Bus Stop',  time: '7:28 AM', completed: true  },
    { id: 'st4', name: 'Koramangala 5th Block',time: '7:38 AM', completed: false },
    { id: 'st5', name: 'Silk Board Junction',  time: '7:48 AM', completed: false },
    { id: 'st6', name: 'School Main Gate',     time: '8:00 AM', completed: false },
  ],
};

export const LEADERBOARD = [
  { rank: 1, name: 'Meera Iyer',    class: '8A', xp: 2100, level: 8, streak: 21 },
  { rank: 2, name: 'Priya Sharma',  class: '8A', xp: 1820, level: 7, streak: 14 },
  { rank: 3, name: 'Ananya Singh',  class: '7A', xp: 1680, level: 6, streak: 12 },
  { rank: 4, name: 'Sneha Reddy',   class: '8B', xp: 1540, level: 6, streak: 10 },
  { rank: 5, name: 'Aisha Khan',    class: '8A', xp: 1420, level: 6, streak: 9  },
  { rank: 6, name: 'Divya Patel',   class: '7B', xp: 1350, level: 5, streak: 8  },
  { rank: 7, name: 'Arjun Patel',   class: '8A', xp: 1250, level: 5, streak: 7  },
  { rank: 8, name: 'Karthik Nair',  class: '7A', xp: 1100, level: 5, streak: 5  },
  { rank: 9, name: 'Dev Sharma',    class: '8A', xp: 1100, level: 4, streak: 4  },
  { rank: 10,name: 'Sia Kapoor',    class: '8A', xp: 1180, level: 5, streak: 6  },
];

export const COMPETITIONS = [
  { id: 'c1', title: 'Science Week Challenge', subject: 'Science', participants: 48, endDate: '2026-05-30', status: 'active',
    questions: [
      { q: 'What is the SI unit of force?', options: ['Newton', 'Joule', 'Watt', 'Pascal'], answer: 0, explanation: 'Force is measured in Newtons (N), named after Sir Isaac Newton.' },
      { q: 'Which organelle is the powerhouse of the cell?', options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Golgi'], answer: 2, explanation: 'Mitochondria produce ATP through cellular respiration.' },
      { q: 'Speed = Distance ÷ ?', options: ['Mass', 'Time', 'Force', 'Acceleration'], answer: 1, explanation: 'Speed = Distance ÷ Time. It measures how fast an object moves.' },
      { q: 'Photosynthesis occurs in which part?', options: ['Root', 'Stem', 'Flower', 'Leaf'], answer: 3, explanation: 'Leaves contain chlorophyll which captures sunlight for photosynthesis.' },
      { q: 'Newton\'s 3rd law states:', options: ['F=ma', 'Every action has equal reaction', 'Objects at rest stay at rest', 'Energy is conserved'], answer: 1, explanation: 'For every action, there is an equal and opposite reaction.' },
    ],
  },
  { id: 'c2', title: 'Maths Olympiad Prep', subject: 'Mathematics', participants: 32, endDate: '2026-06-05', status: 'active',
    questions: [
      { q: 'Solve: 2x + 5 = 15', options: ['x=3', 'x=4', 'x=5', 'x=6'], answer: 2, explanation: '2x = 15-5 = 10, so x = 5' },
      { q: 'LCM of 12 and 18?', options: ['6', '36', '24', '72'], answer: 1, explanation: 'LCM(12,18) = 36' },
      { q: 'Area of circle with r=7?', options: ['44', '154', '49', '22'], answer: 1, explanation: 'Area = π×r² = 22/7×49 = 154' },
      { q: '15% of 200?', options: ['25', '30', '35', '20'], answer: 1, explanation: '15/100 × 200 = 30' },
      { q: 'Next prime after 17?', options: ['18', '19', '20', '21'], answer: 1, explanation: '19 is prime. 18,20,21 are composite.' },
    ],
  },
  { id: 'c3', title: 'English Essay Contest', subject: 'English', participants: 55, endDate: '2026-05-20', status: 'completed',
    questions: [],
  },
];

export const CLASS_PERFORMANCE = [
  { class: '8A', avg: 82, trend: 3,  students: 32, rank: 1 },
  { class: '8B', avg: 79, trend: 1,  students: 30, rank: 2 },
  { class: '9A', avg: 78, trend: -2, students: 35, rank: 3 },
  { class: '7A', avg: 76, trend: 4,  students: 34, rank: 4 },
  { class: '9B', avg: 74, trend: 1,  students: 31, rank: 5 },
  { class: '7B', avg: 71, trend: -1, students: 28, rank: 6 },
];

export const WEEKLY_ATTENDANCE = [
  { day: 'Mon', present: 268, total: 284 },
  { day: 'Tue', present: 258, total: 284 },
  { day: 'Wed', present: 250, total: 284 },
  { day: 'Thu', present: 264, total: 284 },
  { day: 'Fri', present: 247, total: 284 },
];

export const NOTIFICATIONS_LIST = [
  { id: 'n1', title: 'Term 2 Exams Starting June 10', msg: 'Exam timetable has been uploaded. Please check the school portal.',     time: '2h ago',  icon: '📝', read: false, color: '#DC2626' },
  { id: 'n2', title: 'Fee Due — Term 2',               msg: 'Term 2 fee of ₹18,500 is due by June 15. Pay via UPI to avoid late fees.', time: '5h ago',  icon: '💰', read: false, color: '#D97706' },
  { id: 'n3', title: 'Sports Day — June 20',           msg: 'Annual Sports Day on June 20. All parents warmly invited!',             time: '1d ago',  icon: '🏃', read: true,  color: '#059669' },
  { id: 'n4', title: 'School Holiday — June 7',        msg: 'School will remain closed on June 7 for local civic elections.',       time: '2d ago',  icon: '🏖️', read: true,  color: '#2563EB' },
  { id: 'n5', title: 'PTM — June 5, 10 AM',           msg: 'Parent-Teacher Meeting scheduled. Please confirm attendance.',         time: '3d ago',  icon: '🤝', read: true,  color: '#7C3AED' },
];
