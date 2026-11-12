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

export default function StudentCoursesScreen() {
  const router = useRouter();
  const { language, selectedBoard, setBoard } = useAuthStore();
  const t = translations[language];

  const filteredCourses = initialCourses.filter((c) =>
    selectedBoard === 'BSEB'
      ? c.title.includes('BSEB') || c.board_id?.includes('1')
      : c.title.includes('JAC') || c.board_id?.includes('2')
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Board Switcher */}
      <View style={styles.topBar}>
        <View style={styles.boardSwitcher}>
          <TouchableOpacity
            style={[styles.boardBtn, selectedBoard === 'BSEB' && styles.boardBtnActive]}
            onPress={() => setBoard('BSEB')}
          >
            <Text
              style={[
                styles.boardBtnText,
                selectedBoard === 'BSEB' && styles.boardBtnTextActive,
              ]}
            >
              बिहार बोर्ड (BSEB)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.boardBtn, selectedBoard === 'JAC' && styles.boardBtnActive]}
            onPress={() => setBoard('JAC')}
          >
            <Text
              style={[
                styles.boardBtnText,
                selectedBoard === 'JAC' && styles.boardBtnTextActive,
              ]}
            >
              झारखंड बोर्ड (JAC)
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.pageTitle}>
          {language === 'hi'
            ? `${selectedBoard === 'BSEB' ? 'बिहार बोर्ड' : 'झारखंड बोर्ड'} के पाठ्यक्रम`
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
                  source={{ uri: course.thumbnail_url }}
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
                  <Text style={styles.stat}>⏱️ {course.validity_days} दिन</Text>
                  <Text style={styles.stat}>📹 {course.lecture_count || 40} वीडियो</Text>
                  <Text style={styles.stat}>📄 {course.material_count || 25} पीडीएफ</Text>
                </View>

                <View style={styles.actionRow}>
                  {course.is_free ? (
                    <TouchableOpacity
                      style={styles.freeBtn}
                      onPress={() => router.push(`/course/${course.id}`)}
                    >
                      <Text style={styles.freeBtnText}>{t.enrollNow} (Free)</Text>
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
    gap: 8,
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
    fontSize: 12,
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
