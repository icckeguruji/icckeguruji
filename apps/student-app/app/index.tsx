import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/store/useAuthStore';
import { translations } from '@icc/shared-utils';

export default function IndexScreen() {
  const router = useRouter();
  const { language, setLanguage, isAuthenticated } = useAuthStore();
  const t = translations[language];

  const handleStart = () => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    } else {
      router.push('/(auth)/login');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero Branding */}
        <View style={styles.heroSection}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoBadgeText}>ICC</Text>
          </View>
          <Text style={styles.appName}>
            IDEAL COACHING CENTRE
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
  langBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  langBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#1E293B',
  },
  langBtnActive: {
    backgroundColor: '#2563EB',
  },
  langText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  langTextActive: {
    color: '#FFFFFF',
  },
  heroSection: {
    alignItems: 'center',
    marginVertical: 40,
  },
  logoBadge: {
    width: 90,
    height: 90,
    borderRadius: 24,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 20,
  },
  logoBadgeText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  appName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  appHindiName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F59E0B',
    textAlign: 'center',
    marginTop: 4,
  },
  tagline: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
    maxWidth: 280,
  },
  boardBadgeRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 24,
  },
  boardBadge: {
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    borderColor: 'rgba(37, 99, 235, 0.4)',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  boardBadgeJac: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  boardBadgeText: {
    fontSize: 11,
    color: '#F8FAFC',
    fontWeight: '700',
  },
  actionSection: {
    gap: 12,
    marginBottom: 16,
  },
  primaryBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryBtn: {
    backgroundColor: '#1E293B',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  securityNote: {
    alignItems: 'center',
    marginTop: 8,
  },
  securityNoteText: {
    fontSize: 11,
    color: '#64748B',
  },
});
