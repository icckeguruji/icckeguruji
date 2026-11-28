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
  AppState,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import * as ImagePicker from 'expo-image-picker';
import { ArrowLeft, Radio, Youtube, Copy, Play, Square, RefreshCw, CheckCircle2, Image as ImageIcon } from 'lucide-react-native';
import { academicService, AcademicSubject, AcademicChapter } from '../../src/services/academicService';
import { Course } from '@icc/shared-types';
import { useAppTheme } from '../../src/hooks/useAppTheme';
import { InAppRtmpBroadcaster } from '../../src/components/InAppRtmpBroadcaster';

const API_BASE = 'https://icconline.vercel.app';
const YT_TOKEN_STORAGE_KEY = 'icc_yt_oauth_token_b64';
const CLASS_FILTERS = ['All', 'Class 10', 'Class 12', 'Class 11', 'Class 9', 'Class 8'];

export default function AdminGoLiveScreen() {
  const router = useRouter();
  const { yt_token } = useLocalSearchParams<{ yt_token?: string }>();
  const theme = useAppTheme();
  const isDark = theme.isDark;

  const [storedYtToken, setStoredYtToken] = useState<string | null>(null);
  const [ytStatus, setYtStatus] = useState<{
    configured: boolean;
    connected: boolean;
    channelTitle?: string | null;
  }>({ configured: false, connected: false });
  const [loadingStatus, setLoadingStatus] = useState(true);

  const [selectedClass, setSelectedClass] = useState('All');
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [subjects, setSubjects] = useState<AcademicSubject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<AcademicSubject | null>(null);
  const [chapters, setChapters] = useState<AcademicChapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<AcademicChapter | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'unlisted' | 'public' | 'private'>('unlisted');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [creating, setCreating] = useState(false);

  const [activeBroadcast, setActiveBroadcast] = useState<{
    videoId: string;
    rtmpUrl: string;
    streamKey: string;
    watchUrl: string;
    liveClassId?: string;
    state: 'ready' | 'live' | 'complete';
  } | null>(null);

  const saveTokenLocally = async (tok: string) => {
    setStoredYtToken(tok);
    try {
      if (Platform.OS !== 'web') {
        await SecureStore.setItemAsync(YT_TOKEN_STORAGE_KEY, tok);
      } else if (typeof window !== 'undefined') {
        localStorage.setItem(YT_TOKEN_STORAGE_KEY, tok);
      }
    } catch {}
  };

  const loadLocalToken = async (): Promise<string | null> => {
    try {
      if (Platform.OS !== 'web') {
        return await SecureStore.getItemAsync(YT_TOKEN_STORAGE_KEY);
      } else if (typeof window !== 'undefined') {
        return localStorage.getItem(YT_TOKEN_STORAGE_KEY);
      }
    } catch {}
    return null;
  };

  const fetchYtStatus = useCallback(async (overrideToken?: string | null) => {
    setLoadingStatus(true);
    try {
      const tok = overrideToken ?? storedYtToken ?? (await loadLocalToken());
      if (tok && !storedYtToken) setStoredYtToken(tok);
      const headers: Record<string, string> = {};
      if (tok) headers['x-icc-yt-token'] = tok;
      const res = await fetch(`${API_BASE}/api/youtube/status`, { headers });
      const data = await res.json();
      setYtStatus(data);
    } catch {
    } finally {
      setLoadingStatus(false);
    }
  }, [storedYtToken]);

  useEffect(() => {
    if (yt_token) {
      saveTokenLocally(yt_token).then(() => fetchYtStatus(yt_token));
    }
  }, [yt_token]);

  useEffect(() => {
    fetchYtStatus();
    const appStateSub = AppState.addEventListener('change', (state) => {
      if (state === 'active') fetchYtStatus();
    });
    const urlSub = Linking.addEventListener('url', (ev) => {
      try {
        const parsed = new URL(ev.url);
        const tok = parsed.searchParams.get('yt_token');
        if (tok) {
          saveTokenLocally(tok).then(() => fetchYtStatus(tok));
        }
      } catch {}
    });

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

    return () => {
      appStateSub.remove();
      urlSub.remove();
    };
  }, [fetchYtStatus]);

  useFocusEffect(
    useCallback(() => {
      fetchYtStatus();
    }, [fetchYtStatus])
  );

  const visibleCourses =
    selectedClass === 'All'
      ? courses
      : courses.filter((c) => (c.class_name || c.title || '').toLowerCase().includes(selectedClass.toLowerCase()));

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

  const handlePickThumbnail = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.7,
      });
      if (!res.canceled && res.assets[0]?.uri) {
        setThumbnailUrl(res.assets[0].uri);
      }
    } catch {}
  };

  const handleCreateYouTubeLive = async () => {
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter a Live Class Title.');
      return;
    }
    setCreating(true);
    try {
      const tok = storedYtToken || (await loadLocalToken());
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-icc-admin-email': 'icckeguruji@gmail.com',
      };
      if (tok) headers['x-icc-yt-token'] = tok;

      const res = await fetch(`${API_BASE}/api/youtube/broadcast`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'create',
          title: title.trim(),
          description: description.trim() || `${selectedCourse?.title || 'ICC'} • ${selectedSubject?.name || ''}`,
          visibility,
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
        class_name: selectedCourse?.class_name || (selectedClass !== 'All' ? selectedClass : 'Class 10'),
        title: title.trim(),
        title_hi: title.trim(),
        description: description.trim(),
        youtube_video_id: data.videoId,
        thumbnail_url: thumbnailUrl.trim() || undefined,
        scheduled_at: new Date().toISOString(),
        duration_minutes: 60,
        status: 'scheduled',
      } as any);

      setActiveBroadcast({
        videoId: data.videoId,
        rtmpUrl: data.rtmpUrl,
        streamKey: data.streamKey,
        watchUrl: data.watchUrl,
        liveClassId: saved.id,
        state: 'ready',
      });
      Alert.alert('Success', `YouTube Live (${visibility}) created & saved to course!`);
    } catch (e: any) {
      Alert.alert('YouTube Live Error', e?.message || 'Could not create YouTube broadcast.');
    } finally {
      setCreating(false);
    }
  };

  const handleTransition = async (nextStatus: 'live' | 'complete') => {
    if (!activeBroadcast) return;
    if (activeBroadcast.state === nextStatus) return;
    try {
      const tok = storedYtToken || (await loadLocalToken());
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-icc-admin-email': 'icckeguruji@gmail.com',
      };
      if (tok) headers['x-icc-yt-token'] = tok;

      const res = await fetch(`${API_BASE}/api/youtube/broadcast`, {
        method: 'POST',
        headers,
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
      if (nextStatus === 'live') {
        Alert.alert(
          'Live Started',
          data.pendingAutoStart
            ? 'Camera stream connected! YouTube Auto-Start is making your class LIVE.'
            : 'Broadcast is now LIVE on YouTube!'
        );
      } else if (!data.skipped) {
        Alert.alert('Updated', 'Broadcast ended & archived.');
      }
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
        <TouchableOpacity onPress={() => fetchYtStatus()} style={[styles.backBtn, { backgroundColor: isDark ? '#18181B' : '#F1F5F9' }]}>
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
                    ? 'Connected • Ready for Live Broadcast'
                    : 'Tap Connect to link your YouTube Channel'}
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
          <Text style={[styles.sectionTitle, { color: theme.text }]}>1. Class, Course, Subject & Chapter</Text>

          {/* Class Filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {CLASS_FILTERS.map((cls) => (
              <TouchableOpacity
                key={cls}
                onPress={() => setSelectedClass(cls)}
                style={[styles.chip, selectedClass === cls && styles.chipActive]}
              >
                <Text style={[styles.chipText, selectedClass === cls && styles.chipTextActive]}>{cls}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {visibleCourses.map((c) => (
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

          <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 4 }]}>2. Title, Visibility & Thumbnail</Text>

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

          {/* Visibility Selector */}
          <View style={styles.chipRow}>
            {(['unlisted', 'public', 'private'] as const).map((vis) => (
              <TouchableOpacity
                key={vis}
                onPress={() => setVisibility(vis)}
                style={[styles.chip, visibility === vis && styles.chipActive]}
              >
                <Text style={[styles.chipText, visibility === vis && styles.chipTextActive]}>
                  {vis.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Thumbnail URL + Device Picker */}
          <View style={styles.rowGap}>
            <TextInput
              style={[styles.input, { flex: 1, backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
              placeholderTextColor={theme.textMuted}
              placeholder="Thumbnail Image URL (Optional)"
              value={thumbnailUrl}
              onChangeText={setThumbnailUrl}
            />
            <TouchableOpacity
              onPress={handlePickThumbnail}
              style={[styles.pickThumbBtn, { backgroundColor: isDark ? '#1E293B' : '#EFF6FF' }]}
            >
              <ImageIcon size={16} color="#2563EB" />
              <Text style={{ fontSize: 11.5, fontWeight: '700', color: '#2563EB' }}>Pick</Text>
            </TouchableOpacity>
          </View>

          {thumbnailUrl ? (
            <View style={{ width: '100%', aspectRatio: 16 / 9, borderRadius: 10, overflow: 'hidden', backgroundColor: '#0F172A' }}>
              <Image source={{ uri: thumbnailUrl }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
            </View>
          ) : null}

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
                <Text style={styles.createBtnText}>Create YouTube Live ({visibility.toUpperCase()})</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Active Broadcast: In-App Live Camera + Controls */}
        {activeBroadcast && (
          <View style={[styles.card, { backgroundColor: theme.surfaceCard, borderColor: '#2563EB', borderWidth: 1.5 }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>3. In-App Live Camera & Stream</Text>
            <InAppRtmpBroadcaster
              rtmpUrl={
                activeBroadcast.streamKey
                  ? `${activeBroadcast.rtmpUrl.replace(/\/$/, '')}/${activeBroadcast.streamKey}`
                  : activeBroadcast.rtmpUrl
              }
              onLiveStarted={() => handleTransition('live')}
              onLiveStopped={() => handleTransition('complete')}
            />
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
  chipRow: { flexDirection: 'row', gap: 8, paddingVertical: 2 },
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
  pickThumbBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 10,
  },
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
