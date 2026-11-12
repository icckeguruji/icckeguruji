import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/useAuthStore';
import { translations } from '@icc/shared-utils';
import YoutubePlayer from 'react-native-youtube-iframe';

const { width } = Dimensions.get('window');

export default function RecordedLectureScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { language } = useAuthStore();
  const t = translations[language];

  const [playing, setPlaying] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const videoId = 'dQw4w9WgXcQ'; // High quality unlisted video ID

  return (
    <SafeAreaView style={styles.container}>
      {/* YouTube Native / Web Player */}
      <View style={styles.playerContainer}>
        {Platform.OS === 'web' ? (
          <iframe
            width="100%"
            height="220"
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <YoutubePlayer
            height={220}
            play={playing}
            videoId={videoId}
            onChangeState={(state) => {
              if (state === 'ended') setPlaying(false);
            }}
          />
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Lecture Info */}
        <View style={styles.infoSection}>
          <View style={styles.metaRow}>
            <Text style={styles.subjectBadge}>
              {language === 'hi' ? 'विज्ञान · कक्षा 10' : 'Science · Class 10'}
            </Text>
            <TouchableOpacity onPress={() => setBookmarked(!bookmarked)}>
              <Text style={{ fontSize: 18 }}>{bookmarked ? '⭐' : '☆'}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>
            {language === 'hi'
              ? 'लेक्चर 01: रासायनिक अभिक्रियाएँ एवं उनके प्रकार (परिचय एवं वर्गीकरण)'
              : 'Lec 01: Introduction to Chemical Reactions & Types (NCERT Masterclass)'}
          </Text>

          <Text style={styles.desc}>
            {language === 'hi'
              ? 'इस व्याख्यान में भौतिक एवं रासायनिक परिवर्तन में अंतर, अभिकारकों और उत्पादों की पहचान तथा रासायनिक समीकरण को संतुलित करने की प्रारंभिक विधि विस्तार से समझाई गई है।'
              : 'Detailed concept of physical vs chemical changes, identifying reactants and products, and balancing foundational equations.'}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionBtnText}>
              📑 {language === 'hi' ? 'लेक्चर नोट्स' : 'Lecture Notes'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionBtnText}>
              💬 {language === 'hi' ? 'शंका पूछें' : 'Ask Doubt'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Playlist: Next Lectures */}
        <View style={styles.playlistSection}>
          <Text style={styles.sectionHeading}>
            {language === 'hi' ? 'अध्याय 1 के अन्य व्याख्यान' : 'Chapter 1 Playlist'}
          </Text>

          <TouchableOpacity style={[styles.playItem, styles.playItemActive]}>
            <Text style={styles.playItemNum}>01</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.playItemTitle} numberOfLines={1}>
                रासायनिक अभिक्रियाओं का वर्गीकरण (Now Playing)
              </Text>
              <Text style={styles.playItemSub}>45 मिनट · वीडियो पूर्ण</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.playItem}>
            <Text style={styles.playItemNum}>02</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.playItemTitle} numberOfLines={1}>
                रासायनिक समीकरणों को संतुलित करना (Hit & Trial)
              </Text>
              <Text style={styles.playItemSub}>52 मिनट · अगला व्याख्यान</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.playItem}>
            <Text style={styles.playItemNum}>03</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.playItemTitle} numberOfLines={1}>
                संयोजन, वियोजन एवं विस्थापन अभिक्रियाएँ
              </Text>
              <Text style={styles.playItemSub}>48 मिनट · महत्वपूर्ण प्रश्न</Text>
            </View>
          </TouchableOpacity>
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
  playerContainer: {
    width: '100%',
    height: 220,
    backgroundColor: '#000000',
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
    backgroundColor: '#F1F5F9',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
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
  playItemNum: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2563EB',
  },
  playItemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  playItemSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
});
