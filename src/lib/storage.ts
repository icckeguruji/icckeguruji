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
} from '@/types';

export const DEFAULT_CONFIG: CoachingConfig = {
  coachingName: "ICC KE GURUJI",
  tagline: "Live Classes, Smart Notes & 24/7 AI Guruji",
  upiId: "icckeguruji@okaxis",
  merchantName: "ICC KE GURUJI",
  whatsappNumber: "+919876543210",
  telegramGroupLink: "https://t.me/icckeguruji_official",
  telegramBotUsername: "IccKeGurujiBot",
  contactEmail: "contact@icckeguruji.com",
  heroHeadline: "Apne Career Ka Lakshya Haasil Karein with ICC KE GURUJI",
  heroSubheadline: "Daily YouTube Live interactive classes, chapter-wise handwritten PDF notes, 24/7 AI Doubt Guruji aur paid Telegram group alerts.",
  admissionBadgeText: "New Academic Session 2026 Admissions Open • Direct UPI Zero Commission",
  marqueeNotice: "🔴 Aaj Shaam 7:00 PM Live Numerical Class & Formula Revision! Sabhi students time par join karein.",
  stat1Value: "10,000+",
  stat1Label: "Enrolled Students",
  stat2Value: "98.4%",
  stat2Label: "Highest Board Score",
  stat3Value: "24/7",
  stat3Label: "AI Guruji Doubt Tutor",
  stat4Value: "0% Fee",
  stat4Label: "Direct UPI Transfer",
  homeQuizQuestion: "Agar do static charges ke beech ki distance ko half (r/2) kar diya jaye, toh unke beech lagne wala electrostatic force kitna ho jayega?",
  homeQuizOptions: ["2 Guna (Double)", "4 Guna (4 Times)", "Aadha (Half)", "1/4th (One-Fourth)"],
  homeQuizCorrectIndex: 1,
  homeQuizExplanation: "Correct Answer: B (4 Guna)! Coulomb's law ke mutabiq F ∝ 1/r². Jab distance aadhi (r/2) hogi, toh force 4 guna badh jayega. Sabhi batches mein aise chapter-wise mock tests available hain!",
};

export const INITIAL_COURSES: Course[] = [
  {
    id: "course-1",
    title: "Class 12 & NEET/JEE: Physics Complete Mastery 2026",
    subtitle: "Complete NCERT + Advanced Concepts, Daily Live Classes & Formula Notes",
    description: "Ye course specially un students ke liye design kiya gaya hai jo Physics mein 95%+ score karna chahte hain. Isme Mechanics, Electrodynamics, Optics aur Modern Physics deep concepts ke sath cover kiye gaye hain.",
    category: "Competitive Exams",
    price: 999,
    originalPrice: 3499,
    thumbnail: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&w=800&q=80",
    instructorName: "Er. Alok Sharma (IIT Kanpur)",
    instructorRole: "Senior Physics Faculty (12+ Yrs Exp)",
    language: "Hinglish (Hindi + English)",
    duration: "6 Months • 120+ Hours",
    features: [
      "Daily YouTube Live Interactive Sessions",
      "Chapter-wise Colored Handwritten PDF Notes",
      "24/7 AI Guruji Doubt Solver Support",
      "Chapter-wise Mock Tests & Formula Flashcards",
      "Paid Students Secret Telegram Group Access"
    ],
    lessonsCount: 42,
    notesCount: 28,
    isPopular: true
  },
  {
    id: "course-2",
    title: "Class 10 Board Exam Super 100 Batch",
    subtitle: "Science, Maths & Social Science Complete Crash Course + Sample Papers",
    description: "Class 10th Boards ke liye ultimate score booster course. Saare imp formulas, theorems aur previous 10 years question papers ka live solution.",
    category: "Board Exams",
    price: 499,
    originalPrice: 1999,
    thumbnail: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80",
    instructorName: "Neha Verma & Team",
    instructorRole: "Board Exam Specialist Mentors",
    language: "Hindi",
    duration: "3 Months • 75+ Hours",
    features: [
      "Targeted Board Questions & Live Solutions",
      "Quick Revision Mind Maps & PDF Notes",
      "Formula Cheat Sheets & Mock Tests",
      "WhatsApp Instant Doubt Support",
      "Weekly Model Answer Key Evaluation"
    ],
    lessonsCount: 30,
    notesCount: 22,
    isPopular: false
  },
  {
    id: "course-3",
    title: "Full-Stack Web Development: Zero to Hero (Placement Batch)",
    subtitle: "Master React, Next.js, Node.js, Databases & AI App Building",
    description: "Practical project-based software engineering course jisme aap 5 real-world live projects banayenge aur internship/job preparation karenge.",
    category: "Coding & Tech",
    price: 1499,
    originalPrice: 5999,
    thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80",
    instructorName: "Rohan Singhania",
    instructorRole: "Ex-Google Software Engineer",
    language: "Hinglish",
    duration: "4 Months • 90+ Hours",
    features: [
      "Live Coding & Screen Share Classes",
      "All Source Code & Lecture Notes Included",
      "Portfolio & Resume Review",
      "AI Tools & Chatbot Development Integration",
      "Certificate of Completion"
    ],
    lessonsCount: 50,
    notesCount: 35,
    isPopular: true
  }
];

export const INITIAL_LESSONS: Lesson[] = [
  {
    id: "les-1",
    courseId: "course-1",
    title: "🔴 LIVE CLASS: Electrostatics - Electric Charges & Coulomb's Law",
    description: "Aaj ki live class mein hum Coulomb's Law in Vector form, Principle of Superposition aur previous year questions solve karenge.",
    youtubeId: "jfKfPfyJRdk",
    isLive: true,
    scheduledAt: "Aaj shaam 7:00 PM",
    duration: "1 hr 30 min",
    chapterNumber: 1
  },
  {
    id: "les-2",
    courseId: "course-1",
    title: "Lecture 02: Electric Field & Electric Dipole Derivations",
    description: "Axial and Equatorial points par electric field intensity ka step-by-step derivation for board and competitive exams.",
    youtubeId: "dQw4w9WgXcQ",
    isLive: false,
    duration: "1 hr 15 min",
    chapterNumber: 1
  },
  {
    id: "les-3",
    courseId: "course-1",
    title: "Lecture 03: Gauss's Law Applications & Numerical Shortcuts",
    description: "Gauss theorem ke top 5 most important board derivations aur IIT-JEE numerical shortcuts.",
    youtubeId: "M7lc1UVf-VE",
    isLive: false,
    duration: "1 hr 20 min",
    chapterNumber: 2
  },
  {
    id: "les-4",
    courseId: "course-2",
    title: "🔴 LIVE: Class 10 Science - Chemical Reactions & Equations Fast Revision",
    description: "Balancing chemical equations, types of reactions aur board exam ke favorite questions.",
    youtubeId: "jfKfPfyJRdk",
    isLive: true,
    scheduledAt: "Aaj shaam 5:00 PM",
    duration: "1 hr",
    chapterNumber: 1
  },
  {
    id: "les-5",
    courseId: "course-3",
    title: "🔴 LIVE: Modern Full-Stack Architecture & Next.js Deep Dive",
    description: "Client vs Server components, Next.js routing, server actions aur real-world state management.",
    youtubeId: "jfKfPfyJRdk",
    isLive: true,
    scheduledAt: "Kal subah 11:00 AM",
    duration: "2 hr",
    chapterNumber: 1
  }
];

export const INITIAL_NOTES: PdfNote[] = [
  {
    id: "note-1",
    courseId: "course-1",
    title: "Electrostatics & Coulomb's Law - Handwritten Golden Notes",
    description: "Detailed handwritten formula sheet, derivations with colored diagrams aur solved examples.",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    fileSize: "4.8 MB",
    pageCount: 24,
    uploadedAt: "Yesterday"
  },
  {
    id: "note-2",
    courseId: "course-1",
    title: "Gauss Law & Electric Potential - Top 50 PYQs with Solutions",
    description: "Last 10 years ke solved board questions with step marking guide.",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    fileSize: "6.2 MB",
    pageCount: 38,
    uploadedAt: "3 days ago"
  },
  {
    id: "note-3",
    courseId: "course-2",
    title: "Science All Chemical Equations & Balancing Cheat Sheet",
    description: "1-page quick formula revision sheet for Board exam morning revision.",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    fileSize: "2.1 MB",
    pageCount: 12,
    uploadedAt: "Oct 20, 2026"
  },
  {
    id: "note-4",
    courseId: "course-3",
    title: "Next.js App Router Architecture & Production Cheatsheet",
    description: "Clean code best practices, caching strategies and Supabase integration blueprint.",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    fileSize: "3.5 MB",
    pageCount: 18,
    uploadedAt: "Oct 22, 2026"
  }
];

export const INITIAL_USER: User = {
  id: "student-101",
  name: "Rahul Kumar",
  phone: "+91 98765 43210",
  email: "rahul.student@gmail.com",
  role: "student",
  enrolledCourseIds: ["course-1"],
  joinedDate: "15 Oct 2026",
  streakDays: 7
};

export const INITIAL_STUDENTS: User[] = [
  {
    id: "student-101",
    name: "Rahul Kumar",
    phone: "+91 98765 43210",
    email: "rahul.student@gmail.com",
    role: "student",
    enrolledCourseIds: ["course-1"],
    joinedDate: "15 Oct 2026",
    streakDays: 7
  },
  {
    id: "student-102",
    name: "Priya Sharma",
    phone: "+91 98111 22334",
    email: "priya.sharma99@gmail.com",
    role: "student",
    enrolledCourseIds: ["course-2"],
    joinedDate: "18 Oct 2026",
    streakDays: 4
  },
  {
    id: "student-103",
    name: "Aman Gupta",
    phone: "+91 99222 33445",
    email: "amangupta.dev@gmail.com",
    role: "student",
    enrolledCourseIds: ["course-3"],
    joinedDate: "20 Oct 2026",
    streakDays: 9
  },
  {
    id: "student-104",
    name: "Vikas Yadav",
    phone: "+91 98333 44556",
    email: "vikas.yadav@gmail.com",
    role: "student",
    enrolledCourseIds: ["course-1", "course-2"],
    joinedDate: "22 Oct 2026",
    streakDays: 3
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
        question: "Agar do charges ke beech ki distance ko aadhi (r/2) kar diya jaye, toh unke beech electrostatic force kitna ho jayega?",
        options: ["2 times", "4 times", "Half (1/2)", "1/4th"],
        correctIndex: 1,
        explanation: "Coulomb's Law ke anusaar F ∝ 1/r^2 hota hai. Jab distance r/2 hogi, toh F' = 1/(r/2)^2 = 4F ho jayega (4 guna increase)."
      },
      {
        id: "q-2",
        question: "Electric flux ki SI Unit kya hoti hai?",
        options: ["N / C", "Volt × meter (V·m)", "Coulomb / meter", "Joule / Coulomb"],
        correctIndex: 1,
        explanation: "Electric flux Φ = E·A hota hai. E = V/m aur A = m^2, isliye unit Volt × meter (V·m) ya N·m^2/C hoti hai."
      },
      {
        id: "q-3",
        question: "Ek uniformly charged spherical shell ke andar electric field intensity kitni hoti hai?",
        options: ["Zero", "Infinity", "Surface ke barabar", "Distance ke proportional"],
        correctIndex: 0,
        explanation: "Gauss's law ke anusaar shell ke andar koi charge enclosed nahi hota (qin = 0), isliye E_inside = 0 hota hai."
      },
      {
        id: "q-4",
        question: "Electric dipole moment ki direction kya hoti hai?",
        options: ["Positive se Negative charge", "Negative se Positive charge", "Perpendicular to axis", "Random"],
        correctIndex: 1,
        explanation: "Physics convention ke mutabiq electric dipole moment vector p ki direction hamesha -q se +q ki taraf hoti hai."
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
        question: "Fe2O3 + 2Al -> Al2O3 + 2Fe - Ye kis prakar ki reaction hai?",
        options: ["Combination reaction", "Double displacement reaction", "Displacement reaction", "Decomposition reaction"],
        correctIndex: 2,
        explanation: "Aluminium, Iron (Fe) se zyada reactive hota hai isliye wo use displace kar deta hai. Isliye ye Displacement reaction hai."
      },
      {
        id: "q-202",
        question: "Respiration kis type ki reaction hoti hai?",
        options: ["Endothermic", "Exothermic", "Decomposition", "Neutralization"],
        correctIndex: 1,
        explanation: "Respiration mein glucose oxygen ke sath milkar carbon dioxide, water aur heat energy release karta hai, isliye ye Exothermic reaction hai."
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
    subject: "Full-Stack Dev",
    topic: "Next.js Server Actions & Database CRUD",
    faculty: "Rohan Singhania",
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
    title: "🔴 Aaj Shaam 7:00 PM: Electrostatics Live Numerical Masterclass",
    message: "Sabhi enrolled students time par join karein. Formula sheet sath lekar baithein.",
    category: "live_class",
    date: "Aaj",
    isPinned: true
  },
  {
    id: "ann-2",
    title: "📄 Physics Chapter 1 & 2 Handwritten Golden Notes Uploaded",
    message: "PDF Notes section mein jakar view aur download karein.",
    category: "notes_alert",
    date: "Kal",
    isPinned: true
  },
  {
    id: "ann-3",
    title: "🏆 Sunday Mega Mock Test Scheduled for Class 10 & 12",
    message: "Exam pattern ke exact format mein full length test paper Sunday 10 AM live hoga.",
    category: "exam_alert",
    date: "24 Oct 2026",
    isPinned: false
  }
];

export const INITIAL_ARTICLES: Article[] = [
  {
    id: "art-1",
    title: "Class 12th Physics me 95%+ Marks Kaise Layein? (Guruji's Proven Strategy)",
    excerpt: "NCERT derivations, formula flashcards aur previous 10 years papers solve karne ka right approach.",
    content: "Physics mein score karne ka sabse bada secret hai derivations ko bina dekhe 3 baar likhna. Formulas ke short notes har chapter ke start mein banayein...",
    author: "Guruji Alok Sharma",
    readTime: "4 min read",
    date: "20 Oct 2026",
    category: "Preparation Guide"
  },
  {
    id: "art-2",
    title: "Last 3 Months Revision Blueprint for Board & Competitive Exams",
    excerpt: "Time table kaise manage karein taaki burnout na ho aur syllabus 2 baar revise ho jaye.",
    content: "Roz 2 ghante revision aur 1 ghanta question practice ko fix karein. Naya topic padhne se pehle purane chapters ka 20 min quick recap karein...",
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
    review: "ICC KE GURUJI ke live lectures aur handwritten notes ne meri physics ki foundation itni strong kar di ki numericals easily solve hone lage!",
    rating: 5
  },
  {
    id: "test-2",
    studentName: "Sneha Mukherjee",
    examRank: "98.4% in CBSE Boards",
    examName: "Class 12 Boards",
    review: "24/7 AI Doubt solver raat ko padhai karte waqt bohot helpful tha. Kisi bhi formula ka step-by-step derivation turant mil jata tha.",
    rating: 5
  },
  {
    id: "test-3",
    studentName: "Mohit Chauhan",
    examRank: "Full Stack Engineer @ MNC",
    examName: "Web Dev Placement Batch",
    review: "Zero coding background se start kiya tha. Live screen share aur doubt clearing sessions ke karan aaj 12 LPA ki job crack hui.",
    rating: 5
  }
];

export const INITIAL_FAQS: FaqItem[] = [
  {
    id: "faq-1",
    question: "Payment karne ke baad course kab tak unlock hota hai?",
    answer: "Aap jaise hi UPI payment karke 12-digit UTR submit karte hain, Admin use verify karke 5-15 minute mein approve kar dete hain. Self-testing ke liye aap Admin panel se 1-Click mein approve kar sakte hain."
  },
  {
    id: "faq-2",
    question: "Agar live class miss ho jaye toh kya recording milti hai?",
    answer: "Haan! YouTube Live khatam hote hi lecture automatic recorded form mein aapke classroom me save ho jata hai jise aap kitni bhi baar revision ke liye dekh sakte hain."
  },
  {
    id: "faq-3",
    question: "AI Doubt Guruji kaise kaam karta hai?",
    answer: "Classroom ke andar AI Tutor 24/7 available rehta hai. Aap koi bhi formula, sawal ya theory ka doubt type karenge toh Guruji step-by-step Hindi/English mein samjhate hain."
  },
  {
    id: "faq-4",
    question: "Direct UPI QR payment ka kya fayda hai?",
    answer: "Direct UPI se 100% paise bina kisi payment gateway ke 2% commission karke seedha coaching bank account mein jate hain, jisse students ko affordable price par batch mil pata hai."
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
    description: "In 8 numericals ko solve karke step-by-step hand-written sheet upload ya text me answer likhein. Sign convention par vishesh dhyan dein."
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
    description: "Dipole on axial & equatorial line numericals along with short answer conceptual questions."
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
    description: "Standard NCERT Exemplar & Board PYQ problems. Simplify LHS to RHS cleanly."
  },
  {
    id: "dpp-4",
    courseId: "course-3",
    title: "Assignment 01: Interactive Counter with Tailwind CSS & LocalStorage",
    chapter: "Module 2: React Core Concepts",
    dueDate: "02 Nov 2026",
    totalMarks: 50,
    questionCount: 5,
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    description: "Create a React functional component using useState, useEffect and persist count across tab reloads."
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
    feedback: "Shabash Rahul! Bahut sundar calculation ki hai. Q4 ka vector unit dhyan rakhein, baki sab 100% perfect hai. Keep it up!",
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
    title: "Gauss Law non-symmetric closed surface par directly apply ho sakta hai kya?",
    question: "Guruji, agar closed surface cube ya sphere na hoke irregular shape ho, tab bhi kya total flux q_enclosed / epsilon_0 hi hoga? Ya geometry change hone se formula badal jayega?",
    tags: ["Electrostatics", "GaussLaw", "Class12"],
    createdAt: "Yesterday, 07:15 PM",
    upvotes: 14,
    isResolved: true,
    answers: [
      {
        id: "ans-1",
        authorName: "Er. Alok Sharma (ICC KE GURUJI)",
        authorRole: "guruji",
        text: "Bahut accha sawal beta! Gauss Law ka basic principle geometry-independent hai. Total flux hamesha q_in / epsilon_0 hi rahega chahe surface ka shape kaisa bhi ho! Bas electric field E calculate karne ke liye hume symmetry chahiye hoti hai.",
        createdAt: "Yesterday, 08:00 PM",
        upvotes: 21
      },
      {
        id: "ans-2",
        authorName: "Rahul Kumar",
        authorRole: "student",
        text: "Thanks Guruji! Mujhe bhi isme confusion tha, ab clear ho gaya.",
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
    title: "Trigonometric identities me (1 + tan^2 theta) wale questions solve karne ki trick?",
    question: "Jab questions me tan theta aur sec theta dono mix hote hain to LHS se RHS jane me steps lengthy ho jate hain. Koi quick simplification method hai?",
    tags: ["Maths", "Class10", "Trigonometry"],
    createdAt: "2 days ago",
    upvotes: 8,
    isResolved: true,
    answers: [
      {
        id: "ans-3",
        authorName: "Neha Verma (ICC KE GURUJI)",
        authorRole: "guruji",
        text: "Golden Rule beta: Hamesha check karo kya identity sec²θ - tan²θ = (secθ - tanθ)(secθ + tanθ) = 1 factorize ho sakti hai? 90% Board questions is factorization se 2 line me solve ho jate hain!",
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
    instructorName: "Er. Alok Sharma (IIT Kanpur) • ICC KE GURUJI"
  }
];

// Storage keys
const STORAGE_KEYS = {
  COURSES: 'coaching_courses_v5',
  LESSONS: 'coaching_lessons_v5',
  NOTES: 'coaching_notes_v5',
  PAYMENTS: 'coaching_payments_v5',
  CONFIG: 'coaching_config_v5',
  USER: 'coaching_user_v5',
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
}

export const getStoredData = (): StoredData => {
  if (typeof window === 'undefined') {
    return {
      courses: INITIAL_COURSES,
      lessons: INITIAL_LESSONS,
      notes: INITIAL_NOTES,
      payments: INITIAL_PAYMENTS,
      config: DEFAULT_CONFIG,
      user: INITIAL_USER,
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
    };
  }

  try {
    const courses: Course[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.COURSES) || 'null') || INITIAL_COURSES;
    const lessons: Lesson[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.LESSONS) || 'null') || INITIAL_LESSONS;
    const notes: PdfNote[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTES) || 'null') || INITIAL_NOTES;
    const payments: PaymentRequest[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PAYMENTS) || 'null') || INITIAL_PAYMENTS;
    const rawConfig = JSON.parse(localStorage.getItem(STORAGE_KEYS.CONFIG) || 'null');
    const config: CoachingConfig = rawConfig ? { ...DEFAULT_CONFIG, ...rawConfig } : DEFAULT_CONFIG;
    const user: User = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || 'null') || INITIAL_USER;
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
    };
  } catch (err) {
    console.error("Storage error:", err);
    return {
      courses: INITIAL_COURSES,
      lessons: INITIAL_LESSONS,
      notes: INITIAL_NOTES,
      payments: INITIAL_PAYMENTS,
      config: DEFAULT_CONFIG,
      user: INITIAL_USER,
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

