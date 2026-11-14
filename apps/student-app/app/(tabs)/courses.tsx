import React, { useState } from 'react';
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
import { initialCourses } from '../../../admin-web/src/lib/sample-data';

// Thumbnail map for local React Native assets (web paths won't work in RN)
const thumbMap: Record<string, any> = {
  'cr000000-0000-0000-0000-000000000001': require('../../assets/thumbnails/batch-b3-class10.jpg'),
  'cr000000-0000-0000-0000-000000000002': require('../../assets/thumbnails/batch-b4-class9.jpg'),
  'cr000000-0000-0000-0000-000000000003': require('../../assets/thumbnails/batch-b1-class8.jpg'),
  'cr000000-0000-0000-0000-000000000004': require('../../assets/thumbnails/batch-b2-class7.jpg'),
  'batch-b3-class10': require('../../assets/thumbnails/batch-b3-class10.jpg'),
  'batch-b4-class9': require('../../assets/thumbnails/batch-b4-class9.jpg'),
  'batch-b1-class8': require('../../assets/thumbnails/batch-b1-class8.jpg'),
  'batch-b2-class7': require('../../assets/thumbnails/batch-b2-class7.jpg'),
};

// Board IDs from sample-data
const BSEB_BOARD_ID = 'b0000000-0000-0000-0000-000000000001';
const JAC_BOARD_ID = 'b0000000-0000-0000-0000-000000000002';

type BoardFilter = 'ALL' | 'BSEB' | 'JAC';

export default function StudentCoursesScreen() {
  const router = useRouter();
  const { language } = useAuthStore();
  const t = translations[language];

  const [selectedBoard, setSelectedBoard] = useState<BoardFilter>('ALL');

  const filteredCourses = initialCourses.filter((c) => {
    if (selectedBoard === 'ALL') return true;
    if (selectedBoard === 'BSEB') return c.board_id === BSEB_BOARD_ID;
    if (selectedBoard === 'JAC') return c.board_id === JAC_BOARD_ID;
    return true;
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Board Switcher */}
      <View style={styles.topBar}>
        <View style={styles.boardSwitcher}>
          <TouchableOpacity
            style={[styles.boardBtn, selectedBoard === 'ALL' && styles.boardBtnActive]}
            onPress={() => setSelectedBoard('ALL')}
          >
            <Text
              style={[
                styles.boardBtnText,
                selectedBoard === 'ALL' && styles.boardBtnTextActive,
              ]}
            >
              {language === 'hi' ? 'सभी' : 'All'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.boardBtn, selectedBoard === 'BSEB' && styles.boardBtnActive]}
            onPress={() => setSelectedBoard('BSEB')}
          >
            <Text
              style={[
                styles.boardBtnText,
                selectedBoard === 'BSEB' && styles.boardBtnTextActive,
              ]}
            >
              {language === 'hi' ? 'बिहार बोर्ड (BSEB)' : 'Bihar Board (BSEB)'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.boardBtn, selectedBoard === 'JAC' && styles.boardBtnActive]}
            onPress={() => setSelectedBoard('JAC')}
          >
            <Text
              style={[
                styles.boardBtnText,
                selectedBoard === 'JAC' && styles.boardBtnTextActive,
              ]}
            >
              {language === 'hi' ? 'झारखंड बोर्ड (JAC)' : 'Jharkhand Board (JAC)'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.pageTitle}>
          {language === 'hi'
            ? selectedBoard === 'ALL'
              ? 'सभी पाठ्यक्रम'
              : selectedBoard === 'BSEB'
              ? 'बिहार बोर्ड के पाठ्यक्रम'
              : 'झारखंड बोर्ड के पाठ्यक्रम'
            : selectedBoard === 'ALL'
            ? 'All Courses'
            : `${selectedBoard} Examination Courses`}
        </Text>

        <View style={styles.courseList}>
          {filteredCourses.map((course) => (
            <TouchableOpacity
              key={course.id}
              style={styles.card}
              activeOpacity={0.9}
              onPress={() => router.push(`/course/${course.id}`)}
            >
              <View style={styles.imageBox}>
                <Image
                  source={thumbMap[course.id] || { uri: course.thumbnail_url }}
                  style={styles.thumbnail}
                  resizeMode="cover"
                />
                <View style={styles.tagBadge}>
                  <Text style={styles.tagBadgeText}>
                    {course.is_free ? t.freeBatch : formatINR(course.discount_price || course.price)}
                  </Text>
                </View>
              </View>

              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>
                  {language === 'hi' ? course.title_hi || course.title : course.title}
                </Text>
                <Text style={styles.cardDesc} numberOfLines={2}>
                  {language === 'hi' ? course.description_hi || course.description : course.description}
                </Text>

                <View style={styles.statsRow}>
                  <Text style={styles.stat}>
                    ⏱️ {course.validity_days} {language === 'hi' ? 'दिन' : 'Days'}
                  </Text>
                  <Text style={styles.stat}>
                    📹 {course.lecture_count || 40} {language === 'hi' ? 'वीडियो' : 'Videos'}
                  </Text>
                  <Text style={styles.stat}>
                    📄 {course.material_count || 25} {language === 'hi' ? 'पीडीएफ' : 'PDFs'}
                  </Text>
                </View>

                <View style={styles.actionRow}>
                  {course.is_free ? (
                    <TouchableOpacity
                      style={styles.freeBtn}
                      onPress={() => router.push(`/course/${course.id}`)}
                    >
                      <Text style={styles.freeBtnText}>{t.enrollNow}</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.payBtn}
                      onPress={() => router.push(`/payment/${course.id}`)}
                    >
                      <Text style={styles.payBtnText}>{t.payUpi}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </TouchableOpacity>
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
  topBar: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  boardSwitcher: {
    flexDirection: 'row',
    gap: 6,
  },
  boardBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  boardBtnActive: {
    backgroundColor: '#2563EB',
  },
  boardBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  boardBtnTextActive: {
    color: '#FFFFFF',
  },
  scroll: {
    padding: 16,
    paddingBottom: 30,
  },
  pageTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 16,
  },
  courseList: {
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  imageBox: {
    height: 140,
    backgroundColor: '#CBD5E1',
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  tagBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#0F172A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F59E0B',
  },
  cardBody: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 22,
  },
  cardDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  stat: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  actionRow: {
    marginTop: 14,
  },
  freeBtn: {
    backgroundColor: '#059669',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  freeBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  payBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  payBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
