import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/useAuthStore';
import { translations } from '@icc/shared-utils';
import { BoardCode, AppLanguage } from '@icc/shared-types';

export default function StudentProfileScreen() {
  const router = useRouter();
  const {
    user,
    language,
    setLanguage,
    selectedBoard,
    setBoard,
    selectedClass,
    setClass,
    isDarkMode,
    toggleDarkMode,
    logout,
  } = useAuthStore();
  const t = translations[language];

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Student Profile</Text>
        <Text style={styles.headerSub}>
          Student account, board settings and preferences
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.full_name ? user.full_name[0] : 'S'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{user?.full_name || 'Rohit Kumar'}</Text>
            <Text style={styles.userSub}>@{user?.username || 'rohit_kumar'}</Text>
            <Text style={styles.userContact}>+91 {user?.mobile_number || '9876543210'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'rohit.kumar@example.com'}</Text>
          </View>
        </View>

        {/* Board Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Academic Board</Text>
          <View style={styles.chipRow}>
            <TouchableOpacity
              style={[styles.chip, selectedBoard === 'BSEB' && styles.chipActive]}
              onPress={() => setBoard('BSEB')}
            >
              <Text style={[styles.chipText, selectedBoard === 'BSEB' && styles.chipTextActive]}>
                Bihar Board (BSEB)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.chip, selectedBoard === 'JAC' && styles.chipActive]}
              onPress={() => setBoard('JAC')}
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
                'Offline Files',
                'Downloaded notes are cached securely in local storage.'
              )
            }
          >
            <Text style={styles.menuItemText}>
              📥 Downloaded Study Materials
            </Text>
            <Text style={styles.menuChevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={toggleDarkMode}>
            <Text style={styles.menuItemText}>
              🌓 Dark Theme: {isDarkMode ? 'ON' : 'OFF'}
            </Text>
            <Text style={styles.menuChevron}>›</Text>
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
            <Text style={styles.menuItemText}>
              ℹ️ Institute Information & Contact
            </Text>
            <Text style={styles.menuChevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutBtnText}>
            🚪 Sign Out
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
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
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
    fontSize: 26,
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
    color: '#64748B',
    marginTop: 1,
  },
  userContact: {
    fontSize: 11,
    color: '#334155',
    fontWeight: '600',
    marginTop: 4,
  },
  userEmail: {
    fontSize: 11,
    color: '#64748B',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 10,
  },
  chip: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  menuSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: 24,
  },
  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  menuChevron: {
    fontSize: 18,
    color: '#94A3B8',
    fontWeight: '600',
  },
  logoutBtn: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
  },
});
