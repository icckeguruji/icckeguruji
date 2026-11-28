import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Linking,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Radio, Youtube, Copy, Play, Square, RefreshCw, CheckCircle2 } from 'lucide-react-native';
import { academicService, AcademicSubject, AcademicChapter } from '../../src/services/academicService';
import { Course } from '@icc/shared-types';
import { useAppTheme } from '../../src/hooks/useAppTheme';

const API_BASE = 'https://icconline.vercel.app';

export default function AdminGoLiveScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const isDark = theme.isDark;

  const [ytStatus, setYtStatus] = useState<{
    configured: boolean;
    connected: boolean;
    channelTitle?: string | null;
  }>({ configured: false, connected: false });
  const [loadingStatus, setLoadingStatus] = useState(true);

  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [subjects, setSubjects] = useState<AcademicSubject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<AcademicSubject | null>(null);
  const [chapters, setChapters] = useState<AcademicChapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<AcademicChapter | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const [activeBroadcast, setActiveBroadcast] = useState<{
    videoId: string;
    rtmpUrl: string;
    streamKey: string;
    watchUrl: string;
    liveClassId?: string;
    state: 'ready' | 'live' | 'complete';
  } | null>(null);

  const fetchYtStatus = useCallback(async () => {
    setLoadingStatus(true);
    try {
      const res = await fetch(`${API_BASE}/api/youtube/status`);
      const data = await res.json();
      setYtStatus(data);
    } catch {
    } finally {
      setLoadingStatus(false);
    }
  }, []);

  useEffect(() => {
    fetchYtStatus();
    academicService.getCourses().then(async (list) => {
      setCourses(list);
      if (list.length > 0) {
        setSelectedCourse(list[0]);
        const subs = await academicService.getSubjects(list[0].id);
        setSubjects(subs);
        if (subs.length > 0) {
          setSelectedSubject(subs[0]);
          const chaps = await academicService.getChapters(subs[0].id);
          setChapters(chaps);
          if (chaps.length > 0) setSelectedChapter(chaps[0]);
        }
      }
    });
  }, [fetchYtStatus]);

  const handleSelectCourse = async (c: Course) => {
    setSelectedCourse(c);
    const subs = await academicService.getSubjects(c.id);
    setSubjects(subs);
    setSelectedSubject(subs[0] || null);
    if (subs[0]) {
      const chaps = await academicService.getChapters(subs[0].id);
      setChapters(chaps);
      setSelectedChapter(chaps[0] || null);
    } else {
      setChapters([]);
      setSelectedChapter(null);
    }
  };

  const handleSelectSubject = async (s: AcademicSubject) => {
    setSelectedSubject(s);
    const chaps = await academicService.getChapters(s.id);
    setChapters(chaps);
    setSelectedChapter(chaps[0] || null);
  };

  const handleCreateYouTubeLive = async () => {
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter a Live Class Title.');
      return;
    }
    setCreating(true);
    try {
      const res = await fetch(`${API_BASE}/api/youtube/broadcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-icc-admin-email': 'icckeguruji@gmail.com',
        },
        body: JSON.stringify({
          action: 'create',
          title: title.trim(),
          description: description.trim() || `${selectedCourse?.title || 'ICC'} • ${selectedSubject?.name || ''}`,
          scheduledAt: new Date(Date.now() + 60_000).toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create YouTube broadcast.');
      }

      const saved = await academicService.scheduleLiveClass({
        course_id: selectedCourse?.id,
        subject_id: selectedSubject?.id,
        chapter_id: selectedChapter?.id,
        class_name: selectedCourse?.class_name || 'Class 10',
        title: title.trim(),
        title_hi: title.trim(),
        description: description.trim(),
        youtube_video_id: data.videoId,
        scheduled_at: new Date().toISOString(),
        duration_minutes: 60,
        status: 'scheduled',
      });

      setActiveBroadcast({
        videoId: data.videoId,
        rtmpUrl: data.rtmpUrl,
        streamKey: data.streamKey,
        watchUrl: data.watchUrl,
        liveClassId: saved.id,
        state: 'ready',
      });
      Alert.alert('Success', 'Unlisted YouTube Live Broadcast created & saved to course!');
    } catch (e: any) {
      Alert.alert('YouTube Live Error', e?.message || 'Could not create YouTube broadcast.');
    } finally {
      setCreating(false);
    }
  };

  const handleTransition = async (nextStatus: 'live' | 'complete') => {
    if (!activeBroadcast) return;
    try {
      const res = await fetch(`${API_BASE}/api/youtube/broadcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-icc-admin-email': 'icckeguruji@gmail.com',
        },
        body: JSON.stringify({
          action: 'transition',
          videoId: activeBroadcast.videoId,
          status: nextStatus,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Transition failed');
      }
      if (activeBroadcast.liveClassId) {
        await academicService.updateLiveClassStatus(
          activeBroadcast.liveClassId,
          nextStatus === 'live' ? 'live' : 'completed'
        );
      }
      setActiveBroadcast({ ...activeBroadcast, state: nextStatus });
      Alert.alert('Updated', nextStatus === 'live' ? 'Broadcast is now LIVE!' : 'Broadcast ended & archived.');
    } catch (e: any) {
      Alert.alert('Broadcast Error', e?.message || 'Make sure your RTMP camera stream is sending video first.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['top', 'left', 'right']}>
      <View style={[styles.header, { backgroundColor: theme.headerBg, borderBottomColor: theme.headerBorder }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: isDark ? '#18181B' : '#F1F5F9' }]}
        >
          <ArrowLeft size={20} color={theme.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>YouTube Direct Live</Text>
          <Text style={[styles.headerSub, { color: theme.textSecondary }]}>Schedule & Broadcast from App</Text>
        </View>
        <TouchableOpacity onPress={fetchYtStatus} style={[styles.backBtn, { backgroundColor: isDark ? '#18181B' : '#F1F5F9' }]}>
          <RefreshCw size={17} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* YouTube Connection Card */}
        <View style={[styles.card, { backgroundColor: theme.surfaceCard, borderColor: theme.cardBorder }]}>
          <View style={styles.rowBetween}>
            <View style={styles.rowGap}>
              <Youtube size={22} color="#DC2626" />
              <View>
                <Text style={[styles.cardTitle, { color: theme.text }]}>
                  {ytStatus.connected ? ytStatus.channelTitle || 'YouTube Connected' : 'YouTube Channel'}
                </Text>
                <Text style={[styles.cardSub, { color: theme.textSecondary }]}>
                  {loadingStatus
                    ? 'Checking connection...'
                    : ytStatus.connected
                    ? 'Connected • Ready for Unlisted Live'
                    : ytStatus.configured
                    ? 'Not connected yet'
                    : 'Server OAuth env keys pending'}
                </Text>
              </View>
            </View>
            {ytStatus.connected ? (
              <CheckCircle2 size={20} color="#16A34A" />
            ) : (
              <TouchableOpacity
                style={styles.connectBtn}
                onPress={() => Linking.openURL(`${API_BASE}/api/youtube/auth?source=app`)}
              >
                <Text style={styles.connectBtnText}>Connect</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Create Live Broadcast Form */}
        <View style={[styles.card, { backgroundColor: theme.surfaceCard, borderColor: theme.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>1. Select Course, Subject & Chapter</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {courses.map((c) => (
              <TouchableOpacity
                key={c.id}
                onPress={() => handleSelectCourse(c)}
                style={[styles.chip, selectedCourse?.id === c.id && styles.chipActive]}
              >
                <Text style={[styles.chipText, selectedCourse?.id === c.id && styles.chipTextActive]} numberOfLines={1}>
                  {c.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {subjects.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {subjects.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  onPress={() => handleSelectSubject(s)}
                  style={[styles.chip, selectedSubject?.id === s.id && styles.chipActive]}
                >
                  <Text style={[styles.chipText, selectedSubject?.id === s.id && styles.chipTextActive]}>
                    {s.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {chapters.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {chapters.map((ch) => (
                <TouchableOpacity
                  key={ch.id}
                  onPress={() => setSelectedChapter(ch)}
                  style={[styles.chip, selectedChapter?.id === ch.id && styles.chipActive]}
                >
                  <Text style={[styles.chipText, selectedChapter?.id === ch.id && styles.chipTextActive]}>
                    {ch.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <TextInput
            style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
            placeholderTextColor={theme.textMuted}
            placeholder="Live Class Title (e.g. Science Ch 1 Live)"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
            placeholderTextColor={theme.textMuted}
            placeholder="Description (Optional)"
            value={description}
            onChangeText={setDescription}
          />

          <TouchableOpacity
            style={[styles.createBtn, creating && { opacity: 0.6 }]}
            disabled={creating}
            onPress={handleCreateYouTubeLive}
          >
            {creating ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Radio size={17} color="#FFFFFF" />
                <Text style={styles.createBtnText}>Create YouTube Live (Unlisted)</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Active Broadcast RTMP Details & Go Live Controls */}
        {activeBroadcast && (
          <View style={[styles.card, { backgroundColor: theme.surfaceCard, borderColor: '#2563EB', borderWidth: 1.5 }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>2. Stream Key & Live Controls</Text>
            <Text style={[styles.cardSub, { color: theme.textSecondary }]}>
              Video ID: {activeBroadcast.videoId}
            </Text>
            <Text style={[styles.cardSub, { color: theme.textSecondary }]} selectable>
              RTMP URL: {activeBroadcast.rtmpUrl}
            </Text>
            <Text style={[styles.cardSub, { color: theme.textSecondary }]} selectable>
              Stream Key: {activeBroadcast.streamKey}
            </Text>

            <View style={[styles.rowGap, { marginTop: 8 }]}>
              <TouchableOpacity
                style={[styles.smallBtn, { backgroundColor: '#1E293B' }]}
                onPress={() =>
                  Share.share({
                    message: `RTMP URL: ${activeBroadcast.rtmpUrl}\nStream Key: ${activeBroadcast.streamKey}`,
                  })
                }
              >
                <Copy size={14} color="#FFFFFF" />
                <Text style={styles.smallBtnText}>Copy / Share Key</Text>
              </TouchableOpacity>

              {activeBroadcast.state !== 'live' ? (
                <TouchableOpacity
                  style={[styles.smallBtn, { backgroundColor: '#DC2626' }]}
                  onPress={() => handleTransition('live')}
                >
                  <Play size={14} color="#FFFFFF" />
                  <Text style={styles.smallBtnText}>Go Live Now</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.smallBtn, { backgroundColor: '#059669' }]}
                  onPress={() => handleTransition('complete')}
                >
                  <Square size={14} color="#FFFFFF" />
                  <Text style={styles.smallBtnText}>End Live</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '800' },
  headerSub: { fontSize: 11, fontWeight: '600' },
  scroll: { padding: 16, gap: 14 },
  card: { borderRadius: 16, borderWidth: 1, padding: 14, gap: 10 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowGap: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardTitle: { fontSize: 14, fontWeight: '800' },
  cardSub: { fontSize: 12, marginTop: 2 },
  connectBtn: { backgroundColor: '#DC2626', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  connectBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  sectionTitle: { fontSize: 13.5, fontWeight: '800' },
  chipRow: { gap: 8, paddingVertical: 2 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    maxWidth: 200,
  },
  chipActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  chipText: { fontSize: 12, fontWeight: '700', color: '#334155' },
  chipTextActive: { color: '#FFFFFF' },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13 },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#DC2626',
    borderRadius: 12,
    paddingVertical: 13,
  },
  createBtnText: { color: '#FFFFFF', fontSize: 13.5, fontWeight: '800' },
  smallBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  smallBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
});
