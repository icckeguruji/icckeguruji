import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/useAuthStore';
import { translations } from '@icc/shared-utils';
import { Share2, MessageCircle, ArrowLeft } from 'lucide-react-native';

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

  const { user, language } = useAuthStore();
  const t = translations[language];
  const isPassed = passed === 'true';

  const handleShareWithParents = async () => {
    const rawPhone = (user?.guardian_phone || user?.mobile_number || '9771350910').replace(/\D/g, '');
    const cleanPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;

    const msg = `🏫 *आदर्श कोचिंग सेन्टर (IDEAL COACHING CENTRE)*
📍 सरोतिया, महगामा, गोड्डा (झारखंड)
निदेशक: बड़े सर (BADE SIR) | +91 9771350910
----------------------------------------
📋 *साप्ताहिक टेस्ट रिपोर्ट कार्ड (Student Scorecard)*
विद्यार्थी का नाम: *${user?.full_name || 'Student'}*
कक्षा एवं बोर्ड: *${user?.board_code || 'BSEB'} Class 10*
प्राप्तांक (Score): *${totalScore || '18'} / ${totalMarks || '20'} Marks (${accuracy || '90%'})*
परिणाम: *${isPassed ? 'उत्तीर्ण (PASSED ⭐⭐⭐)' : 'अभ्यास जारी (Needs Practice)'}*
अभिभावक: *${user?.guardian_name || 'आदरणीय अभिभावक'}*
----------------------------------------
आदर्श कोचिंग सेन्टर द्वारा स्वचालित रिपोर्ट`;

    const url = `whatsapp://send?phone=${cleanPhone}&text=${encodeURIComponent(msg)}`;
    const webUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;

    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        await Linking.openURL(webUrl);
      }
    } catch {
      await Linking.openURL(webUrl);
    }
  };

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
              ? 'Congratulations! You Passed'
              : 'Needs Practice'}
          </Text>
          <Text style={styles.resultScore}>
            {totalScore || '2'} / {totalMarks || '3'} Marks
          </Text>
          <Text style={styles.accuracyText}>
            Accuracy Rate: {accuracy || '67%'}
          </Text>
        </View>

        {/* WhatsApp Parent Share Card */}
        <TouchableOpacity
          style={styles.whatsappCard}
          onPress={handleShareWithParents}
          activeOpacity={0.8}
        >
          <View style={styles.whatsappIconCircle}>
            <Text style={{ fontSize: 20 }}>📲</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.whatsappTitle}>Send Report Card to Parents on WhatsApp</Text>
            <Text style={styles.whatsappSub}>
              Send official scorecard summary to {user?.guardian_name || 'Parent'} ({user?.guardian_phone || 'WhatsApp'})
            </Text>
          </View>
        </TouchableOpacity>

        {/* Detailed Solutions & Explanations */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>
            Detailed Solutions & Explanations
          </Text>

          {/* Solution 1 */}
          <View style={styles.solutionCard}>
            <View style={styles.qHeader}>
              <Text style={styles.qNum}>Question 1 (Correct · +1.0)</Text>
              <Text style={styles.correctBadge}>✓ Correct Answer</Text>
            </View>
            <Text style={styles.qText}>
              जब कली चूना (CaO) जल से अभिक्रिया करता है, तो यह किस प्रकार की अभिक्रिया होती है?
            </Text>
            <View style={styles.answerBox}>
              <Text style={styles.ansText}>
                Correct Option: <Text style={{ fontWeight: 'bold' }}>ऊष्माक्षेपी संयोजन अभिक्रिया</Text>
              </Text>
              <Text style={styles.explainText}>
                Explanation: CaO + H2O → Ca(OH)2 + ऊष्मा। इस अभिक्रिया में ऊष्मा उत्सर्जित होती है और दो अभिकारक मिलकर एक उत्पाद बनाते हैं, अतः यह ऊष्माक्षेपी संयोजन अभिक्रिया है।
              </Text>
            </View>
          </View>

          {/* Solution 2 */}
          <View style={styles.solutionCard}>
            <View style={styles.qHeader}>
              <Text style={styles.qNum}>Question 2 (Correct · +1.0)</Text>
              <Text style={styles.correctBadge}>✓ Correct Answer</Text>
            </View>
            <Text style={styles.qText}>
              जिंक के दानों पर तनु सल्फ्यूरिक अम्ल डालने पर कौन सी गैस उत्सर्जित होती है?
            </Text>
            <View style={styles.answerBox}>
              <Text style={styles.ansText}>
                Correct Option: <Text style={{ fontWeight: 'bold' }}>हाइड्रोजन (H2)</Text>
              </Text>
              <Text style={styles.explainText}>
                Explanation: Zn + H2SO4 → ZnSO4 + H2↑। धातु अम्ल के साथ क्रिया करके हाइड्रोजन गैस मुक्त करते हैं।
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
            Return to Home Dashboard
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
  whatsappCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#6EE7B7',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  whatsappIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  whatsappTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#065F46',
    marginBottom: 2,
  },
  whatsappSub: {
    fontSize: 11,
    color: '#047857',
    lineHeight: 15,
  },
});
