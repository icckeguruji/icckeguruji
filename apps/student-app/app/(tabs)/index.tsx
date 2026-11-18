import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/useAuthStore';
import { CoachingHeader } from '../../src/components/CoachingHeader';
import { DataService } from '../../src/services/dataService';
import { supabase, isSupabaseConfigured } from '../../src/lib/supabase';
import { academicService, getResolvedThumbnailUrl, allInitialCourses } from '../../src/services/academicService';
import { Course, LiveClass } from '@icc/shared-types';
import {
  Play,
  Radio,
  FileText,
  CheckSquare,
  MessageSquareQuote,
  ClipboardList,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Plus,
  Users,
  CreditCard,
  BookOpen,
  Bot,
} from 'lucide-react-native';
import { DirectorAiModal } from '../../src/components/DirectorAiModal';

const thumbMap: Record<string, any> = {
  'c0000000-0000-0000-0000-000000000010': require('../../assets/thumbnails/batch-b3-class10.jpg'),
  'c0000000-0000-0000-0000-000000000009': require('../../assets/thumbnails/batch-b4-class9.jpg'),
  'c0000000-0000-0000-0000-000000000008': require('../../assets/thumbnails/batch-b1-class8.jpg'),
  'c0000000-0000-0000-0000-000000000007': require('../../assets/thumbnails/batch-b2-class7.jpg'),
  'cr000000-0000-0000-0000-000000000001': require('../../assets/thumbnails/batch-b3-class10.jpg'),
  'cr000000-0000-0000-0000-000000000002': require('../../assets/thumbnails/batch-b4-class9.jpg'),
  'cr000000-0000-0000-0000-000000000003': require('../../assets/thumbnails/batch-b1-class8.jpg'),
  'cr000000-0000-0000-0000-000000000004': require('../../assets/thumbnails/batch-b2-class7.jpg'),
  '10000000-0000-0000-0000-000000000001': require('../../assets/thumbnails/batch-b3-class10.jpg'),
  '10000000-0000-0000-0000-000000000002': require('../../assets/thumbnails/batch-b4-class9.jpg'),
  '10000000-0000-0000-0000-000000000003': require('../../assets/thumbnails/batch-b1-class8.jpg'),
  'batch-b3-class10': require('../../assets/thumbnails/batch-b3-class10.jpg'),
  'batch-b4-class9': require('../../assets/thumbnails/batch-b4-class9.jpg'),
  'batch-b1-class8': require('../../assets/thumbnails/batch-b1-class8.jpg'),
  'batch-b2-class7': require('../../assets/thumbnails/batch-b2-class7.jpg'),
};

export default function StudentHomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  const isAdmin =
    user?.role === 'admin' ||
    user?.role === 'super_admin' ||
    user?.email === 'icckeguruji@gmail.com' ||
    user?.mobile_number === '9771350910' ||
    user?.username === 'badesir';

  const [courses, setCourses] = useState<Course[]>(allInitialCourses);
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState<number>(0);
  const [activeStudentsCount, setActiveStudentsCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const loadCachedData = useCallback(async () => {
    try {
      const [fetchedCourses, fetchedLive] = await Promise.all([
        academicService.getCourses(),
        academicService.getLiveClasses(),
      ]);
      if (Array.isArray(fetchedCourses) && fetchedCourses.length > 0) {
        setCourses(fetchedCourses);
      }
      setLiveClasses(fetchedLive);

      // Fetch Live counts from Supabase or cached repository
      if (isSupabaseConfigured) {
        try {
          const [pendingRes, studentsRes] = await Promise.all([
            supabase.from('payments').select('id', { count: 'exact' }).eq('status', 'pending'),
            supabase.from('profiles').select('id', { count: 'exact' }).eq('is_active', true),
          ]);
          setPendingApprovalsCount(pendingRes.count ?? 0);
          setActiveStudentsCount(studentsRes.count ?? 0);
        } catch {
          const pays = await academicService.getPayments();
          const studs = await academicService.getStudents();
          setPendingApprovalsCount(pays.filter((p: any) => p.status === 'pending').length);
          setActiveStudentsCount(studs.filter((s: any) => s.is_active).length);
        }
      } else {
        const pays = await academicService.getPayments();
        const studs = await academicService.getStudents();
        setPendingApprovalsCount(pays.filter((p: any) => p.status === 'pending').length);
        setActiveStudentsCount(studs.filter((s: any) => s.is_active).length);
      }
    } catch {
      // Graceful fallback
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsSyncing(true);
    try {
      await academicService.syncFromCloud();
      await loadCachedData();
    } catch {
      // Graceful fallback
    } finally {
      setIsSyncing(false);
    }
  }, [loadCachedData]);

  useEffect(() => {
    loadCachedData();
    academicService.syncFromCloud().catch(() => {});
    const unsubAcademic = academicService.subscribe(() => {
      loadCachedData();
    });
    const unsubData = DataService.subscribeToChanges(() => {
      loadCachedData();
    });
    return () => {
      unsubAcademic();
      unsubData();
    };
  }, [loadCachedData]);

  const activeLive = liveClasses.find((l) => l.status === 'live') || liveClasses[0];
  const enrolledCourses = courses.length > 0 ? courses.slice(0, 3) : [];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Branded Coaching Header with Logo, Name & Live Sync */}
      <CoachingHeader
        showStudentGreeting={true}
        onRefresh={handleRefresh}
        isSyncing={isSyncing}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={isSyncing}
            onRefresh={handleRefresh}
            colors={['#2563EB']}
            tintColor="#2563EB"
          />
        }
      >
        {/* Director Mobile Unified Admin Hub */}
        {isAdmin && (
          <View style={styles.adminQuickPanel}>
            <View style={styles.adminQuickHeader}>
              <View style={styles.adminQuickBadge}>
                <ShieldCheck size={16} color="#B45309" />
                <Text style={styles.adminQuickBadgeText}>👑 Director Command Center (BADE SIR)</Text>
              </View>
              <Text style={styles.adminQuickSub}>All administrative features unified inside app</Text>
            </View>

            {/* Director AI Copilot Assistant Trigger */}
            <TouchableOpacity
              style={styles.adminAiBanner}
              onPress={() => setIsAiModalOpen(true)}
              activeOpacity={0.85}
            >
              <View style={styles.adminAiIconBox}>
                <Bot size={22} color="#2563EB" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.adminAiBannerTitle}>🤖 Director AI Copilot</Text>
                  <View style={styles.aiLiveBadge}>
                    <Text style={styles.aiLiveBadgeText}>AUTONOMOUS</Text>
                  </View>
                </View>
                <Text style={styles.adminAiBannerSub}>
                  बोलकर या लिखकर नए कोर्स, लाइव क्लास व फीस अप्रूवल कराएं
                </Text>
              </View>
              <ChevronRight size={18} color="#2563EB" />
            </TouchableOpacity>

            {/* Quick Metrics (100% Live Database Counts) */}
            <View style={styles.metricsRow}>
              <TouchableOpacity
                style={styles.metricCard}
                onPress={() => router.push('/(tabs)/profile')}
              >
                <CreditCard size={16} color="#2563EB" />
                <Text style={styles.metricNumber}>{pendingApprovalsCount} Pending</Text>
                <Text style={styles.metricLabel}>Fee Approvals</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.metricCard}
                onPress={() => router.push('/(tabs)/profile')}
              >
                <Users size={16} color="#059669" />
                <Text style={styles.metricNumber}>{activeStudentsCount} Active</Text>
                <Text style={styles.metricLabel}>Total Students</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.metricCard}
                onPress={() => router.push('/(tabs)/courses')}
              >
                <BookOpen size={16} color="#D97706" />
                <Text style={styles.metricNumber}>{courses.length}</Text>
                <Text style={styles.metricLabel}>Target Courses</Text>
              </TouchableOpacity>
            </View>

            {/* Inline Action Shortcuts */}
            <View style={styles.adminActionShortcuts}>
              <TouchableOpacity
                style={[styles.adminActionBtn, { backgroundColor: '#DC2626' }]}
                onPress={() => router.push('/(tabs)/live')}
              >
                <Radio size={13} color="#FFFFFF" />
                <Text style={styles.adminActionBtnText}>🔴 Go Live</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.adminActionBtn, { backgroundColor: '#2563EB' }]}
                onPress={() => router.push('/(tabs)/courses')}
              >
                <Plus size={13} color="#FFFFFF" />
                <Text style={styles.adminActionBtnText}>+ Course</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.adminActionBtn, { backgroundColor: '#059669' }]}
                onPress={() => router.push('/(tabs)/notes')}
              >
                <FileText size={13} color="#FFFFFF" />
                <Text style={styles.adminActionBtnText}>+ PDF</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Live Class Highlight Banner */}
        <View style={styles.liveCard}>
          <View style={styles.liveBadgeRow}>
            <View style={styles.liveDot} />
            <Text style={styles.liveBadgeText}>
              {activeLive?.status === 'live' ? 'STREAMING NOW' : 'NEXT LIVE CLASS'}
            </Text>
            <View style={styles.drmBadge}>
              <ShieldCheck size={11} color="#34D399" />
              <Text style={styles.drmBadgeText}>Secure In-App</Text>
            </View>
          </View>
          <Text style={styles.liveTitle}>
            {activeLive?.title || 'Science: Important 2-Mark Expected Questions'}
          </Text>
          <Text style={styles.liveTeacher}>
            By: BADE SIR & Expert Faculty
          </Text>

          <TouchableOpacity
            style={styles.joinLiveBtn}
            onPress={() => router.push('/(tabs)/live')}
            activeOpacity={0.85}
          >
            <Radio size={16} color="#FFFFFF" />
            <Text style={styles.joinLiveBtnText}>
              Watch Live Inside App
            </Text>
          </TouchableOpacity>
        </View>

        {/* Continue Watching / Resume Bar */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Continue Watching
          </Text>
          <TouchableOpacity
            style={styles.resumeCard}
            onPress={() => router.push('/(tabs)/courses')}
            activeOpacity={0.8}
          >
            <View style={styles.resumeThumb}>
              <Play size={20} color="#2563EB" fill="#2563EB" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.resumeTitle} numberOfLines={1}>
                Syllabus & Video Lectures
              </Text>
              <Text style={styles.resumeSub}>
                BSEB & JAC Board Curriculum
              </Text>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: '80%' }]} />
              </View>
            </View>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Quick Service Grid with Lucide Icons */}
        <View style={styles.gridRow}>
          <TouchableOpacity
            style={styles.gridItem}
            onPress={() => router.push('/(tabs)/courses')}
            activeOpacity={0.7}
          >
            <View style={[styles.iconBox, { backgroundColor: '#F0FDF4' }]}>
              <BookOpen size={20} color="#16A34A" />
            </View>
            <Text style={styles.gridText}>Courses</Text>
            <Text style={styles.gridSub}>All Batches</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridItem}
            onPress={() => router.push('/(tabs)/notes')}
            activeOpacity={0.7}
          >
            <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
              <FileText size={20} color="#2563EB" />
            </View>
            <Text style={styles.gridText}>Notes</Text>
            <Text style={styles.gridSub}>Secure View</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridItem}
            onPress={() => router.push('/doubts')}
            activeOpacity={0.7}
          >
            <View style={[styles.iconBox, { backgroundColor: '#FEF3C7' }]}>
              <MessageSquareQuote size={20} color="#D97706" />
            </View>
            <Text style={styles.gridText}>Doubts</Text>
            <Text style={styles.gridSub}>Ask Faculty</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridItem}
            onPress={() => router.push('/assignments')}
            activeOpacity={0.7}
          >
            <View style={[styles.iconBox, { backgroundColor: '#F5F3FF' }]}>
              <ClipboardList size={20} color="#7C3AED" />
            </View>
            <Text style={styles.gridText}>Homework</Text>
            <Text style={styles.gridSub}>Daily Tasks</Text>
          </TouchableOpacity>
        </View>

        {/* Enrolled Courses Section */}
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={styles.sectionTitle}>
              Your Enrolled Courses
            </Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/courses')}>
              <Text style={styles.seeAllText}>
                View All
              </Text>
            </TouchableOpacity>
          </View>

          {enrolledCourses.length === 0 ? (
            <View style={styles.emptyCoursesBox}>
              <BookOpen size={36} color="#94A3B8" />
              <Text style={styles.emptyCoursesTitle}>No Active Courses Enrolled</Text>
              <Text style={styles.emptyCoursesSub}>
                Explore full syllabus courses and enroll to start watching masterclasses.
              </Text>
              <TouchableOpacity
                style={styles.browseCoursesBtn}
                onPress={() => router.push('/(tabs)/courses')}
              >
                <Text style={styles.browseCoursesBtnText}>Browse Course Catalog</Text>
              </TouchableOpacity>
            </View>
          ) : (
            enrolledCourses.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={styles.courseCard}
                onPress={() => router.push(`/course/${c.id}`)}
                activeOpacity={0.8}
              >
                <View style={styles.courseImageBox}>
                  <Image
                    source={thumbMap[c.id] || { uri: getResolvedThumbnailUrl(c.thumbnail_url) }}
                    style={styles.courseThumbnail}
                    resizeMode="contain"
                  />
                  <View style={styles.courseTagBadge}>
                    <Text style={styles.courseTagBadgeText}>
                      Board Course 2027
                    </Text>
                  </View>
                </View>

                <View style={styles.courseCardContent}>
                  <Text style={styles.courseTitle}>
                    {c.title}
                  </Text>
                  <Text style={styles.courseDesc} numberOfLines={2}>
                    {c.description}
                  </Text>
                  <View style={styles.courseMetaRow}>
                    <Text style={styles.courseMeta}>
                      {c.lecture_count || 45} In-App Lectures
                    </Text>
                    <Text style={styles.courseMeta}>
                      {c.material_count || 24} PDF Notes
                    </Text>
                    <Text style={styles.courseActiveStatus}>
                      Active
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Director AI Copilot Assistant Modal */}
      <DirectorAiModal
        visible={isAiModalOpen}
        onClose={() => {
          setIsAiModalOpen(false);
          loadData();
        }}
      />
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
  adminQuickPanel: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  adminQuickHeader: {
    marginBottom: 10,
  },
  adminQuickBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  adminQuickBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400E',
  },
  adminQuickSub: {
    fontSize: 11,
    color: '#B45309',
    marginTop: 2,
  },
  adminAiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    gap: 10,
  },
  adminAiIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  adminAiBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E3A8A',
  },
  aiLiveBadge: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  aiLiveBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  adminAiBannerSub: {
    fontSize: 10.5,
    color: '#475569',
    marginTop: 2,
    lineHeight: 14,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
    alignItems: 'center',
  },
  metricNumber: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 4,
  },
  metricLabel: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 1,
    textAlign: 'center',
  },
  adminActionShortcuts: {
    flexDirection: 'row',
    gap: 8,
  },
  adminActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 6,
    gap: 4,
  },
  adminActionBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  directorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEF3C7',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
  },
  directorBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  directorBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400E',
  },
  directorBannerSub: {
    fontSize: 11,
    color: '#B45309',
    marginTop: 1,
  },
  liveCard: {
    backgroundColor: '#0F172A',
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
    gap: 8,
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
  drmBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  drmBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#34D399',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 14,
  },
  joinLiveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  homeQuizCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  homeQuizLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  homeQuizIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeQuizTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  quizPtsBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  quizPtsBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#15803D',
  },
  homeQuizSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  section: {
    marginBottom: 22,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
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
    marginTop: 10,
  },
  resumeThumb: {
    width: 44,
    height: 44,
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
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
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
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    overflow: 'hidden',
  },
  courseImageBox: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#0F172A',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  courseThumbnail: {
    width: '100%',
    height: '100%',
  },
  courseTagBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#0F172A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  courseTagBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#38BDF8',
  },
  courseCardContent: {
    padding: 14,
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
  emptyCoursesBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    marginTop: 4,
  },
  emptyCoursesTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
    marginTop: 10,
  },
  emptyCoursesSub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
    marginBottom: 16,
  },
  browseCoursesBtn: {
    backgroundColor: '#0F2B48',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  browseCoursesBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
