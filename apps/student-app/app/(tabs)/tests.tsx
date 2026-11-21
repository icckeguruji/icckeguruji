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
import { useRouter } from 'expo-router';
import { CoachingHeader } from '../../src/components/CoachingHeader';
import { aiService, AIQuizQuestion, QuizSubmissionResult } from '../../src/services/aiService';
import { useAuthStore } from '../../src/store/useAuthStore';
import {
  Sparkles,
  Award,
  CheckCircle2,
  XCircle,
  X,
  Clock,
  RotateCcw,
  Zap,
  Shield,
  Trophy,
  Flame,
  ArrowRight,
  BookOpen,
  ChevronRight,
} from 'lucide-react-native';

const SUBJECTS_LIST = [
  { id: 'ALL', name: 'All Subjects (Mixed)', hi: 'सभी विषय' },
  { id: 'Science', name: 'Science', hi: 'विज्ञान' },
  { id: 'Mathematics', name: 'Mathematics', hi: 'गणित' },
  { id: 'Social Science', name: 'Social Science', hi: 'सामाजिक विज्ञान' },
  { id: 'Hindi', name: 'Hindi', hi: 'हिंदी' },
  { id: 'English', name: 'English', hi: 'अंग्रेज़ी' },
  { id: 'Sanskrit', name: 'Sanskrit', hi: 'संस्कृत' },
  { id: 'Urdu', name: 'Urdu', hi: 'اردو' },
];

export default function StudentTestsScreen() {
  const router = useRouter();
  const { user, updateProfile } = useAuthStore();

  const [tests] = useState([
    {
      id: 'ex-1',
      title: 'Class 10 Science: Chemical Reactions & Equations Test',
      duration: 30,
      marks: 20,
      passMarks: 7,
      negative: 0.25,
      type: 'Chapter Test',
    },
    {
      id: 'ex-2',
      title: 'Class 10 Mathematics: Real Numbers Practice Exam',
      duration: 40,
      marks: 25,
      passMarks: 9,
      negative: 0.0,
      type: 'Mock Test',
    },
    {
      id: 'ex-3',
      title: 'Class 10 Social Science: Nationalism & Resources Assessment',
      duration: 45,
      marks: 30,
      passMarks: 10,
      negative: 0.25,
      type: 'Syllabus Test',
    },
  ]);

  // AI 30-Second Live Speed Quiz States
  const [isAiQuizModalOpen, setIsAiQuizModalOpen] = useState(false);
  const [quizPhase, setQuizPhase] = useState<'config' | 'playing' | 'result'>('config');
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [questionCount, setQuestionCount] = useState(5);
  const [loading, setLoading] = useState(false);

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

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // -------------------------------------------------------------
  // 30-SECOND TIMER PER QUESTION
  // -------------------------------------------------------------
  useEffect(() => {
    if (quizPhase === 'playing' && !isAnswered) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleAnswerQuestion(-1, true); // Timeout penalty: -5 pts
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

  // Start Speed Quiz: Fetch Questions with Anti-Repetition
  const handleStartSpeedQuiz = async () => {
    setLoading(true);
    setNewBadgeUnlocked(null);
    try {
      const isUrdu = selectedSubject === 'Urdu';
      const studentId = user?.id || 'guest_student';

      const qs = await aiService.getLiveQuizQuestions(
        studentId,
        selectedSubject,
        undefined,
        isUrdu ? 'ur' : 'hi',
        questionCount
      );

      if (qs && qs.length > 0) {
        setQuestions(qs);
        setCurrentIdx(0);
        setTimeLeft(30);
        setIsAnswered(false);
        setSelectedOption(null);
        setSessionPoints(0);
        setSessionResults([]);
        setQuizPhase('playing');
      } else {
        Alert.alert('Notice', 'No questions available. Please try another subject.');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Unable to generate speed quiz.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Question Answer or Timeout
  const handleAnswerQuestion = async (optionIdx: number, isTimeout: boolean = false) => {
    if (isAnswered) return;
    if (timerRef.current) clearInterval(timerRef.current);

    setIsAnswered(true);
    setSelectedOption(isTimeout ? -1 : optionIdx);

    const currentQ = questions[currentIdx];
    const isCorrect = !isTimeout && optionIdx === currentQ.correctIndex;
    const pointsDelta = isCorrect ? 10 : -5;

    setSessionPoints((prev) => prev + pointsDelta);

    // Save answer result for end review
    setSessionResults((prev) => [
      ...prev,
      {
        question: currentQ,
        selectedIdx: isTimeout ? null : optionIdx,
        isCorrect,
        pointsDelta,
      },
    ]);

    // Submit to atomic scoring & Supabase anti-repetition engine
    const studentId = user?.id || 'guest_student';
    const currentTotalPoints = user?.quiz_points || 0;
    const currentBadges = user?.badges || [];

    const result: QuizSubmissionResult = await aiService.submitAnswer(
      studentId,
      currentQ.id,
      isCorrect,
      currentQ.subject,
      currentQ.chapter,
      currentTotalPoints,
      currentBadges
    );

    // Update client profile store
    const updatedBadges = result.newlyUnlockedBadge
      ? [...currentBadges, result.newlyUnlockedBadge]
      : currentBadges;

    updateProfile({
      quiz_points: result.newTotalPoints,
      badges: updatedBadges,
    });

    if (result.newlyUnlockedBadge) {
      setNewBadgeUnlocked(result.newlyUnlockedBadge);
    }
  };

  // Advance to Next Question or Final Results
  const handleNextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setTimeLeft(30);
      setIsAnswered(false);
      setSelectedOption(null);
    } else {
      setQuizPhase('result');
    }
  };

  const resetQuiz = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setQuizPhase('config');
    setQuestions([]);
    setCurrentIdx(0);
    setTimeLeft(30);
    setIsAnswered(false);
    setSelectedOption(null);
    setSessionPoints(0);
    setSessionResults([]);
    setNewBadgeUnlocked(null);
  };

  const currentBadge =
    user?.badges && user.badges.length > 0
      ? user.badges[user.badges.length - 1]
      : (user?.quiz_points || 0) >= 50
      ? 'Bronze Scholar'
      : 'Novice Student';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Branded Coaching Header */}
      <CoachingHeader />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Student Points & Badge Status Card */}
        <View style={styles.profileStatCard}>
          <View style={styles.profileStatLeft}>
            <View style={styles.trophyIconBox}>
              <Trophy size={24} color="#D97706" />
            </View>
            <View>
              <Text style={styles.profileScoreLabel}>Your Total Quiz Points</Text>
              <Text style={styles.profileScoreVal}>
                {user?.quiz_points || 0} <Text style={{ fontSize: 13, color: '#64748B' }}>PTS</Text>
              </Text>
            </View>
          </View>
          <View style={styles.badgePill}>
            <Award size={14} color="#B45309" />
            <Text style={styles.badgePillText}>{currentBadge}</Text>
          </View>
        </View>

        {/* AI 30-Second Live Speed Quiz Launch Banner */}
        <View style={styles.speedQuizBanner}>
          <View style={styles.speedQuizBannerHeader}>
            <View style={styles.zapBox}>
              <Zap size={22} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.speedQuizTitle}>AI 30-Second Live Speed Quiz</Text>
                <View style={styles.liveTag}>
                  <Text style={styles.liveTagText}>AI LIVE</Text>
                </View>
              </View>
              <Text style={styles.speedQuizSub}>
                +10 Points for Correct • -5 Points Penalty for Wrong / Timeout
              </Text>
            </View>
          </View>

          <View style={styles.bannerPerksRow}>
            <View style={styles.perkItem}>
              <Clock size={13} color="#CBD5E1" />
              <Text style={styles.perkText}>30s Timer / Q</Text>
            </View>
            <View style={styles.perkItem}>
              <Shield size={13} color="#CBD5E1" />
              <Text style={styles.perkText}>Zero Repetition</Text>
            </View>
            <View style={styles.perkItem}>
              <Flame size={13} color="#FBBF24" />
              <Text style={styles.perkText}>Earn Rank Badges</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.startSpeedQuizBtn}
            onPress={() => {
              resetQuiz();
              setIsAiQuizModalOpen(true);
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.startSpeedQuizBtnText}>Start 30s Speed Quiz ⚡</Text>
          </TouchableOpacity>
        </View>

        {/* Regular Scheduled Tests */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>Scheduled Board Examinations</Text>
          <Text style={styles.sectionSub}>All Indian Curriculum Standards</Text>
        </View>

        <View style={styles.testList}>
          {tests.map((test) => (
            <View key={test.id} style={styles.testCard}>
              <View style={styles.cardTopBadgeRow}>
                <Text style={styles.typeBadge}>{test.type}</Text>
                <Text style={styles.duration}>⏱️ {test.duration} mins</Text>
              </View>

              <Text style={styles.testTitle}>{test.title}</Text>

              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Total Marks</Text>
                  <Text style={styles.statVal}>{test.marks}</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Pass Marks</Text>
                  <Text style={styles.statVal}>{test.passMarks}</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Negative Marking</Text>
                  <Text style={[styles.statVal, { color: '#DC2626' }]}>-{test.negative}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.startBtn}
                onPress={() => router.push(`/exam/${test.id}`)}
                activeOpacity={0.8}
              >
                <Text style={styles.startBtnText}>Start Test Now</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* ========================================================= */}
      {/* AI 30-SECOND SPEED QUIZ INTERACTIVE MODAL                  */}
      {/* ========================================================= */}
      <Modal
        visible={isAiQuizModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          if (timerRef.current) clearInterval(timerRef.current);
          setIsAiQuizModalOpen(false);
        }}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Zap size={18} color="#D97706" />
                <Text style={styles.modalTitle}>
                  {quizPhase === 'config'
                    ? 'AI 30-Second Speed Quiz Setup'
                    : quizPhase === 'playing'
                    ? `Live Challenge (${currentIdx + 1}/${questions.length})`
                    : 'Quiz Results & Score Card'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  if (timerRef.current) clearInterval(timerRef.current);
                  setIsAiQuizModalOpen(false);
                }}
              >
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* ---------------------------------------------------- */}
            {/* Phase 1: Configuration                                */}
            {/* ---------------------------------------------------- */}
            {quizPhase === 'config' && (
              <ScrollView style={styles.modalBody}>
                <Text style={styles.label}>1. Select Subject</Text>
                <View style={styles.subjectChips}>
                  {SUBJECTS_LIST.map((sub) => (
                    <TouchableOpacity
                      key={sub.id}
                      style={[
                        styles.subjectChip,
                        selectedSubject === sub.id && styles.subjectChipActive,
                      ]}
                      onPress={() => setSelectedSubject(sub.id)}
                    >
                      <Text
                        style={[
                          styles.subjectChipText,
                          selectedSubject === sub.id && styles.subjectChipTextActive,
                        ]}
                      >
                        {sub.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.label}>2. Select Question Count</Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  {[5, 10].map((num) => (
                    <TouchableOpacity
                      key={num}
                      style={[
                        styles.numChip,
                        questionCount === num && styles.numChipActive,
                      ]}
                      onPress={() => setQuestionCount(num)}
                    >
                      <Text
                        style={[
                          styles.numChipText,
                          questionCount === num && styles.numChipTextActive,
                        ]}
                      >
                        {num} Questions ({num * 10} Max Pts)
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Anti-Repetition Guarantee Box */}
                <View style={styles.antiRepetitionBox}>
                  <Shield size={16} color="#059669" />
                  <Text style={styles.antiRepetitionText}>
                    AI Anti-Repetition Engine active. You will receive fresh board questions
                    tailored to your class syllabus with zero repeats.
                  </Text>
                </View>

                <View style={styles.scoringRuleRow}>
                  <View style={styles.rulePillGreen}>
                    <Text style={styles.rulePillGreenText}>✅ Correct: +10 Pts</Text>
                  </View>
                  <View style={styles.rulePillRed}>
                    <Text style={styles.rulePillRedText}>❌ Wrong / Timeout: -5 Pts</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.startQuizBtn, loading && { opacity: 0.6 }]}
                  onPress={handleStartSpeedQuiz}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <Zap size={16} color="#FFFFFF" />
                      <Text style={styles.startQuizBtnText}>
                        Start 30-Second Speed Quiz ⚡
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </ScrollView>
            )}

            {/* ---------------------------------------------------- */}
            {/* Phase 2: Playing Live 30-Second Quiz                 */}
            {/* ---------------------------------------------------- */}
            {quizPhase === 'playing' && questions.length > 0 && (
              <ScrollView style={styles.modalBody}>
                {/* Timer Bar & Live Score Header */}
                <View style={styles.timerHeaderRow}>
                  <View style={styles.timerBadge}>
                    <Clock
                      size={14}
                      color={timeLeft <= 5 ? '#EF4444' : timeLeft <= 10 ? '#F59E0B' : '#2563EB'}
                    />
                    <Text
                      style={[
                        styles.timerText,
                        timeLeft <= 5 && { color: '#EF4444', fontWeight: '800' },
                      ]}
                    >
                      00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}s
                    </Text>
                  </View>

                  <View style={styles.liveScoreBadge}>
                    <Text style={styles.liveScoreLabel}>Run Score:</Text>
                    <Text
                      style={[
                        styles.liveScoreVal,
                        sessionPoints < 0 ? { color: '#EF4444' } : { color: '#059669' },
                      ]}
                    >
                      {sessionPoints > 0 ? `+${sessionPoints}` : sessionPoints} Pts
                    </Text>
                  </View>
                </View>

                {/* Visual Progress Bar for 30 Seconds */}
                <View style={styles.timerProgressBg}>
                  <View
                    style={[
                      styles.timerProgressFill,
                      {
                        width: `${Math.max(0, (timeLeft / 30) * 100)}%`,
                        backgroundColor:
                          timeLeft <= 5 ? '#EF4444' : timeLeft <= 10 ? '#F59E0B' : '#2563EB',
                      },
                    ]}
                  />
                </View>

                {/* Question Card */}
                <View style={styles.questionCard}>
                  <View style={styles.questionMetaRow}>
                    <Text style={styles.questionIndex}>
                      QUESTION {currentIdx + 1} OF {questions.length}
                    </Text>
                    <Text style={styles.questionSubjectTag}>
                      {questions[currentIdx]?.subject}
                    </Text>
                  </View>
                  <Text style={styles.questionText}>
                    {questions[currentIdx]?.question}
                  </Text>
                </View>

                {/* Options List */}
                <View style={styles.optionsList}>
                  {questions[currentIdx]?.options.map((opt, oIdx) => {
                    const isSelected = selectedOption === oIdx;
                    const isCorrectOpt = oIdx === questions[currentIdx].correctIndex;

                    let btnStyle: any = styles.optionBtn;
                    let textStyle: any = styles.optionText;

                    if (isAnswered) {
                      if (isCorrectOpt) {
                        btnStyle = styles.optionBtnCorrect;
                        textStyle = styles.optionTextCorrect;
                      } else if (isSelected) {
                        btnStyle = styles.optionBtnWrong;
                        textStyle = styles.optionTextWrong;
                      }
                    }

                    return (
                      <TouchableOpacity
                        key={oIdx}
                        style={btnStyle}
                        onPress={() => handleAnswerQuestion(oIdx)}
                        disabled={isAnswered}
                        activeOpacity={0.8}
                      >
                        <View style={styles.optionLetterBox}>
                          <Text style={styles.optionLetterText}>
                            {String.fromCharCode(65 + oIdx)}
                          </Text>
                        </View>
                        <Text style={textStyle}>{opt}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Instant Feedback & AI Explanation */}
                {isAnswered && (
                  <View style={styles.feedbackContainer}>
                    {selectedOption === questions[currentIdx].correctIndex ? (
                      <View style={styles.correctBanner}>
                        <CheckCircle2 size={18} color="#059669" />
                        <Text style={styles.correctBannerText}>
                          🎉 +10 Points! Correct Answer!
                        </Text>
                      </View>
                    ) : selectedOption === -1 ? (
                      <View style={styles.wrongBanner}>
                        <Clock size={18} color="#DC2626" />
                        <Text style={styles.wrongBannerText}>
                          ⏰ Time Up! -5 Points Penalty.
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.wrongBanner}>
                        <XCircle size={18} color="#DC2626" />
                        <Text style={styles.wrongBannerText}>
                          ❌ Incorrect (-5 Points Penalty).
                        </Text>
                      </View>
                    )}

                    <View style={styles.explanationBox}>
                      <Text style={styles.explanationTitle}>💡 AI Guruji Explanation:</Text>
                      <Text style={styles.explanationText}>
                        {questions[currentIdx].explanation}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.nextQuestionBtn}
                      onPress={handleNextQuestion}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.nextQuestionBtnText}>
                        {currentIdx < questions.length - 1
                          ? 'Next Question ➔'
                          : 'View Final Score Card 🏆'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>
            )}

            {/* ---------------------------------------------------- */}
            {/* Phase 3: Results & Badge Celebration                 */}
            {/* ---------------------------------------------------- */}
            {quizPhase === 'result' && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.scoreBanner}>
                  <Trophy size={42} color="#F59E0B" />
                  <Text style={styles.scoreTitle}>
                    {sessionPoints >= 0 ? `+${sessionPoints}` : sessionPoints} Points Earned!
                  </Text>
                  <Text style={styles.scoreSub}>
                    Total Profile Points: {user?.quiz_points || 0} PTS
                  </Text>
                </View>

                {/* Newly Unlocked Badge Callout */}
                {newBadgeUnlocked && (
                  <View style={styles.unlockedBadgeBox}>
                    <Award size={24} color="#B45309" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.unlockedBadgeTitle}>New Rank Badge Unlocked! 🎖️</Text>
                      <Text style={styles.unlockedBadgeName}>{newBadgeUnlocked}</Text>
                    </View>
                  </View>
                )}

                {/* Score Breakdown */}
                <View style={styles.breakdownRow}>
                  <View style={styles.breakdownItem}>
                    <Text style={styles.breakdownVal}>
                      {sessionResults.filter((r) => r.isCorrect).length}
                    </Text>
                    <Text style={styles.breakdownLabel}>Correct (+10)</Text>
                  </View>
                  <View style={styles.breakdownItem}>
                    <Text style={[styles.breakdownVal, { color: '#DC2626' }]}>
                      {sessionResults.filter((r) => !r.isCorrect).length}
                    </Text>
                    <Text style={styles.breakdownLabel}>Wrong (-5)</Text>
                  </View>
                  <View style={styles.breakdownItem}>
                    <Text style={[styles.breakdownVal, { color: '#D97706' }]}>
                      {currentBadge}
                    </Text>
                    <Text style={styles.breakdownLabel}>Current Badge</Text>
                  </View>
                </View>

                {/* Question by Question Review */}
                <Text style={[styles.sectionHeading, { marginTop: 16 }]}>
                  Solutions & Detailed Explanations
                </Text>

                {sessionResults.map((res, idx) => (
                  <View key={res.question.id} style={styles.reviewCard}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      {res.isCorrect ? (
                        <CheckCircle2 size={16} color="#059669" />
                      ) : (
                        <XCircle size={16} color="#DC2626" />
                      )}
                      <Text style={styles.reviewQIndex}>
                        Question {idx + 1}: {res.isCorrect ? '+10 Pts' : '-5 Pts'}
                      </Text>
                    </View>
                    <Text style={styles.reviewQText}>{res.question.question}</Text>
                    <Text style={styles.reviewCorrect}>
                      Correct: ({String.fromCharCode(65 + res.question.correctIndex)}){' '}
                      {res.question.options[res.question.correctIndex]}
                    </Text>
                    <View style={styles.explanationBox}>
                      <Text style={styles.explanationTitle}>💡 AI Explanation:</Text>
                      <Text style={styles.explanationText}>{res.question.explanation}</Text>
                    </View>
                  </View>
                ))}

                <TouchableOpacity style={styles.retakeBtn} onPress={resetQuiz}>
                  <RotateCcw size={16} color="#FFFFFF" />
                  <Text style={styles.retakeBtnText}>Play Another Speed Quiz</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  profileStatCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  profileStatLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  trophyIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileScoreLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  profileScoreVal: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  badgePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
  },
  speedQuizBanner: {
    backgroundColor: '#0F172A',
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  speedQuizBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  zapBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedQuizTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  liveTag: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  liveTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  speedQuizSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  bannerPerksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 12,
  },
  perkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  perkText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#CBD5E1',
  },
  startSpeedQuizBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 14,
  },
  startSpeedQuizBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionHeaderRow: {
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  testList: {
    gap: 12,
  },
  testCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTopBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  typeBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2563EB',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  duration: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  testTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: '#64748B',
    marginBottom: 2,
  },
  statVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  startBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  startBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalBody: {
    padding: 16,
    paddingBottom: 30,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
    marginTop: 6,
  },
  subjectChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  subjectChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  subjectChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  subjectChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  subjectChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  numChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  numChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  numChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  numChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  antiRepetitionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
    marginBottom: 10,
  },
  antiRepetitionText: {
    fontSize: 11,
    color: '#166534',
    flex: 1,
    lineHeight: 16,
  },
  scoringRuleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  rulePillGreen: {
    flex: 1,
    backgroundColor: '#DCFCE7',
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  rulePillGreenText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  rulePillRed: {
    flex: 1,
    backgroundColor: '#FEE2E2',
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  rulePillRedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B91C1C',
  },
  startQuizBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  startQuizBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  timerHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  timerText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
  liveScoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  liveScoreLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  liveScoreVal: {
    fontSize: 13,
    fontWeight: '800',
  },
  timerProgressBg: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    marginBottom: 12,
    overflow: 'hidden',
  },
  timerProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  questionCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  questionMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  questionIndex: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2563EB',
  },
  questionSubjectTag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 24,
  },
  optionsList: {
    gap: 10,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  optionBtnCorrect: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#F0FDF4',
    borderWidth: 2,
    borderColor: '#059669',
    gap: 10,
  },
  optionBtnWrong: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    borderWidth: 2,
    borderColor: '#DC2626',
    gap: 10,
  },
  optionLetterBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLetterText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  optionText: {
    fontSize: 14,
    color: '#1E293B',
    flex: 1,
    fontWeight: '500',
  },
  optionTextCorrect: {
    fontSize: 14,
    color: '#065F46',
    flex: 1,
    fontWeight: '700',
  },
  optionTextWrong: {
    fontSize: 14,
    color: '#991B1B',
    flex: 1,
    fontWeight: '600',
  },
  feedbackContainer: {
    marginTop: 14,
  },
  correctBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#DCFCE7',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  correctBannerText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#166534',
  },
  wrongBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  wrongBannerText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#991B1B',
  },
  explanationBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  explanationTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
    marginBottom: 2,
  },
  explanationText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
  nextQuestionBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextQuestionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scoreBanner: {
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
  },
  scoreTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#92400E',
    marginTop: 6,
  },
  scoreSub: {
    fontSize: 12,
    color: '#B45309',
    marginTop: 2,
    fontWeight: '600',
  },
  unlockedBadgeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFBEB',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  unlockedBadgeTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B45309',
  },
  unlockedBadgeName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#78350F',
  },
  breakdownRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  breakdownItem: {
    flex: 1,
    alignItems: 'center',
  },
  breakdownVal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  breakdownLabel: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 10,
  },
  reviewQIndex: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  reviewQText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
    marginVertical: 4,
  },
  reviewCorrect: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
    marginBottom: 6,
  },
  retakeBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  retakeBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
