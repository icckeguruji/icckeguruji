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
  ThumbsUp,
  Pencil,
  Star,
  Eye,
  Mail,
  Copy,
  Loader2
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
import WhatsAppBotHub from '@/components/WhatsAppBotHub';
import MobileBottomNav from '@/components/MobileBottomNav';
import { GOOGLE_APPS_SCRIPT_CODE } from '@/lib/gasScript';

export default function AdminDashboardPage() {
  const [data, setData] = useState(getStoredData());
  const [currentUser, setCurrentUser] = useState<User>(data.user);
  
  // Left Sidebar active tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'payments' | 'courses' | 'lectures' | 'notes' | 'dpp' | 'pyq' | 'forum' | 'whatsapp' | 'students' | 'quizzes' | 'timetable' | 'cms' | 'broadcast' | 'settings'
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

  // Homepage Daily Quiz CMS form state
  const [homeQuizForm, setHomeQuizForm] = useState({
    question: data.config.homeQuizQuestion || "Agar do static charges ke beech ki distance ko half (r/2) kar diya jaye, toh unke beech lagne wala electrostatic force kitna ho jayega?",
    optionA: data.config.homeQuizOptions?.[0] || '2 Guna (Double)',
    optionB: data.config.homeQuizOptions?.[1] || '4 Guna (4 Times)',
    optionC: data.config.homeQuizOptions?.[2] || 'Aadha (Half)',
    optionD: data.config.homeQuizOptions?.[3] || '1/4th (One-Fourth)',
    correctIndex: data.config.homeQuizCorrectIndex ?? 1,
    explanation: data.config.homeQuizExplanation || "Correct Answer: B (4 Guna)! Coulomb's law ke mutabiq F ∝ 1/r². Jab distance aadhi (r/2) hogi, toh force 4 guna badh jayega. Sabhi batches mein aise chapter-wise mock tests available hain!",
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
  const [copyGasSuccess, setCopyGasSuccess] = useState(false);
  const [testEmailLoading, setTestEmailLoading] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<{ success: boolean; message: string } | null>(null);

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
    if (!confirm('Kya aap is course ko delete karna chahte hain?')) return;
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
      scheduledAt: 'Aaj shaam 7:00 PM',
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
    if (!confirm('Kya aap is lecture ko delete karna chahte hain?')) return;
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
    if (!confirm('Kya aap is PDF note ko delete karna chahte hain?')) return;
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
    if (!confirm('Kya aap is timetable slot ko delete karna chahte hain?')) return;
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
    if (!confirm('Kya aap is notice ko delete karna chahte hain?')) return;
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
    if (!confirm('Kya aap is article ko delete karna chahte hain?')) return;
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
    if (!confirm('Kya aap is topper review ko delete karna chahte hain?')) return;
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
    if (!confirm('Kya aap is FAQ ko delete karna chahte hain?')) return;
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
            : `⚠️ Webhook URL configure nahi hai (Simulator Mode). Real email bhejne ke liye script.new Web App URL paste karke Save karein.`
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
    { id: 'whatsapp', label: 'WhatsApp AI Bot (QR)', icon: MessageSquare, highlight: true },
    { id: 'broadcast', label: 'Telegram Guruji Bot', icon: Send, highlight: true },
    { id: 'quizzes', label: 'Quizzes & Mock Tests', icon: Award, count: data.quizzes.length },
    { id: 'timetable', label: 'Weekly Timetable', icon: Calendar, count: data.timetable.length },
    { id: 'students', label: 'Student Directory', icon: Users, count: data.students.length },
    { id: 'cms', label: 'CMS (Content Manager)', icon: PenTool },
    { id: 'settings', label: 'Institute Settings', icon: Settings },
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
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 w-full max-w-full overflow-x-hidden">
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
                {activeTab === 'whatsapp' && 'WhatsApp 24/7 AI Counselor & QR Connect'}
                {activeTab === 'broadcast' && 'Telegram Guruji Bot (Command Center & Dashboard Control)'}
                {activeTab === 'quizzes' && 'Chapter Quizzes & Mock Test Engine'}
                {activeTab === 'timetable' && 'Weekly Live Timetable & Routine'}
                {activeTab === 'students' && 'Enrolled Students Directory'}
                {activeTab === 'cms' && 'CMS (Content Management System)'}
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
        <main className="p-4 sm:p-8 flex-1 w-full max-w-full overflow-x-hidden pb-24 md:pb-8">
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
                  <div key={c.id} className="p-5 bg-white border border-slate-200 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xs hover:border-blue-200 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          {c.category}
                        </span>
                        {c.isPopular && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> Bestseller
                          </span>
                        )}
                      </div>
                      <h4 className="font-black text-slate-900 text-base">{c.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-1">{c.subtitle}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-600 font-medium pt-1">
                        <span>Price: <strong className="text-emerald-600">₹{c.price}</strong> <span className="line-through text-slate-400">₹{c.originalPrice}</span></span>
                        <span>•</span>
                        <span>Duration: {c.duration}</span>
                        <span>•</span>
                        <span>Mentor: {c.instructorName}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
                      <button
                        onClick={() => handleTogglePopular(c.id)}
                        title="Toggle Homepage Bestseller Badge"
                        className={`p-2 rounded-xl text-xs font-bold transition-colors border ${
                          c.isPopular
                            ? 'bg-amber-50 border-amber-300 text-amber-800'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-500'
                        }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${c.isPopular ? 'fill-amber-500 text-amber-500' : ''}`} />
                      </button>

                      <button
                        onClick={() => setEditingCourse(c)}
                        className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 flex items-center gap-1.5 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleDeleteCourse(c.id)}
                        className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-xl border border-rose-200 transition-colors"
                        title="Delete Course"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <Link
                        href={`/course/${c.id}`}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 rounded-xl border border-slate-300 flex items-center gap-1.5 transition-colors"
                      >
                        <span>Classroom</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
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
                        <Pencil className="w-4 h-4 text-blue-600" /> Edit Course CMS
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
                        <Pencil className="w-4 h-4 text-rose-600" /> Edit YouTube Lecture CMS
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
                        <Pencil className="w-4 h-4 text-blue-600" /> Edit PDF Note CMS
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
                        <Pencil className="w-4 h-4 text-blue-600" /> Edit Timetable Slot CMS
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
              9. CMS (CONTENT MANAGEMENT SYSTEM) TAB
          ===================================================================== */}
          {activeTab === 'cms' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 p-4 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
                <div>
                  <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                    <PenTool className="w-4 h-4 text-blue-600" />
                    Website Content Management System (CMS)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Hero headline, admission badge, daily practice question, notice board, articles, toppers aur FAQs ko live edit karein.
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
                        Homepage Hero Text &amp; Statistics Counter CMS
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
                          placeholder="e.g. New Academic Session 2026 Admissions Open • Direct UPI Zero Commission"
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
                          placeholder="e.g. Apne Career Ka Lakshya Haasil Karein with ICC KE GURUJI"
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
                              value={configForm.stat3Label || 'AI Guruji Doubt Tutor'}
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
                        Save Hero &amp; Branding CMS
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
                          {configForm.heroHeadline || 'Apne Career Ka Lakshya Haasil Karein'}
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
                        Homepage Practice MCQ CMS
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
                            <Pencil className="w-4 h-4 text-blue-600" /> Edit Notice CMS
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
                            <Pencil className="w-4 h-4 text-blue-600" /> Edit Article CMS
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
                          <p className="text-xs text-slate-600 italic">"{t.review}"</p>
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
                            <Pencil className="w-4 h-4 text-blue-600" /> Edit Topper Review CMS
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
                            <Pencil className="w-4 h-4 text-blue-600" /> Edit FAQ CMS
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
                    Aapko laptop kholne ki zarurat nahi hai! Guruji apne phone par Telegram bot ko message karke ya buttons tap karke UPI payments approve kar sakte hain, live stats dekh sakte hain, aur students ke liye urgent broadcast alerts post kar sakte hain.
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
                        Pending UPI payments ki list dikhata hai. Har payment ke niche <strong>[✅ Approve]</strong> aur <strong>[❌ Reject]</strong> ke buttons aate hain jinhe 1-tap me approve kiya ja sakta hai.
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                      <span className="font-mono font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 shrink-0">
                        /stats
                      </span>
                      <p className="text-slate-700">
                        Total Enrolled Students, Aaj ki Direct UPI Revenue, aur Active Batches ka live summary.
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                      <span className="font-mono font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 shrink-0">
                        /broadcast &lt;msg&gt;
                      </span>
                      <p className="text-slate-700">
                        Website ke live notice ticker aur student dashboard par instant notification publish karta hai.
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                      <span className="font-mono font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 shrink-0">
                        /timetable
                      </span>
                      <p className="text-slate-700">
                        Aaj ki sabhi scheduled live classes aur faculty timing dikhata hai.
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                      <span className="font-mono font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 shrink-0">
                        /dpp
                      </span>
                      <p className="text-slate-700">
                        Students ki pending homework aur numerical submissions review ke liye dikhata hai.
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
                      Telegram par commands receive karne ke liye aapka webhook endpoint 100% ready hai:
                    </p>

                    <div className="p-3 bg-slate-50 rounded-xl font-mono text-xs text-slate-800 border border-slate-200 break-all select-all">
                      https://icckeguruji.vercel.app/api/telegram/webhook
                    </div>

                    <div className="text-[11px] text-slate-500 bg-blue-50 p-3 rounded-xl border border-blue-200 space-y-1">
                      <span className="font-bold text-blue-900">Webhook Set Karne Ka 1-Click Link:</span>
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
                        Notice student dashboard aur Telegram group par live broadcast ho gaya!
                      </div>
                    )}

                    <form onSubmit={handleSendBroadcast} className="space-y-3">
                      <textarea
                        rows={3}
                        required
                        value={broadcastMsg}
                        onChange={(e) => setBroadcastMsg(e.target.value)}
                        placeholder="e.g. 🔴 LIVE CLASS: Aaj shaam 7:00 PM Electrostatics masterclass shuru hogi!"
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

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Official Contact & Alert Email</label>
                  <input
                    type="email"
                    value={configForm.contactEmail || ''}
                    onChange={(e) => setConfigForm({ ...configForm, contactEmail: e.target.value })}
                    placeholder="contact@icckeguruji.com"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                  />
                  <span className="text-[11px] text-slate-400">Payment alerts aur test emails is email par aayenge.</span>
                </div>

                {/* Google Apps Script (script.new) Email Dispatcher Integration */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/50 border-2 border-blue-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                          Google Apps Script Email Alerts (script.new)
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                            100% FREE
                          </span>
                        </h3>
                        <p className="text-[11px] text-slate-600">
                          Personal Gmail se automated Password Reset OTP aur Payment Receipts bhejein (Zero Monthly Fees).
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href="https://script.new"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 shadow-sm transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                        <span>Open script.new</span>
                      </a>
                      <button
                        type="button"
                        onClick={handleCopyGasScript}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
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
                      <li>Upar <b>&quot;Copy Script Code&quot;</b> par click karein aur <b>&quot;Open script.new&quot;</b> kholiye.</li>
                      <li>Wahan pura code paste karein aur top right <b>Deploy ➜ New deployment ➜ Web app</b> chuniye.</li>
                      <li><b>Execute as: Me</b> aur <b>Who has access: Anyone</b> select karke Deploy karein aur Web app URL copy karke yahan paste karein:</li>
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
                        className="px-4 py-2.5 bg-slate-900 hover:bg-black disabled:opacity-60 text-white rounded-xl text-xs font-bold shrink-0 flex items-center justify-center gap-2 shadow-sm transition-all"
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
                      Jab tak Web App URL add nahi hoga, system instant Demo Simulator mode me OTP display karega.
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

      {/* Mobile App Navigation Dock */}
      <MobileBottomNav currentUser={currentUser} />
    </div>
  );
}
