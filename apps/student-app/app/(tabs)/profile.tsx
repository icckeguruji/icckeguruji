import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/useAuthStore';
import { CoachingHeader } from '../../src/components/CoachingHeader';
import {
  User,
  ShieldCheck,
  Moon,
  Info,
  LogOut,
  Phone,
  Mail,
  ChevronRight,
  GraduationCap,
} from 'lucide-react-native';

export default function StudentProfileScreen() {
  const router = useRouter();
  const {
    user,
    selectedBoard,
    setBoard,
    isDarkMode,
    toggleDarkMode,
    logout,
  } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out of your ICC student account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Branded Coaching Header with Logo & Name */}
      <CoachingHeader />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Student Profile</Text>
        <Text style={styles.headerSub}>
          Student account, board settings and DRM security status
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.full_name ? user.full_name[0].toUpperCase() : 'S'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{user?.full_name || 'Rohit Kumar'}</Text>
            <Text style={styles.userSub}>@{user?.username || 'rohit_kumar'}</Text>
            <View style={styles.contactRow}>
              <Phone size={12} color="#64748B" />
              <Text style={styles.userContact}>+91 {user?.mobile_number || '9876543210'}</Text>
            </View>
            <View style={styles.contactRow}>
              <Mail size={12} color="#64748B" />
              <Text style={styles.userEmail}>{user?.email || 'rohit.kumar@example.com'}</Text>
            </View>
          </View>
        </View>

        {/* Board Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <GraduationCap size={16} color="#2563EB" />
            <Text style={styles.sectionTitle}>Academic Board</Text>
          </View>
          <View style={styles.chipRow}>
            <TouchableOpacity
              style={[styles.chip, selectedBoard === 'BSEB' && styles.chipActive]}
              onPress={() => setBoard('BSEB')}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, selectedBoard === 'BSEB' && styles.chipTextActive]}>
                Bihar Board (BSEB)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.chip, selectedBoard === 'JAC' && styles.chipActive]}
              onPress={() => setBoard('JAC')}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, selectedBoard === 'JAC' && styles.chipTextActive]}>
                Jharkhand Board (JAC)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* General Options */}
        <View style={styles.menuSection}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() =>
              Alert.alert(
                'ICC Anti-Piracy Protection',
                'Your account is secured with ICC DRM. Screen recording, screenshots, external video links, and local file downloads are disabled to protect course content.'
              )
            }
          >
            <View style={styles.menuLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#ECFDF5' }]}>
                <ShieldCheck size={18} color="#059669" />
              </View>
              <View>
                <Text style={styles.menuItemText}>Content DRM & Security</Text>
                <Text style={styles.menuItemSub}>Screenshots & recording blocked</Text>
              </View>
            </View>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={toggleDarkMode}>
            <View style={styles.menuLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#F1F5F9' }]}>
                <Moon size={18} color="#475569" />
              </View>
              <View>
                <Text style={styles.menuItemText}>Theme Appearance</Text>
                <Text style={styles.menuItemSub}>{isDarkMode ? 'Dark theme enabled' : 'Light theme'}</Text>
              </View>
            </View>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() =>
              Alert.alert(
                'IDEAL COACHING CENTRE',
                'Sarotiya, Post Sarbhanga, Mahagama, Godda (JH) 814165\nDirector: BADE SIR (+91 9771350910)\nUPI ID: azhargodda@ybl'
              )
            }
          >
            <View style={styles.menuLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
                <Info size={18} color="#2563EB" />
              </View>
              <View>
                <Text style={styles.menuItemText}>Institute Information & Contact</Text>
                <Text style={styles.menuItemSub}>Director: BADE SIR (+91 9771350910)</Text>
              </View>
            </View>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <LogOut size={18} color="#DC2626" />
          <Text style={styles.logoutBtnText}>
            Sign Out
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  scroll: {
    padding: 16,
    paddingBottom: 36,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  userSub: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '600',
    marginTop: 1,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  userContact: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  userEmail: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  chipRow: {
    flexDirection: 'row',
    gap: 10,
  },
  chip: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  chipTextActive: {
    color: '#2563EB',
  },
  menuSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  menuItemSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#DC2626',
  },
});
