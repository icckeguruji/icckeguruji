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
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import YoutubePlayer from 'react-native-youtube-iframe';
import {
  Radio,
  Calendar,
  Play,
  Shield,
  Clock,
  Send,
  CheckCircle2,
  Plus,
  Trash2,
  Video,
  X,
  ShieldCheck,
  StopCircle,
} from 'lucide-react-native';
import { formatIST } from '@icc/shared-utils';
import { initialLiveClasses } from '../../../admin-web/src/lib/sample-data';
import { CoachingHeader } from '../../src/components/CoachingHeader';
import { DataService } from '../../src/services/dataService';
import { academicService } from '../../src/services/academicService';
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
  const isAdmin =
    user?.role === 'admin' ||
    user?.role === 'super_admin' ||
    user?.role === 'teacher' ||
    user?.email === 'icckeguruji@gmail.com' ||
    user?.mobile_number === '9771350910' ||
    user?.username === 'badesir';

  const [activeTab, setActiveTab] = useState<'live' | 'upcoming' | 'all'>('live');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('ALL');
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>(initialLiveClasses);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedStream, setSelectedStream] = useState<LiveClass | null>(initialLiveClasses[0] || null);
  const [playing, setPlaying] = useState(true);

  // In-App Live Doubts / Chat state
  const [chatMessages, setChatMessages] = useState<LiveChatMessage[]>([
    { id: '1', sender: 'बड़े सर (Director)', text: 'स्वागत है विद्यार्थियों! ध्यान से समझें और कोई भी प्रश्न पूछें।', time: 'Live' },
    { id: '2', sender: 'Aman Sharma (Patna)', text: 'सर, रासायनिक अभिक्रिया में उत्प्रेरक का क्या कार्य होता है?', time: 'Just now' },
  ]);
  const [newComment, setNewComment] = useState('');

  // Admin Modal: Go Live / Schedule Class
  const [isLiveModalOpen, setIsLiveModalOpen] = useState(false);
  const [liveForm, setLiveForm] = useState({
    title: '',
    title_hi: '',
    subject_name: 'Science (Chemistry)',
    chapter_title: 'Chapter 1: Chemical Reactions',
    class_name: 'Class 10',
    youtube_video_id: '',
    duration_minutes: '60',
    start_immediately: true,
    scheduled_at: new Date().toISOString(),
  });

  const loadLiveClasses = useCallback(async () => {
    setIsSyncing(true);
    try {
      const data = await academicService.getLiveClasses();
      if (data && data.length > 0) {
        setLiveClasses(data);
        if (!selectedStream) {
          const liveNow = data.find((c) => c.status === 'live') || data[0];
          setSelectedStream(liveNow);
        }
      } else {
        const remoteData = await DataService.fetchLiveClasses();
        if (remoteData && remoteData.length > 0) {
          setLiveClasses(remoteData);
          if (!selectedStream) {
            setSelectedStream(remoteData[0]);
          }
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

  // Clean video ID helper
  const extractYoutubeId = (urlOrId: string): string => {
    const trimmed = urlOrId.trim();
    if (trimmed.includes('v=')) {
      const parts = trimmed.split('v=');
      return parts[1].substring(0, 11);
    }
    if (trimmed.includes('youtu.be/')) {
      const parts = trimmed.split('youtu.be/');
      return parts[1].substring(0, 11);
    }
    if (trimmed.includes('live/')) {
      const parts = trimmed.split('live/');
      return parts[1].substring(0, 11);
    }
    return trimmed || 'jfKfPfyJRdk';
  };

  const handleScheduleLive = async () => {
    if (!liveForm.title.trim()) {
      Alert.alert('Required', 'Please enter Live Class Title');
      return;
    }

    const videoId = extractYoutubeId(liveForm.youtube_video_id);

    try {
      const newLive = await academicService.scheduleLiveClass({
        title: `${liveForm.class_name}: ${liveForm.title.trim()}`,
        title_hi: liveForm.title_hi.trim() || liveForm.title.trim(),
        description: `${liveForm.subject_name} • ${liveForm.chapter_title}`,
        youtube_video_id: videoId,
        duration_minutes: parseInt(liveForm.duration_minutes) || 60,
        status: liveForm.start_immediately ? 'live' : 'scheduled',
        scheduled_at: new Date().toISOString(),
      });

      setSelectedStream(newLive);
      setIsLiveModalOpen(false);
      setLiveForm({
        title: '',
        title_hi: '',
        subject_name: 'Science (Chemistry)',
        chapter_title: 'Chapter 1: Chemical Reactions',
        class_name: 'Class 10',
        youtube_video_id: '',
        duration_minutes: '60',
        start_immediately: true,
        scheduled_at: new Date().toISOString(),
      });
      loadLiveClasses();
      Alert.alert(
        liveForm.start_immediately ? '🔴 Now Streaming Live!' : '📅 Class Scheduled!',
        'Students can now join this session inside the app.'
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to schedule live class');
    }
  };

  const handleUpdateStatus = async (id: string, status: 'live' | 'completed') => {
    try {
      await academicService.updateLiveClassStatus(id, status);
      loadLiveClasses();
      Alert.alert(
        'Stream Updated',
        status === 'live' ? 'Live stream has started!' : 'Stream marked as completed.'
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update stream status');
    }
  };

  const handleDeleteLive = (id: string, title: string) => {
    Alert.alert('Delete Stream?', `Are you sure you want to remove "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setLiveClasses((prev) => prev.filter((item) => item.id !== id));
          if (selectedStream?.id === id) {
            setSelectedStream(liveClasses.find((item) => item.id !== id) || null);
          }
          Alert.alert('Deleted', 'Stream session deleted.');
        },
      },
    ]);
  };

  const filtered = liveClasses.filter((item) => {
    if (activeTab === 'live') {
      return item.status === 'live';
    }
    if (activeTab === 'upcoming') {
      return item.status === 'scheduled';
    }
    return true;
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

            {/* Anti-Escape Overlay: Covers YouTube Top Bar & Share Button */}
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

      {/* Admin Action Bar */}
      {isAdmin && (
        <View style={styles.adminBar}>
          <View style={styles.adminBadgeRow}>
            <ShieldCheck size={14} color="#B45309" />
            <Text style={styles.adminBadgeText}>Director Live Console</Text>
          </View>
          <TouchableOpacity
            style={styles.goLiveBtn}
            onPress={() => setIsLiveModalOpen(true)}
            activeOpacity={0.8}
          >
            <Video size={15} color="#FFFFFF" />
            <Text style={styles.goLiveBtnText}>+ Go Live / Schedule</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Tabs: Live vs Scheduled vs All */}
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

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'all' && styles.tabBtnActive]}
          onPress={() => setActiveTab('all')}
          activeOpacity={0.8}
        >
          <Text
            style={[styles.tabBtnText, activeTab === 'all' && styles.tabBtnTextActive]}
          >
            All Archives
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
                    ) : item.status === 'completed' ? (
                      <View style={[styles.schedBadge, { backgroundColor: '#F1F5F9' }]}>
                        <CheckCircle2 size={12} color="#059669" />
                        <Text style={[styles.schedText, { color: '#059669' }]}>COMPLETED</Text>
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
                  <Text style={styles.timeText}>🕒 {formatIST(item.scheduled_at)}</Text>
                  {item.description ? (
                    <Text style={styles.streamDescText} numberOfLines={1}>
                      {item.description}
                    </Text>
                  ) : null}
                </View>

                <View style={styles.actionBtn}>
                  <Play size={14} color="#FFFFFF" />
                  <Text style={styles.actionBtnText}>
                    {isSelected ? 'Currently Streaming' : 'Watch Stream Inside App'}
                  </Text>
                </View>

                {/* Admin Live Controls */}
                {isAdmin && (
                  <View style={styles.adminStreamRow}>
                    {item.status === 'scheduled' && (
                      <TouchableOpacity
                        style={styles.startLiveBtn}
                        onPress={() => handleUpdateStatus(item.id, 'live')}
                      >
                        <Radio size={13} color="#FFFFFF" />
                        <Text style={styles.startLiveBtnText}>🔴 Start Live Stream</Text>
                      </TouchableOpacity>
                    )}

                    {item.status === 'live' && (
                      <TouchableOpacity
                        style={styles.endLiveBtn}
                        onPress={() => handleUpdateStatus(item.id, 'completed')}
                      >
                        <StopCircle size={13} color="#FFFFFF" />
                        <Text style={styles.endLiveBtnText}>⏹️ End Live Stream</Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={styles.deleteStreamBtn}
                      onPress={() => handleDeleteLive(item.id, item.title)}
                    >
                      <Trash2 size={13} color="#EF4444" />
                      <Text style={styles.deleteStreamBtnText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* In-App Live Doubt Q&A Section */}
        <View style={styles.chatSection}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatTitle}>💬 Live Classroom Doubts (लाइव प्रश्न)</Text>
            <Text style={styles.chatSub}>Chat directly with teacher during stream</Text>
          </View>

          <View style={styles.chatBox}>
            {chatMessages.map((msg) => (
              <View key={msg.id} style={styles.chatMsg}>
                <View style={styles.senderRow}>
                  <Text style={styles.senderName}>{msg.sender}</Text>
                  <Text style={styles.chatTime}>{msg.time}</Text>
                </View>
                <Text style={styles.msgText}>{msg.text}</Text>
              </View>
            ))}
          </View>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.commentInput}
              placeholder="Ask a doubt directly to बड़े सर..."
              placeholderTextColor="#94A3B8"
              value={newComment}
              onChangeText={setNewComment}
            />
            <TouchableOpacity style={styles.sendBtn} onPress={handleSendDoubt}>
              <Send size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Admin Schedule / Go Live Modal */}
      <Modal
        visible={isLiveModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsLiveModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Video size={20} color="#DC2626" />
                <Text style={styles.modalTitle}>Broadcast / Schedule Live Session</Text>
              </View>
              <TouchableOpacity onPress={() => setIsLiveModalOpen(false)}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody}>
              <Text style={styles.inputLabel}>Session Title (English) *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Chemical Reactions: Balance Equation Practice"
                value={liveForm.title}
                onChangeText={(text) => setLiveForm((prev) => ({ ...prev, title: text }))}
              />

              <Text style={styles.inputLabel}>Title (Hindi)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. रासायनिक अभिक्रियाएँ: संतुलित समीकरण अभ्यास"
                value={liveForm.title_hi}
                onChangeText={(text) => setLiveForm((prev) => ({ ...prev, title_hi: text }))}
              />

              <View style={styles.formRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Class</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Class 10"
                    value={liveForm.class_name}
                    onChangeText={(text) => setLiveForm((prev) => ({ ...prev, class_name: text }))}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Subject</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Science (Chemistry)"
                    value={liveForm.subject_name}
                    onChangeText={(text) =>
                      setLiveForm((prev) => ({ ...prev, subject_name: text }))
                    }
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Chapter Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Chapter 1: Chemical Reactions & Equations"
                value={liveForm.chapter_title}
                onChangeText={(text) => setLiveForm((prev) => ({ ...prev, chapter_title: text }))}
              />

              <Text style={styles.inputLabel}>YouTube Live URL or Video ID *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Paste YouTube Link or Video ID (e.g. jfKfPfyJRdk)"
                value={liveForm.youtube_video_id}
                onChangeText={(text) =>
                  setLiveForm((prev) => ({ ...prev, youtube_video_id: text }))
                }
              />

              <View style={styles.formRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Duration (Minutes)</Text>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="numeric"
                    placeholder="60"
                    value={liveForm.duration_minutes}
                    onChangeText={(text) =>
                      setLiveForm((prev) => ({ ...prev, duration_minutes: text }))
                    }
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Live Status</Text>
                  <View style={styles.statusToggleRow}>
                    <TouchableOpacity
                      style={[
                        styles.statusBtn,
                        liveForm.start_immediately && styles.statusBtnActiveLive,
                      ]}
                      onPress={() => setLiveForm((p) => ({ ...p, start_immediately: true }))}
                    >
                      <Text
                        style={[
                          styles.statusBtnText,
                          liveForm.start_immediately && styles.statusBtnTextActive,
                        ]}
                      >
                        🔴 Live Now
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.statusBtn,
                        !liveForm.start_immediately && styles.statusBtnActiveSched,
                      ]}
                      onPress={() => setLiveForm((p) => ({ ...p, start_immediately: false }))}
                    >
                      <Text
                        style={[
                          styles.statusBtnText,
                          !liveForm.start_immediately && styles.statusBtnTextActive,
                        ]}
                      >
                        📅 Scheduled
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setIsLiveModalOpen(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveLiveBtn} onPress={handleScheduleLive}>
                <Text style={styles.saveLiveBtnText}>
                  {liveForm.start_immediately ? '🔴 Start Live Now' : '📅 Schedule Session'}
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
    backgroundColor: '#F8FAFC',
  },
  playerWrapper: {
    backgroundColor: '#000000',
  },
  playerContainer: {
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
    height: 44,
    backgroundColor: 'transparent',
    zIndex: 99,
  },
  watermarkContainer: {
    position: 'absolute',
    bottom: 8,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    zIndex: 100,
  },
  watermarkText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  streamInfoBar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#0F172A',
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
  },
  drmTagText: {
    fontSize: 10,
    color: '#059669',
    fontWeight: '700',
  },
  streamTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  adminBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  adminBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  adminBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#92400E',
  },
  goLiveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  goLiveBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 8,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    gap: 6,
  },
  tabBtnActive: {
    backgroundColor: '#2563EB',
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
    paddingBottom: 30,
  },
  classesList: {
    gap: 12,
    marginBottom: 20,
  },
  liveCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  liveCardSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#F0F9FF',
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
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 5,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#DC2626',
  },
  liveNowText: {
    color: '#DC2626',
    fontSize: 10,
    fontWeight: '800',
  },
  schedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  schedText: {
    color: '#475569',
    fontSize: 10,
    fontWeight: '700',
  },
  durationText: {
    fontSize: 11,
    color: '#64748B',
  },
  playingPill: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  playingPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  metaRow: {
    marginBottom: 10,
  },
  timeText: {
    fontSize: 11,
    color: '#64748B',
  },
  streamDescText: {
    fontSize: 11,
    color: '#2563EB',
    fontWeight: '600',
    marginTop: 2,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  adminStreamRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  startLiveBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#DC2626',
    paddingVertical: 6,
    borderRadius: 6,
  },
  startLiveBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  endLiveBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#475569',
    paddingVertical: 6,
    borderRadius: 6,
  },
  endLiveBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  deleteStreamBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#FEF2F2',
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteStreamBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EF4444',
  },

  // Live Doubt Q&A Section
  chatSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chatHeader: {
    marginBottom: 12,
  },
  chatTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  chatSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  chatBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    gap: 10,
  },
  chatMsg: {
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 6,
  },
  senderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  senderName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  chatTime: {
    fontSize: 10,
    color: '#94A3B8',
  },
  msgText: {
    fontSize: 12,
    color: '#1E293B',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  commentInput: {
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
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalBody: {
    padding: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 4,
    marginTop: 8,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#0F172A',
  },
  formRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statusToggleRow: {
    flexDirection: 'row',
    gap: 4,
  },
  statusBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  statusBtnActiveLive: {
    backgroundColor: '#DC2626',
  },
  statusBtnActiveSched: {
    backgroundColor: '#2563EB',
  },
  statusBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  statusBtnTextActive: {
    color: '#FFFFFF',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  saveLiveBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#DC2626',
    alignItems: 'center',
  },
  saveLiveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
