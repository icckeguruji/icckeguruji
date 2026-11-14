import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CoachingHeader } from '../../src/components/CoachingHeader';
import { generateGrokQuiz, QuizQuestion } from '../../src/services/grokAi';
import {
  Sparkles,
  Award,
  CheckCircle2,
  XCircle,
  X,
  HelpCircle,
  RotateCcw,
  BookOpen,
} from 'lucide-react-native';

export default function StudentTestsScreen() {
  const router = useRouter();

  const [tests, setTests] = useState([
    {
      id: 'ex-1',
      title: 'BSEB Class 10 Science: Chemical Reactions & Equations Test',
      duration: 30,
      marks: 20,
      passMarks: 7,
      negative: 0.25,
      type: 'Chapter Test',
    },
    {
      id: 'ex-2',
      title: 'BSEB Class 10 Mathematics: Real Numbers Practice Exam',
      duration: 40,
      marks: 25,
      passMarks: 9,
      negative: 0.0,
      type: 'Mock Test',
    },
  ]);

  // AI Quiz Modal States
  const [isAiQuizModalOpen, setIsAiQuizModalOpen] = useState(false);
  const [quizPhase, setQuizPhase] = useState<'config' | 'playing' | 'result'>('config');
  const [subject, setSubject] = useState('Science');
  const [topic, setTopic] = useState('Chemical Reactions & Equations');
  const [questionCount, setQuestionCount] = useState(5);
  const [loading, setLoading] = useState(false);

  // Active Quiz State
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});

  const handleStartAiQuiz = async () => {
    if (!topic.trim()) {
      Alert.alert('Required Field', 'Please enter a chapter or topic name.');
      return;
    }
    setLoading(true);
    try {
      const qs = await generateGrokQuiz(subject, topic.trim(), questionCount);
      if (qs && qs.length > 0) {
        setQuestions(qs);
        setCurrentIdx(0);
        setSelectedAnswers({});
        setQuizPhase('playing');
      } else {
        Alert.alert('Notice', 'Could not generate quiz. Please try again.');
      }
    } catch {
      Alert.alert('Error', 'Unable to start AI quiz.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (optionIndex: number) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentIdx]: optionIndex,
    });
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        score += 1;
      }
    });
    return score;
  };

  const resetQuiz = () => {
    setQuizPhase('config');
    setSelectedAnswers({});
    setCurrentIdx(0);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Branded Coaching Header */}
      <CoachingHeader />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Online Tests & Quizzes</Text>
        <Text style={styles.headerSub}>
          Timed MCQ tests with instant Grok AI practice generator
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Grok AI Quiz Banner */}
        <View style={styles.aiQuizBanner}>
          <View style={styles.aiQuizBannerHeader}>
            <View style={styles.sparkleBox}>
              <Sparkles size={20} color="#F59E0B" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.aiQuizBannerTitle}>AI Instant Practice Quiz</Text>
                <View style={styles.grokTag}>
                  <Text style={styles.grokTagText}>Grok AI</Text>
                </View>
              </View>
              <Text style={styles.aiQuizBannerSub}>
                Generate 5 or 10 board MCQs for any chapter in 1-click
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.aiQuizBannerBtn}
            onPress={() => {
              resetQuiz();
              setIsAiQuizModalOpen(true);
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.aiQuizBannerBtnText}>Generate Custom AI Quiz ⚡</Text>
          </TouchableOpacity>
        </View>

        {/* Regular Course Tests */}
        <Text style={styles.sectionHeading}>Scheduled Board Tests</Text>
        <View style={styles.testList}>
          {tests.map((test) => (
            <View key={test.id} style={styles.testCard}>
              <View style={styles.badgeRow}>
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
              >
                <Text style={styles.startBtnText}>Start Test Now</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* ========================================================= */}
      {/* GROK AI INTERACTIVE QUIZ MODAL                            */}
      {/* ========================================================= */}
      <Modal
        visible={isAiQuizModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAiQuizModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Sparkles size={18} color="#D97706" />
                <Text style={styles.modalTitle}>
                  {quizPhase === 'config'
                    ? 'Grok AI Practice Quiz'
                    : quizPhase === 'playing'
                    ? `Quiz: ${subject} (${currentIdx + 1}/${questions.length})`
                    : 'Quiz Results & Solutions'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsAiQuizModalOpen(false)}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Phase 1: Configuration */}
            {quizPhase === 'config' && (
              <ScrollView style={styles.modalBody}>
                <Text style={styles.label}>Select Subject</Text>
                <View style={styles.subjectChips}>
                  {['Science', 'Mathematics', 'Social Science', 'Hindi', 'English'].map((sub) => (
                    <TouchableOpacity
                      key={sub}
                      style={[styles.subjectChip, subject === sub && styles.subjectChipActive]}
                      onPress={() => setSubject(sub)}
                    >
                      <Text
                        style={[styles.subjectChipText, subject === sub && styles.subjectChipTextActive]}
                      >
                        {sub}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.label}>Chapter / Topic</Text>
                <TextInput
                  style={styles.input}
                  value={topic}
                  onChangeText={setTopic}
                  placeholder="e.g. Chemical Reactions, Electricity, Triangles..."
                  placeholderTextColor="#94A3B8"
                />

                <Text style={styles.label}>Number of Questions</Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  {[5, 10].map((num) => (
                    <TouchableOpacity
                      key={num}
                      style={[styles.numChip, questionCount === num && styles.numChipActive]}
                      onPress={() => setQuestionCount(num)}
                    >
                      <Text style={[styles.numChipText, questionCount === num && styles.numChipTextActive]}>
                        {num} Questions
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  style={[styles.startQuizBtn, loading && { opacity: 0.6 }]}
                  onPress={handleStartAiQuiz}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <Sparkles size={16} color="#FFFFFF" />
                      <Text style={styles.startQuizBtnText}>Generate & Start Quiz 🚀</Text>
                    </>
                  )}
                </TouchableOpacity>
              </ScrollView>
            )}

            {/* Phase 2: Playing Quiz */}
            {quizPhase === 'playing' && questions.length > 0 && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.questionCard}>
                  <Text style={styles.questionIndex}>
                    Question {currentIdx + 1} of {questions.length}
                  </Text>
                  <Text style={styles.questionText}>
                    {questions[currentIdx]?.question}
                  </Text>
                </View>

                <View style={styles.optionsList}>
                  {questions[currentIdx]?.options.map((opt, oIdx) => {
                    const isSelected = selectedAnswers[currentIdx] === oIdx;
                    return (
                      <TouchableOpacity
                        key={oIdx}
                        style={[styles.optionBtn, isSelected && styles.optionBtnSelected]}
                        onPress={() => handleSelectOption(oIdx)}
                        activeOpacity={0.8}
                      >
                        <View style={[styles.optionRadio, isSelected && styles.optionRadioSelected]}>
                          <Text
                            style={[
                              styles.optionRadioText,
                              isSelected && styles.optionRadioTextSelected,
                            ]}
                          >
                            {String.fromCharCode(65 + oIdx)}
                          </Text>
                        </View>
                        <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                          {opt}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View style={styles.quizNavRow}>
                  {currentIdx > 0 && (
                    <TouchableOpacity
                      style={styles.prevBtn}
                      onPress={() => setCurrentIdx(currentIdx - 1)}
                    >
                      <Text style={styles.prevBtnText}>Previous</Text>
                    </TouchableOpacity>
                  )}

                  {currentIdx < questions.length - 1 ? (
                    <TouchableOpacity
                      style={styles.nextBtn}
                      onPress={() => setCurrentIdx(currentIdx + 1)}
                    >
                      <Text style={styles.nextBtnText}>Next Question</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.submitQuizBtn}
                      onPress={() => setQuizPhase('result')}
                    >
                      <Text style={styles.submitQuizBtnText}>Submit & View Score</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </ScrollView>
            )}

            {/* Phase 3: Results & Explanations */}
            {quizPhase === 'result' && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.scoreBanner}>
                  <Award size={36} color="#F59E0B" />
                  <Text style={styles.scoreTitle}>
                    Score: {calculateScore()} / {questions.length}
                  </Text>
                  <Text style={styles.scoreSub}>
                    {calculateScore() >= Math.round(questions.length * 0.7)
                      ? '🌟 Excellent performance! Keep practicing.'
                      : '👍 Good effort! Review the detailed solutions below.'}
                  </Text>
                </View>

                <Text style={[styles.sectionHeading, { marginTop: 14 }]}>
                  Solutions & Explanations:
                </Text>

                {questions.map((q, idx) => {
                  const userChoice = selectedAnswers[idx];
                  const isCorrect = userChoice === q.correctIndex;
                  return (
                    <View key={q.id} style={styles.reviewCard}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        {isCorrect ? (
                          <CheckCircle2 size={16} color="#059669" />
                        ) : (
                          <XCircle size={16} color="#DC2626" />
                        )}
                        <Text style={styles.reviewQIndex}>Question {idx + 1}</Text>
                      </View>
                      <Text style={styles.reviewQText}>{q.question}</Text>
                      <Text style={styles.reviewCorrect}>
                        Correct Answer: ({String.fromCharCode(65 + q.correctIndex)}) {q.options[q.correctIndex]}
                      </Text>
                      <View style={styles.explanationBox}>
                        <Text style={styles.explanationTitle}>💡 Grok AI Explanation:</Text>
                        <Text style={styles.explanationText}>{q.explanation}</Text>
                      </View>
                    </View>
                  );
                })}

                <TouchableOpacity style={styles.retakeBtn} onPress={resetQuiz}>
                  <RotateCcw size={16} color="#FFFFFF" />
                  <Text style={styles.retakeBtnText}>Take Another AI Quiz</Text>
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
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  aiQuizBanner: {
    backgroundColor: '#1E1B4B',
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#312E81',
  },
  aiQuizBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sparkleBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiQuizBannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  grokTag: {
    backgroundColor: '#D97706',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  grokTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  aiQuizBannerSub: {
    fontSize: 11,
    color: '#C7D2FE',
    marginTop: 2,
  },
  aiQuizBannerBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 14,
  },
  aiQuizBannerBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  testList: {
    gap: 14,
  },
  testCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  duration: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  testTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 20,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  statVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  startBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  startBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalBody: {
    maxHeight: 480,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
    marginTop: 10,
  },
  subjectChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subjectChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  subjectChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  subjectChipText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  subjectChipTextActive: {
    color: '#2563EB',
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
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  numChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  numChipTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
  },
  startQuizBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 10,
  },
  startQuizBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  questionCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  questionIndex: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  questionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 20,
  },
  optionsList: {
    gap: 10,
    marginBottom: 16,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
  },
  optionBtnSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  optionRadio: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionRadioSelected: {
    backgroundColor: '#2563EB',
  },
  optionRadioText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  optionRadioTextSelected: {
    color: '#FFFFFF',
  },
  optionText: {
    fontSize: 13,
    color: '#334155',
    flex: 1,
    lineHeight: 18,
  },
  optionTextSelected: {
    color: '#1E40AF',
    fontWeight: '700',
  },
  quizNavRow: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 10,
  },
  prevBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  prevBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  nextBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    alignItems: 'center',
  },
  nextBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  submitQuizBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#059669',
    alignItems: 'center',
  },
  submitQuizBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scoreBanner: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  scoreTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#92400E',
    marginTop: 8,
  },
  scoreSub: {
    fontSize: 12,
    color: '#B45309',
    marginTop: 4,
    textAlign: 'center',
  },
  reviewCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
    gap: 4,
  },
  reviewQIndex: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  reviewQText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    marginVertical: 4,
  },
  reviewCorrect: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
  explanationBox: {
    backgroundColor: '#F0FDF4',
    padding: 8,
    borderRadius: 8,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  explanationTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
    marginBottom: 2,
  },
  explanationText: {
    fontSize: 11,
    color: '#14532D',
    lineHeight: 16,
  },
  retakeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 14,
    marginBottom: 10,
  },
  retakeBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
