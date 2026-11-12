import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/useAuthStore';
import { translations } from '@icc/shared-utils';

export default function StudentTestsScreen() {
  const router = useRouter();
  const { language } = useAuthStore();
  const t = translations[language];

  const tests = [
    {
      id: 'ex-1',
      title: 'BSEB Class 10 Science: Chemical Reactions & Equations Test',
      title_hi: 'बिहार बोर्ड कक्षा 10 विज्ञान: रासायनिक अभिक्रियाएँ एवं समीकरण टेस्ट',
      duration: 30,
      marks: 20,
      passMarks: 7,
      negative: 0.25,
      type: 'Chapter Test',
    },
    {
      id: 'ex-2',
      title: 'BSEB Class 10 Mathematics: Real Numbers Practice Exam',
      title_hi: 'बिहार बोर्ड कक्षा 10 गणित: वास्तविक संख्याएं अभ्यास परीक्षा',
      duration: 40,
      marks: 25,
      passMarks: 9,
      negative: 0.0,
      type: 'Mock Test',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.tests}</Text>
        <Text style={styles.headerSub}>
          {language === 'hi'
            ? 'समयबद्ध वस्तुनिष्ठ प्रश्नोत्तरी एवं तत्काल परिणाम'
            : 'Timed MCQ tests with instant server-evaluated scorecard'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.testList}>
          {tests.map((test) => (
            <View key={test.id} style={styles.testCard}>
              <View style={styles.badgeRow}>
                <Text style={styles.typeBadge}>{test.type}</Text>
                <Text style={styles.duration}>⏱️ {test.duration} {t.minutes}</Text>
              </View>

              <Text style={styles.testTitle}>
                {language === 'hi' ? test.title_hi : test.title}
              </Text>

              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>{t.marks}</Text>
                  <Text style={styles.statVal}>{test.marks}</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>
                    {language === 'hi' ? 'उत्तीर्ण अंक' : 'Pass Marks'}
                  </Text>
                  <Text style={styles.statVal}>{test.passMarks}</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>
                    {language === 'hi' ? 'निगेटिव मार्किंग' : 'Negative'}
                  </Text>
                  <Text style={[styles.statVal, { color: '#DC2626' }]}>-{test.negative}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.startBtn}
                onPress={() => router.push(`/exam/${test.id}`)}
              >
                <Text style={styles.startBtnText}>{t.startTest}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
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
    paddingBottom: 30,
  },
  testList: {
    gap: 16,
  },
  testCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#7C3AED',
    backgroundColor: '#F5F3FF',
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
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 14,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: '#64748B',
    marginBottom: 2,
  },
  statVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  startBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
  },
  startBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
