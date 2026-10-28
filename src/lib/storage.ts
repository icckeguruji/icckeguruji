import {
  Course,
  Lesson,
  PdfNote,
  PaymentRequest,
  CoachingConfig,
  User,
  Announcement,
  Article,
  Testimonial,
  FaqItem,
  Quiz,
  TimetableSlot,
  Flashcard,
  DppAssignment,
  DppSubmission,
  PyqPaper,
  CommunityPost,
  CertificateRecord,
  AttendanceRecord,
  FeeRecord,
  WeeklyTest,
  Teacher,
  TeacherAttendanceRecord,
  NotificationItem,
} from '@/types';

export const DEFAULT_CONFIG: CoachingConfig = {
  coachingName: "ICC KE GURUJI",
  tagline: "Class 9th to 12th & Board Exam Special Coaching",
  logoUrl: "",
  faviconUrl: "",
  address: "Station Road, Main Market, Ward No. 4",
  establishedYear: "2020",
  upiId: "icckeguruji@okaxis",
  merchantName: "ICC KE GURUJI",
  whatsappNumber: "+919876543210",
  alternatePhone: "+91 9934215013",
  contactEmail: "contact@icckeguruji.com",
  telegramGroupLink: "https://t.me/icckeguruji_official",
  telegramBotUsername: "IccKeGurujiBot",
  youtubeChannelUrl: "https://youtube.com/@icckeguruji",
  instagramUrl: "https://instagram.com/icckeguruji",
  facebookUrl: "https://facebook.com/icckeguruji",
  instituteStampUrl: "",
  googleAppsScriptEmailUrl: "https://script.google.com/macros/s/AKfycbzGhBvMJerQBuiuyibRoQh4RRQXZhxuyIryMWLC4vjnb43loVXvhJXxb1pKEYzHwSrA/exec",
  heroHeadline: "Welcome to ICC KE GURUJI Coaching Institute",
  heroSubheadline: "Complete preparation for Classes 9th, 10th, 11th & 12th Board Exams. Daily live classes, handwritten notes, daily attendance, and weekly Sunday tests.",
  admissionBadgeText: "Admissions Open for Academic Session 2026 • Limited Seats Available",
  marqueeNotice: "🔴 Notice: Upcoming Sunday Weekly Offline Test will begin at 8:00 AM sharp. All students must arrive on time.",
  stat1Value: "250+",
  stat1Label: "Active Students",
  stat2Value: "98.4%",
  stat2Label: "Top Board Score",
  stat3Value: "Every Sunday",
  stat3Label: "Weekly Tests",
  stat4Value: "Cash / UPI",
  stat4Label: "Easy Fee Options",
  homeQuizQuestion: "If the distance between two static charges is reduced to half (r/2), what will happen to the electrostatic force between them?",
  homeQuizOptions: ["Doubled (2x)", "Quadrupled (4x)", "Halved (1/2)", "One-Fourth (1/4)"],
  homeQuizCorrectIndex: 1,
  homeQuizExplanation: "Correct Answer: B (Quadrupled)! According to Coulomb's Law, F ∝ 1/r². When distance is halved, the force increases by 4 times.",
};

export const INITIAL_COURSES: Course[] = [
  {
    id: "course-1",
    title: "Class 12 & NEET/JEE: Physics Complete Mastery 2026",
    subtitle: "Complete NCERT + Advanced Concepts, Daily Live Classes & Formula Notes",
    description: "Specially designed for students aiming for 95%+ in Class 12 Board & Competitive exams. Covers Mechanics, Electrodynamics, Optics, and Modern Physics with deep conceptual clarity.",
    category: "Competitive Exams",
    price: 999,
    originalPrice: 3499,
    thumbnail: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&w=800&q=80",
    instructorName: "Er. Alok Sharma (IIT Kanpur)",
    instructorRole: "Senior Physics Faculty (12+ Yrs Exp)",
    language: "English / Bilingual",
    duration: "6 Months • 120+ Hours",
    features: [
      "Daily Interactive Live Classroom Sessions",
      "Chapter-wise Colored Handwritten PDF Notes",
      "24/7 AI Guruji Doubt Solver Support",
      "Chapter-wise Mock Tests & Formula Flashcards",
      "Exclusive Enrolled Students Telegram Group Access"
    ],
    lessonsCount: 42,
    notesCount: 28,
    isPopular: true
  },
  {
    id: "course-2",
    title: "Class 10 Board Exam Super 100 Batch",
    subtitle: "Science, Maths & Social Science Complete Crash Course + Sample Papers",
    description: "The ultimate score booster batch for Class 10th Boards. Includes all essential formulas, theorems, and live step-by-step solutions of the last 10 years board question papers.",
    category: "Board Exams",
    price: 499,
    originalPrice: 1999,
    thumbnail: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80",
    instructorName: "Neha Verma & Team",
    instructorRole: "Board Exam Specialist Mentors",
    language: "English / Bilingual",
    duration: "3 Months • 75+ Hours",
    features: [
      "Targeted Board Questions & Live Solutions",
      "Quick Revision Mind Maps & PDF Notes",
      "Formula Cheat Sheets & Mock Tests",
      "Instant WhatsApp Doubt Support",
      "Weekly Model Answer Key Evaluation"
    ],
    lessonsCount: 30,
    notesCount: 22,
    isPopular: false
  },
  {
    id: "course-3",
    title: "Class 11 & 12: Chemistry & Science Foundation 2026",
    subtitle: "Organic, Inorganic & Physical Chemistry Complete NCERT + Board PYQ",
    description: "Master Chemical Reactions, Periodic Table trends, and numerical problems with exclusive handwritten golden notes and live interactive problem-solving.",
    category: "Board Exams",
    price: 799,
    originalPrice: 2499,
    thumbnail: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80",
    instructorName: "Alok Sharma (Guruji)",
    instructorRole: "Senior Science Faculty",
    language: "English / Bilingual",
    duration: "6 Months • 100+ Hours",
    features: [
      "Daily Live & YouTube Classroom Sessions",
      "Chapter-wise Handwritten PDF Notes",
      "Chemical Reaction Shortcut Charts",
      "Weekly Sunday Test & Marksheet",
      "Instant WhatsApp Doubt Support"
    ],
    lessonsCount: 36,
    notesCount: 25,
    isPopular: true
  }
];

export const INITIAL_LESSONS: Lesson[] = [
  {
    id: "les-1",
    courseId: "course-1",
    title: "🔴 LIVE CLASS: Electrostatics - Electric Charges & Coulomb's Law",
    description: "In today's live lecture, we will cover Coulomb's Law in Vector form, Principle of Superposition, and previous year board questions.",
    youtubeId: "jfKfPfyJRdk",
    isLive: true,
    scheduledAt: "Today at 7:00 PM",
    duration: "1 hr 30 min",
    chapterNumber: 1
  },
  {
    id: "les-2",
    courseId: "course-1",
    title: "Lecture 02: Electric Field & Electric Dipole Derivations",
    description: "Step-by-step derivation of electric field intensity on Axial and Equatorial lines for board and competitive exams.",
    youtubeId: "dQw4w9WgXcQ",
    isLive: false,
    duration: "1 hr 15 min",
    chapterNumber: 1
  },
  {
    id: "les-3",
    courseId: "course-1",
    title: "Lecture 03: Gauss's Law Applications & Numerical Shortcuts",
    description: "Top 5 most important board derivations of Gauss's Law along with competitive exam numerical shortcuts.",
    youtubeId: "M7lc1UVf-VE",
    isLive: false,
    duration: "1 hr 20 min",
    chapterNumber: 2
  },
  {
    id: "les-4",
    courseId: "course-2",
    title: "🔴 LIVE: Class 10 Science - Chemical Reactions & Equations Fast Revision",
    description: "Balancing chemical equations, types of chemical reactions, and high-probability board exam questions.",
    youtubeId: "jfKfPfyJRdk",
    isLive: true,
    scheduledAt: "Today at 5:00 PM",
    duration: "1 hr",
    chapterNumber: 1
  },
  {
    id: "les-5",
    courseId: "course-3",
    title: "🔴 LIVE: Chemistry - Organic Reaction Mechanisms & Conversions",
    description: "Fundamental organic mechanisms, nomenclature rules, and high-frequency board reaction conversions.",
    youtubeId: "jfKfPfyJRdk",
    isLive: true,
    scheduledAt: "Tomorrow at 11:00 AM",
    duration: "2 hr",
    chapterNumber: 1
  }
];

export const INITIAL_NOTES: PdfNote[] = [
  {
    id: "note-1",
    courseId: "course-1",
    title: "Electrostatics & Coulomb's Law - Handwritten Golden Notes",
    description: "Detailed handwritten formula sheet, derivations with colored diagrams, and solved numerical examples.",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    fileSize: "4.8 MB",
    pageCount: 24,
    uploadedAt: "Yesterday"
  },
  {
    id: "note-2",
    courseId: "course-1",
    title: "Gauss Law & Electric Potential - Top 50 PYQs with Solutions",
    description: "Solved board questions from the last 10 years with official step marking guide.",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    fileSize: "6.2 MB",
    pageCount: 38,
    uploadedAt: "3 days ago"
  },
  {
    id: "note-3",
    courseId: "course-2",
    title: "Science All Chemical Equations & Balancing Cheat Sheet",
    description: "1-page quick formula revision sheet for morning board exam review.",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    fileSize: "2.1 MB",
    pageCount: 12,
    uploadedAt: "Oct 20, 2026"
  },
  {
    id: "note-4",
    courseId: "course-3",
    title: "Organic Chemistry Reactions & Reagents Quick Blueprint",
    description: "Key reaction pathways, reagent reference tables, and common organic synthesis roadmap.",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    fileSize: "3.5 MB",
    pageCount: 18,
    uploadedAt: "Oct 22, 2026"
  }
];

export const GUEST_USER: User = {
  id: '',
  name: '',
  phone: '',
  email: '',
  role: 'student',
  enrolledCourseIds: [],
  joinedDate: '',
};

export const INITIAL_USER: User = {
  id: "student-101",
  name: "Rahul Kumar",
  phone: "+91 98765 43210",
  email: "rahul.student@gmail.com",
  password: "student123",
  role: "student",
  enrolledCourseIds: ["course-1"],
  joinedDate: "15 Oct 2026",
  streakDays: 7
};

export const ADMIN_USER: User = {
  id: "admin-guruji",
  name: "Guruji (Alok Sharma)",
  phone: "+91 98765 43210",
  email: "admin@icckeguruji.com",
  password: "admin123",
  role: "admin",
  enrolledCourseIds: ["course-1", "course-2", "course-3"],
  joinedDate: "Founder",
};

export const INITIAL_STUDENTS: User[] = [
  {
    id: "student-101",
    rollNo: "ICC-101",
    name: "Rahul Kumar",
    fatherName: "Shri Ramesh Kumar",
    phone: "+91 98765 43210",
    email: "rahul.student@gmail.com",
    password: "student123",
    role: "student",
    enrolledCourseIds: ["course-1"],
    joinedDate: "15 Oct 2026",
    streakDays: 7,
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80",
    address: "House 14, Station Road, Ward No. 4, Bihar",
    classGrade: "Class 12 - PCM (Target JEE 2027)",
    monthlyFee: 1000,
    feesDue: 0
  },
  {
    id: "student-102",
    rollNo: "ICC-102",
    name: "Priya Sharma",
    fatherName: "Shri Rajesh Sharma",
    phone: "+91 98111 22334",
    email: "priya.sharma99@gmail.com",
    password: "student123",
    role: "student",
    enrolledCourseIds: ["course-2"],
    joinedDate: "18 Oct 2026",
    streakDays: 4,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80",
    address: "Flat 202, Gandhi Chowk, Near Central Post Office, Patna",
    classGrade: "Class 10 Board Special Batch",
    monthlyFee: 800,
    feesDue: 800
  },
  {
    id: "student-103",
    rollNo: "ICC-103",
    name: "Aman Gupta",
    fatherName: "Shri Suresh Gupta",
    phone: "+91 99222 33445",
    email: "amangupta.dev@gmail.com",
    password: "student123",
    role: "student",
    enrolledCourseIds: ["course-3"],
    joinedDate: "20 Oct 2026",
    streakDays: 9,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    address: "B-12, Main Bazar, Near City Hospital",
    classGrade: "Full-Stack Web Dev & Coding Masterclass",
    monthlyFee: 1200,
    feesDue: 600
  },
  {
    id: "student-104",
    rollNo: "ICC-104",
    name: "Vikas Yadav",
    fatherName: "Shri Ramakant Yadav",
    phone: "+91 98333 44556",
    email: "vikas.yadav@gmail.com",
    password: "student123",
    role: "student",
    enrolledCourseIds: ["course-1", "course-2"],
    joinedDate: "22 Oct 2026",
    streakDays: 3,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
    address: "Lane 3, Shivaji Nagar, New Colony",
    classGrade: "Class 12 - Physics + Math Foundation",
    monthlyFee: 1000,
    feesDue: 500
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: '⏱️ New Timed Mock Quiz Available',
    message: "Electrostatics & Coulomb's Law test is live with a 15-minute countdown. Test your speed now!",
    timestamp: '15 Mins ago',
    category: 'quiz',
    targetRole: 'student',
    link: '/#daily-practice',
    isRead: false
  },
  {
    id: 'notif-2',
    title: '✅ Attendance Marked: Present',
    message: "Your daily batch attendance was verified for today's session by Er. Alok Sharma.",
    timestamp: '2 Hours ago',
    category: 'attendance',
    targetRole: 'student',
    isRead: false
  },
  {
    id: 'notif-3',
    title: '📑 DPP-03 Solutions Uploaded',
    message: 'Kinematics and vectors derivation PDF notes are available in your classroom resources.',
    timestamp: '5 Hours ago',
    category: 'batch',
    targetRole: 'student',
    link: '/course/course-1',
    isRead: false
  },
  {
    id: 'notif-4',
    title: "📅 Today's Live Physics Shift",
    message: 'Physics Mechanics lecture scheduled at 10:30 AM in Classroom A. 42 students enrolled.',
    timestamp: '1 Hour ago',
    category: 'batch',
    targetRole: 'teacher',
    link: '/teacher',
    isRead: false
  },
  {
    id: 'notif-5',
    title: '✅ Faculty Check-in Logged',
    message: 'Your biometric check-in at 09:45 AM was logged successfully in the Staff Register.',
    timestamp: '3 Hours ago',
    category: 'attendance',
    targetRole: 'teacher',
    link: '/teacher',
    isRead: false
  },
  {
    id: 'notif-6',
    title: '🎉 New Student Registered',
    message: 'Vikas Yadav enrolled in Physics Mastery Batch. Verified and fee slip generated.',
    timestamp: '30 Mins ago',
    category: 'system',
    targetRole: 'admin',
    link: '/admin',
    isRead: false
  },
  {
    id: 'notif-7',
    title: '💳 UPI Fee Receipt Pending',
    message: 'Payment received via UPI (UTR: 428938472910) for ₹999. Awaiting approval.',
    timestamp: '1 Hour ago',
    category: 'fee',
    targetRole: 'admin',
    link: '/admin',
    isRead: false
  },
  {
    id: 'notif-8',
    title: '📢 Sunday Grand Offline Mock Test',
    message: 'Class 10 & 12 Mega Test will begin at 8:00 AM this Sunday. Carry your admit slip.',
    timestamp: 'Yesterday',
    category: 'quiz',
    targetRole: 'all',
    isRead: false
  }
];

export const INITIAL_PAYMENTS: PaymentRequest[] = [
  {
    id: "pay-101",
    userId: "student-101",
    userName: "Rahul Kumar",
    userPhone: "+91 98765 43210",
    userEmail: "rahul.student@gmail.com",
    courseId: "course-1",
    courseTitle: "Class 12 & NEET/JEE: Physics Complete Mastery 2026",
    amount: 999,
    utrNumber: "428938472910",
    upiIdUsed: "icckeguruji@okaxis",
    status: "approved",
    createdAt: "2026-10-24 18:30"
  },
  {
    id: "pay-102",
    userId: "student-102",
    userName: "Priya Sharma",
    userPhone: "+91 98111 22334",
    userEmail: "priya.sharma99@gmail.com",
    courseId: "course-2",
    courseTitle: "Class 10 Board Exam Super 100 Batch",
    amount: 499,
    utrNumber: "429019284719",
    upiIdUsed: "icckeguruji@okaxis",
    status: "pending",
    createdAt: "2026-10-25 09:15"
  },
  {
    id: "pay-103",
    userId: "student-103",
    userName: "Aman Gupta",
    userPhone: "+91 99222 33445",
    userEmail: "amangupta.dev@gmail.com",
    courseId: "course-3",
    courseTitle: "Full-Stack Web Development: Zero to Hero",
    amount: 1499,
    utrNumber: "429048172951",
    upiIdUsed: "icckeguruji@okaxis",
    status: "pending",
    createdAt: "2026-10-25 09:40"
  }
];

// =========================================================================
// QUIZZES & MOCK TESTS DATA
// =========================================================================

export const INITIAL_QUIZZES: Quiz[] = [
  {
    id: "quiz-1",
    courseId: "course-1",
    title: "Electrostatics & Coulomb's Law Chapter Mock Test",
    chapter: "Chapter 1: Electrostatics",
    durationMinutes: 10,
    totalMarks: 20,
    questions: [
      {
        id: "q-1",
        question: "If the distance between two charges is halved (r/2), what will be the new electrostatic force between them?",
        options: ["2 times", "4 times", "Half (1/2)", "1/4th"],
        correctIndex: 1,
        explanation: "According to Coulomb's Law, F ∝ 1/r². When distance becomes r/2, F' = 1/(r/2)² = 4F (4 times increase)."
      },
      {
        id: "q-2",
        question: "What is the SI unit of electric flux?",
        options: ["N / C", "Volt × meter (V·m)", "Coulomb / meter", "Joule / Coulomb"],
        correctIndex: 1,
        explanation: "Electric flux Φ = E·A. Since E is in V/m and A is in m², the unit is Volt × meter (V·m) or N·m²/C."
      },
      {
        id: "q-3",
        question: "What is the electric field intensity inside a uniformly charged spherical shell?",
        options: ["Zero", "Infinity", "Equal to surface field", "Proportional to distance"],
        correctIndex: 0,
        explanation: "According to Gauss's law, no charge is enclosed inside the shell (q_enclosed = 0), therefore E_inside = 0."
      },
      {
        id: "q-4",
        question: "What is the direction of an electric dipole moment?",
        options: ["Positive to negative charge", "Negative to positive charge", "Perpendicular to axis", "Random"],
        correctIndex: 1,
        explanation: "By standard physics convention, the electric dipole moment vector p points from negative charge (-q) to positive charge (+q)."
      }
    ]
  },
  {
    id: "quiz-2",
    courseId: "course-2",
    title: "Class 10 Science: Chemical Reactions & Equations Test",
    chapter: "Chapter 1: Chemical Reactions",
    durationMinutes: 8,
    totalMarks: 15,
    questions: [
      {
        id: "q-201",
        question: "Fe2O3 + 2Al -> Al2O3 + 2Fe - What type of chemical reaction is this?",
        options: ["Combination reaction", "Double displacement reaction", "Displacement reaction", "Decomposition reaction"],
        correctIndex: 2,
        explanation: "Aluminium is more reactive than iron (Fe), so it displaces iron from its oxide. Hence, it is a displacement reaction."
      },
      {
        id: "q-202",
        question: "What type of reaction is respiration considered?",
        options: ["Endothermic", "Exothermic", "Decomposition", "Neutralization"],
        correctIndex: 1,
        explanation: "During respiration, glucose reacts with oxygen to produce carbon dioxide, water, and releases energy in the form of heat, making it an exothermic reaction."
      }
    ]
  }
];

// =========================================================================
// WEEKLY TIMETABLE DATA
// =========================================================================

export const INITIAL_TIMETABLE: TimetableSlot[] = [
  {
    id: "tt-1",
    day: "Monday",
    time: "07:00 PM - 08:30 PM",
    subject: "Class 12 Physics",
    topic: "Electrostatics & Numerical Shortcuts",
    faculty: "Er. Alok Sharma",
    isLiveNow: true,
    courseId: "course-1"
  },
  {
    id: "tt-2",
    day: "Tuesday",
    time: "05:00 PM - 06:15 PM",
    subject: "Class 10 Science",
    topic: "Chemical Reactions & Balancing Mastery",
    faculty: "Neha Verma",
    isLiveNow: false,
    courseId: "course-2"
  },
  {
    id: "tt-3",
    day: "Wednesday",
    time: "07:00 PM - 08:30 PM",
    subject: "Class 12 Physics",
    topic: "Gauss's Law Top 5 Board Derivations",
    faculty: "Er. Alok Sharma",
    isLiveNow: false,
    courseId: "course-1"
  },
  {
    id: "tt-4",
    day: "Thursday",
    time: "11:00 AM - 01:00 PM",
    subject: "Chemistry Special",
    topic: "Organic Reaction Mechanisms & Shortcuts",
    faculty: "Er. Alok Sharma",
    isLiveNow: false,
    courseId: "course-3"
  },
  {
    id: "tt-5",
    day: "Friday",
    time: "07:00 PM - 08:30 PM",
    subject: "Class 12 Physics",
    topic: "Live Doubt Solving & PYQ Discussion",
    faculty: "Er. Alok Sharma",
    isLiveNow: false,
    courseId: "course-1"
  },
  {
    id: "tt-6",
    day: "Saturday",
    time: "10:00 AM - 12:00 PM",
    subject: "Weekly Mega Quiz",
    topic: "Full Chapter Test & Ranking Analysis",
    faculty: "All Faculties",
    isLiveNow: false,
    courseId: "course-1"
  }
];

// =========================================================================
// FORMULA FLASHCARDS DATA
// =========================================================================

export const INITIAL_FLASHCARDS: Flashcard[] = [
  {
    id: "fc-1",
    courseId: "course-1",
    chapter: "Electrostatics",
    front: "Coulomb's Law Formula in Vector Form",
    back: "F = (1 / 4πε₀) · (|q₁ q₂| / r²) · r̂\n\nWhere 1/(4πε₀) = 9 × 10⁹ N·m²/C²\nForce acts along the line joining both charges."
  },
  {
    id: "fc-2",
    courseId: "course-1",
    chapter: "Electrostatics",
    front: "Electric Field on Axial Point of an Electric Dipole",
    back: "E_axial = (1 / 4πε₀) · (2p / r³)\n\nFor short dipole (r >> 2a).\nDirection is in the same direction as dipole moment vector p."
  },
  {
    id: "fc-3",
    courseId: "course-1",
    chapter: "Electrostatics",
    front: "Electric Field on Equatorial Point of an Electric Dipole",
    back: "E_equatorial = (1 / 4πε₀) · (p / r³)\n\nNote: E_axial = 2 × E_equatorial!\nDirection is opposite to dipole moment vector p."
  },
  {
    id: "fc-4",
    courseId: "course-1",
    chapter: "Gauss's Law",
    front: "Gauss's Theorem Mathematical Statement",
    back: "Φ = ∮ E·dA = q_enclosed / ε₀\n\nTotal electric flux through any closed Gaussian surface equals total enclosed charge divided by permittivity of free space."
  }
];

// =========================================================================
// CMS INITIAL DATA
// =========================================================================

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "ann-1",
    title: "🔴 Today at 7:00 PM: Electrostatics Live Numerical Masterclass",
    message: "All enrolled students should join on time with their formula sheet ready.",
    category: "live_class",
    date: "Today",
    isPinned: true
  },
  {
    id: "ann-2",
    title: "📄 Physics Chapter 1 & 2 Handwritten Golden Notes Uploaded",
    message: "Visit the PDF Notes section to view and download your study notes.",
    category: "notes_alert",
    date: "Yesterday",
    isPinned: true
  },
  {
    id: "ann-3",
    title: "🏆 Sunday Mega Mock Test Scheduled for Classes 10 & 12",
    message: "Full-length offline test in official board pattern starts this Sunday at 8:00 AM.",
    category: "exam_alert",
    date: "24 Oct 2026",
    isPinned: false
  }
];

export const INITIAL_ARTICLES: Article[] = [
  {
    id: "art-1",
    title: "How to Score 95%+ in Class 12 Physics (Guruji's Proven Strategy)",
    excerpt: "The proven approach to mastering NCERT derivations, formula flashcards, and 10-year previous papers.",
    content: "The biggest secret to high scores in Physics is writing derivations 3 times without looking. Prepare short formula notes at the beginning of each chapter...",
    author: "Guruji Alok Sharma",
    readTime: "4 min read",
    date: "20 Oct 2026",
    category: "Preparation Guide"
  },
  {
    id: "art-2",
    title: "Last 3 Months Revision Blueprint for Board & Competitive Exams",
    excerpt: "How to manage your timetable to prevent burnout and complete two full rounds of syllabus revision.",
    content: "Dedicate 2 hours daily to revision and 1 hour to problem practice. Before starting any new topic, do a 20-minute recap of previous chapters...",
    author: "Team ICC",
    readTime: "5 min read",
    date: "18 Oct 2026",
    category: "Study Tips"
  }
];

export const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    id: "test-1",
    studentName: "Aditya Prakash",
    examRank: "AIR 248 (JEE Advanced)",
    examName: "JEE Advanced 2025",
    review: "The live lectures and handwritten notes from ICC KE GURUJI built a rock-solid foundation in physics. Solving complex numericals became effortless!",
    rating: 5
  },
  {
    id: "test-2",
    studentName: "Sneha Mukherjee",
    examRank: "98.4% in CBSE Boards",
    examName: "Class 12 Boards",
    review: "The 24/7 AI Doubt solver was incredibly helpful during late-night study sessions. I got step-by-step derivations and clarifications instantly.",
    rating: 5
  },
  {
    id: "test-3",
    studentName: "Mohit Chauhan",
    examRank: "97.2% in State Boards",
    examName: "Class 10 Board Topper",
    review: "Weekly offline tests and direct guidance from Guruji helped me overcome exam anxiety and achieve top marks in science and mathematics.",
    rating: 5
  }
];

export const INITIAL_FAQS: FaqItem[] = [
  {
    id: "faq-1",
    question: "How soon is the course unlocked after making the payment?",
    answer: "As soon as you complete the UPI payment and submit the 12-digit UTR reference number, the admin verifies and activates access within 5 to 15 minutes. For demo purposes, you can also approve instantly from the Admin Panel."
  },
  {
    id: "faq-2",
    question: "If I miss a live class, can I watch the recording later?",
    answer: "Yes! Every live class is automatically saved in your classroom library right after the session ends. You can watch and revise as many times as you like."
  },
  {
    id: "faq-3",
    question: "How does the AI Doubt Guruji work?",
    answer: "The AI Tutor is available 24/7 inside your classroom. Type any formula, question, or conceptual doubt, and Guruji provides clear, step-by-step explanations in English."
  },
  {
    id: "faq-4",
    question: "What are the benefits of direct UPI payment?",
    answer: "Direct UPI payments go directly to the institute's bank account without any third-party gateway deductions, keeping batch enrollment fees affordable for students."
  }
];

export const INITIAL_DPPS: DppAssignment[] = [
  {
    id: "dpp-1",
    courseId: "course-1",
    title: "DPP 01: Coulomb's Law, Vector Form & Superposition Principle",
    chapter: "Chapter 1: Electrostatics",
    dueDate: "28 Oct 2026",
    totalMarks: 20,
    questionCount: 8,
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    description: "Solve these 8 numerical problems step-by-step on paper and upload, or submit your answers directly. Pay close attention to sign conventions."
  },
  {
    id: "dpp-2",
    courseId: "course-1",
    title: "DPP 02: Electric Dipole, Torque & Electric Flux Calculation",
    chapter: "Chapter 1: Electrostatics",
    dueDate: "30 Oct 2026",
    totalMarks: 25,
    questionCount: 10,
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    description: "Numericals on axial and equatorial dipole fields along with short conceptual questions."
  },
  {
    id: "dpp-3",
    courseId: "course-2",
    title: "DPP 01: Trigonometric Identities & Heights and Distances",
    chapter: "Chapter 8: Introduction to Trigonometry",
    dueDate: "29 Oct 2026",
    totalMarks: 20,
    questionCount: 8,
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    description: "Standard NCERT Exemplar & Board PYQ problems. Simplify LHS to RHS clearly."
  },
  {
    id: "dpp-4",
    courseId: "course-3",
    title: "Assignment 01: Chemical Bonding & Molecular Orbital Theory",
    chapter: "Chapter 4: Chemical Bonding",
    dueDate: "02 Nov 2026",
    totalMarks: 50,
    questionCount: 5,
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    description: "Draw molecular orbital energy level diagrams for O2 and N2, and calculate bond orders."
  }
];

export const INITIAL_DPP_SUBMISSIONS: DppSubmission[] = [
  {
    id: "sub-1",
    dppId: "dpp-1",
    courseId: "course-1",
    userId: "user-1",
    userName: "Rahul Kumar",
    userPhone: "+91 98765 43210",
    submittedAt: "24 Oct 2026, 04:30 PM",
    answerText: "Q1. F = 1.6 x 10^-14 N attractive.\nQ2. Net force at center = 0 due to symmetry.\nQ3. Ratio of electrostatic to gravitational force = 2.27 x 10^39.\nQ4. Torque max = pE when theta = 90 deg.\nDetailed step derivation attached in sheet.",
    status: "graded",
    marksAwarded: 19,
    feedback: "Well done, Rahul! Excellent step-by-step calculations. Remember to specify vector units in Q4, otherwise perfect work. Keep it up!",
    attachmentName: "Rahul_Kumar_DPP01_Solutions.pdf"
  },
  {
    id: "sub-2",
    dppId: "dpp-2",
    courseId: "course-1",
    userId: "user-3",
    userName: "Priya Sharma",
    userPhone: "+91 98111 22334",
    submittedAt: "25 Oct 2026, 10:15 AM",
    answerText: "Q1. Dipole moment p = 4.8 x 10^-30 C.m.\nQ2. Axial field is twice of equatorial field.\nQ3. Work done = pE(1 - cos theta).",
    status: "pending",
    attachmentName: "Priya_Dipole_HW.pdf"
  }
];

export const INITIAL_PYQS: PyqPaper[] = [
  {
    id: "pyq-1",
    title: "CBSE Class 12 Physics Board Paper 2024 (All Sets with Guruji Solutions)",
    exam: "Class 12 Board",
    year: "2024",
    subject: "Physics",
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    solutionPdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    downloadsCount: 1420,
    fileSize: "4.8 MB"
  },
  {
    id: "pyq-2",
    title: "JEE Mains 2024 Shift-1 Physics Complete Solved Question Bank",
    exam: "JEE Mains",
    year: "2024",
    subject: "Physics",
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    solutionPdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    downloadsCount: 2310,
    fileSize: "6.2 MB"
  },
  {
    id: "pyq-3",
    title: "CBSE Class 10th Science & Maths Board Paper 2024 with Marking Scheme",
    exam: "Class 10 Board",
    year: "2024",
    subject: "Science & Maths",
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    solutionPdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    downloadsCount: 3840,
    fileSize: "5.1 MB"
  },
  {
    id: "pyq-4",
    title: "NEET 2024 Physics Complete 45 Questions with Speed Formula Solutions",
    exam: "NEET",
    year: "2024",
    subject: "Physics",
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    solutionPdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    downloadsCount: 1980,
    fileSize: "3.9 MB"
  },
  {
    id: "pyq-5",
    title: "CBSE Class 12 Physics 2023 Board Paper with Topper's Answer Sheet",
    exam: "Class 12 Board",
    year: "2023",
    subject: "Physics",
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    solutionPdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    downloadsCount: 1650,
    fileSize: "5.5 MB"
  }
];

export const INITIAL_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: "post-1",
    courseId: "course-1",
    courseTitle: "Class 12 & NEET/JEE: Physics Complete Mastery",
    authorName: "Amit Verma",
    authorPhone: "+91 97722 33445",
    title: "Can Gauss's Law be applied directly to non-symmetric closed surfaces?",
    question: "Guruji, if a closed surface is irregular rather than a symmetrical cube or sphere, is total flux still q_enclosed / epsilon_0? Or does the formula change with geometry?",
    tags: ["Electrostatics", "GaussLaw", "Class12"],
    createdAt: "Yesterday, 07:15 PM",
    upvotes: 14,
    isResolved: true,
    answers: [
      {
        id: "ans-1",
        authorName: "Er. Alok Sharma (ICC KE GURUJI)",
        authorRole: "guruji",
        text: "Great question! The fundamental principle of Gauss's Law is completely geometry-independent. Total electric flux is always q_in / epsilon_0 regardless of shape. However, to evaluate electric field E directly, we need spatial symmetry.",
        createdAt: "Yesterday, 08:00 PM",
        upvotes: 21
      },
      {
        id: "ans-2",
        authorName: "Rahul Kumar",
        authorRole: "student",
        text: "Thank you, Guruji! That clarifies the concept completely.",
        createdAt: "Yesterday, 08:30 PM",
        upvotes: 4
      }
    ]
  },
  {
    id: "post-2",
    courseId: "course-2",
    courseTitle: "Class 10 Board Exam Super 100 Batch",
    authorName: "Pooja Gupta",
    authorPhone: "+91 91234 56780",
    title: "Tips for simplifying trigonometric identity proofs involving sec θ and tan θ?",
    question: "Whenever questions have both tan θ and sec θ terms mixed, simplifying LHS to RHS becomes very lengthy. Is there a faster algebraic method?",
    tags: ["Maths", "Class10", "Trigonometry"],
    createdAt: "2 days ago",
    upvotes: 8,
    isResolved: true,
    answers: [
      {
        id: "ans-3",
        authorName: "Neha Verma (ICC KE GURUJI)",
        authorRole: "guruji",
        text: "Golden Rule: Always check if the identity sec²θ - tan²θ = (secθ - tanθ)(secθ + tanθ) = 1 can be factored. Many board exam identity questions resolve in just 2 lines using this factorization!",
        createdAt: "2 days ago",
        upvotes: 18
      }
    ]
  }
];

export const INITIAL_CERTIFICATES: CertificateRecord[] = [
  {
    certificateId: "ICC-2026-PHY-7891",
    userId: "user-1",
    studentName: "Rahul Kumar",
    courseId: "course-1",
    courseTitle: "Class 12 & NEET/JEE: Physics Complete Mastery 2026",
    issueDate: "24 October 2026",
    grade: "A+",
    scorePercent: 94.5,
    instructorName: "Er. Alok Sharma • ICC KE GURUJI"
  }
];

// =========================================================================
// LOCAL COACHING INITIAL DATA: ATTENDANCE, FEES & WEEKLY TESTS
// =========================================================================

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: "att-1",
    date: "2026-10-26",
    courseId: "course-1",
    courseTitle: "Class 12 Physics Mastery 2026",
    studentId: "student-101",
    studentName: "Rahul Kumar",
    studentPhone: "+91 98765 43210",
    rollNo: "ICC-101",
    status: "present",
    markedAt: "07:05 AM"
  },
  {
    id: "att-2",
    date: "2026-10-26",
    courseId: "course-1",
    courseTitle: "Class 12 Physics Mastery 2026",
    studentId: "student-104",
    studentName: "Vikas Yadav",
    studentPhone: "+91 98333 44556",
    rollNo: "ICC-104",
    status: "absent",
    markedAt: "07:10 AM"
  }
];

export const INITIAL_FEE_RECORDS: FeeRecord[] = [
  {
    id: "fee-1",
    receiptNo: "REC-2026-001",
    studentId: "student-101",
    studentName: "Rahul Kumar",
    studentPhone: "+91 98765 43210",
    fatherName: "Shri Ramesh Kumar",
    courseTitle: "Class 12 Physics Mastery 2026",
    month: "October 2026",
    amountPaid: 1000,
    dueRemaining: 0,
    paymentMode: "Cash",
    date: "2026-10-24",
    remarks: "Full October Fee Paid (Cash)"
  },
  {
    id: "fee-2",
    receiptNo: "REC-2026-002",
    studentId: "student-103",
    studentName: "Aman Gupta",
    studentPhone: "+91 99222 33445",
    fatherName: "Shri Suresh Gupta",
    courseTitle: "Class 11 & 12 Chemistry",
    month: "October 2026",
    amountPaid: 600,
    dueRemaining: 600,
    paymentMode: "PhonePe / GPay",
    date: "2026-10-25",
    remarks: "Part payment via PhonePe. Remaining balance: Rs 600"
  }
];

export const INITIAL_WEEKLY_TESTS: WeeklyTest[] = [
  {
    id: "wtest-1",
    courseId: "course-1",
    courseTitle: "Class 12 Physics",
    testTitle: "Sunday Offline Test 01: Electrostatics & Numerical Mastery",
    subject: "Physics",
    totalMarks: 50,
    testDate: "2026-10-19",
    results: [
      {
        studentId: "student-101",
        studentName: "Rahul Kumar",
        studentPhone: "+91 98765 43210",
        rollNo: "ICC-101",
        marksObtained: 48,
        rank: 1,
        feedback: "Outstanding performance! Full score in numerical derivations."
      },
      {
        studentId: "student-104",
        studentName: "Vikas Yadav",
        studentPhone: "+91 98333 44556",
        rollNo: "ICC-104",
        marksObtained: 38,
        rank: 2,
        feedback: "Good attempt. Pay more attention to formula notations."
      }
    ]
  }
];

export const INITIAL_TEACHERS: Teacher[] = [
  {
    id: "teacher-1",
    facultyId: "ICC-T-101",
    name: "Er. Alok Sharma (Guruji)",
    phone: "+91 99342 15013",
    email: "alok.physics@icckeguruji.com",
    password: "teacher123",
    subject: "Physics (Class 11, 12 & NEET/JEE)",
    qualification: "M.Tech IIT Kanpur (Physics Gold Medalist)",
    experience: "12+ Years",
    salaryMonthly: 45000,
    joiningDate: "2020-04-01",
    assignedBatches: ["Class 12 Physics Complete Mastery", "NEET/JEE Foundation"],
    status: "active",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    bio: "Founder & Lead Physics Faculty. Known for intuitive visual demonstrations and solving tough numericals in 30 seconds.",
    address: "ICC Coaching Campus, Main Road",
    bloodGroup: "O+",
    specialization: "Mechanics, Electrodynamics & Modern Physics",
    achievements: [
      "Mentored 120+ students into NITs & IITs",
      "Author of 'Physics Concept Booster' Handbook",
      "Best Teacher Award (District Level 2023)"
    ]
  },
  {
    id: "teacher-2",
    facultyId: "ICC-T-102",
    name: "Neha Verma",
    phone: "+91 98765 43211",
    email: "neha.maths@icckeguruji.com",
    password: "teacher123",
    subject: "Mathematics (Class 10 & 12 Boards)",
    qualification: "M.Sc. Mathematics, B.Ed. (Delhi University)",
    experience: "8+ Years",
    salaryMonthly: 35000,
    joiningDate: "2021-07-15",
    assignedBatches: ["Class 10 Board Super 100", "Class 12 Calculus Mastery"],
    status: "active",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    bio: "Board examination specialist with track record of mentoring 40+ students scoring 100/100 in Mathematics.",
    address: "Adarsh Colony, Street No. 3",
    bloodGroup: "B+",
    specialization: "Calculus, Coordinate Geometry & Trigonometry",
    achievements: [
      "40+ Students with 100/100 in CBSE Board",
      "Gold Medalist in M.Sc. Applied Mathematics",
      "Spearheaded Class 10 Board Revision Series"
    ]
  },
  {
    id: "teacher-3",
    facultyId: "ICC-T-103",
    name: "Dr. R.K. Mishra",
    phone: "+91 98111 22445",
    email: "dr.mishra.chem@icckeguruji.com",
    password: "teacher123",
    subject: "Chemistry (Organic & Physical)",
    qualification: "Ph.D. Organic Chemistry (BHU)",
    experience: "10+ Years",
    salaryMonthly: 38000,
    joiningDate: "2022-01-10",
    assignedBatches: ["Class 11 & 12 Chemistry", "NEET Medical Chemistry"],
    status: "active",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    bio: "Expert in organic reaction mechanisms and NCERT named reactions memory charts.",
    address: "Professors Colony, Sector 2",
    bloodGroup: "A+",
    specialization: "Organic Mechanisms & Chemical Thermodynamics",
    achievements: [
      "Published 15 Research Papers in Organic Synthesis",
      "Created 1-Page NCERT Reactions Cheat-sheets"
    ]
  },
  {
    id: "teacher-4",
    facultyId: "ICC-T-104",
    name: "Suman Singh",
    phone: "+91 99222 55667",
    email: "suman.bio@icckeguruji.com",
    password: "teacher123",
    subject: "Biology & Botany (NEET / Class 10)",
    qualification: "M.Sc. Zoology, CSIR-NET Qualified",
    experience: "6+ Years",
    salaryMonthly: 30000,
    joiningDate: "2023-03-01",
    assignedBatches: ["Class 10 Science", "NEET Biology Booster"],
    status: "active",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
    bio: "Passionate about diagrammatic NCERT biology and botanical taxonomy.",
    address: "Green Park Avenue, Block C",
    bloodGroup: "AB+",
    specialization: "Human Physiology & Genetics",
    achievements: [
      "CSIR-NET JRF Rank 42",
      "Specialist in 340+ Score in NEET Biology"
    ]
  }
];

export const INITIAL_TEACHER_ATTENDANCE: TeacherAttendanceRecord[] = [
  {
    id: "tatt-1",
    date: "2026-10-28",
    teacherId: "teacher-1",
    teacherName: "Er. Alok Sharma (Guruji)",
    teacherPhone: "+91 99342 15013",
    subject: "Physics",
    status: "present",
    inTime: "07:30 AM",
    outTime: "02:00 PM",
    markedAt: "07:35 AM",
    remarks: "Morning Batch + Doubt Class"
  },
  {
    id: "tatt-2",
    date: "2026-10-28",
    teacherId: "teacher-2",
    teacherName: "Neha Verma",
    teacherPhone: "+91 98765 43211",
    subject: "Mathematics",
    status: "present",
    inTime: "08:00 AM",
    outTime: "01:30 PM",
    markedAt: "08:05 AM",
    remarks: "Class 10 Revision Test"
  },
  {
    id: "tatt-3",
    date: "2026-10-28",
    teacherId: "teacher-3",
    teacherName: "Dr. R.K. Mishra",
    teacherPhone: "+91 98111 22445",
    subject: "Chemistry",
    status: "present",
    inTime: "08:15 AM",
    outTime: "02:30 PM",
    markedAt: "08:20 AM",
    remarks: "Organic Lab & Numericals"
  },
  {
    id: "tatt-4",
    date: "2026-10-28",
    teacherId: "teacher-4",
    teacherName: "Suman Singh",
    teacherPhone: "+91 99222 55667",
    subject: "Biology & Botany",
    status: "leave",
    inTime: "--",
    outTime: "--",
    markedAt: "08:00 AM",
    remarks: "Approved Personal Leave"
  }
];

// Storage keys
const STORAGE_KEYS = {
  COURSES: 'coaching_courses_v5',
  LESSONS: 'coaching_lessons_v5',
  NOTES: 'coaching_notes_v5',
  PAYMENTS: 'coaching_payments_v5',
  CONFIG: 'coaching_config_v5',
  USER: 'coaching_user_v6',
  STUDENTS: 'coaching_students_v5',
  ANNOUNCEMENTS: 'coaching_announcements_v5',
  ARTICLES: 'coaching_articles_v5',
  TESTIMONIALS: 'coaching_testimonials_v5',
  FAQS: 'coaching_faqs_v5',
  QUIZZES: 'coaching_quizzes_v5',
  TIMETABLE: 'coaching_timetable_v5',
  FLASHCARDS: 'coaching_flashcards_v5',
  DPPS: 'coaching_dpps_v5',
  DPP_SUBMISSIONS: 'coaching_dpp_subs_v5',
  PYQS: 'coaching_pyqs_v5',
  COMMUNITY_POSTS: 'coaching_community_v5',
  CERTIFICATES: 'coaching_certificates_v5',
  ATTENDANCE: 'coaching_attendance_v6',
  FEE_RECORDS: 'coaching_fee_records_v6',
  WEEKLY_TESTS: 'coaching_weekly_tests_v6',
  TEACHERS: 'coaching_teachers_v1',
  TEACHER_ATTENDANCE: 'coaching_teacher_attendance_v1',
  NOTIFICATIONS: 'coaching_notifications_v1',
};

export interface StoredData {
  courses: Course[];
  lessons: Lesson[];
  notes: PdfNote[];
  payments: PaymentRequest[];
  config: CoachingConfig;
  user: User;
  students: User[];
  announcements: Announcement[];
  articles: Article[];
  testimonials: Testimonial[];
  faqs: FaqItem[];
  quizzes: Quiz[];
  timetable: TimetableSlot[];
  flashcards: Flashcard[];
  dpps: DppAssignment[];
  dppSubmissions: DppSubmission[];
  pyqPapers: PyqPaper[];
  communityPosts: CommunityPost[];
  certificates: CertificateRecord[];
  attendance: AttendanceRecord[];
  feeRecords: FeeRecord[];
  weeklyTests: WeeklyTest[];
  teachers: Teacher[];
  teacherAttendance: TeacherAttendanceRecord[];
  notifications: NotificationItem[];
}

export const getStoredData = (): StoredData => {
  if (typeof window === 'undefined') {
    return {
      courses: INITIAL_COURSES,
      lessons: INITIAL_LESSONS,
      notes: INITIAL_NOTES,
      payments: INITIAL_PAYMENTS,
      config: DEFAULT_CONFIG,
      user: GUEST_USER,
      students: INITIAL_STUDENTS,
      announcements: INITIAL_ANNOUNCEMENTS,
      articles: INITIAL_ARTICLES,
      testimonials: INITIAL_TESTIMONIALS,
      faqs: INITIAL_FAQS,
      quizzes: INITIAL_QUIZZES,
      timetable: INITIAL_TIMETABLE,
      flashcards: INITIAL_FLASHCARDS,
      dpps: INITIAL_DPPS,
      dppSubmissions: INITIAL_DPP_SUBMISSIONS,
      pyqPapers: INITIAL_PYQS,
      communityPosts: INITIAL_COMMUNITY_POSTS,
      certificates: INITIAL_CERTIFICATES,
      attendance: INITIAL_ATTENDANCE,
      feeRecords: INITIAL_FEE_RECORDS,
      weeklyTests: INITIAL_WEEKLY_TESTS,
      teachers: INITIAL_TEACHERS,
      teacherAttendance: INITIAL_TEACHER_ATTENDANCE,
      notifications: INITIAL_NOTIFICATIONS,
    };
  }

  try {
    const courses: Course[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.COURSES) || 'null') || INITIAL_COURSES;
    const lessons: Lesson[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.LESSONS) || 'null') || INITIAL_LESSONS;
    const notes: PdfNote[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTES) || 'null') || INITIAL_NOTES;
    const payments: PaymentRequest[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PAYMENTS) || 'null') || INITIAL_PAYMENTS;
    const rawConfig = JSON.parse(localStorage.getItem(STORAGE_KEYS.CONFIG) || 'null');
    const config: CoachingConfig = rawConfig ? { ...DEFAULT_CONFIG, ...rawConfig } : DEFAULT_CONFIG;
    const user: User = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || 'null') || GUEST_USER;
    const students: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS) || 'null') || INITIAL_STUDENTS;
    const announcements: Announcement[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS) || 'null') || INITIAL_ANNOUNCEMENTS;
    const articles: Article[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.ARTICLES) || 'null') || INITIAL_ARTICLES;
    const testimonials: Testimonial[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.TESTIMONIALS) || 'null') || INITIAL_TESTIMONIALS;
    const faqs: FaqItem[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.FAQS) || 'null') || INITIAL_FAQS;
    const quizzes: Quiz[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.QUIZZES) || 'null') || INITIAL_QUIZZES;
    const timetable: TimetableSlot[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.TIMETABLE) || 'null') || INITIAL_TIMETABLE;
    const flashcards: Flashcard[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.FLASHCARDS) || 'null') || INITIAL_FLASHCARDS;
    const dpps: DppAssignment[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.DPPS) || 'null') || INITIAL_DPPS;
    const dppSubmissions: DppSubmission[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.DPP_SUBMISSIONS) || 'null') || INITIAL_DPP_SUBMISSIONS;
    const pyqPapers: PyqPaper[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PYQS) || 'null') || INITIAL_PYQS;
    const communityPosts: CommunityPost[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMMUNITY_POSTS) || 'null') || INITIAL_COMMUNITY_POSTS;
    const certificates: CertificateRecord[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CERTIFICATES) || 'null') || INITIAL_CERTIFICATES;
    const attendance: AttendanceRecord[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.ATTENDANCE) || 'null') || INITIAL_ATTENDANCE;
    const feeRecords: FeeRecord[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.FEE_RECORDS) || 'null') || INITIAL_FEE_RECORDS;
    const weeklyTests: WeeklyTest[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.WEEKLY_TESTS) || 'null') || INITIAL_WEEKLY_TESTS;
    const teachers: Teacher[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.TEACHERS) || 'null') || INITIAL_TEACHERS;
    const teacherAttendance: TeacherAttendanceRecord[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.TEACHER_ATTENDANCE) || 'null') || INITIAL_TEACHER_ATTENDANCE;
    const notifications: NotificationItem[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || 'null') || INITIAL_NOTIFICATIONS;

    return {
      courses,
      lessons,
      notes,
      payments,
      config,
      user,
      students,
      announcements,
      articles,
      testimonials,
      faqs,
      quizzes,
      timetable,
      flashcards,
      dpps,
      dppSubmissions,
      pyqPapers,
      communityPosts,
      certificates,
      attendance,
      feeRecords,
      weeklyTests,
      teachers,
      teacherAttendance,
      notifications,
    };
  } catch (err) {
    console.error("Storage error:", err);
    return {
      courses: INITIAL_COURSES,
      lessons: INITIAL_LESSONS,
      notes: INITIAL_NOTES,
      payments: INITIAL_PAYMENTS,
      config: DEFAULT_CONFIG,
      user: GUEST_USER,
      students: INITIAL_STUDENTS,
      announcements: INITIAL_ANNOUNCEMENTS,
      articles: INITIAL_ARTICLES,
      testimonials: INITIAL_TESTIMONIALS,
      faqs: INITIAL_FAQS,
      quizzes: INITIAL_QUIZZES,
      timetable: INITIAL_TIMETABLE,
      flashcards: INITIAL_FLASHCARDS,
      dpps: INITIAL_DPPS,
      dppSubmissions: INITIAL_DPP_SUBMISSIONS,
      pyqPapers: INITIAL_PYQS,
      communityPosts: INITIAL_COMMUNITY_POSTS,
      certificates: INITIAL_CERTIFICATES,
      attendance: INITIAL_ATTENDANCE,
      feeRecords: INITIAL_FEE_RECORDS,
      weeklyTests: INITIAL_WEEKLY_TESTS,
      teachers: INITIAL_TEACHERS,
      teacherAttendance: INITIAL_TEACHER_ATTENDANCE,
      notifications: INITIAL_NOTIFICATIONS,
    };
  }
};

export const saveStoredData = (key: keyof typeof STORAGE_KEYS, data: unknown) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(data));
      window.dispatchEvent(new Event('coaching_storage_updated'));
    } catch (e) {
      console.error("Failed to save to localStorage:", e);
    }
  }
};

/**
 * Unified Secure Authenticator (Single Login for Student & Admin)
 * Automatically detects whether user is Guruji Admin or Student and routes them!
 */
export function authenticateUser(
  identifier: string,
  password: string
): { success: boolean; user?: User; redirectTo?: string; error?: string } {
  const data = getStoredData();
  const cleanId = (identifier || '').trim().toLowerCase();
  const cleanPass = (password || '').trim();
  const digitsOnly = cleanId.replace(/[^0-9]/g, '');

  if (!cleanId) {
    return { success: false, error: 'Please enter your Email ID or Mobile Number.' };
  }
  if (!cleanPass) {
    return { success: false, error: 'Please enter your Password.' };
  }

  // 1. Check Guruji Admin Login
  if (
    cleanId === 'admin@icckeguruji.com' ||
    cleanId === 'guruji@icckeguruji.com' ||
    cleanId === 'admin' ||
    digitsOnly === '9876543210'
  ) {
    if (cleanPass === 'admin123' || cleanPass === 'guruji123' || cleanPass === 'admin') {
      const admin: User = {
        id: "admin-guruji",
        name: "Guruji (Alok Sharma)",
        phone: "+91 98765 43210",
        email: "admin@icckeguruji.com",
        password: "admin123",
        role: "admin",
        enrolledCourseIds: ["course-1", "course-2", "course-3"],
        joinedDate: "Founder",
      };
      saveStoredData('USER', admin);
      return { success: true, user: admin, redirectTo: '/admin' };
    }
    return { success: false, error: 'Incorrect admin password! Default: "admin123"' };
  }

  // 2. Check Teacher / Faculty Login (by Faculty ID e.g. "ICC-T-101", Email, or Phone)
  const existingTeacher = (data.teachers || []).find((t) => {
    const tEmail = (t.email || '').toLowerCase();
    const tDigits = (t.phone || '').replace(/[^0-9]/g, '').slice(-10);
    const tFacultyId = (t.facultyId || '').toLowerCase();
    return (
      tEmail === cleanId ||
      tFacultyId === cleanId ||
      (digitsOnly.length >= 10 && tDigits === digitsOnly.slice(-10))
    );
  });

  if (existingTeacher) {
    const validPass = existingTeacher.password || 'teacher123';
    if (cleanPass === validPass || cleanPass === 'teacher123') {
      const teacherUser: User = {
        id: existingTeacher.id,
        name: existingTeacher.name,
        phone: existingTeacher.phone,
        email: existingTeacher.email,
        password: validPass,
        role: 'teacher',
        facultyId: existingTeacher.facultyId,
        avatar: existingTeacher.avatar,
        joinedDate: existingTeacher.joiningDate,
        address: existingTeacher.address,
        enrolledCourseIds: existingTeacher.assignedBatches || [],
      };
      saveStoredData('USER', teacherUser);
      return { success: true, user: teacherUser, redirectTo: '/teacher' };
    }
    return { success: false, error: 'Incorrect teacher password! Default: "teacher123"' };
  }

  // 3. Check Existing Registered Students (by Email OR Phone)
  const existingStudent = data.students.find((s) => {
    const sEmail = (s.email || '').toLowerCase();
    const sDigits = (s.phone || '').replace(/[^0-9]/g, '').slice(-10);
    return sEmail === cleanId || (digitsOnly.length >= 10 && sDigits === digitsOnly.slice(-10));
  });

  if (existingStudent) {
    if (!existingStudent.password || existingStudent.password === cleanPass || cleanPass === 'student123') {
      saveStoredData('USER', existingStudent);
      return { success: true, user: existingStudent, redirectTo: '/course/course-1' };
    }
    return { success: false, error: 'Incorrect password! For demo accounts, use "student123".' };
  }

  // 3. New Student Instant Registration on first login
  if (cleanPass.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.' };
  }

  const nameFromEmail = cleanId.includes('@')
    ? cleanId.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()).trim()
    : `Student ${digitsOnly.slice(-4) || 'Learner'}`;

  const newStudent: User = {
    id: `student-${Date.now()}`,
    name: nameFromEmail || 'Enrolled Student',
    email: cleanId.includes('@') ? cleanId : `${digitsOnly}@student.local`,
    phone: digitsOnly ? `+91 ${digitsOnly.slice(-10)}` : '+91 98' + Math.floor(10000000 + Math.random() * 90000000),
    password: cleanPass,
    role: 'student',
    enrolledCourseIds: ['course-1'],
    joinedDate: 'Today',
    streakDays: 1,
  };

  const updatedStudents = [newStudent, ...data.students];
  saveStoredData('STUDENTS', updatedStudents);
  saveStoredData('USER', newStudent);

  return { success: true, user: newStudent, redirectTo: '/course/course-1' };
}

/**
 * Update user password after OTP reset
 */
export function resetUserPassword(
  identifier: string,
  newPassword: string
): { success: boolean; user?: User; error?: string } {
  const data = getStoredData();
  const cleanId = (identifier || '').trim().toLowerCase();
  const digitsOnly = cleanId.replace(/[^0-9]/g, '');

  if (!cleanId) return { success: false, error: 'Email or Phone is required.' };
  if (!newPassword || newPassword.length < 6) return { success: false, error: 'New password must be at least 6 characters long.' };

  // Check admin
  if (cleanId === 'admin@icckeguruji.com' || cleanId === 'admin') {
    const admin: User = {
      id: "admin-guruji",
      name: "Guruji (Alok Sharma)",
      phone: "+91 98765 43210",
      email: "admin@icckeguruji.com",
      password: newPassword,
      role: "admin",
      enrolledCourseIds: ["course-1", "course-2", "course-3"],
      joinedDate: "Founder",
    };
    saveStoredData('USER', admin);
    return { success: true, user: admin };
  }

  // Check existing student
  const student = data.students.find((s) => {
    const sEmail = (s.email || '').toLowerCase();
    const sDigits = (s.phone || '').replace(/[^0-9]/g, '').slice(-10);
    return sEmail === cleanId || (digitsOnly.length >= 10 && sDigits === digitsOnly.slice(-10));
  });

  if (student) {
    student.password = newPassword;
    saveStoredData('STUDENTS', data.students);
    if (data.user.id === student.id || data.user.email === student.email) {
      data.user.password = newPassword;
      saveStoredData('USER', data.user);
    }
    return { success: true, user: student };
  }

  return { success: false, error: 'Account not found. Please enter a valid registered email or phone.' };
}

