import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/useAuthStore';
import { translations, maskEmail } from '@icc/shared-utils';
import { BoardCode } from '@icc/shared-types';

export default function RegisterScreen() {
  const router = useRouter();
  const { language, setBoard } = useAuthStore();
  const t = translations[language];

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [boardCode, setBoardCode] = useState<BoardCode>('BSEB');
  const [className, setClassName] = useState('Class 10');
  const [district, setDistrict] = useState('Patna');
  const [schoolName, setSchoolName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRegister = async () => {
    setErrorMsg('');

    if (!fullName.trim() || !username.trim() || !mobileNumber.trim() || !email.trim()) {
      setErrorMsg('Please fill all required fields');
      return;
    }

    if (!email.includes('@')) {
      setErrorMsg('Enter a valid email address');
      return;
    }

    if (mobileNumber.replace(/\D/g, '').length < 10) {
      setErrorMsg('Enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setBoard(boardCode);
      useAuthStore.getState().setUser({
        id: `u-${Date.now()}`,
        username: username.trim(),
        full_name: fullName.trim(),
        mobile_number: mobileNumber.trim(),
        email: email.trim(),
        board_code: boardCode,
        class_id: 'c0000000-0000-0000-0000-000000000010',
        district: district.trim(),
        school_name: schoolName.trim() || 'Ideal Coaching Centre',
        preferred_language: 'en',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      router.push({
        pathname: '/(auth)/verify-otp',
        params: {
          identifier: email,
          maskedEmail: maskEmail(email),
        },
      });
    }, 800);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.header}>
            <View style={styles.topBarRow}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <Text style={styles.backBtnText}>←</Text>
              </TouchableOpacity>
              <View style={styles.brandBadge}>
                <Image
                  source={require('../../assets/logo.png')}
                  style={styles.headerLogo}
                  resizeMode="contain"
                />
                <Text style={styles.brandTitle}>IDEAL COACHING CENTRE</Text>
              </View>
            </View>
            <Text style={styles.title}>Student Registration</Text>
            <Text style={styles.subtitle}>
              BSEB & JAC Board • Dir: BADE SIR
            </Text>
          </View>

          {/* Security Alert */}
          <View style={styles.alertCard}>
            <Text style={styles.alertTitle}>
              🛡️ Registration Policy
            </Text>
            <Text style={styles.alertText}>
              Please provide an active email for OTP verification. Once registered, you may log in via email, mobile number, or username.
            </Text>
          </View>

          {errorMsg ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            {/* Full Name */}
            <View style={styles.field}>
              <Text style={styles.label}>
                Full Name *
              </Text>
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="e.g. Rohit Kumar"
                placeholderTextColor="#94A3B8"
              />
            </View>

            {/* Username */}
            <View style={styles.field}>
              <Text style={styles.label}>
                Unique Username *
              </Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="rohit_kumar"
                placeholderTextColor="#94A3B8"
                autoCapitalize="none"
              />
            </View>

            {/* Mobile Number */}
            <View style={styles.field}>
              <Text style={styles.label}>
                Mobile Number (10 digits) *
              </Text>
              <TextInput
                style={styles.input}
                value={mobileNumber}
                onChangeText={(t) => setMobileNumber(t.replace(/\D/g, '').slice(0, 10))}
                keyboardType="number-pad"
                placeholder="9876543210"
                placeholderTextColor="#94A3B8"
              />
            </View>

            {/* Email Address */}
            <View style={styles.field}>
              <Text style={styles.label}>
                Email Address (OTP Destination) *
              </Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="rohit@example.com"
                placeholderTextColor="#94A3B8"
              />
            </View>

            {/* Board Selection */}
            <View style={styles.field}>
              <Text style={styles.label}>
                Select Board *
              </Text>
              <View style={styles.chipRow}>
                <TouchableOpacity
                  style={[styles.chip, boardCode === 'BSEB' && styles.chipActive]}
                  onPress={() => setBoardCode('BSEB')}
                >
                  <Text
                    style={[styles.chipText, boardCode === 'BSEB' && styles.chipTextActive]}
                  >
                    Bihar Board (BSEB)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.chip, boardCode === 'JAC' && styles.chipActive]}
                  onPress={() => setBoardCode('JAC')}
                >
                  <Text
                    style={[styles.chipText, boardCode === 'JAC' && styles.chipTextActive]}
                  >
                    Jharkhand Board (JAC)
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Class Selection */}
            <View style={styles.field}>
              <Text style={styles.label}>
                Class *
              </Text>
              <View style={styles.chipRow}>
                {['Class 9', 'Class 10', 'Class 11', 'Class 12'].map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.chipSmall, className === c && styles.chipActive]}
                    onPress={() => setClassName(c)}
                  >
                    <Text
                      style={[
                        styles.chipTextSmall,
                        className === c && styles.chipTextActive,
                      ]}
                    >
                      {c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* District */}
            <View style={styles.field}>
              <Text style={styles.label}>
                District *
              </Text>
              <TextInput
                style={styles.input}
                value={district}
                onChangeText={setDistrict}
                placeholder="e.g. Patna, Ranchi"
                placeholderTextColor="#94A3B8"
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.submitBtnText}>
                  Register & Get OTP
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scroll: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    marginTop: 8,
    marginBottom: 16,
  },
  topBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerLogo: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    padding: 2,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    overflow: 'hidden',
  },
  brandTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  backBtnText: {
    fontSize: 18,
    color: '#0F172A',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  alertCard: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  alertTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E3A8A',
    marginBottom: 2,
  },
  alertText: {
    fontSize: 11,
    color: '#1D4ED8',
    lineHeight: 15,
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
    gap: 14,
  },
  field: {
    gap: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  chip: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
  },
  chipSmall: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
  },
  chipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  chipTextSmall: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  submitBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
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
});
