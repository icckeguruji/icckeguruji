import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/useAuthStore';
import { translations, maskEmail } from '@icc/shared-utils';
import { supabase } from '../../src/lib/supabase';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { language } = useAuthStore();
  const t = translations[language];

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSendReset = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    const trimmed = email.trim().toLowerCase();

    if (!trimmed || !trimmed.includes('@')) {
      setErrorMsg(
        language === 'hi'
          ? 'कृपया मान्य ईमेल पता दर्ज करें'
          : 'Please enter a valid email address'
      );
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
        redirectTo: 'idealcoaching://reset-password',
      });

      if (error) {
        setErrorMsg(
          'Failed to send reset link. Please verify your email and try again.'
        );
        setLoading(false);
        return;
      }

      setSuccessMsg(trimmed);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.inner}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>
            Reset Password
          </Text>
          <Text style={styles.subtitle}>
            A password reset link will be sent to your email
          </Text>
        </View>

        {errorMsg ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        {successMsg ? (
          <View style={styles.successBox}>
            <Text style={styles.successTitle}>
              ✅ Reset Link Sent!
            </Text>
            <Text style={styles.successText}>
              {`A password reset link has been sent to ${maskEmail(successMsg)}. Please check your inbox and spam folder.`}
            </Text>
            <TouchableOpacity
              style={styles.backToLoginBtn}
              onPress={() => router.replace('/(auth)/login')}
            >
              <Text style={styles.backToLoginText}>
                Back to Login
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            <Text style={styles.label}>
              Email Address
            </Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email address"
              placeholderTextColor="#94A3B8"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
            />

            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
              onPress={handleSendReset}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.submitBtnText}>
                  Send Reset Link
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {!successMsg && (
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Remember your password?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.footerLink}>
                Log In
              </Text>
            </TouchableOpacity>
          </View>
        )}
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
  successBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#059669',
    marginBottom: 12,
    textAlign: 'center',
  },
  successText: {
    fontSize: 14,
    color: '#334155',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  backToLoginBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  backToLoginText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
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
