import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  ScrollView,
  Linking,
  Alert,
  Platform,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDirectorStore } from '../store/useDirectorStore';
import { academicService } from '../services/academicService';
import {
  Bell,
  Menu,
  X,
  Home,
  BookOpen,
  Video,
  FileText,
  User,
  ShieldCheck,
  CreditCard,
  Users,
  Megaphone,
  RefreshCw,
  MessageCircle,
  LogOut,
  ChevronRight,
  ExternalLink,
  Bot,
  LayoutDashboard,
  GraduationCap,
  PlaySquare,
  UserCheck,
  BarChart3,
  Settings,
  Sun,
  Moon,
  Smartphone,
  Edit3,
  Trash2,
  Lock,
} from 'lucide-react-native';
import { useAuthStore, ThemeMode } from '../store/useAuthStore';
import { useNotificationStore } from '../services/notificationService';
import { useAppTheme } from '../hooks/useAppTheme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CoachingHeaderProps {
  showStudentGreeting?: boolean;
  onRefresh?: () => void;
  isSyncing?: boolean;
}

export function CoachingHeader({
  showStudentGreeting = false,
  onRefresh,
  isSyncing = false,
}: CoachingHeaderProps) {
  const router = useRouter();
  const theme = useAppTheme();
  const { user, selectedBoard, selectedClass, themeMode, setThemeMode, logout } = useAuthStore();
  const { unreadCount, initPushNotifications } = useNotificationStore();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const isAdmin =
    user?.role === 'admin' ||
    user?.role === 'super_admin' ||
    user?.email === 'icckeguruji@gmail.com' ||
    user?.mobile_number === '9771350910' ||
    user?.username === 'badesir';

  useEffect(() => {
    initPushNotifications(user?.id, selectedBoard);
  }, [user?.id, selectedBoard]);

  const handleNavigate = (route: string) => {
    setIsDrawerOpen(false);
    router.push(route as any);
  };

  const handleOpenDirectorModal = (modalType: any, targetRoute?: string) => {
    setIsDrawerOpen(false);
    useDirectorStore.getState().openModal(modalType);
    if (targetRoute) {
      router.push(targetRoute as any);
    } else {
      router.push('/(tabs)/profile');
    }
  };

  const handleOpenWhatsApp = () => {
    setIsDrawerOpen(false);
    Linking.openURL('https://wa.me/919771350910?text=Hello%20BADE%20SIR%2C%20IDEAL%20COACHING%20CENTRE%20Query');
  };

  const handleLogout = async () => {
    Alert.alert('Confirm Logout', 'Are you sure you want to log out from your account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          setIsDrawerOpen(false);
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const isDark = theme.isDark;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.headerBg,
          borderBottomColor: theme.headerBorder,
        },
      ]}
    >
      {/* Top Brand Strip */}
      <View style={styles.topRow}>
        {/* Left: Hamburger Menu Button */}
        <TouchableOpacity
          style={[
            styles.menuButton,
            { backgroundColor: isDark ? '#141416' : '#F1F5F9' },
          ]}
          onPress={() => setIsDrawerOpen(true)}
          activeOpacity={0.7}
          accessibilityLabel="Open Navigation Menu"
        >
          <Menu size={22} color={theme.text} />
        </TouchableOpacity>

        {/* Center: Brand Logo & Title */}
        <View style={styles.brandGroup}>
          <View style={styles.logoCircle}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <View style={styles.titleColumn}>
            <Text
              style={[styles.coachingName, { color: theme.text }]}
              numberOfLines={1}
            >
              IDEAL COACHING CENTRE
            </Text>
            <Text style={styles.tagline} numberOfLines={1}>
              Board Exam 2027 • Dir: BADE SIR
            </Text>
          </View>
        </View>

        {/* Right Action Icons: Live Sync Status & Notification Bell */}
        <View style={styles.rightActions}>
          <TouchableOpacity
            style={[
              styles.syncBadge,
              { backgroundColor: isDark ? '#141416' : '#F1F5F9' },
              isSyncing && styles.syncBadgeLoading,
            ]}
            onPress={onRefresh}
            disabled={isSyncing}
            activeOpacity={0.7}
          >
            <Text style={styles.syncDot}>{isSyncing ? '🔄' : '🟢'}</Text>
            <Text
              style={[
                styles.syncText,
                { color: isDark ? '#A1A1AA' : '#475569' },
              ]}
            >
              {isSyncing ? 'Syncing' : 'Live'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.bellButton,
              { backgroundColor: isDark ? '#141416' : '#F1F5F9' },
            ]}
            onPress={() => router.push('/notifications')}
            activeOpacity={0.7}
            accessibilityLabel="Notifications"
          >
            <Bell size={18} color={theme.text} />
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Student Greeting & Class/Points Strip */}
      {showStudentGreeting && (
        <View
          style={[
            styles.greetingRow,
            { borderTopColor: isDark ? '#1F2937' : '#F1F5F9' },
          ]}
        >
          <View style={{ flex: 1 }}>
            <Text style={[styles.welcomeText, { color: theme.textSecondary }]}>
              {user ? 'Welcome back,' : 'Welcome to ICC,'}
            </Text>
            <Text
              style={[styles.studentName, { color: theme.text }]}
              numberOfLines={1}
            >
              {user?.full_name || 'Guest Student'}
            </Text>
          </View>

          <View style={styles.pillGroup}>
            {!user ? (
              <TouchableOpacity
                style={{ backgroundColor: '#2563EB', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}
                onPress={() => router.push('/(auth)/login')}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700' }}>Login</Text>
              </TouchableOpacity>
            ) : !isAdmin ? (
              <View style={styles.boardPill}>
                <Text style={styles.boardPillText}>🏆 {user?.quiz_points || 0} PTS</Text>
              </View>
            ) : null}
            <View
              style={[
                styles.classPill,
                { backgroundColor: isDark ? '#18181B' : '#F1F5F9' },
              ]}
            >
              <Text style={[styles.classPillText, { color: theme.textSecondary }]}>
                {selectedClass || 'Class 10'}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Slide-out Hamburger Drawer Modal */}
      <Modal
        visible={isDrawerOpen}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsDrawerOpen(false)}
      >
        <View style={styles.modalOverlay}>
          {/* Backdrop (Tapping dismisses drawer) */}
          <TouchableOpacity
            style={styles.backdropTouch}
            activeOpacity={1}
            onPress={() => setIsDrawerOpen(false)}
          />

          {/* Drawer Sidebar Container with Guaranteed Bounded Dimensions */}
          <View
            style={[
              styles.drawerContainer,
              {
                backgroundColor: isDark ? '#050505' : '#FFFFFF',
                borderRightColor: isDark ? '#27272A' : '#E2E8F0',
              },
            ]}
          >
            {/* Drawer Header */}
            <View
              style={[
                styles.drawerHeader,
                {
                  backgroundColor: isDark ? '#000000' : '#F8FAFC',
                  borderBottomColor: isDark ? '#27272A' : '#E2E8F0',
                },
              ]}
            >
              <View style={styles.drawerHeaderLeft}>
                <Image
                  source={require('../../assets/logo.png')}
                  style={styles.drawerLogo}
                  resizeMode="contain"
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={[styles.drawerTitle, { color: theme.text }]}
                    numberOfLines={1}
                  >
                    {user?.full_name || 'Guest Learner'}
                  </Text>
                  <Text style={styles.drawerSubtitle} numberOfLines={1}>
                    {isAdmin
                      ? 'Director / Admin'
                      : user
                      ? user.mobile_number
                        ? `+91 ${user.mobile_number}`
                        : user.email || 'Student Account'
                      : 'Not Logged In • Browse Mode'}
                  </Text>
                </View>
                {user && (
                  <TouchableOpacity
                    style={[styles.closeBtn, { backgroundColor: isDark ? '#1E293B' : '#EFF6FF', marginRight: 6 }]}
                    onPress={() => handleNavigate('/(tabs)/profile?edit=1')}
                    accessibilityLabel="Edit Profile"
                  >
                    <Edit3 size={16} color="#2563EB" />
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity
                style={[
                  styles.closeBtn,
                  { backgroundColor: isDark ? '#18181B' : '#F1F5F9' },
                ]}
                onPress={() => setIsDrawerOpen(false)}
                activeOpacity={0.7}
                accessibilityLabel="Close Navigation Menu"
              >
                <X size={18} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Scrollable Navigation Body */}
            <ScrollView
              style={styles.drawerScrollView}
              contentContainerStyle={styles.drawerScrollContent}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
              bounces={true}
              overScrollMode="always"
              keyboardShouldPersistTaps="handled"
              removeClippedSubviews={false}
            >
              {/* Dynamic Navigation Section: All Admin features in Hamburger Menu for Admin, Academic Sections for Students */}
              {isAdmin ? (
                <>
                  {/* ICC AI Assistant */}
                  <TouchableOpacity
                    style={[
                      styles.menuItem,
                      {
                        backgroundColor: isDark ? '#121212' : '#EFF6FF',
                        borderRadius: 12,
                        marginVertical: 4,
                      },
                    ]}
                    onPress={() => handleOpenDirectorModal('ai_copilot')}
                  >
                    <View style={[styles.menuIconBox, { backgroundColor: '#2563EB' }]}>
                      <Bot size={18} color="#FFFFFF" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.menuItemText, { color: '#3B82F6', fontWeight: '800' }]}>
                        ICC AI Assistant
                      </Text>
                      <Text style={styles.menuItemSubText}>Voice/text autonomous actions</Text>
                    </View>
                    <ChevronRight size={16} color="#3B82F6" />
                  </TouchableOpacity>

                  {/* Dashboard */}
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => handleNavigate('/(tabs)')}
                  >
                    <View style={[styles.menuIconBox, { backgroundColor: '#EEF2FF' }]}>
                      <LayoutDashboard size={18} color="#4F46E5" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.menuItemText, { color: theme.text }]}>Dashboard</Text>
                      <Text style={styles.menuItemSubText}>Overview, active metrics & live stats</Text>
                    </View>
                    <ChevronRight size={16} color={theme.textMuted} />
                  </TouchableOpacity>

                  {/* Students */}
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => handleOpenDirectorModal('student')}
                  >
                    <View style={[styles.menuIconBox, { backgroundColor: '#EFF6FF' }]}>
                      <Users size={18} color="#2563EB" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.menuItemText, { color: theme.text }]}>Students</Text>
                      <Text style={styles.menuItemSubText}>Student directory, profiles & WhatsApp</Text>
                    </View>
                    <ChevronRight size={16} color={theme.textMuted} />
                  </TouchableOpacity>

                  {/* Courses & Batches */}
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => handleNavigate('/(tabs)/courses')}
                  >
                    <View style={[styles.menuIconBox, { backgroundColor: '#FAF5FF' }]}>
                      <BookOpen size={18} color="#9333EA" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.menuItemText, { color: theme.text }]}>Courses & Batches</Text>
                      <Text style={styles.menuItemSubText}>Curriculum hierarchy, chapters & lectures</Text>
                    </View>
                    <ChevronRight size={16} color={theme.textMuted} />
                  </TouchableOpacity>

                  {/* YouTube Direct Go Live */}
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => handleNavigate('/admin/go-live')}
                  >
                    <View style={[styles.menuIconBox, { backgroundColor: '#FEF2F2' }]}>
                      <Video size={18} color="#DC2626" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.menuItemText, { color: theme.text }]}>YouTube Go Live</Text>
                      <Text style={styles.menuItemSubText}>Connect channel, schedule & go live from app</Text>
                    </View>
                    <ChevronRight size={16} color={theme.textMuted} />
                  </TouchableOpacity>

                  {/* Live Classes */}
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => handleOpenDirectorModal('live_classes')}
                  >
                    <View style={[styles.menuIconBox, { backgroundColor: '#FEF2F2' }]}>
                      <Video size={18} color="#DC2626" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.menuItemText, { color: theme.text }]}>Live Classes</Text>
                      <Text style={styles.menuItemSubText}>Broadcast YouTube Live sessions</Text>
                    </View>
                    <ChevronRight size={16} color={theme.textMuted} />
                  </TouchableOpacity>

                  {/* Notes & PDFs */}
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => handleNavigate('/(tabs)/notes')}
                  >
                    <View style={[styles.menuIconBox, { backgroundColor: '#F0FDF4' }]}>
                      <FileText size={18} color="#059669" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.menuItemText, { color: theme.text }]}>Notes & PDFs</Text>
                      <Text style={styles.menuItemSubText}>Upload & manage handwritten notes</Text>
                    </View>
                    <ChevronRight size={16} color={theme.textMuted} />
                  </TouchableOpacity>

                  {/* Payments & UTR */}
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => handleOpenDirectorModal('payment')}
                  >
                    <View style={[styles.menuIconBox, { backgroundColor: '#FEF3C7' }]}>
                      <CreditCard size={18} color="#D97706" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.menuItemText, { color: theme.text }]}>Payments & UTR</Text>
                      <Text style={styles.menuItemSubText}>Verify UPI payments & unlock courses</Text>
                    </View>
                    <ChevronRight size={16} color={theme.textMuted} />
                  </TouchableOpacity>

                  {/* Push Notifications */}
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => handleOpenDirectorModal('broadcast')}
                  >
                    <View style={[styles.menuIconBox, { backgroundColor: '#FDF4FF' }]}>
                      <Megaphone size={18} color="#A855F7" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.menuItemText, { color: theme.text }]}>Push Notifications</Text>
                      <Text style={styles.menuItemSubText}>Send instant broadcast announcements</Text>
                    </View>
                    <ChevronRight size={16} color={theme.textMuted} />
                  </TouchableOpacity>

                  {/* WhatsApp AI Bot */}
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => handleOpenDirectorModal('whatsapp_bot')}
                  >
                    <View style={[styles.menuIconBox, { backgroundColor: '#ECFDF5' }]}>
                      <MessageCircle size={18} color="#10B981" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.menuItemText, { color: theme.text }]}>WhatsApp AI Bot</Text>
                      <Text style={styles.menuItemSubText}>Active 24/7 automated assistant</Text>
                    </View>
                    <ChevronRight size={16} color={theme.textMuted} />
                  </TouchableOpacity>

                  {/* Teachers CRUD */}
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => handleNavigate('/admin/teachers')}
                  >
                    <View style={[styles.menuIconBox, { backgroundColor: '#F1F5F9' }]}>
                      <UserCheck size={18} color="#475569" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.menuItemText, { color: theme.text }]}>Teachers & Faculty</Text>
                      <Text style={styles.menuItemSubText}>Add, edit & delete faculty records</Text>
                    </View>
                    <ChevronRight size={16} color={theme.textMuted} />
                  </TouchableOpacity>

                  {/* Reports */}
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => handleOpenDirectorModal('quota_reports')}
                  >
                    <View style={[styles.menuIconBox, { backgroundColor: '#EFF6FF' }]}>
                      <BarChart3 size={18} color="#2563EB" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.menuItemText, { color: theme.text }]}>Reports</Text>
                      <Text style={styles.menuItemSubText}>Academic analytics & collection summaries</Text>
                    </View>
                    <ChevronRight size={16} color={theme.textMuted} />
                  </TouchableOpacity>

                  {/* Edit Profile & Settings */}
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => handleNavigate('/(tabs)/profile')}
                  >
                    <View style={[styles.menuIconBox, { backgroundColor: isDark ? '#18181B' : '#F1F5F9' }]}>
                      <Settings size={18} color={theme.textSecondary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.menuItemText, { color: theme.text }]}>Profile & Settings</Text>
                      <Text style={styles.menuItemSubText}>Edit profile, password & preferences</Text>
                    </View>
                    <ChevronRight size={16} color={theme.textMuted} />
                  </TouchableOpacity>

                  {/* Sync Latest Data */}
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={async () => {
                      setIsDrawerOpen(false);
                      try {
                        await academicService.syncFromCloud();
                        if (onRefresh) onRefresh();
                        Alert.alert('☁️ Sync Complete', 'All courses, live classes and study materials are up to date.');
                      } catch {
                        Alert.alert('Synced', 'Local cache synchronized.');
                      }
                    }}
                  >
                    <View style={[styles.menuIconBox, { backgroundColor: '#ECFDF5' }]}>
                      <RefreshCw size={18} color="#059669" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.menuItemText, { color: theme.text }]}>Sync Latest Data</Text>
                      <Text style={styles.menuItemSubText}>Refresh all course and schedule data</Text>
                    </View>
                    <ChevronRight size={16} color={theme.textMuted} />
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.menuSectionHeading}>ACADEMIC SECTIONS</Text>

                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => handleNavigate('/(tabs)')}
                  >
                    <View style={[styles.menuIconBox, { backgroundColor: '#EFF6FF' }]}>
                      <Home size={18} color="#2563EB" />
                    </View>
                    <Text style={[styles.menuItemText, { color: theme.text }]}>Home Dashboard</Text>
                    <ChevronRight size={16} color={theme.textMuted} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => handleNavigate('/(tabs)/courses')}
                  >
                    <View style={[styles.menuIconBox, { backgroundColor: '#FDF4FF' }]}>
                      <BookOpen size={18} color="#9333EA" />
                    </View>
                    <Text style={[styles.menuItemText, { color: theme.text }]}>Target Courses</Text>
                    <ChevronRight size={16} color={theme.textMuted} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => handleNavigate('/(tabs)/live')}
                  >
                    <View style={[styles.menuIconBox, { backgroundColor: '#FEF2F2' }]}>
                      <Video size={18} color="#DC2626" />
                    </View>
                    <Text style={[styles.menuItemText, { color: theme.text }]}>Live Masterclasses</Text>
                    <ChevronRight size={16} color={theme.textMuted} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => handleNavigate('/(tabs)/notes')}
                  >
                    <View style={[styles.menuIconBox, { backgroundColor: '#F0FDF4' }]}>
                      <FileText size={18} color="#059669" />
                    </View>
                    <Text style={[styles.menuItemText, { color: theme.text }]}>Study Materials & PDF</Text>
                    <ChevronRight size={16} color={theme.textMuted} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => handleNavigate('/assignments')}
                  >
                    <View style={[styles.menuIconBox, { backgroundColor: '#EEF2FF' }]}>
                      <FileText size={18} color="#4F46E5" />
                    </View>
                    <Text style={[styles.menuItemText, { color: theme.text }]}>Assignments & Homework</Text>
                    <ChevronRight size={16} color={theme.textMuted} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => handleNavigate('/(tabs)/profile')}
                  >
                    <View style={[styles.menuIconBox, { backgroundColor: isDark ? '#18181B' : '#F1F5F9' }]}>
                      <User size={18} color={theme.textSecondary} />
                    </View>
                    <Text style={[styles.menuItemText, { color: theme.text }]}>My Profile & Settings</Text>
                    <ChevronRight size={16} color={theme.textMuted} />
                  </TouchableOpacity>
                </>
              )}

              {/* Support & Helpline */}
              <View
                style={[
                  styles.adminDivider,
                  { backgroundColor: isDark ? '#27272A' : '#E2E8F0' },
                ]}
              />
              <Text style={styles.menuSectionHeading}>SUPPORT & HELPLINE</Text>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleOpenWhatsApp}
              >
                <View style={[styles.menuIconBox, { backgroundColor: '#DCFCE7' }]}>
                  <MessageCircle size={18} color="#16A34A" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.menuItemText, { color: theme.text }]}>
                    WhatsApp Support
                  </Text>
                  <Text style={styles.menuItemSubText}>
                    +91 9771350910 • Chat on WhatsApp
                  </Text>
                </View>
                <ExternalLink size={16} color="#16A34A" />
              </TouchableOpacity>

              {/* Compact Theme Switcher at Drawer Bottom */}
              <View
                style={[
                  styles.themeBox,
                  {
                    backgroundColor: isDark ? '#121212' : '#F8FAFC',
                    borderColor: isDark ? '#27272A' : '#E2E8F0',
                    marginTop: 10,
                  },
                ]}
              >
                <View style={styles.themeToggleRow}>
                  <TouchableOpacity
                    style={[
                      styles.themePill,
                      themeMode === 'auto' && styles.themePillActive,
                      { borderColor: isDark ? '#27272A' : '#CBD5E1' },
                    ]}
                    onPress={() => setThemeMode('auto')}
                    activeOpacity={0.7}
                  >
                    <Smartphone size={12} color={themeMode === 'auto' ? '#FFFFFF' : theme.textSecondary} />
                    <Text style={[styles.themePillText, { color: themeMode === 'auto' ? '#FFFFFF' : theme.textSecondary }]}>Auto</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.themePill,
                      themeMode === 'light' && styles.themePillActive,
                      { borderColor: isDark ? '#27272A' : '#CBD5E1' },
                    ]}
                    onPress={() => setThemeMode('light')}
                    activeOpacity={0.7}
                  >
                    <Sun size={12} color={themeMode === 'light' ? '#FFFFFF' : theme.textSecondary} />
                    <Text style={[styles.themePillText, { color: themeMode === 'light' ? '#FFFFFF' : theme.textSecondary }]}>Light</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.themePill,
                      themeMode === 'dark' && styles.themePillActive,
                      { borderColor: isDark ? '#27272A' : '#CBD5E1' },
                    ]}
                    onPress={() => setThemeMode('dark')}
                    activeOpacity={0.7}
                  >
                    <Moon size={12} color={themeMode === 'dark' ? '#FFFFFF' : theme.textSecondary} />
                    <Text style={[styles.themePillText, { color: themeMode === 'dark' ? '#FFFFFF' : theme.textSecondary }]}>Dark</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Logout / Login Button */}
              {!user ? (
                <TouchableOpacity
                  style={[
                    styles.logoutBtn,
                    { backgroundColor: '#2563EB' },
                  ]}
                  onPress={() => {
                    setIsDrawerOpen(false);
                    router.push('/(auth)/login');
                  }}
                  activeOpacity={0.8}
                >
                  <Lock size={18} color="#FFFFFF" />
                  <Text style={[styles.logoutBtnText, { color: '#FFFFFF' }]}>Log In / Register</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.logoutBtn,
                    { backgroundColor: isDark ? '#200A0A' : '#FEE2E2' },
                  ]}
                  onPress={handleLogout}
                  activeOpacity={0.8}
                >
                  <LogOut size={18} color="#EF4444" />
                  <Text style={styles.logoutBtnText}>Log Out from Account</Text>
                </TouchableOpacity>
              )}

              <View
                style={[
                  styles.drawerFooter,
                  { borderTopColor: isDark ? '#1F2937' : '#F1F5F9' },
                ]}
              >
                <Text style={styles.footerBrand}>IDEAL COACHING CENTRE • v2.5.0</Text>
                <Text style={styles.footerLocation}>Sarotiya, Mahagama, Godda (JH) 814165</Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  menuButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
  logoCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  logo: {
    width: 32,
    height: 32,
  },
  titleColumn: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  coachingName: {
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 16,
    letterSpacing: 0.2,
  },
  tagline: {
    fontSize: 9,
    fontWeight: '700',
    color: '#D97706',
    lineHeight: 12,
    marginTop: 1,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  syncBadgeLoading: {
    opacity: 0.7,
  },
  syncDot: {
    fontSize: 10,
  },
  syncText: {
    fontSize: 11,
    fontWeight: '700',
  },
  bellButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  unreadBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    marginTop: 8,
    borderTopWidth: 1,
  },
  welcomeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  studentName: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 1,
  },
  pillGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  boardPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  boardPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E40AF',
  },
  classPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  classPillText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Modal & Drawer Styles (Bounded for 100% Android Smooth Scroll)
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
  },
  backdropTouch: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  drawerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: Math.min(SCREEN_WIDTH * 0.85, 330),
    height: SCREEN_HEIGHT,
    maxHeight: SCREEN_HEIGHT,
    paddingTop: Platform.OS === 'ios' ? 52 : 36,
    borderRightWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 25,
    display: 'flex',
    flexDirection: 'column',
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  drawerHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  drawerLogo: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  drawerTitle: {
    fontSize: 14,
    fontWeight: '900',
  },
  drawerSubtitle: {
    fontSize: 10,
    color: '#D97706',
    fontWeight: '700',
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
  },
  drawerScrollView: {
    flex: 1,
    height: '100%',
  },
  drawerScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 140, // High bottom padding ensures bottom elements scroll above screen edge
    flexGrow: 1,
  },
  userCard: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  userCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  userName: {
    fontSize: 14,
    fontWeight: '800',
  },
  userPhone: {
    fontSize: 11,
    marginTop: 1,
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    borderTopWidth: 1,
  },
  adminRoleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  adminRoleText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
  },
  studentRoleBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  studentRoleText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  ptsBadge: {
    backgroundColor: '#FEF9C3',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  ptsBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#A16207',
  },
  themeBox: {
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    marginBottom: 14,
  },
  themeLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  themeToggleRow: {
    flexDirection: 'row',
    gap: 6,
  },
  themePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  themePillActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  themePillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  themePillTextActive: {
    color: '#FFFFFF',
  },
  menuSectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginBottom: 3,
  },
  menuIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemText: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  menuItemSubText: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1,
  },
  adminDivider: {
    height: 1,
    marginVertical: 12,
  },
  adminHeaderBox: {
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  adminHeaderHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D97706',
  },
  adminHeaderSub: {
    fontSize: 9,
    marginTop: 1,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 11,
    borderRadius: 10,
    marginTop: 16,
  },
  logoutBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#EF4444',
  },
  drawerFooter: {
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  footerBrand: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
  },
  footerLocation: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 2,
  },
});
