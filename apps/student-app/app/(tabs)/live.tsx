import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Platform,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import YoutubePlayer from 'react-native-youtube-iframe';
import { Radio, Calendar, Play, Shield, Clock, Send, CheckCircle2 } from 'lucide-react-native';
import { formatIST } from '@icc/shared-utils';
import { initialLiveClasses } from '../../../admin-web/src/lib/sample-data';
import { CoachingHeader } from '../../src/components/CoachingHeader';
import { DataService } from '../../src/services/dataService';
import { LiveClass } from '@icc/shared-types';
import { useAuthStore } from '../../src/store/useAuthStore';

interface LiveChatMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
}

export default function StudentLiveScreen() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'live' | 'upcoming'>('live');
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>(initialLiveClasses);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedStream, setSelectedStream] = useState<LiveClass | null>(initialLiveClasses[0] || null);
  const [playing, setPlaying] = useState(true);
  
  // In-App Live Doubts / Chat state
  const [chatMessages, setChatMessages] = useState<LiveChatMessage[]>([
    { id: '1', sender: 'Teacher (Er. S. Alam)', text: 'Welcome students! Today we cover balanced equations.', time: 'Live' },
    { id: '2', sender: 'Aman Sharma', text: 'Sir is combustion exothermic?', time: 'Just now' },
  ]);
  const [newComment, setNewComment] = useState('');

  const loadLiveClasses = useCallback(async () => {
    setIsSyncing(true);
    try {
      const data = await DataService.fetchLiveClasses();
      if (data && data.length > 0) {
        setLiveClasses(data);
        if (!selectedStream) {
          const liveNow = data.find((c) => c.status === 'live') || data[0];
          setSelectedStream(liveNow);
        }
      }
    } catch {
      // Keep initial
    } finally {
      setIsSyncing(false);
    }
  }, [selectedStream]);

  useEffect(() => {
    loadLiveClasses();
    const unsubscribe = DataService.subscribeToChanges(() => {
      loadLiveClasses();
    });
    return () => unsubscribe();
  }, [loadLiveClasses]);

  const filtered = liveClasses.filter((item) => {
    if (activeTab === 'live') return item.status === 'live';
    return item.status === 'scheduled';
  });

  const handleSendDoubt = () => {
    if (!newComment.trim()) return;
    const msg: LiveChatMessage = {
      id: Date.now().toString(),
      sender: user?.full_name || 'You',
      text: newComment.trim(),
      time: 'Just now',
    };
    setChatMessages((prev) => [...prev, msg]);
    setNewComment('');
  };

  const studentWatermark = `${user?.full_name || 'ICC Student'} • +91 ${user?.mobile_number || '9876543210'} • ICC PROTECTED STREAM`;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Branded Coaching Header with Logo, Name & Live Sync */}
      <CoachingHeader onRefresh={loadLiveClasses} isSyncing={isSyncing} />

      {/* Embedded In-App Player Section (Strictly In-App, Anti-Escape, No YouTube app redirection) */}
      {selectedStream && (
        <View style={styles.playerWrapper}>
          <View style={styles.playerContainer}>
            {Platform.OS === 'web' ? (
              <iframe
                width="100%"
                height="210"
                src={`https://www.youtube-nocookie.com/embed/${selectedStream.youtube_video_id}?autoplay=1&rel=0&modestbranding=1&controls=1`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                style={{ border: 'none' }}
              />
            ) : (
              <YoutubePlayer
                height={210}
                play={playing}
                videoId={selectedStream.youtube_video_id}
                initialPlayerParams={{
                  preventFullScreen: false,
                  controls: true,
                  rel: false,
                }}
                onChangeState={(state) => {
                  if (state === 'ended') setPlaying(false);
                }}
              />
            )}

            {/* Anti-Escape Overlay: Covers YouTube Top Bar & Share Button to prevent link copying / external app jumping */}
            <View style={styles.antiEscapeTopBar} pointerEvents="auto" />

            {/* Dynamic Anti-Piracy Watermark Overlay */}
            <View style={styles.watermarkContainer} pointerEvents="none">
              <Text style={styles.watermarkText}>{studentWatermark}</Text>
            </View>
          </View>

          {/* Active Stream Info Bar */}
          <View style={styles.streamInfoBar}>
            <View style={styles.streamTitleRow}>
              <View style={styles.liveIndicator}>
                <View style={styles.redDot} />
                <Text style={styles.liveIndicatorText}>
                  {selectedStream.status === 'live' ? 'IN-APP LIVE' : 'SCHEDULED'}
                </Text>
              </View>
              <View style={styles.drmTag}>
                <Shield size={12} color="#059669" />
                <Text style={styles.drmTagText}>In-App Protected</Text>
              </View>
            </View>
            <Text style={styles.streamTitle} numberOfLines={1}>
              {selectedStream.title}
            </Text>
          </View>
        </View>
      )}

      {/* Tabs: Live vs Scheduled vs Live Doubt Chat */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'live' && styles.tabBtnActive]}
          onPress={() => setActiveTab('live')}
          activeOpacity={0.8}
        >
          <Radio size={14} color={activeTab === 'live' ? '#FFFFFF' : '#EF4444'} />
          <Text style={[styles.tabBtnText, activeTab === 'live' && styles.tabBtnTextActive]}>
            Live Sessions
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'upcoming' && styles.tabBtnActive]}
          onPress={() => setActiveTab('upcoming')}
          activeOpacity={0.8}
        >
          <Calendar size={14} color={activeTab === 'upcoming' ? '#FFFFFF' : '#64748B'} />
          <Text
            style={[styles.tabBtnText, activeTab === 'upcoming' && styles.tabBtnTextActive]}
          >
            Upcoming Schedule
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
        {/* Stream Cards */}
        <View style={styles.classesList}>
          {(filtered.length > 0 ? filtered : liveClasses).map((item) => {
            const isSelected = selectedStream?.id === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.liveCard, isSelected && styles.liveCardSelected]}
                onPress={() => {
                  setSelectedStream(item);
                  setPlaying(true);
                }}
                activeOpacity={0.85}
              >
                <View style={styles.cardTopRow}>
                  <View style={styles.badgeRow}>
                    {item.status === 'live' ? (
                      <View style={styles.liveNowBadge}>
                        <View style={styles.pulseDot} />
                        <Text style={styles.liveNowText}>STREAMING NOW</Text>
                      </View>
                    ) : (
                      <View style={styles.schedBadge}>
                        <Clock size={12} color="#475569" />
                        <Text style={styles.schedText}>SCHEDULED</Text>
                      </View>
                    )}
                    <Text style={styles.durationText}>{item.duration_minutes} mins</Text>
                  </View>

                  {isSelected && (
                    <View style={styles.playingPill}>
                      <Text style={styles.playingPillText}>▶ Playing Above</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.title} numberOfLines={2}>
                  {item.title}
                </Text>
                
                <View style={styles.metaRow}>
                  <Text style={styles.timeText}>
                    🕒 {formatIST(item.scheduled_at)}
                  </Text>
                </View>

                <View style={styles.actionBtn}>
                  <Play size={14} color="#FFFFFF" />
                  <Text style={styles.actionBtnText}>
                    {isSelected ? 'Currently Streaming' : 'Watch Stream Inside App'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* In-App Live Doubt Q&A Section */}
        <View style={styles.chatSection}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatTitle}>Live Class Doubts & Discussion</Text>
            <Text style={styles.chatSub}>Ask questions directly to teacher</Text>
          </View>

          <View style={styles.messagesBox}>
            {chatMessages.map((m) => (
              <View key={m.id} style={styles.msgBubble}>
                <View style={styles.msgHeader}>
                  <Text style={styles.msgSender}>{m.sender}</Text>
                  <Text style={styles.msgTime}>{m.time}</Text>
                </View>
                <Text style={styles.msgText}>{m.text}</Text>
              </View>
            ))}
          </View>

          <View style={styles.chatInputRow}>
            <TextInput
              style={styles.input}
              placeholder="Type your question or doubt..."
              placeholderTextColor="#94A3B8"
              value={newComment}
              onChangeText={setNewComment}
            />
            <TouchableOpacity style={styles.sendBtn} onPress={handleSendDoubt}>
              <Send size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
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
  playerWrapper: {
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  playerContainer: {
    width: '100%',
    height: 210,
    backgroundColor: '#000000',
    position: 'relative',
    overflow: 'hidden',
  },
  antiEscapeTopBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 48,
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  watermarkContainer: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    alignItems: 'center',
    zIndex: 9,
  },
  watermarkText: {
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.45)',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  streamInfoBar: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  streamTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  redDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  liveIndicatorText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EF4444',
    letterSpacing: 0.5,
  },
  drmTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  drmTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10B981',
  },
  streamTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
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
    padding: 14,
    paddingBottom: 40,
    gap: 16,
  },
  classesList: {
    gap: 12,
  },
  liveCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  liveCardSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#F8FAFF',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveNowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#DC2626',
  },
  liveNowText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#DC2626',
  },
  schedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  schedText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
  },
  durationText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  playingPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  playingPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 20,
    marginBottom: 6,
  },
  metaRow: {
    marginBottom: 10,
  },
  timeText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  actionBtn: {
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  chatSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chatHeader: {
    marginBottom: 12,
  },
  chatTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  chatSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  messagesBox: {
    gap: 8,
    marginBottom: 12,
  },
  msgBubble: {
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#2563EB',
  },
  msgHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  msgSender: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E293B',
  },
  msgTime: {
    fontSize: 10,
    color: '#94A3B8',
  },
  msgText: {
    fontSize: 12,
    color: '#334155',
  },
  chatInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: '#0F172A',
  },
  sendBtn: {
    backgroundColor: '#2563EB',
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
