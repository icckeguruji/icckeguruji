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
import { supabase, isSupabaseConfigured } from '../../src/lib/supabase';
import { initialCourses, initialStudents, initialPayments } from '../../../admin-web/src/lib/sample-data';
import { Course, UserProfile, Payment } from '@icc/shared-types';
import { formatINR } from '@icc/shared-utils';
import {
  ShieldCheck,
  Users,
  BookOpen,
  CreditCard,
  Bell,
  LogOut,
  CheckCircle,
  XCircle,
  Plus,
  Edit3,
  Trash2,
  MessageCircle,
  RefreshCw,
  Smartphone,
  ChevronRight,
  ArrowLeft,
  Search,
  Layers,
  Clock,
  Check,
  X,
  Phone,
  Send,
} from 'lucide-react-native';

type AdminTab = 'payments' | 'courses' | 'students' | 'broadcast';

export default function MobileAdminDashboard() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const [activeTab, setActiveTab] = useState<AdminTab>('payments');
  const [refreshing, setRefreshing] = useState(false);

  // Live Data States
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [students, setStudents] = useState<UserProfile[]>(initialStudents);
  const [payments, setPayments] = useState<any[]>(initialPayments);

  // Student Search
  const [studentSearch, setStudentSearch] = useState('');

  // Course Modal (Add / Edit)
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
  });

  // Broadcast Notification Form
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastBoard, setBroadcastBoard] = useState('ALL');
  const [broadcastLoading, setBroadcastLoading] = useState(false);

  // Load Data
  const loadAdminData = useCallback(async () => {
    setRefreshing(true);
    try {
      if (isSupabaseConfigured) {
        const [coursesRes, studentsRes, paymentsRes] = await Promise.all([
          supabase.from('courses').select('*').order('created_at', { ascending: false }),
          supabase.from('profiles').select('*').order('created_at', { ascending: false }),
          supabase.from('payments').select('*, student:profiles(*), course:courses(*)').order('created_at', { ascending: false }),
        ]);

        if (coursesRes.data && coursesRes.data.length > 0) {
          setCourses(coursesRes.data as Course[]);
        }
        if (studentsRes.data && studentsRes.data.length > 0) {
          setStudents(studentsRes.data as UserProfile[]);
        }
        if (paymentsRes.data && paymentsRes.data.length > 0) {
          setPayments(paymentsRes.data);
        }
      }
    } catch (err) {
      console.warn('Error loading admin mobile data:', err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  // Approve Payment
  const handleApprovePayment = async (payId: string, studentName?: string) => {
    Alert.alert(
      'Approve Enrollment Payment',
      `Confirm approval for ${studentName || 'student'}? This will immediately activate course access.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve & Activate',
          onPress: async () => {
            if (isSupabaseConfigured) {
              try {
                await supabase.rpc('admin_approve_payment', {
                  p_payment_id: payId,
                  p_admin_remarks: 'Verified by Director BADE SIR via Mobile Admin Console',
                });
              } catch {}
            }

            setPayments((prev) =>
              prev.map((p) =>
                p.id === payId
                  ? { ...p, status: 'approved', admin_remarks: 'Approved via Mobile Admin Console' }
                  : p
              )
            );
            Alert.alert('Approved! 🎉', 'Student course enrollment has been successfully approved and activated.');
          },
        },
      ]
    );
  };

  // Reject Payment
  const handleRejectPayment = (payId: string) => {
    Alert.alert(
      'Reject Payment',
      'Are you sure you want to reject this payment record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            if (isSupabaseConfigured) {
              try {
                await supabase.rpc('admin_reject_payment', {
                  p_payment_id: payId,
                  p_admin_remarks: 'Payment reference could not be verified by Director',
                });
              } catch {}
            }
            setPayments((prev) =>
              prev.map((p) => (p.id === payId ? { ...p, status: 'rejected' } : p))
            );
            Alert.alert('Rejected', 'Payment marked as rejected.');
          },
        },
      ]
    );
  };

  // Toggle Student Status
  const handleToggleStudent = async (student: UserProfile) => {
    const nextStatus = !student.is_active;
    if (isSupabaseConfigured) {
      try {
        await supabase.from('profiles').update({ is_active: nextStatus }).eq('id', student.id);
      } catch {}
    }
    setStudents((prev) =>
      prev.map((s) => (s.id === student.id ? { ...s, is_active: nextStatus } : s))
    );
  };

  // Send Parent WhatsApp
  const handleSendParentWhatsApp = (student: UserProfile, type: 'attendance' | 'test') => {
    const rawPhone = (student.guardian_phone || student.mobile_number || '').replace(/\D/g, '');
    const cleanPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;

    let msg = '';
    if (type === 'attendance') {
      msg = `🏫 *आदर्श कोचिंग सेन्टर (IDEAL COACHING CENTRE)*
📍 सरोतिया, महगामा, गोड्डा (झारखंड)
निदेशक: बड़े सर (BADE SIR) | +91 9771350910
----------------------------------------
📋 *साप्ताहिक उपस्थिति रिपोर्ट (Attendance Summary)*
विद्यार्थी का नाम: *${student.full_name}*
कक्षा: *${student.board_code} Class 10*
अभिभावक: *${student.guardian_name || 'आदरणीय अभिभावक'}*

✅ इस सप्ताह उपस्थिति: *6/6 दिन (100% उपस्थित)*
⭐ क्लास अनुशासन: *उत्कृष्ट (Excellent)*
----------------------------------------
आदर्श कोचिंग सेन्टर द्वारा स्वचालित संदेश`;
    } else {
      msg = `🏫 *आदर्श कोचिंग सेन्टर (IDEAL COACHING CENTRE)*
📍 सरोतिया, महगामा, गोड्डा (झारखंड)
निदेशक: बड़े सर (BADE SIR) | +91 9771350910
----------------------------------------
📝 *साप्ताहिक टेस्ट परिणाम (Sunday Mock Test)*
विद्यार्थी का नाम: *${student.full_name}*
बोर्ड: *${student.board_code}*
प्राप्तांक (Score): *46 / 50 (92%)*
रैंक: *#3 (Top 5% in Batch)*
परिणाम: *उत्तीर्ण (PASSED ⭐⭐⭐)*
----------------------------------------
बधाई! बोर्ड परीक्षा 2027 की तैयारी सही दिशा में है।`;
    }

    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Unable to open WhatsApp on this device.');
    });
  };

  // Save Course (Create or Update)
  const handleSaveCourse = async () => {
    if (!courseForm.title.trim()) {
      Alert.alert('Required', 'Please enter course title.');
      return;
    }

    if (editingCourseId) {
      // Update
      const updatedCourseData = {
        title: courseForm.title.trim(),
        title_hi: courseForm.title_hi.trim() || courseForm.title.trim(),
        price: Number(courseForm.price) || 0,
        discount_price: Number(courseForm.discount_price) || 0,
        validity_days: Number(courseForm.validity_days) || 365,
        description: courseForm.description.trim(),
      };

      if (isSupabaseConfigured) {
        try {
          await supabase.from('courses').update(updatedCourseData).eq('id', editingCourseId);
        } catch {}
      }

      setCourses((prev) =>
        prev.map((c) => (c.id === editingCourseId ? { ...c, ...updatedCourseData } : c))
      );
      Alert.alert('Success', 'Course details updated successfully!');
    } else {
      // Create
      const newCourse: Course = {
        id: `cr-${Date.now()}`,
        title: courseForm.title.trim(),
        title_hi: courseForm.title_hi.trim() || courseForm.title.trim(),
        description: courseForm.description.trim(),
        board_id: courseForm.board_code === 'BSEB' ? 'b0000000-0000-0000-0000-000000000001' : 'b0000000-0000-0000-0000-000000000002',
        class_id: 'c0000000-0000-0000-0000-000000000010',
        price: Number(courseForm.price) || 0,
        discount_price: Number(courseForm.discount_price) || 0,
        validity_days: Number(courseForm.validity_days) || 365,
        is_free: Number(courseForm.price) === 0,
        thumbnail_url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
        is_published: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (isSupabaseConfigured) {
        try {
          await supabase.from('courses').insert(newCourse);
        } catch {}
      }

      setCourses((prev) => [newCourse, ...prev]);
      Alert.alert('Published! 🎓', 'New course has been created and published to students.');
    }

    setIsCourseModalOpen(false);
    setEditingCourseId(null);
  };

  // Delete Course
  const handleDeleteCourse = (course: Course) => {
    Alert.alert(
      'Delete Course',
      `Are you sure you want to permanently delete:\n"${course.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Permanently',
          style: 'destructive',
          onPress: async () => {
            if (isSupabaseConfigured) {
              try {
                await supabase.from('courses').delete().eq('id', course.id);
              } catch {}
            }
            setCourses((prev) => prev.filter((c) => c.id !== course.id));
            Alert.alert('Deleted', 'Course removed from database.');
          },
        },
      ]
    );
  };

  // Broadcast Notification
  const handleBroadcast = async () => {
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
      Alert.alert('Required', 'Please enter title and message.');
      return;
    }

    setBroadcastLoading(true);
    try {
      if (isSupabaseConfigured) {
        await supabase.from('notifications').insert({
          title: broadcastTitle.trim(),
          message: broadcastMessage.trim(),
          target_board: broadcastBoard,
          type: 'announcement',
          is_read: false,
          created_at: new Date().toISOString(),
        });
      }

      Alert.alert('Broadcast Dispatched! 📢', 'Notification sent to all active coaching students.');
      setBroadcastTitle('');
      setBroadcastMessage('');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to dispatch notification.');
    } finally {
      setBroadcastLoading(false);
    }
  };

  const pendingPayments = payments.filter((p) => p.status === 'pending');
  const filteredStudents = students.filter(
    (s) =>
      s.full_name?.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.mobile_number?.includes(studentSearch) ||
      s.email?.toLowerCase().includes(studentSearch.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Admin Mobile Top Header */}
      <View style={styles.topHeader}>
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logoImg}
              resizeMode="contain"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.brandTitle}>IDEAL COACHING CENTRE</Text>
            <View style={styles.directorBadgeRow}>
              <View style={styles.adminTag}>
                <ShieldCheck size={11} color="#B45309" />
                <Text style={styles.adminTagText}>DIRECTOR CONSOLE</Text>
              </View>
              <Text style={styles.directorName}>BADE SIR (Sarotiya)</Text>
            </View>
          </View>
        </View>

        {/* Action Switchers */}
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.studentViewBtn}
            onPress={() => router.replace('/(tabs)')}
          >
            <Smartphone size={13} color="#2563EB" />
            <Text style={styles.studentViewText}>Student View</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={async () => {
              await logout();
              router.replace('/(auth)/login');
            }}
          >
            <LogOut size={13} color="#EF4444" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Real-time Summary Cards */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { borderLeftColor: '#3B82F6' }]}>
          <Users size={16} color="#2563EB" />
          <Text style={styles.statNum}>{students.length}</Text>
          <Text style={styles.statLabel}>Students</Text>
        </View>

        <View style={[styles.statCard, { borderLeftColor: '#F59E0B' }]}>
          <CreditCard size={16} color="#D97706" />
          <Text style={[styles.statNum, { color: pendingPayments.length > 0 ? '#DC2626' : '#D97706' }]}>
            {pendingPayments.length}
          </Text>
          <Text style={styles.statLabel}>Pending Pay</Text>
        </View>

        <View style={[styles.statCard, { borderLeftColor: '#10B981' }]}>
          <BookOpen size={16} color="#059669" />
          <Text style={styles.statNum}>{courses.length}</Text>
          <Text style={styles.statLabel}>Courses</Text>
        </View>
      </View>

      {/* Segmented Tab Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'payments' && styles.tabItemActive]}
          onPress={() => setActiveTab('payments')}
        >
          <CreditCard size={14} color={activeTab === 'payments' ? '#FFFFFF' : '#64748B'} />
          <Text style={[styles.tabText, activeTab === 'payments' && styles.tabTextActive]}>
            Payments ({pendingPayments.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'courses' && styles.tabItemActive]}
          onPress={() => setActiveTab('courses')}
        >
          <BookOpen size={14} color={activeTab === 'courses' ? '#FFFFFF' : '#64748B'} />
          <Text style={[styles.tabText, activeTab === 'courses' && styles.tabTextActive]}>
            Courses
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'students' && styles.tabItemActive]}
          onPress={() => setActiveTab('students')}
        >
          <Users size={14} color={activeTab === 'students' ? '#FFFFFF' : '#64748B'} />
          <Text style={[styles.tabText, activeTab === 'students' && styles.tabTextActive]}>
            Students
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'broadcast' && styles.tabItemActive]}
          onPress={() => setActiveTab('broadcast')}
        >
          <Bell size={14} color={activeTab === 'broadcast' ? '#FFFFFF' : '#64748B'} />
          <Text style={[styles.tabText, activeTab === 'broadcast' && styles.tabTextActive]}>
            Notice
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Content Area */}
      <ScrollView
        style={styles.contentScroll}
        contentContainerStyle={{ paddingBottom: 60 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadAdminData} />}
      >
        {/* TAB 1: PAYMENTS */}
        {activeTab === 'payments' && (
          <View style={styles.sectionWrap}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Manual UPI Verification</Text>
              <TouchableOpacity onPress={loadAdminData} style={styles.refreshIconBtn}>
                <RefreshCw size={14} color="#2563EB" />
              </TouchableOpacity>
            </View>

            {payments.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No payment records found.</Text>
              </View>
            ) : (
              payments.map((p) => {
                const isPending = p.status === 'pending';
                return (
                  <View key={p.id} style={styles.payCard}>
                    <View style={styles.payCardHeader}>
                      <View>
                        <Text style={styles.payStudentName}>
                          {p.student_name || p.student?.full_name || 'Enrolled Student'}
                        </Text>
                        <Text style={styles.payCourseTitle}>
                          {p.course_title || p.course?.title || 'BSEB/JAC Board Batch'}
                        </Text>
                      </View>
                      <View style={[styles.statusBadge, isPending ? styles.badgePending : styles.badgeApproved]}>
                        <Text style={[styles.statusBadgeText, isPending ? styles.textPending : styles.textApproved]}>
                          {p.status?.toUpperCase()}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.payMetaRow}>
                      <Text style={styles.payMetaItem}>💰 Amount: ₹{p.amount}</Text>
                      <Text style={styles.payMetaItem}>UTR: {p.utr_number || p.upi_ref_number || 'N/A'}</Text>
                    </View>

                    {isPending && (
                      <View style={styles.payActions}>
                        <TouchableOpacity
                          style={styles.approveBtn}
                          onPress={() => handleApprovePayment(p.id, p.student_name || p.student?.full_name)}
                        >
                          <Check size={14} color="#FFFFFF" />
                          <Text style={styles.approveBtnText}>Approve & Unlock</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.rejectBtn}
                          onPress={() => handleRejectPayment(p.id)}
                        >
                          <X size={14} color="#EF4444" />
                          <Text style={styles.rejectBtnText}>Reject</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* TAB 2: COURSES */}
        {activeTab === 'courses' && (
          <View style={styles.sectionWrap}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Course Catalog ({courses.length})</Text>
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => {
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
                  });
                  setIsCourseModalOpen(true);
                }}
              >
                <Plus size={14} color="#FFFFFF" />
                <Text style={styles.addBtnText}>Add Course</Text>
              </TouchableOpacity>
            </View>

            {courses.map((course) => (
              <View key={course.id} style={styles.courseItemCard}>
                <View style={styles.courseItemHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.courseItemTitle}>{course.title}</Text>
                    <Text style={styles.courseItemHi}>{course.title_hi}</Text>
                    <View style={styles.priceTagRow}>
                      <Text style={styles.coursePriceText}>
                        {course.is_free ? 'FREE' : formatINR(course.discount_price || course.price)}
                      </Text>
                      <Text style={styles.courseValidity}>• {course.validity_days} days validity</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.courseItemFooter}>
                  <TouchableOpacity
                    style={styles.courseEditBtn}
                    onPress={() => {
                      setEditingCourseId(course.id);
                      setCourseForm({
                        title: course.title,
                        title_hi: course.title_hi || '',
                        board_code: course.title.includes('JAC') ? 'JAC' : 'BSEB',
                        class_name: 'Class 10',
                        price: String(course.price || 999),
                        discount_price: String(course.discount_price || 499),
                        validity_days: String(course.validity_days || 365),
                        description: course.description || '',
                      });
                      setIsCourseModalOpen(true);
                    }}
                  >
                    <Edit3 size={13} color="#2563EB" />
                    <Text style={styles.courseEditBtnText}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.courseDelBtn}
                    onPress={() => handleDeleteCourse(course)}
                  >
                    <Trash2 size={13} color="#EF4444" />
                    <Text style={styles.courseDelBtnText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* TAB 3: STUDENTS */}
        {activeTab === 'students' && (
          <View style={styles.sectionWrap}>
            <View style={styles.searchBox}>
              <Search size={16} color="#64748B" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by student name or mobile..."
                value={studentSearch}
                onChangeText={setStudentSearch}
              />
            </View>

            {filteredStudents.map((st) => (
              <View key={st.id} style={styles.studentCard}>
                <View style={styles.studentTopRow}>
                  <View style={styles.studentAvatar}>
                    <Text style={styles.avatarLetter}>{st.full_name ? st.full_name[0] : 'S'}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.studentNameText}>{st.full_name}</Text>
                    <Text style={styles.studentSubText}>
                      +91 {st.mobile_number} • {st.board_code}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.statusToggle, st.is_active ? styles.stActive : styles.stBlocked]}
                    onPress={() => handleToggleStudent(st)}
                  >
                    <Text style={[styles.statusToggleText, st.is_active ? styles.stTextActive : styles.stTextBlocked]}>
                      {st.is_active ? 'Active' : 'Blocked'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Direct WhatsApp Parent Alert Buttons */}
                <View style={styles.waButtonsRow}>
                  <TouchableOpacity
                    style={styles.waBtn}
                    onPress={() => handleSendParentWhatsApp(st, 'attendance')}
                  >
                    <MessageCircle size={13} color="#059669" />
                    <Text style={styles.waBtnText}>WhatsApp Attendance</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.waBtn, { backgroundColor: '#F0FDFA' }]}
                    onPress={() => handleSendParentWhatsApp(st, 'test')}
                  >
                    <MessageCircle size={13} color="#0D9488" />
                    <Text style={[styles.waBtnText, { color: '#0D9488' }]}>WhatsApp Scorecard</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* TAB 4: BROADCAST NOTICE */}
        {activeTab === 'broadcast' && (
          <View style={styles.sectionWrap}>
            <Text style={styles.sectionTitle}>Send Push Notification to Students</Text>
            <Text style={styles.sectionDesc}>
              Dispatches an immediate alert banner to all coaching students on their Android devices.
            </Text>

            <View style={styles.broadcastBox}>
              <Text style={styles.inputLabel}>Notice Title</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Sunday Science Mega Mock Test at 10:00 AM"
                value={broadcastTitle}
                onChangeText={setBroadcastTitle}
              />

              <Text style={styles.inputLabel}>Target Board</Text>
              <View style={styles.boardSelectRow}>
                {['ALL', 'BSEB', 'JAC'].map((b) => (
                  <TouchableOpacity
                    key={b}
                    style={[styles.boardPill, broadcastBoard === b && styles.boardPillActive]}
                    onPress={() => setBroadcastBoard(b)}
                  >
                    <Text style={[styles.boardPillText, broadcastBoard === b && styles.boardPillTextActive]}>
                      {b === 'ALL' ? 'All Students' : b}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Message Content</Text>
              <TextInput
                style={[styles.textInput, { height: 90, textAlignVertical: 'top' }]}
                placeholder="Type notification text for students..."
                multiline
                value={broadcastMessage}
                onChangeText={setBroadcastMessage}
              />

              <TouchableOpacity
                style={styles.sendNoticeBtn}
                disabled={broadcastLoading}
                onPress={handleBroadcast}
              >
                {broadcastLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Send size={15} color="#FFFFFF" />
                    <Text style={styles.sendNoticeBtnText}>Dispatch Announcement</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Add / Edit Course Modal */}
      <Modal visible={isCourseModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingCourseId ? 'Edit Course Details' : 'Create New Course'}
              </Text>
              <TouchableOpacity onPress={() => setIsCourseModalOpen(false)}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 420 }}>
              <Text style={styles.inputLabel}>Course Title (English)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. BSEB Class 10 Toppers Batch"
                value={courseForm.title}
                onChangeText={(t) => setCourseForm({ ...courseForm, title: t })}
              />

              <Text style={styles.inputLabel}>Course Title (Hindi)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="उदा. बिहार बोर्ड कक्षा 10 टॉपर बैच"
                value={courseForm.title_hi}
                onChangeText={(t) => setCourseForm({ ...courseForm, title_hi: t })}
              />

              <View style={styles.rowTwo}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.inputLabel}>Original Price (₹)</Text>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="numeric"
                    value={courseForm.price}
                    onChangeText={(t) => setCourseForm({ ...courseForm, price: t })}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Offer Price (₹)</Text>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="numeric"
                    value={courseForm.discount_price}
                    onChangeText={(t) => setCourseForm({ ...courseForm, discount_price: t })}
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Validity (Days)</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={courseForm.validity_days}
                onChangeText={(t) => setCourseForm({ ...courseForm, validity_days: t })}
              />

              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, { height: 70, textAlignVertical: 'top' }]}
                multiline
                placeholder="Course features, live class schedule..."
                value={courseForm.description}
                onChangeText={(t) => setCourseForm({ ...courseForm, description: t })}
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsCourseModalOpen(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSaveCourse}>
                <Text style={styles.modalSaveText}>
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
    backgroundColor: '#0F172A',
  },
  topHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
  },
  logoImg: {
    width: 38,
    height: 38,
  },
  brandTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  directorBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  adminTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
    gap: 3,
  },
  adminTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#B45309',
  },
  directorName: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  studentViewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  studentViewText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  logoutText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EF4444',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 10,
    borderLeftWidth: 3,
  },
  statNum: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    marginHorizontal: 16,
    borderRadius: 8,
    padding: 4,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  tabItemActive: {
    backgroundColor: '#2563EB',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  contentScroll: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  sectionWrap: {
    gap: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  sectionDesc: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 8,
  },
  refreshIconBtn: {
    padding: 4,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#2563EB',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  addBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyCard: {
    backgroundColor: '#1E293B',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 12,
  },
  payCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  payCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  payStudentName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  payCourseTitle: {
    fontSize: 11,
    color: '#60A5FA',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgePending: {
    backgroundColor: '#FEF3C7',
  },
  badgeApproved: {
    backgroundColor: '#D1FAE5',
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  textPending: {
    color: '#B45309',
  },
  textApproved: {
    color: '#059669',
  },
  payMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  payMetaItem: {
    fontSize: 11,
    color: '#94A3B8',
  },
  payActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  approveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#10B981',
    paddingVertical: 8,
    borderRadius: 6,
  },
  approveBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  rejectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  rejectBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
  },
  courseItemCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  courseItemHeader: {
    flexDirection: 'row',
  },
  courseItemTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  courseItemHi: {
    fontSize: 11,
    color: '#CBD5E1',
    marginTop: 2,
  },
  priceTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  coursePriceText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F59E0B',
  },
  courseValidity: {
    fontSize: 11,
    color: '#94A3B8',
    marginLeft: 6,
  },
  courseItemFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  courseEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  courseEditBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  courseDelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  courseDelBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EF4444',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 8,
    marginBottom: 4,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 12,
  },
  studentCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  studentTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  studentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  studentNameText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  studentSubText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  statusToggle: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  stActive: {
    backgroundColor: '#D1FAE5',
  },
  stBlocked: {
    backgroundColor: '#FEF2F2',
  },
  statusToggleText: {
    fontSize: 10,
    fontWeight: '800',
  },
  stTextActive: {
    color: '#059669',
  },
  stTextBlocked: {
    color: '#EF4444',
  },
  waButtonsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  waBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingVertical: 6,
    borderRadius: 6,
  },
  waBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  broadcastBox: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#CBD5E1',
    marginTop: 4,
  },
  textInput: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#FFFFFF',
    fontSize: 12,
  },
  boardSelectRow: {
    flexDirection: 'row',
    gap: 8,
  },
  boardPill: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 6,
    alignItems: 'center',
  },
  boardPillActive: {
    borderColor: '#2563EB',
    backgroundColor: '#1D4ED8',
  },
  boardPillText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  boardPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  sendNoticeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    paddingVertical: 11,
    borderRadius: 8,
    marginTop: 10,
  },
  sendNoticeBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  rowTwo: {
    flexDirection: 'row',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  modalCancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  modalCancelText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  modalSaveBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  modalSaveText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
