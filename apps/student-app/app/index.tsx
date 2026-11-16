import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/store/useAuthStore';
import { Sparkles, ArrowRight, BookOpen, GraduationCap, Award } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function IndexScreen() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [animationComplete, setAnimationComplete] = useState(false);

  // Animated values
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(0.8)).current;
  const ringOpacity = useRef(new Animated.Value(0.6)).current;
  const titleSlide = useRef(new Animated.Value(30)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(50)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Logo Pop & Spring Sequence
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Continuous Ambient Halo Pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(ringScale, {
          toValue: 1.25,
          duration: 1600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(ringScale, {
          toValue: 0.9,
          duration: 1400,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(ringOpacity, {
          toValue: 0.15,
          duration: 1600,
          useNativeDriver: true,
        }),
        Animated.timing(ringOpacity, {
          toValue: 0.7,
          duration: 1400,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 3. Staggered Text & Badges Entrance
    Animated.sequence([
      Animated.delay(400),
      Animated.parallel([
        Animated.timing(titleSlide, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(cardSlide, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      setAnimationComplete(true);
    });

    // 4. Progress Loading Bar
    Animated.timing(progressWidth, {
      toValue: 1,
      duration: 2200,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();

    // 5. Automatic transition for logged-in students or director
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        router.replace('/(tabs)');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [isAuthenticated, user]);

  const handleStart = () => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    } else {
      router.push('/(auth)/login');
    }
  };

  const progressBarInterpolate = progressWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Top Skip / Enter Action */}
      <View style={styles.topBar}>
        <View style={styles.topTag}>
          <GraduationCap size={14} color="#F59E0B" />
          <Text style={styles.topTagText}>BSEB & JAC Board</Text>
        </View>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleStart}
          activeOpacity={0.7}
        >
          <Text style={styles.skipText}>Enter ›</Text>
        </TouchableOpacity>
      </View>

      {/* Main Animated Intro Center */}
      <View style={styles.centerContainer}>
        {/* Animated Glowing Ring & Logo */}
        <View style={styles.logoWrapper}>
          <Animated.View
            style={[
              styles.glowHalo,
              {
                transform: [{ scale: ringScale }],
                opacity: ringOpacity,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.glowHaloOuter,
              {
                transform: [{ scale: ringScale }],
                opacity: ringOpacity,
              },
            ]}
          />

          <Animated.View
            style={[
              styles.logoCircle,
              {
                transform: [{ scale: logoScale }],
                opacity: logoOpacity,
              },
            ]}
          >
            <Image
              source={require('../assets/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </Animated.View>
        </View>

        {/* Animated Coaching Name */}
        <Animated.View
          style={[
            styles.textGroup,
            {
              transform: [{ translateY: titleSlide }],
              opacity: titleOpacity,
            },
          ]}
        >
          <Text style={styles.coachingTitle}>IDEAL COACHING CENTRE</Text>
          <Text style={styles.directorBadge}>
            Dir: BADE SIR • Sarotiya, Mahagama (Godda)
          </Text>
        </Animated.View>

        {/* Motivational Quote & Subtitle */}
        <Animated.View
          style={[
            styles.quoteContainer,
            {
              opacity: subtitleOpacity,
            },
          ]}
        >
          <View style={styles.quotePill}>
            <Sparkles size={13} color="#FBBF24" />
            <Text style={styles.quotePillText}>
              एक कदम सफलता की ओर • 100% बोर्ड रिज़ल्ट गारंटी
            </Text>
          </View>
          <Text style={styles.quoteDescription}>
            "सफलता का कोई शॉर्टकट नहीं होता, निरंतर अभ्यास ही सफलता की असली कुंजी है।"
          </Text>
        </Animated.View>

        {/* Board Badges */}
        <Animated.View
          style={[
            styles.boardRow,
            {
              opacity: subtitleOpacity,
            },
          ]}
        >
          <View style={styles.boardBadgeBseb}>
            <Text style={styles.boardBadgeTextBseb}>BIHAR BOARD (BSEB)</Text>
          </View>
          <View style={styles.boardBadgeJac}>
            <Text style={styles.boardBadgeTextJac}>JHARKHAND BOARD (JAC)</Text>
          </View>
        </Animated.View>
      </View>

      {/* Bottom Interactive Area */}
      <Animated.View
        style={[
          styles.bottomArea,
          {
            transform: [{ translateY: cardSlide }],
            opacity: cardOpacity,
          },
        ]}
      >
        {/* Animated Auto-load Indicator */}
        <View style={styles.loadingContainer}>
          <View style={styles.progressTrack}>
            <Animated.View
              style={[styles.progressBar, { width: progressBarInterpolate }]}
            />
          </View>
          <Text style={styles.progressLabel}>
            {isAuthenticated ? 'Opening Classroom Dashboard...' : 'Connecting to Live Academic Portal...'}
          </Text>
        </View>

        {/* Direct Action Button */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleStart}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>
            {isAuthenticated ? 'Go to Student Dashboard' : 'Sign In / Register'}
          </Text>
          <ArrowRight size={18} color="#0F172A" />
        </TouchableOpacity>

        <Text style={styles.copyrightText}>
          Trusted by Thousands of Toppers • Classes 1st to 12th
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D16',
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  topTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  topTagText: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '700',
  },
  skipButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.18)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  skipText: {
    color: '#93C5FD',
    fontSize: 12,
    fontWeight: '800',
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    marginVertical: 'auto',
  },
  logoWrapper: {
    position: 'relative',
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  glowHalo: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(37, 99, 235, 0.35)',
  },
  glowHaloOuter: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  logoCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  textGroup: {
    alignItems: 'center',
    marginBottom: 14,
  },
  coachingTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  directorBadge: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F59E0B',
    marginTop: 4,
    letterSpacing: 0.3,
  },
  quoteContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  quotePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    marginBottom: 8,
  },
  quotePillText: {
    color: '#FDE68A',
    fontSize: 11,
    fontWeight: '700',
  },
  quoteDescription: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: width * 0.85,
    fontStyle: 'italic',
  },
  boardRow: {
    flexDirection: 'row',
    gap: 8,
  },
  boardBadgeBseb: {
    backgroundColor: 'rgba(37, 99, 235, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  boardBadgeTextBseb: {
    color: '#BFDBFE',
    fontSize: 10,
    fontWeight: '800',
  },
  boardBadgeJac: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  boardBadgeTextJac: {
    color: '#A7F3D0',
    fontSize: 10,
    fontWeight: '800',
  },
  bottomArea: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
  },
  loadingContainer: {
    alignItems: 'center',
    gap: 6,
  },
  progressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#3B82F6',
  },
  progressLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '500',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F59E0B',
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  copyrightText: {
    color: '#475569',
    fontSize: 10,
    textAlign: 'center',
    fontWeight: '600',
  },
});
