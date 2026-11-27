import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Bell,
  Radio,
  FileText,
  BookOpen,
  CheckCircle2,
  Megaphone,
  ArrowLeft,
  CheckCheck,
  Trash2,
  ChevronRight,
  Sparkles,
} from 'lucide-react-native';
import { useAuthStore } from '../src/store/useAuthStore';
import { useAppTheme } from '../src/hooks/useAppTheme';
import {
  useNotificationStore,
  NotificationItem,
} from '../src/services/notificationService';

export default function NotificationsScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const isDark = theme.isDark;
  const { user, selectedBoard } = useAuthStore();
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    clearNotification,
  } = useNotificationStore();

  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications(user?.id, selectedBoard);
    setRefreshing(false);
  };

  const filteredNotifications = notifications.filter((item) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'live') return item.type === 'live';
    if (activeFilter === 'test') return item.type === 'test';
    if (activeFilter === 'notes') return item.type === 'notes';
    if (activeFilter === 'announcement') return item.type === 'announcement' || item.type === 'approval';
    return true;
  });

  const handleNotificationPress = (item: NotificationItem) => {
    markAsRead(item.id);
    if (item.link) {
      try {
        router.push(item.link as any);
      } catch {
        router.push('/(tabs)');
      }
    }
  };

  const renderTypeIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'live':
        return (
          <View style={[styles.iconWrap, { backgroundColor: '#FEE2E2' }]}>
            <Radio size={18} color="#DC2626" />
          </View>
        );
      case 'test':
        return (
          <View style={[styles.iconWrap, { backgroundColor: '#FEF3C7' }]}>
            <FileText size={18} color="#D97706" />
          </View>
        );
      case 'notes':
        return (
          <View style={[styles.iconWrap, { backgroundColor: '#D1FAE5' }]}>
            <BookOpen size={18} color="#059669" />
          </View>
        );
      case 'approval':
        return (
          <View style={[styles.iconWrap, { backgroundColor: '#DCFCE7' }]}>
            <CheckCircle2 size={18} color="#16A34A" />
          </View>
        );
      default:
        return (
          <View style={[styles.iconWrap, { backgroundColor: '#EEF2FF' }]}>
            <Megaphone size={18} color="#4F46E5" />
          </View>
        );
    }
  };

  const formatTimeAgo = (isoDate: string) => {
    try {
      const diffMs = Date.now() - new Date(isoDate).getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return 'Recent';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['top']}>
      {/* Top App Bar */}
      <View style={[styles.appBar, { backgroundColor: theme.headerBg, borderBottomColor: theme.headerBorder }]}>
        <View style={styles.appBarLeft}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: theme.inputBg }]}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ArrowLeft size={22} color={theme.text} />
          </TouchableOpacity>
          <View>
            <Text style={[styles.appBarTitle, { color: theme.text }]}>Notifications & Alerts</Text>
            <Text style={[styles.appBarSubtitle, { color: theme.textSecondary }]}>
              {unreadCount > 0 ? `${unreadCount} unread update(s)` : 'All caught up!'}
            </Text>
          </View>
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={markAllAsRead}
            activeOpacity={0.7}
          >
            <CheckCheck size={16} color="#2563EB" />
            <Text style={styles.markAllText}>Mark Read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter Chips */}
      <View style={[styles.filterBar, { backgroundColor: theme.headerBg, borderBottomColor: theme.headerBorder }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {[
            { id: 'all', label: `All (${notifications.length})` },
            { id: 'live', label: '🔴 Live Classes' },
            { id: 'test', label: '📝 Quiz' },
            { id: 'notes', label: '📚 Notes' },
            { id: 'announcement', label: '📢 Notices' },
          ].map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.filterChip,
                  { backgroundColor: isActive ? theme.primary : theme.inputBg, borderColor: isActive ? theme.primary : theme.border },
                ]}
                onPress={() => setActiveFilter(tab.id)}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterChipText, { color: isActive ? '#FFFFFF' : theme.textSecondary }]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Notifications List */}
      <ScrollView
        style={styles.contentList}
        refreshControl={
          <RefreshControl refreshing={refreshing || isLoading} onRefresh={onRefresh} colors={['#2563EB']} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {filteredNotifications.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.surfaceCard, borderColor: theme.cardBorder }]}>
            <View style={[styles.emptyIconCircle, { backgroundColor: theme.inputBg }]}>
              <Bell size={36} color={theme.textMuted} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No Notifications Here</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              {activeFilter === 'all'
                ? "You're all caught up! When Bade Sir schedules a live class or quiz, it will appear here instantly."
                : 'No alerts match this filter. Try checking the "All" tab.'}
            </Text>
          </View>
        ) : (
          filteredNotifications.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.notificationCard,
                { backgroundColor: theme.surfaceCard, borderColor: theme.cardBorder },
                !item.is_read && { borderColor: theme.primary, backgroundColor: isDark ? 'rgba(59,130,246,0.12)' : '#EFF6FF' },
              ]}
              onPress={() => handleNotificationPress(item)}
              activeOpacity={0.75}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  {renderTypeIcon(item.type)}
                  <View style={styles.badgeRow}>
                    <Text style={styles.typeBadgeText}>
                      {item.type.toUpperCase()}
                    </Text>
                    {!item.is_read && <View style={styles.unreadDot} />}
                  </View>
                </View>

                <View style={styles.cardHeaderRight}>
                  <Text style={styles.timeText}>{formatTimeAgo(item.created_at)}</Text>
                  <TouchableOpacity
                    onPress={() => clearNotification(item.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Trash2 size={15} color="#94A3B8" />
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={[styles.cardTitle, !item.is_read && styles.unreadCardTitle]}>
                {item.title}
              </Text>

              <Text style={styles.cardMessage} numberOfLines={3}>
                {item.message}
              </Text>

              {item.link && (
                <View style={styles.cardActionRow}>
                  <Text style={styles.actionPromptText}>Tap to open in app</Text>
                  <ChevronRight size={14} color="#2563EB" />
                </View>
              )}
            </TouchableOpacity>
          ))
        )}

        {/* Free Push Delivery Guarantee Footer Banner */}
        <View style={styles.footerInfoBox}>
          <Sparkles size={16} color="#D97706" />
          <Text style={styles.footerInfoText}>
            Instant Institute Notifications. Free for all BSEB/JAC students.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  appBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appBarTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  appBarSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  markAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  filterBar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 8,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  filterChipActive: {
    backgroundColor: '#1E3A8A',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  contentList: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 12,
  },
  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  unreadCard: {
    backgroundColor: '#F8FAFC',
    borderColor: '#BFDBFE',
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 4,
  },
  unreadCardTitle: {
    fontWeight: '800',
    color: '#0F172A',
  },
  cardMessage: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
  cardActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 2,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  actionPromptText: {
    fontSize: 11,
    color: '#2563EB',
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  footerInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFBEB',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginTop: 8,
  },
  footerInfoText: {
    fontSize: 11,
    color: '#92400E',
    fontWeight: '600',
    flex: 1,
    lineHeight: 16,
  },
});
