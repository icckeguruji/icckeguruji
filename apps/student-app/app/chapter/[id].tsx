import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  Platform,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useAuthStore } from '../../src/store/useAuthStore';
import {
  academicService,
  AcademicChapter,
  RecordedLecture,
} from '../../src/services/academicService';
import { LiveClass, StudyMaterial } from '@icc/shared-types';
import { supabase, isSupabaseConfigured } from '../../src/lib/supabase';
import * as DocumentPicker from 'expo-document-picker';
import { useAppTheme } from '../../src/hooks/useAppTheme';
import {
  ArrowLeft,
  Radio,
  Video,
  FileText,
  Play,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Sparkles,
  Lock,
  ExternalLink,
  Layers,
  X,
  CheckCircle2,
} from 'lucide-react-native';

export default function ChapterContentScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const isDark = theme.isDark;
  const { id, courseId, subjectId } = useLocalSearchParams<{
    id: string;
    courseId?: string;
    subjectId?: string;
  }>();
  const { user } = useAuthStore();

  const isAdmin =
    user?.role === 'admin' ||
    user?.role === 'super_admin' ||
    user?.email === 'icckeguruji@gmail.com' ||
    user?.mobile_number === '9771350910' ||
    user?.username === 'badesir';

  const [chapter, setChapter] = useState<AcademicChapter | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'live' | 'videos' | 'notes'>('all');
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [recordedLectures, setRecordedLectures] = useState<RecordedLecture[]>([]);
  const [studyMaterials, setStudyMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(true);
  const [isPendingApproval, setIsPendingApproval] = useState(false);

  // Admin Modals
  const [modalType, setModalType] = useState<'none' | 'schedule_live' | 'add_video' | 'upload_notes'>('none');
  const [formTitle, setFormTitle] = useState('');
  const [formTitleHi, setFormTitleHi] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formVideoId, setFormVideoId] = useState('');
  const [formDuration, setFormDuration] = useState('45');
  const [formPdfUri, setFormPdfUri] = useState<string | null>(null);
  const [formPdfName, setFormPdfName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadContent = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      await academicService.ensureLoaded();
      // Locate chapter
      let foundChap = academicService.chapters.find((c) => c.id === id);
      if (!foundChap) {
        const allChaps = await academicService.getChapters(subjectId || '');
        foundChap = allChaps.find((c) => c.id === id);
      }
      setChapter(foundChap || null);

      const resolvedCourseId = courseId || foundChap?.course_id || '';
      if (!isAdmin && resolvedCourseId) {
        const courseObj = await academicService.getCourseById(resolvedCourseId);
        if (courseObj?.is_free) {
          setIsEnrolled(true);
          setIsPendingApproval(false);
        } else if (!user?.id) {
          setIsEnrolled(false);
          setIsPendingApproval(false);
        } else {
          const pays = await academicService.getPayments();
          let approved = pays.some(
            (p: any) =>
              p.course_id === resolvedCourseId &&
              (p.student_id === user.id || p.user_id === user.id) &&
              p.status === 'approved'
          );
          let pending = pays.some(
            (p: any) =>
              (p.student_id === user.id || p.user_id === user.id) &&
              p.status === 'pending'
          );
          if (!approved && isSupabaseConfigured) {
            try {
              const { data: enr } = await supabase
                .from('enrollments')
                .select('status')
                .eq('student_id', user.id)
                .eq('course_id', resolvedCourseId);
              if (Array.isArray(enr)) {
                if (enr.some((e: any) => e.status === 'active')) approved = true;
                if (enr.some((e: any) => e.status === 'pending')) pending = true;
              }
            } catch {}
          }
          setIsEnrolled(approved);
          setIsPendingApproval(!approved && pending);
        }
      } else {
        setIsEnrolled(true);
      }

      // Load content items (include both chapter-linked & course-wide live classes)
      const [lives, vids, mats] = await Promise.all([
        academicService.getLiveClasses(id, resolvedCourseId || undefined),
        academicService.getRecordedLectures(id),
        academicService.getStudyMaterials(id),
      ]);
      // Also include completed live class recordings in the chapter Videos list if not already present
      const completedRecordings: RecordedLecture[] = lives
        .filter((lc) => lc.status === 'completed' && lc.youtube_video_id && !vids.some((v) => v.youtube_video_id === lc.youtube_video_id))
        .map((lc, idx) => ({
          id: lc.id,
          course_id: lc.course_id || resolvedCourseId,
          subject_id: (lc as any).subject_id || subjectId || foundChap?.subject_id || '',
          chapter_id: id,
          title: lc.title,
          title_hi: lc.title_hi || lc.title,
          description: lc.description || 'Recorded Live Class',
          youtube_video_id: lc.youtube_video_id,
          duration_seconds: (lc.duration_minutes || 45) * 60,
          is_free_preview: false,
          lecture_order: vids.length + idx + 1,
        }));
      setLiveClasses(lives);
      setRecordedLectures([...vids, ...completedRecordings]);
      setStudyMaterials(mats);
    } catch (err) {
      console.warn('Error loading chapter content:', err);
    } finally {
      setLoading(false);
    }
  }, [id, subjectId, courseId]);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  useFocusEffect(
    useCallback(() => {
      loadContent();
    }, [loadContent])
  );

  // Clean form
  const resetForm = () => {
    setFormTitle('');
    setFormTitleHi('');
    setFormDesc('');
    setFormVideoId('');
    setFormDuration('45');
    setFormPdfUri(null);
    setFormPdfName(null);
  };

  // Helper to extract YouTube ID
  const cleanYouTubeId = (input: string) => {
    let clean = input.trim();
    if (clean.includes('v=')) {
      clean = clean.split('v=')[1]?.split('&')[0] || clean;
    } else if (clean.includes('youtu.be/')) {
      clean = clean.split('youtu.be/')[1]?.split('?')[0] || clean;
    } else if (clean.includes('live/')) {
      clean = clean.split('live/')[1]?.split('?')[0] || clean;
    }
    return clean;
  };

  // Admin Actions
  const handleScheduleLive = async () => {
    if (!formTitle.trim()) {
      Alert.alert('Required', 'Please enter a live class title.');
      return;
    }
    setSubmitting(true);
    try {
      const vidId = cleanYouTubeId(formVideoId) || 'jfKfPfyJRdk';
      const resolvedCourseId = courseId || chapter?.course_id || '';
      const courseObj = resolvedCourseId ? await academicService.getCourseById(resolvedCourseId) : null;
      await academicService.scheduleLiveClass({
        course_id: resolvedCourseId || undefined,
        chapter_id: id,
        subject_id: subjectId || chapter?.subject_id,
        class_name: courseObj?.class_name || chapter?.class_name || 'Class 10',
        title: formTitle.trim(),
        title_hi: formTitleHi.trim() || formTitle.trim(),
        description: formDesc.trim(),
        youtube_video_id: vidId,
        scheduled_at: new Date().toISOString(),
        duration_minutes: parseInt(formDuration, 10) || 60,
        status: 'live',
      });
      setModalType('none');
      resetForm();
      loadContent();
      Alert.alert('Success', 'Live session scheduled and published to students.');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to schedule live class.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddVideo = async () => {
    if (!formTitle.trim() || !formVideoId.trim()) {
      Alert.alert('Required', 'Please enter lecture title and YouTube link/ID.');
      return;
    }
    setSubmitting(true);
    try {
      const vidId = cleanYouTubeId(formVideoId);
      await academicService.addRecordedLecture({
        course_id: courseId || chapter?.course_id,
        subject_id: subjectId || chapter?.subject_id,
        chapter_id: id,
        title: formTitle.trim(),
        title_hi: formTitleHi.trim() || formTitle.trim(),
        description: formDesc.trim(),
        youtube_video_id: vidId,
        duration_seconds: (parseInt(formDuration, 10) || 45) * 60,
        is_free_preview: false,
      });
      setModalType('none');
      resetForm();
      loadContent();
      Alert.alert('Success', 'Recorded video lecture added to chapter.');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to add video lecture.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePickPdf = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      if (!res.canceled && res.assets && res.assets.length > 0) {
        const file = res.assets[0];
        setFormPdfUri(file.uri);
        setFormPdfName(file.name);
        if (!formTitle) setFormTitle(file.name.replace(/\.pdf$/i, ''));
      }
    } catch {
      Alert.alert('File Picker', 'Unable to access device document storage.');
    }
  };

  const handleUploadNotes = async () => {
    if (!formTitle.trim()) {
      Alert.alert('Required', 'Please enter study material title.');
      return;
    }
    setSubmitting(true);
    try {
      await academicService.addStudyMaterial({
        subject_id: subjectId || chapter?.subject_id,
        chapter_id: id,
        title: formTitle.trim(),
        title_hi: formTitleHi.trim() || formTitle.trim(),
        description: formDesc.trim(),
        file_path: formPdfUri || 'notes/sample.pdf',
        file_size_bytes: 2500000,
        material_type: 'chapter_notes',
        is_free: true,
      });
      setModalType('none');
      resetForm();
      loadContent();
      Alert.alert('Success', 'PDF study material attached to chapter.');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to upload study material.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLive = (liveId: string) => {
    Alert.alert('Delete Live Class', 'Are you sure you want to remove this live class?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await academicService.deleteLiveClass(liveId);
          loadContent();
        },
      },
    ]);
  };

  const handleDeleteLecture = (lectureId: string) => {
    Alert.alert('Delete Video Lecture', 'Are you sure you want to delete this video lecture?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await academicService.deleteRecordedLecture(lectureId);
          loadContent();
        },
      },
    ]);
  };

  const handleDeleteMaterial = (materialId: string) => {
    Alert.alert('Delete Study Material', 'Are you sure you want to delete this PDF file?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await academicService.deleteStudyMaterial(materialId);
          loadContent();
        },
      },
    ]);
  };

  const activeLiveClass = liveClasses.find((l) => l.status === 'live');
  const upcomingLiveClass = liveClasses.find((l) => l.status === 'scheduled');

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
        <View style={[styles.header, { backgroundColor: theme.headerBg, borderBottomColor: theme.headerBorder }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backButton, { backgroundColor: isDark ? '#18181B' : '#F1F5F9' }]}
          >
            <ArrowLeft size={20} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Loading Chapter...</Text>
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      </SafeAreaView>
    );
  }

  if (!isEnrolled && !isAdmin) {
    const resolvedCourseId = courseId || chapter?.course_id || '';
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['top', 'left', 'right']}>
        <View style={[styles.header, { backgroundColor: theme.headerBg, borderBottomColor: theme.headerBorder }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backButton, { backgroundColor: isDark ? '#18181B' : '#F1F5F9' }]}
          >
            <ArrowLeft size={20} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]} numberOfLines={1}>
            {chapter?.title || 'Course Locked'}
          </Text>
        </View>
        <View style={[styles.centered, { padding: 24 }]}>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Lock size={30} color="#DC2626" />
          </View>
          <Text style={{ fontSize: 18, fontWeight: '800', color: theme.text, textAlign: 'center', marginBottom: 8 }}>
            {isPendingApproval ? '⏳ Approval Pending' : '🔒 Course Locked'}
          </Text>
          <Text style={{ fontSize: 13, color: theme.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 20 }}>
            {isPendingApproval
              ? 'Your payment UTR is under verification by Director BADE SIR. This chapter will unlock automatically once approved.'
              : 'Please enroll in this course first to unlock video lectures, live classes, and PDF notes.'}
          </Text>
          {!isPendingApproval && resolvedCourseId ? (
            <TouchableOpacity
              style={{ backgroundColor: '#2563EB', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12 }}
              onPress={() => router.push(`/payment/${resolvedCourseId}` as any)}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 14 }}>Enroll Now</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['top', 'left', 'right']}>
      {/* Top Header */}
      <View style={[styles.header, { backgroundColor: theme.headerBg, borderBottomColor: theme.headerBorder }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: isDark ? '#18181B' : '#F1F5F9' }]}
        >
          <ArrowLeft size={20} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.headerTextCol}>
          <Text style={[styles.headerSub, { color: theme.textSecondary }]}>Chapter Content</Text>
          <Text style={[styles.headerTitle, { color: theme.text }]} numberOfLines={1}>
            {chapter?.title || 'Chapter Details'}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              try {
                await academicService.syncFromCloud();
                await loadContent();
              } finally {
                setRefreshing(false);
              }
            }}
            colors={['#2563EB']}
            tintColor={isDark ? '#FFFFFF' : '#2563EB'}
          />
        }
      >
        {/* Chapter Summary Card */}
        <View style={[styles.chapterCard, { backgroundColor: theme.surfaceCard, borderColor: theme.cardBorder }]}>
          <View style={[styles.chapterNumberBadge, { backgroundColor: isDark ? '#1E293B' : '#EFF6FF', borderColor: isDark ? '#3B82F6' : '#BFDBFE' }]}>
            <Text style={styles.chapterNumberText}>
              Ch {chapter?.chapter_number || 1}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.chapterCardTitle, { color: theme.text }]}>{chapter?.title}</Text>
            {chapter?.description ? (
              <Text style={[styles.chapterCardDesc, { color: theme.textSecondary }]}>{chapter.description}</Text>
            ) : null}
          </View>
        </View>

        {/* SECTION A: LIVE CLASS (Strict Rules: Show ONLY if active or scheduled, NO fake live) */}
        {activeLiveClass ? (
          <View style={styles.liveBannerActive}>
            <View style={styles.liveBadgeRow}>
              <View style={styles.redPulseDot} />
              <Text style={styles.liveBadgeText}>LIVE NOW</Text>
            </View>
            <Text style={styles.liveBannerTitle}>{activeLiveClass.title}</Text>
            <Text style={styles.liveBannerSubtitle}>
              Interactive broadcast running with Director BADE SIR
            </Text>
            <TouchableOpacity
              style={styles.joinLiveBtn}
              onPress={() => router.push(`/lecture/${activeLiveClass.id}` as any)}
            >
              <Radio size={16} color="#FFFFFF" />
              <Text style={styles.joinLiveBtnText}>Join Live Masterclass</Text>
            </TouchableOpacity>
            {isAdmin && (
              <TouchableOpacity
                style={styles.adminEndLiveBtn}
                onPress={() => academicService.updateLiveClassStatus(activeLiveClass.id, 'completed')}
              >
                <Text style={styles.adminEndLiveText}>Mark as Completed (Auto-Archive)</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : upcomingLiveClass ? (
          <View style={styles.liveBannerScheduled}>
            <View style={styles.scheduledBadgeRow}>
              <Calendar size={14} color="#2563EB" />
              <Text style={styles.scheduledBadgeText}>UPCOMING LIVE CLASS</Text>
            </View>
            <Text style={styles.scheduledBannerTitle}>{upcomingLiveClass.title}</Text>
            <Text style={styles.scheduledTimeText}>
              Scheduled for: {new Date(upcomingLiveClass.scheduled_at).toLocaleString()}
            </Text>
            {isAdmin && (
              <TouchableOpacity
                style={styles.adminStartLiveBtn}
                onPress={() => academicService.updateLiveClassStatus(upcomingLiveClass.id, 'live')}
              >
                <Text style={styles.adminStartLiveText}>Start Broadcasting Now</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : null}

        {/* Content Navigation Tabs */}
        <View style={[styles.tabsRow, { backgroundColor: isDark ? '#141416' : '#F1F5F9' }]}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'all' && [styles.tabBtnActive, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]]}
            onPress={() => setActiveTab('all')}
          >
            <Layers size={14} color={activeTab === 'all' ? '#2563EB' : theme.textSecondary} />
            <Text style={[styles.tabBtnText, { color: activeTab === 'all' ? '#2563EB' : theme.textSecondary }, activeTab === 'all' && styles.tabBtnTextActive]}>
              All ({recordedLectures.length + studyMaterials.length + (liveClasses.length > 0 ? 1 : 0)})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'videos' && [styles.tabBtnActive, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]]}
            onPress={() => setActiveTab('videos')}
          >
            <Video size={14} color={activeTab === 'videos' ? '#2563EB' : theme.textSecondary} />
            <Text style={[styles.tabBtnText, { color: activeTab === 'videos' ? '#2563EB' : theme.textSecondary }, activeTab === 'videos' && styles.tabBtnTextActive]}>
              Videos ({recordedLectures.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'notes' && [styles.tabBtnActive, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]]}
            onPress={() => setActiveTab('notes')}
          >
            <FileText size={14} color={activeTab === 'notes' ? '#2563EB' : theme.textSecondary} />
            <Text style={[styles.tabBtnText, { color: activeTab === 'notes' ? '#2563EB' : theme.textSecondary }, activeTab === 'notes' && styles.tabBtnTextActive]}>
              Notes ({studyMaterials.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Admin Action Bar */}
        {isAdmin && (
          <View style={[styles.adminActionBar, { backgroundColor: isDark ? '#18181B' : '#EFF6FF', borderColor: isDark ? '#27272A' : '#BFDBFE' }]}>
            <Text style={styles.adminActionHeading}>ADMINISTRATOR MANAGEMENT</Text>
            <View style={styles.adminActionButtonsRow}>
              <TouchableOpacity
                style={styles.adminActionBtn}
                onPress={() => {
                  resetForm();
                  setModalType('schedule_live');
                }}
              >
                <Radio size={14} color="#DC2626" />
                <Text style={styles.adminActionBtnText}>+ Live Class</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.adminActionBtn}
                onPress={() => {
                  resetForm();
                  setModalType('add_video');
                }}
              >
                <Video size={14} color="#2563EB" />
                <Text style={styles.adminActionBtnText}>+ YouTube Video</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.adminActionBtn}
                onPress={() => {
                  resetForm();
                  setModalType('upload_notes');
                }}
              >
                <FileText size={14} color="#059669" />
                <Text style={styles.adminActionBtnText}>+ Upload PDF</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* SECTION B: RECORDED VIDEOS */}
        {(activeTab === 'all' || activeTab === 'videos') && (
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeaderRow}>
              <View style={[styles.sectionIconBox, { backgroundColor: isDark ? '#1E293B' : '#EFF6FF' }]}>
                <Video size={16} color="#2563EB" />
              </View>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Recorded Video Lectures</Text>
              <View style={[styles.sectionCountBadge, { backgroundColor: isDark ? '#18181B' : '#F1F5F9' }]}>
                <Text style={[styles.sectionCountText, { color: theme.textSecondary }]}>{recordedLectures.length}</Text>
              </View>
            </View>

            {recordedLectures.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: theme.surfaceCard, borderColor: theme.cardBorder }]}>
                <Text style={[styles.emptyTitle, { color: theme.text }]}>No Recorded Lectures</Text>
                <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                  Recorded lectures will appear here once live sessions end or are published by admin.
                </Text>
              </View>
            ) : (
              recordedLectures.map((lec, index) => (
                <View key={lec.id} style={[styles.lectureCard, { backgroundColor: theme.surfaceCard, borderColor: theme.cardBorder }]}>
                  <TouchableOpacity
                    style={styles.lectureMainTouch}
                    onPress={() => router.push(`/lecture/${lec.id}` as any)}
                  >
                    {lec.youtube_video_id ? (
                      <Image
                        source={{ uri: `https://img.youtube.com/vi/${lec.youtube_video_id}/hqdefault.jpg` }}
                        style={styles.lectureThumb}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={[styles.lectureOrderBadge, { backgroundColor: isDark ? '#18181B' : '#F1F5F9' }]}>
                        <Text style={[styles.lectureOrderText, { color: theme.textSecondary }]}>{index + 1}</Text>
                      </View>
                    )}
                    <View style={styles.lectureInfo}>
                      <Text style={[styles.lectureTitle, { color: theme.text }]} numberOfLines={2}>
                        {lec.title}
                      </Text>
                      <View style={styles.lectureMetaRow}>
                        <Clock size={12} color={theme.textMuted} />
                        <Text style={[styles.lectureMetaText, { color: theme.textSecondary }]}>
                          {Math.round(lec.duration_seconds / 60) || 45} mins • HD Video
                        </Text>
                      </View>
                    </View>
                    <View style={styles.playIconCircle}>
                      <Play size={16} color="#2563EB" fill="#2563EB" />
                    </View>
                  </TouchableOpacity>
                  {isAdmin && (
                    <TouchableOpacity
                      style={styles.adminDeleteBtn}
                      onPress={() => handleDeleteLecture(lec.id)}
                    >
                      <Trash2 size={15} color="#DC2626" />
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}
          </View>
        )}

        {/* SECTION C: STUDY MATERIALS / PDF NOTES */}
        {(activeTab === 'all' || activeTab === 'notes') && (
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeaderRow}>
              <View style={[styles.sectionIconBox, { backgroundColor: isDark ? '#064E3B' : '#F0FDF4' }]}>
                <FileText size={16} color="#059669" />
              </View>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Handwritten PDF Notes & Worksheets</Text>
              <View style={[styles.sectionCountBadge, { backgroundColor: isDark ? '#18181B' : '#F1F5F9' }]}>
                <Text style={[styles.sectionCountText, { color: theme.textSecondary }]}>{studyMaterials.length}</Text>
              </View>
            </View>

            {studyMaterials.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: theme.surfaceCard, borderColor: theme.cardBorder }]}>
                <Text style={[styles.emptyTitle, { color: theme.text }]}>No Notes Uploaded</Text>
                <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                  Director BADE SIR handwritten formula sheets and chapter notes will be accessible here.
                </Text>
              </View>
            ) : (
              studyMaterials.map((mat) => (
                <View key={mat.id} style={[styles.materialCard, { backgroundColor: theme.surfaceCard, borderColor: theme.cardBorder }]}>
                  <TouchableOpacity
                    style={styles.materialMainTouch}
                    onPress={() => router.push(`/pdf-viewer/${mat.id}` as any)}
                  >
                    <View style={[styles.pdfIconBox, { backgroundColor: isDark ? '#064E3B' : '#ECFDF5' }]}>
                      <FileText size={20} color="#059669" />
                    </View>
                    <View style={styles.materialInfo}>
                      <Text style={[styles.materialTitle, { color: theme.text }]} numberOfLines={2}>
                        {mat.title}
                      </Text>
                      <View style={styles.materialMetaRow}>
                        <View style={styles.freeBadge}>
                          <Text style={styles.freeBadgeText}>PDF Document</Text>
                        </View>
                        <Text style={styles.fileSizeText}>
                          {(mat.file_size_bytes / (1024 * 1024)).toFixed(1)} MB
                        </Text>
                      </View>
                    </View>
                    <View style={styles.viewPdfBtn}>
                      <Text style={styles.viewPdfText}>Open</Text>
                    </View>
                  </TouchableOpacity>
                  {isAdmin && (
                    <TouchableOpacity
                      style={styles.adminDeleteBtn}
                      onPress={() => handleDeleteMaterial(mat.id)}
                    >
                      <Trash2 size={15} color="#DC2626" />
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* ADMIN MODAL: SCHEDULE LIVE CLASS */}
      <Modal
        visible={modalType === 'schedule_live'}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalType('none')}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: isDark ? '#121212' : '#FFFFFF', borderColor: isDark ? '#27272A' : '#E2E8F0', borderWidth: isDark ? 1 : 0 }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalHeading, { color: theme.text }]}>Schedule Live Class</Text>
              <TouchableOpacity onPress={() => setModalType('none')}>
                <X size={20} color={theme.textMuted} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Class Title *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
                value={formTitle}
                onChangeText={setFormTitle}
                placeholder="e.g. Masterclass on Chemical Reactions"
                placeholderTextColor={theme.textMuted}
              />
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>YouTube Live URL or Video ID *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
                value={formVideoId}
                onChangeText={setFormVideoId}
                placeholder="e.g. jfKfPfyJRdk or https://youtube.com/live/..."
                placeholderTextColor={theme.textMuted}
                autoCapitalize="none"
              />
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Duration (Minutes)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
                value={formDuration}
                onChangeText={setFormDuration}
                placeholder="60"
                keyboardType="numeric"
                placeholderTextColor={theme.textMuted}
              />
              <TouchableOpacity
                style={[styles.submitBtn, submitting && styles.btnDisabled]}
                onPress={handleScheduleLive}
                disabled={submitting}
              >
                <Text style={styles.submitBtnText}>
                  {submitting ? 'Publishing...' : 'Schedule & Broadcast Live'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ADMIN MODAL: ADD RECORDED VIDEO */}
      <Modal
        visible={modalType === 'add_video'}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalType('none')}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: isDark ? '#121212' : '#FFFFFF', borderColor: isDark ? '#27272A' : '#E2E8F0', borderWidth: isDark ? 1 : 0 }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalHeading, { color: theme.text }]}>Add Recorded Video Lecture</Text>
              <TouchableOpacity onPress={() => setModalType('none')}>
                <X size={20} color={theme.textMuted} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Lecture Title *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
                value={formTitle}
                onChangeText={setFormTitle}
                placeholder="e.g. Lecture 1: Concept Explanation"
                placeholderTextColor={theme.textMuted}
              />
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>YouTube Link or Video ID *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
                value={formVideoId}
                onChangeText={setFormVideoId}
                placeholder="e.g. https://youtu.be/..."
                placeholderTextColor={theme.textMuted}
                autoCapitalize="none"
              />
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Duration (Minutes)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
                value={formDuration}
                onChangeText={setFormDuration}
                placeholder="45"
                keyboardType="numeric"
                placeholderTextColor={theme.textMuted}
              />
              <TouchableOpacity
                style={[styles.submitBtn, submitting && styles.btnDisabled]}
                onPress={handleAddVideo}
                disabled={submitting}
              >
                <Text style={styles.submitBtnText}>
                  {submitting ? 'Saving...' : 'Add Video Lecture'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ADMIN MODAL: UPLOAD PDF NOTES */}
      <Modal
        visible={modalType === 'upload_notes'}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalType('none')}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: isDark ? '#121212' : '#FFFFFF', borderColor: isDark ? '#27272A' : '#E2E8F0', borderWidth: isDark ? 1 : 0 }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalHeading, { color: theme.text }]}>Upload PDF Study Material</Text>
              <TouchableOpacity onPress={() => setModalType('none')}>
                <X size={20} color={theme.textMuted} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Document Title *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
                value={formTitle}
                onChangeText={setFormTitle}
                placeholder="e.g. Complete Handwritten Chapter Notes"
                placeholderTextColor={theme.textMuted}
              />
              <TouchableOpacity
                style={[styles.pickFileBtn, { backgroundColor: isDark ? '#18181B' : '#EFF6FF', borderColor: isDark ? '#3B82F6' : '#DBEAFE' }]}
                onPress={handlePickPdf}
              >
                <FileText size={18} color="#2563EB" />
                <Text style={styles.pickFileText}>
                  {formPdfName ? `Selected: ${formPdfName}` : 'Choose PDF Document from Storage'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitBtn, submitting && styles.btnDisabled]}
                onPress={handleUploadNotes}
                disabled={submitting}
              >
                <Text style={styles.submitBtnText}>
                  {submitting ? 'Uploading...' : 'Save & Attach PDF'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    marginRight: 12,
  },
  headerTextCol: {
    flex: 1,
  },
  headerSub: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  chapterCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    gap: 14,
  },
  chapterNumberBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  chapterNumberText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2563EB',
  },
  chapterCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  chapterCardSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  chapterCardDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 16,
  },
  liveBannerActive: {
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#F87171',
  },
  liveBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  redPulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DC2626',
  },
  liveBadgeText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#DC2626',
    letterSpacing: 0.5,
  },
  liveBannerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#991B1B',
    marginBottom: 4,
  },
  liveBannerSubtitle: {
    fontSize: 12,
    color: '#7F1D1D',
    marginBottom: 12,
  },
  joinLiveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    borderRadius: 12,
  },
  joinLiveBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  adminEndLiveBtn: {
    marginTop: 8,
    alignItems: 'center',
    paddingVertical: 6,
  },
  adminEndLiveText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#991B1B',
    textDecorationLine: 'underline',
  },
  liveBannerScheduled: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  scheduledBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  scheduledBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2563EB',
  },
  scheduledBannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E3A8A',
  },
  scheduledTimeText: {
    fontSize: 12,
    color: '#3B82F6',
    marginTop: 4,
  },
  adminStartLiveBtn: {
    marginTop: 10,
    backgroundColor: '#2563EB',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  adminStartLiveText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    padding: 3,
    marginBottom: 16,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 9,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  tabBtnTextActive: {
    color: '#2563EB',
  },
  adminActionBar: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  adminActionHeading: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  adminActionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  adminActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  adminActionBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
  sectionBlock: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  sectionCountBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  sectionCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
  },
  lectureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  lectureMainTouch: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  lectureOrderBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lectureThumb: {
    width: 72,
    height: 46,
    borderRadius: 8,
    backgroundColor: '#0F172A',
  },
  lectureOrderText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2563EB',
  },
  lectureInfo: {
    flex: 1,
  },
  lectureTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  lectureSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  lectureMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  lectureMetaText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  playIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  materialCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  materialMainTouch: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pdfIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  materialInfo: {
    flex: 1,
  },
  materialTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  materialMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  freeBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  freeBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#2563EB',
  },
  fileSizeText: {
    fontSize: 10,
    color: '#64748B',
  },
  viewPdfBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#059669',
    borderRadius: 8,
  },
  viewPdfText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  adminDeleteBtn: {
    padding: 8,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
    marginBottom: 14,
    backgroundColor: '#F8FAFC',
  },
  pickFileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#93C5FD',
    backgroundColor: '#EFF6FF',
    marginBottom: 16,
    justifyContent: 'center',
  },
  pickFileText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  submitBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  btnDisabled: {
    opacity: 0.6,
  },
});
