import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useAuthStore } from '../../src/store/useAuthStore';
import { translations } from '@icc/shared-utils';

export default function StudentAssignmentsScreen() {
  const { language } = useAuthStore();
  const t = translations[language];

  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const assignments = [
    {
      id: 'as-1',
      subject: 'Science (विज्ञान)',
      title: 'अध्याय 1: रासायनिक समीकरणों को संतुलित करने का गृहकार्य',
      instructions: 'NCERT अभ्यास के प्रश्न संख्या 5, 6 और 7 को कॉपी में हल करके उत्तर संलग्न करें।',
      dueDate: '15 अप्रैल 2026, 06:00 PM',
      maxMarks: 20,
      status: 'submitted',
      marks: 18,
      remarks: 'अति उत्तम प्रस्तुति। केवल प्रश्न 6(b) में ताप का संकेत छोड़ दिया गया था।',
    },
    {
      id: 'as-2',
      subject: 'Mathematics (गणित)',
      title: 'अध्याय 1: यूक्लिड विभाजन प्रमेयिका एवं अपरिमेयता सिद्ध करना',
      instructions: 'सिद्ध कीजिए कि √5 एक अपरिमेय संख्या है। संपूर्ण उपपत्ति लिखकर जमा करें।',
      dueDate: '18 अप्रैल 2026, 08:00 PM',
      maxMarks: 15,
      status: 'pending',
    },
  ];

  const handleSubmit = (id: string) => {
    setSubmittedId(id);
    Alert.alert(
      'Success',
      'Assignment submitted successfully for teacher review.'
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Assignments & Homework</Text>
          <Text style={styles.pageSub}>Submit homework on time and receive scores & teacher feedback</Text>
        </View>

        <View style={styles.list}>
          {assignments.map((a) => {
            const isDone = a.status === 'submitted' || submittedId === a.id;
            return (
              <View key={a.id} style={styles.card}>
                <View style={styles.topRow}>
                  <Text style={styles.subjectTag}>{a.subject}</Text>
                  <Text style={styles.marksTag}>{a.maxMarks} Marks</Text>
                </View>

                <Text style={styles.title}>{a.title}</Text>
                <Text style={styles.instructions}>{a.instructions}</Text>
                <Text style={styles.dueDate}>⏰ Due Date: {a.dueDate}</Text>

                {a.status === 'submitted' && a.marks !== undefined ? (
                  <View style={styles.feedbackCard}>
                    <View style={styles.feedbackScoreRow}>
                      <Text style={styles.feedbackScore}>
                        Score: {a.marks} / {a.maxMarks}
                      </Text>
                      <Text style={styles.gradeBadge}>Grade: A+</Text>
                    </View>
                    <Text style={styles.feedbackRemarks}>Teacher Remarks: {a.remarks}</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.submitBtn, isDone && styles.submitBtnDone]}
                    onPress={() => handleSubmit(a.id)}
                    disabled={isDone}
                  >
                    <Text style={styles.submitBtnText}>
                      {isDone ? '✓ Submitted' : 'Upload File & Submit ›'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
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
  scroll: {
    padding: 18,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  pageSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  list: {
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subjectTag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  marksTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 20,
  },
  instructions: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
  dueDate: {
    fontSize: 11,
    fontWeight: '600',
    color: '#DC2626',
    marginTop: 4,
  },
  submitBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnDone: {
    backgroundColor: '#059669',
  },
  submitBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  feedbackCard: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
    borderWidth: 1,
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
    gap: 4,
  },
  feedbackScoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feedbackScore: {
    fontSize: 13,
    fontWeight: '800',
    color: '#15803D',
  },
  gradeBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  feedbackRemarks: {
    fontSize: 11,
    color: '#166534',
    lineHeight: 16,
  },
});
