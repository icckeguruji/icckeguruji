'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  CreditCard,
  BookOpen,
  Radio,
  FileText,
  Users,
  PenTool,
  Send,
  Settings,
  Plus,
  Check,
  X,
  Clock,
  AlertCircle,
  ExternalLink,
  Trash2,
  Bell,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  Search,
  Menu,
  GraduationCap,
  Award,
  Calendar,
  CheckCircle2,
  Download,
  Pencil,
  Star,
  Eye,
  Mail,
  Copy,
  Loader2,
  Image as ImageIcon,
  Globe,
  MapPin,
  Phone,
  Share2,
  UserCheck
} from 'lucide-react';
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
  QuizQuestion,
  TimetableSlot,
  DppAssignment,
  DppSubmission,
  PyqPaper,
  CommunityPost
} from '@/types';
import { getStoredData, saveStoredData } from '@/lib/storage';
import Logo from '@/components/Logo';
import WhatsAppBotHub from '@/components/WhatsAppBotHub';
import MobileBottomNav from '@/components/MobileBottomNav';
import { GOOGLE_APPS_SCRIPT_CODE } from '@/lib/gasScript';
import AttendanceManager from '@/components/AttendanceManager';
import FeeRegisterManager from '@/components/FeeRegisterManager';
import WeeklyTestManager from '@/components/WeeklyTestManager';
import TeacherManager from '@/components/TeacherManager';
import TeacherAttendanceManager from '@/components/TeacherAttendanceManager';
import AiFormFiller from '@/components/AiFormFiller';
import AiWebsiteCustomizer from '@/components/AiWebsiteCustomizer';

const emptySubscribe = () => () => {};
const getClientToday = () => new Date().toISOString().split('T')[0];
const getServerToday = () => '';

function AdminDashboardContent() {
  const [data, setData] = useState(getStoredData());
  const [currentUser, setCurrentUser] = useState<User>(data.user);
  
  // Left Sidebar active tab
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'attendance'
    | 'fees'
    | 'weekly_tests'
    | 'teachers'
    | 'teacher_attendance'
    | 'students'
    | 'courses'
    | 'lectures'
    | 'notes'
    | 'dpp'
    | 'pyq'
    | 'timetable'
    | 'notices'
    | 'settings'
    | 'payments'
    | 'cms'
    | 'forum'
    | 'quizzes'
    | 'whatsapp'
    | 'broadcast'
  >('overview');

  // CMS Sub-tabs: 'hero' | 'daily_quiz' | 'announcements' | 'articles' | 'testimonials' | 'faqs'
  const [cmsSubTab, setCmsSubTab] = useState<'hero' | 'daily_quiz' | 'announcements' | 'articles' | 'testimonials' | 'faqs'>('hero');

  // Mobile sidebar drawer
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Editing state for full CMS management
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingLecture, setEditingLecture] = useState<Lesson | null>(null);
  const [editingNote, setEditingNote] = useState<PdfNote | null>(null);
  const [editingTimetableSlot, setEditingTimetableSlot] = useState<TimetableSlot | null>(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);

  // New CRUD states for Students
  const [editingStudent, setEditingStudent] = useState<User | null>(null);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [newStudent, setNewStudent] = useState({
    name: '',
    phone: '',
    email: '',
    password: 'student123',
    enrolledCourseIds: [data.courses[0]?.id || 'course-1'],
    streakDays: 5,
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    address: 'Station Road, Ward No. 4, Bihar',
    fatherName: '',
    classGrade: 'Class 12 - PCM Foundation',
    monthlyFee: 1000,
    rollNo: '',
  });

  // New CRUD states for Quizzes
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [isAddingQuiz, setIsAddingQuiz] = useState(false);
  const [newQuizMeta, setNewQuizMeta] = useState({
    courseId: data.courses[0]?.id || 'course-1',
    title: '',
    chapter: '',
    durationMinutes: 30,
    totalMarks: 20,
  });
  const [editingQuizQuestion, setEditingQuizQuestion] = useState<{ quizId: string; question: QuizQuestion } | null>(null);

  // New CRUD states for DPP, PYQ, Forum, Payments
  const [editingDpp, setEditingDpp] = useState<DppAssignment | null>(null);
  const [editingPyq, setEditingPyq] = useState<PyqPaper | null>(null);
  const [editingPost, setEditingPost] = useState<CommunityPost | null>(null);
  const [isAddingPost, setIsAddingPost] = useState(false);
  const [newPost, setNewPost] = useState({
    courseId: data.courses[0]?.id || 'course-1',
    title: '',
    question: '',
    tags: 'Physics, Numericals',
  });
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [newManualPayment, setNewManualPayment] = useState({
    studentName: '',
    studentPhone: '',
    studentEmail: '',
    courseId: data.courses[0]?.id || 'course-1',
    amount: data.courses[0]?.price || 999,
    paymentMode: 'Cash / Offline',
    utrNumber: '',
  });

  // Homepage Daily Quiz CMS form state
  const [homeQuizForm, setHomeQuizForm] = useState({
    question: data.config.homeQuizQuestion || "If the distance between two static point charges is halved (r/2), what happens to the electrostatic force between them?",
    optionA: data.config.homeQuizOptions?.[0] || 'Double (2x)',
    optionB: data.config.homeQuizOptions?.[1] || '4 Times (4x)',
    optionC: data.config.homeQuizOptions?.[2] || 'Half (0.5x)',
    optionD: data.config.homeQuizOptions?.[3] || 'One-Fourth (0.25x)',
    correctIndex: data.config.homeQuizCorrectIndex ?? 1,
    explanation: data.config.homeQuizExplanation || "Correct Answer: B (4 Times)! According to Coulomb's Law, F ∝ 1/r². When distance is halved (r/2), the force increases by a factor of 4. Comprehensive chapter-wise mock tests and drills are included in all batches!",
  });
  const [homeQuizSaved, setHomeQuizSaved] = useState(false);

  // Forms state
  const [newCourse, setNewCourse] = useState({
    title: '',
    subtitle: '',
    category: 'Competitive Exams',
    price: 999,
    originalPrice: 2999,
    instructorName: 'Er. Alok Sharma',
    duration: '3 Months',
    description: '',
  });

  const [newLecture, setNewLecture] = useState({
    courseId: data.courses[0]?.id || 'course-1',
    title: '',
    youtubeId: '',
    isLive: true,
    scheduledAt: 'Today at 7:00 PM',
    duration: '1 hr 30 min',
    chapterNumber: 1,
    description: '',
  });

  const [newNote, setNewNote] = useState({
    courseId: data.courses[0]?.id || 'course-1',
    title: '',
    description: '',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileSize: '4.5 MB',
    pageCount: 20,
  });

  // Quiz: Add question state
  const [newQuizQ, setNewQuizQ] = useState({
    quizId: data.quizzes[0]?.id || 'quiz-1',
    question: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctIndex: 0,
    explanation: '',
  });

  // Timetable: Add slot state
  const [newSlot, setNewSlot] = useState<Omit<TimetableSlot, 'id'>>({
    day: 'Monday',
    time: '07:00 PM - 08:30 PM',
    subject: 'Class 12 Physics',
    topic: '',
    faculty: 'Er. Alok Sharma',
    isLiveNow: false,
    courseId: 'course-1',
  });

  // CMS: New Announcement form
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    message: '',
    category: 'live_class' as Announcement['category'],
    isPinned: true,
  });

  // CMS: New Article form
  const [newArticle, setNewArticle] = useState({
    title: '',
    excerpt: '',
    content: '',
    author: 'Guruji',
    readTime: '4 min read',
    category: 'Preparation Guide',
  });

  // CMS: New Testimonial form
  const [newTestimonial, setNewTestimonial] = useState({
    studentName: '',
    examRank: '',
    examName: '',
    review: '',
    rating: 5,
  });

  // CMS: New FAQ form
  const [newFaq, setNewFaq] = useState({
    question: '',
    answer: '',
  });

  // Broadcast alert state
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastSent, setBroadcastSent] = useState(false);

  // Settings form
  const [configForm, setConfigForm] = useState<CoachingConfig>(data.config);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [copyGasSuccess, setCopyGasSuccess] = useState(false);
  const [testEmailLoading, setTestEmailLoading] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<{ success: boolean; message: string } | null>(null);

  // DPP Management state
  const [gradingSubmission, setGradingSubmission] = useState<DppSubmission | null>(null);
  const [marksInput, setMarksInput] = useState<number>(18);
  const [feedbackInput, setFeedbackInput] = useState<string>('Well done! Excellent effort and neat steps.');
  const [newDpp, setNewDpp] = useState({
    courseId: data.courses[0]?.id || 'course-1',
    title: '',
    chapter: '',
    dueDate: '30 Oct 2026',
    totalMarks: 20,
    questionCount: 8,
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    description: '',
  });

  // PYQ Management state
  const [newPyq, setNewPyq] = useState({
    title: '',
    exam: 'Class 12 Board',
    year: '2024',
    subject: 'Physics',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    solutionPdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileSize: '4.5 MB',
  });

  // Forum Reply state
  const [adminForumReplies, setAdminForumReplies] = useState<Record<string, string>>({});

  const refreshState = () => {
    const fresh = getStoredData();
    setData(fresh);
    setCurrentUser(fresh.user);
    setConfigForm(fresh.config);
  };

  const todayStr = React.useSyncExternalStore(emptySubscribe, getClientToday, getServerToday);

  useEffect(() => {
    const handleStorageUpdate = () => refreshState();
    window.addEventListener('coaching_storage_updated', handleStorageUpdate);
    return () => window.removeEventListener('coaching_storage_updated', handleStorageUpdate);
  }, []);

  useEffect(() => {
    if (data.config?.faviconUrl) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'shortcut icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = data.config.faviconUrl;
    }
  }, [data.config?.faviconUrl]);

  // 1-Click Approve UPI Payment
  const handleApprovePayment = (payment: PaymentRequest) => {
    const updatedPayments = data.payments.map((p: PaymentRequest) =>
      p.id === payment.id ? { ...p, status: 'approved' as const, updatedAt: new Date().toISOString() } : p
    );

    let updatedUser = { ...data.user };
    if (data.user.id === payment.userId || data.user.phone === payment.userPhone) {
      updatedUser = {
        ...data.user,
        enrolledCourseIds: Array.from(new Set([...data.user.enrolledCourseIds, payment.courseId]))
      };
      saveStoredData('USER', updatedUser);
    }

    const updatedStudents = data.students.map((s) => {
      if (s.id === payment.userId || s.phone === payment.userPhone) {
        return {
          ...s,
          enrolledCourseIds: Array.from(new Set([...s.enrolledCourseIds, payment.courseId]))
        };
      }
      return s;
    });
    saveStoredData('STUDENTS', updatedStudents);

    saveStoredData('PAYMENTS', updatedPayments);

    // Send email receipt & classroom link to student
    const studentObj = data.students.find((s) => s.id === payment.userId || s.phone === payment.userPhone);
    const targetEmail = payment.userEmail || studentObj?.email;
    if (targetEmail) {
      fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'payment_approved',
          to: targetEmail,
          studentName: payment.userName,
          courseTitle: payment.courseTitle,
          classroomLink: typeof window !== 'undefined' ? `${window.location.origin}/course/${payment.courseId}` : `https://icckeguruji.vercel.app/course/${payment.courseId}`,
        }),
      }).catch((emailErr) => console.warn('Student approval email failed:', emailErr));
    }

    refreshState();
  };

  // Reject UPI Payment
  const handleRejectPayment = (paymentId: string) => {
    const updatedPayments = data.payments.map((p: PaymentRequest) =>
      p.id === paymentId ? { ...p, status: 'rejected' as const, updatedAt: new Date().toISOString() } : p
    );
    saveStoredData('PAYMENTS', updatedPayments);
    refreshState();
  };

  // Toggle student enrollment manually
  const handleToggleStudentCourse = (studentId: string, courseId: string) => {
    const updatedStudents = data.students.map((s) => {
      if (s.id === studentId) {
        const isEnrolled = s.enrolledCourseIds.includes(courseId);
        const updatedCourseIds = isEnrolled
          ? s.enrolledCourseIds.filter((id) => id !== courseId)
          : [...s.enrolledCourseIds, courseId];
        return { ...s, enrolledCourseIds: updatedCourseIds };
      }
      return s;
    });

    saveStoredData('STUDENTS', updatedStudents);

    if (currentUser.id === studentId) {
      const student = updatedStudents.find((s) => s.id === studentId);
      if (student) {
        saveStoredData('USER', student);
      }
    }
    refreshState();
  };

  // Add Course
  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourse.title.trim()) return;

    const courseObj: Course = {
      id: `course-${Date.now()}`,
      title: newCourse.title,
      subtitle: newCourse.subtitle,
      description: newCourse.description || newCourse.subtitle,
      category: newCourse.category,
      price: Number(newCourse.price),
      originalPrice: Number(newCourse.originalPrice),
      thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
      instructorName: newCourse.instructorName,
      instructorRole: 'Lead Mentor',
      language: 'Hinglish',
      duration: newCourse.duration,
      features: [
        'Live YouTube Interactive Lectures',
        'Formula Sheet & Chapter Notes',
        '24/7 AI Guruji Doubt Access',
        'Paid Telegram Community Link'
      ],
      lessonsCount: 1,
      notesCount: 1,
    };

    saveStoredData('COURSES', [courseObj, ...data.courses]);
    setNewCourse({
      title: '',
      subtitle: '',
      category: 'Competitive Exams',
      price: 999,
      originalPrice: 2999,
      instructorName: 'Er. Alok Sharma',
      duration: '3 Months',
      description: '',
    });
    refreshState();
  };

  // Update Course
  const handleUpdateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;
    const updated = data.courses.map((c) => (c.id === editingCourse.id ? editingCourse : c));
    saveStoredData('COURSES', updated);
    setEditingCourse(null);
    refreshState();
  };

  // Delete Course
  const handleDeleteCourse = (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    const updated = data.courses.filter((c) => c.id !== courseId);
    saveStoredData('COURSES', updated);
    refreshState();
  };

  // Toggle Bestseller / Popular
  const handleTogglePopular = (courseId: string) => {
    const updated = data.courses.map((c) =>
      c.id === courseId ? { ...c, isPopular: !c.isPopular } : c
    );
    saveStoredData('COURSES', updated);
    refreshState();
  };

  // Add Lecture
  const handleCreateLecture = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLecture.title.trim() || !newLecture.youtubeId.trim()) return;

    let cleanYtId = newLecture.youtubeId.trim();
    if (cleanYtId.includes('v=')) {
      cleanYtId = cleanYtId.split('v=')[1].split('&')[0];
    } else if (cleanYtId.includes('youtu.be/')) {
      cleanYtId = cleanYtId.split('youtu.be/')[1].split('?')[0];
    } else if (cleanYtId.includes('live/')) {
      cleanYtId = cleanYtId.split('live/')[1].split('?')[0];
    }

    const lessonObj: Lesson = {
      id: `les-${Date.now()}`,
      courseId: newLecture.courseId,
      title: newLecture.title,
      description: newLecture.description || 'Topic deep dive with live interactive doubts.',
      youtubeId: cleanYtId,
      isLive: newLecture.isLive,
      scheduledAt: newLecture.scheduledAt,
      duration: newLecture.duration,
      chapterNumber: Number(newLecture.chapterNumber),
    };

    saveStoredData('LESSONS', [lessonObj, ...data.lessons]);
    setNewLecture({
      courseId: data.courses[0]?.id || 'course-1',
      title: '',
      youtubeId: '',
      isLive: true,
      scheduledAt: 'Today at 7:00 PM',
      duration: '1 hr 30 min',
      chapterNumber: 1,
      description: '',
    });
    refreshState();
  };

  // Toggle Lecture Live Now status
  const handleToggleLectureLive = (lessonId: string) => {
    const updated = data.lessons.map((les) =>
      les.id === lessonId ? { ...les, isLive: !les.isLive } : les
    );
    saveStoredData('LESSONS', updated);
    refreshState();
  };

  // Update Lecture
  const handleUpdateLecture = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLecture) return;
    let cleanYtId = editingLecture.youtubeId.trim();
    if (cleanYtId.includes('v=')) {
      cleanYtId = cleanYtId.split('v=')[1].split('&')[0];
    } else if (cleanYtId.includes('youtu.be/')) {
      cleanYtId = cleanYtId.split('youtu.be/')[1].split('?')[0];
    } else if (cleanYtId.includes('live/')) {
      cleanYtId = cleanYtId.split('live/')[1].split('?')[0];
    }
    const updated = data.lessons.map((les) =>
      les.id === editingLecture.id ? { ...editingLecture, youtubeId: cleanYtId } : les
    );
    saveStoredData('LESSONS', updated);
    setEditingLecture(null);
    refreshState();
  };

  // Delete Lecture
  const handleDeleteLecture = (lessonId: string) => {
    if (!confirm('Are you sure you want to delete this lecture?')) return;
    const updated = data.lessons.filter((les) => les.id !== lessonId);
    saveStoredData('LESSONS', updated);
    refreshState();
  };

  // Add Note
  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.title.trim()) return;

    const noteObj: PdfNote = {
      id: `note-${Date.now()}`,
      courseId: newNote.courseId,
      title: newNote.title,
      description: newNote.description || 'Complete chapter study material with solved problems.',
      fileUrl: newNote.fileUrl,
      fileSize: newNote.fileSize,
      pageCount: Number(newNote.pageCount),
      uploadedAt: 'Today',
    };

    saveStoredData('NOTES', [noteObj, ...data.notes]);
    setNewNote({
      courseId: data.courses[0]?.id || 'course-1',
      title: '',
      description: '',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileSize: '4.5 MB',
      pageCount: 20,
    });
    refreshState();
  };

  // Update Note
  const handleUpdateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNote) return;
    const updated = data.notes.map((n) => (n.id === editingNote.id ? editingNote : n));
    saveStoredData('NOTES', updated);
    setEditingNote(null);
    refreshState();
  };

  // Delete Note
  const handleDeleteNote = (noteId: string) => {
    if (!confirm('Are you sure you want to delete this PDF note?')) return;
    const updated = data.notes.filter((n) => n.id !== noteId);
    saveStoredData('NOTES', updated);
    refreshState();
  };

  // Add Quiz Question
  const handleAddQuizQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuizQ.question.trim() || !newQuizQ.optionA.trim() || !newQuizQ.optionB.trim()) return;

    const updatedQuizzes = data.quizzes.map((q) => {
      if (q.id === newQuizQ.quizId) {
        const newQuestionObj = {
          id: `q-${Date.now()}`,
          question: newQuizQ.question,
          options: [newQuizQ.optionA, newQuizQ.optionB, newQuizQ.optionC || 'Option C', newQuizQ.optionD || 'Option D'],
          correctIndex: Number(newQuizQ.correctIndex),
          explanation: newQuizQ.explanation || 'Verified answer by Guruji.',
        };
        return {
          ...q,
          questions: [...q.questions, newQuestionObj],
          totalMarks: q.totalMarks + 5,
        };
      }
      return q;
    });

    saveStoredData('QUIZZES', updatedQuizzes);
    setNewQuizQ({
      quizId: data.quizzes[0]?.id || 'quiz-1',
      question: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctIndex: 0,
      explanation: '',
    });
    refreshState();
  };

  // Add Timetable Slot
  const handleAddTimetableSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlot.topic.trim()) return;

    const slotObj: TimetableSlot = {
      ...newSlot,
      id: `tt-${Date.now()}`,
    };

    saveStoredData('TIMETABLE', [...data.timetable, slotObj]);
    setNewSlot({
      day: 'Monday',
      time: '07:00 PM - 08:30 PM',
      subject: 'Class 12 Physics',
      topic: '',
      faculty: 'Er. Alok Sharma',
      isLiveNow: false,
      courseId: 'course-1',
    });
    refreshState();
  };

  // Toggle Timetable slot Live Now
  const handleToggleTimetableLive = (slotId: string) => {
    const updated = data.timetable.map((s) =>
      s.id === slotId ? { ...s, isLiveNow: !s.isLiveNow } : s
    );
    saveStoredData('TIMETABLE', updated);
    refreshState();
  };

  // Update Timetable slot
  const handleUpdateTimetableSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTimetableSlot) return;
    const updated = data.timetable.map((s) => (s.id === editingTimetableSlot.id ? editingTimetableSlot : s));
    saveStoredData('TIMETABLE', updated);
    setEditingTimetableSlot(null);
    refreshState();
  };

  // Delete Timetable slot
  const handleDeleteTimetableSlot = (slotId: string) => {
    if (!confirm('Are you sure you want to delete this timetable slot?')) return;
    const updated = data.timetable.filter((s) => s.id !== slotId);
    saveStoredData('TIMETABLE', updated);
    refreshState();
  };

  // CMS: Add Announcement
  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncement.title.trim()) return;

    const annObj: Announcement = {
      id: `ann-${Date.now()}`,
      title: newAnnouncement.title,
      message: newAnnouncement.message,
      category: newAnnouncement.category,
      date: 'Just now',
      isPinned: newAnnouncement.isPinned,
    };

    saveStoredData('ANNOUNCEMENTS', [annObj, ...data.announcements]);
    setNewAnnouncement({
      title: '',
      message: '',
      category: 'live_class',
      isPinned: true,
    });
    refreshState();
  };

  // Toggle Pin Announcement
  const handleTogglePinAnnouncement = (annId: string) => {
    const updated = data.announcements.map((a) =>
      a.id === annId ? { ...a, isPinned: !a.isPinned } : a
    );
    saveStoredData('ANNOUNCEMENTS', updated);
    refreshState();
  };

  // Update Announcement
  const handleUpdateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnnouncement) return;
    const updated = data.announcements.map((a) =>
      a.id === editingAnnouncement.id ? editingAnnouncement : a
    );
    saveStoredData('ANNOUNCEMENTS', updated);
    setEditingAnnouncement(null);
    refreshState();
  };

  // Delete Announcement
  const handleDeleteAnnouncement = (annId: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    const updated = data.announcements.filter((a) => a.id !== annId);
    saveStoredData('ANNOUNCEMENTS', updated);
    refreshState();
  };

  // CMS: Add Article
  const handleCreateArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArticle.title.trim()) return;

    const artObj: Article = {
      id: `art-${Date.now()}`,
      title: newArticle.title,
      excerpt: newArticle.excerpt,
      content: newArticle.content,
      author: newArticle.author,
      readTime: newArticle.readTime,
      date: 'Today',
      category: newArticle.category,
    };

    saveStoredData('ARTICLES', [artObj, ...data.articles]);
    setNewArticle({
      title: '',
      excerpt: '',
      content: '',
      author: 'Guruji',
      readTime: '4 min read',
      category: 'Preparation Guide',
    });
    refreshState();
  };

  // Update Article
  const handleUpdateArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle) return;
    const updated = data.articles.map((a) =>
      a.id === editingArticle.id ? editingArticle : a
    );
    saveStoredData('ARTICLES', updated);
    setEditingArticle(null);
    refreshState();
  };

  // Delete Article
  const handleDeleteArticle = (articleId: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    const updated = data.articles.filter((a) => a.id !== articleId);
    saveStoredData('ARTICLES', updated);
    refreshState();
  };

  // CMS: Add Testimonial
  const handleCreateTestimonial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTestimonial.studentName.trim()) return;

    const testObj: Testimonial = {
      id: `test-${Date.now()}`,
      studentName: newTestimonial.studentName,
      examRank: newTestimonial.examRank,
      examName: newTestimonial.examName,
      review: newTestimonial.review,
      rating: Number(newTestimonial.rating),
    };

    saveStoredData('TESTIMONIALS', [testObj, ...data.testimonials]);
    setNewTestimonial({
      studentName: '',
      examRank: '',
      examName: '',
      review: '',
      rating: 5,
    });
    refreshState();
  };

  // Update Testimonial
  const handleUpdateTestimonial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTestimonial) return;
    const updated = data.testimonials.map((t) =>
      t.id === editingTestimonial.id ? editingTestimonial : t
    );
    saveStoredData('TESTIMONIALS', updated);
    setEditingTestimonial(null);
    refreshState();
  };

  // Delete Testimonial
  const handleDeleteTestimonial = (testimonialId: string) => {
    if (!confirm('Are you sure you want to delete this student review?')) return;
    const updated = data.testimonials.filter((t) => t.id !== testimonialId);
    saveStoredData('TESTIMONIALS', updated);
    refreshState();
  };

  // CMS: Add FAQ
  const handleCreateFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaq.question.trim()) return;

    const faqObj: FaqItem = {
      id: `faq-${Date.now()}`,
      question: newFaq.question,
      answer: newFaq.answer,
    };

    saveStoredData('FAQS', [faqObj, ...data.faqs]);
    setNewFaq({
      question: '',
      answer: '',
    });
    refreshState();
  };

  // Update FAQ
  const handleUpdateFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaq) return;
    const updated = data.faqs.map((f) =>
      f.id === editingFaq.id ? editingFaq : f
    );
    saveStoredData('FAQS', updated);
    setEditingFaq(null);
    refreshState();
  };

  // Delete FAQ
  const handleDeleteFaq = (faqId: string) => {
    if (!confirm('Are you sure you want to delete this FAQ item?')) return;
    const updated = data.faqs.filter((f) => f.id !== faqId);
    saveStoredData('FAQS', updated);
    refreshState();
  };

  // CMS: Save Homepage Daily Practice Quiz
  const handleSaveHomeQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedConfig: CoachingConfig = {
      ...configForm,
      homeQuizQuestion: homeQuizForm.question,
      homeQuizOptions: [homeQuizForm.optionA, homeQuizForm.optionB, homeQuizForm.optionC, homeQuizForm.optionD],
      homeQuizCorrectIndex: Number(homeQuizForm.correctIndex),
      homeQuizExplanation: homeQuizForm.explanation,
    };
    setConfigForm(updatedConfig);
    saveStoredData('CONFIG', updatedConfig);
    setHomeQuizSaved(true);
    setTimeout(() => setHomeQuizSaved(false), 2500);
    refreshState();
  };

  // CMS: Save Homepage Hero, Branding & Stats
  const handleSaveHeroBranding = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredData('CONFIG', configForm);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
    refreshState();
  };

  // Broadcast Alert trigger
  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMsg.trim()) return;

    const annObj: Announcement = {
      id: `ann-${Date.now()}`,
      title: broadcastMsg.slice(0, 50),
      message: broadcastMsg,
      category: 'live_class',
      date: 'Just now',
      isPinned: true,
    };

    saveStoredData('ANNOUNCEMENTS', [annObj, ...data.announcements]);

    setBroadcastSent(true);
    setTimeout(() => setBroadcastSent(false), 3000);
    setBroadcastMsg('');
    refreshState();
  };

  // Save Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredData('CONFIG', configForm);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
    refreshState();
  };

  // Copy Google Apps Script Code
  const handleCopyGasScript = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
      setCopyGasSuccess(true);
      setTimeout(() => setCopyGasSuccess(false), 2500);
    }
  };

  // Send Test Email via Google Apps Script Webhook
  const handleTestEmail = async () => {
    setTestEmailLoading(true);
    setTestEmailResult(null);
    try {
      const res = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'test',
          to: configForm.contactEmail || 'admin@icckeguruji.com',
          customUrl: configForm.googleAppsScriptEmailUrl || ''
        })
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setTestEmailResult({
          success: true,
          message: result.via === 'google-apps-script'
            ? `✅ Test email successfully sent to ${configForm.contactEmail || 'admin@icckeguruji.com'} via Google Apps Script (Gmail)!`
            : `⚠️ Webhook URL is not configured (Simulator Mode). Paste and save your script.new Web App URL to dispatch real emails.`
        });
      } else {
        setTestEmailResult({
          success: false,
          message: result.error || 'Failed to send test email'
        });
      }
    } catch (err: unknown) {
      setTestEmailResult({
        success: false,
        message: err instanceof Error ? err.message : 'Error sending email'
      });
    } finally {
      setTestEmailLoading(false);
    }
  };

  // DPP Handlers
  const handleGradeSubmission = (subId: string) => {
    const updated = (data.dppSubmissions || []).map((s) => {
      if (s.id === subId) {
        return {
          ...s,
          status: 'graded' as const,
          marksAwarded: Number(marksInput),
          feedback: feedbackInput.trim() || 'Checked by Guruji.',
        };
      }
      return s;
    });
    saveStoredData('DPP_SUBMISSIONS', updated);
    setGradingSubmission(null);
    refreshState();
  };

  const handleCreateDpp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDpp.title.trim()) return;

    const dppObj: DppAssignment = {
      id: `dpp-${Date.now()}`,
      courseId: newDpp.courseId,
      title: newDpp.title.trim(),
      chapter: newDpp.chapter.trim() || 'Chapter Exercise',
      dueDate: newDpp.dueDate,
      totalMarks: Number(newDpp.totalMarks),
      questionCount: Number(newDpp.questionCount),
      pdfUrl: newDpp.pdfUrl,
      description: newDpp.description.trim() || 'Solve numericals step-by-step.',
    };

    saveStoredData('DPPS', [dppObj, ...(data.dpps || [])]);
    setNewDpp({
      courseId: data.courses[0]?.id || 'course-1',
      title: '',
      chapter: '',
      dueDate: '30 Oct 2026',
      totalMarks: 20,
      questionCount: 8,
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      description: '',
    });
    refreshState();
  };

  const handleDeleteDpp = (id: string) => {
    if (!confirm('Are you sure you want to delete this DPP?')) return;
    const updated = (data.dpps || []).filter((d) => d.id !== id);
    saveStoredData('DPPS', updated);
    refreshState();
  };

  // PYQ Handlers
  const handleCreatePyq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPyq.title.trim()) return;

    const pyqObj: PyqPaper = {
      id: `pyq-${Date.now()}`,
      title: newPyq.title.trim(),
      exam: newPyq.exam,
      year: newPyq.year,
      subject: newPyq.subject,
      pdfUrl: newPyq.pdfUrl,
      solutionPdfUrl: newPyq.solutionPdfUrl,
      downloadsCount: 1,
      fileSize: newPyq.fileSize,
    };

    saveStoredData('PYQS', [pyqObj, ...(data.pyqPapers || [])]);
    setNewPyq({
      title: '',
      exam: 'Class 12 Board',
      year: '2024',
      subject: 'Physics',
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      solutionPdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileSize: '4.5 MB',
    });
    refreshState();
  };

  const handleDeletePyq = (id: string) => {
    if (!confirm('Are you sure you want to delete this PYQ paper?')) return;
    const updated = (data.pyqPapers || []).filter((p) => p.id !== id);
    saveStoredData('PYQS', updated);
    refreshState();
  };

  // Forum Handlers
  const handleAdminReplyForum = (postId: string) => {
    const text = adminForumReplies[postId];
    if (!text || !text.trim()) return;

    const updated = (data.communityPosts || []).map((p) => {
      if (p.id === postId) {
        return {
          ...p,
          isResolved: true,
          answers: [
            ...p.answers,
            {
              id: `ans-${Date.now()}`,
              authorName: 'Er. Alok Sharma (ICC KE GURUJI)',
              authorRole: 'guruji' as const,
              text: text.trim(),
              createdAt: 'Just now',
              upvotes: 0,
            },
          ],
        };
      }
      return p;
    });

    saveStoredData('COMMUNITY_POSTS', updated);
    setAdminForumReplies({ ...adminForumReplies, [postId]: '' });
    refreshState();
  };

  // DPP Update Handler
  const handleUpdateDpp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDpp) return;
    const updated = (data.dpps || []).map((d) => (d.id === editingDpp.id ? editingDpp : d));
    saveStoredData('DPPS', updated);
    setEditingDpp(null);
    refreshState();
  };

  // PYQ Update Handler
  const handleUpdatePyq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPyq) return;
    const updated = (data.pyqPapers || []).map((p) => (p.id === editingPyq.id ? editingPyq : p));
    saveStoredData('PYQS', updated);
    setEditingPyq(null);
    refreshState();
  };

  // Student CRUD Handlers
  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name.trim() || !newStudent.phone.trim()) return;

    const studentObj: User = {
      id: `user-${Date.now()}`,
      rollNo: newStudent.rollNo.trim() || `ICC-${100 + data.students.length + 1}`,
      name: newStudent.name.trim(),
      phone: newStudent.phone.trim(),
      email: newStudent.email.trim() || `${newStudent.phone.trim()}@student.local`,
      password: newStudent.password.trim() || 'student123',
      role: 'student',
      enrolledCourseIds: newStudent.enrolledCourseIds,
      joinedDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      streakDays: Number(newStudent.streakDays) || 1,
      avatar: newStudent.avatar.trim() || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
      address: newStudent.address.trim() || 'Station Road, Ward No. 4, Bihar',
      fatherName: newStudent.fatherName.trim() || '',
      classGrade: newStudent.classGrade.trim() || 'Class 12 - PCM Foundation',
      monthlyFee: Number(newStudent.monthlyFee) || 1000,
      feesDue: 0
    };

    saveStoredData('STUDENTS', [studentObj, ...data.students]);
    setIsAddingStudent(false);
    setNewStudent({
      name: '',
      phone: '',
      email: '',
      password: 'student123',
      enrolledCourseIds: [data.courses[0]?.id || 'course-1'],
      streakDays: 5,
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
      address: 'Station Road, Ward No. 4, Bihar',
      fatherName: '',
      classGrade: 'Class 12 - PCM Foundation',
      monthlyFee: 1000,
      rollNo: '',
    });
    refreshState();
  };

  const handleUpdateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    const updated = data.students.map((s) => (s.id === editingStudent.id ? editingStudent : s));
    saveStoredData('STUDENTS', updated);
    if (currentUser.id === editingStudent.id) {
      saveStoredData('USER', editingStudent);
    }
    setEditingStudent(null);
    refreshState();
  };

  const handleDeleteStudent = (studentId: string) => {
    if (!confirm('Are you sure you want to permanently delete this student?')) return;
    const updated = data.students.filter((s) => s.id !== studentId);
    saveStoredData('STUDENTS', updated);
    refreshState();
  };

  // Quiz / Mock Test CRUD Handlers
  const handleCreateQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuizMeta.title.trim()) return;

    const quizObj: Quiz = {
      id: `quiz-${Date.now()}`,
      courseId: newQuizMeta.courseId,
      title: newQuizMeta.title.trim(),
      chapter: newQuizMeta.chapter.trim() || 'Chapter Test',
      durationMinutes: Number(newQuizMeta.durationMinutes) || 30,
      totalMarks: Number(newQuizMeta.totalMarks) || 20,
      questions: [],
    };

    saveStoredData('QUIZZES', [quizObj, ...data.quizzes]);
    setIsAddingQuiz(false);
    setNewQuizMeta({
      courseId: data.courses[0]?.id || 'course-1',
      title: '',
      chapter: '',
      durationMinutes: 30,
      totalMarks: 20,
    });
    refreshState();
  };

  const handleUpdateQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuiz) return;
    const updated = data.quizzes.map((q) => (q.id === editingQuiz.id ? editingQuiz : q));
    saveStoredData('QUIZZES', updated);
    setEditingQuiz(null);
    refreshState();
  };

  const handleDeleteQuiz = (quizId: string) => {
    if (!confirm('Are you sure you want to delete this entire mock test?')) return;
    const updated = data.quizzes.filter((q) => q.id !== quizId);
    saveStoredData('QUIZZES', updated);
    refreshState();
  };

  const handleDeleteQuizQuestion = (quizId: string, questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    const updated = data.quizzes.map((q) => {
      if (q.id === quizId) {
        return {
          ...q,
          questions: q.questions.filter((item) => item.id !== questionId),
        };
      }
      return q;
    });
    saveStoredData('QUIZZES', updated);
    refreshState();
  };

  const handleUpdateQuizQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuizQuestion) return;
    const { quizId, question } = editingQuizQuestion;
    const updated = data.quizzes.map((q) => {
      if (q.id === quizId) {
        return {
          ...q,
          questions: q.questions.map((item) => (item.id === question.id ? question : item)),
        };
      }
      return q;
    });
    saveStoredData('QUIZZES', updated);
    setEditingQuizQuestion(null);
    refreshState();
  };

  // Forum CRUD Handlers
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.title.trim() || !newPost.question.trim()) return;

    const courseObj = data.courses.find((c) => c.id === newPost.courseId);
    const postObj: CommunityPost = {
      id: `post-${Date.now()}`,
      courseId: newPost.courseId,
      courseTitle: courseObj?.title || 'General Doubt Forum',
      authorName: 'Er. Alok Sharma (Guruji)',
      authorPhone: configForm.whatsappNumber || '+91 98765 43210',
      title: newPost.title.trim(),
      question: newPost.question.trim(),
      tags: newPost.tags.split(',').map((t) => t.trim()).filter(Boolean),
      createdAt: 'Just now',
      upvotes: 1,
      isResolved: false,
      answers: [],
    };

    saveStoredData('COMMUNITY_POSTS', [postObj, ...(data.communityPosts || [])]);
    setIsAddingPost(false);
    setNewPost({
      courseId: data.courses[0]?.id || 'course-1',
      title: '',
      question: '',
      tags: 'Physics, Numericals',
    });
    refreshState();
  };

  const handleUpdatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;
    const updated = (data.communityPosts || []).map((p) => (p.id === editingPost.id ? editingPost : p));
    saveStoredData('COMMUNITY_POSTS', updated);
    setEditingPost(null);
    refreshState();
  };

  const handleDeletePost = (postId: string) => {
    if (!confirm('Are you sure you want to delete this discussion post?')) return;
    const updated = (data.communityPosts || []).filter((p) => p.id !== postId);
    saveStoredData('COMMUNITY_POSTS', updated);
    refreshState();
  };

  const handleTogglePostResolved = (postId: string) => {
    const updated = (data.communityPosts || []).map((p) => {
      if (p.id === postId) {
        return { ...p, isResolved: !p.isResolved };
      }
      return p;
    });
    saveStoredData('COMMUNITY_POSTS', updated);
    refreshState();
  };

  // Manual Offline / Cash Payment & Delete Payment Handlers
  const handleCreateManualPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newManualPayment.studentName.trim() || !newManualPayment.studentPhone.trim()) return;

    const selectedCourse = data.courses.find((c) => c.id === newManualPayment.courseId) || data.courses[0];
    const cleanUtr = newManualPayment.utrNumber.trim() || `MANUAL-${Date.now().toString().slice(-6)}`;

    const paymentObj: PaymentRequest = {
      id: `pay-${Date.now()}`,
      userId: `user-manual-${Date.now()}`,
      userName: newManualPayment.studentName.trim(),
      userPhone: newManualPayment.studentPhone.trim(),
      userEmail: newManualPayment.studentEmail.trim() || `${newManualPayment.studentPhone.trim()}@student.local`,
      courseId: selectedCourse.id,
      courseTitle: selectedCourse.title,
      amount: Number(newManualPayment.amount) || selectedCourse.price,
      utrNumber: cleanUtr,
      upiIdUsed: `Offline / ${newManualPayment.paymentMode}`,
      status: 'approved',
      createdAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      updatedAt: new Date().toISOString(),
    };

    const existingStudent = data.students.find((s) => s.phone === paymentObj.userPhone);
    let updatedStudents = [...data.students];
    if (existingStudent) {
      updatedStudents = updatedStudents.map((s) => {
        if (s.id === existingStudent.id) {
          return {
            ...s,
            enrolledCourseIds: Array.from(new Set([...s.enrolledCourseIds, selectedCourse.id])),
          };
        }
        return s;
      });
    } else {
      const newStud: User = {
        id: paymentObj.userId,
        name: paymentObj.userName,
        phone: paymentObj.userPhone,
        email: paymentObj.userEmail,
        password: 'student123',
        role: 'student',
        enrolledCourseIds: [selectedCourse.id],
        joinedDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        streakDays: 1,
      };
      updatedStudents = [newStud, ...updatedStudents];
    }

    saveStoredData('STUDENTS', updatedStudents);
    saveStoredData('PAYMENTS', [paymentObj, ...data.payments]);
    setIsAddingPayment(false);
    setNewManualPayment({
      studentName: '',
      studentPhone: '',
      studentEmail: '',
      courseId: data.courses[0]?.id || 'course-1',
      amount: data.courses[0]?.price || 999,
      paymentMode: 'Cash / Offline',
      utrNumber: '',
    });
    refreshState();
  };

  const handleDeletePayment = (paymentId: string) => {
    if (!confirm('Are you sure you want to delete this payment record?')) return;
    const updated = data.payments.filter((p: PaymentRequest) => p.id !== paymentId);
    saveStoredData('PAYMENTS', updated);
    refreshState();
  };

  // Stats
  const pendingPayments = data.payments.filter((p: PaymentRequest) => p.status === 'pending');

  // Left Sidebar items categorized into sections for a simplified, clean UI
  interface NavItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }> | React.ElementType;
    count?: number;
    badge?: number | string | null;
    badgeColor?: string;
    highlight?: boolean;
  }

  const todayRecords = (data.attendance || []).filter((a) => a.date === todayStr);
  const todayPresent = todayRecords.filter((a) => a.status === 'present').length;
  const totalDueAmount = (data.students || []).reduce((acc, s) => acc + (s.feesDue ?? 0), 0);
  const totalDueStudents = (data.students || []).filter((s) => (s.feesDue ?? 0) > 0).length;

  const todayTeacherRecords = (data.teacherAttendance || []).filter((a) => a.date === todayStr);
  const todayPresentTeachers = todayTeacherRecords.filter((a) => a.status === 'present').length;

  const navSections: Array<{ title: string; items: NavItem[] }> = [
    {
      title: 'Operations',
      items: [
        { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
        {
          id: 'attendance',
          label: 'Student Attendance',
          icon: Calendar,
          badge: `${todayPresent}/${data.students.length}`,
          badgeColor: 'bg-emerald-500 text-white font-black'
        },
        {
          id: 'fees',
          label: 'Fees & Dues',
          icon: CreditCard,
          badge: totalDueStudents > 0 ? `₹${totalDueAmount}` : null,
          badgeColor: 'bg-rose-500 text-white font-black'
        },
        {
          id: 'weekly_tests',
          label: 'Weekly Tests',
          icon: Award,
          count: (data.weeklyTests || []).length
        },
        {
          id: 'students',
          label: 'Students',
          icon: Users,
          count: data.students.length
        },
      ]
    },
    {
      title: 'Faculty & Staff',
      items: [
        {
          id: 'teachers',
          label: 'Teachers Directory',
          icon: GraduationCap,
          count: (data.teachers || []).length
        },
        {
          id: 'teacher_attendance',
          label: 'Teacher Attendance',
          icon: UserCheck,
          badge: `${todayPresentTeachers}/${(data.teachers || []).length}`,
          badgeColor: 'bg-indigo-500 text-white font-black'
        },
      ]
    },
    {
      title: 'Study Material',
      items: [
        { id: 'courses', label: 'Batches', icon: BookOpen, count: data.courses.length },
        { id: 'lectures', label: 'Live & Video Classes', icon: Radio, count: data.lessons.length },
        { id: 'notes', label: 'PDF Notes', icon: FileText, count: data.notes.length },
        { id: 'dpp', label: 'DPP & Homework', icon: CheckCircle2, count: (data.dpps || []).length },
        { id: 'pyq', label: 'PYQ Papers', icon: Download, count: (data.pyqPapers || []).length },
        { id: 'timetable', label: 'Timetable', icon: Clock, count: data.timetable.length },
      ]
    },
    {
      title: 'Settings',
      items: [
        { id: 'notices', label: 'Notices', icon: Bell, count: data.announcements.length },
        { id: 'settings', label: 'Settings', icon: Settings },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex selection:bg-blue-600 selection:text-white w-full max-w-full overflow-x-hidden">
      {/* =========================================================================
          LEFT SIDEBAR (Fixed Desktop & Responsive Drawer)
      ========================================================================= */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Header */}
          <div className="h-18 px-5 border-b border-slate-200 flex items-center justify-between shrink-0">
            <Link href="/" className="hover:opacity-90 transition-opacity">
              <Logo size="sm" logoUrl={configForm?.logoUrl || data.config?.logoUrl} />
            </Link>
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sidebar Menu Categorized */}
          <nav className="p-3 space-y-4 overflow-y-auto flex-1">
            {navSections.map((section) => (
              <div key={section.title} className="space-y-1">
                <div className="px-3 py-1 text-[10px] font-black tracking-wider uppercase text-slate-400">
                  {section.title}
                </div>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id as typeof activeTab);
                        setMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 active:scale-[0.98]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                        <span>{item.label}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        {item.badge && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] ${item.badgeColor || 'bg-blue-100 text-blue-700'}`}>
                            {item.badge}
                          </span>
                        )}
                        {item.count !== undefined && !item.badge && (
                          <span className={`text-[11px] font-mono ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                            {item.count}
                          </span>
                        )}
                        {item.highlight && !isActive && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-100 text-amber-800 font-extrabold uppercase">
                            AI
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer User Info */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-bold text-xs text-slate-900 leading-tight">Admin Account</div>
                <div className="text-[10px] text-slate-500">Teacher &amp; Management</div>
              </div>
            </div>
          </div>

          <Link
            href="/"
            className="w-full py-2 px-3 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <span>View Website</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>
        </div>
      </aside>

      {/* Backdrop for mobile sidebar */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* =========================================================================
          MAIN CONTENT AREA
      ========================================================================= */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 w-full max-w-full overflow-x-hidden">
        {/* Top Navbar */}
        {/* Modern Top Header */}
        <header className="h-18 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight capitalize flex items-center gap-2">
                  {activeTab === 'overview' && 'Dashboard'}
                  {activeTab === 'attendance' && 'Student Attendance'}
                  {activeTab === 'teacher_attendance' && 'Teacher Attendance'}
                  {activeTab === 'teachers' && 'Teachers & Faculty Directory'}
                  {activeTab === 'fees' && 'Fees & Dues'}
                  {activeTab === 'weekly_tests' && 'Weekly Tests'}
                  {activeTab === 'students' && 'Students'}
                  {activeTab === 'courses' && 'Batches'}
                  {activeTab === 'lectures' && 'Live & Video Classes'}
                  {activeTab === 'notes' && 'PDF Notes'}
                  {activeTab === 'dpp' && 'DPP & Homework'}
                  {activeTab === 'pyq' && 'PYQ Papers'}
                  {activeTab === 'timetable' && 'Timetable'}
                  {activeTab === 'notices' && 'Notices'}
                  {activeTab === 'settings' && 'Settings'}
                  {activeTab === 'payments' && 'Payments'}
                  {activeTab === 'cms' && 'Website Content'}
                  {activeTab === 'forum' && 'Doubt Forum'}
                  {activeTab === 'quizzes' && 'Quizzes'}
                  {activeTab === 'whatsapp' && 'WhatsApp Assistant'}
                  {activeTab === 'broadcast' && 'Broadcast'}
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  Admin Console
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                {data.config.coachingName || 'ICC KE GURUJI'} Management Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-600">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{todayStr}</span>
            </div>
            <Link
              href="/"
              className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold border border-slate-200/90 shadow-xs flex items-center gap-1.5 transition-all active:scale-95"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
              <span>View Website</span>
            </Link>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-4 sm:p-8 flex-1 w-full max-w-full overflow-x-hidden pb-24 md:pb-8">
          {/* =====================================================================
              1. OVERVIEW TAB
          ===================================================================== */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Elevated Modern Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Students */}
                <div className="group p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-blue-300 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs uppercase font-bold tracking-wider text-slate-500">Total Students</span>
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shadow-xs">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-slate-900 tracking-tight">{data.students.length}</div>
                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <span className="text-blue-700 font-semibold">Active Enrolled</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
                      100% Verified
                    </span>
                  </div>
                </div>

                {/* Today's Attendance */}
                <div className="group p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs uppercase font-bold tracking-wider text-slate-500">Today&apos;s Attendance</span>
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shadow-xs">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-slate-900 tracking-tight">
                    {todayPresent} <span className="text-base text-slate-400 font-bold">/ {data.students.length}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <span className="text-emerald-700 font-semibold">
                      {data.students.length > 0 ? Math.round((todayPresent / data.students.length) * 100) : 0}% Present
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                      {data.students.length - todayPresent} Absent
                    </span>
                  </div>
                </div>

                {/* Total Outstanding Dues */}
                <div className="group p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-rose-300 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs uppercase font-bold tracking-wider text-slate-500">Pending Dues</span>
                    <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold shadow-xs">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-rose-700 tracking-tight">₹{totalDueAmount.toLocaleString('en-IN')}</div>
                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <span className="text-rose-600 font-semibold">{totalDueStudents} Students Pending</span>
                    <button
                      onClick={() => setActiveTab('fees')}
                      className="px-2 py-0.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold border border-rose-200 transition-colors"
                    >
                      Collect Dues ➜
                    </button>
                  </div>
                </div>

                {/* Weekly Offline Tests */}
                <div className="group p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-amber-300 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs uppercase font-bold tracking-wider text-slate-500">Weekly Tests</span>
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shadow-xs">
                      <Award className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-slate-900 tracking-tight">{(data.weeklyTests || []).length}</div>
                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <span className="text-amber-700 font-semibold">Sunday Tests Held</span>
                    <button
                      onClick={() => setActiveTab('weekly_tests')}
                      className="px-2 py-0.5 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold border border-amber-200 transition-colors"
                    >
                      + New Test
                    </button>
                  </div>
                </div>
              </div>

              {/* Modern Quick Action Bar */}
              <div className="p-5 bg-white border border-slate-200/80 rounded-3xl shadow-xs">
                <div className="flex items-center justify-between mb-3.5">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Quick Actions
                  </span>
                  <span className="text-[11px] text-slate-400 font-semibold">Instant 1-Click Operations</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
                  <button
                    onClick={() => setActiveTab('attendance')}
                    className="p-3 rounded-2xl bg-emerald-50/80 hover:bg-emerald-100 border border-emerald-200/80 text-emerald-800 text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-xs transition-all active:scale-95 cursor-pointer"
                  >
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span>Student Att.</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('teacher_attendance')}
                    className="p-3 rounded-2xl bg-emerald-50/80 hover:bg-emerald-100 border border-emerald-200/80 text-emerald-700 text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-xs transition-all active:scale-95 cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <span>Teacher Att.</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('teachers')}
                    className="p-3 rounded-2xl bg-indigo-50/80 hover:bg-indigo-100 border border-indigo-200/80 text-indigo-700 text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-xs transition-all active:scale-95 cursor-pointer"
                  >
                    <GraduationCap className="w-4 h-4 text-indigo-600" />
                    <span>Faculty</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('fees')}
                    className="p-3 rounded-2xl bg-blue-50/80 hover:bg-blue-100 border border-blue-200/80 text-blue-700 text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-xs transition-all active:scale-95 cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <span>Record Fee</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('weekly_tests')}
                    className="p-3 rounded-2xl bg-amber-50/80 hover:bg-amber-100 border border-amber-200/80 text-amber-800 text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-xs transition-all active:scale-95 cursor-pointer"
                  >
                    <Award className="w-4 h-4 text-amber-600" />
                    <span>Weekly Test</span>
                  </button>
                  <button
                    onClick={() => { setActiveTab('students'); setIsAddingStudent(true); }}
                    className="p-3 rounded-2xl bg-purple-50/80 hover:bg-purple-100 border border-purple-200/80 text-purple-700 text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-xs transition-all active:scale-95 cursor-pointer"
                  >
                    <Users className="w-4 h-4 text-purple-600" />
                    <span>Add Student</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('courses')}
                    className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-xs transition-all active:scale-95 cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-slate-600" />
                    <span>New Batch</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('notes')}
                    className="p-3 rounded-2xl bg-indigo-50/80 hover:bg-indigo-100 border border-indigo-200/80 text-indigo-700 text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-xs transition-all active:scale-95 cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <span>PDF Notes</span>
                  </button>
                </div>
              </div>

              {/* Quick Actions & Recent Pending */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-amber-500" />
                      Pending Payment Approvals ({pendingPayments.length})
                    </h3>
                    <button
                      onClick={() => setActiveTab('payments')}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      View All ➜
                    </button>
                  </div>

                  {pendingPayments.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs rounded-2xl bg-slate-50 border border-dashed border-slate-200">
                      ✓ All pending student payments have been verified!
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingPayments.map((p) => (
                        <div
                          key={p.id}
                          className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-200 flex items-center justify-between gap-3 text-xs transition-colors"
                        >
                          <div>
                            <div className="font-black text-slate-900">{p.userName}</div>
                            <div className="text-[11px] text-slate-500 font-mono">UTR: {p.utrNumber}</div>
                            <div className="text-[10px] text-blue-700 font-semibold">{p.courseTitle.slice(0, 30)}...</div>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <span className="font-black text-emerald-600 text-sm">₹{p.amount}</span>
                            <button
                              onClick={() => handleApprovePayment(p)}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs active:scale-95 transition-all"
                            >
                              Approve
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs flex flex-col justify-between">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base mb-1 flex items-center gap-2">
                      <Send className="w-4 h-4 text-sky-500" />
                      Quick Notice Broadcast
                    </h3>
                    <p className="text-xs text-slate-500 mb-4">
                      Broadcast a live announcement to the student dashboard and Telegram community in real-time.
                    </p>

                    {broadcastSent && (
                      <div className="p-3 mb-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold animate-in fade-in duration-200">
                        ✓ Notice broadcasted to students and Telegram group!
                      </div>
                    )}

                    <textarea
                      value={broadcastMsg}
                      onChange={(e) => setBroadcastMsg(e.target.value)}
                      placeholder="e.g. 🔴 LIVE CLASS: Today's masterclass will start at 7:00 PM..."
                      rows={3}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none transition-colors"
                    />

                    <button
                      onClick={handleSendBroadcast}
                      disabled={!broadcastMsg.trim()}
                      className="w-full mt-3 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-98 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Instant Broadcast Notice</span>
                    </button>
                  </div>

                  {/* Recent Published Broadcasts */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                      <span>Recent Notices ({data.announcements.length})</span>
                      <button
                        onClick={() => setActiveTab('notices')}
                        className="text-blue-600 hover:underline"
                      >
                        View All ➜
                      </button>
                    </div>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto">
                      {data.announcements.slice(0, 3).map((ann) => (
                        <div
                          key={ann.id}
                          className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 text-xs"
                        >
                          <div className="truncate flex-1">
                            <div className="font-bold text-slate-900 truncate">{ann.title}</div>
                            <div className="text-[11px] text-slate-500 truncate">{ann.message}</div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => setEditingAnnouncement(ann)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit Notice"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteAnnouncement(ann.id)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete Notice"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================================
              1.1. DAILY STUDENT ATTENDANCE TAB
          ===================================================================== */}
          {activeTab === 'attendance' && (
            <AttendanceManager
              students={data.students}
              courses={data.courses}
              initialAttendance={data.attendance || []}
              onUpdate={refreshState}
            />
          )}

          {/* =====================================================================
              1.1B. TEACHER ATTENDANCE REGISTER TAB
          ===================================================================== */}
          {activeTab === 'teacher_attendance' && (
            <TeacherAttendanceManager
              teachers={data.teachers || []}
              initialAttendance={data.teacherAttendance || []}
              onUpdate={refreshState}
            />
          )}

          {/* =====================================================================
              1.1C. TEACHERS & FACULTY DIRECTORY TAB
          ===================================================================== */}
          {activeTab === 'teachers' && (
            <TeacherManager
              teachers={data.teachers || []}
              onUpdate={refreshState}
            />
          )}

          {/* =====================================================================
              1.2. FEES & DUES REGISTER TAB
          ===================================================================== */}
          {activeTab === 'fees' && (
            <FeeRegisterManager
              students={data.students}
              courses={data.courses}
              feeRecords={data.feeRecords || []}
              onUpdate={refreshState}
            />
          )}

          {/* =====================================================================
              1.3. WEEKLY OFFLINE TESTS & RESULTS TAB
          ===================================================================== */}
          {activeTab === 'weekly_tests' && (
            <WeeklyTestManager
              students={data.students}
              courses={data.courses}
              weeklyTests={data.weeklyTests || []}
              onUpdate={refreshState}
            />
          )}

          {/* =====================================================================
              1.4. NOTICE BOARD & ANNOUNCEMENTS TAB
          ===================================================================== */}
          {activeTab === 'notices' && (
            <div className="space-y-6">
              <div className="p-5 bg-white border border-slate-200 rounded-3xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                    <Bell className="w-5 h-5 text-blue-600" />
                    Notice Board & Announcements
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Publish holiday alerts, exam schedules, new batch announcements, or important updates. These appear on the homepage and student dashboards.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Add Notice Form */}
                <div className="lg:col-span-1 bg-white border border-slate-200 p-6 rounded-3xl h-fit shadow-xs">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                      <Plus className="w-4 h-4 text-blue-600" />
                      Publish New Announcement
                    </h4>
                    <AiFormFiller
                      formType="announcement"
                      buttonLabel="✨ AI Notice"
                      onFill={(extracted) => setNewAnnouncement((prev) => ({ ...prev, ...extracted }))}
                    />
                  </div>
                  <form onSubmit={handleCreateAnnouncement} className="space-y-3 text-xs">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Headline / Title *</label>
                      <input
                        type="text"
                        required
                        value={newAnnouncement.title}
                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                        placeholder="e.g. 🔴 Sunday Weekly Offline Test starts at 8:00 AM"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Detailed Message</label>
                      <textarea
                        rows={3}
                        value={newAnnouncement.message}
                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })}
                        placeholder="Write detailed notice message here..."
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Category</label>
                      <select
                        value={newAnnouncement.category}
                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, category: e.target.value as Announcement['category'] })}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                      >
                        <option value="general">📢 General Notice</option>
                        <option value="exam_alert">⚡ Exam & Test Alert</option>
                        <option value="live_class">🔴 Live Class Alert</option>
                        <option value="notes_alert">📚 Study Notes Alert</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 font-bold text-white rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Publish Notice</span>
                    </button>
                  </form>
                </div>

                {/* Right: Published Notices List */}
                <div className="lg:col-span-2 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
                    <span>Total Published Notices: {data.announcements.length}</span>
                  </div>

                  {data.announcements.map((ann) => (
                    <div
                      key={ann.id}
                      className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs hover:border-blue-200 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                            {ann.category} • {ann.date}
                          </span>
                          {ann.isPinned && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                              📌 Pinned
                            </span>
                          )}
                        </div>
                        <h4 className="font-extrabold text-sm text-slate-900">{ann.title}</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">{ann.message}</p>
                      </div>

                      <div className="flex items-center gap-1 self-end sm:self-auto shrink-0">
                        <button
                          onClick={() => handleTogglePinAnnouncement(ann.id)}
                          title={ann.isPinned ? "Unpin" : "Pin on top"}
                          className={`p-1.5 rounded-lg border text-xs font-bold ${
                            ann.isPinned
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-600'
                          }`}
                        >
                          📌
                        </button>
                        <button
                          onClick={() => setEditingAnnouncement(ann)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
                          title="Edit Notice"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteAnnouncement(ann.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200"
                          title="Delete Notice"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* =====================================================================
              2. UPI APPROVALS TAB
          ===================================================================== */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              <div className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-700 shadow-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Students submit their 12-digit UTR upon paying through any UPI App.
                    Clicking <strong>&quot;Approve&quot;</strong> instantly unlocks full classroom access for the student!
                  </span>
                </div>
                <button
                  onClick={() => setIsAddingPayment(true)}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 shadow-xs transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Record Offline / Cash Admission</span>
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm text-slate-700">
                    <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[11px] border-b border-slate-200">
                      <tr>
                        <th className="py-3.5 px-5 font-bold">Student Details</th>
                        <th className="py-3.5 px-5 font-bold">Course</th>
                        <th className="py-3.5 px-5 font-bold">Amount</th>
                        <th className="py-3.5 px-5 font-bold">12-Digit UTR Ref</th>
                        <th className="py-3.5 px-5 font-bold">Status</th>
                        <th className="py-3.5 px-5 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.payments.map((p: PaymentRequest) => (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-4 px-5">
                            <div className="font-bold text-slate-900">{p.userName}</div>
                            <div className="text-xs text-slate-500 font-mono">{p.userPhone}</div>
                            <div className="text-[11px] text-slate-400">{p.createdAt}</div>
                          </td>
                          <td className="py-4 px-5 font-semibold text-slate-800 max-w-xs">
                            {p.courseTitle}
                          </td>
                          <td className="py-4 px-5 font-black text-emerald-600">
                            ₹{p.amount}
                          </td>
                          <td className="py-4 px-5 font-mono font-bold text-blue-700">
                            {p.utrNumber}
                          </td>
                          <td className="py-4 px-5">
                            {p.status === 'approved' && (
                              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Approved
                              </span>
                            )}
                            {p.status === 'pending' && (
                              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 animate-pulse">
                                Pending Review
                              </span>
                            )}
                            {p.status === 'rejected' && (
                              <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                Rejected
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {p.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleApprovePayment(p)}
                                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition-all"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleRejectPayment(p.id)}
                                    className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold transition-colors"
                                    title="Reject"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => handleDeletePayment(p.id)}
                                className="p-2 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-colors border border-slate-200"
                                title="Delete Record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Record Manual Payment Modal */}
              {isAddingPayment && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                      <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                        <Plus className="w-4 h-4 text-emerald-600" /> Record Offline / Cash Admission
                      </h3>
                      <button
                        onClick={() => setIsAddingPayment(false)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleCreateManualPayment} className="space-y-3 text-xs sm:text-sm">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Student Full Name *</label>
                        <input
                          type="text"
                          required
                          value={newManualPayment.studentName}
                          onChange={(e) => setNewManualPayment({ ...newManualPayment, studentName: e.target.value })}
                          placeholder="e.g. Anjali Verma"
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Mobile Number *</label>
                          <input
                            type="text"
                            required
                            value={newManualPayment.studentPhone}
                            onChange={(e) => setNewManualPayment({ ...newManualPayment, studentPhone: e.target.value })}
                            placeholder="e.g. 9876543210"
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Email ID</label>
                          <input
                            type="email"
                            value={newManualPayment.studentEmail}
                            onChange={(e) => setNewManualPayment({ ...newManualPayment, studentEmail: e.target.value })}
                            placeholder="anjali@gmail.com"
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Select Batch to Enroll *</label>
                        <select
                          value={newManualPayment.courseId}
                          onChange={(e) => {
                            const found = data.courses.find((c) => c.id === e.target.value);
                            setNewManualPayment({
                              ...newManualPayment,
                              courseId: e.target.value,
                              amount: found ? found.price : newManualPayment.amount,
                            });
                          }}
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                        >
                          {data.courses.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.title} (₹{c.price})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Fees Paid (₹) *</label>
                          <input
                            type="number"
                            required
                            value={newManualPayment.amount}
                            onChange={(e) => setNewManualPayment({ ...newManualPayment, amount: Number(e.target.value) })}
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Payment Mode</label>
                          <select
                            value={newManualPayment.paymentMode}
                            onChange={(e) => setNewManualPayment({ ...newManualPayment, paymentMode: e.target.value })}
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                          >
                            <option value="Cash / Offline">Cash / In-Person</option>
                            <option value="Direct Bank NEFT/IMPS">Direct Bank NEFT/IMPS</option>
                            <option value="Cheque / DD">Cheque / DD</option>
                            <option value="Other UPI">External UPI</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Receipt / Ref Number (Optional)</label>
                        <input
                          type="text"
                          value={newManualPayment.utrNumber}
                          onChange={(e) => setNewManualPayment({ ...newManualPayment, utrNumber: e.target.value })}
                          placeholder="e.g. REC-2026-089"
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono text-xs"
                        />
                      </div>

                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-800">
                        ✅ Upon submission, the student&apos;s account is created automatically and their selected batch is unlocked immediately!
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsAddingPayment(false)}
                          className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 font-bold"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
                        >
                          Record Admission &amp; Unlock
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =====================================================================
              3. COURSES TAB
          ===================================================================== */}
          {activeTab === 'courses' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 bg-white border border-slate-200 p-6 rounded-3xl h-fit shadow-xs">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                    <Plus className="w-4 h-4 text-blue-600" /> Add New Course
                  </h3>
                  <AiFormFiller
                    formType="course"
                    buttonLabel="✨ Fill with AI"
                    onFill={(extracted) => setNewCourse((prev) => ({ ...prev, ...extracted }))}
                  />
                </div>
                <form onSubmit={handleCreateCourse} className="space-y-3 text-xs sm:text-sm">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Course Title *</label>
                    <input
                      type="text"
                      required
                      value={newCourse.title}
                      onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                      placeholder="e.g. Class 12 Board Super 30 Batch"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Subtitle / Tagline</label>
                    <input
                      type="text"
                      value={newCourse.subtitle}
                      onChange={(e) => setNewCourse({ ...newCourse, subtitle: e.target.value })}
                      placeholder="Daily Live Classes &amp; Notes"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Offer Price (₹) *</label>
                      <input
                        type="number"
                        required
                        value={newCourse.price}
                        onChange={(e) => setNewCourse({ ...newCourse, price: Number(e.target.value) })}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Original Price (₹)</label>
                      <input
                        type="number"
                        value={newCourse.originalPrice}
                        onChange={(e) => setNewCourse({ ...newCourse, originalPrice: Number(e.target.value) })}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Category</label>
                    <select
                      value={newCourse.category}
                      onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                    >
                      <option value="Competitive Exams">Competitive Exams (JEE / NEET)</option>
                      <option value="Board Exams">Board Exams (Class 10/12)</option>
                      <option value="Coding &amp; Tech">Coding &amp; Web Dev</option>
                      <option value="General">General Coaching</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Duration</label>
                    <input
                      type="text"
                      value={newCourse.duration}
                      onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
                      placeholder="e.g. 4 Months • 100 Hours"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 font-bold text-white rounded-xl shadow-xs transition-all mt-2"
                  >
                    Publish Course
                  </button>
                </form>
              </div>

              <div className="lg:col-span-2 space-y-4">
                {data.courses.map((c: Course) => (
                  <div
                    key={c.id}
                    className="p-5 bg-white border border-slate-200/90 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xs hover:shadow-md hover:border-blue-200 transition-all duration-200"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80">
                          {c.category}
                        </span>
                        {c.isPopular && (
                          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> Bestseller
                          </span>
                        )}
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold">
                          ID: {c.id}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-slate-900 text-base tracking-tight">{c.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-1">{c.subtitle}</p>

                      <div className="flex items-center gap-2.5 text-xs text-slate-600 font-semibold pt-1 flex-wrap">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-sm font-black text-emerald-600">₹{c.price.toLocaleString('en-IN')}</span>
                          <span className="line-through text-slate-400 text-[11px]">₹{c.originalPrice.toLocaleString('en-IN')}</span>
                        </div>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-500">{c.duration}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-700">Mentor: {c.instructorName}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 w-full sm:w-auto justify-end">
                      <button
                        onClick={() => handleTogglePopular(c.id)}
                        title="Toggle Homepage Bestseller Badge"
                        className={`p-2.5 rounded-xl text-xs font-bold transition-all border active:scale-95 cursor-pointer ${
                          c.isPopular
                            ? 'bg-amber-50 border-amber-300 text-amber-800 shadow-xs'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-500'
                        }`}
                      >
                        <Star className={`w-4 h-4 ${c.isPopular ? 'fill-amber-500 text-amber-500' : ''}`} />
                      </button>

                      <button
                        onClick={() => setEditingCourse(c)}
                        className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleDeleteCourse(c.id)}
                        className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-xl border border-rose-200 transition-all active:scale-95 cursor-pointer"
                        title="Delete Course"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <Link
                        href={`/course/${c.id}`}
                        className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white rounded-xl shadow-xs flex items-center gap-1.5 transition-all active:scale-95"
                      >
                        <span>Classroom</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-300" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Edit Course Modal */}
              {editingCourse && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                      <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                        <Pencil className="w-4 h-4 text-blue-600" /> Edit Course
                      </h3>
                      <button
                        onClick={() => setEditingCourse(null)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleUpdateCourse} className="space-y-3 text-xs sm:text-sm">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Course Title *</label>
                        <input
                          type="text"
                          required
                          value={editingCourse.title}
                          onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Subtitle / Tagline</label>
                        <input
                          type="text"
                          value={editingCourse.subtitle}
                          onChange={(e) => setEditingCourse({ ...editingCourse, subtitle: e.target.value })}
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Offer Price (₹) *</label>
                          <input
                            type="number"
                            required
                            value={editingCourse.price}
                            onChange={(e) => setEditingCourse({ ...editingCourse, price: Number(e.target.value) })}
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Original Price (₹)</label>
                          <input
                            type="number"
                            value={editingCourse.originalPrice}
                            onChange={(e) => setEditingCourse({ ...editingCourse, originalPrice: Number(e.target.value) })}
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Category</label>
                          <select
                            value={editingCourse.category}
                            onChange={(e) => setEditingCourse({ ...editingCourse, category: e.target.value })}
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold"
                          >
                            <option value="Competitive Exams">Competitive Exams</option>
                            <option value="Board Exams">Board Exams</option>
                            <option value="Coding &amp; Tech">Coding &amp; Tech</option>
                            <option value="General">General Coaching</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Duration</label>
                          <input
                            type="text"
                            value={editingCourse.duration}
                            onChange={(e) => setEditingCourse({ ...editingCourse, duration: e.target.value })}
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Lead Instructor Name</label>
                        <input
                          type="text"
                          value={editingCourse.instructorName}
                          onChange={(e) => setEditingCourse({ ...editingCourse, instructorName: e.target.value })}
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="checkbox"
                          id="editPopularCheckbox"
                          checked={!!editingCourse.isPopular}
                          onChange={(e) => setEditingCourse({ ...editingCourse, isPopular: e.target.checked })}
                          className="w-4 h-4 rounded text-amber-500 bg-slate-100 border-slate-300"
                        />
                        <label htmlFor="editPopularCheckbox" className="text-xs text-amber-800 font-bold flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Featured Bestseller on Homepage
                        </label>
                      </div>

                      <div className="flex items-center gap-3 pt-3">
                        <button
                          type="submit"
                          className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors"
                        >
                          Save Changes
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCourse(null)}
                          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =====================================================================
              4. LIVE & LECTURES TAB
          ===================================================================== */}
          {activeTab === 'lectures' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 bg-white border border-slate-200 p-6 rounded-3xl h-fit shadow-xs">
                <h3 className="font-black text-slate-900 text-base mb-3 flex items-center gap-2">
                  <Radio className="w-4 h-4 text-rose-600" /> Schedule YouTube Live / Lecture
                </h3>
                <form onSubmit={handleCreateLecture} className="space-y-3 text-xs sm:text-sm">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Select Course *</label>
                    <select
                      value={newLecture.courseId}
                      onChange={(e) => setNewLecture({ ...newLecture, courseId: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                    >
                      {data.courses.map((c: Course) => (
                        <option key={c.id} value={c.id}>
                          {c.title.slice(0, 36)}...
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Lecture / Topic Title *</label>
                    <input
                      type="text"
                      required
                      value={newLecture.title}
                      onChange={(e) => setNewLecture({ ...newLecture, title: e.target.value })}
                      placeholder="e.g. Electrostatics Live Doubt Class"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      YouTube Video ID or Unlisted URL *
                    </label>
                    <input
                      type="text"
                      required
                      value={newLecture.youtubeId}
                      onChange={(e) => setNewLecture({ ...newLecture, youtubeId: e.target.value })}
                      placeholder="e.g. jfKfPfyJRdk or full YouTube URL"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono text-xs focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                    <span className="text-[11px] text-slate-400">Paste unlisted YouTube stream or video link.</span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="isLiveCheckbox"
                      checked={newLecture.isLive}
                      onChange={(e) => setNewLecture({ ...newLecture, isLive: e.target.checked })}
                      className="w-4 h-4 rounded text-rose-600 bg-slate-100 border-slate-300"
                    />
                    <label htmlFor="isLiveCheckbox" className="text-xs text-rose-700 font-bold flex items-center gap-1">
                      Mark as 🔴 LIVE STREAM NOW
                    </label>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Scheduled Time / Date</label>
                    <input
                      type="text"
                      value={newLecture.scheduledAt}
                      onChange={(e) => setNewLecture({ ...newLecture, scheduledAt: e.target.value })}
                      placeholder="e.g. Today at 7:00 PM"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-rose-600 hover:bg-rose-700 font-bold text-white rounded-xl shadow-xs transition-all mt-2"
                  >
                    Schedule / Add Lecture
                  </button>
                </form>
              </div>

              <div className="lg:col-span-2 space-y-3">
                {data.lessons.map((les: Lesson) => (
                  <div key={les.id} className="p-4.5 bg-white border border-slate-200 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs hover:border-blue-200 transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        {les.isLive ? (
                          <span className="text-[10px] bg-rose-100 text-rose-700 px-2.5 py-0.5 rounded-full font-bold border border-rose-300 flex items-center gap-1 animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" /> LIVE NOW
                          </span>
                        ) : (
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-semibold">
                            Recorded
                          </span>
                        )}
                        <span className="text-xs font-mono text-slate-400">YT: {les.youtubeId}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mt-1">{les.title}</h4>
                      <p className="text-xs text-slate-500 font-medium">{les.scheduledAt || les.duration}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
                      {/* 1-Click Toggle Live Status */}
                      <button
                        onClick={() => handleToggleLectureLive(les.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                          les.isLive
                            ? 'bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                        title="Click to toggle Live Now status"
                      >
                        {les.isLive ? '🔴 End Live' : '⚪ Go Live'}
                      </button>

                      {/* Edit Lecture */}
                      <button
                        onClick={() => setEditingLecture(les)}
                        className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 transition-colors"
                        title="Edit Lecture Details"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Lecture */}
                      <button
                        onClick={() => handleDeleteLecture(les.id)}
                        className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-xl border border-rose-200 transition-colors"
                        title="Delete Lecture"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <Link
                        href={`/course/${les.courseId}`}
                        className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-blue-700 rounded-xl border border-slate-300"
                      >
                        Player
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Edit Lecture Modal */}
              {editingLecture && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                      <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                        <Pencil className="w-4 h-4 text-rose-600" /> Edit Lecture
                      </h3>
                      <button
                        onClick={() => setEditingLecture(null)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleUpdateLecture} className="space-y-3 text-xs sm:text-sm">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Course</label>
                        <select
                          value={editingLecture.courseId}
                          onChange={(e) => setEditingLecture({ ...editingLecture, courseId: e.target.value })}
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                        >
                          {data.courses.map((c) => (
                            <option key={c.id} value={c.id}>{c.title}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Lecture Title *</label>
                        <input
                          type="text"
                          required
                          value={editingLecture.title}
                          onChange={(e) => setEditingLecture({ ...editingLecture, title: e.target.value })}
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">YouTube Video ID / URL *</label>
                        <input
                          type="text"
                          required
                          value={editingLecture.youtubeId}
                          onChange={(e) => setEditingLecture({ ...editingLecture, youtubeId: e.target.value })}
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Scheduled Time</label>
                          <input
                            type="text"
                            value={editingLecture.scheduledAt || ''}
                            onChange={(e) => setEditingLecture({ ...editingLecture, scheduledAt: e.target.value })}
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Duration</label>
                          <input
                            type="text"
                            value={editingLecture.duration || ''}
                            onChange={(e) => setEditingLecture({ ...editingLecture, duration: e.target.value })}
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="checkbox"
                          id="editLiveCheckbox"
                          checked={editingLecture.isLive}
                          onChange={(e) => setEditingLecture({ ...editingLecture, isLive: e.target.checked })}
                          className="w-4 h-4 rounded text-rose-600 bg-slate-100 border-slate-300"
                        />
                        <label htmlFor="editLiveCheckbox" className="text-xs text-rose-700 font-bold flex items-center gap-1">
                          Mark as 🔴 LIVE STREAM NOW
                        </label>
                      </div>

                      <div className="flex items-center gap-3 pt-3">
                        <button
                          type="submit"
                          className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors"
                        >
                          Save Changes
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingLecture(null)}
                          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =====================================================================
              5. PDF NOTES TAB
          ===================================================================== */}
          {activeTab === 'notes' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 bg-white border border-slate-200 p-6 rounded-3xl h-fit shadow-xs">
                <h3 className="font-black text-slate-900 text-base mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" /> Add PDF Notes
                </h3>
                <form onSubmit={handleCreateNote} className="space-y-3 text-xs sm:text-sm">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Select Course *</label>
                    <select
                      value={newNote.courseId}
                      onChange={(e) => setNewNote({ ...newNote, courseId: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                    >
                      {data.courses.map((c: Course) => (
                        <option key={c.id} value={c.id}>
                          {c.title.slice(0, 36)}...
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Note Title *</label>
                    <input
                      type="text"
                      required
                      value={newNote.title}
                      onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                      placeholder="e.g. Chapter 01 Handwritten Golden Notes"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">PDF File URL *</label>
                    <input
                      type="url"
                      required
                      value={newNote.fileUrl}
                      onChange={(e) => setNewNote({ ...newNote, fileUrl: e.target.value })}
                      placeholder="https://... (Cloudflare R2 / Supabase Storage URL)"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono text-xs focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                    <span className="text-[11px] text-slate-400">Enter direct cloud storage or PDF link here.</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">File Size</label>
                      <input
                        type="text"
                        value={newNote.fileSize}
                        onChange={(e) => setNewNote({ ...newNote, fileSize: e.target.value })}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Page Count</label>
                      <input
                        type="number"
                        value={newNote.pageCount}
                        onChange={(e) => setNewNote({ ...newNote, pageCount: Number(e.target.value) })}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 font-bold text-white rounded-xl shadow-xs transition-all mt-2"
                  >
                    Upload &amp; Attach Notes
                  </button>
                </form>
              </div>

              <div className="lg:col-span-2 space-y-3">
                {data.notes.map((note: PdfNote) => (
                  <div key={note.id} className="p-4.5 bg-white border border-slate-200 rounded-3xl flex items-center justify-between gap-4 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{note.title}</h4>
                        <p className="text-xs text-slate-500 font-medium">{note.fileSize} • {note.pageCount} Pages • Uploaded {note.uploadedAt}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
                      <button
                        onClick={() => setEditingNote(note)}
                        className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 transition-colors"
                        title="Edit Note Details"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-xl border border-rose-200 transition-colors"
                        title="Delete Note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <a
                        href={note.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 rounded-xl border border-slate-300"
                      >
                        Open PDF
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              {/* Edit Note Modal */}
              {editingNote && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                      <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                        <Pencil className="w-4 h-4 text-blue-600" /> Edit PDF Note
                      </h3>
                      <button
                        onClick={() => setEditingNote(null)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleUpdateNote} className="space-y-3 text-xs sm:text-sm">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Course</label>
                        <select
                          value={editingNote.courseId}
                          onChange={(e) => setEditingNote({ ...editingNote, courseId: e.target.value })}
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                        >
                          {data.courses.map((c) => (
                            <option key={c.id} value={c.id}>{c.title}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Note Title *</label>
                        <input
                          type="text"
                          required
                          value={editingNote.title}
                          onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">PDF File URL *</label>
                        <input
                          type="url"
                          required
                          value={editingNote.fileUrl}
                          onChange={(e) => setEditingNote({ ...editingNote, fileUrl: e.target.value })}
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">File Size</label>
                          <input
                            type="text"
                            value={editingNote.fileSize}
                            onChange={(e) => setEditingNote({ ...editingNote, fileSize: e.target.value })}
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Page Count</label>
                          <input
                            type="number"
                            value={editingNote.pageCount || 10}
                            onChange={(e) => setEditingNote({ ...editingNote, pageCount: Number(e.target.value) })}
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pt-3">
                        <button
                          type="submit"
                          className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors"
                        >
                          Save Changes
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingNote(null)}
                          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =====================================================================
              NEW: DPP & HOMEWORK ASSIGNMENTS MANAGER
          ===================================================================== */}
          {activeTab === 'dpp' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form to create new DPP */}
                <div className="lg:col-span-1 bg-white border border-slate-200 p-6 rounded-3xl h-fit shadow-xs">
                  <h3 className="font-black text-slate-900 text-base mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Release New DPP Sheet
                  </h3>
                  <form onSubmit={handleCreateDpp} className="space-y-3 text-xs sm:text-sm">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Select Course *</label>
                      <select
                        value={newDpp.courseId}
                        onChange={(e) => setNewDpp({ ...newDpp, courseId: e.target.value })}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden"
                      >
                        {data.courses.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">DPP Title *</label>
                      <input
                        type="text"
                        required
                        value={newDpp.title}
                        onChange={(e) => setNewDpp({ ...newDpp, title: e.target.value })}
                        placeholder="e.g. DPP 03: Gauss Law & Electric Flux"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Chapter Name</label>
                        <input
                          type="text"
                          value={newDpp.chapter}
                          onChange={(e) => setNewDpp({ ...newDpp, chapter: e.target.value })}
                          placeholder="e.g. Chapter 1"
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Due Date</label>
                        <input
                          type="text"
                          value={newDpp.dueDate}
                          onChange={(e) => setNewDpp({ ...newDpp, dueDate: e.target.value })}
                          placeholder="30 Oct 2026"
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Total Marks</label>
                        <input
                          type="number"
                          value={newDpp.totalMarks}
                          onChange={(e) => setNewDpp({ ...newDpp, totalMarks: Number(e.target.value) })}
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Question Count</label>
                        <input
                          type="number"
                          value={newDpp.questionCount}
                          onChange={(e) => setNewDpp({ ...newDpp, questionCount: Number(e.target.value) })}
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Question Sheet PDF URL</label>
                      <input
                        type="url"
                        value={newDpp.pdfUrl}
                        onChange={(e) => setNewDpp({ ...newDpp, pdfUrl: e.target.value })}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden font-mono text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Instructions / Description</label>
                      <textarea
                        rows={2}
                        value={newDpp.description}
                        onChange={(e) => setNewDpp({ ...newDpp, description: e.target.value })}
                        placeholder="Solve all numerical problems step-by-step..."
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      Publish DPP to Classroom
                    </button>
                  </form>
                </div>

                {/* Student Submissions to Review */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-blue-600" /> Student Submissions to Review (
                      {(data.dppSubmissions || []).length})
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {(data.dppSubmissions || []).map((sub) => {
                      const dppObj = (data.dpps || []).find((d) => d.id === sub.dppId);
                      const isGradingThis = gradingSubmission?.id === sub.id;

                      return (
                        <div
                          key={sub.id}
                          className={`p-5 rounded-3xl border transition-all ${
                            sub.status === 'graded'
                              ? 'bg-white border-slate-200'
                              : 'bg-amber-50/50 border-amber-300'
                          }`}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-slate-900 text-sm">{sub.userName}</span>
                                <span className="text-xs text-slate-400">• {sub.userPhone}</span>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    sub.status === 'graded'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-amber-100 text-amber-800 animate-pulse'
                                  }`}
                                >
                                  {sub.status === 'graded' ? 'Graded ✓' : 'Pending Review'}
                                </span>
                              </div>
                              <h4 className="font-bold text-blue-900 text-xs sm:text-sm mt-1">
                                {dppObj?.title || 'DPP Assignment'}
                              </h4>
                              <p className="text-[11px] text-slate-500">Submitted at: {sub.submittedAt}</p>
                            </div>

                            {sub.status === 'graded' ? (
                              <div className="text-right">
                                <span className="text-xl font-black text-emerald-700">
                                  {sub.marksAwarded}
                                </span>
                                <span className="text-xs text-slate-500">/{dppObj?.totalMarks || 20} Marks</span>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setGradingSubmission(sub);
                                  setMarksInput(dppObj?.totalMarks ? dppObj.totalMarks - 2 : 18);
                                }}
                                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                              >
                                Grade Submission
                              </button>
                            )}
                          </div>

                          {/* Student Answer preview */}
                          <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 whitespace-pre-wrap">
                            {sub.answerText}
                          </div>

                          {/* Grading Form if Selected */}
                          {isGradingThis && (
                            <div className="mt-4 p-4 rounded-2xl bg-white border border-blue-300 shadow-sm space-y-3">
                              <h5 className="font-extrabold text-blue-900 text-xs">
                                Guruji Evaluation &amp; Marks Allocation
                              </h5>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                    Marks Awarded (out of {dppObj?.totalMarks || 20})
                                  </label>
                                  <input
                                    type="number"
                                    max={dppObj?.totalMarks || 20}
                                    value={marksInput}
                                    onChange={(e) => setMarksInput(Number(e.target.value))}
                                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                    Teacher Feedback
                                  </label>
                                  <input
                                    type="text"
                                    value={feedbackInput}
                                    onChange={(e) => setFeedbackInput(e.target.value)}
                                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                                  />
                                </div>
                              </div>
                              <div className="flex items-center justify-end gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => setGradingSubmission(null)}
                                  className="px-3 py-1 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-100"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleGradeSubmission(sub.id)}
                                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs"
                                >
                                  Save &amp; Award Marks
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Published DPPs List */}
              <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xs">
                <h3 className="font-black text-slate-900 text-base mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" /> Published DPPs ({(data.dpps || []).length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(data.dpps || []).map((dpp) => (
                    <div
                      key={dpp.id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                    >
                      <div>
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                          {dpp.chapter}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm mt-1">{dpp.title}</h4>
                        <p className="text-xs text-slate-500">
                          Due: {dpp.dueDate} • {dpp.totalMarks} Marks
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => setEditingDpp(dpp)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-xl transition-colors border border-blue-200"
                          title="Edit DPP"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteDpp(dpp.id)}
                          className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors border border-rose-200"
                          title="Delete DPP"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Edit DPP Modal */}
              {editingDpp && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                      <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                        <Pencil className="w-4 h-4 text-blue-600" /> Edit DPP Assignment
                      </h3>
                      <button
                        onClick={() => setEditingDpp(null)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleUpdateDpp} className="space-y-3 text-xs sm:text-sm">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Select Batch *</label>
                        <select
                          value={editingDpp.courseId}
                          onChange={(e) => setEditingDpp({ ...editingDpp, courseId: e.target.value })}
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                        >
                          {data.courses.map((c) => (
                            <option key={c.id} value={c.id}>{c.title}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">DPP Title *</label>
                        <input
                          type="text"
                          required
                          value={editingDpp.title}
                          onChange={(e) => setEditingDpp({ ...editingDpp, title: e.target.value })}
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Chapter Name</label>
                          <input
                            type="text"
                            value={editingDpp.chapter}
                            onChange={(e) => setEditingDpp({ ...editingDpp, chapter: e.target.value })}
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Due Date</label>
                          <input
                            type="text"
                            value={editingDpp.dueDate}
                            onChange={(e) => setEditingDpp({ ...editingDpp, dueDate: e.target.value })}
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Total Marks</label>
                          <input
                            type="number"
                            value={editingDpp.totalMarks}
                            onChange={(e) => setEditingDpp({ ...editingDpp, totalMarks: Number(e.target.value) })}
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Questions Count</label>
                          <input
                            type="number"
                            value={editingDpp.questionCount}
                            onChange={(e) => setEditingDpp({ ...editingDpp, questionCount: Number(e.target.value) })}
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">PDF File URL</label>
                        <input
                          type="url"
                          value={editingDpp.pdfUrl || ''}
                          onChange={(e) => setEditingDpp({ ...editingDpp, pdfUrl: e.target.value })}
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Instructions / Description</label>
                        <textarea
                          rows={2}
                          value={editingDpp.description}
                          onChange={(e) => setEditingDpp({ ...editingDpp, description: e.target.value })}
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setEditingDpp(null)}
                          className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 font-bold"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs"
                        >
                          Update DPP
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =====================================================================
              NEW: PYQ (PREVIOUS YEARS QUESTIONS) PAPERS MANAGER
          ===================================================================== */}
          {activeTab === 'pyq' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form to add PYQ */}
              <div className="lg:col-span-1 bg-white border border-slate-200 p-6 rounded-3xl h-fit shadow-xs">
                <h3 className="font-black text-slate-900 text-base mb-3 flex items-center gap-2">
                  <Download className="w-4 h-4 text-purple-600" /> Add Previous Year Question Paper
                </h3>
                <form onSubmit={handleCreatePyq} className="space-y-3 text-xs sm:text-sm">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Paper Title *</label>
                    <input
                      type="text"
                      required
                      value={newPyq.title}
                      onChange={(e) => setNewPyq({ ...newPyq, title: e.target.value })}
                      placeholder="e.g. CBSE Class 12 Physics 2024 Solved"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Exam Type</label>
                      <select
                        value={newPyq.exam}
                        onChange={(e) => setNewPyq({ ...newPyq, exam: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                      >
                        <option value="Class 10 Board">Class 10 Board</option>
                        <option value="Class 12 Board">Class 12 Board</option>
                        <option value="JEE Mains">JEE Mains</option>
                        <option value="NEET">NEET</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Year</label>
                      <input
                        type="text"
                        value={newPyq.year}
                        onChange={(e) => setNewPyq({ ...newPyq, year: e.target.value })}
                        placeholder="2024"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Subject</label>
                    <input
                      type="text"
                      value={newPyq.subject}
                      onChange={(e) => setNewPyq({ ...newPyq, subject: e.target.value })}
                      placeholder="Physics / Science"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Question Paper PDF URL</label>
                    <input
                      type="url"
                      value={newPyq.pdfUrl}
                      onChange={(e) => setNewPyq({ ...newPyq, pdfUrl: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Guruji Solution PDF URL</label>
                    <input
                      type="url"
                      value={newPyq.solutionPdfUrl}
                      onChange={(e) => setNewPyq({ ...newPyq, solutionPdfUrl: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    Upload PYQ Paper
                  </button>
                </form>
              </div>

              {/* Existing PYQs List */}
              <div className="lg:col-span-2 space-y-3">
                <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                  <Download className="w-4 h-4 text-purple-600" /> Active PYQ Question Papers (
                  {(data.pyqPapers || []).length})
                </h3>

                {(data.pyqPapers || []).map((paper) => (
                  <div
                    key={paper.id}
                    className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                          {paper.exam}
                        </span>
                        <span className="text-xs font-black text-purple-700">{paper.year}</span>
                        <span className="text-xs text-slate-400">• {paper.subject}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mt-1">{paper.title}</h4>
                      <p className="text-[11px] text-slate-500">
                        {paper.fileSize} • {paper.downloadsCount}+ Downloads
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={paper.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 rounded-xl"
                      >
                        Paper
                      </a>
                      <button
                        onClick={() => setEditingPyq(paper)}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-xl transition-colors border border-blue-200"
                        title="Edit PYQ"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeletePyq(paper.id)}
                        className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors border border-rose-200"
                        title="Delete PYQ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Edit PYQ Modal */}
              {editingPyq && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                      <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                        <Pencil className="w-4 h-4 text-purple-600" /> Edit PYQ Paper
                      </h3>
                      <button
                        onClick={() => setEditingPyq(null)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleUpdatePyq} className="space-y-3 text-xs sm:text-sm">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Paper Title *</label>
                        <input
                          type="text"
                          required
                          value={editingPyq.title}
                          onChange={(e) => setEditingPyq({ ...editingPyq, title: e.target.value })}
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Exam Category</label>
                          <input
                            type="text"
                            value={editingPyq.exam}
                            onChange={(e) => setEditingPyq({ ...editingPyq, exam: e.target.value })}
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Exam Year</label>
                          <input
                            type="text"
                            value={editingPyq.year}
                            onChange={(e) => setEditingPyq({ ...editingPyq, year: e.target.value })}
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Subject</label>
                          <input
                            type="text"
                            value={editingPyq.subject}
                            onChange={(e) => setEditingPyq({ ...editingPyq, subject: e.target.value })}
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">File Size</label>
                          <input
                            type="text"
                            value={editingPyq.fileSize}
                            onChange={(e) => setEditingPyq({ ...editingPyq, fileSize: e.target.value })}
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Question Paper PDF URL *</label>
                        <input
                          type="url"
                          required
                          value={editingPyq.pdfUrl}
                          onChange={(e) => setEditingPyq({ ...editingPyq, pdfUrl: e.target.value })}
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Solution PDF URL (Optional)</label>
                        <input
                          type="url"
                          value={editingPyq.solutionPdfUrl || ''}
                          onChange={(e) => setEditingPyq({ ...editingPyq, solutionPdfUrl: e.target.value })}
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono text-xs"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setEditingPyq(null)}
                          className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 font-bold"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs"
                        >
                          Update PYQ Paper
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =====================================================================
              NEW: COMMUNITY DOUBT DISCUSSION FORUM MODERATOR
          ===================================================================== */}
          {activeTab === 'forum' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-600" /> Student Doubts to Answer as Guruji (
                  {(data.communityPosts || []).length})
                </h3>
                <button
                  onClick={() => setIsAddingPost(true)}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 shadow-xs transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Post Topic as Guruji</span>
                </button>
              </div>

              <div className="space-y-4">
                {(data.communityPosts || []).map((post) => (
                  <div key={post.id} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-blue-700 text-xs">{post.authorName}</span>
                          <span className="text-[11px] text-slate-400">• {post.authorPhone}</span>
                          <span className="text-[11px] text-slate-400">• {post.createdAt}</span>
                          {post.isResolved ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              Resolved ✓
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              Open Doubt
                            </span>
                          )}
                        </div>
                        <h4 className="font-black text-slate-900 text-base mt-1">{post.title}</h4>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleTogglePostResolved(post.id)}
                          className={`px-2.5 py-1 text-xs font-bold rounded-xl transition-colors border ${
                            post.isResolved
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-amber-50 hover:text-amber-700'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700'
                          }`}
                          title="Toggle Resolved Status"
                        >
                          {post.isResolved ? 'Mark Open' : 'Mark Resolved'}
                        </button>

                        <button
                          onClick={() => setEditingPost(post)}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-xl transition-colors border border-blue-200"
                          title="Edit Post"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors border border-rose-200"
                          title="Delete Post"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-xl">
                          👍 {post.upvotes}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100 leading-relaxed font-sans">
                      {post.question}
                    </p>

                    {/* Existing Replies */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Replies ({post.answers.length})
                      </span>
                      {post.answers.map((ans) => (
                        <div key={ans.id} className="p-3 bg-amber-50/50 rounded-xl border border-amber-200 text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-amber-900">{ans.authorName}</span>
                            <span className="text-[10px] text-slate-400">{ans.createdAt}</span>
                          </div>
                          <p className="text-slate-800">{ans.text}</p>
                        </div>
                      ))}
                    </div>

                    {/* Guruji Reply Box */}
                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="text"
                        value={adminForumReplies[post.id] || ''}
                        onChange={(e) =>
                          setAdminForumReplies({ ...adminForumReplies, [post.id]: e.target.value })
                        }
                        placeholder="Guruji: Write official verified solution step-by-step..."
                        className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => handleAdminReplyForum(post.id)}
                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors shrink-0"
                      >
                        Reply as Guruji ⭐
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Post Modal */}
              {isAddingPost && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                      <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                        <Plus className="w-4 h-4 text-blue-600" /> Post New Discussion Topic as Guruji
                      </h3>
                      <button
                        onClick={() => setIsAddingPost(false)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleCreatePost} className="space-y-3 text-xs sm:text-sm">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Select Batch *</label>
                        <select
                          value={newPost.courseId}
                          onChange={(e) => setNewPost({ ...newPost, courseId: e.target.value })}
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                        >
                          {data.courses.map((c) => (
                            <option key={c.id} value={c.id}>{c.title}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Topic Title *</label>
                        <input
                          type="text"
                          required
                          value={newPost.title}
                          onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                          placeholder="e.g. Important Numericals on Gauss's Law Discussion"
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Description / Concept Question *</label>
                        <textarea
                          rows={4}
                          required
                          value={newPost.question}
                          onChange={(e) => setNewPost({ ...newPost, question: e.target.value })}
                          placeholder="Describe the topic details or problem statement here..."
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Tags (comma separated)</label>
                        <input
                          type="text"
                          value={newPost.tags}
                          onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                          placeholder="Physics, Electrostatics, Numericals"
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsAddingPost(false)}
                          className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 font-bold"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs"
                        >
                          Publish Topic
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Edit Post Modal */}
              {editingPost && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                      <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                        <Pencil className="w-4 h-4 text-blue-600" /> Edit Discussion Topic
                      </h3>
                      <button
                        onClick={() => setEditingPost(null)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleUpdatePost} className="space-y-3 text-xs sm:text-sm">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Topic Title *</label>
                        <input
                          type="text"
                          required
                          value={editingPost.title}
                          onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Question / Detail *</label>
                        <textarea
                          rows={4}
                          required
                          value={editingPost.question}
                          onChange={(e) => setEditingPost({ ...editingPost, question: e.target.value })}
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setEditingPost(null)}
                          className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 font-bold"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs"
                        >
                          Update Topic
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =====================================================================
              NEW: 6. QUIZZES & MOCK TESTS MANAGER TAB
          ===================================================================== */}
          {activeTab === 'quizzes' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
                <div>
                  <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-500" />
                    Chapter Quizzes &amp; Mock Test Engine ({data.quizzes.length} Tests)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Create new mock tests, edit or delete questions, and configure answer keys.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddingQuiz(true)}
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs shrink-0 flex items-center gap-1.5 shadow-xs transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Create New Mock Test</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form to add MCQ */}
                <div className="lg:col-span-1 bg-white border border-slate-200 p-6 rounded-3xl h-fit shadow-xs">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                      <Plus className="w-4 h-4 text-blue-600" /> Add MCQ to Test
                    </h3>
                    <AiFormFiller
                      formType="quiz"
                      buttonLabel="✨ AI MCQ"
                      onFill={(extracted) => {
                        if (extracted.questions && extracted.questions[0]) {
                          const q0 = extracted.questions[0];
                          setNewQuizQ((prev) => ({
                            ...prev,
                            question: q0.question || prev.question,
                            optionA: q0.options?.[0] || prev.optionA,
                            optionB: q0.options?.[1] || prev.optionB,
                            optionC: q0.options?.[2] || prev.optionC,
                            optionD: q0.options?.[3] || prev.optionD,
                            correctIndex: q0.correctIndex ?? prev.correctIndex,
                            explanation: q0.explanation || prev.explanation,
                          }));
                        } else if (extracted.question) {
                          setNewQuizQ((prev) => ({
                            ...prev,
                            question: extracted.question,
                            optionA: extracted.options?.[0] || prev.optionA,
                            optionB: extracted.options?.[1] || prev.optionB,
                            optionC: extracted.options?.[2] || prev.optionC,
                            optionD: extracted.options?.[3] || prev.optionD,
                            correctIndex: extracted.correctIndex ?? prev.correctIndex,
                            explanation: extracted.explanation || prev.explanation,
                          }));
                        }
                      }}
                    />
                  </div>
                  <form onSubmit={handleAddQuizQuestion} className="space-y-3 text-xs sm:text-sm">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Select Mock Test *</label>
                      <select
                        value={newQuizQ.quizId}
                        onChange={(e) => setNewQuizQ({ ...newQuizQ, quizId: e.target.value })}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold focus:bg-white focus:border-blue-600 focus:outline-none"
                      >
                        {data.quizzes.map((q) => (
                          <option key={q.id} value={q.id}>
                            {q.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Question Text *</label>
                      <textarea
                        rows={2}
                        required
                        value={newQuizQ.question}
                        onChange={(e) => setNewQuizQ({ ...newQuizQ, question: e.target.value })}
                        placeholder="e.g. What is the unit of electric dipole moment?"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Option A *</label>
                        <input
                          type="text"
                          required
                          value={newQuizQ.optionA}
                          onChange={(e) => setNewQuizQ({ ...newQuizQ, optionA: e.target.value })}
                          placeholder="Option A"
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Option B *</label>
                        <input
                          type="text"
                          required
                          value={newQuizQ.optionB}
                          onChange={(e) => setNewQuizQ({ ...newQuizQ, optionB: e.target.value })}
                          placeholder="Option B"
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Option C</label>
                        <input
                          type="text"
                          value={newQuizQ.optionC}
                          onChange={(e) => setNewQuizQ({ ...newQuizQ, optionC: e.target.value })}
                          placeholder="Option C"
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Option D</label>
                        <input
                          type="text"
                          value={newQuizQ.optionD}
                          onChange={(e) => setNewQuizQ({ ...newQuizQ, optionD: e.target.value })}
                          placeholder="Option D"
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Correct Answer *</label>
                      <select
                        value={newQuizQ.correctIndex}
                        onChange={(e) => setNewQuizQ({ ...newQuizQ, correctIndex: Number(e.target.value) })}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                      >
                        <option value={0}>Option A is Correct</option>
                        <option value={1}>Option B is Correct</option>
                        <option value={2}>Option C is Correct</option>
                        <option value={3}>Option D is Correct</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Guruji Explanation</label>
                      <textarea
                        rows={2}
                        value={newQuizQ.explanation}
                        onChange={(e) => setNewQuizQ({ ...newQuizQ, explanation: e.target.value })}
                        placeholder="Why is this answer correct..."
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 font-bold text-white rounded-xl shadow-xs transition-all mt-2"
                    >
                      Add Question to Test
                    </button>
                  </form>
                </div>

                {/* Existing Quizzes */}
                <div className="lg:col-span-2 space-y-4">
                  {data.quizzes.map((quiz) => (
                    <div key={quiz.id} className="p-5 bg-white border border-slate-200 rounded-3xl shadow-xs space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
                        <div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                            {quiz.chapter}
                          </span>
                          <h4 className="font-black text-slate-900 text-base mt-1">{quiz.title}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                            {quiz.questions.length} Questions • {quiz.totalMarks} Marks
                          </span>
                          <button
                            onClick={() => setEditingQuiz(quiz)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-xl border border-blue-200 transition-colors"
                            title="Edit Test Details"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteQuiz(quiz.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors"
                            title="Delete Test"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {quiz.questions.map((q, idx) => (
                          <div key={q.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="font-bold text-slate-900 mb-1">
                                Q{idx + 1}. {q.question}
                              </div>
                              <div className="text-[11px] text-emerald-700 font-semibold">
                                Correct: Option {String.fromCharCode(65 + q.correctIndex)} ({q.options[q.correctIndex]})
                              </div>
                              {q.explanation && (
                                <div className="text-[10px] text-slate-500 mt-0.5">
                                  💡 {q.explanation}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => setEditingQuizQuestion({ quizId: quiz.id, question: q })}
                                className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                title="Edit Question"
                              >
                                <Pencil className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteQuizQuestion(quiz.id, q.id)}
                                className="p-1 text-rose-600 hover:bg-rose-100 rounded"
                                title="Delete Question"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Create Mock Test Modal */}
              {isAddingQuiz && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                          <Plus className="w-4 h-4 text-amber-500" /> Create New Mock Test / Quiz
                        </h3>
                        <AiFormFiller
                          formType="quiz"
                          buttonLabel="✨ AI Test"
                          onFill={(extracted) => {
                            if (extracted.title) {
                              setNewQuizMeta((prev) => ({
                                ...prev,
                                title: extracted.title,
                                chapter: extracted.chapter || extracted.title,
                                durationMinutes: extracted.durationMinutes || prev.durationMinutes,
                              }));
                            }
                          }}
                        />
                      </div>
                      <button
                        onClick={() => setIsAddingQuiz(false)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleCreateQuiz} className="space-y-3 text-xs sm:text-sm">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Select Batch *</label>
                        <select
                          value={newQuizMeta.courseId}
                          onChange={(e) => setNewQuizMeta({ ...newQuizMeta, courseId: e.target.value })}
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                        >
                          {data.courses.map((c) => (
                            <option key={c.id} value={c.id}>{c.title}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Test Title *</label>
                        <input
                          type="text"
                          required
                          value={newQuizMeta.title}
                          onChange={(e) => setNewQuizMeta({ ...newQuizMeta, title: e.target.value })}
                          placeholder="e.g. Electrostatics Full Mock Test 01"
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Chapter Name</label>
                          <input
                            type="text"
                            value={newQuizMeta.chapter}
                            onChange={(e) => setNewQuizMeta({ ...newQuizMeta, chapter: e.target.value })}
                            placeholder="e.g. Chapter 01"
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Duration (Minutes)</label>
                          <input
                            type="number"
                            value={newQuizMeta.durationMinutes}
                            onChange={(e) => setNewQuizMeta({ ...newQuizMeta, durationMinutes: Number(e.target.value) })}
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Total Marks</label>
                        <input
                          type="number"
                          value={newQuizMeta.totalMarks}
                          onChange={(e) => setNewQuizMeta({ ...newQuizMeta, totalMarks: Number(e.target.value) })}
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsAddingQuiz(false)}
                          className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 font-bold"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl shadow-xs"
                        >
                          Create Test
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Edit Mock Test Modal */}
              {editingQuiz && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                      <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                        <Pencil className="w-4 h-4 text-blue-600" /> Edit Mock Test Details
                      </h3>
                      <button
                        onClick={() => setEditingQuiz(null)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleUpdateQuiz} className="space-y-3 text-xs sm:text-sm">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Test Title *</label>
                        <input
                          type="text"
                          required
                          value={editingQuiz.title}
                          onChange={(e) => setEditingQuiz({ ...editingQuiz, title: e.target.value })}
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Chapter Name</label>
                          <input
                            type="text"
                            value={editingQuiz.chapter}
                            onChange={(e) => setEditingQuiz({ ...editingQuiz, chapter: e.target.value })}
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Duration (Mins)</label>
                          <input
                            type="number"
                            value={editingQuiz.durationMinutes}
                            onChange={(e) => setEditingQuiz({ ...editingQuiz, durationMinutes: Number(e.target.value) })}
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Total Marks</label>
                        <input
                          type="number"
                          value={editingQuiz.totalMarks}
                          onChange={(e) => setEditingQuiz({ ...editingQuiz, totalMarks: Number(e.target.value) })}
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setEditingQuiz(null)}
                          className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 font-bold"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Edit Question Modal */}
              {editingQuizQuestion && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                      <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                        <Pencil className="w-4 h-4 text-blue-600" /> Edit Question
                      </h3>
                      <button
                        onClick={() => setEditingQuizQuestion(null)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleUpdateQuizQuestion} className="space-y-3 text-xs sm:text-sm">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Question Text *</label>
                        <textarea
                          rows={3}
                          required
                          value={editingQuizQuestion.question.question}
                          onChange={(e) =>
                            setEditingQuizQuestion({
                              ...editingQuizQuestion,
                              question: { ...editingQuizQuestion.question, question: e.target.value },
                            })
                          }
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {['Option A', 'Option B', 'Option C', 'Option D'].map((optLabel, idx) => (
                          <div key={idx}>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">{optLabel} *</label>
                            <input
                              type="text"
                              required={idx < 2}
                              value={editingQuizQuestion.question.options[idx] || ''}
                              onChange={(e) => {
                                const newOpts = [...editingQuizQuestion.question.options];
                                newOpts[idx] = e.target.value;
                                setEditingQuizQuestion({
                                  ...editingQuizQuestion,
                                  question: { ...editingQuizQuestion.question, options: newOpts },
                                });
                              }}
                              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs"
                            />
                          </div>
                        ))}
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Correct Answer</label>
                        <select
                          value={editingQuizQuestion.question.correctIndex}
                          onChange={(e) =>
                            setEditingQuizQuestion({
                              ...editingQuizQuestion,
                              question: { ...editingQuizQuestion.question, correctIndex: Number(e.target.value) },
                            })
                          }
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                        >
                          <option value={0}>Option A is Correct</option>
                          <option value={1}>Option B is Correct</option>
                          <option value={2}>Option C is Correct</option>
                          <option value={3}>Option D is Correct</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Explanation</label>
                        <textarea
                          rows={2}
                          value={editingQuizQuestion.question.explanation}
                          onChange={(e) =>
                            setEditingQuizQuestion({
                              ...editingQuizQuestion,
                              question: { ...editingQuizQuestion.question, explanation: e.target.value },
                            })
                          }
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setEditingQuizQuestion(null)}
                          className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 font-bold"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs"
                        >
                          Save Question
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =====================================================================
              NEW: 7. TIMETABLE & WEEKLY ROUTINE MANAGER TAB
          ===================================================================== */}
          {activeTab === 'timetable' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form to add slot */}
              <div className="lg:col-span-1 bg-white border border-slate-200 p-6 rounded-3xl h-fit shadow-xs">
                <h3 className="font-black text-slate-900 text-base mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" /> Add Live Class Slot
                </h3>
                <form onSubmit={handleAddTimetableSlot} className="space-y-3 text-xs sm:text-sm">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Day of Week *</label>
                    <select
                      value={newSlot.day}
                      onChange={(e) => setNewSlot({ ...newSlot, day: e.target.value as TimetableSlot['day'] })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                    >
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Time Slot *</label>
                    <input
                      type="text"
                      required
                      value={newSlot.time}
                      onChange={(e) => setNewSlot({ ...newSlot, time: e.target.value })}
                      placeholder="e.g. 07:00 PM - 08:30 PM"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Subject &amp; Batch *</label>
                    <input
                      type="text"
                      required
                      value={newSlot.subject}
                      onChange={(e) => setNewSlot({ ...newSlot, subject: e.target.value })}
                      placeholder="e.g. Class 12 Physics"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Topic Name *</label>
                    <input
                      type="text"
                      required
                      value={newSlot.topic}
                      onChange={(e) => setNewSlot({ ...newSlot, topic: e.target.value })}
                      placeholder="e.g. Gauss's Law Derivations"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Faculty Name</label>
                    <input
                      type="text"
                      value={newSlot.faculty}
                      onChange={(e) => setNewSlot({ ...newSlot, faculty: e.target.value })}
                      placeholder="e.g. Er. Alok Sharma"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 font-bold text-white rounded-xl shadow-xs transition-all mt-2"
                  >
                    Add to Routine
                  </button>
                </form>
              </div>

              {/* Timetable List */}
              <div className="lg:col-span-2 space-y-3">
                {data.timetable.map((slot) => (
                  <div key={slot.id} className="p-4.5 bg-white border border-slate-200 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs hover:border-blue-200 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-16 text-center py-2 px-1 rounded-xl bg-slate-100 text-slate-700 font-black text-xs shrink-0">
                        {slot.day}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-500">{slot.time}</span>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">{slot.subject}</span>
                          {slot.isLiveNow && (
                            <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold border border-rose-300 animate-pulse">
                              LIVE NOW
                            </span>
                          )}
                        </div>
                        <h5 className="font-bold text-slate-900 text-sm mt-0.5">{slot.topic}</h5>
                        <div className="text-[11px] text-slate-400">By {slot.faculty}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* 1-Click Toggle Live Now */}
                      <button
                        onClick={() => handleToggleTimetableLive(slot.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                          slot.isLiveNow
                            ? 'bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                        title="Toggle live badge on timetable"
                      >
                        {slot.isLiveNow ? '🔴 Live Now' : '⚪ Mark Live'}
                      </button>

                      {/* Edit Slot */}
                      <button
                        onClick={() => setEditingTimetableSlot(slot)}
                        className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 transition-colors"
                        title="Edit Slot"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Slot */}
                      <button
                        onClick={() => handleDeleteTimetableSlot(slot.id)}
                        className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-xl border border-rose-200 transition-colors"
                        title="Remove Slot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Edit Timetable Slot Modal */}
              {editingTimetableSlot && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                      <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                        <Pencil className="w-4 h-4 text-blue-600" /> Edit Timetable Slot
                      </h3>
                      <button
                        onClick={() => setEditingTimetableSlot(null)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleUpdateTimetableSlot} className="space-y-3 text-xs sm:text-sm">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Day of Week *</label>
                        <select
                          value={editingTimetableSlot.day}
                          onChange={(e) => setEditingTimetableSlot({ ...editingTimetableSlot, day: e.target.value as TimetableSlot['day'] })}
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                        >
                          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Time Slot *</label>
                        <input
                          type="text"
                          required
                          value={editingTimetableSlot.time}
                          onChange={(e) => setEditingTimetableSlot({ ...editingTimetableSlot, time: e.target.value })}
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Subject &amp; Batch *</label>
                        <input
                          type="text"
                          required
                          value={editingTimetableSlot.subject}
                          onChange={(e) => setEditingTimetableSlot({ ...editingTimetableSlot, subject: e.target.value })}
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Topic Name *</label>
                        <input
                          type="text"
                          required
                          value={editingTimetableSlot.topic}
                          onChange={(e) => setEditingTimetableSlot({ ...editingTimetableSlot, topic: e.target.value })}
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Faculty Name</label>
                        <input
                          type="text"
                          value={editingTimetableSlot.faculty}
                          onChange={(e) => setEditingTimetableSlot({ ...editingTimetableSlot, faculty: e.target.value })}
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="checkbox"
                          id="editSlotLiveCheckbox"
                          checked={!!editingTimetableSlot.isLiveNow}
                          onChange={(e) => setEditingTimetableSlot({ ...editingTimetableSlot, isLiveNow: e.target.checked })}
                          className="w-4 h-4 rounded text-rose-600 bg-slate-100 border-slate-300"
                        />
                        <label htmlFor="editSlotLiveCheckbox" className="text-xs text-rose-700 font-bold flex items-center gap-1">
                          Mark as 🔴 Live Right Now
                        </label>
                      </div>

                      <div className="flex items-center gap-3 pt-3">
                        <button
                          type="submit"
                          className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors"
                        >
                          Save Changes
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingTimetableSlot(null)}
                          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =====================================================================
              8. STUDENT DIRECTORY & ACCESS CONTROL TAB
          ===================================================================== */}
          {activeTab === 'students' && (
            <div className="space-y-6">
              {/* Quick Summary Pill Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-xs">
                  <div className="text-xs uppercase font-extrabold text-slate-400">Total Enrolled</div>
                  <div className="text-2xl font-black text-slate-900 mt-0.5">{data.students.length}</div>
                </div>
                <div className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-xs">
                  <div className="text-xs uppercase font-extrabold text-slate-400">Batches Active</div>
                  <div className="text-2xl font-black text-blue-600 mt-0.5">{data.courses.length}</div>
                </div>
                <div className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-xs">
                  <div className="text-xs uppercase font-extrabold text-slate-400">With Active Access</div>
                  <div className="text-2xl font-black text-emerald-600 mt-0.5">
                    {data.students.filter((s) => s.enrolledCourseIds && s.enrolledCourseIds.length > 0).length}
                  </div>
                </div>
                <div className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-xs">
                  <div className="text-xs uppercase font-extrabold text-slate-400">Active Streaks</div>
                  <div className="text-2xl font-black text-amber-500 mt-0.5">
                    {data.students.filter((s) => (s.streakDays || 0) >= 3).length}
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-700 shadow-xs">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2 tracking-tight">
                    <Users className="w-4 h-4 text-blue-600" />
                    Enrolled Students Directory ({data.students.length})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Add new students, update personal details, or grant and revoke course access in 1-Click.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={studentSearchQuery}
                      onChange={(e) => setStudentSearchQuery(e.target.value)}
                      placeholder="Search name, phone, email..."
                      className="pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <button
                    onClick={() => setIsAddingStudent(true)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Student</span>
                  </button>
                </div>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm text-slate-700">
                    <thead className="bg-slate-50/80 text-slate-500 uppercase font-mono text-[10px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-3.5 px-5 font-bold">Student Name</th>
                        <th className="py-3.5 px-5 font-bold">Mobile Number</th>
                        <th className="py-3.5 px-5 font-bold">Streak</th>
                        <th className="py-3.5 px-5 font-bold">Enrolled Batches</th>
                        <th className="py-3.5 px-5 font-bold text-right">Actions &amp; Access</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.students
                        .filter((s) => {
                          if (!studentSearchQuery.trim()) return true;
                          const q = studentSearchQuery.toLowerCase();
                          return (
                            s.name.toLowerCase().includes(q) ||
                            s.phone.includes(q) ||
                            s.email.toLowerCase().includes(q)
                          );
                        })
                        .map((student: User) => (
                          <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-4 px-5">
                              <div className="flex items-center gap-3">
                                {student.avatar ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={student.avatar}
                                    alt={student.name}
                                    className="w-10 h-10 rounded-2xl object-cover ring-2 ring-blue-500/40 shrink-0 shadow-xs"
                                    onError={(e) => {
                                      (e.target as HTMLElement).style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs">
                                    {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <div className="font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
                                    <span>{student.name}</span>
                                    {student.rollNo && (
                                      <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600 font-mono font-bold">
                                        {student.rollNo}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-slate-400 font-mono truncate">{student.email}</div>
                                  {student.address && (
                                    <div className="text-[10px] text-slate-500 truncate flex items-center gap-1 mt-0.5 font-medium">
                                      <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                                      <span>{student.address}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-5 font-mono font-bold text-slate-800">
                              {student.phone}
                            </td>
                            <td className="py-4 px-5 text-xs font-bold text-amber-600">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200/80">
                                🔥 {student.streakDays || 5} Days
                              </span>
                            </td>
                            <td className="py-4 px-5">
                              <div className="flex flex-wrap gap-1">
                                {student.enrolledCourseIds.length === 0 ? (
                                  <span className="text-xs text-slate-400 italic">No active batch</span>
                                ) : (
                                  student.enrolledCourseIds.map((cId) => (
                                    <span
                                      key={cId}
                                      className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200"
                                    >
                                      {cId === 'course-1' ? 'Physics' : cId === 'course-2' ? 'Class 10' : 'Web Dev'}
                                    </span>
                                  ))
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-5 text-right">
                              <div className="flex items-center justify-end gap-1.5 flex-wrap sm:flex-nowrap">
                                {data.courses.map((c) => {
                                  const hasAccess = student.enrolledCourseIds.includes(c.id);
                                  return (
                                    <button
                                      key={c.id}
                                      onClick={() => handleToggleStudentCourse(student.id, c.id)}
                                      title={hasAccess ? `Revoke ${c.title}` : `Grant ${c.title}`}
                                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border active:scale-95 cursor-pointer ${
                                        hasAccess
                                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300'
                                          : 'bg-slate-100 text-slate-500 border-slate-300 hover:bg-emerald-50 hover:text-emerald-700'
                                      }`}
                                    >
                                      {c.id === 'course-1' ? 'Physics' : c.id === 'course-2' ? 'Class 10' : 'Web Dev'}:{' '}
                                      {hasAccess ? '✓' : '🔒'}
                                    </button>
                                  );
                                })}

                                <button
                                  onClick={() => setEditingStudent(student)}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200 active:scale-95 cursor-pointer"
                                  title="Edit Student"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => handleDeleteStudent(student.id)}
                                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200 active:scale-95 cursor-pointer"
                                  title="Delete Student"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Add Student Modal */}
              {isAddingStudent && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                          <Plus className="w-4 h-4 text-blue-600" /> Register New Student
                        </h3>
                        <AiFormFiller
                          formType="student"
                          onFill={(extracted) => setNewStudent((prev) => ({ ...prev, ...extracted }))}
                        />
                      </div>
                      <button
                        onClick={() => setIsAddingStudent(false)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleCreateStudent} className="space-y-3 text-xs sm:text-sm">
                      {/* Photo & Name */}
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={newStudent.avatar}
                            alt="Student preview"
                            className="w-12 h-12 rounded-xl object-cover ring-2 ring-blue-500 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80';
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">Profile Photo URL</label>
                            <input
                              type="url"
                              value={newStudent.avatar}
                              onChange={(e) => setNewStudent({ ...newStudent, avatar: e.target.value })}
                              placeholder="https://... photo link"
                              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-mono"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Student Full Name *</label>
                          <input
                            type="text"
                            required
                            value={newStudent.name}
                            onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                            placeholder="e.g. Vikas Kumar"
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Roll Number</label>
                          <input
                            type="text"
                            value={newStudent.rollNo}
                            onChange={(e) => setNewStudent({ ...newStudent, rollNo: e.target.value })}
                            placeholder="ICC-105"
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono font-bold"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Mobile Number *</label>
                          <input
                            type="text"
                            required
                            value={newStudent.phone}
                            onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                            placeholder="9876543210"
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Email ID</label>
                          <input
                            type="email"
                            value={newStudent.email}
                            onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                            placeholder="vikas@gmail.com"
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono"
                          />
                        </div>
                      </div>

                      {/* Residential Address Input */}
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">
                          Residential Address / Location *
                        </label>
                        <input
                          type="text"
                          required
                          value={newStudent.address}
                          onChange={(e) => setNewStudent({ ...newStudent, address: e.target.value })}
                          placeholder="e.g. Station Road, Ward No. 4, Bihar"
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Father&apos;s Name</label>
                          <input
                            type="text"
                            value={newStudent.fatherName}
                            onChange={(e) => setNewStudent({ ...newStudent, fatherName: e.target.value })}
                            placeholder="Shri ..."
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Class / Target Exam</label>
                          <input
                            type="text"
                            value={newStudent.classGrade}
                            onChange={(e) => setNewStudent({ ...newStudent, classGrade: e.target.value })}
                            placeholder="Class 12 - PCM"
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Login Password *</label>
                          <input
                            type="text"
                            required
                            value={newStudent.password}
                            onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                            placeholder="student123"
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Initial Streak Days</label>
                          <input
                            type="number"
                            value={newStudent.streakDays}
                            onChange={(e) => setNewStudent({ ...newStudent, streakDays: Number(e.target.value) })}
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-2">Enroll In Batches</label>
                        <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                          {data.courses.map((course) => {
                            const isEnrolled = newStudent.enrolledCourseIds.includes(course.id);
                            return (
                              <label key={course.id} className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                                <input
                                  type="checkbox"
                                  checked={isEnrolled}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setNewStudent({
                                        ...newStudent,
                                        enrolledCourseIds: [...newStudent.enrolledCourseIds, course.id],
                                      });
                                    } else {
                                      setNewStudent({
                                        ...newStudent,
                                        enrolledCourseIds: newStudent.enrolledCourseIds.filter((id) => id !== course.id),
                                      });
                                    }
                                  }}
                                  className="w-4 h-4 rounded text-blue-600"
                                />
                                <span>{course.title} (₹{course.price})</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsAddingStudent(false)}
                          className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 font-bold"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs"
                        >
                          Save &amp; Register Student
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Edit Student Modal */}
              {editingStudent && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                      <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                        <Pencil className="w-4 h-4 text-blue-600" /> Edit Student Details
                      </h3>
                      <button
                        onClick={() => setEditingStudent(null)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleUpdateStudent} className="space-y-3 text-xs sm:text-sm">
                      {/* Photo Preview & URL */}
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={editingStudent.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80'}
                            alt="Student avatar"
                            className="w-12 h-12 rounded-xl object-cover ring-2 ring-blue-500 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80';
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">Profile Photo URL</label>
                            <input
                              type="url"
                              value={editingStudent.avatar || ''}
                              onChange={(e) => setEditingStudent({ ...editingStudent, avatar: e.target.value })}
                              placeholder="https://... photo link"
                              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-mono"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Student Full Name *</label>
                          <input
                            type="text"
                            required
                            value={editingStudent.name}
                            onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Roll Number</label>
                          <input
                            type="text"
                            value={editingStudent.rollNo || ''}
                            onChange={(e) => setEditingStudent({ ...editingStudent, rollNo: e.target.value })}
                            placeholder="ICC-101"
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono font-bold"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Mobile Number *</label>
                          <input
                            type="text"
                            required
                            value={editingStudent.phone}
                            onChange={(e) => setEditingStudent({ ...editingStudent, phone: e.target.value })}
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Email ID</label>
                          <input
                            type="email"
                            value={editingStudent.email}
                            onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono"
                          />
                        </div>
                      </div>

                      {/* Residential Address */}
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">
                          Residential Address / Location
                        </label>
                        <input
                          type="text"
                          value={editingStudent.address || ''}
                          onChange={(e) => setEditingStudent({ ...editingStudent, address: e.target.value })}
                          placeholder="e.g. Station Road, Patna"
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Login Password</label>
                          <input
                            type="text"
                            value={editingStudent.password || 'student123'}
                            onChange={(e) => setEditingStudent({ ...editingStudent, password: e.target.value })}
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Streak Days</label>
                          <input
                            type="number"
                            value={editingStudent.streakDays || 5}
                            onChange={(e) => setEditingStudent({ ...editingStudent, streakDays: Number(e.target.value) })}
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-2">Enrolled Batches</label>
                        <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                          {data.courses.map((course) => {
                            const isEnrolled = editingStudent.enrolledCourseIds.includes(course.id);
                            return (
                              <label key={course.id} className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                                <input
                                  type="checkbox"
                                  checked={isEnrolled}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setEditingStudent({
                                        ...editingStudent,
                                        enrolledCourseIds: [...editingStudent.enrolledCourseIds, course.id],
                                      });
                                    } else {
                                      setEditingStudent({
                                        ...editingStudent,
                                        enrolledCourseIds: editingStudent.enrolledCourseIds.filter((id) => id !== course.id),
                                      });
                                    }
                                  }}
                                  className="w-4 h-4 rounded text-blue-600"
                                />
                                <span>{course.title} (₹{course.price})</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setEditingStudent(null)}
                          className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 font-bold"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =====================================================================
              9. CMS (CONTENT MANAGEMENT SYSTEM) TAB
          ===================================================================== */}
          {activeTab === 'cms' && (
            <div className="space-y-6">
              {/* Universal AI Website Customizer Studio */}
              <AiWebsiteCustomizer
                currentConfig={data.config}
                onUpdate={(cfg) => {
                  setData((prev) => ({ ...prev, config: cfg }));
                  refreshState();
                }}
              />

              <div className="bg-white border border-slate-200 p-4 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
                <div>
                  <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                    <PenTool className="w-4 h-4 text-blue-600" />
                    Website Content Management
                  </h3>
                  <p className="text-xs text-slate-500">
                    Manage hero headline, admission badge, daily practice problem, announcements, articles, toppers, and FAQs in real time.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl overflow-x-auto text-xs font-bold no-scrollbar">
                  <button
                    onClick={() => setCmsSubTab('hero')}
                    className={`px-3 py-1.5 rounded-xl transition-all shrink-0 ${
                      cmsSubTab === 'hero'
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🏠 Hero &amp; Stats
                  </button>
                  <button
                    onClick={() => setCmsSubTab('daily_quiz')}
                    className={`px-3 py-1.5 rounded-xl transition-all shrink-0 ${
                      cmsSubTab === 'daily_quiz'
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🎯 Daily MCQ
                  </button>
                  <button
                    onClick={() => setCmsSubTab('announcements')}
                    className={`px-3 py-1.5 rounded-xl transition-all shrink-0 ${
                      cmsSubTab === 'announcements'
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    📢 Notices ({data.announcements.length})
                  </button>
                  <button
                    onClick={() => setCmsSubTab('articles')}
                    className={`px-3 py-1.5 rounded-xl transition-all shrink-0 ${
                      cmsSubTab === 'articles'
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    📖 Articles ({data.articles.length})
                  </button>
                  <button
                    onClick={() => setCmsSubTab('testimonials')}
                    className={`px-3 py-1.5 rounded-xl transition-all shrink-0 ${
                      cmsSubTab === 'testimonials'
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🏆 Toppers ({data.testimonials.length})
                  </button>
                  <button
                    onClick={() => setCmsSubTab('faqs')}
                    className={`px-3 py-1.5 rounded-xl transition-all shrink-0 ${
                      cmsSubTab === 'faqs'
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    ❓ FAQs ({data.faqs.length})
                  </button>
                </div>
              </div>

              {/* =============================================================
                  CMS SUBTAB 1: HOMEPAGE HERO & BRANDING CMS
              ============================================================= */}
              {cmsSubTab === 'hero' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Form */}
                  <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        Homepage Banner &amp; Statistics
                      </h4>
                      {settingsSaved && (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Saved!
                        </span>
                      )}
                    </div>

                    <form onSubmit={handleSaveHeroBranding} className="space-y-3 text-xs">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">
                          Admission Badge Text (Top Banner Pill)
                        </label>
                        <input
                          type="text"
                          value={configForm.admissionBadgeText || ''}
                          onChange={(e) => setConfigForm({ ...configForm, admissionBadgeText: e.target.value })}
                          placeholder="e.g. New Academic Session 2026 Admissions Open"
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">
                          Main Hero Headline *
                        </label>
                        <input
                          type="text"
                          required
                          value={configForm.heroHeadline || ''}
                          onChange={(e) => setConfigForm({ ...configForm, heroHeadline: e.target.value })}
                          placeholder="e.g. Achieve Your Academic & Career Goals with ICC KE GURUJI"
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">
                          Hero Subheadline (Description Paragraph)
                        </label>
                        <textarea
                          rows={2}
                          value={configForm.heroSubheadline || ''}
                          onChange={(e) => setConfigForm({ ...configForm, heroSubheadline: e.target.value })}
                          placeholder="e.g. Daily YouTube Live interactive classes, chapter-wise handwritten PDF notes..."
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                        />
                      </div>

                      {/* 4 Metric Counters */}
                      <div className="pt-2 border-t border-slate-100 space-y-2">
                        <span className="font-bold text-slate-900 block text-xs">
                          4 Metric Counter Boxes on Homepage:
                        </span>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                            <span className="text-[10px] text-blue-700 font-bold">Counter 1</span>
                            <input
                              type="text"
                              value={configForm.stat1Value || '10,000+'}
                              onChange={(e) => setConfigForm({ ...configForm, stat1Value: e.target.value })}
                              className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900"
                            />
                            <input
                              type="text"
                              value={configForm.stat1Label || 'Enrolled Students'}
                              onChange={(e) => setConfigForm({ ...configForm, stat1Label: e.target.value })}
                              className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg text-[10px] text-slate-600"
                            />
                          </div>

                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                            <span className="text-[10px] text-emerald-700 font-bold">Counter 2</span>
                            <input
                              type="text"
                              value={configForm.stat2Value || '98.4%'}
                              onChange={(e) => setConfigForm({ ...configForm, stat2Value: e.target.value })}
                              className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900"
                            />
                            <input
                              type="text"
                              value={configForm.stat2Label || 'Highest Board Score'}
                              onChange={(e) => setConfigForm({ ...configForm, stat2Label: e.target.value })}
                              className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg text-[10px] text-slate-600"
                            />
                          </div>

                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                            <span className="text-[10px] text-amber-700 font-bold">Counter 3</span>
                            <input
                              type="text"
                              value={configForm.stat3Value || '24/7'}
                              onChange={(e) => setConfigForm({ ...configForm, stat3Value: e.target.value })}
                              className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900"
                            />
                            <input
                              type="text"
                              value={configForm.stat3Label || 'AI Doubt Tutor'}
                              onChange={(e) => setConfigForm({ ...configForm, stat3Label: e.target.value })}
                              className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg text-[10px] text-slate-600"
                            />
                          </div>

                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                            <span className="text-[10px] text-purple-700 font-bold">Counter 4</span>
                            <input
                              type="text"
                              value={configForm.stat4Value || '0% Fee'}
                              onChange={(e) => setConfigForm({ ...configForm, stat4Value: e.target.value })}
                              className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900"
                            />
                            <input
                              type="text"
                              value={configForm.stat4Label || 'Direct UPI Transfer'}
                              onChange={(e) => setConfigForm({ ...configForm, stat4Label: e.target.value })}
                              className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg text-[10px] text-slate-600"
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 font-bold text-white rounded-xl shadow-xs transition-colors mt-2"
                      >
                        Save Changes
                      </button>
                    </form>
                  </div>

                  {/* Live Hero Preview Card */}
                  <div className="bg-gradient-to-b from-blue-50/50 to-white border border-slate-200 p-6 rounded-3xl shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-blue-600" /> Real-time Website Preview
                      </div>

                      <div className="text-center space-y-3 py-4">
                        <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
                          {configForm.admissionBadgeText || 'New Session Admissions Open'}
                        </span>

                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                          {configForm.heroHeadline || 'Achieve Your Academic & Career Goals'}
                        </h2>

                        <p className="text-xs text-slate-600 max-w-md mx-auto line-clamp-3">
                          {configForm.heroSubheadline || 'Daily YouTube Live interactive classes...'}
                        </p>
                      </div>

                      {/* 4 Metrics Preview */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t border-slate-200/80">
                        <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-center">
                          <div className="text-sm font-black text-slate-900">{configForm.stat1Value || '10,000+'}</div>
                          <div className="text-[10px] text-blue-600 font-bold">{configForm.stat1Label || 'Students'}</div>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-center">
                          <div className="text-sm font-black text-slate-900">{configForm.stat2Value || '98.4%'}</div>
                          <div className="text-[10px] text-emerald-600 font-bold">{configForm.stat2Label || 'Score'}</div>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-center">
                          <div className="text-sm font-black text-slate-900">{configForm.stat3Value || '24/7'}</div>
                          <div className="text-[10px] text-amber-600 font-bold">{configForm.stat3Label || 'AI Tutor'}</div>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-center">
                          <div className="text-sm font-black text-slate-900">{configForm.stat4Value || '0% Fee'}</div>
                          <div className="text-[10px] text-purple-600 font-bold">{configForm.stat4Label || 'UPI'}</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Reflects immediately on student homepage</span>
                      <Link href="/" className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                        Open Homepage <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* =============================================================
                  CMS SUBTAB 2: DAILY PRACTICE MCQ CMS
              ============================================================= */}
              {cmsSubTab === 'daily_quiz' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Homepage Practice MCQ
                      </h4>
                      {homeQuizSaved && (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Saved!
                        </span>
                      )}
                    </div>

                    <form onSubmit={handleSaveHomeQuiz} className="space-y-3 text-xs">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">
                          Practice Question Text *
                        </label>
                        <textarea
                          rows={3}
                          required
                          value={homeQuizForm.question}
                          onChange={(e) => setHomeQuizForm({ ...homeQuizForm, question: e.target.value })}
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Option A *</label>
                          <input
                            type="text"
                            required
                            value={homeQuizForm.optionA}
                            onChange={(e) => setHomeQuizForm({ ...homeQuizForm, optionA: e.target.value })}
                            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Option B *</label>
                          <input
                            type="text"
                            required
                            value={homeQuizForm.optionB}
                            onChange={(e) => setHomeQuizForm({ ...homeQuizForm, optionB: e.target.value })}
                            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Option C *</label>
                          <input
                            type="text"
                            required
                            value={homeQuizForm.optionC}
                            onChange={(e) => setHomeQuizForm({ ...homeQuizForm, optionC: e.target.value })}
                            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Option D *</label>
                          <input
                            type="text"
                            required
                            value={homeQuizForm.optionD}
                            onChange={(e) => setHomeQuizForm({ ...homeQuizForm, optionD: e.target.value })}
                            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Correct Option *</label>
                        <select
                          value={homeQuizForm.correctIndex}
                          onChange={(e) => setHomeQuizForm({ ...homeQuizForm, correctIndex: Number(e.target.value) })}
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                        >
                          <option value={0}>Option A: {homeQuizForm.optionA}</option>
                          <option value={1}>Option B: {homeQuizForm.optionB}</option>
                          <option value={2}>Option C: {homeQuizForm.optionC}</option>
                          <option value={3}>Option D: {homeQuizForm.optionD}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Guruji Explanation &amp; Solution</label>
                        <textarea
                          rows={3}
                          value={homeQuizForm.explanation}
                          onChange={(e) => setHomeQuizForm({ ...homeQuizForm, explanation: e.target.value })}
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 font-bold text-white rounded-xl shadow-xs transition-colors"
                      >
                        Publish Practice MCQ to Homepage
                      </button>
                    </form>
                  </div>

                  {/* Preview of MCQ */}
                  <div className="bg-slate-50 border border-slate-200 p-6 rounded-3xl shadow-xs space-y-4">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-emerald-600" /> Live Interactive Preview
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl p-4.5 space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
                        <span>Daily Practice numerical</span>
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">+4 Marks</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm leading-snug">
                        {homeQuizForm.question}
                      </h4>
                      <div className="space-y-1.5 text-xs">
                        {[homeQuizForm.optionA, homeQuizForm.optionB, homeQuizForm.optionC, homeQuizForm.optionD].map((opt, i) => (
                          <div
                            key={i}
                            className={`p-2.5 rounded-xl border font-bold flex items-center justify-between ${
                              i === Number(homeQuizForm.correctIndex)
                                ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                                : 'bg-slate-50 border-slate-200 text-slate-700'
                            }`}
                          >
                            <span>{String.fromCharCode(65 + i)}. {opt}</span>
                            {i === Number(homeQuizForm.correctIndex) && (
                              <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full">Correct</span>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-slate-700">
                        <span className="font-bold text-blue-900 block mb-0.5">Guruji Solution:</span>
                        <p>{homeQuizForm.explanation}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* =============================================================
                  CMS SUBTAB 3: ANNOUNCEMENTS & NOTICE BOARD CMS
              ============================================================= */}
              {cmsSubTab === 'announcements' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1 bg-white border border-slate-200 p-6 rounded-3xl h-fit shadow-xs">
                    <h4 className="font-black text-slate-900 text-sm mb-3">Add Live Notice</h4>
                    <form onSubmit={handleCreateAnnouncement} className="space-y-3 text-xs">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Headline *</label>
                        <input
                          type="text"
                          required
                          value={newAnnouncement.title}
                          onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                          placeholder="e.g. 🔴 Live Numerical Class Today at 7:00 PM"
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Details Message</label>
                        <textarea
                          rows={3}
                          value={newAnnouncement.message}
                          onChange={(e) => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })}
                          placeholder="Students can read full notice here..."
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Category</label>
                        <select
                          value={newAnnouncement.category}
                          onChange={(e) => setNewAnnouncement({ ...newAnnouncement, category: e.target.value as Announcement['category'] })}
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                        >
                          <option value="live_class">🔴 Live Class Alert</option>
                          <option value="notes_alert">📚 Notes Alert</option>
                          <option value="exam_alert">⚡ Exam Alert</option>
                          <option value="general">📢 General Notice</option>
                        </select>
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 font-bold text-white rounded-xl shadow-xs transition-colors"
                      >
                        Publish Notice
                      </button>
                    </form>
                  </div>

                  <div className="lg:col-span-2 space-y-3">
                    {data.announcements.map((ann) => (
                      <div key={ann.id} className="p-4.5 bg-white border border-slate-200 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs hover:border-blue-200 transition-colors">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                              {ann.category} • {ann.date}
                            </span>
                            {ann.isPinned && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                                📌 Pinned
                              </span>
                            )}
                          </div>
                          <h5 className="font-bold text-slate-900 text-sm mt-1">{ann.title}</h5>
                          <p className="text-xs text-slate-500 mt-0.5">{ann.message}</p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleTogglePinAnnouncement(ann.id)}
                            className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl text-xs font-bold"
                            title="Toggle Pin"
                          >
                            📌
                          </button>
                          <button
                            onClick={() => setEditingAnnouncement(ann)}
                            className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition-colors"
                            title="Edit Notice"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteAnnouncement(ann.id)}
                            className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors"
                            title="Delete Notice"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Edit Announcement Modal */}
                  {editingAnnouncement && (
                    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
                      <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                          <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                            <Pencil className="w-4 h-4 text-blue-600" /> Edit Notice
                          </h3>
                          <button onClick={() => setEditingAnnouncement(null)} className="p-1.5 text-slate-400 hover:text-slate-700">
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        <form onSubmit={handleUpdateAnnouncement} className="space-y-3 text-xs">
                          <div>
                            <label className="block text-slate-700 font-bold mb-1">Headline *</label>
                            <input
                              type="text"
                              required
                              value={editingAnnouncement.title}
                              onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, title: e.target.value })}
                              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-700 font-bold mb-1">Message</label>
                            <textarea
                              rows={3}
                              value={editingAnnouncement.message}
                              onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, message: e.target.value })}
                              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                            />
                          </div>
                          <div className="flex items-center gap-2 pt-1">
                            <input
                              type="checkbox"
                              id="editPinAnn"
                              checked={!!editingAnnouncement.isPinned}
                              onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, isPinned: e.target.checked })}
                              className="w-4 h-4 rounded text-blue-600"
                            />
                            <label htmlFor="editPinAnn" className="text-xs text-slate-700 font-bold">Pin to Top Notice Bar</label>
                          </div>
                          <div className="flex items-center gap-3 pt-3">
                            <button type="submit" className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl">
                              Save Changes
                            </button>
                            <button type="button" onClick={() => setEditingAnnouncement(null)} className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl">
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* =============================================================
                  CMS SUBTAB 4: ARTICLES & STUDY GUIDES CMS
              ============================================================= */}
              {cmsSubTab === 'articles' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1 bg-white border border-slate-200 p-6 rounded-3xl h-fit shadow-xs">
                    <h4 className="font-black text-slate-900 text-sm mb-3">Add Study Article</h4>
                    <form onSubmit={handleCreateArticle} className="space-y-3 text-xs">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Title *</label>
                        <input
                          type="text"
                          required
                          value={newArticle.title}
                          onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Excerpt</label>
                        <input
                          type="text"
                          value={newArticle.excerpt}
                          onChange={(e) => setNewArticle({ ...newArticle, excerpt: e.target.value })}
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Category</label>
                        <input
                          type="text"
                          value={newArticle.category}
                          onChange={(e) => setNewArticle({ ...newArticle, category: e.target.value })}
                          placeholder="e.g. Preparation Guide / Physics Derivation"
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Read Time</label>
                        <input
                          type="text"
                          value={newArticle.readTime}
                          onChange={(e) => setNewArticle({ ...newArticle, readTime: e.target.value })}
                          placeholder="e.g. 5 min read"
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 font-bold text-white rounded-xl shadow-xs"
                      >
                        Publish Article
                      </button>
                    </form>
                  </div>

                  <div className="lg:col-span-2 space-y-3">
                    {data.articles.map((art) => (
                      <div key={art.id} className="p-4.5 bg-white border border-slate-200 rounded-3xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-blue-200 transition-colors">
                        <div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                            {art.category} • {art.readTime}
                          </span>
                          <h5 className="font-bold text-slate-900 text-sm mt-1">{art.title}</h5>
                          <p className="text-xs text-slate-500 mt-1">{art.excerpt}</p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => setEditingArticle(art)}
                            className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl"
                            title="Edit Article"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteArticle(art.id)}
                            className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl"
                            title="Delete Article"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Edit Article Modal */}
                  {editingArticle && (
                    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
                      <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                          <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                            <Pencil className="w-4 h-4 text-blue-600" /> Edit Article
                          </h3>
                          <button onClick={() => setEditingArticle(null)} className="p-1.5 text-slate-400 hover:text-slate-700">
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        <form onSubmit={handleUpdateArticle} className="space-y-3 text-xs">
                          <div>
                            <label className="block text-slate-700 font-bold mb-1">Title *</label>
                            <input
                              type="text"
                              required
                              value={editingArticle.title}
                              onChange={(e) => setEditingArticle({ ...editingArticle, title: e.target.value })}
                              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-700 font-bold mb-1">Excerpt</label>
                            <textarea
                              rows={2}
                              value={editingArticle.excerpt}
                              onChange={(e) => setEditingArticle({ ...editingArticle, excerpt: e.target.value })}
                              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-slate-700 font-bold mb-1">Category</label>
                              <input
                                type="text"
                                value={editingArticle.category}
                                onChange={(e) => setEditingArticle({ ...editingArticle, category: e.target.value })}
                                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                              />
                            </div>
                            <div>
                              <label className="block text-slate-700 font-bold mb-1">Read Time</label>
                              <input
                                type="text"
                                value={editingArticle.readTime}
                                onChange={(e) => setEditingArticle({ ...editingArticle, readTime: e.target.value })}
                                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-3 pt-3">
                            <button type="submit" className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl">
                              Save Changes
                            </button>
                            <button type="button" onClick={() => setEditingArticle(null)} className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl">
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* =============================================================
                  CMS SUBTAB 5: TESTIMONIALS & TOPPERS CMS
              ============================================================= */}
              {cmsSubTab === 'testimonials' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1 bg-white border border-slate-200 p-6 rounded-3xl h-fit shadow-xs">
                    <h4 className="font-black text-slate-900 text-sm mb-3">Add Topper Review</h4>
                    <form onSubmit={handleCreateTestimonial} className="space-y-3 text-xs">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Student Name *</label>
                        <input
                          type="text"
                          required
                          value={newTestimonial.studentName}
                          onChange={(e) => setNewTestimonial({ ...newTestimonial, studentName: e.target.value })}
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Exam Rank *</label>
                        <input
                          type="text"
                          required
                          value={newTestimonial.examRank}
                          onChange={(e) => setNewTestimonial({ ...newTestimonial, examRank: e.target.value })}
                          placeholder="e.g. 98.4% CBSE Board 2024"
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Exam Name</label>
                        <input
                          type="text"
                          value={newTestimonial.examName}
                          onChange={(e) => setNewTestimonial({ ...newTestimonial, examName: e.target.value })}
                          placeholder="Class 12 Physics Topper"
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Review</label>
                        <textarea
                          rows={3}
                          value={newTestimonial.review}
                          onChange={(e) => setNewTestimonial({ ...newTestimonial, review: e.target.value })}
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 font-bold text-white rounded-xl shadow-xs"
                      >
                        Publish Testimonial
                      </button>
                    </form>
                  </div>

                  <div className="lg:col-span-2 space-y-3">
                    {data.testimonials.map((t) => (
                      <div key={t.id} className="p-4.5 bg-white border border-slate-200 rounded-3xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-blue-200 transition-colors">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="font-bold text-slate-900 text-sm">{t.studentName}</h5>
                            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">{t.examRank}</span>
                          </div>
                          <p className="text-xs text-slate-600 italic">&quot;{t.review}&quot;</p>
                          <div className="text-[10px] text-slate-400 mt-1">{t.examName}</div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => setEditingTestimonial(t)}
                            className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl"
                            title="Edit Review"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTestimonial(t.id)}
                            className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl"
                            title="Delete Review"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Edit Testimonial Modal */}
                  {editingTestimonial && (
                    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
                      <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                          <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                            <Pencil className="w-4 h-4 text-blue-600" /> Edit Review
                          </h3>
                          <button onClick={() => setEditingTestimonial(null)} className="p-1.5 text-slate-400 hover:text-slate-700">
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        <form onSubmit={handleUpdateTestimonial} className="space-y-3 text-xs">
                          <div>
                            <label className="block text-slate-700 font-bold mb-1">Student Name *</label>
                            <input
                              type="text"
                              required
                              value={editingTestimonial.studentName}
                              onChange={(e) => setEditingTestimonial({ ...editingTestimonial, studentName: e.target.value })}
                              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-700 font-bold mb-1">Exam Rank *</label>
                            <input
                              type="text"
                              required
                              value={editingTestimonial.examRank}
                              onChange={(e) => setEditingTestimonial({ ...editingTestimonial, examRank: e.target.value })}
                              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-700 font-bold mb-1">Review</label>
                            <textarea
                              rows={3}
                              value={editingTestimonial.review}
                              onChange={(e) => setEditingTestimonial({ ...editingTestimonial, review: e.target.value })}
                              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                            />
                          </div>
                          <div className="flex items-center gap-3 pt-3">
                            <button type="submit" className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl">
                              Save Changes
                            </button>
                            <button type="button" onClick={() => setEditingTestimonial(null)} className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl">
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* =============================================================
                  CMS SUBTAB 6: FREQUENTLY ASKED QUESTIONS (FAQ) CMS
              ============================================================= */}
              {cmsSubTab === 'faqs' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1 bg-white border border-slate-200 p-6 rounded-3xl h-fit shadow-xs">
                    <h4 className="font-black text-slate-900 text-sm mb-3">Add FAQ</h4>
                    <form onSubmit={handleCreateFaq} className="space-y-3 text-xs">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Question *</label>
                        <input
                          type="text"
                          required
                          value={newFaq.question}
                          onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Answer *</label>
                        <textarea
                          rows={4}
                          required
                          value={newFaq.answer}
                          onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 font-bold text-white rounded-xl shadow-xs"
                      >
                        Publish FAQ
                      </button>
                    </form>
                  </div>

                  <div className="lg:col-span-2 space-y-3">
                    {data.faqs.map((faq) => (
                      <div key={faq.id} className="p-4.5 bg-white border border-slate-200 rounded-3xl shadow-xs flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:border-blue-200 transition-colors">
                        <div>
                          <h5 className="font-bold text-slate-900 text-sm mb-1">{faq.question}</h5>
                          <p className="text-xs text-slate-600">{faq.answer}</p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => setEditingFaq(faq)}
                            className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl"
                            title="Edit FAQ"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteFaq(faq.id)}
                            className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl"
                            title="Delete FAQ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Edit FAQ Modal */}
                  {editingFaq && (
                    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
                      <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                          <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                            <Pencil className="w-4 h-4 text-blue-600" /> Edit FAQ
                          </h3>
                          <button onClick={() => setEditingFaq(null)} className="p-1.5 text-slate-400 hover:text-slate-700">
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        <form onSubmit={handleUpdateFaq} className="space-y-3 text-xs">
                          <div>
                            <label className="block text-slate-700 font-bold mb-1">Question *</label>
                            <input
                              type="text"
                              required
                              value={editingFaq.question}
                              onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-700 font-bold mb-1">Answer *</label>
                            <textarea
                              rows={4}
                              required
                              value={editingFaq.answer}
                              onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                            />
                          </div>
                          <div className="flex items-center gap-3 pt-3">
                            <button type="submit" className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl">
                              Save Changes
                            </button>
                            <button type="button" onClick={() => setEditingFaq(null)} className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl">
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* =====================================================================
              9.5. WHATSAPP BOT HUB TAB (QR LINK & GEMINI AI)
          ===================================================================== */}
          {activeTab === 'whatsapp' && (
            <WhatsAppBotHub config={data.config} courses={data.courses} />
          )}

          {/* =====================================================================
              10. TELEGRAM GURUJI BOT & COMMAND CENTER
          ===================================================================== */}
          {activeTab === 'broadcast' && (
            <div className="space-y-6">
              {/* Telegram Command Center Card */}
              <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
                <div className="relative z-10 max-w-3xl space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-sky-300 animate-pulse"></span>
                      Telegram Webhook Bot Active
                    </span>
                    <span className="text-xs text-sky-100 font-mono">
                      @{data.config.telegramBotUsername || 'IccKeGurujiBot'}
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black">
                    Telegram Guruji Bot — Complete Mobile Dashboard Control
                  </h2>
                  <p className="text-xs sm:text-sm text-sky-100 leading-relaxed">
                    No laptop needed! Guruji can message the Telegram bot or tap action buttons directly on mobile to approve UPI payments, view live revenue statistics, and post urgent broadcast alerts to students.
                  </p>
                </div>
              </div>

              {/* Bot Webhook URL & Command Cheat Sheet */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Commands Cheat Sheet */}
                <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xs space-y-4">
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                    <Send className="w-4 h-4 text-sky-500" />
                    Telegram Bot Commands Cheat-Sheet
                  </h3>

                  <div className="space-y-2.5 text-xs">
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                      <span className="font-mono font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 shrink-0">
                        /pending
                      </span>
                      <p className="text-slate-700">
                        Displays the list of pending UPI payments. Each payment includes <strong>[✅ Approve]</strong> and <strong>[❌ Reject]</strong> action buttons for instant 1-tap verification.
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                      <span className="font-mono font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 shrink-0">
                        /stats
                      </span>
                      <p className="text-slate-700">
                        Shows a live summary of Total Enrolled Students, Today&apos;s Direct UPI Revenue, and Active Batches.
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                      <span className="font-mono font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 shrink-0">
                        /broadcast &lt;msg&gt;
                      </span>
                      <p className="text-slate-700">
                        Instantly publishes a notification to the website&apos;s live notice ticker and student dashboard.
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                      <span className="font-mono font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 shrink-0">
                        /timetable
                      </span>
                      <p className="text-slate-700">
                        Displays today&apos;s scheduled live classes, subjects, and faculty timings.
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                      <span className="font-mono font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 shrink-0">
                        /dpp
                      </span>
                      <p className="text-slate-700">
                        Displays students&apos; pending homework and numerical submissions waiting for evaluation.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right: Webhook Link & Quick Broadcast */}
                <div className="space-y-6">
                  {/* Webhook Configuration Card */}
                  <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xs space-y-3">
                    <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Telegram Bot Webhook Endpoint
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Your webhook endpoint is ready to receive Telegram commands:
                    </p>

                    <div className="p-3 bg-slate-50 rounded-xl font-mono text-xs text-slate-800 border border-slate-200 break-all select-all">
                      https://icckeguruji.vercel.app/api/telegram/webhook
                    </div>

                    <div className="text-[11px] text-slate-500 bg-blue-50 p-3 rounded-xl border border-blue-200 space-y-1">
                      <span className="font-bold text-blue-900">1-Click Link to Set Webhook:</span>
                      <p className="font-mono break-all text-[10px] text-blue-800">
                        https://api.telegram.org/bot&lt;BOT_TOKEN&gt;/setWebhook?url=https://icckeguruji.vercel.app/api/telegram/webhook
                      </p>
                    </div>
                  </div>

                  {/* Manual Broadcast Form */}
                  <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xs space-y-4">
                    <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                      <Send className="w-4 h-4 text-sky-500" />
                      Quick Notice Broadcast from Web
                    </h3>

                    {broadcastSent && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        Notice successfully broadcasted to student dashboard and Telegram group!
                      </div>
                    )}

                    <form onSubmit={handleSendBroadcast} className="space-y-3">
                      <textarea
                        rows={3}
                        required
                        value={broadcastMsg}
                        onChange={(e) => setBroadcastMsg(e.target.value)}
                        placeholder="e.g. 🔴 LIVE CLASS: Today at 7:00 PM Electrostatics masterclass will begin!"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      />

                      <button
                        type="submit"
                        disabled={!broadcastMsg.trim()}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                      >
                        <Send className="w-4 h-4" />
                        Publish Broadcast to All Students
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================================
              11. SETTINGS TAB
          ===================================================================== */}
          {activeTab === 'settings' && (
            <div className="max-w-4xl space-y-6">
              {/* Header */}
              <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-black text-slate-900 text-xl flex items-center gap-2.5">
                      <Settings className="w-6 h-6 text-blue-600" />
                      Institute Settings &amp; Branding
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                      Configure your coaching logo, browser favicon, center address, contact numbers, social media links, and direct UPI payment gateway.
                    </p>
                  </div>
                  {settingsSaved && (
                    <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2 shrink-0 animate-in fade-in duration-200">
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Settings saved!</span>
                    </div>
                  )}
                </div>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-6">
                {/* 1. Institute Identity & Branding Assets */}
                <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-xs space-y-6">
                  <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-base">Institute Branding &amp; Visual Assets</h4>
                      <p className="text-xs text-slate-500">Manage coaching logo, favicon icon, tagline and official seal</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="sm:col-span-2">
                      <label className="block text-slate-800 font-bold text-xs mb-1.5">
                        Coaching Institute Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={configForm.coachingName || ''}
                        onChange={(e) => setConfigForm({ ...configForm, coachingName: e.target.value })}
                        placeholder="e.g. ICC KE GURUJI"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-slate-800 font-bold text-xs mb-1.5">
                        Institute Tagline / Slogan
                      </label>
                      <input
                        type="text"
                        value={configForm.tagline || ''}
                        onChange={(e) => setConfigForm({ ...configForm, tagline: e.target.value })}
                        placeholder="e.g. Class 9th to 12th & Board Exam Special Coaching"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                      />
                    </div>

                    {/* Logo URL with Live Preview */}
                    <div className="sm:col-span-2 p-4 bg-slate-50/80 border border-slate-200 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-slate-800 font-bold text-xs">
                          Institute Logo URL (Navbar, Footer, Certificates &amp; Login)
                        </label>
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                          Recommended: PNG / SVG / JPG
                        </span>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <input
                          type="url"
                          value={configForm.logoUrl || ''}
                          onChange={(e) => setConfigForm({ ...configForm, logoUrl: e.target.value })}
                          placeholder="https://example.com/logo.png (or leave blank for default emblem)"
                          className="flex-1 w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {configForm.logoUrl && (
                          <button
                            type="button"
                            onClick={() => setConfigForm({ ...configForm, logoUrl: '' })}
                            className="px-3 py-2 text-xs font-bold text-slate-500 hover:text-rose-600 border border-slate-200 rounded-xl hover:bg-white shrink-0 transition-colors"
                          >
                            Reset to Default
                          </button>
                        )}
                      </div>

                      {/* Live Logo Preview Box */}
                      <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center gap-3">
                        <div className="text-xs font-bold text-slate-500 shrink-0">Live Logo Preview:</div>
                        <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
                          <Logo size="md" logoUrl={configForm.logoUrl} />
                          <span className="text-[11px] text-slate-400">
                            {configForm.logoUrl ? '✓ Custom Logo Loaded' : '✓ Default Geometric Emblem Active'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Favicon URL with Live Preview */}
                    <div className="p-4 bg-slate-50/80 border border-slate-200 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-slate-800 font-bold text-xs">
                          Browser Favicon URL (.ico / .png)
                        </label>
                        <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                          Browser Tab Icon
                        </span>
                      </div>

                      <input
                        type="url"
                        value={configForm.faviconUrl || ''}
                        onChange={(e) => setConfigForm({ ...configForm, faviconUrl: e.target.value })}
                        placeholder="https://example.com/favicon.ico"
                        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />

                      <div className="flex items-center gap-3 pt-1">
                        <span className="text-xs font-bold text-slate-500">Preview:</span>
                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-300 flex items-center justify-center p-1 overflow-hidden shadow-xs">
                          {configForm.faviconUrl ? (
                            <img src={configForm.faviconUrl} alt="Favicon" className="w-full h-full object-contain" />
                          ) : (
                            <Globe className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {configForm.faviconUrl ? 'Custom Favicon Active' : 'Default Browser Icon'}
                        </span>
                      </div>
                    </div>

                    {/* Official Stamp / Seal URL */}
                    <div className="p-4 bg-slate-50/80 border border-slate-200 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-slate-800 font-bold text-xs">
                          Institute Official Stamp / Seal URL
                        </label>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Marksheets &amp; Receipts
                        </span>
                      </div>

                      <input
                        type="url"
                        value={configForm.instituteStampUrl || ''}
                        onChange={(e) => setConfigForm({ ...configForm, instituteStampUrl: e.target.value })}
                        placeholder="https://example.com/stamp.png"
                        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />

                      <div className="flex items-center gap-3 pt-1">
                        <span className="text-xs font-bold text-slate-500">Stamp Preview:</span>
                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-300 flex items-center justify-center p-1 overflow-hidden shadow-xs">
                          {configForm.instituteStampUrl ? (
                            <img src={configForm.instituteStampUrl} alt="Stamp" className="w-full h-full object-contain" />
                          ) : (
                            <Award className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {configForm.instituteStampUrl ? 'Custom Stamp Ready' : 'Optional Seal'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-800 font-bold text-xs mb-1.5">
                        Established Year
                      </label>
                      <input
                        type="text"
                        value={configForm.establishedYear || '2020'}
                        onChange={(e) => setConfigForm({ ...configForm, establishedYear: e.target.value })}
                        placeholder="e.g. 2020"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Physical Address & Center Location */}
                <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-xs space-y-5">
                  <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-base">Center Address &amp; Location</h4>
                      <p className="text-xs text-slate-500">Physical coaching center location displayed in footer and receipts</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-800 font-bold text-xs mb-1.5">
                      Coaching Center Physical Address
                    </label>
                    <textarea
                      rows={2}
                      value={configForm.address || ''}
                      onChange={(e) => setConfigForm({ ...configForm, address: e.target.value })}
                      placeholder="e.g. Station Road, Main Market, Ward No. 4"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                    />
                    <span className="text-[11px] text-slate-400 block mt-1">
                      Appears in the website footer directory and on fee receipts.
                    </span>
                  </div>
                </div>

                {/* 3. Communication & Contact Helplines */}
                <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-xs space-y-5">
                  <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-base">Helpline &amp; Communication Channels</h4>
                      <p className="text-xs text-slate-500">Direct WhatsApp support, alternate contact helpline, and student alert email</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-800 font-bold text-xs mb-1.5">
                        Primary WhatsApp Helpline Number *
                      </label>
                      <input
                        type="text"
                        required
                        value={configForm.whatsappNumber || ''}
                        onChange={(e) => setConfigForm({ ...configForm, whatsappNumber: e.target.value })}
                        placeholder="+919876543210"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                      />
                      <span className="text-[11px] text-slate-400 mt-1 block">Used for direct 1-click WhatsApp counseling links.</span>
                    </div>

                    <div>
                      <label className="block text-slate-800 font-bold text-xs mb-1.5">
                        Alternate Phone / Student Helpline
                      </label>
                      <input
                        type="text"
                        value={configForm.alternatePhone || ''}
                        onChange={(e) => setConfigForm({ ...configForm, alternatePhone: e.target.value })}
                        placeholder="+91 9934215013"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                      />
                      <span className="text-[11px] text-slate-400 mt-1 block">Secondary student calling helpline.</span>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-slate-800 font-bold text-xs mb-1.5">
                        Official Contact &amp; Alert Email
                      </label>
                      <input
                        type="email"
                        value={configForm.contactEmail || ''}
                        onChange={(e) => setConfigForm({ ...configForm, contactEmail: e.target.value })}
                        placeholder="contact@icckeguruji.com"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                      />
                      <span className="text-[11px] text-slate-400 mt-1 block">Payment notifications and test alerts are sent to this address.</span>
                    </div>

                    <div>
                      <label className="block text-slate-800 font-bold text-xs mb-1.5">
                        Telegram Bot Username
                      </label>
                      <input
                        type="text"
                        value={configForm.telegramBotUsername || ''}
                        onChange={(e) => setConfigForm({ ...configForm, telegramBotUsername: e.target.value })}
                        placeholder="IccKeGurujiBot"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-800 font-bold text-xs mb-1.5">
                        Paid Telegram Group / Channel Link
                      </label>
                      <input
                        type="url"
                        value={configForm.telegramGroupLink || ''}
                        onChange={(e) => setConfigForm({ ...configForm, telegramGroupLink: e.target.value })}
                        placeholder="https://t.me/icckeguruji_official"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Social Media Channels */}
                <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-xs space-y-5">
                  <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                    <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold">
                      <Share2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-base">Official Social Media Channels</h4>
                      <p className="text-xs text-slate-500">Connect YouTube, Instagram, and Facebook profiles</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-slate-800 font-bold text-xs mb-1.5">
                        YouTube Channel URL
                      </label>
                      <input
                        type="url"
                        value={configForm.youtubeChannelUrl || ''}
                        onChange={(e) => setConfigForm({ ...configForm, youtubeChannelUrl: e.target.value })}
                        placeholder="https://youtube.com/@icckeguruji"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-800 font-bold text-xs mb-1.5">
                        Instagram Profile URL
                      </label>
                      <input
                        type="url"
                        value={configForm.instagramUrl || ''}
                        onChange={(e) => setConfigForm({ ...configForm, instagramUrl: e.target.value })}
                        placeholder="https://instagram.com/icckeguruji"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-pink-500 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-800 font-bold text-xs mb-1.5">
                        Facebook Page URL
                      </label>
                      <input
                        type="url"
                        value={configForm.facebookUrl || ''}
                        onChange={(e) => setConfigForm({ ...configForm, facebookUrl: e.target.value })}
                        placeholder="https://facebook.com/icckeguruji"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* 5. Payment & UPI Gateway */}
                <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-xs space-y-5">
                  <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-base">Direct UPI Payment Gateway (0% Commission)</h4>
                      <p className="text-xs text-slate-500">Student fees transfer directly to your personal UPI ID / bank</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-800 font-bold text-xs mb-1.5">
                        Your Personal / Business UPI ID *
                      </label>
                      <input
                        type="text"
                        required
                        value={configForm.upiId || ''}
                        onChange={(e) => setConfigForm({ ...configForm, upiId: e.target.value })}
                        placeholder="e.g. icckeguruji@okaxis"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-blue-400 rounded-xl text-slate-900 font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                      />
                      <span className="text-[11px] text-slate-400 mt-1 block">Dynamic QR code generated automatically for all course checkouts.</span>
                    </div>

                    <div>
                      <label className="block text-slate-800 font-bold text-xs mb-1.5">
                        Merchant / Payee Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={configForm.merchantName || ''}
                        onChange={(e) => setConfigForm({ ...configForm, merchantName: e.target.value })}
                        placeholder="e.g. ICC KE GURUJI"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                      />
                      <span className="text-[11px] text-slate-400 mt-1 block">Name shown on Google Pay, PhonePe, and Paytm screens.</span>
                    </div>
                  </div>
                </div>

                {/* 6. Google Apps Script Email Alerts */}
                <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/50 border-2 border-blue-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                          Google Apps Script Email Alerts (script.new)
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                            100% FREE
                          </span>
                        </h4>
                        <p className="text-[11px] text-slate-600">
                          Dispatch automated Password Reset OTPs and Payment Receipts directly via your personal Gmail (Zero Monthly Fees).
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href="https://script.new"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 shadow-xs transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                        <span>Open script.new</span>
                      </a>
                      <button
                        type="button"
                        onClick={handleCopyGasScript}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
                      >
                        {copyGasSuccess ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Script Code</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* 3 Step Instruction Box */}
                  <div className="p-3 bg-white/80 border border-blue-100 rounded-xl text-[11px] text-slate-600 space-y-1">
                    <p className="font-bold text-slate-800">⚡ 30-Second Setup Guide:</p>
                    <ol className="list-decimal list-inside space-y-0.5 text-slate-600 pl-1">
                      <li>Click <b>&quot;Copy Script Code&quot;</b> above and open <b>&quot;script.new&quot;</b>.</li>
                      <li>Paste the code, then click top-right <b>Deploy ➜ New deployment ➜ Web app</b>.</li>
                      <li>Set <b>Execute as: Me</b> and <b>Who has access: Anyone</b>, click Deploy, and paste the generated Web app URL below:</li>
                    </ol>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Google Apps Script Web App URL
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="url"
                        value={configForm.googleAppsScriptEmailUrl || ''}
                        onChange={(e) => setConfigForm({ ...configForm, googleAppsScriptEmailUrl: e.target.value })}
                        placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                        className="flex-1 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={handleTestEmail}
                        disabled={testEmailLoading}
                        className="px-4 py-2.5 bg-slate-900 hover:bg-black disabled:opacity-60 text-white rounded-xl text-xs font-bold shrink-0 flex items-center justify-center gap-2 shadow-xs transition-all"
                      >
                        {testEmailLoading ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Sending Test...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Send Test Email</span>
                          </>
                        )}
                      </button>
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Until a live Web App URL is provided, the system safely operates in Demo Simulator mode with instant OTP display.
                    </span>
                  </div>

                  {testEmailResult && (
                    <div
                      className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                        testEmailResult.success
                          ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                          : 'bg-rose-50 border border-rose-200 text-rose-800'
                      }`}
                    >
                      {testEmailResult.success ? (
                        <Check className="w-4 h-4 shrink-0 stroke-[3]" />
                      ) : (
                        <AlertCircle className="w-4 h-4 shrink-0" />
                      )}
                      <span>{testEmailResult.message}</span>
                    </div>
                  )}
                </div>

                {/* Save Button */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm rounded-2xl shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Save All Settings</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* Mobile App Navigation Dock */}
      <MobileBottomNav currentUser={currentUser} />
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
          <p className="text-sm font-semibold text-slate-400">Loading ICC Admin Console...</p>
        </div>
      }
    >
      <AdminDashboardContent />
    </Suspense>
  );
}
