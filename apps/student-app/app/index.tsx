import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/store/useAuthStore';

export default function IndexScreen() {
  const router = useRouter();
  const { isAuthenticated, initAuthStore } = useAuthStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function start() {
      try {
        await initAuthStore();
      } catch {}
      if (mounted) {
        setChecking(false);
      }
    }
    start();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (checking) return;
    if (isAuthenticated) {
      router.replace('/(tabs)');
    } else {
      router.replace('/(auth)/login');
    }
  }, [checking, isAuthenticated]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoCircle}>
          <Image
            source={require('../assets/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.brandTitle}>IDEAL COACHING CENTRE</Text>
        <Text style={styles.brandSub}>Dir: BADE SIR • Mahagama (Godda)</Text>
        <Text style={styles.boardTag}>BSEB & JAC Board • Classes 1st to 12th</Text>
        <ActivityIndicator size="small" color="#F59E0B" style={styles.loader} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#F59E0B',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  logoImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 6,
  },
  brandSub: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F59E0B',
    textAlign: 'center',
    marginBottom: 6,
  },
  boardTag: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    textAlign: 'center',
  },
  loader: {
    marginTop: 28,
  },
});
