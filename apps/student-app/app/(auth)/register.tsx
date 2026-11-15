import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BookOpen, ArrowRight } from 'lucide-react-native';

export default function RegisterScreen() {
  const router = useRouter();

  useEffect(() => {
    // Automatically redirect to courses since registration is course-enrollment only
    const timer = setTimeout(() => {
      router.replace('/(tabs)/courses');
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>IDEAL COACHING CENTRE</Text>
        <Text style={styles.subtitle}>BSEB & JAC Board • Sarotiya, Godda</Text>

        <View style={styles.infoBox}>
          <BookOpen size={28} color="#2563EB" />
          <Text style={styles.infoTitle}>Registration via Course Enrollment</Text>
          <Text style={styles.infoText}>
            At IDEAL COACHING CENTRE, student accounts are created directly when enrolling in a course.
            Redirecting you to our course catalog...
          </Text>
        </View>

        <ActivityIndicator size="small" color="#2563EB" style={{ marginVertical: 16 }} />

        <TouchableOpacity
          style={styles.btn}
          onPress={() => router.replace('/(tabs)/courses')}
        >
          <Text style={styles.btnText}>Browse Courses & Enroll</Text>
          <ArrowRight size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D97706',
    marginBottom: 20,
  },
  infoBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginVertical: 10,
    width: '100%',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E40AF',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 12,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 18,
  },
  btn: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
