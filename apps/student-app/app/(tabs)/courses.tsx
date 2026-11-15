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
import { translations, formatINR } from '@icc/shared-utils';
import { initialCourses } from '../../../admin-web/src/lib/sample-data';
import { CoachingHeader } from '../../src/components/CoachingHeader';
import { DataService } from '../../src/services/dataService';
import { academicService } from '../../src/services/academicService';
import { Course } from '@icc/shared-types';
import * as ImagePicker from 'expo-image-picker';
import {
  Plus,
  Edit3,
  Trash2,
  ShieldCheck,
  Camera,
  ImageIcon,
  X,
  BookOpen,
  ChevronRight,
  Layers,
} from 'lucide-react-native';

// Thumbnail map for local React Native assets
const thumbMap: Record<string, any> = {
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

const BSEB_BOARD_ID = 'b0000000-0000-0000-0000-000000000001';
const JAC_BOARD_ID = 'b0000000-0000-0000-0000-000000000002';

type BoardFilter = 'ALL' | 'BSEB' | 'JAC';

export default function StudentCoursesScreen() {
  const router = useRouter();
  const { user, language } = useAuthStore();
  const t = translations[language] || translations.en;

  const isAdmin =
    user?.role === 'admin' ||
    user?.role === 'super_admin' ||
    user?.role === 'teacher' ||
    user?.email === 'icckeguruji@gmail.com' ||
    user?.mobile_number === '9771350910' ||
    user?.username === 'badesir';

  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState<BoardFilter>('ALL');

  // Course Modal state for Admin
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [courseForm, setCourseForm] = useState({
    title: '',
    title_hi: '',
    board_code: 'BSEB',
    class_name: 'Class 10',
    price: '999',
    discount_price: '499',
    validity_days: '365',
    description: '',
    thumbnail_url:
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
  });

  const loadCourses = useCallback(async () => {
    setIsSyncing(true);
    try {
      const data = await academicService.getCourses();
      if (data && data.length > 0) {
        setCourses(data);
      } else {
        const remoteData = await DataService.fetchCourses();
        setCourses(remoteData);
      }
    } catch {
      // Keep initial courses
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    loadCourses();
    const unsubscribe = DataService.subscribeToChanges(() => {
      loadCourses();
    });
    return () => unsubscribe();
  }, [loadCourses]);

  const filteredCourses = courses.filter((c) => {
    if (selectedBoard === 'ALL') return true;
    if (selectedBoard === 'BSEB') return c.board_id === BSEB_BOARD_ID || c.title.includes('BSEB');
    if (selectedBoard === 'JAC') return c.board_id === JAC_BOARD_ID || c.title.includes('JAC');
    return true;
  });

  // Open modal for Create or Edit
  const openCourseModal = (course?: Course) => {
    if (course) {
      setEditingCourseId(course.id);
      setCourseForm({
        title: course.title,
        title_hi: course.title_hi || course.title,
        board_code: course.board_id === JAC_BOARD_ID ? 'JAC' : 'BSEB',
        class_name: 'Class 10',
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
        board_code: 'BSEB',
        class_name: 'Class 10',
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

  // Handle Save Course (Create / Update)
  const handleSaveCourse = async () => {
    if (!courseForm.title.trim()) {
      Alert.alert('Required', 'Please enter Course Title');
      return;
    }

    const boardId = courseForm.board_code === 'JAC' ? JAC_BOARD_ID : BSEB_BOARD_ID;

    try {
      if (editingCourseId) {
        await academicService.updateCourse(editingCourseId, {
          title: courseForm.title.trim(),
          title_hi: courseForm.title_hi.trim() || courseForm.title.trim(),
          board_id: boardId,
          price: parseFloat(courseForm.price) || 999,
          discount_price: parseFloat(courseForm.discount_price) || 499,
          validity_days: parseInt(courseForm.validity_days) || 365,
          description: courseForm.description.trim(),
          thumbnail_url: courseForm.thumbnail_url,
        });
        Alert.alert('Success', 'Course details updated successfully!');
      } else {
        await academicService.addCourse({
          title: courseForm.title.trim(),
          title_hi: courseForm.title_hi.trim() || courseForm.title.trim(),
          board_id: boardId,
          price: parseFloat(courseForm.price) || 999,
          discount_price: parseFloat(courseForm.discount_price) || 499,
          validity_days: parseInt(courseForm.validity_days) || 365,
          description: courseForm.description.trim(),
          thumbnail_url: courseForm.thumbnail_url,
          is_free: false,
        });
        Alert.alert('Success', 'New batch course created successfully!');
      }

      setIsCourseModalOpen(false);
      loadCourses();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save course');
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
              loadCourses();
              Alert.alert('Deleted', 'Course removed from catalog.');
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete course');
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
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        setCourseForm((prev) => ({ ...prev, thumbnail_url: result.assets[0].uri }));
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
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        setCourseForm((prev) => ({ ...prev, thumbnail_url: result.assets[0].uri }));
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not capture photo');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Branded Coaching Header with Logo, Name & Live Sync */}
      <CoachingHeader onRefresh={loadCourses} isSyncing={isSyncing} />

      {/* Top Board Switcher & Admin Actions */}
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
              All Batches
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
              Bihar Board (BSEB)
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
              Jharkhand (JAC)
            </Text>
          </TouchableOpacity>
        </View>

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
            onRefresh={loadCourses}
            colors={['#2563EB']}
            tintColor="#2563EB"
          />
        }
      >
        <Text style={styles.pageTitle}>
          {selectedBoard === 'ALL'
            ? 'All Target Courses'
            : `${selectedBoard} Target Board Batches`}
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
                    {course.is_free ? 'FREE BATCH' : formatINR(course.discount_price || course.price)}
                  </Text>
                </View>
              </View>

              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{course.title}</Text>
                <Text style={styles.cardDesc} numberOfLines={2}>
                  {course.description}
                </Text>

                <View style={styles.statsRow}>
                  <Text style={styles.stat}>⏱️ {course.validity_days} Days</Text>
                  <Text style={styles.stat}>📹 {course.lecture_count || 40} Videos</Text>
                  <Text style={styles.stat}>📄 {course.material_count || 25} PDFs</Text>
                </View>

                {/* Normal Student Action Row */}
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.viewCourseBtn}
                    onPress={() => router.push(`/course/${course.id}`)}
                  >
                    <BookOpen size={14} color="#2563EB" />
                    <Text style={styles.viewCourseBtnText}>Open Course (विषय व पाठ)</Text>
                  </TouchableOpacity>

                  {course.is_free ? (
                    <TouchableOpacity
                      style={styles.freeBtn}
                      onPress={() => router.push(`/course/${course.id}`)}
                    >
                      <Text style={styles.freeBtnText}>Free Access</Text>
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
          ))}
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
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <ShieldCheck size={20} color="#2563EB" />
                <Text style={styles.modalTitle}>
                  {editingCourseId ? 'Edit Course' : 'Create New Target Course'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsCourseModalOpen(false)}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody}>
              <Text style={styles.inputLabel}>Course Title (English) *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. BSEB Class 10 Target Board 2027"
                value={courseForm.title}
                onChangeText={(text) => setCourseForm((prev) => ({ ...prev, title: text }))}
              />

              <Text style={styles.inputLabel}>Course Title (Hindi)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. बिहार बोर्ड 10वीं 2027 टॉपर बैच"
                value={courseForm.title_hi}
                onChangeText={(text) => setCourseForm((prev) => ({ ...prev, title_hi: text }))}
              />

              <View style={styles.formRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Board</Text>
                  <View style={styles.boardToggleRow}>
                    <TouchableOpacity
                      style={[
                        styles.toggleBtn,
                        courseForm.board_code === 'BSEB' && styles.toggleBtnActive,
                      ]}
                      onPress={() => setCourseForm((prev) => ({ ...prev, board_code: 'BSEB' }))}
                    >
                      <Text
                        style={[
                          styles.toggleBtnText,
                          courseForm.board_code === 'BSEB' && styles.toggleBtnTextActive,
                        ]}
                      >
                        BSEB
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.toggleBtn,
                        courseForm.board_code === 'JAC' && styles.toggleBtnActive,
                      ]}
                      onPress={() => setCourseForm((prev) => ({ ...prev, board_code: 'JAC' }))}
                    >
                      <Text
                        style={[
                          styles.toggleBtnText,
                          courseForm.board_code === 'JAC' && styles.toggleBtnTextActive,
                        ]}
                      >
                        JAC
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Class</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Class 10"
                    value={courseForm.class_name}
                    onChangeText={(text) => setCourseForm((prev) => ({ ...prev, class_name: text }))}
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Price (₹)</Text>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="numeric"
                    placeholder="999"
                    value={courseForm.price}
                    onChangeText={(text) => setCourseForm((prev) => ({ ...prev, price: text }))}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Discount Price (₹)</Text>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="numeric"
                    placeholder="499"
                    value={courseForm.discount_price}
                    onChangeText={(text) =>
                      setCourseForm((prev) => ({ ...prev, discount_price: text }))
                    }
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Validity (Days)</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                placeholder="365"
                value={courseForm.validity_days}
                onChangeText={(text) =>
                  setCourseForm((prev) => ({ ...prev, validity_days: text }))
                }
              />

              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, { height: 70, textAlignVertical: 'top' }]}
                multiline
                numberOfLines={3}
                placeholder="Course features, live class schedule & syllabus overview..."
                value={courseForm.description}
                onChangeText={(text) => setCourseForm((prev) => ({ ...prev, description: text }))}
              />

              <Text style={styles.inputLabel}>Course Thumbnail</Text>
              {courseForm.thumbnail_url ? (
                <View style={styles.thumbnailPreviewContainer}>
                  <Image
                    source={{ uri: courseForm.thumbnail_url }}
                    style={styles.previewImage}
                    resizeMode="cover"
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
                <TouchableOpacity style={styles.photoBtn} onPress={handlePickThumbnail}>
                  <ImageIcon size={15} color="#2563EB" />
                  <Text style={styles.photoBtnText}>Gallery Photo</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.photoBtn} onPress={handleCaptureThumbnail}>
                  <Camera size={15} color="#2563EB" />
                  <Text style={styles.photoBtnText}>Camera</Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.inputLabel, { marginTop: 6 }]}>Or Thumbnail Web Link</Text>
              <TextInput
                style={styles.textInput}
                placeholder="https://..."
                value={courseForm.thumbnail_url}
                onChangeText={(text) => setCourseForm((prev) => ({ ...prev, thumbnail_url: text }))}
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setIsCourseModalOpen(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveCourse}>
                <Text style={styles.saveBtnText}>
                  {editingCourseId ? 'Save Changes' : 'Create Course'}
                </Text>
              </TouchableOpacity>
            </View>
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
    height: 150,
    width: '100%',
    backgroundColor: '#1E293B',
    position: 'relative',
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
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
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
  formRow: {
    flexDirection: 'row',
    gap: 10,
  },
  boardToggleRow: {
    flexDirection: 'row',
    gap: 6,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleBtnActive: {
    backgroundColor: '#2563EB',
  },
  toggleBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  toggleBtnTextActive: {
    color: '#FFFFFF',
  },
  thumbnailPreviewContainer: {
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    marginVertical: 6,
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
});
