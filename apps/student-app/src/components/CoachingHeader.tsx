import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Modal, ScrollView, Linking } from 'react-native';
import { useRouter } from 'expo-router';
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
} from 'lucide-react-native';
import { useAuthStore } from '../store/useAuthStore';
import { useNotificationStore } from '../services/notificationService';

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
  const { user, selectedBoard, selectedClass, logout } = useAuthStore();
  const { unreadCount, initPushNotifications } = useNotificationStore();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const isAdmin =
    user?.role === 'admin' ||
    user?.role === 'super_admin' ||
    user?.role === 'teacher' ||
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

  const handleOpenWhatsApp = () => {
    setIsDrawerOpen(false);
    Linking.openURL('https://wa.me/919771350910?text=Namaste%20BADE%20SIR%2C%20IDEAL%20COACHING%20CENTRE%20Query');
  };

  const handleLogout = async () => {
    setIsDrawerOpen(false);
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      {/* Top Brand Strip */}
      <View style={styles.topRow}>
        {/* Left: Hamburger Menu Button */}
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setIsDrawerOpen(true)}
          activeOpacity={0.7}
          accessibilityLabel="Open Navigation Menu"
        >
          <Menu size={22} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.brandGroup}>
          <View style={styles.logoCircle}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <View style={styles.titleColumn}>
            <Text style={styles.coachingName}>IDEAL COACHING CENTRE</Text>
            <Text style={styles.tagline}>
              Board Exam 2027 • Dir: BADE SIR
            </Text>
          </View>
        </View>

        {/* Right Action Icons: Live Sync Status & Notification Bell */}
        <View style={styles.rightActions}>
          <TouchableOpacity
            style={[styles.syncBadge, isSyncing && styles.syncBadgeLoading]}
            onPress={onRefresh}
            disabled={isSyncing}
            activeOpacity={0.7}
          >
            <Text style={styles.syncDot}>{isSyncing ? '🔄' : '🟢'}</Text>
            <Text style={styles.syncText}>{isSyncing ? 'Syncing...' : 'Live'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bellButton}
            onPress={() => router.push('/notifications')}
            activeOpacity={0.7}
            accessibilityLabel="Notifications"
          >
            <Bell size={18} color="#334155" />
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

      {/* Student Greeting & Class/Board Pills (If requested) */}
      {showStudentGreeting && (
        <View style={styles.greetingRow}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.studentName}>{user?.full_name || 'Student'}</Text>
          </View>

          <View style={styles.pillGroup}>
            <View style={styles.boardPill}>
              <Text style={styles.boardPillText}>🏆 {user?.quiz_points || 0} PTS</Text>
            </View>
            <View style={styles.classPill}>
              <Text style={styles.classPillText}>{selectedClass || 'Class 10'}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Slide-out Hamburger Drawer Modal */}
      <Modal
        visible={isDrawerOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsDrawerOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.drawerContainer}>
            {/* Drawer Header */}
            <View style={styles.drawerHeader}>
              <View style={styles.drawerHeaderLeft}>
                <Image
                  source={require('../../assets/logo.png')}
                  style={styles.drawerLogo}
                  resizeMode="contain"
                />
                <View>
                  <Text style={styles.drawerTitle}>IDEAL COACHING</Text>
                  <Text style={styles.drawerSubtitle}>Director: BADE SIR (9771350910)</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setIsDrawerOpen(false)}
                activeOpacity={0.7}
              >
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.drawerScroll}>
              {/* Profile Card */}
              <View style={styles.userCard}>
                <View style={styles.userCardTop}>
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarLetter}>
                      {(user?.full_name || 'U').charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.userName}>{user?.full_name || 'Student'}</Text>
                    <Text style={styles.userPhone}>{user?.mobile_number || user?.email || 'Student Account'}</Text>
                  </View>
                </View>
                <View style={styles.roleRow}>
                  {isAdmin ? (
                    <View style={styles.adminRoleBadge}>
                      <ShieldCheck size={12} color="#B45309" />
                      <Text style={styles.adminRoleText}>Director / Admin</Text>
                    </View>
                  ) : (
                    <View style={styles.studentRoleBadge}>
                      <Text style={styles.studentRoleText}>🎓 Matric Batch 2027</Text>
                    </View>
                  )}
                  <View style={styles.ptsBadge}>
                    <Text style={styles.ptsBadgeText}>🏆 {user?.quiz_points || 0} PTS</Text>
                  </View>
                </View>
              </View>

              {/* Navigation Section */}
              <Text style={styles.menuSectionHeading}>QUICK NAVIGATION</Text>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleNavigate('/(tabs)')}
              >
                <View style={[styles.menuIconBox, { backgroundColor: '#EFF6FF' }]}>
                  <Home size={18} color="#2563EB" />
                </View>
                <Text style={styles.menuItemText}>Home Dashboard</Text>
                <ChevronRight size={16} color="#CBD5E1" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleNavigate('/(tabs)/courses')}
              >
                <View style={[styles.menuIconBox, { backgroundColor: '#FDF4FF' }]}>
                  <BookOpen size={18} color="#9333EA" />
                </View>
                <Text style={styles.menuItemText}>Target Batch Courses</Text>
                <ChevronRight size={16} color="#CBD5E1" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleNavigate('/(tabs)/live')}
              >
                <View style={[styles.menuIconBox, { backgroundColor: '#FEF2F2' }]}>
                  <Video size={18} color="#DC2626" />
                </View>
                <Text style={styles.menuItemText}>Live Masterclasses</Text>
                <ChevronRight size={16} color="#CBD5E1" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleNavigate('/(tabs)/notes')}
              >
                <View style={[styles.menuIconBox, { backgroundColor: '#F0FDF4' }]}>
                  <FileText size={18} color="#059669" />
                </View>
                <Text style={styles.menuItemText}>Study Materials & PDF</Text>
                <ChevronRight size={16} color="#CBD5E1" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleNavigate('/(tabs)/profile')}
              >
                <View style={[styles.menuIconBox, { backgroundColor: '#F1F5F9' }]}>
                  <User size={18} color="#475569" />
                </View>
                <Text style={styles.menuItemText}>My Profile & Settings</Text>
                <ChevronRight size={16} color="#CBD5E1" />
              </TouchableOpacity>

              {/* Admin / Director Quick Actions */}
              {isAdmin && (
                <>
                  <View style={styles.adminDivider} />
                  <View style={styles.adminHeaderBox}>
                    <Text style={styles.adminHeaderHeading}>👑 DIRECTOR CONTROLS (BADE SIR)</Text>
                    <Text style={styles.adminHeaderSub}>Full administrative management inside app</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => handleNavigate('/(tabs)/profile')}
                  >
                    <View style={[styles.menuIconBox, { backgroundColor: '#FEF3C7' }]}>
                      <CreditCard size={18} color="#D97706" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.menuItemText}>UPI Fee Approvals</Text>
                      <Text style={styles.menuItemSubText}>Verify student payments & unlock courses</Text>
                    </View>
                    <ChevronRight size={16} color="#CBD5E1" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => handleNavigate('/(tabs)/profile')}
                  >
                    <View style={[styles.menuIconBox, { backgroundColor: '#EFF6FF' }]}>
                      <Users size={18} color="#2563EB" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.menuItemText}>Student Directory</Text>
                      <Text style={styles.menuItemSubText}>View all students, progress & WhatsApp reports</Text>
                    </View>
                    <ChevronRight size={16} color="#CBD5E1" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => handleNavigate('/(tabs)/profile')}
                  >
                    <View style={[styles.menuIconBox, { backgroundColor: '#FDF2F8' }]}>
                      <Megaphone size={18} color="#DB2777" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.menuItemText}>Broadcast Announcement</Text>
                      <Text style={styles.menuItemSubText}>Send instant push notice to all students</Text>
                    </View>
                    <ChevronRight size={16} color="#CBD5E1" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {
                      setIsDrawerOpen(false);
                      if (onRefresh) onRefresh();
                    }}
                  >
                    <View style={[styles.menuIconBox, { backgroundColor: '#ECFDF5' }]}>
                      <RefreshCw size={18} color="#059669" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.menuItemText}>Force Cloud Database Sync</Text>
                      <Text style={styles.menuItemSubText}>Sync Supabase courses, subjects & live classes</Text>
                    </View>
                    <ChevronRight size={16} color="#CBD5E1" />
                  </TouchableOpacity>
                </>
              )}

              {/* Support & Community Section */}
              <View style={styles.adminDivider} />
              <Text style={styles.menuSectionHeading}>SUPPORT & HELPLINE</Text>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleOpenWhatsApp}
              >
                <View style={[styles.menuIconBox, { backgroundColor: '#DCFCE7' }]}>
                  <MessageCircle size={18} color="#16A34A" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.menuItemText}>Director WhatsApp Helpline</Text>
                  <Text style={styles.menuItemSubText}>+91 9771350910 • Direct Chat with BADE SIR</Text>
                </View>
                <ExternalLink size={16} color="#16A34A" />
              </TouchableOpacity>

              {/* Logout Button */}
              <TouchableOpacity
                style={styles.logoutBtn}
                onPress={handleLogout}
                activeOpacity={0.8}
              >
                <LogOut size={18} color="#EF4444" />
                <Text style={styles.logoutBtnText}>Log Out from Account</Text>
              </TouchableOpacity>

              <View style={styles.drawerFooter}>
                <Text style={styles.footerBrand}>IDEAL COACHING CENTRE • v2.4.0</Text>
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
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  menuButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  logoCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
    overflow: 'hidden',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  titleColumn: {
    justifyContent: 'center',
    flex: 1,
  },
  coachingName: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.2,
  },
  tagline: {
    fontSize: 10,
    color: '#D97706',
    fontWeight: '700',
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
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  syncBadgeLoading: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  syncDot: {
    fontSize: 9,
  },
  syncText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#047857',
  },
  bellButton: {
    position: 'relative',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  unreadBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    lineHeight: 11,
  },
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  welcomeText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  studentName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  pillGroup: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
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
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  classPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },

  // Drawer Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-start',
  },
  drawerContainer: {
    width: '84%',
    maxWidth: 340,
    height: '100%',
    backgroundColor: '#FFFFFF',
    paddingTop: 45,
    paddingHorizontal: 16,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 16,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  drawerHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  drawerLogo: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  drawerTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
  },
  drawerSubtitle: {
    fontSize: 10,
    color: '#D97706',
    fontWeight: '700',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  drawerScroll: {
    paddingTop: 14,
    paddingBottom: 40,
  },
  userCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
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
    color: '#0F172A',
  },
  userPhone: {
    fontSize: 11,
    color: '#64748B',
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
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
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginBottom: 4,
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
    color: '#1E293B',
    flex: 1,
  },
  menuItemSubText: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  adminDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  adminHeaderBox: {
    backgroundColor: '#FFFBEB',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  adminHeaderHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B45309',
  },
  adminHeaderSub: {
    fontSize: 9,
    color: '#92400E',
    marginTop: 1,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
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
    borderTopColor: '#F1F5F9',
  },
  footerBrand: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
  },
  footerLocation: {
    fontSize: 9,
    color: '#CBD5E1',
    marginTop: 2,
  },
});
