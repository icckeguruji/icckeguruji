import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/useAuthStore';
import { translations } from '@icc/shared-utils';

export default function ExamResultScreen() {
  const router = useRouter();
  const { id, totalScore, totalMarks, accuracy, passed } =
    useLocalSearchParams<{
      id: string;
      totalScore: string;
      totalMarks: string;
      accuracy: string;
      passed: string;
    }>();

  const { language } = useAuthStore();
  const t = translations[language];
  const isPassed = passed === 'true';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Scorecard Header Banner */}
        <View style={[styles.resultCard, isPassed ? styles.resultCardPass : styles.resultCardFail]}>
          <Text style={{ fontSize: 44, textAlign: 'center', marginBottom: 8 }}>
            {isPassed ? '🏆' : '📚'}
          </Text>
          <Text style={styles.resultTitle}>
            {isPassed
              ? language === 'hi'
                ? 'बधाई! आप उत्तीर्ण हुए'
                : 'Congratulations! You Passed'
              : language === 'hi'
              ? 'पुनः अभ्यास की आवश्यकता है'
              : 'Needs Practice'}
          </Text>
          <Text style={styles.resultScore}>
            {totalScore || '2'} / {totalMarks || '3'} Marks
          </Text>
          <Text style={styles.accuracyText}>
            सटीकता दर (Accuracy): {accuracy || '67%'}
          </Text>
        </View>

        {/* Detailed Solutions & Explanations */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>
            {language === 'hi'
              ? 'विस्तृत समाधान एवं व्याख्या (Solutions)'
              : 'Detailed Explanations'}
          </Text>

          {/* Solution 1 */}
          <View style={styles.solutionCard}>
            <View style={styles.qHeader}>
              <Text style={styles.qNum}>प्रश्न 1 (Correct · +1.0)</Text>
              <Text style={styles.correctBadge}>✓ सही उत्तर</Text>
            </View>
            <Text style={styles.qText}>
              जब कली चूना (CaO) जल से अभिक्रिया करता है, तो यह किस प्रकार की अभिक्रिया होती है?
            </Text>
            <View style={styles.answerBox}>
              <Text style={styles.ansText}>
                सही विकल्प: <Text style={{ fontWeight: 'bold' }}>ऊष्माक्षेपी संयोजन अभिक्रिया</Text>
              </Text>
              <Text style={styles.explainText}>
                व्याख्या: CaO + H2O → Ca(OH)2 + ऊष्मा। इस अभिक्रिया में ऊष्मा उत्सर्जित होती है और दो अभिकारक मिलकर एक उत्पाद बनाते हैं, अतः यह ऊष्माक्षेपी संयोजन अभिक्रिया है।
              </Text>
            </View>
          </View>

          {/* Solution 2 */}
          <View style={styles.solutionCard}>
            <View style={styles.qHeader}>
              <Text style={styles.qNum}>प्रश्न 2 (Correct · +1.0)</Text>
              <Text style={styles.correctBadge}>✓ सही उत्तर</Text>
            </View>
            <Text style={styles.qText}>
              जिंक के दानों पर तनु सल्फ्यूरिक अम्ल डालने पर कौन सी गैस उत्सर्जित होती है?
            </Text>
            <View style={styles.answerBox}>
              <Text style={styles.ansText}>
                सही विकल्प: <Text style={{ fontWeight: 'bold' }}>हाइड्रोजन (H2)</Text>
              </Text>
              <Text style={styles.explainText}>
                व्याख्या: Zn + H2SO4 → ZnSO4 + H2↑। धातु अम्ल के साथ क्रिया करके हाइड्रोजन गैस मुक्त करते हैं।
              </Text>
            </View>
          </View>
        </View>

        {/* Return Button */}
        <TouchableOpacity
          style={styles.returnBtn}
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={styles.returnBtnText}>
            {language === 'hi' ? 'डैशबोर्ड पर वापस जाएं' : 'Return to Home Dashboard'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scroll: {
    padding: 18,
    paddingBottom: 40,
  },
  resultCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  resultCardPass: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1.5,
  },
  resultCardFail: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1.5,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#065F46',
  },
  resultScore: {
    fontSize: 32,
    fontWeight: '900',
    color: '#047857',
    marginVertical: 4,
  },
  accuracyText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
  section: {
    gap: 14,
    marginBottom: 24,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  solutionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  qHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  qNum: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  correctBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
  },
  qText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 20,
  },
  answerBox: {
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  ansText: {
    fontSize: 12,
    color: '#1E40AF',
    marginBottom: 4,
  },
  explainText: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 16,
  },
  returnBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  returnBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
