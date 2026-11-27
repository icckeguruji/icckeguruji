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

const API_BASE = 'https://icconline.vercel.app';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { language } = useAuthStore();
  const t = translations[language];

  const [step, setStep] = useState<'request' | 'verify' | 'success'>('request');
  const [identifier, setIdentifier] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [resolvedEmail, setResolvedEmail] = useState('');
  const [backupOtpNotice, setBackupOtpNotice] = useState('');

  const handleSendOtp = async () => {
    setErrorMsg('');
    setBackupOtpNotice('');
    const trimmed = identifier.trim().toLowerCase();

    if (!trimmed) {
      setErrorMsg('Please enter your registered Email or Mobile Number');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          identifier: trimmed,
          email: trimmed.includes('@') ? trimmed : undefined,
          type: 'password_reset',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        // Fallback to Supabase resetPasswordForEmail if direct email was entered
        if (trimmed.includes('@')) {
          const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
            redirectTo: 'idealcoaching://reset-password',
          });
          if (!error) {
            setResolvedEmail(trimmed);
            setStep('success');
            setLoading(false);
            return;
          }
        }
        setErrorMsg(data.error || 'Failed to send 6-digit OTP. Please check your email/mobile.');
        setLoading(false);
        return;
      }

      setResolvedEmail(data.email || trimmed);
      if (data.otp) {
        setBackupOtpNotice(`Backup OTP Code: ${data.otp}`);
      }
      setStep('verify');
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndReset = async () => {
    setErrorMsg('');
    if (otpCode.trim().length !== 6) {
      setErrorMsg('Please enter the 6-digit OTP sent to your email.');
      return;
    }
    if (newPassword.trim().length < 6) {
      setErrorMsg('New password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset_password',
          email: resolvedEmail || identifier.trim(),
          otp: otpCode.trim(),
          newPassword: newPassword.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Invalid or expired OTP. Please try again.');
        setLoading(false);
        return;
      }
      setStep('success');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to reset password.');
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
            Reset Password (OTP)
          </Text>
          <Text style={styles.subtitle}>
            {step === 'request'
              ? 'A 6-digit verification OTP will be sent to your registered email'
              : step === 'verify'
              ? `Enter the 6-digit OTP sent to ${maskEmail(resolvedEmail || identifier)}`
              : 'Password updated successfully'}
          </Text>
        </View>

        {errorMsg ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        {backupOtpNotice ? (
          <View style={[styles.errorBox, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
            <Text style={[styles.errorText, { color: '#1D4ED8' }]}>{backupOtpNotice}</Text>
          </View>
        ) : null}

        {step === 'success' ? (
          <View style={styles.successBox}>
            <Text style={styles.successTitle}>
              ✅ Password Reset Complete!
            </Text>
            <Text style={styles.successText}>
              {`Your password for ${maskEmail(resolvedEmail || identifier)} has been updated. You can now log in with your new password.`}
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
        ) : step === 'verify' ? (
          <View style={styles.form}>
            <Text style={styles.label}>6-Digit Email OTP</Text>
            <TextInput
              style={styles.input}
              value={otpCode}
              onChangeText={setOtpCode}
              placeholder="Enter 6-digit OTP"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
              maxLength={6}
            />

            <Text style={styles.label}>New Password</Text>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Minimum 6 characters"
              placeholderTextColor="#94A3B8"
              secureTextEntry
            />

            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
              onPress={handleVerifyAndReset}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.submitBtnText}>Verify OTP & Reset Password</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            <Text style={styles.label}>
              Email Address or Mobile Number
            </Text>
            <TextInput
              style={styles.input}
              value={identifier}
              onChangeText={setIdentifier}
              placeholder="Enter your email or mobile number"
              placeholderTextColor="#94A3B8"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
            />

            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
              onPress={handleSendOtp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.submitBtnText}>
                  Send 6-Digit OTP
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {step !== 'success' && (
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
