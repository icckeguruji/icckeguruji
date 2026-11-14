import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/useAuthStore';
import { translations, formatINR } from '@icc/shared-utils';

export default function StudentHomeScreen() {
  const router = useRouter();
  const { user, language, setLanguage, selectedBoard, selectedClass } = useAuthStore();
  const t = translations[language];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Top Student Header */}
        <View style={styles.topHeader}>
          <View>
            <Text style={styles.greetingText}>
              {language === 'hi' ? 'नमस्ते,' : 'Welcome back,'}
            </Text>
            <Text style={styles.studentName}>{user?.full_name || 'Student'}</Text>
          </View>

          <View style={styles.badgeGroup}>
            <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
              <TouchableOpacity
                style={styles.langTogglePill}
                onPress={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              >
                <Text style={styles.langToggleText}>
                  {language === 'en' ? 'हिंदी' : 'English'}
                </Text>
              </TouchableOpacity>
              <View style={styles.boardPill}>
                <Text style={styles.boardPillText}>
                  {selectedBoard === 'BSEB'
                    ? (language === 'hi' ? 'बिहार बोर्ड' : 'BSEB')
                    : (language === 'hi' ? 'झारखंड बोर्ड' : 'JAC')}
                </Text>
              </View>
            </View>
            <View style={styles.classPill}>
              <Text style={styles.classPillText}>{selectedClass}</Text>
            </View>
          </View>
        </View>

        {/* Live Class Highlight Banner */}
        <View style={styles.liveCard}>
          <View style={styles.liveBadgeRow}>
            <View style={styles.liveDot} />
            <Text style={styles.liveBadgeText}>
              {language === 'hi' ? 'अभी लाइव' : 'LIVE NOW'}
            </Text>
          </View>
          <Text style={styles.liveTitle}>
            {language === 'hi'
              ? 'विज्ञान: 2 अंक वाले महत्वपूर्ण संभावित प्रश्न'
              : 'Science: Important 2-Mark Expected Questions'}
          </Text>
          <Text style={styles.liveTeacher}>
            {language === 'hi' ? 'मार्गदर्शन: BADE SIR एवं विशेषज्ञ संकाय' : 'By: BADE SIR & Expert Faculty'}
          </Text>

          <TouchableOpacity
            style={styles.joinLiveBtn}
            onPress={() => router.push('/(tabs)/live')}
          >
            <Text style={styles.joinLiveBtnText}>
              {language === 'hi' ? 'अभी क्लास से जुड़ें' : 'Join Live Class'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Continue Watching / Resume Bar */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {language === 'hi' ? 'पढ़ाई जारी रखें' : 'Continue Watching'}
          </Text>
          <TouchableOpacity
            style={styles.resumeCard}
            onPress={() => router.push('/lecture/lec-1')}
          >
            <View style={styles.resumeThumb}>
              <Text style={{ fontSize: 24 }}>▶️</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.resumeTitle} numberOfLines={1}>
                {language === 'hi'
                  ? 'अध्याय 1: रासायनिक अभिक्रियाएँ एवं समीकरण'
                  : 'Ch 1: Chemical Reactions & Equations'}
              </Text>
              <Text style={styles.resumeSub}>
                {language === 'hi' ? 'लेक्चर 02 · 18 मिनट शेष' : 'Lecture 02 · 18m left'}
              </Text>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: '65%' }]} />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick Service Grid */}
        <View style={styles.gridRow}>
          <TouchableOpacity
            style={styles.gridItem}
            onPress={() => router.push('/(tabs)/notes')}
          >
            <Text style={styles.gridIcon}>📄</Text>
            <Text style={styles.gridText}>{t.notes}</Text>
            <Text style={styles.gridSub}>{language === 'hi' ? 'स्वतः मैप्ड' : 'Auto Mapped'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridItem}
            onPress={() => router.push('/(tabs)/tests')}
          >
            <Text style={styles.gridIcon}>📝</Text>
            <Text style={styles.gridText}>{t.tests}</Text>
            <Text style={styles.gridSub}>{language === 'hi' ? 'एमसीक्यू टेस्ट' : 'MCQ & Timer'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridItem}
            onPress={() => router.push('/doubts')}
          >
            <Text style={styles.gridIcon}>💬</Text>
            <Text style={styles.gridText}>{t.doubts}</Text>
            <Text style={styles.gridSub}>{language === 'hi' ? 'शिक्षक से पूछें' : 'Ask Faculty'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridItem}
            onPress={() => router.push('/assignments')}
          >
            <Text style={styles.gridIcon}>📋</Text>
            <Text style={styles.gridText}>{language === 'hi' ? 'असाइनमेंट' : 'Assignments'}</Text>
            <Text style={styles.gridSub}>{language === 'hi' ? 'गृहकार्य' : 'Homework'}</Text>
          </TouchableOpacity>
        </View>

        {/* Enrolled Courses Section */}
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={styles.sectionTitle}>
              {language === 'hi' ? 'आपके सक्रिय पाठ्यक्रम' : 'Your Enrolled Courses'}
            </Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/courses')}>
              <Text style={styles.seeAllText}>
                {language === 'hi' ? 'सभी देखें' : 'View All'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.courseCard}
            onPress={() => router.push('/course/cr-1')}
          >
            <View style={styles.courseBadge}>
              <Text style={styles.courseBadgeText}>BSEB 2026-27</Text>
            </View>
            <Text style={styles.courseTitle}>
              {language === 'hi'
                ? 'बिहार बोर्ड कक्षा 10 टॉपर बैच (2026-27)'
                : 'BSEB Class 10 Toppers Batch (2026-27)'}
            </Text>
            <Text style={styles.courseDesc} numberOfLines={2}>
              {language === 'hi'
                ? 'प्रतिदिन लाइव कक्षाएं, संपूर्ण हस्तलिखित टॉपर नोट्स, साप्ताहिक टेस्ट एवं 10 वर्षीय हल प्रश्न पत्र।'
                : 'Daily live classes, handwritten notes, weekly mock tests and previous 10 years papers.'}
            </Text>
            <View style={styles.courseMetaRow}>
              <Text style={styles.courseMeta}>
                {language === 'hi' ? '85 व्याख्यान' : '85 Lectures'}
              </Text>
              <Text style={styles.courseMeta}>
                {language === 'hi' ? '42 पीडीएफ नोट्स' : '42 PDF Notes'}
              </Text>
              <Text style={styles.courseActiveStatus}>
                {language === 'hi' ? 'सक्रिय' : 'Active'}
              </Text>
            </View>
          </TouchableOpacity>
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
    paddingBottom: 36,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greetingText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  studentName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  badgeGroup: {
    alignItems: 'flex-end',
    gap: 4,
  },
  boardPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  langTogglePill: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  langToggleText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  boardPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1E40AF',
  },
  classPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  classPillText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },
  liveCard: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  liveBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  liveBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EF4444',
    letterSpacing: 0.5,
  },
  liveTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 22,
  },
  liveTeacher: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  joinLiveBtn: {
    backgroundColor: '#EF4444',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 14,
  },
  joinLiveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 22,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  resumeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  resumeThumb: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resumeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  resumeSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 6,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 4,
    backgroundColor: '#2563EB',
    borderRadius: 2,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
    gap: 8,
  },
  gridItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  gridIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  gridText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },
  gridSub: {
    fontSize: 9,
    color: '#94A3B8',
    marginTop: 2,
  },
  courseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  courseBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  courseBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
  },
  courseTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 20,
  },
  courseDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 18,
  },
  courseMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  courseMeta: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  courseActiveStatus: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
});
