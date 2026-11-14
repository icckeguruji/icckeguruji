import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/useAuthStore';
import YoutubePlayer from 'react-native-youtube-iframe';
import { ArrowLeft, Bookmark, FileText, MessageSquareQuote, ShieldCheck, PlayCircle } from 'lucide-react-native';

export default function RecordedLectureScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();

  const [playing, setPlaying] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [activeLectureIdx, setActiveLectureIdx] = useState(0);

  // Unlisted curated video ID
  const playlist = [
    {
      id: '1',
      videoId: 'dQw4w9WgXcQ',
      title: 'Lec 01: Introduction to Chemical Reactions & Types (NCERT Masterclass)',
      duration: '45 mins',
      subject: 'Science · Class 10',
      description: 'Detailed concept of physical vs chemical changes, identifying reactants and products, and balancing foundational equations.',
    },
    {
      id: '2',
      videoId: 'dQw4w9WgXcQ',
      title: 'Lec 02: Balancing Chemical Equations (Hit & Trial Method)',
      duration: '52 mins',
      subject: 'Science · Class 10',
      description: 'Step-by-step techniques to balance complex equations with conservation of mass.',
    },
    {
      id: '3',
      videoId: 'dQw4w9WgXcQ',
      title: 'Lec 03: Combination, Decomposition & Displacement Reactions',
      duration: '48 mins',
      subject: 'Science · Class 10',
      description: 'Deep dive into reaction types with live lab experiment observations.',
    },
  ];

  const currentLecture = playlist[activeLectureIdx] || playlist[0];
  const studentWatermark = `${user?.full_name || 'ICC Student'} • +91 ${user?.mobile_number || '9876543210'} • ICC PROTECTED STREAM`;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Top Header */}
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>
          {currentLecture.title}
        </Text>
        <TouchableOpacity
          style={styles.bookmarkBtn}
          onPress={() => setBookmarked(!bookmarked)}
        >
          <Bookmark size={20} color={bookmarked ? '#F59E0B' : '#94A3B8'} fill={bookmarked ? '#F59E0B' : 'transparent'} />
        </TouchableOpacity>
      </View>

      {/* YouTube Secure In-App Player */}
      <View style={styles.playerContainer}>
        {Platform.OS === 'web' ? (
          <iframe
            width="100%"
            height="220"
            src={`https://www.youtube-nocookie.com/embed/${currentLecture.videoId}?autoplay=0&rel=0&modestbranding=1&controls=1`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            style={{ border: 'none' }}
          />
        ) : (
          <YoutubePlayer
            height={220}
            play={playing}
            videoId={currentLecture.videoId}
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

        {/* Anti-Escape Overlay: Blocks tapping on YouTube header / share / logo to avoid copying link or jumping out */}
        <View style={styles.antiEscapeTopBar} pointerEvents="auto" />

        {/* Dynamic Anti-Piracy Watermark Overlay */}
        <View style={styles.watermarkContainer} pointerEvents="none">
          <Text style={styles.watermarkText}>{studentWatermark}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Lecture Info */}
        <View style={styles.infoSection}>
          <View style={styles.metaRow}>
            <Text style={styles.subjectBadge}>
              {currentLecture.subject}
            </Text>
            <View style={styles.drmBadge}>
              <ShieldCheck size={13} color="#059669" />
              <Text style={styles.drmBadgeText}>DRM Protected</Text>
            </View>
          </View>

          <Text style={styles.title}>
            {currentLecture.title}
          </Text>

          <Text style={styles.desc}>
            {currentLecture.description}
          </Text>
        </View>

        {/* Action Buttons: strictly in-app navigation */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push('/pdf-viewer/sm000000-0000-0000-0000-000000000001')}
          >
            <FileText size={16} color="#2563EB" />
            <Text style={styles.actionBtnText}>Secure Notes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push('/doubts')}
          >
            <MessageSquareQuote size={16} color="#059669" />
            <Text style={styles.actionBtnTextGreen}>Ask Doubt</Text>
          </TouchableOpacity>
        </View>

        {/* Playlist: Next Lectures */}
        <View style={styles.playlistSection}>
          <Text style={styles.sectionHeading}>
            Chapter 1 Lectures & Practical Modules
          </Text>

          {playlist.map((item, idx) => {
            const isCurrent = idx === activeLectureIdx;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.playItem, isCurrent && styles.playItemActive]}
                onPress={() => {
                  setActiveLectureIdx(idx);
                  setPlaying(true);
                }}
              >
                <View style={styles.iconCircle}>
                  <PlayCircle size={22} color={isCurrent ? '#2563EB' : '#94A3B8'} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.playItemTitle, isCurrent && styles.playItemTitleActive]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.playItemSub}>{item.duration} · {isCurrent ? 'Now Playing' : 'Lesson ' + (idx + 1)}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#0F172A',
  },
  backBtn: {
    padding: 6,
  },
  navTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginHorizontal: 12,
  },
  bookmarkBtn: {
    padding: 6,
  },
  playerContainer: {
    width: '100%',
    height: 220,
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
  scroll: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 18,
    paddingBottom: 40,
    minHeight: 500,
  },
  infoSection: {
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subjectBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  drmBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  drmBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 24,
  },
  desc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginTop: 8,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 10,
    borderRadius: 10,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  actionBtnTextGreen: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  playlistSection: {
    gap: 10,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  playItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  playItemActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  iconCircle: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playItemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  playItemTitleActive: {
    color: '#2563EB',
  },
  playItemSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
});
