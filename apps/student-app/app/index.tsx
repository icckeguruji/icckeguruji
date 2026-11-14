import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/store/useAuthStore';

export default function IndexScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const handleStart = () => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    } else {
      router.push('/(auth)/login');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero Branding with Authentic Logo */}
        <View style={styles.heroSection}>
          <View style={styles.logoCircle}>
            <Image
              source={require('../assets/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.appName}>
            IDEAL COACHING CENTRE
          </Text>
          <Text style={styles.directorBadge}>
            Dir: BADE SIR • Sarotiya, Mahagama (Godda)
          </Text>
          <Text style={styles.tagline}>
            Complete Digital Learning for BSEB & JAC State Board Students
          </Text>

          {/* Supported Boards Badge */}
          <View style={styles.boardBadgeRow}>
            <View style={styles.boardBadge}>
              <Text style={styles.boardBadgeText}>
                Bihar Board (BSEB)
              </Text>
            </View>
            <View style={[styles.boardBadge, styles.boardBadgeJac]}>
              <Text style={styles.boardBadgeText}>
                Jharkhand Board (JAC)
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity style={styles.primaryBtn} onPress={handleStart}>
            <Text style={styles.primaryBtnText}>
              {isAuthenticated ? 'Open Student Dashboard' : 'Sign In to Portal'}
            </Text>
          </TouchableOpacity>

          {!isAuthenticated && (
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => router.push('/(auth)/register')}
            >
              <Text style={styles.secondaryBtnText}>Register New Account</Text>
            </TouchableOpacity>
          )}

          <View style={styles.securityNote}>
            <Text style={styles.securityNoteText}>
              🔒 Secure OTP & Password Authentication · Direct Faculty Support
            </Text>
          </View>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    padding: 24,
  },
  heroSection: {
    alignItems: 'center',
    paddingTop: 36,
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  appName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  directorBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F59E0B',
    marginTop: 4,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 290,
  },
  boardBadgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 18,
  },
  boardBadge: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  boardBadgeJac: {
    backgroundColor: '#065F46',
  },
  boardBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionSection: {
    gap: 12,
    paddingBottom: 20,
  },
  primaryBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryBtn: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#CBD5E1',
  },
  securityNote: {
    marginTop: 8,
    alignItems: 'center',
  },
  securityNoteText: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
  },
});
