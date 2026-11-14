import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatIST } from '@icc/shared-utils';
import { initialLiveClasses } from '../../../admin-web/src/lib/sample-data';
import { CoachingHeader } from '../../src/components/CoachingHeader';
import { DataService } from '../../src/services/dataService';
import { LiveClass } from '@icc/shared-types';

export default function StudentLiveScreen() {
  const [activeTab, setActiveTab] = useState<'live' | 'upcoming'>('live');
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>(initialLiveClasses);
  const [isSyncing, setIsSyncing] = useState(false);

  const loadLiveClasses = useCallback(async () => {
    setIsSyncing(true);
    try {
      const data = await DataService.fetchLiveClasses();
      setLiveClasses(data);
    } catch {
      // Keep initial
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    loadLiveClasses();
    const unsubscribe = DataService.subscribeToChanges(() => {
      loadLiveClasses();
    });
    return () => unsubscribe();
  }, [loadLiveClasses]);

  const openYouTubeLive = (videoId: string) => {
    Linking.openURL(`https://www.youtube.com/watch?v=${videoId}`);
  };

  const filtered = liveClasses.filter((item) => {
    if (activeTab === 'live') return item.status === 'live';
    return item.status === 'scheduled';
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Branded Coaching Header with Logo, Name & Live Sync */}
      <CoachingHeader onRefresh={loadLiveClasses} isSyncing={isSyncing} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Live Classes</Text>
        <Text style={styles.headerSub}>
          High quality live streaming via YouTube Live
        </Text>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'live' && styles.tabBtnActive]}
          onPress={() => setActiveTab('live')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'live' && styles.tabBtnTextActive]}>
            🔴 Live Now
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'upcoming' && styles.tabBtnActive]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text
            style={[styles.tabBtnText, activeTab === 'upcoming' && styles.tabBtnTextActive]}
          >
            📅 Upcoming
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={isSyncing}
            onRefresh={loadLiveClasses}
            colors={['#2563EB']}
            tintColor="#2563EB"
          />
        }
      >
        {(filtered.length > 0 ? filtered : liveClasses).map((item) => (
          <View key={item.id} style={styles.liveCard}>
            <View style={styles.badgeRow}>
              {item.status === 'live' ? (
                <View style={styles.liveNowBadge}>
                  <Text style={styles.liveNowText}>
                    🔴 LIVE NOW
                  </Text>
                </View>
              ) : (
                <View style={styles.schedBadge}>
                  <Text style={styles.schedText}>
                    SCHEDULED
                  </Text>
                </View>
              )}
              <Text style={styles.durationText}>
                {item.duration_minutes} mins
              </Text>
            </View>

            <Text style={styles.title}>
              {item.title}
            </Text>
            <Text style={styles.timeText}>
              🕒 {formatIST(item.scheduled_at)}
            </Text>

            <TouchableOpacity
              style={[
                styles.actionBtn,
                item.status === 'live' ? styles.actionBtnLive : styles.actionBtnSched,
              ]}
              onPress={() => openYouTubeLive(item.youtube_video_id)}
            >
              <Text style={styles.actionBtnText}>
                {item.status === 'live'
                  ? 'Join YouTube Stream'
                  : 'Set Reminder'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
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
  tabBar: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    backgroundColor: '#FFFFFF',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: '#0F172A',
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
  },
  scroll: {
    padding: 16,
    gap: 16,
  },
  liveCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  liveNowBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  liveNowText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#DC2626',
  },
  schedBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  schedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
  },
  durationText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 22,
  },
  timeText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 6,
  },
  actionBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 14,
  },
  actionBtnLive: {
    backgroundColor: '#DC2626',
  },
  actionBtnSched: {
    backgroundColor: '#2563EB',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
