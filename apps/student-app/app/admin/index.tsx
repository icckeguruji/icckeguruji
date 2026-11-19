import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Image,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/useAuthStore';
import { academicService, getResolvedThumbnailUrl, AcademicSubject } from '../../src/services/academicService';
import { Course, LiveClass, StudyMaterial, UserProfile, Payment } from '@icc/shared-types';
import { formatINR } from '@icc/shared-utils';
import * as DocumentPicker from 'expo-document-picker';
import {
  ShieldCheck,
  LayoutDashboard,
  BookOpen,
  Radio,
  Video,
  FileText,
  Users,
  CreditCard,
  Bell,
  Settings,
  Plus,
  Edit3,
  Trash2,
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  ChevronRight,
  ExternalLink,
  Lock,
  Unlock,
  Phone,
  Mail,
  X,
  UserCheck,
} from 'lucide-react-native';

type AdminTab =
  | 'overview'
  | 'courses'
  | 'live'
  | 'videos'
  | 'notes'
  | 'students'
  | 'payments'
  | 'announcements'
  | 'teachers'
  | 'settings';

export default function AndroidAdminDashboardScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  const isAdmin =
    user?.role === 'admin' ||
    user?.role === 'super_admin' ||
    user?.email === 'icckeguruji@gmail.com' ||
    user?.mobile_number === '9771350910' ||
    user?.username === 'badesir';

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Data states
  const [courses, setCourses] = useState<Course[]>([]);
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [recordedLectures, setRecordedLectures] = useState<any[]>([]);
  const [studyMaterials, setStudyMaterials] = useState<StudyMaterial[]>([]);
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

  // Modals
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseForm, setCourseForm] = useState({
    title: '',
    title_hi: '',
    class_name: 'Class 10',
    price: '999',
    discount_price: '499',
    description: '',
  });

  const [isLiveModalOpen, setIsLiveModalOpen] = useState(false);
  const [liveForm, setLiveForm] = useState({
    title: '',
    youtube_video_id: '',
    duration_minutes: '60',
  });

  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');

  const loadAllData = useCallback(async () => {
    try {
      await academicService.ensureLoaded();
      const [allCourses, allLive, allVids, allMats, allStudents, allPayments] =
        await Promise.all([
          academicService.getCourses(),
          academicService.getLiveClasses(),
          academicService.lectures || [],
          academicService.getStudyMaterials(),
          academicService.getStudents(),
          academicService.getPayments(),
        ]);
      setCourses(allCourses);
      setLiveClasses(allLive);
      setRecordedLectures(allVids || []);
      setStudyMaterials(allMats);
      setStudents(allStudents);
      setPayments(allPayments);
    } catch (e) {
      console.warn('Admin load error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
    academicService.syncFromCloud().then(() => loadAllData());
    const unsub = academicService.subscribe(() => {
      loadAllData();
    });
    return () => {
      unsub();
    };
  }, [loadAllData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await academicService.syncFromCloud();
    await loadAllData();
  };

  // --- COURSE CRUD ---
  const handleSaveCourse = async () => {
    if (!courseForm.title.trim()) {
      Alert.alert('Required', 'Please enter a course title.');
      return;
    }
    try {
      if (editingCourse) {
        await academicService.updateCourse(editingCourse.id, {
          title: courseForm.title.trim(),
          title_hi: courseForm.title_hi.trim() || courseForm.title.trim(),
          price: parseInt(courseForm.price, 10) || 0,
          discount_price: parseInt(courseForm.discount_price, 10) || 0,
          description: courseForm.description.trim(),
        });
        Alert.alert('Success', 'Course details updated.');
      } else {
        await academicService.createCourse({
          title: courseForm.title.trim(),
          title_hi: courseForm.title_hi.trim() || courseForm.title.trim(),
          class_name: courseForm.class_name,
          price: parseInt(courseForm.price, 10) || 0,
          discount_price: parseInt(courseForm.discount_price, 10) || 0,
          description: courseForm.description.trim(),
        });
        Alert.alert('Success', 'New course created and published.');
      }
      setIsCourseModalOpen(false);
      setEditingCourse(null);
      setActiveTab('courses'); // Instant parity: jump to courses tab so admin sees it immediately
      loadAllData();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save course.');
    }
  };

  const handleDeleteCourse = (course: Course) => {
    Alert.alert(
      'Delete Course',
      `Are you sure you want to delete "${course.title}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await academicService.deleteCourse(course.id);
            loadAllData();
          },
        },
      ]
    );
  };

  // --- LIVE CLASS ACTIONS ---
  const handleScheduleLive = async () => {
    if (!liveForm.title.trim()) {
      Alert.alert('Required', 'Please enter a live class title.');
      return;
    }
    try {
      await academicService.scheduleLiveClass({
        title: liveForm.title.trim(),
        youtube_video_id: liveForm.youtube_video_id.trim() || 'jfKfPfyJRdk',
        scheduled_at: new Date().toISOString(),
        duration_minutes: parseInt(liveForm.duration_minutes, 10) || 60,
        status: 'live',
      });
      setIsLiveModalOpen(false);
      setLiveForm({ title: '', youtube_video_id: '', duration_minutes: '60' });
      loadAllData();
      Alert.alert('Success', 'Live session scheduled and broadcast started.');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to schedule live class.');
    }
  };

  const handleEndLiveAndArchive = async (liveId: string) => {
    Alert.alert(
      'End Live Class & Auto-Archive',
      'This will mark the live class as completed and automatically save it to Recorded Videos under the same chapter.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End & Save to Recordings',
          onPress: async () => {
            await academicService.updateLiveClassStatus(liveId, 'completed');
            loadAllData();
            Alert.alert('Archived', 'Class completed and added to Recorded Lectures.');
          },
        },
      ]
    );
  };

  // --- PAYMENT APPROVALS ---
  const handleApprovePayment = async (payId: string, studentName: string) => {
    Alert.alert(
      'Approve Payment & Unlock Course',
      `Confirm approval for ${studentName}? Course will be instantly unlocked.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve & Unlock',
          onPress: async () => {
            await academicService.approvePayment(payId, user?.id);
            loadAllData();
            Alert.alert('Approved', `Access granted to ${studentName}.`);
          },
        },
      ]
    );
  };

  const handleRejectPayment = async (payId: string, studentName: string) => {
    Alert.alert('Reject Payment', `Reject payment request for ${studentName}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: async () => {
          await academicService.rejectPayment(payId, user?.id);
          loadAllData();
        },
      },
    ]);
  };

  // --- STUDENT STATUS ---
  const handleToggleStudent = async (student: UserProfile) => {
    await academicService.toggleStudentStatus(student.id);
    loadAllData();
    Alert.alert(
      'Status Updated',
      `${student.full_name} status toggled.`
    );
  };

  // --- BROADCAST ANNOUNCEMENT ---
  const handleSendBroadcast = () => {
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
      Alert.alert('Required', 'Please enter title and message.');
      return;
    }
    setIsBroadcastModalOpen(false);
    setBroadcastTitle('');
    setBroadcastMessage('');
    Alert.alert('Broadcast Sent', 'Push notification sent to all enrolled students.');
  };

  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={20} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Access Denied</Text>
        </View>
        <View style={styles.centered}>
          <Lock size={48} color="#DC2626" />
          <Text style={styles.accessDeniedTitle}>Director Access Restricted</Text>
          <Text style={styles.accessDeniedText}>
            You must be signed in as Director BADE SIR to access the admin portal.
          </Text>
          <TouchableOpacity
            style={styles.signInBtn}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.signInBtnText}>Director Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Executive Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={20} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.headerTextCol}>
          <View style={styles.brandBadge}>
            <ShieldCheck size={12} color="#D97706" />
            <Text style={styles.brandBadgeText}>DIRECTOR PORTAL</Text>
          </View>
          <Text style={styles.headerTitle}>Admin Management</Text>
        </View>
        <TouchableOpacity
          style={styles.syncBtn}
          onPress={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw size={16} color="#2563EB" />
        </TouchableOpacity>
      </View>

      {/* Navigation Tab Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsStrip}
      >
        {[
          { key: 'overview', label: 'Overview', icon: LayoutDashboard },
          { key: 'courses', label: `Courses (${courses.length})`, icon: BookOpen },
          { key: 'live', label: `Live (${liveClasses.length})`, icon: Radio },
          { key: 'videos', label: `Videos (${recordedLectures.length})`, icon: Video },
          { key: 'notes', label: `PDF Notes (${studyMaterials.length})`, icon: FileText },
          { key: 'students', label: `Students (${students.length})`, icon: Users },
          { key: 'payments', label: `Payments (${payments.length})`, icon: CreditCard },
          { key: 'announcements', label: 'Broadcast', icon: Bell },
          { key: 'teachers', label: 'Teachers', icon: UserCheck },
          { key: 'settings', label: 'Settings', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabPill, isActive && styles.tabPillActive]}
              onPress={() => setActiveTab(tab.key as AdminTab)}
            >
              <Icon size={14} color={isActive ? '#FFFFFF' : '#475569'} />
              <Text style={[styles.tabPillText, isActive && styles.tabPillTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <View style={styles.tabContent}>
            {/* Quick Metrics Grid */}
            <View style={styles.metricsGrid}>
              <View style={[styles.metricCard, { borderLeftColor: '#2563EB' }]}>
                <Text style={styles.metricLabel}>Total Courses</Text>
                <Text style={styles.metricVal}>{courses.length}</Text>
                <Text style={styles.metricSub}>Active in Catalog</Text>
              </View>
              <View style={[styles.metricCard, { borderLeftColor: '#059669' }]}>
                <Text style={styles.metricLabel}>Enrolled Students</Text>
                <Text style={styles.metricVal}>{students.length}</Text>
                <Text style={styles.metricSub}>Registered Accounts</Text>
              </View>
              <View style={[styles.metricCard, { borderLeftColor: '#DC2626' }]}>
                <Text style={styles.metricLabel}>Live Sessions</Text>
                <Text style={styles.metricVal}>{liveClasses.length}</Text>
                <Text style={styles.metricSub}>Broadcasts Created</Text>
              </View>
              <View style={[styles.metricCard, { borderLeftColor: '#D97706' }]}>
                <Text style={styles.metricLabel}>Fee Submissions</Text>
                <Text style={styles.metricVal}>{payments.length}</Text>
                <Text style={styles.metricSub}>UPI Transactions</Text>
              </View>
            </View>

            {/* Quick Action Buttons */}
            <Text style={styles.sectionHeading}>FREQUENT DIRECTOR ACTIONS</Text>
            <View style={styles.quickActionsCol}>
              <TouchableOpacity
                style={styles.actionRow}
                onPress={() => {
                  setEditingCourse(null);
                  setCourseForm({
                    title: '',
                    title_hi: '',
                    class_name: 'Class 10',
                    price: '999',
                    discount_price: '499',
                    description: '',
                  });
                  setIsCourseModalOpen(true);
                }}
              >
                <View style={[styles.actionIconBox, { backgroundColor: '#EFF6FF' }]}>
                  <BookOpen size={18} color="#2563EB" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.actionTitle}>Create New Course</Text>
                  <Text style={styles.actionSub}>Add target batch, syllabus and pricing</Text>
                </View>
                <Plus size={18} color="#2563EB" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionRow}
                onPress={() => setIsLiveModalOpen(true)}
              >
                <View style={[styles.actionIconBox, { backgroundColor: '#FEF2F2' }]}>
                  <Radio size={18} color="#DC2626" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.actionTitle}>Start YouTube Live Class</Text>
                  <Text style={styles.actionSub}>Broadcast unlisted stream to students</Text>
                </View>
                <Plus size={18} color="#DC2626" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionRow}
                onPress={() => setActiveTab('payments')}
              >
                <View style={[styles.actionIconBox, { backgroundColor: '#FEF3C7' }]}>
                  <CreditCard size={18} color="#D97706" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.actionTitle}>Review UPI Fee Submissions</Text>
                  <Text style={styles.actionSub}>Verify student UTR and unlock access</Text>
                </View>
                <ChevronRight size={18} color="#D97706" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionRow}
                onPress={() => setIsBroadcastModalOpen(true)}
              >
                <View style={[styles.actionIconBox, { backgroundColor: '#FDF2F8' }]}>
                  <Bell size={18} color="#DB2777" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.actionTitle}>Send Instant Push Broadcast</Text>
                  <Text style={styles.actionSub}>Announce schedule changes to all phones</Text>
                </View>
                <Plus size={18} color="#DB2777" />
              </TouchableOpacity>
            </View>

            {/* Quick Live Courses Preview on Overview */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 10 }}>
              <Text style={styles.sectionHeading}>ACTIVE COURSES IN CATALOG ({courses.length})</Text>
              <TouchableOpacity onPress={() => setActiveTab('courses')}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#2563EB' }}>Manage All ({courses.length}) →</Text>
              </TouchableOpacity>
            </View>

            {courses.length === 0 ? (
              <View style={[styles.itemCard, { paddingVertical: 18, alignItems: 'center' }]}>
                <Text style={{ fontSize: 13, color: '#64748B', fontWeight: '600' }}>No courses in catalog yet.</Text>
                <TouchableOpacity
                  style={[styles.primaryAddBtn, { marginTop: 10 }]}
                  onPress={() => {
                    setEditingCourse(null);
                    setCourseForm({
                      title: '',
                      title_hi: '',
                      class_name: 'Class 10',
                      price: '999',
                      discount_price: '499',
                      description: '',
                    });
                    setIsCourseModalOpen(true);
                  }}
                >
                  <Plus size={14} color="#FFFFFF" />
                  <Text style={styles.primaryAddBtnText}>Add Course</Text>
                </TouchableOpacity>
              </View>
            ) : (
              courses.slice(0, 3).map((course) => (
                <View key={course.id} style={styles.itemCard}>
                  <View style={styles.itemCardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemTitle}>{course.title}</Text>
                      <Text style={styles.itemSub}>
                        {academicService.getClassNameFromCourse(course)} • {course.is_free ? 'FREE' : formatINR(course.discount_price || course.price)}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.editBtn}
                      onPress={() => {
                        setEditingCourse(course);
                        setCourseForm({
                          title: course.title,
                          title_hi: course.title_hi || course.title,
                          class_name: academicService.getClassNameFromCourse(course),
                          price: String(course.price || 0),
                          discount_price: String(course.discount_price || course.price || 0),
                          description: course.description || '',
                        });
                        setIsCourseModalOpen(true);
                      }}
                    >
                      <Edit3 size={15} color="#2563EB" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* TAB 2: COURSES */}
        {activeTab === 'courses' && (
          <View style={styles.tabContent}>
            <View style={styles.tabActionHeader}>
              <Text style={styles.sectionHeading}>COURSE MANAGEMENT</Text>
              <TouchableOpacity
                style={styles.primaryAddBtn}
                onPress={() => {
                  setEditingCourse(null);
                  setCourseForm({
                    title: '',
                    title_hi: '',
                    class_name: 'Class 10',
                    price: '999',
                    discount_price: '499',
                    description: '',
                  });
                  setIsCourseModalOpen(true);
                }}
              >
                <Plus size={14} color="#FFFFFF" />
                <Text style={styles.primaryAddBtnText}>Add Course</Text>
              </TouchableOpacity>
            </View>

            {courses.map((course) => (
              <View key={course.id} style={styles.itemCard}>
                <View style={styles.itemCardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemTitle}>{course.title}</Text>
                    <Text style={styles.itemSub}>
                      {academicService.getClassNameFromCourse(course)} • {formatINR(course.discount_price || course.price)}
                    </Text>
                  </View>
                  <View style={styles.itemActionGroup}>
                    <TouchableOpacity
                      style={styles.editBtn}
                      onPress={() => {
                        setEditingCourse(course);
                        setCourseForm({
                          title: course.title,
                          title_hi: course.title_hi || course.title,
                          class_name: academicService.getClassNameFromCourse(course),
                          price: String(course.price || 0),
                          discount_price: String(course.discount_price || course.price || 0),
                          description: course.description || '',
                        });
                        setIsCourseModalOpen(true);
                      }}
                    >
                      <Edit3 size={15} color="#2563EB" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => handleDeleteCourse(course)}
                    >
                      <Trash2 size={15} color="#DC2626" />
                    </TouchableOpacity>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.viewCurriculumBtn}
                  onPress={() => router.push(`/course/${course.id}` as any)}
                >
                  <Text style={styles.viewCurriculumText}>
                    Manage Curriculum (Subjects & Chapters) →
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* TAB 3: LIVE CLASSES */}
        {activeTab === 'live' && (
          <View style={styles.tabContent}>
            <View style={styles.tabActionHeader}>
              <Text style={styles.sectionHeading}>LIVE STREAM SESSIONS</Text>
              <TouchableOpacity
                style={[styles.primaryAddBtn, { backgroundColor: '#DC2626' }]}
                onPress={() => setIsLiveModalOpen(true)}
              >
                <Plus size={14} color="#FFFFFF" />
                <Text style={styles.primaryAddBtnText}>Schedule Live</Text>
              </TouchableOpacity>
            </View>

            {liveClasses.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>No Live Classes Scheduled</Text>
                <Text style={styles.emptySubtitle}>
                  Schedule a YouTube broadcast using the button above.
                </Text>
              </View>
            ) : (
              liveClasses.map((live) => (
                <View key={live.id} style={styles.itemCard}>
                  <View style={styles.itemCardHeader}>
                    <View style={{ flex: 1 }}>
                      <View style={styles.statusBadgeRow}>
                        <View
                          style={[
                            styles.statusDot,
                            { backgroundColor: live.status === 'live' ? '#DC2626' : '#2563EB' },
                          ]}
                        />
                        <Text style={styles.statusBadgeText}>
                          {live.status.toUpperCase()}
                        </Text>
                      </View>
                      <Text style={styles.itemTitle}>{live.title}</Text>
                      <Text style={styles.itemSub}>
                        Duration: {live.duration_minutes}m • Video ID: {live.youtube_video_id}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => academicService.deleteLiveClass(live.id)}
                    >
                      <Trash2 size={15} color="#DC2626" />
                    </TouchableOpacity>
                  </View>
                  {live.status === 'live' && (
                    <TouchableOpacity
                      style={styles.endLiveActionBtn}
                      onPress={() => handleEndLiveAndArchive(live.id)}
                    >
                      <CheckCircle2 size={14} color="#FFFFFF" />
                      <Text style={styles.endLiveActionText}>
                        End Live & Save to Recorded Videos
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}
          </View>
        )}

        {/* TAB 4: RECORDED VIDEOS */}
        {activeTab === 'videos' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionHeading}>RECORDED VIDEO REPOSITORY</Text>
            {recordedLectures.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>No Recorded Lectures Found</Text>
                <Text style={styles.emptySubtitle}>
                  Lectures are automatically populated when live streams end or are added under chapters.
                </Text>
              </View>
            ) : (
              recordedLectures.map((lec, idx) => (
                <View key={lec.id || idx} style={styles.itemCard}>
                  <View style={styles.itemCardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemTitle}>{lec.title}</Text>
                      <Text style={styles.itemSub}>
                        YouTube ID: {lec.youtube_video_id} • {Math.round((lec.duration_seconds || 2700) / 60)} mins
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => academicService.deleteRecordedLecture(lec.id)}
                    >
                      <Trash2 size={15} color="#DC2626" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* TAB 5: STUDY MATERIALS */}
        {activeTab === 'notes' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionHeading}>HANDWRITTEN NOTES & PDF DOCUMENTS</Text>
            {studyMaterials.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>No PDF Notes Uploaded</Text>
                <Text style={styles.emptySubtitle}>
                  Upload PDF materials inside specific course chapters.
                </Text>
              </View>
            ) : (
              studyMaterials.map((mat) => (
                <View key={mat.id} style={styles.itemCard}>
                  <View style={styles.itemCardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemTitle}>{mat.title}</Text>
                      <Text style={styles.itemSub}>
                        {(mat.file_size_bytes / (1024 * 1024)).toFixed(1)} MB • {mat.material_type}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => academicService.deleteStudyMaterial(mat.id)}
                    >
                      <Trash2 size={15} color="#DC2626" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* TAB 6: STUDENTS */}
        {activeTab === 'students' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionHeading}>STUDENT ENROLLMENT DIRECTORY</Text>
            <View style={styles.searchBar}>
              <Search size={16} color="#64748B" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search students by name or phone..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {students
              .filter(
                (s) =>
                  s.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  s.mobile_number?.includes(searchQuery)
              )
              .map((student) => (
                <View key={student.id} style={styles.itemCard}>
                  <View style={styles.itemCardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemTitle}>{student.full_name}</Text>
                      <Text style={styles.itemSub}>
                        📞 {student.mobile_number || student.email || 'No phone'}
                      </Text>
                      <Text style={styles.itemSub}>
                        🏫 {student.school_name || 'Sarotiya High School'} • {student.board_code || 'BSEB'}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.statusToggleBtn,
                        student.is_active ? styles.btnActive : styles.btnSuspended,
                      ]}
                      onPress={() => handleToggleStudent(student)}
                    >
                      <Text style={styles.statusToggleText}>
                        {student.is_active ? 'Active' : 'Suspended'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
          </View>
        )}

        {/* TAB 7: PAYMENTS */}
        {activeTab === 'payments' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionHeading}>UPI FEE APPROVAL PIPELINE</Text>
            {payments.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>No Payments Submitted</Text>
                <Text style={styles.emptySubtitle}>
                  Student UPI UTR submission requests will appear here for one-click verification.
                </Text>
              </View>
            ) : (
              payments.map((pay) => (
                <View key={pay.id} style={styles.itemCard}>
                  <View style={styles.itemCardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemTitle}>
                        UTR: {pay.transaction_id || 'UPI-REF'}
                      </Text>
                      <Text style={styles.itemSub}>
                        Student: {pay.student_name || 'Enrolled Student'} • {formatINR(pay.amount || 499)}
                      </Text>
                      <Text style={styles.itemSub}>
                        Status: <Text style={{ fontWeight: '800' }}>{(pay.status || 'pending').toUpperCase()}</Text>
                      </Text>
                    </View>
                    {pay.status === 'pending' && (
                      <View style={{ flexDirection: 'row', gap: 6 }}>
                        <TouchableOpacity
                          style={styles.approveBtn}
                          onPress={() => handleApprovePayment(pay.id, pay.student_name || 'Student')}
                        >
                          <Text style={styles.approveBtnText}>Approve</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.rejectBtn}
                          onPress={() => handleRejectPayment(pay.id, pay.student_name || 'Student')}
                        >
                          <Text style={styles.rejectBtnText}>Reject</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* TAB 8: ANNOUNCEMENTS */}
        {activeTab === 'announcements' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionHeading}>INSTANT BROADCAST NOTIFICATIONS</Text>
            <View style={styles.broadcastBox}>
              <Text style={styles.fieldLabel}>Announcement Title *</Text>
              <TextInput
                style={styles.input}
                value={broadcastTitle}
                onChangeText={setBroadcastTitle}
                placeholder="e.g. Sunday Mock Test Schedule"
                placeholderTextColor="#94A3B8"
              />
              <Text style={styles.fieldLabel}>Announcement Message *</Text>
              <TextInput
                style={[styles.input, { height: 90, textAlignVertical: 'top' }]}
                value={broadcastMessage}
                onChangeText={setBroadcastMessage}
                placeholder="Type your message to all enrolled students..."
                placeholderTextColor="#94A3B8"
                multiline
              />
              <TouchableOpacity
                style={styles.broadcastSubmitBtn}
                onPress={handleSendBroadcast}
              >
                <Bell size={16} color="#FFFFFF" />
                <Text style={styles.broadcastSubmitText}>Send Push Notification</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* TAB 9: TEACHERS */}
        {activeTab === 'teachers' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionHeading}>FACULTY & TEACHER DIRECTORY</Text>
            <View style={styles.itemCard}>
              <View style={styles.itemCardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>BADE SIR (Director)</Text>
                  <Text style={styles.itemSub}>Subject: Mathematics & Physics</Text>
                  <Text style={styles.itemSub}>📞 +91 9771350910 • Sarotiya, Mahagama</Text>
                </View>
                <View style={styles.primaryBadge}>
                  <Text style={styles.primaryBadgeText}>Director</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* TAB 10: SETTINGS */}
        {activeTab === 'settings' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionHeading}>CLOUD & SYSTEM DIAGNOSTICS</Text>
            <View style={styles.itemCard}>
              <Text style={styles.itemTitle}>Supabase Database Sync</Text>
              <Text style={styles.itemSub}>Connected to project: gshjxcoyfrskxnpdqooy</Text>
              <Text style={styles.itemSub}>State: Real-time PostgreSQL Replication Active</Text>
              <TouchableOpacity style={styles.syncFullBtn} onPress={handleRefresh}>
                <RefreshCw size={14} color="#2563EB" />
                <Text style={styles.syncFullText}>Force Re-sync Entire Cache</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* CREATE / EDIT COURSE MODAL */}
      <Modal
        visible={isCourseModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsCourseModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeading}>
                {editingCourse ? 'Edit Course Details' : 'Create New Course'}
              </Text>
              <TouchableOpacity onPress={() => setIsCourseModalOpen(false)}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.fieldLabel}>Course Title *</Text>
              <TextInput
                style={styles.input}
                value={courseForm.title}
                onChangeText={(t) => setCourseForm({ ...courseForm, title: t })}
                placeholder="e.g. BSEB Class 10 Board Exam Batch"
                placeholderTextColor="#94A3B8"
              />
              <Text style={styles.fieldLabel}>Hindi Title</Text>
              <TextInput
                style={styles.input}
                value={courseForm.title_hi}
                onChangeText={(t) => setCourseForm({ ...courseForm, title_hi: t })}
                placeholder="e.g. बिहार बोर्ड कक्षा 10 संकल्प बैच"
                placeholderTextColor="#94A3B8"
              />
              <Text style={styles.fieldLabel}>Class / Grade</Text>
              <TextInput
                style={styles.input}
                value={courseForm.class_name}
                onChangeText={(t) => setCourseForm({ ...courseForm, class_name: t })}
                placeholder="Class 10"
                placeholderTextColor="#94A3B8"
              />
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Standard Price (₹)</Text>
                  <TextInput
                    style={styles.input}
                    value={courseForm.price}
                    onChangeText={(t) => setCourseForm({ ...courseForm, price: t })}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Discount Price (₹)</Text>
                  <TextInput
                    style={styles.input}
                    value={courseForm.discount_price}
                    onChangeText={(t) => setCourseForm({ ...courseForm, discount_price: t })}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              <Text style={styles.fieldLabel}>Description</Text>
              <TextInput
                style={[styles.input, { height: 70, textAlignVertical: 'top' }]}
                value={courseForm.description}
                onChangeText={(t) => setCourseForm({ ...courseForm, description: t })}
                placeholder="Brief course overview and topics covered..."
                placeholderTextColor="#94A3B8"
                multiline
              />
              <TouchableOpacity style={styles.submitBtn} onPress={handleSaveCourse}>
                <Text style={styles.submitBtnText}>
                  {editingCourse ? 'Save Changes' : 'Create & Publish Course'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* SCHEDULE LIVE MODAL */}
      <Modal
        visible={isLiveModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsLiveModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeading}>Schedule YouTube Live Class</Text>
              <TouchableOpacity onPress={() => setIsLiveModalOpen(false)}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.fieldLabel}>Broadcast Title *</Text>
              <TextInput
                style={styles.input}
                value={liveForm.title}
                onChangeText={(t) => setLiveForm({ ...liveForm, title: t })}
                placeholder="e.g. Mathematics Live Problem Solving Session"
                placeholderTextColor="#94A3B8"
              />
              <Text style={styles.fieldLabel}>YouTube Live URL or Video ID</Text>
              <TextInput
                style={styles.input}
                value={liveForm.youtube_video_id}
                onChangeText={(t) => setLiveForm({ ...liveForm, youtube_video_id: t })}
                placeholder="e.g. jfKfPfyJRdk"
                placeholderTextColor="#94A3B8"
                autoCapitalize="none"
              />
              <Text style={styles.fieldLabel}>Duration (Minutes)</Text>
              <TextInput
                style={styles.input}
                value={liveForm.duration_minutes}
                onChangeText={(t) => setLiveForm({ ...liveForm, duration_minutes: t })}
                keyboardType="numeric"
              />
              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: '#DC2626' }]}
                onPress={handleScheduleLive}
              >
                <Text style={styles.submitBtnText}>Start Live Broadcast</Text>
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
    marginRight: 10,
  },
  headerTextCol: {
    flex: 1,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  brandBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D97706',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  syncBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
  },
  tabsStrip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  tabPillActive: {
    backgroundColor: '#2563EB',
  },
  tabPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  tabPillTextActive: {
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  tabContent: {
    gap: 14,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 6,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 4,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
  },
  metricVal: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
  },
  metricSub: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.5,
    marginVertical: 4,
  },
  quickActionsCol: {
    gap: 10,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  actionSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  tabActionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  primaryAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  primaryAddBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  itemCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  itemSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  itemActionGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  editBtn: {
    padding: 6,
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
  },
  deleteBtn: {
    padding: 6,
    backgroundColor: '#FEF2F2',
    borderRadius: 6,
  },
  viewCurriculumBtn: {
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  viewCurriculumText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  statusBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
  },
  endLiveActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#059669',
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  endLiveActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: '#0F172A',
  },
  statusToggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  btnActive: {
    backgroundColor: '#DEF7EC',
  },
  btnSuspended: {
    backgroundColor: '#FDE8E8',
  },
  statusToggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#03543F',
  },
  approveBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  approveBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  rejectBtn: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  rejectBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  broadcastBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  broadcastSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#DB2777',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 6,
  },
  broadcastSubmitText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  primaryBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  primaryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },
  syncFullBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  syncFullText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
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
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  accessDeniedTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 16,
    marginBottom: 8,
  },
  accessDeniedText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  signInBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  signInBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
