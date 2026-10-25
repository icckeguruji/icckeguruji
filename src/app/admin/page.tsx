'use client';

import React, { useState, useEffect } from 'react';
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
  TrendingUp,
  DollarSign,
  AlertCircle,
  ExternalLink,
  Trash2,
  Bell,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Search,
  ChevronRight,
  Menu,
  GraduationCap,
  Award,
  Calendar,
  Zap,
  CheckCircle2,
  Download,
  BookMarked,
  ThumbsUp
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
  TimetableSlot,
  Flashcard,
  DppAssignment,
  DppSubmission,
  PyqPaper,
  CommunityPost
} from '@/types';
import { getStoredData, saveStoredData } from '@/lib/storage';
import Logo from '@/components/Logo';

export default function AdminDashboardPage() {
  const [data, setData] = useState(getStoredData());
  const [currentUser, setCurrentUser] = useState<User>(data.user);
  
  // Left Sidebar active tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'payments' | 'courses' | 'lectures' | 'notes' | 'dpp' | 'pyq' | 'forum' | 'students' | 'quizzes' | 'timetable' | 'cms' | 'broadcast' | 'settings'
  >('overview');

  // CMS Sub-tabs: 'announcements' | 'articles' | 'testimonials' | 'faqs'
  const [cmsSubTab, setCmsSubTab] = useState<'announcements' | 'articles' | 'testimonials' | 'faqs'>('announcements');

  // Mobile sidebar drawer
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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
    scheduledAt: 'Aaj shaam 7:00 PM',
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

  // DPP Management state
  const [gradingSubmission, setGradingSubmission] = useState<DppSubmission | null>(null);
  const [marksInput, setMarksInput] = useState<number>(18);
  const [feedbackInput, setFeedbackInput] = useState<string>('Shabash beta! Bahut accha prayas.');
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

  useEffect(() => {
    refreshState();
    const handleStorageUpdate = () => refreshState();
    window.addEventListener('coaching_storage_updated', handleStorageUpdate);
    return () => window.removeEventListener('coaching_storage_updated', handleStorageUpdate);
  }, []);

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
      scheduledAt: 'Aaj shaam 7:00 PM',
      duration: '1 hr 30 min',
      chapterNumber: 1,
      description: '',
    });
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
    if (!confirm('Kya aap is DPP ko delete karna chahte hain?')) return;
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
    if (!confirm('Kya aap is PYQ paper ko delete karna chahte hain?')) return;
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

  // Stats
  const approvedPayments = data.payments.filter((p: PaymentRequest) => p.status === 'approved');
  const pendingPayments = data.payments.filter((p: PaymentRequest) => p.status === 'pending');
  const pendingDpps = (data.dppSubmissions || []).filter((s) => s.status === 'pending');
  const totalRevenue = approvedPayments.reduce((acc: number, curr: PaymentRequest) => acc + curr.amount, 0);

  // Left Sidebar items list
  const navItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
    {
      id: 'payments',
      label: 'UPI Approvals',
      icon: CreditCard,
      badge: pendingPayments.length > 0 ? pendingPayments.length : null,
      badgeColor: 'bg-amber-500 text-slate-950 font-black'
    },
    { id: 'courses', label: 'Courses & Batches', icon: BookOpen, count: data.courses.length },
    { id: 'lectures', label: 'Live & YouTube', icon: Radio, count: data.lessons.length },
    { id: 'notes', label: 'PDF Study Notes', icon: FileText, count: data.notes.length },
    {
      id: 'dpp',
      label: 'DPP & Homework',
      icon: CheckCircle2,
      badge: pendingDpps.length > 0 ? pendingDpps.length : null,
      badgeColor: 'bg-emerald-500 text-white font-black',
      count: (data.dpps || []).length
    },
    { id: 'pyq', label: 'PYQ Papers', icon: Download, count: (data.pyqPapers || []).length },
    { id: 'forum', label: 'Doubt Forum', icon: MessageSquare, count: (data.communityPosts || []).length },
    { id: 'quizzes', label: 'Quizzes & Mock Tests', icon: Award, count: data.quizzes.length },
    { id: 'timetable', label: 'Weekly Timetable', icon: Calendar, count: data.timetable.length },
    { id: 'students', label: 'Student Directory', icon: Users, count: data.students.length },
    { id: 'cms', label: 'CMS (Content Manager)', icon: PenTool, highlight: true },
    { id: 'broadcast', label: 'Broadcast & Alerts', icon: Send },
    { id: 'settings', label: 'Institute Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex selection:bg-blue-600 selection:text-white">
      {/* =========================================================================
          LEFT SIDEBAR (Fixed Desktop & Responsive Drawer)
      ========================================================================= */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo Header */}
          <div className="h-18 px-5 border-b border-slate-200 flex items-center justify-between">
            <Link href="/" className="hover:opacity-90 transition-opacity">
              <Logo size="sm" />
            </Link>
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Admin badge */}
          <div className="px-5 py-3 bg-purple-50/70 border-b border-purple-100 flex items-center justify-between text-xs">
            <span className="font-extrabold text-purple-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              Guruji Admin Console
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          {/* Sidebar Menu Items */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-210px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as typeof activeTab);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
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
                      <span className={`text-[11px] ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                        {item.count}
                      </span>
                    )}
                    {item.highlight && !isActive && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-100 text-amber-800 font-extrabold uppercase">
                        CMS
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer User Info */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                G
              </div>
              <div>
                <div className="font-bold text-xs text-slate-900 leading-tight">Guruji (Admin)</div>
                <div className="text-[10px] text-slate-500">Master Teacher Access</div>
              </div>
            </div>
          </div>

          <Link
            href="/"
            className="w-full py-2 px-3 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <span>Exit to Student Site</span>
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
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-18 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="font-black text-slate-900 text-base sm:text-lg capitalize flex items-center gap-2">
                {activeTab === 'overview' && 'Overview Analytics'}
                {activeTab === 'payments' && 'Direct UPI Payment Approvals'}
                {activeTab === 'courses' && 'Courses & Batches Management'}
                {activeTab === 'lectures' && 'Live YouTube Classes Schedule'}
                {activeTab === 'notes' && 'PDF Golden Notes Manager'}
                {activeTab === 'dpp' && 'Daily Practice Problems (DPP) & Homework Review'}
                {activeTab === 'pyq' && 'Previous Years Question Papers (PYQ) Hub'}
                {activeTab === 'forum' && 'Student Doubt Discussion Forum Moderator'}
                {activeTab === 'quizzes' && 'Chapter Quizzes & Mock Test Engine'}
                {activeTab === 'timetable' && 'Weekly Live Timetable & Routine'}
                {activeTab === 'students' && 'Enrolled Students Directory'}
                {activeTab === 'cms' && 'CMS (Content Management System)'}
                {activeTab === 'broadcast' && 'Telegram & WhatsApp Broadcast'}
                {activeTab === 'settings' && 'Institute Configuration'}
              </h2>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                ICC KE GURUJI Coaching Management System • Free Server Architecture
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              Live Server Active
            </span>
            <Link
              href="/course/course-1"
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 flex items-center gap-1.5 transition-colors"
            >
              <Radio className="w-3.5 h-3.5 text-rose-600" />
              <span>Live Classroom</span>
            </Link>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-4 sm:p-8 flex-1">
          {/* =====================================================================
              1. OVERVIEW TAB
          ===================================================================== */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-emerald-600 mb-2">
                    <span className="text-xs uppercase font-bold tracking-wider text-slate-500">Total Revenue</span>
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div className="text-3xl font-black text-slate-900">₹{totalRevenue.toLocaleString('en-IN')}</div>
                  <div className="text-[11px] text-emerald-700 mt-1 font-semibold flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" /> 0% Commission • 100% Direct Bank
                  </div>
                </div>

                <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-amber-600 mb-2">
                    <span className="text-xs uppercase font-bold tracking-wider text-slate-500">Pending Approvals</span>
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="text-3xl font-black text-slate-900">{pendingPayments.length}</div>
                  <div className="text-[11px] text-amber-700 mt-1 font-semibold">
                    Action required in UPI tab
                  </div>
                </div>

                <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-blue-600 mb-2">
                    <span className="text-xs uppercase font-bold tracking-wider text-slate-500">Total Students</span>
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="text-3xl font-black text-slate-900">{data.students.length}</div>
                  <div className="text-[11px] text-blue-700 mt-1 font-semibold">
                    Registered &amp; Enrolled
                  </div>
                </div>

                <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-rose-600 mb-2">
                    <span className="text-xs uppercase font-bold tracking-wider text-slate-500">Live Lectures</span>
                    <Radio className="w-5 h-5" />
                  </div>
                  <div className="text-3xl font-black text-slate-900">{data.lessons.length}</div>
                  <div className="text-[11px] text-rose-700 mt-1 font-semibold">
                    YouTube Stream Sessions
                  </div>
                </div>
              </div>

              {/* Quick Actions & Recent Pending */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-amber-500" />
                      Pending Payment Approvals ({pendingPayments.length})
                    </h3>
                    <button
                      onClick={() => setActiveTab('payments')}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800"
                    >
                      View All
                    </button>
                  </div>

                  {pendingPayments.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      Sabhi payments verify ho chuki hain!
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingPayments.map((p) => (
                        <div
                          key={p.id}
                          className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <div className="font-black text-slate-900">{p.userName}</div>
                            <div className="text-[11px] text-slate-500 font-mono">UTR: {p.utrNumber}</div>
                            <div className="text-[10px] text-blue-700 font-semibold">{p.courseTitle.slice(0, 30)}...</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-emerald-600 text-sm">₹{p.amount}</span>
                            <button
                              onClick={() => handleApprovePayment(p)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-xs"
                            >
                              Approve
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xs flex flex-col justify-between">
                  <div>
                    <h3 className="font-black text-slate-900 text-base mb-1 flex items-center gap-2">
                      <Send className="w-4 h-4 text-sky-500" />
                      Quick Notice Broadcast
                    </h3>
                    <p className="text-xs text-slate-500 mb-4">
                      Direct students ke dashboard aur Telegram par naya notice publish karein.
                    </p>

                    {broadcastSent && (
                      <div className="p-3 mb-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold">
                        Notice student dashboard aur Telegram group par live broadcast ho gaya!
                      </div>
                    )}

                    <textarea
                      value={broadcastMsg}
                      onChange={(e) => setBroadcastMsg(e.target.value)}
                      placeholder="e.g. Aaj ki live class shaam 7:00 PM par shuru hogi..."
                      rows={3}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <button
                    onClick={handleSendBroadcast}
                    disabled={!broadcastMsg.trim()}
                    className="w-full mt-3 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Instant Broadcast Notice</span>
                  </button>
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
                    Students apne UPI App se payment karke 12-digit UTR submit karte hain.
                    Aap <strong>"Approve"</strong> par click karenge toh course access instant unlock ho jayega!
                  </span>
                </div>
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
                            {p.status === 'pending' ? (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleApprovePayment(p)}
                                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition-all"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleRejectPayment(p.id)}
                                  className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold transition-colors"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 font-medium">Processed</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================================
              3. COURSES TAB
          ===================================================================== */}
          {activeTab === 'courses' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 bg-white border border-slate-200 p-6 rounded-3xl h-fit shadow-xs">
                <h3 className="font-black text-slate-900 text-base mb-3 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-blue-600" /> Add New Course
                </h3>
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
                  <div key={c.id} className="p-5 bg-white border border-slate-200 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xs">
                    <div>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        {c.category}
                      </span>
                      <h4 className="font-black text-slate-900 text-base mt-1">{c.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{c.subtitle}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-600 font-medium">
                        <span>Price: <strong className="text-emerald-600">₹{c.price}</strong></span>
                        <span>•</span>
                        <span>Duration: {c.duration}</span>
                      </div>
                    </div>

                    <Link
                      href={`/course/${c.id}`}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 rounded-xl border border-slate-300 shrink-0 flex items-center gap-1.5 transition-colors"
                    >
                      Open Classroom
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
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
                      placeholder="e.g. jfKfPfyJRdk ya poora URL"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono text-xs focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                    <span className="text-[11px] text-slate-400">YouTube Studio se unlisted stream link paste karein.</span>
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
                      placeholder="e.g. Aaj shaam 7:00 PM"
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
                  <div key={les.id} className="p-4.5 bg-white border border-slate-200 rounded-3xl flex items-center justify-between gap-4 shadow-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        {les.isLive ? (
                          <span className="text-[10px] bg-rose-100 text-rose-700 px-2.5 py-0.5 rounded-full font-bold border border-rose-300 animate-pulse">
                            LIVE NOW
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

                    <Link
                      href={`/course/${les.courseId}`}
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-blue-700 rounded-xl border border-slate-300 shrink-0"
                    >
                      View in Player
                    </Link>
                  </div>
                ))}
              </div>
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
                    <span className="text-[11px] text-slate-400">Direct cloud storage link yahan dalein.</span>
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

                    <a
                      href={note.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 rounded-xl border border-slate-300 shrink-0"
                    >
                      Open PDF
                    </a>
                  </div>
                ))}
              </div>
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
                        placeholder="Numericals step-by-step solve karein..."
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
                      <button
                        onClick={() => handleDeleteDpp(dpp.id)}
                        className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
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
                        onClick={() => handleDeletePyq(paper.id)}
                        className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =====================================================================
              NEW: COMMUNITY DOUBT DISCUSSION FORUM MODERATOR
          ===================================================================== */}
          {activeTab === 'forum' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-600" /> Student Doubts to Answer as Guruji (
                  {(data.communityPosts || []).length})
                </h3>
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
                          {post.isResolved && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              Resolved ✓
                            </span>
                          )}
                        </div>
                        <h4 className="font-black text-slate-900 text-base mt-1">{post.title}</h4>
                      </div>
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-xl">
                        👍 {post.upvotes}
                      </span>
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
            </div>
          )}

          {/* =====================================================================
              NEW: 6. QUIZZES & MOCK TESTS MANAGER TAB
          ===================================================================== */}
          {activeTab === 'quizzes' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form to add MCQ */}
              <div className="lg:col-span-1 bg-white border border-slate-200 p-6 rounded-3xl h-fit shadow-xs">
                <h3 className="font-black text-slate-900 text-base mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" /> Add MCQ to Mock Test
                </h3>
                <form onSubmit={handleAddQuizQuestion} className="space-y-3 text-xs sm:text-sm">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Select Mock Test *</label>
                    <select
                      value={newQuizQ.quizId}
                      onChange={(e) => setNewQuizQ({ ...newQuizQ, quizId: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
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
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                          {quiz.chapter}
                        </span>
                        <h4 className="font-black text-slate-900 text-base mt-1">{quiz.title}</h4>
                      </div>
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                        {quiz.questions.length} Questions • {quiz.totalMarks} Marks
                      </span>
                    </div>

                    <div className="space-y-2">
                      {quiz.questions.map((q, idx) => (
                        <div key={q.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs">
                          <div className="font-bold text-slate-900 mb-1">
                            Q{idx + 1}. {q.question}
                          </div>
                          <div className="text-[11px] text-emerald-700 font-semibold">
                            Correct: Option {String.fromCharCode(65 + q.correctIndex)} ({q.options[q.correctIndex]})
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
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
                  <div key={slot.id} className="p-4.5 bg-white border border-slate-200 rounded-3xl flex items-center justify-between gap-4 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-16 text-center py-2 px-1 rounded-xl bg-slate-100 text-slate-700 font-black text-xs shrink-0">
                        {slot.day}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-500">{slot.time}</span>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">{slot.subject}</span>
                        </div>
                        <h5 className="font-bold text-slate-900 text-sm mt-0.5">{slot.topic}</h5>
                        <div className="text-[11px] text-slate-400">By {slot.faculty}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const updated = data.timetable.filter((t) => t.id !== slot.id);
                        saveStoredData('TIMETABLE', updated);
                        refreshState();
                      }}
                      className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Remove Slot"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =====================================================================
              8. STUDENT DIRECTORY & ACCESS CONTROL TAB
          ===================================================================== */}
          {activeTab === 'students' && (
            <div className="space-y-6">
              <div className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-700 shadow-xs">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    Yahan aap sabhi registered students ko dekh sakte hain aur kisi bhi student ka course access **1-Click mein Unlock ya Revoke** kar sakte hain.
                  </span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm text-slate-700">
                    <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[11px] border-b border-slate-200">
                      <tr>
                        <th className="py-3.5 px-5 font-bold">Student Name</th>
                        <th className="py-3.5 px-5 font-bold">Mobile Number</th>
                        <th className="py-3.5 px-5 font-bold">Streak</th>
                        <th className="py-3.5 px-5 font-bold">Enrolled Batches</th>
                        <th className="py-3.5 px-5 font-bold text-right">Quick Access Toggle</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.students.map((student: User) => (
                        <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-4 px-5">
                            <div className="font-bold text-slate-900">{student.name}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{student.email}</div>
                          </td>
                          <td className="py-4 px-5 font-mono font-bold text-slate-800">
                            {student.phone}
                          </td>
                          <td className="py-4 px-5 text-xs font-bold text-amber-700">
                            {student.streakDays || 5} Days 🔥
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
                                    {cId}
                                  </span>
                                ))
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {data.courses.map((c) => {
                                const hasAccess = student.enrolledCourseIds.includes(c.id);
                                return (
                                  <button
                                    key={c.id}
                                    onClick={() => handleToggleStudentCourse(student.id, c.id)}
                                    title={hasAccess ? `Revoke ${c.title}` : `Grant ${c.title}`}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                                      hasAccess
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300'
                                        : 'bg-slate-100 text-slate-500 border-slate-300 hover:bg-emerald-50 hover:text-emerald-700'
                                    }`}
                                  >
                                    {c.id === 'course-1' ? 'Physics' : c.id === 'course-2' ? 'Class 10' : 'Web Dev'}:{' '}
                                    {hasAccess ? 'Active ✓' : 'Lock 🔒'}
                                  </button>
                                );
                              })}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================================
              9. CMS TAB
          ===================================================================== */}
          {activeTab === 'cms' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 p-4 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                <div>
                  <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                    <PenTool className="w-4 h-4 text-blue-600" />
                    Content Management System (CMS)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Website announcements, study guides, toppers aur FAQs bina code change kiye live edit karein.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl overflow-x-auto text-xs font-bold">
                  <button
                    onClick={() => setCmsSubTab('announcements')}
                    className={`px-3 py-1.5 rounded-xl transition-all ${
                      cmsSubTab === 'announcements'
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Notice Board ({data.announcements.length})
                  </button>
                  <button
                    onClick={() => setCmsSubTab('articles')}
                    className={`px-3 py-1.5 rounded-xl transition-all ${
                      cmsSubTab === 'articles'
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Articles ({data.articles.length})
                  </button>
                  <button
                    onClick={() => setCmsSubTab('testimonials')}
                    className={`px-3 py-1.5 rounded-xl transition-all ${
                      cmsSubTab === 'testimonials'
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Toppers ({data.testimonials.length})
                  </button>
                  <button
                    onClick={() => setCmsSubTab('faqs')}
                    className={`px-3 py-1.5 rounded-xl transition-all ${
                      cmsSubTab === 'faqs'
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    FAQs ({data.faqs.length})
                  </button>
                </div>
              </div>

              {/* Subtab 1: Announcements */}
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
                          placeholder="e.g. 🔴 Aaj Shaam 7 PM Live Numerical Class"
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Details Message</label>
                        <textarea
                          rows={3}
                          value={newAnnouncement.message}
                          onChange={(e) => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })}
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 font-bold text-white rounded-xl shadow-xs"
                      >
                        Publish Notice
                      </button>
                    </form>
                  </div>

                  <div className="lg:col-span-2 space-y-3">
                    {data.announcements.map((ann) => (
                      <div key={ann.id} className="p-4.5 bg-white border border-slate-200 rounded-3xl flex items-start justify-between gap-4 shadow-xs">
                        <div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                            {ann.category} • {ann.date}
                          </span>
                          <h5 className="font-bold text-slate-900 text-sm mt-1">{ann.title}</h5>
                          <p className="text-xs text-slate-500 mt-0.5">{ann.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Subtab 2: Articles */}
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
                      <div key={art.id} className="p-4.5 bg-white border border-slate-200 rounded-3xl shadow-xs">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                          {art.category} • {art.readTime}
                        </span>
                        <h5 className="font-bold text-slate-900 text-sm mt-1">{art.title}</h5>
                        <p className="text-xs text-slate-500 mt-1">{art.excerpt}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Subtab 3: Testimonials */}
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
                      <div key={t.id} className="p-4.5 bg-white border border-slate-200 rounded-3xl shadow-xs">
                        <div className="flex items-center justify-between mb-1">
                          <h5 className="font-bold text-slate-900 text-sm">{t.studentName}</h5>
                          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">{t.examRank}</span>
                        </div>
                        <p className="text-xs text-slate-600 italic">"{t.review}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Subtab 4: FAQs */}
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
                      <div key={faq.id} className="p-4.5 bg-white border border-slate-200 rounded-3xl shadow-xs">
                        <h5 className="font-bold text-slate-900 text-sm mb-1">{faq.question}</h5>
                        <p className="text-xs text-slate-600">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =====================================================================
              10. BROADCAST TAB
          ===================================================================== */}
          {activeTab === 'broadcast' && (
            <div className="max-w-3xl bg-white border border-slate-200 p-8 rounded-3xl shadow-xs space-y-6">
              <div>
                <h3 className="font-black text-slate-900 text-lg mb-1 flex items-center gap-2">
                  <Send className="w-5 h-5 text-sky-500" />
                  Instant Telegram &amp; WhatsApp Broadcast
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Yahan se aap sabhi enrolled students ko ek saath **Live Class Link**, **Naye Notes** ya **Exam Notification** send kar sakte hain. Ye alert direct student dashboard aur Telegram group par live reflect hoga.
                </p>
              </div>

              {broadcastSent && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <Check className="w-5 h-5 text-emerald-600 stroke-[3]" />
                  <span>Broadcast successfully sent! Notice board ticker aur Telegram group par alert chala gaya hai.</span>
                </div>
              )}

              <form onSubmit={handleSendBroadcast} className="space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Broadcast Message / Notice *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={broadcastMsg}
                    onChange={(e) => setBroadcastMsg(e.target.value)}
                    placeholder="e.g. 🔴 LIVE CLASS ALERT: Aaj shaam 7:00 PM Electrostatics masterclass shuru hone wali hai. Sabhi students formula notebook lekar ready rahein!"
                    className="w-full p-4 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none text-sm font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
                  <div className="p-3.5 bg-sky-50 rounded-2xl border border-sky-100 flex items-center gap-2.5">
                    <Send className="w-4 h-4 text-sky-600 shrink-0" />
                    <span>Telegram Group: <strong>{data.config.telegramGroupLink}</strong></span>
                  </div>
                  <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-2.5">
                    <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>WhatsApp Helpline: <strong>{data.config.whatsappNumber}</strong></span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!broadcastMsg.trim()}
                  className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-2xl shadow-md shadow-blue-500/20 text-sm flex items-center justify-center gap-2 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Broadcast to All Students</span>
                </button>
              </form>
            </div>
          )}

          {/* =====================================================================
              11. SETTINGS TAB
          ===================================================================== */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl bg-white border border-slate-200 p-8 rounded-3xl shadow-xs">
              <h3 className="font-black text-slate-900 text-lg mb-2 flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-600" />
                Institute &amp; Payment Configuration
              </h3>
              <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                Yahan aap apna UPI ID, Telegram group link aur WhatsApp helpline number change kar sakte hain. Ye changes real-time me QR modal aur student dashboard par reflect honge.
              </p>

              {settingsSaved && (
                <div className="p-3 mb-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0 stroke-[3]" />
                  <span>Settings successfully save ho gayi hain!</span>
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Coaching Institute Name</label>
                  <input
                    type="text"
                    value={configForm.coachingName}
                    onChange={(e) => setConfigForm({ ...configForm, coachingName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Your Personal/Business UPI ID *
                    </label>
                    <input
                      type="text"
                      required
                      value={configForm.upiId}
                      onChange={(e) => setConfigForm({ ...configForm, upiId: e.target.value })}
                      placeholder="e.g. icckeguruji@okaxis"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-blue-400 rounded-xl text-slate-900 font-mono font-bold"
                    />
                    <span className="text-[11px] text-slate-400">QR Code is UPI ID ke liye generate hoga.</span>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Merchant / Payee Name</label>
                    <input
                      type="text"
                      value={configForm.merchantName}
                      onChange={(e) => setConfigForm({ ...configForm, merchantName: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">WhatsApp Helpline Number</label>
                    <input
                      type="text"
                      value={configForm.whatsappNumber}
                      onChange={(e) => setConfigForm({ ...configForm, whatsappNumber: e.target.value })}
                      placeholder="+919876543210"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Telegram Bot Username</label>
                    <input
                      type="text"
                      value={configForm.telegramBotUsername}
                      onChange={(e) => setConfigForm({ ...configForm, telegramBotUsername: e.target.value })}
                      placeholder="IccKeGurujiBot"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Paid Telegram Group Link</label>
                  <input
                    type="url"
                    value={configForm.telegramGroupLink}
                    onChange={(e) => setConfigForm({ ...configForm, telegramGroupLink: e.target.value })}
                    placeholder="https://t.me/icckeguruji_official"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-all"
                >
                  Save Settings
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
