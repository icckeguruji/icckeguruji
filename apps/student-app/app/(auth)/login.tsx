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
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/useAuthStore';
import { translations } from '@icc/shared-utils';
import { supabase, isSupabaseConfigured } from '../../src/lib/supabase';

export default function LoginScreen() {
  const router = useRouter();
  const { language } = useAuthStore();
  const t = translations[language];

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isMobile = (val: string) => /^\d{10}$/.test(val.trim());
  const isEmail = (val: string) => val.includes('@');

  const handleLogin = async () => {
    setErrorMsg('');
    const trimmedId = identifier.trim();
    const trimmedPw = password.trim();

    if (!trimmedId || trimmedId.length < 3) {
      setErrorMsg(
        language === 'hi'
          ? 'कृपया मान्य ईमेल या मोबाइल नंबर दर्ज करें'
          : 'Please enter a valid email or mobile number'
      );
      return;
    }
    if (!trimmedPw || trimmedPw.length < 6) {
      setErrorMsg(
        language === 'hi'
          ? 'कृपया पासवर्ड दर्ज करें (कम से कम 6 अक्षर)'
          : 'Please enter your password (at least 6 characters)'
      );
      return;
    }

    setLoading(true);

    try {
      let emailToUse = trimmedId;

      // If mobile number, look up email via RPC
      if (isMobile(trimmedId)) {
        const { data: rpcData, error: rpcError } = await supabase.rpc('get_email_by_phone', {
          phone: '+91' + trimmedId,
        });
        if (rpcError || !rpcData) {
          setErrorMsg(
            language === 'hi'
              ? 'यह मोबाइल नंबर पंजीकृत नहीं है।'
              : 'This mobile number is not registered.'
          );
          setLoading(false);
          return;
        }
        emailToUse = rpcData as string;
      } else if (!isEmail(trimmedId)) {
        setErrorMsg(
          language === 'hi'
            ? 'कृपया मान्य ईमेल या 10-अंकों का मोबाइल नंबर दर्ज करें'
            : 'Please enter a valid email or 10-digit mobile number'
        );
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password: trimmedPw,
      });

      if (error) {
        setErrorMsg(
          language === 'hi'
            ? 'ईमेल या पासवर्ड गलत है। कृपया पुनः प्रयास करें।'
            : 'Incorrect email or password. Please try again.'
        );
        setLoading(false);
        return;
      }

      router.replace('/(tabs)/');
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

        {errorMsg ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        {/* Login Form */}
        <View style={styles.form}>
          <Text style={styles.label}>
            {language === 'hi' ? 'ईमेल या मोबाइल नंबर' : 'Email or Mobile Number'}
          </Text>
          <TextInput
            style={styles.input}
            value={identifier}
            onChangeText={setIdentifier}
            placeholder={
              language === 'hi'
                ? '9876543210 या example@email.com'
                : '9876543210 or example@email.com'
            }
            placeholderTextColor="#94A3B8"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />

          <Text style={styles.label}>
            {language === 'hi' ? 'पासवर्ड' : 'Password'}
          </Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder={language === 'hi' ? 'पासवर्ड दर्ज करें' : 'Enter your password'}
            placeholderTextColor="#94A3B8"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Forgot Password Link */}
          <TouchableOpacity
            style={styles.forgotRow}
            onPress={() => router.push('/(auth)/forgot-password')}
          >
            <Text style={styles.forgotLink}>
              {language === 'hi' ? 'पासवर्ड भूल गए?' : 'Forgot Password?'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.submitBtnText}>{t.login}</Text>
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
    marginBottom: 16,
  },
  forgotRow: {
    alignItems: 'flex-end',
    marginBottom: 20,
    marginTop: -8,
  },
  forgotLink: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
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
