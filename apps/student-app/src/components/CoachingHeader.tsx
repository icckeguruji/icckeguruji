import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Bell } from 'lucide-react-native';
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
  const { user, selectedBoard, selectedClass } = useAuthStore();
  const { unreadCount, initPushNotifications } = useNotificationStore();

  useEffect(() => {
    initPushNotifications(user?.id, selectedBoard);
  }, [user?.id, selectedBoard]);

  return (
    <View style={styles.container}>
      {/* Top Brand Strip */}
      <View style={styles.topRow}>
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
              Board Examination 2027 • Dir: BADE SIR
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
            <Bell size={20} color="#334155" />
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
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  logoCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
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
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.3,
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
    gap: 8,
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
});
