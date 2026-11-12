import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useAuthStore } from '../../src/store/useAuthStore';
import { translations } from '@icc/shared-utils';

interface DoubtItem {
  id: string;
  subject: string;
  title: string;
  description: string;
  status: 'open' | 'resolved';
  answer?: string;
  answeredBy?: string;
}

export default function StudentDoubtsScreen() {
  const { language } = useAuthStore();
  const t = translations[language];

  const [doubts, setDoubts] = useState<DoubtItem[]>([
    {
      id: 'd-1',
      subject: 'Science (विज्ञान)',
      title: 'विस्थापन एवं द्विविस्थापन अभिक्रिया में क्या अंतर है?',
      description: 'सर, कृपया उदाहरण सहित समझाएं कि कॉपर सल्फेट और आयरन की क्रिया विस्थापन क्यों है?',
      status: 'resolved',
      answer: 'विस्थापन अभिक्रिया में अधिक क्रियाशील तत्व कम क्रियाशील तत्व को उसके यौगिक से विस्थापित करता है। Fe + CuSO4 -> FeSO4 + Cu। जबकि द्विविस्थापन में आयनों का आदान-प्रदान होता है।',
      answeredBy: 'Dr. S. N. Mishra (Chemistry Faculty)',
    },
    {
      id: 'd-2',
      subject: 'Mathematics (गणित)',
      title: 'यूक्लिड विभाजन प्रमेयिका द्वारा HCF ज्ञात करने में शेषफल शून्य न आने पर क्या करें?',
      description: 'कृपया 135 और 225 के HCF का चरणबद्ध हल बताएं।',
      status: 'open',
    },
  ]);

  const [isAsking, setIsAsking] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const handlePostDoubt = () => {
    if (!newTitle.trim() || !newDesc.trim()) {
      Alert.alert('त्रुटि', 'कृपया शीर्षक और प्रश्न विवरण दर्ज करें।');
      return;
    }
    const created: DoubtItem = {
      id: `d-${Date.now()}`,
      subject: 'Science (विज्ञान)',
      title: newTitle,
      description: newDesc,
      status: 'open',
    };
    setDoubts([created, ...doubts]);
    setIsAsking(false);
    setNewTitle('');
    setNewDesc('');
    Alert.alert(
      language === 'hi' ? 'सफलता' : 'Success',
      language === 'hi'
        ? 'आपकी शंका संकाय को भेज दी गई है। उत्तर शीघ्र प्राप्त होगा।'
        : 'Doubt submitted to faculty.'
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.headerRow}>
          <div>
            <Text style={styles.pageTitle}>{t.doubts}</Text>
            <Text style={styles.pageSub}>विषय विशेषज्ञ संकाय द्वारा प्रत्यक्ष समाधान</Text>
          </div>
          <TouchableOpacity
            style={styles.askBtn}
            onPress={() => setIsAsking(!isAsking)}
          >
            <Text style={styles.askBtnText}>
              {isAsking ? '✕ रद्द करें' : '+ शंका पूछें'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* New Doubt Form */}
        {isAsking && (
          <View style={styles.askCard}>
            <Text style={styles.askHeading}>नया प्रश्न / शंका दर्ज करें</Text>
            <TextInput
              style={styles.input}
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="प्रश्न का संक्षिप्त शीर्षक (उदा. ओम का नियम)"
              placeholderTextColor="#94A3B8"
            />
            <TextInput
              style={[styles.input, { height: 90, textAlignVertical: 'top' }]}
              multiline
              value={newDesc}
              onChangeText={setNewDesc}
              placeholder="अपने संशय का विस्तृत विवरण लिखें..."
              placeholderTextColor="#94A3B8"
            />
            <TouchableOpacity style={styles.postBtn} onPress={handlePostDoubt}>
              <Text style={styles.postBtnText}>संकाय को भेजें (Submit Doubt)</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Doubts List */}
        <View style={styles.list}>
          {doubts.map((d) => (
            <View key={d.id} style={styles.doubtCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.subjectTag}>{d.subject}</Text>
                {d.status === 'resolved' ? (
                  <Text style={styles.resolvedTag}>✓ समाधान प्राप्त (Resolved)</Text>
                ) : (
                  <Text style={styles.openTag}>⏳ प्रक्रियाधीन (Under Review)</Text>
                )}
              </View>

              <Text style={styles.doubtTitle}>{d.title}</Text>
              <Text style={styles.doubtDesc}>{d.description}</Text>

              {d.answer && (
                <View style={styles.answerBox}>
                  <Text style={styles.facultyName}>👨‍🏫 {d.answeredBy}:</Text>
                  <Text style={styles.answerText}>{d.answer}</Text>
                </View>
              )}
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
  scroll: {
    padding: 18,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  askBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  askBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  askCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    gap: 10,
  },
  askHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    color: '#0F172A',
  },
  postBtn: {
    backgroundColor: '#059669',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  postBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  list: {
    gap: 14,
  },
  doubtCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subjectTag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  resolvedTag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  openTag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D97706',
  },
  doubtTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 20,
  },
  doubtDesc: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
  answerBox: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
    borderWidth: 1,
    padding: 12,
    borderRadius: 10,
    marginTop: 6,
  },
  facultyName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
    marginBottom: 4,
  },
  answerText: {
    fontSize: 12,
    color: '#14532D',
    lineHeight: 18,
  },
});
