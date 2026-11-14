import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/useAuthStore';
import { translations, formatINR } from '@icc/shared-utils';
import { initialCourses } from '../../../admin-web/src/lib/sample-data';

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

export default function CourseDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { language } = useAuthStore();
  const t = translations[language];

  const course =
    initialCourses.find((c) => c.id === id) || initialCourses[0];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Course Banner */}
        <View style={styles.bannerContainer}>
          <Image
            source={thumbMap[course.id] || { uri: course.thumbnail_url }}
            style={styles.bannerImage}
            resizeMode="cover"
          />
          <View style={styles.priceTag}>
            <Text style={styles.priceTagText}>
              {course.is_free ? t.freeBatch : formatINR(course.discount_price || course.price)}
            </Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.boardBadgeRow}>
            <Text style={styles.boardBadge}>
              {course.title.includes('BSEB') ? 'Bihar Board (BSEB)' : 'Jharkhand Board (JAC)'}
            </Text>
            <Text style={styles.validityBadge}>⏱️ {course.validity_days} Days Validity</Text>
          </View>

          <Text style={styles.title}>
            {course.title}
          </Text>

          <Text style={styles.desc}>
            {course.description}
          </Text>

          {/* Key Course Stats */}
          <View style={styles.statsCard}>
            <View style={styles.statBox}>
              <Text style={styles.statIcon}>📹</Text>
              <Text style={styles.statVal}>{course.lecture_count || 45}+</Text>
              <Text style={styles.statLabel}>Lectures</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statIcon}>📑</Text>
              <Text style={styles.statVal}>{course.material_count || 24}+</Text>
              <Text style={styles.statLabel}>PDF Notes</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statIcon}>📝</Text>
              <Text style={styles.statVal}>15+</Text>
              <Text style={styles.statLabel}>Mock Tests</Text>
            </View>
          </View>

          {/* Curriculum Structure */}
          <View style={styles.curriculumSection}>
            <Text style={styles.sectionHeading}>
              Course Curriculum
            </Text>

            <View style={styles.chapterItem}>
              <Text style={styles.chapterNumber}>01</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.chapterTitle}>
                  Chemical Reactions & Equations
                </Text>
                <Text style={styles.chapterMeta}>5 Video Lectures · 2 PDF Notes</Text>
              </View>
            </View>

            <View style={styles.chapterItem}>
              <Text style={styles.chapterNumber}>02</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.chapterTitle}>
                  Acids, Bases & Salts
                </Text>
                <Text style={styles.chapterMeta}>6 Video Lectures · 3 PDF Notes</Text>
              </View>
            </View>

            <View style={styles.chapterItem}>
              <Text style={styles.chapterNumber}>03</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.chapterTitle}>
                  Real Numbers (Mathematics)
                </Text>
                <Text style={styles.chapterMeta}>4 Video Lectures · 1 Formula Sheet</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Enrollment Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomPriceLabel}>
            {course.is_free ? 'Free Course' : 'Course Fee'}
          </Text>
          <Text style={styles.bottomPriceVal}>
            {course.is_free
              ? 'FREE'
              : formatINR(course.discount_price || course.price)}
          </Text>
        </View>

        {course.is_free ? (
          <TouchableOpacity
            style={styles.enrollBtn}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.enrollBtnText}>Enroll Free</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.payBtn}
            onPress={() => router.push(`/payment/${course.id}`)}
          >
            <Text style={styles.payBtnText}>Pay via UPI ›</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scroll: {
    paddingBottom: 90,
  },
  bannerContainer: {
    height: 200,
    backgroundColor: '#CBD5E1',
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  priceTag: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  priceTagText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F59E0B',
  },
  body: {
    padding: 18,
  },
  boardBadgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  boardBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  validityBadge: {
    fontSize: 11,
    color: '#64748B',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 26,
    marginBottom: 8,
  },
  desc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 18,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  statVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  curriculumSection: {
    gap: 12,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  chapterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  chapterNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2563EB',
    backgroundColor: '#EFF6FF',
    width: 36,
    height: 36,
    borderRadius: 18,
    textAlign: 'center',
    lineHeight: 36,
  },
  chapterTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  chapterMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomPriceLabel: {
    fontSize: 10,
    color: '#64748B',
  },
  bottomPriceVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  enrollBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  enrollBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  payBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  payBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
