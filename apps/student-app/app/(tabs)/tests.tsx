import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CoachingHeader } from '../../src/components/CoachingHeader';
import { aiService, AIQuizQuestion } from '../../src/services/aiService';
import {
  academicService,
  AcademicSubject,
} from '../../src/services/academicService';
import { Course } from '@icc/shared-types';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useAppTheme } from '../../src/hooks/useAppTheme';
import {
  Sparkles,
  Award,
  CheckCircle2,
  XCircle,
  X,
  Clock,
  RotateCcw,
  Zap,
  Trophy,
  Flame,
  ArrowRight,
  BookOpen,
} from 'lucide-react-native';

export default function StudentQuizScreen() {
  const { user, updateProfile } = useAuthStore();
  const theme = useAppTheme();
  const isDark = theme.isDark;

  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [subjects, setSubjects] = useState<AcademicSubject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<AcademicSubject | null>(null);
  const [questionCount, setQuestionCount] = useState(5);
  const [loadingCourses, setLoadingCourses] = useState(true);

  const [masteredCount, setMasteredCount] = useState(0);
  const [cloudPoints, setCloudPoints] = useState(user?.quiz_points || 0);
  const [cloudBadges, setCloudBadges] = useState<string[]>(user?.badges || []);

  // Quiz Modal States
  const [isAiQuizModalOpen, setIsAiQuizModalOpen] = useState(false);
  const [quizPhase, setQuizPhase] = useState<'config' | 'playing' | 'result'>('config');
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  // Active Quiz Playing State
  const [questions, setQuestions] = useState<AIQuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [sessionPoints, setSessionPoints] = useState(0);
  const [sessionResults, setSessionResults] = useState<
    Array<{
      question: AIQuizQuestion;
      selectedIdx: number | null;
      isCorrect: boolean;
      pointsDelta: number;
    }>
  >([]);
  const [newBadgeUnlocked, setNewBadgeUnlocked] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load Student's Courses, Subjects & Live Mastered Quiz History
  useEffect(() => {
    const loadInitial = async () => {
      setLoadingCourses(true);
      try {
        const [allCourses, payments] = await Promise.all([
          academicService.getCourses(),
          academicService.getPayments(),
        ]);

        // Prioritize student's enrolled courses if logged in
        let studentCourses = allCourses;
        if (user?.id) {
          const enrolledIds = new Set(
            payments
              .filter((p: any) => (p.student_id === user.id || p.user_id === user.id) && p.status === 'approved')
              .map((p: any) => p.course_id)
          );
          const enrolledOnly = allCourses.filter((c) => enrolledIds.has(c.id));
          if (enrolledOnly.length > 0) {
            studentCourses = enrolledOnly;
          }
        }

        setCourses(studentCourses);
        if (studentCourses.length > 0) {
          setSelectedCourse(studentCourses[0]);
          const subs = await academicService.getSubjects(studentCourses[0].id);
          setSubjects(subs);
          if (subs.length > 0) setSelectedSubject(subs[0]);
        }

        const mastered = await aiService.getMasteredQuestions(user?.id || 'guest-student');
        setMasteredCount(mastered.ids.size);
        if (mastered.points > 0) setCloudPoints(mastered.points);
        if (mastered.badges.length > 0) setCloudBadges(mastered.badges);
      } catch (e) {
        console.warn('Quiz screen init error:', e);
      } finally {
        setLoadingCourses(false);
      }
    };
    loadInitial();
  }, [user?.id]);

  const handleSelectCourse = async (c: Course) => {
    setSelectedCourse(c);
    const subs = await academicService.getSubjects(c.id);
    setSubjects(subs);
    setSelectedSubject(subs.length > 0 ? subs[0] : null);
  };

  // 30-SECOND TIMER PER QUESTION
  useEffect(() => {
    if (quizPhase === 'playing' && !isAnswered) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            handleAnswerQuestion(-1, true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [quizPhase, currentIdx, isAnswered]);

  const handleStartAiQuiz = async () => {
    if (!selectedCourse) {
      Alert.alert('Course Required', 'Please select a course to start your quiz.');
      return;
    }

    setLoadingQuiz(true);
    try {
      const subjectName = selectedSubject?.name || 'All Subjects';
      const isUrdu = subjectName.toLowerCase().includes('urdu');
      const targetLanguage: 'hi' | 'ur' = isUrdu ? 'ur' : 'hi';

      // Gather Chapters & Study Materials (PDFs/Notes) for AI question generation
      const [chapters, allMaterials] = await Promise.all([
        selectedSubject ? academicService.getChapters(selectedSubject.id) : Promise.resolve([]),
        academicService.getStudyMaterials(),
      ]);

      const relevantMaterials = allMaterials.filter(
        (m: any) => !selectedSubject || m.subject_id === selectedSubject.id
      );

      const generated = await aiService.getLiveQuizQuestions(
        user?.id || 'guest-student',
        subjectName,
        undefined,
        targetLanguage,
        questionCount,
        {
          courseId: selectedCourse.id,
          courseTitle: selectedCourse.title,
          className: selectedCourse.class_name || 'Board Class',
          chapters: chapters.map((c) => ({
            chapter_number: c.chapter_number,
            title: c.title,
            description: c.description,
          })),
          materials: relevantMaterials.map((m) => ({
            title: m.title,
            description: m.description,
            file_path: m.file_path,
          })),
        }
      );

      if (generated.length === 0) {
        Alert.alert(
          'All Questions Mastered',
          'You have already answered all available questions in this subject correctly! Try another subject or add more PDF notes.'
        );
        setLoadingQuiz(false);
        return;
      }

      setQuestions(generated);
      setCurrentIdx(0);
      setTimeLeft(30);
      setIsAnswered(false);
      setSelectedOption(null);
      setSessionPoints(0);
      setSessionResults([]);
      setNewBadgeUnlocked(null);
      setQuizPhase('playing');
      setIsAiQuizModalOpen(true);
    } catch {
      Alert.alert('Error', 'Unable to generate AI quiz right now. Please try again.');
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handleAnswerQuestion = async (optionIdx: number, isTimeout = false) => {
    if (isAnswered) return;
    if (timerRef.current) clearInterval(timerRef.current);

    setIsAnswered(true);
    setSelectedOption(isTimeout ? null : optionIdx);

    const activeQ = questions[currentIdx];
    const isCorrect = !isTimeout && optionIdx === activeQ.correctIndex;

    const submission = await aiService.submitAnswer(
      user?.id || 'guest-student',
      activeQ.id,
      isCorrect,
      activeQ.subject,
      activeQ.chapter,
      cloudPoints,
      cloudBadges,
      activeQ.question
    );

    setCloudPoints(submission.newTotalPoints);
    if (submission.newlyUnlockedBadge) {
      setNewBadgeUnlocked(submission.newlyUnlockedBadge);
      setCloudBadges((prev) => [...prev, submission.newlyUnlockedBadge!]);
    }
    if (isCorrect) {
      setMasteredCount((prev) => prev + 1);
    }

    updateProfile({
      quiz_points: submission.newTotalPoints,
      badges: submission.newlyUnlockedBadge
        ? [...cloudBadges, submission.newlyUnlockedBadge]
        : cloudBadges,
    });

    setSessionPoints((prev) => prev + submission.pointsDelta);
    setSessionResults((prev) => [
      ...prev,
      {
        question: activeQ,
        selectedIdx: isTimeout ? null : optionIdx,
        isCorrect,
        pointsDelta: submission.pointsDelta,
      },
    ]);
  };

  const handleNextQuestion = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((prev) => prev + 1);
      setTimeLeft(30);
      setIsAnswered(false);
      setSelectedOption(null);
    } else {
      setQuizPhase('result');
    }
  };

  const correctCount = sessionResults.filter((r) => r.isCorrect).length;
  const activeQuestion = questions[currentIdx];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['top', 'left', 'right']}>
      <CoachingHeader />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Points & Badges Hero Card */}
        <View style={[styles.statsBanner, { backgroundColor: isDark ? '#111827' : '#1E293B', borderColor: theme.cardBorder }]}>
          <View style={styles.statsLeft}>
            <View style={styles.pointsRow}>
              <Trophy size={22} color="#FBBF24" />
              <Text style={styles.pointsTitle}>{cloudPoints} Points</Text>
            </View>
            <Text style={styles.pointsSub}>
              {masteredCount} Mastered Questions • {cloudBadges.length} Badges
            </Text>
          </View>
          <View style={styles.streakBadge}>
            <Flame size={15} color="#F59E0B" />
            <Text style={styles.streakText}>Live Sync</Text>
          </View>
        </View>

        {/* Badges Display */}
        {cloudBadges.length > 0 && (
          <View style={[styles.card, { backgroundColor: theme.surfaceCard, borderColor: theme.cardBorder }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Unlocked Badges</Text>
            <View style={styles.badgeWrap}>
              {cloudBadges.map((b, i) => (
                <View key={i} style={[styles.badgePill, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.16)' : '#FEF3C7', borderColor: '#F59E0B' }]}>
                  <Award size={13} color="#F59E0B" />
                  <Text style={[styles.badgeText, { color: isDark ? '#FCD34D' : '#B45309' }]}>{b}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* AI Quiz Generator Card */}
        <View style={[styles.card, { backgroundColor: theme.surfaceCard, borderColor: theme.cardBorder }]}>
          <View style={styles.aiHeaderRow}>
            <View style={[styles.aiIconBox, { backgroundColor: theme.primaryBg }]}>
              <Sparkles size={20} color={theme.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: theme.text, marginBottom: 2 }]}>
                AI Course & PDF Quiz
              </Text>
              <Text style={[styles.cardSub, { color: theme.textSecondary }]}>
                Reads your course chapters & PDF notes. Correctly answered questions never repeat!
              </Text>
            </View>
          </View>

          {loadingCourses ? (
            <ActivityIndicator size="small" color={theme.primary} style={{ marginVertical: 20 }} />
          ) : (
            <>
              {/* Select Course */}
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Select Course</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
                <View style={styles.chipRow}>
                  {courses.map((c) => {
                    const active = selectedCourse?.id === c.id;
                    return (
                      <TouchableOpacity
                        key={c.id}
                        style={[
                          styles.chip,
                          {
                            backgroundColor: active ? theme.primary : theme.inputBg,
                            borderColor: active ? theme.primary : theme.border,
                          },
                        ]}
                        onPress={() => handleSelectCourse(c)}
                      >
                        <Text style={[styles.chipText, { color: active ? '#FFFFFF' : theme.text }]}>
                          {c.title}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>

              {/* Select Subject */}
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
                Select Subject ({selectedSubject?.name?.toLowerCase().includes('urdu') ? 'Quiz in Urdu' : 'Quiz in Hindi'})
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
                <View style={styles.chipRow}>
                  {subjects.length === 0 ? (
                    <Text style={{ color: theme.textMuted, fontSize: 12 }}>No subjects in this course yet</Text>
                  ) : (
                    subjects.map((s) => {
                      const active = selectedSubject?.id === s.id;
                      return (
                        <TouchableOpacity
                          key={s.id}
                          style={[
                            styles.chip,
                            {
                              backgroundColor: active ? '#059669' : theme.inputBg,
                              borderColor: active ? '#059669' : theme.border,
                            },
                          ]}
                          onPress={() => setSelectedSubject(s)}
                        >
                          <Text style={[styles.chipText, { color: active ? '#FFFFFF' : theme.text }]}>
                            {s.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })
                  )}
                </View>
              </ScrollView>

              {/* Question Count */}
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Number of Questions</Text>
              <View style={[styles.chipRow, { marginBottom: 18 }]}>
                {[5, 10, 15].map((cnt) => {
                  const active = questionCount === cnt;
                  return (
                    <TouchableOpacity
                      key={cnt}
                      style={[
                        styles.countChip,
                        {
                          backgroundColor: active ? theme.primaryBg : theme.inputBg,
                          borderColor: active ? theme.primary : theme.border,
                        },
                      ]}
                      onPress={() => setQuestionCount(cnt)}
                    >
                      <Text style={[styles.chipText, { color: active ? theme.primary : theme.text }]}>
                        {cnt} Questions
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Rules Box */}
              <View style={[styles.rulesBox, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
                <Text style={[styles.rulesText, { color: theme.textSecondary }]}>
                  • 30 seconds per question • +10 pts correct • -5 pts wrong/timeout{'\n'}
                  • Mastered (correct) questions are never asked again{'\n'}
                  • Wrong or skipped questions can repeat for practice
                </Text>
              </View>

              {/* Start Quiz Button */}
              <TouchableOpacity
                style={[styles.startBtn, loadingQuiz && { opacity: 0.7 }]}
                onPress={handleStartAiQuiz}
                disabled={loadingQuiz}
              >
                {loadingQuiz ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Zap size={18} color="#FFFFFF" />
                    <Text style={styles.startBtnText}>Start 30s AI Quiz</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>

      {/* ACTIVE QUIZ MODAL */}
      <Modal
        visible={isAiQuizModalOpen}
        animationType="slide"
        onRequestClose={() => {
          if (timerRef.current) clearInterval(timerRef.current);
          setIsAiQuizModalOpen(false);
        }}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.bg }]}>
          {/* Modal Header */}
          <View style={[styles.modalHeader, { backgroundColor: theme.headerBg, borderBottomColor: theme.headerBorder }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {quizPhase === 'playing'
                  ? `Question ${currentIdx + 1} of ${questions.length}`
                  : 'Quiz Result Summary'}
              </Text>
              <Text style={[styles.modalSub, { color: theme.textSecondary }]}>
                {selectedCourse?.title} • {selectedSubject?.name || 'General'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                if (timerRef.current) clearInterval(timerRef.current);
                setIsAiQuizModalOpen(false);
              }}
              style={[styles.closeBtn, { backgroundColor: theme.inputBg }]}
            >
              <X size={20} color={theme.text} />
            </TouchableOpacity>
          </View>

          {quizPhase === 'playing' && activeQuestion ? (
            <ScrollView contentContainerStyle={styles.quizBody}>
              {/* Timer Bar */}
              <View style={[styles.timerRow, { backgroundColor: theme.surfaceCard, borderColor: theme.cardBorder }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Clock size={16} color={timeLeft <= 8 ? '#EF4444' : theme.primary} />
                  <Text style={[styles.timerText, { color: timeLeft <= 8 ? '#EF4444' : theme.text }]}>
                    {timeLeft}s Remaining
                  </Text>
                </View>
                <Text style={[styles.sessionPtsText, { color: sessionPoints >= 0 ? '#10B981' : '#EF4444' }]}>
                  Session: {sessionPoints >= 0 ? `+${sessionPoints}` : sessionPoints} pts
                </Text>
              </View>

              {/* Question Card */}
              <View style={[styles.questionCard, { backgroundColor: theme.surfaceCard, borderColor: theme.cardBorder }]}>
                {activeQuestion.chapter ? (
                  <View style={[styles.chapterBadge, { backgroundColor: theme.primaryBg }]}>
                    <BookOpen size={12} color={theme.primary} />
                    <Text style={[styles.chapterBadgeText, { color: theme.primary }]}>
                      {activeQuestion.chapter}
                    </Text>
                  </View>
                ) : null}

                <Text
                  style={[
                    styles.questionText,
                    { color: theme.text, textAlign: activeQuestion.language === 'ur' ? 'right' : 'left' },
                  ]}
                >
                  {activeQuestion.question}
                </Text>

                {/* Options */}
                <View style={styles.optionsList}>
                  {activeQuestion.options.map((opt, idx) => {
                    const isSelected = selectedOption === idx;
                    const isCorrectOpt = idx === activeQuestion.correctIndex;

                    let bg = theme.inputBg;
                    let border = theme.border;
                    let txtColor = theme.text;

                    if (isAnswered) {
                      if (isCorrectOpt) {
                        bg = isDark ? 'rgba(16, 185, 129, 0.2)' : '#ECFDF5';
                        border = '#10B981';
                        txtColor = isDark ? '#6EE7B7' : '#065F46';
                      } else if (isSelected && !isCorrectOpt) {
                        bg = isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEF2F2';
                        border = '#EF4444';
                        txtColor = isDark ? '#FCA5A5' : '#991B1B';
                      }
                    }

                    return (
                      <TouchableOpacity
                        key={idx}
                        style={[styles.optionBtn, { backgroundColor: bg, borderColor: border }]}
                        onPress={() => handleAnswerQuestion(idx)}
                        disabled={isAnswered}
                      >
                        <View style={[styles.optionIndex, { backgroundColor: theme.surfaceCard, borderColor: border }]}>
                          <Text style={[styles.optionIndexText, { color: txtColor }]}>
                            {String.fromCharCode(65 + idx)}
                          </Text>
                        </View>
                        <Text
                          style={[
                            styles.optionText,
                            { color: txtColor, textAlign: activeQuestion.language === 'ur' ? 'right' : 'left' },
                          ]}
                        >
                          {opt}
                        </Text>
                        {isAnswered && isCorrectOpt && <CheckCircle2 size={18} color="#10B981" />}
                        {isAnswered && isSelected && !isCorrectOpt && <XCircle size={18} color="#EF4444" />}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Explanation after answering */}
                {isAnswered && (
                  <View style={[styles.explanationBox, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
                    <Text style={[styles.explanationTitle, { color: theme.primary }]}>Explanation</Text>
                    <Text
                      style={[
                        styles.explanationText,
                        { color: theme.textSecondary, textAlign: activeQuestion.language === 'ur' ? 'right' : 'left' },
                      ]}
                    >
                      {activeQuestion.explanation || 'Review this concept in your chapter notes.'}
                    </Text>

                    <TouchableOpacity style={styles.nextBtn} onPress={handleNextQuestion}>
                      <Text style={styles.nextBtnText}>
                        {currentIdx + 1 < questions.length ? 'Next Question' : 'View Results'}
                      </Text>
                      <ArrowRight size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </ScrollView>
          ) : (
            /* RESULT SCREEN */
            <ScrollView contentContainerStyle={styles.quizBody}>
              <View style={[styles.resultHero, { backgroundColor: theme.surfaceCard, borderColor: theme.cardBorder }]}>
                <Trophy size={44} color="#FBBF24" />
                <Text style={[styles.resultTitle, { color: theme.text }]}>Quiz Completed!</Text>
                <Text style={[styles.resultScore, { color: theme.primary }]}>
                  {correctCount} / {questions.length} Correct
                </Text>
                <Text style={[styles.resultSub, { color: theme.textSecondary }]}>
                  Session Points: {sessionPoints >= 0 ? `+${sessionPoints}` : sessionPoints} • Total: {cloudPoints} pts
                </Text>
                {newBadgeUnlocked && (
                  <View style={[styles.badgePill, { backgroundColor: 'rgba(245, 158, 11, 0.2)', borderColor: '#F59E0B', marginTop: 10 }]}>
                    <Award size={14} color="#F59E0B" />
                    <Text style={{ color: '#FBBF24', fontWeight: '800', fontSize: 12 }}>
                      New Badge Unlocked: {newBadgeUnlocked}
                    </Text>
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={styles.startBtn}
                onPress={() => {
                  setIsAiQuizModalOpen(false);
                  handleStartAiQuiz();
                }}
              >
                <RotateCcw size={16} color="#FFFFFF" />
                <Text style={styles.startBtnText}>Play Another Quiz</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 40, gap: 14 },
  statsBanner: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statsLeft: { flex: 1 },
  pointsRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pointsTitle: { fontSize: 22, fontWeight: '900', color: '#FFFFFF' },
  pointsSub: { fontSize: 12, color: '#CBD5E1', marginTop: 4, fontWeight: '600' },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(245, 158, 11, 0.16)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  streakText: { color: '#FBBF24', fontSize: 11, fontWeight: '800' },
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  cardTitle: { fontSize: 16, fontWeight: '800', marginBottom: 10 },
  cardSub: { fontSize: 12, lineHeight: 17 },
  aiHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  aiIconBox: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  fieldLabel: { fontSize: 12, fontWeight: '700', marginBottom: 8 },
  chipRow: { flexDirection: 'row', gap: 8, flexWrap: 'nowrap' },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  countChip: { flex: 1, paddingVertical: 9, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  chipText: { fontSize: 12.5, fontWeight: '700' },
  rulesBox: { padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 16 },
  rulesText: { fontSize: 11.5, lineHeight: 18, fontWeight: '500' },
  startBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  startBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  badgeWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeText: { fontSize: 12, fontWeight: '700' },
  modalContainer: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 16, fontWeight: '800' },
  modalSub: { fontSize: 12, marginTop: 2 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  quizBody: { padding: 16, paddingBottom: 40, gap: 14 },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  timerText: { fontSize: 13, fontWeight: '800' },
  sessionPtsText: { fontSize: 13, fontWeight: '800' },
  questionCard: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 14 },
  chapterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  chapterBadgeText: { fontSize: 11, fontWeight: '700' },
  questionText: { fontSize: 16, fontWeight: '700', lineHeight: 24 },
  optionsList: { gap: 10 },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 10,
  },
  optionIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIndexText: { fontSize: 12, fontWeight: '800' },
  optionText: { flex: 1, fontSize: 14, fontWeight: '600', lineHeight: 20 },
  explanationBox: { padding: 14, borderRadius: 12, borderWidth: 1, gap: 8, marginTop: 4 },
  explanationTitle: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  explanationText: { fontSize: 13, lineHeight: 20 },
  nextBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 6,
  },
  nextBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  resultHero: { alignItems: 'center', padding: 24, borderRadius: 16, borderWidth: 1, gap: 8 },
  resultTitle: { fontSize: 20, fontWeight: '900', marginTop: 6 },
  resultScore: { fontSize: 26, fontWeight: '900' },
  resultSub: { fontSize: 13, fontWeight: '600' },
});
