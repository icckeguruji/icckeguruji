import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/useAuthStore';
import { translations, maskEmail } from '@icc/shared-utils';
import { supabase, isSupabaseConfigured } from '../../src/lib/supabase';

export default function LoginScreen() {
  const router = useRouter();
  const { language } = useAuthStore();
  const t = translations[language];

  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSendOtp = async () => {
    setErrorMsg('');
    const trimmed = identifier.trim();

    if (!trimmed || trimmed.length < 3) {
      setErrorMsg(
        language === 'hi'
          ? 'कृपया मान्य मोबाइल नंबर, यूज़रनेम या ईमेल दर्ज करें'
          : 'Please enter a valid mobile number, username, or email'
      );
      return;
    }

    setLoading(true);

    try {
      if (isSupabaseConfigured) {
        // Call backend Edge Function / RPC for identifier resolution and Email OTP trigger
        const { data, error } = await supabase.functions.invoke('auth-lookup', {
          body: { identifier: trimmed },
        });

        if (error || !data.success) {
          setErrorMsg(data?.message || 'लॉगिन में त्रुटि हुई। कृपया पुनः प्रयास करें।');
          setLoading(false);
          return;
        }

        router.push({
          pathname: '/(auth)/verify-otp',
          params: {
            identifier: trimmed,
            maskedEmail: data.masked_email || maskEmail(trimmed),
          },
        });
      } else {
        // Local fallback simulation with realistic masked email
        setTimeout(() => {
          setLoading(false);
          router.push({
            pathname: '/(auth)/verify-otp',
            params: {
              identifier: trimmed,
              maskedEmail: trimmed.includes('@')
                ? maskEmail(trimmed)
                : 'r****r@example.com',
            },
          });
        }, 800);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'त्रुटि हुई। कृपया थोड़ी देर बाद प्रयास करें।');
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.inner}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{t.login}</Text>
          <Text style={styles.subtitle}>
            {language === 'hi'
              ? 'आइडियल कोचिंग सेंटर विद्यार्थी पोर्टल'
              : 'Ideal Coaching Centre Student Portal'}
          </Text>
        </View>

        {/* Security Alert: Strict Email OTP Notice */}
        <View style={styles.alertCard}>
          <Text style={styles.alertTitle}>
            🛡️ {language === 'hi' ? 'महत्वपूर्ण सुरक्षा सूचना' : 'Security Notice'}
          </Text>
          <Text style={styles.alertText}>
            {language === 'hi'
              ? 'आप मोबाइल नंबर, यूज़रनेम या ईमेल में से कोई भी दर्ज कर सकते हैं। लेकिन ओटीपी केवल आपके पंजीकृत ईमेल पते पर भेजा जाएगा। कोई एसएमएस नहीं भेजा जाएगा।'
              : 'You may log in using your Mobile Number, Username, or Email. However, the OTP will strictly be sent only to your registered email address. No SMS OTP is used.'}
          </Text>
        </View>

        {errorMsg ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        {/* Single Input Field */}
        <View style={styles.form}>
          <Text style={styles.label}>
            {language === 'hi'
              ? 'मोबाइल नंबर / यूज़रनेम / ईमेल'
              : 'Mobile Number / Username / Email'}
          </Text>
          <TextInput
            style={styles.input}
            value={identifier}
            onChangeText={setIdentifier}
            placeholder={
              language === 'hi'
                ? '9876543210 या यूज़रनेम या ईमेल'
                : 'Enter Mobile / Username / Email'
            }
            placeholderTextColor="#94A3B8"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleSendOtp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.submitBtnText}>{t.sendOtp}</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Bottom Register Switch */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {language === 'hi' ? 'नया विद्यार्थी हैं?' : 'New student?'}{' '}
          </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.footerLink}>{t.register}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  inner: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    marginTop: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  backBtnText: {
    fontSize: 18,
    color: '#0F172A',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
  alertCard: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginVertical: 16,
  },
  alertTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E3A8A',
    marginBottom: 4,
  },
  alertText: {
    fontSize: 11,
    color: '#1D4ED8',
    lineHeight: 16,
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
  },
  form: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0F172A',
    marginBottom: 20,
  },
  submitBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  footerText: {
    fontSize: 13,
    color: '#64748B',
  },
  footerLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
});
