import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/useAuthStore';
import { formatINR } from '@icc/shared-utils';
import { CoachingHeader } from '../../src/components/CoachingHeader';
import { DataService } from '../../src/services/dataService';
import { academicService, getResolvedThumbnailUrl, allInitialCourses } from '../../src/services/academicService';
import { supabase, isSupabaseConfigured } from '../../src/lib/supabase';
import { aiService } from '../../src/services/aiService';
import { DateTimePickerModal } from '../../src/components/DateTimePickerModal';
import { Course } from '@icc/shared-types';
import { useAppTheme } from '../../src/hooks/useAppTheme';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import {
  Plus,
  Edit3,
  Trash2,
  ShieldCheck,
  Camera,
  ImageIcon,
  X,
  BookOpen,
  Calendar,
  Sparkles,
  CheckCircle2,
  Clock,
  Layers,
  Tag,
} from 'lucide-react-native';

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

const CLASSES_LIST = [
  'Class 10',
  'Class 9',
  'Class 8',
  'Class 7',
  'Class 6',
  'Class 5',
  'Class 4',
  'Class 3',
  'Class 2',
  'Class 1',
  'Class 11',
  'Class 12',
];

export default function StudentCoursesScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const theme = useAppTheme();
  const isDark = theme.isDark;

  const isAdmin =
    user?.role === 'admin' ||
    user?.role === 'super_admin' ||
    user?.email === 'icckeguruji@gmail.com' ||
    user?.mobile_number === '9771350910' ||
    user?.username === 'badesir';

  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(new Set());
  const [pendingCourseIds, setPendingCourseIds] = useState<Set<string>>(new Set());
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeClassFilter, setActiveClassFilter] = useState('ALL');

  // Course Modal state for Admin
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);

  const [courseForm, setCourseForm] = useState({
    title: '',
    title_hi: '',
    tagline: '',
    class_name: 'Class 10',
    start_date: new Date().toISOString().split('T')[0],
    price: '999',
    discount_price: '499',
    validity_days: '365',
    description: '',
    thumbnail_url:
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
  });

  const loadLocalCourses = useCallback(async () => {
    try {
      const [data, pays] = await Promise.all([
        academicService.getCourses(),
        user?.id ? academicService.getPayments() : Promise.resolve([]),
      ]);
      if (Array.isArray(data)) {
        setCourses(data);
      }
      if (user?.id) {
        const approvedSet = new Set<string>();
        const pendingSet = new Set<string>();
        (pays || []).forEach((p: any) => {
          if (p.student_id === user.id || p.user_id === user.id) {
            if (p.status === 'approved' && p.course_id) approvedSet.add(p.course_id);
            if (p.status === 'pending' && p.course_id) pendingSet.add(p.course_id);
          }
        });
        if (isSupabaseConfigured) {
          try {
            const { data: enr } = await supabase
              .from('enrollments')
              .select('course_id, status')
              .eq('student_id', user.id);
            (enr || []).forEach((e: any) => {
              if (e.status === 'active' && e.course_id) approvedSet.add(e.course_id);
              if (e.status === 'pending' && e.course_id) pendingSet.add(e.course_id);
            });
          } catch {}
        }
        setEnrolledCourseIds(approvedSet);
        setPendingCourseIds(pendingSet);
      } else {
        setEnrolledCourseIds(new Set());
        setPendingCourseIds(new Set());
      }
    } catch {
      // Keep current
    }
  }, [user?.id]);

  const handleRefreshCourses = useCallback(async () => {
    setIsSyncing(true);
    try {
      await academicService.syncFromCloud();
      await loadLocalCourses();
    } catch {
      // Keep current
    } finally {
      setIsSyncing(false);
    }
  }, [loadLocalCourses]);

  useEffect(() => {
    loadLocalCourses();
    academicService.syncFromCloud().catch(() => {});
    const unsub = academicService.subscribe(() => {
      loadLocalCourses();
    });
    return () => {
      unsub();
    };
  }, [loadLocalCourses]);

  const filteredCourses = courses.filter((c) => {
    if (activeClassFilter === 'ALL') return true;
    const derivedClass = academicService.getClassNameFromCourse(c);
    if (derivedClass.toLowerCase() === activeClassFilter.toLowerCase()) return true;
    const pattern = new RegExp(`\\b${activeClassFilter}\\b`, 'i');
    return pattern.test(c.title) || (c.tagline ? pattern.test(c.tagline) : false);
  });

  // Open modal for Create or Edit
  const openCourseModal = (course?: Course) => {
    if (course) {
      setEditingCourseId(course.id);
      const courseClass =
        (course as any).class_name ||
        academicService.getClassNameFromCourse(course) ||
        'Class 10';
      setCourseForm({
        title: course.title,
        title_hi: course.title_hi || course.title,
        tagline: course.tagline || 'Complete Board Examination Syllabus Mastery',
        class_name: courseClass,
        start_date: course.start_date || new Date().toISOString().split('T')[0],
        price: course.price.toString(),
        discount_price: (course.discount_price || course.price).toString(),
        validity_days: course.validity_days.toString(),
        description: course.description || '',
        thumbnail_url: course.thumbnail_url || '',
      });
    } else {
      setEditingCourseId(null);
      setCourseForm({
        title: '',
        title_hi: '',
        tagline: '',
        class_name: 'Class 10',
        start_date: new Date().toISOString().split('T')[0],
        price: '999',
        discount_price: '499',
        validity_days: '365',
        description: '',
        thumbnail_url:
          'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
      });
    }
    setIsCourseModalOpen(true);
  };

  // AI Auto-Fill Function
  const handleAiAutoFill = async () => {
    setAiGenerating(true);
    try {
      const generated = await aiService.autoFillCourse(courseForm.title, courseForm.class_name);
      setCourseForm((prev) => ({
        ...prev,
        title: prev.title.trim() || generated.title,
        title_hi: prev.title_hi.trim() || generated.title_hi,
        tagline: prev.tagline.trim() || generated.tagline,
        description: prev.description.trim() || generated.description,
        price: prev.price || generated.price,
        discount_price: prev.discount_price || generated.discount_price,
        validity_days: prev.validity_days || generated.validity_days,
        start_date: prev.start_date || generated.start_date,
        thumbnail_url: prev.thumbnail_url || generated.thumbnail_url,
      }));
      Alert.alert('✨ AI Auto-Fill Complete', 'Course details, tagline, pricing & curriculum features generated successfully!');
    } catch {
      Alert.alert('Notice', 'AI generated course defaults applied.');
    } finally {
      setAiGenerating(false);
    }
  };

  // Handle Save Course (Create / Update)
  const handleSaveCourse = async () => {
    // If user left title empty, auto-generate it with AI
    let titleToUse = courseForm.title.trim();
    let tagline = courseForm.tagline.trim();
    let desc = courseForm.description.trim();

    if (!titleToUse) {
      titleToUse = `${courseForm.class_name} Comprehensive Board Exam Topper Course 2027`;
    }
    if (!tagline) {
      tagline = `Full Syllabus Live Coaching & Handwritten Notes with BADE SIR`;
    }
    if (!desc) {
      desc = `Daily interactive live classes, chapter-wise handwritten PDF notes, 30-second speed quizzes, and 24/7 doubt clearance.`;
    }

    try {
      if (editingCourseId) {
        await academicService.updateCourse(editingCourseId, {
          title: titleToUse,
          title_hi: courseForm.title_hi.trim() || titleToUse,
          tagline: tagline,
          start_date: courseForm.start_date,
          price: parseFloat(courseForm.price) || 999,
          discount_price: parseFloat(courseForm.discount_price) || 499,
          validity_days: parseInt(courseForm.validity_days) || 365,
          description: desc,
          thumbnail_url: courseForm.thumbnail_url,
          class_name: courseForm.class_name,
        } as any);
        Alert.alert('Success', 'Course details saved to cloud database successfully!');
      } else {
        await academicService.addCourse({
          title: titleToUse,
          title_hi: courseForm.title_hi.trim() || titleToUse,
          tagline: tagline,
          start_date: courseForm.start_date,
          price: parseFloat(courseForm.price) || 999,
          discount_price: parseFloat(courseForm.discount_price) || 499,
          validity_days: parseInt(courseForm.validity_days) || 365,
          description: desc,
          thumbnail_url: courseForm.thumbnail_url,
          class_name: courseForm.class_name,
          is_free: false,
          is_published: true,
        } as any);
        Alert.alert('Course Published! 🎓', 'New course has been saved to cloud database and is live!');
      }

      setIsCourseModalOpen(false);
      loadLocalCourses();
    } catch (err: any) {
      Alert.alert('Database Error', err?.message || 'Failed to save course to database. Please check your connection and try again.');
    }
  };

  // Handle Delete Course
  const handleDeleteCourse = (courseId: string, title: string) => {
    Alert.alert(
      'Delete Course?',
      `Are you sure you want to permanently delete "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await academicService.deleteCourse(courseId);
              loadLocalCourses();
              Alert.alert('Success', 'Course deleted from cloud database successfully.');
            } catch (err: any) {
              Alert.alert('Database Error', err?.message || 'Failed to delete course from database.');
            }
          },
        },
      ]
    );
  };

  // Pick thumbnail image from device gallery
  const handlePickThumbnail = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Denied', 'Storage permission required to choose photo.');
        return;
      }
      let pickedUri: string | null = null;
      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [16, 9],
          quality: 0.5,
          base64: true,
        });
        if (!result.canceled && result.assets && result.assets[0]) {
          const asset = result.assets[0];
          if (asset.base64) {
            pickedUri = `data:image/jpeg;base64,${asset.base64}`;
          } else if (asset.uri) {
            pickedUri = asset.uri;
          }
        }
      } catch (pickerErr) {
        console.warn('ImagePicker library failed, falling back to DocumentPicker:', pickerErr);
        const docRes = await DocumentPicker.getDocumentAsync({
          type: ['image/*'],
          copyToCacheDirectory: true,
        });
        if (!docRes.canceled && docRes.assets && docRes.assets[0]?.uri) {
          pickedUri = docRes.assets[0].uri;
        }
      }

      if (pickedUri && pickedUri.startsWith('file://')) {
        try {
          const b64 = await FileSystem.readAsStringAsync(pickedUri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          if (b64) {
            pickedUri = `data:image/jpeg;base64,${b64}`;
          }
        } catch (fsErr) {
          console.warn('Could not encode picked image to base64:', fsErr);
        }
      }

      if (pickedUri) {
        setCourseForm((prev) => ({ ...prev, thumbnail_url: pickedUri! }));
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not pick image');
    }
  };

  // Capture thumbnail with camera
  const handleCaptureThumbnail = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Denied', 'Camera permission required.');
        return;
      }
      let pickedUri: string | null = null;
      try {
        const result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [16, 9],
          quality: 0.5,
          base64: true,
        });
        if (!result.canceled && result.assets && result.assets[0]) {
          const asset = result.assets[0];
          if (asset.base64) {
            pickedUri = `data:image/jpeg;base64,${asset.base64}`;
          } else if (asset.uri) {
            pickedUri = asset.uri;
          }
        }
      } catch (cameraErr) {
        console.warn('Camera capture failed:', cameraErr);
      }

      if (pickedUri && pickedUri.startsWith('file://')) {
        try {
          const b64 = await FileSystem.readAsStringAsync(pickedUri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          if (b64) {
            pickedUri = `data:image/jpeg;base64,${b64}`;
          }
        } catch (fsErr) {
          console.warn('Could not encode captured photo to base64:', fsErr);
        }
      }

      if (pickedUri) {
        setCourseForm((prev) => ({ ...prev, thumbnail_url: pickedUri! }));
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not capture photo');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['top', 'left', 'right']}>
      {/* Branded Coaching Header with Logo, Name & Live Sync */}
      <CoachingHeader onRefresh={handleRefreshCourses} isSyncing={isSyncing} />

      {/* Top Class Filter Bar & Admin Action */}
      <View style={styles.topBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.classFilterScroll}>
          {['ALL', ...CLASSES_LIST].map((cls) => (
            <TouchableOpacity
              key={cls}
              style={[styles.classChip, activeClassFilter === cls && styles.classChipActive]}
              onPress={() => setActiveClassFilter(cls)}
            >
              <Text style={[styles.classChipText, activeClassFilter === cls && styles.classChipTextActive]}>
                {cls}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Admin Inline Action: Add New Course Button */}
        {isAdmin && (
          <View style={styles.adminBar}>
            <View style={styles.adminBadgeRow}>
              <ShieldCheck size={14} color="#B45309" />
              <Text style={styles.adminBadgeText}>Director Mode</Text>
            </View>
            <TouchableOpacity
              style={styles.addCourseBtn}
              onPress={() => openCourseModal()}
              activeOpacity={0.8}
            >
              <Plus size={15} color="#FFFFFF" />
              <Text style={styles.addCourseBtnText}>+ Add Course</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={isSyncing}
            onRefresh={handleRefreshCourses}
            colors={['#2563EB']}
            tintColor="#2563EB"
          />
        }
      >
        <Text style={[styles.pageTitle, { color: theme.text }]}>Target Board Examination Courses</Text>

        <View style={styles.courseList}>
          {filteredCourses.length === 0 ? (
            <View style={[styles.emptyContainer, { backgroundColor: theme.surfaceCard, borderColor: theme.cardBorder }]}>
              <BookOpen size={44} color="#94A3B8" />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                {activeClassFilter === 'ALL'
                  ? 'No Courses Available'
                  : `No Courses in ${activeClassFilter}`}
              </Text>
              <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
                {isAdmin
                  ? 'Tap "+ Add Course" above to create and publish a new course.'
                  : 'New courses will be announced and updated soon.'}
              </Text>
            </View>
          ) : (
            filteredCourses.map((course) => (
              <TouchableOpacity
                key={course.id}
                style={[styles.card, { backgroundColor: theme.surfaceCard, borderColor: theme.cardBorder }]}
                activeOpacity={0.9}
                onPress={() => router.push(`/course/${course.id}`)}
              >
                <View style={styles.imageBox}>
                  <Image
                    source={thumbMap[course.id] || { uri: getResolvedThumbnailUrl(course.thumbnail_url) }}
                    style={styles.thumbnail}
                    resizeMode="contain"
                  />
                  <View style={styles.tagBadge}>
                    <Text style={styles.tagBadgeText}>
                      {course.is_free ? 'FREE ACCESS' : formatINR(course.discount_price || course.price)}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardBody}>
                  <Text style={[styles.cardTitle, { color: theme.text }]}>{course.title}</Text>
                  {course.tagline ? (
                    <Text style={styles.cardTagline} numberOfLines={1}>
                      ✨ {course.tagline}
                    </Text>
                  ) : null}

                  <Text style={[styles.cardDesc, { color: theme.textSecondary }]} numberOfLines={2}>
                    {course.description}
                  </Text>

                  {/* Course Metadata Stats */}
                  <View style={styles.statsRow}>
                    <Text style={styles.stat}>
                      📅 Starts: {course.start_date || 'Enrolling Now'}
                    </Text>
                    <Text style={styles.stat}>⏱️ {course.validity_days} Days</Text>
                    <Text style={styles.stat}>📹 {course.lecture_count || 0} Videos</Text>
                  </View>

                  {/* Normal Student Action Row */}
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.viewCourseBtn}
                      onPress={() => router.push(`/course/${course.id}`)}
                    >
                      <BookOpen size={14} color="#2563EB" />
                      <Text style={styles.viewCourseBtnText} numberOfLines={1}>
                        {isAdmin || course.is_free || enrolledCourseIds.has(course.id) ? 'Open Course' : 'View Subjects'}
                      </Text>
                    </TouchableOpacity>

                    {isAdmin || enrolledCourseIds.has(course.id) ? (
                      <TouchableOpacity
                        style={styles.freeBtn}
                        onPress={() => router.push(`/course/${course.id}`)}
                      >
                        <Text style={styles.freeBtnText}>✅ Enrolled</Text>
                      </TouchableOpacity>
                    ) : course.is_free ? (
                      <TouchableOpacity
                        style={styles.freeBtn}
                        onPress={() => router.push(`/course/${course.id}`)}
                      >
                        <Text style={styles.freeBtnText}>Free Access</Text>
                      </TouchableOpacity>
                    ) : pendingCourseIds.has(course.id) ? (
                      <TouchableOpacity
                        style={[styles.payBtn, { backgroundColor: '#D97706' }]}
                        onPress={() =>
                          Alert.alert(
                            'Approval Pending',
                            'Your enrollment payment is under verification by Director BADE SIR. Access will unlock automatically once approved.'
                          )
                        }
                      >
                        <Text style={styles.payBtnText}>⏳ Pending</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={styles.payBtn}
                        onPress={() => router.push(`/payment/${course.id}`)}
                      >
                        <Text style={styles.payBtnText}>Enroll Now</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Admin Management Buttons (Edit / Delete) */}
                  {isAdmin && (
                    <View style={styles.adminCardActionRow}>
                      <TouchableOpacity
                        style={styles.adminEditBtn}
                        onPress={() => openCourseModal(course)}
                      >
                        <Edit3 size={13} color="#2563EB" />
                        <Text style={styles.adminEditBtnText}>Edit Course</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.adminDeleteBtn}
                        onPress={() => handleDeleteCourse(course.id, course.title)}
                      >
                        <Trash2 size={13} color="#EF4444" />
                        <Text style={styles.adminDeleteBtnText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Admin Add/Edit Course Modal */}
      <Modal
        visible={isCourseModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsCourseModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: isDark ? '#121212' : '#FFFFFF',
                borderColor: isDark ? '#27272A' : '#E2E8F0',
                borderWidth: isDark ? 1 : 0,
              },
            ]}
          >
            <View
              style={[
                styles.modalHeader,
                {
                  backgroundColor: isDark ? '#000000' : '#F8FAFC',
                  borderBottomColor: isDark ? '#27272A' : '#E2E8F0',
                },
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <ShieldCheck size={20} color="#2563EB" />
                <Text style={[styles.modalTitle, { color: theme.text }]}>
                  {editingCourseId ? 'Edit Course' : 'Create New Target Course'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsCourseModalOpen(false)}>
                <X size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody}>
              {/* AI Auto-Fill Helper Banner */}
              <TouchableOpacity
                style={[
                  styles.aiHelperBanner,
                  {
                    backgroundColor: isDark ? '#1E1530' : '#F3E8FF',
                    borderColor: isDark ? '#6B21A8' : '#D8B4FE',
                  },
                ]}
                onPress={handleAiAutoFill}
                disabled={aiGenerating}
              >
                <Sparkles size={16} color="#A855F7" />
                <Text style={[styles.aiHelperText, { color: isDark ? '#C084FC' : '#6B21A8' }]}>
                  {aiGenerating ? 'AI Generating Content...' : '✨ Auto-Fill Missing Fields with AI'}
                </Text>
              </TouchableOpacity>

              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Course Title (Name) *</Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.inputBg,
                    borderColor: theme.inputBorder,
                    color: theme.text,
                  },
                ]}
                placeholderTextColor={theme.textMuted}
                placeholder="e.g. Class 10 State Board Topper Course 2027"
                value={courseForm.title}
                onChangeText={(text) => setCourseForm((prev) => ({ ...prev, title: text }))}
              />

              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Tagline / Subtitle *</Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.inputBg,
                    borderColor: theme.inputBorder,
                    color: theme.text,
                  },
                ]}
                placeholderTextColor={theme.textMuted}
                placeholder="e.g. Full Syllabus Live Coaching & Handwritten Notes"
                value={courseForm.tagline}
                onChangeText={(text) => setCourseForm((prev) => ({ ...prev, tagline: text }))}
              />

              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Target Class</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {CLASSES_LIST.map((cls) => (
                    <TouchableOpacity
                      key={cls}
                      style={[
                        styles.classModalPill,
                        {
                          backgroundColor: isDark ? '#18181B' : '#F1F5F9',
                          borderColor: isDark ? '#27272A' : '#CBD5E1',
                        },
                        courseForm.class_name === cls && styles.classModalPillActive,
                      ]}
                      onPress={() => setCourseForm((p) => ({ ...p, class_name: cls }))}
                    >
                      <Text
                        style={[
                          styles.classModalPillText,
                          { color: courseForm.class_name === cls ? '#FFFFFF' : theme.textSecondary },
                          courseForm.class_name === cls && styles.classModalPillTextActive,
                        ]}
                      >
                        {cls}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              {/* Start Date Picker (Touch Selection - No Typing) */}
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Course Start Date *</Text>
              <TouchableOpacity
                style={[
                  styles.datePickerTrigger,
                  {
                    backgroundColor: theme.inputBg,
                    borderColor: theme.inputBorder,
                  },
                ]}
                onPress={() => setIsDatePickerOpen(true)}
              >
                <Calendar size={16} color="#3B82F6" />
                <Text style={[styles.datePickerTriggerText, { color: theme.text }]}>{courseForm.start_date}</Text>
                <Text style={styles.datePickerChangeHint}>Tap to change</Text>
              </TouchableOpacity>

              <View style={styles.formRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Original Price (₹)</Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      {
                        backgroundColor: theme.inputBg,
                        borderColor: theme.inputBorder,
                        color: theme.text,
                      },
                    ]}
                    placeholderTextColor={theme.textMuted}
                    keyboardType="numeric"
                    placeholder="999"
                    value={courseForm.price}
                    onChangeText={(text) => setCourseForm((prev) => ({ ...prev, price: text }))}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Sale / Offer Price (₹)</Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      {
                        backgroundColor: theme.inputBg,
                        borderColor: theme.inputBorder,
                        color: theme.text,
                      },
                    ]}
                    placeholderTextColor={theme.textMuted}
                    keyboardType="numeric"
                    placeholder="499"
                    value={courseForm.discount_price}
                    onChangeText={(text) =>
                      setCourseForm((prev) => ({ ...prev, discount_price: text }))
                    }
                  />
                </View>
              </View>

              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Validity Duration (Days)</Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.inputBg,
                    borderColor: theme.inputBorder,
                    color: theme.text,
                  },
                ]}
                placeholderTextColor={theme.textMuted}
                keyboardType="numeric"
                placeholder="365"
                value={courseForm.validity_days}
                onChangeText={(text) =>
                  setCourseForm((prev) => ({ ...prev, validity_days: text }))
                }
              />

              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Course Description</Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    height: 70,
                    textAlignVertical: 'top',
                    backgroundColor: theme.inputBg,
                    borderColor: theme.inputBorder,
                    color: theme.text,
                  },
                ]}
                placeholderTextColor={theme.textMuted}
                multiline
                numberOfLines={3}
                placeholder="Course features, syllabus overview & live class schedule..."
                value={courseForm.description}
                onChangeText={(text) => setCourseForm((prev) => ({ ...prev, description: text }))}
              />

              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Course Thumbnail Photo</Text>
              {courseForm.thumbnail_url ? (
                <View style={styles.thumbnailPreviewContainer}>
                  <Image
                    source={{ uri: getResolvedThumbnailUrl(courseForm.thumbnail_url) }}
                    style={styles.previewImage}
                    resizeMode="contain"
                  />
                  <TouchableOpacity
                    style={styles.clearThumbBtn}
                    onPress={() => setCourseForm((p) => ({ ...p, thumbnail_url: '' }))}
                  >
                    <X size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ) : null}

              <View style={styles.photoActionRow}>
                <TouchableOpacity
                  style={[
                    styles.photoBtn,
                    {
                      backgroundColor: isDark ? '#18181B' : '#EFF6FF',
                      borderColor: isDark ? '#27272A' : '#BFDBFE',
                    },
                  ]}
                  onPress={handlePickThumbnail}
                >
                  <ImageIcon size={15} color="#3B82F6" />
                  <Text style={[styles.photoBtnText, { color: '#3B82F6' }]}>Gallery Photo</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.photoBtn,
                    {
                      backgroundColor: isDark ? '#18181B' : '#EFF6FF',
                      borderColor: isDark ? '#27272A' : '#BFDBFE',
                    },
                  ]}
                  onPress={handleCaptureThumbnail}
                >
                  <Camera size={15} color="#3B82F6" />
                  <Text style={[styles.photoBtnText, { color: '#3B82F6' }]}>Camera</Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.inputLabel, { color: theme.textSecondary, marginTop: 6 }]}>Or Thumbnail Web Link</Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.inputBg,
                    borderColor: theme.inputBorder,
                    color: theme.text,
                  },
                ]}
                placeholderTextColor={theme.textMuted}
                placeholder="https://..."
                value={courseForm.thumbnail_url}
                onChangeText={(text) => setCourseForm((prev) => ({ ...prev, thumbnail_url: text }))}
              />
            </ScrollView>

            <View
              style={[
                styles.modalFooter,
                {
                  backgroundColor: isDark ? '#000000' : '#F8FAFC',
                  borderTopColor: isDark ? '#27272A' : '#E2E8F0',
                },
              ]}
            >
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setIsCourseModalOpen(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveCourse}>
                <Text style={styles.saveBtnText}>
                  {editingCourseId ? 'Save Changes' : 'Create & Publish'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Interactive Date Picker Modal */}
      <DateTimePickerModal
        visible={isDatePickerOpen}
        mode="date"
        title="Select Course Start Date"
        onClose={() => setIsDatePickerOpen(false)}
        onSelect={(date, formatted) => {
          setCourseForm((prev) => ({ ...prev, start_date: formatted }));
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
  topBar: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  classFilterScroll: {
    gap: 8,
  },
  classChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  classChipActive: {
    backgroundColor: '#2563EB',
  },
  classChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  classChipTextActive: {
    color: '#FFFFFF',
  },
  adminBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  adminBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  adminBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#92400E',
  },
  addCourseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addCourseBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scroll: {
    padding: 16,
    paddingBottom: 30,
  },
  pageTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  courseList: {
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  imageBox: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#0F172A',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  tagBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#2563EB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  cardBody: {
    padding: 14,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  cardTagline: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  stat: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  viewCourseBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  viewCourseBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
    flexShrink: 1,
  },
  freeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#10B981',
    borderRadius: 8,
  },
  freeBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  payBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#2563EB',
    borderRadius: 8,
  },
  payBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  adminCardActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  adminEditBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
  },
  adminEditBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  adminDeleteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
    backgroundColor: '#FEF2F2',
    borderRadius: 6,
  },
  adminDeleteBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EF4444',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalBody: {
    padding: 16,
  },
  aiHelperBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    borderRadius: 8,
    paddingVertical: 8,
    marginBottom: 10,
  },
  aiHelperText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7C3AED',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 4,
    marginTop: 8,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#0F172A',
  },
  classModalPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  classModalPillActive: {
    backgroundColor: '#2563EB',
  },
  classModalPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  classModalPillTextActive: {
    color: '#FFFFFF',
  },
  datePickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  datePickerTriggerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  datePickerChangeHint: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2563EB',
  },
  formRow: {
    flexDirection: 'row',
    gap: 10,
  },
  thumbnailPreviewContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#0F172A',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    marginVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  clearThumbBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 4,
  },
  photoActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  photoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  photoBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  saveBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#2563EB',
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginVertical: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
});
