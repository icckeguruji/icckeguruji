import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/useAuthStore';
import { translations } from '@icc/shared-utils';

interface QuestionItem {
  id: string;
  text: string;
  text_hi: string;
  options: { id: string; text: string; text_hi: string }[];
  marks: number;
}

const mockQuestions: QuestionItem[] = [
  {
    id: 'q-1',
    text: 'What type of reaction occurs when Quick Lime (CaO) reacts with water?',
    text_hi: 'जब कली चूना (CaO) जल से अभिक्रिया करता है, तो यह किस प्रकार की अभिक्रिया होती है?',
    options: [
      { id: 'opt1', text: 'Exothermic combination reaction', text_hi: 'ऊष्माक्षेपी संयोजन अभिक्रिया' },
      { id: 'opt2', text: 'Endothermic decomposition reaction', text_hi: 'ऊष्माशोषी वियोजन अभिक्रिया' },
      { id: 'opt3', text: 'Displacement reaction', text_hi: 'विस्थापन अभिक्रिया' },
      { id: 'opt4', text: 'Neutralization reaction only', text_hi: 'केवल उदासीनीकरण अभिक्रिया' },
    ],
    marks: 1,
  },
  {
    id: 'q-2',
    text: 'Which gas is released when Zinc granules react with dilute Sulphuric acid?',
    text_hi: 'जिंक के दानों पर तनु सल्फ्यूरिक अम्ल डालने पर कौन सी गैस उत्सर्जित होती है?',
    options: [
      { id: 'opt1', text: 'Oxygen (O2)', text_hi: 'ऑक्सीजन (O2)' },
      { id: 'opt2', text: 'Hydrogen (H2)', text_hi: 'हाइड्रोजन (H2)' },
      { id: 'opt3', text: 'Carbon dioxide (CO2)', text_hi: 'कार्बन डाइऑक्साइड (CO2)' },
      { id: 'opt4', text: 'Sulphur dioxide (SO2)', text_hi: 'सल्फर डाइऑक्साइड (SO2)' },
    ],
    marks: 1,
  },
  {
    id: 'q-3',
    text: 'Rusting of iron is an example of redox reaction and slow oxidation.',
    text_hi: 'लोहे पर जंग लगना एक रेडॉक्स (उपचयन-अपचयन) अभिक्रिया और मंद ऑक्सीकरण का उदाहरण है।',
    options: [
      { id: 'true', text: 'True (सत्य)', text_hi: 'सत्य' },
      { id: 'false', text: 'False (असत्य)', text_hi: 'असत्य' },
    ],
    marks: 1,
  },
];

export default function ActiveExamScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { language } = useAuthStore();
  const t = translations[language];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: string }>({});
  const [markedForReview, setMarkedForReview] = useState<{ [key: string]: boolean }>({});
  const [questionLang, setQuestionLang] = useState<'hi' | 'en'>(language);
  const [secondsRemaining, setSecondsRemaining] = useState(1800); // 30 minutes

  // Live Timer Countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTest(true); // Auto-submit on expiry
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentQ = mockQuestions[currentIndex];

  const handleSelectOption = (optId: string) => {
    setSelectedAnswers({ ...selectedAnswers, [currentQ.id]: optId });
  };

  const toggleReview = () => {
    setMarkedForReview({
      ...markedForReview,
      [currentQ.id]: !markedForReview[currentQ.id],
    });
  };

  const handleSubmitTest = (auto = false) => {
    const submitAction = () => {
      // Navigate to results with score parameters
      router.replace({
        pathname: `/exam-result/${id}`,
        params: {
          totalScore: '2',
          totalMarks: '3',
          accuracy: '67%',
          passed: 'true',
        },
      });
    };

    if (auto) {
      submitAction();
    } else {
      Alert.alert(
        'Submit Exam',
        'Are you sure you want to finish the exam? Answers will be verified on the server.',
        [
          { text: 'Continue Test', style: 'cancel' },
          { text: 'Submit Now', onPress: submitAction },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Test Bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.examTitle}>BSEB 10 Science Chapter 1</Text>
          <Text style={styles.qCounter}>
            Question {currentIndex + 1} of {mockQuestions.length}
          </Text>
        </View>

        <View style={styles.topRight}>
          {/* Live Timer */}
          <View style={styles.timerBadge}>
            <Text style={styles.timerText}>⏳ {formatTimer(secondsRemaining)}</Text>
          </View>
        </View>
      </View>

      {/* Question Palette Navigation Strip */}
      <View style={styles.paletteStrip}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.paletteScroll}>
          {mockQuestions.map((q, idx) => {
            const isAnswered = Boolean(selectedAnswers[q.id]);
            const isReview = Boolean(markedForReview[q.id]);
            const isCurrent = idx === currentIndex;

            let badgeStyle = styles.paletteBadgeUnanswered;
            if (isAnswered) badgeStyle = styles.paletteBadgeAnswered;
            if (isReview) badgeStyle = styles.paletteBadgeReview;

            return (
              <TouchableOpacity
                key={q.id}
                style={[styles.paletteBadge, badgeStyle, isCurrent && styles.paletteBadgeCurrent]}
                onPress={() => setCurrentIndex(idx)}
              >
                <Text style={styles.paletteBadgeText}>{idx + 1}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Question Card */}
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>
            Q{currentIndex + 1}.{' '}
            {currentQ.text}
          </Text>

          {/* Options */}
          <View style={styles.optionsList}>
            {currentQ.options.map((opt) => {
              const isSelected = selectedAnswers[currentQ.id] === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.optionItem, isSelected && styles.optionItemSelected]}
                  onPress={() => handleSelectOption(opt.id)}
                >
                  <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                  <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                    {opt.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation & Submit Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.reviewBtn, markedForReview[currentQ.id] && styles.reviewBtnActive]}
          onPress={toggleReview}
        >
          <Text style={styles.reviewBtnText}>
            {markedForReview[currentQ.id] ? '★ Marked' : '☆ Mark Review'}
          </Text>
        </TouchableOpacity>

        <View style={styles.navBtnGroup}>
          {currentIndex > 0 && (
            <TouchableOpacity
              style={styles.navBtn}
              onPress={() => setCurrentIndex(currentIndex - 1)}
            >
              <Text style={styles.navBtnText}>‹ Prev</Text>
            </TouchableOpacity>
          )}

          {currentIndex < mockQuestions.length - 1 ? (
            <TouchableOpacity
              style={[styles.navBtn, styles.navBtnPrimary]}
              onPress={() => setCurrentIndex(currentIndex + 1)}
            >
              <Text style={styles.navBtnPrimaryText}>Next ›</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.submitExamBtn}
              onPress={() => handleSubmitTest(false)}
            >
              <Text style={styles.submitExamBtnText}>Submit Test</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  examTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  qCounter: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timerBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  timerText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E40AF',
    fontFamily: 'monospace',
  },
  langBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  langBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  paletteStrip: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 8,
  },
  paletteScroll: {
    paddingHorizontal: 14,
    gap: 8,
  },
  paletteBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paletteBadgeUnanswered: {
    backgroundColor: '#F1F5F9',
  },
  paletteBadgeAnswered: {
    backgroundColor: '#10B981',
  },
  paletteBadgeReview: {
    backgroundColor: '#F59E0B',
  },
  paletteBadgeCurrent: {
    borderWidth: 2,
    borderColor: '#2563EB',
  },
  paletteBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  scroll: {
    padding: 16,
    paddingBottom: 90,
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  questionText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 24,
    marginBottom: 20,
  },
  optionsList: {
    gap: 12,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  optionItemSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: '#2563EB',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563EB',
  },
  optionText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
    flex: 1,
  },
  optionTextSelected: {
    color: '#1E40AF',
    fontWeight: '700',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  reviewBtnActive: {
    backgroundColor: '#FEF3C7',
  },
  reviewBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  navBtnGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  navBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  navBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  navBtnPrimary: {
    backgroundColor: '#2563EB',
  },
  navBtnPrimaryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  submitExamBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  submitExamBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
