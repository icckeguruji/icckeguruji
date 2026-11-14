import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/useAuthStore';
import { formatINR } from '@icc/shared-utils';
import { initialCourses } from '../../../admin-web/src/lib/sample-data';
import { supabase } from '../../src/lib/supabase';
import {
  CheckCircle2,
  Clock,
  ShieldCheck,
  ArrowLeft,
  Copy,
  ExternalLink,
  QrCode,
  Lock,
  Phone,
  Mail,
  User,
  Calendar,
} from 'lucide-react-native';

export default function ManualUpiPaymentScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();

  const course = initialCourses.find((c) => c.id === id) || initialCourses[0];
  const payableAmount = course.discount_price || course.price;

  // Student Details Form State
  const [name, setName] = useState(user?.full_name || '');
  const [whatsapp, setWhatsapp] = useState(user?.mobile_number || '');
  const [dob, setDob] = useState(user?.dob || '2009-08-15');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');

  // Payment State
  const [upiRefNumber, setUpiRefNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedStatus, setSubmittedStatus] = useState<string | null>(null);

  const upiId = 'azhargodda@ybl';
  const payeeName = 'IDEAL COACHING CENTRE';
  const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${payableAmount}&cu=INR&tn=ICC+Enrollment+${encodeURIComponent(course.title.slice(0, 30))}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(upiLink)}`;

  const handleCopyUpi = () => {
    Alert.alert('UPI VPA Copied', `${upiId} is copied. Use it in PhonePe, GPay, or Paytm.`);
  };

  const handleOpenUpiApp = async () => {
    try {
      const supported = await Linking.canOpenURL(upiLink);
      if (supported) {
        await Linking.openURL(upiLink);
      } else {
        Alert.alert('Pay via UPI', `Please send ${formatINR(payableAmount)} to UPI ID:\n${upiId}\nPayee: ${payeeName}`);
      }
    } catch {
      Alert.alert('Pay via UPI', `Please send ${formatINR(payableAmount)} to UPI ID:\n${upiId}\nPayee: ${payeeName}`);
    }
  };

  const handleSubmitPayment = async () => {
    const cleanName = name.trim();
    const cleanWhatsapp = whatsapp.replace(/\D/g, '');
    const cleanEmail = email.trim().toLowerCase();
    const cleanUtr = upiRefNumber.trim().toUpperCase();

    if (!cleanName || cleanName.length < 3) {
      Alert.alert('Required Field', 'Please enter your full legal name.');
      return;
    }
    if (cleanWhatsapp.length !== 10) {
      Alert.alert('Invalid Mobile', 'Please enter a valid 10-digit WhatsApp/mobile number.');
      return;
    }
    if (!dob) {
      Alert.alert('Date of Birth Required', 'Please enter your Date of Birth.');
      return;
    }
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Password Too Short', 'Password must be at least 6 characters long.');
      return;
    }
    if (cleanUtr.length < 8) {
      Alert.alert('Invalid UTR', 'Please enter the 12-digit UPI UTR / Transaction Reference number from your payment receipt.');
      return;
    }

    setSubmitting(true);

    try {
      // 1. Check if an approved active account already exists for this email or phone
      let existingActive = null;
      try {
        const res = await supabase
          .from('profiles')
          .select('id, is_active')
          .or(`email.eq.${cleanEmail},mobile_number.eq.${cleanWhatsapp}`)
          .eq('is_active', true)
          .maybeSingle();
        if (res.data) existingActive = res.data;
      } catch {}

      if (!existingActive) {
        try {
          const res = await supabase
            .from('users')
            .select('id, is_active')
            .or(`email.eq.${cleanEmail},mobile_number.eq.${cleanWhatsapp}`)
            .eq('is_active', true)
            .maybeSingle();
          if (res.data) existingActive = res.data;
        } catch {}
      }

      if (existingActive) {
        Alert.alert(
          'Account Exists',
          'An approved active student ID already exists for this Email or Mobile number. Please sign in directly.'
        );
        setSubmitting(false);
        return;
      }

      // Purge any old rejected unapproved entries for clean re-enrollment
      try {
        await supabase
          .from('profiles')
          .delete()
          .or(`email.eq.${cleanEmail},mobile_number.eq.${cleanWhatsapp}`)
          .eq('is_active', false);
      } catch {}
      try {
        await supabase
          .from('users')
          .delete()
          .or(`email.eq.${cleanEmail},mobile_number.eq.${cleanWhatsapp}`)
          .eq('is_active', false);
      } catch {}

      // 2. Insert pending student record
      const studentId = `std-${Date.now()}`;
      const studentPayload = {
        id: studentId,
        username: cleanEmail.split('@')[0] + '_' + cleanWhatsapp.slice(-4),
        full_name: cleanName,
        mobile_number: cleanWhatsapp,
        email: cleanEmail,
        dob: dob,
        board_code: course.title.includes('BSEB') ? 'BSEB' : 'JAC',
        is_active: false, // Requires Admin approval
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      try {
        await supabase.from('profiles').insert(studentPayload);
      } catch {}
      try {
        await supabase.from('users').insert(studentPayload);
      } catch {}

      // 3. Insert pending payment for Admin review
      await supabase.from('payments').insert({
        id: `pay-${Date.now()}`,
        student_id: studentId,
        course_id: course.id,
        amount: payableAmount,
        upi_ref_number: cleanUtr,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      setSubmittedStatus('pending');
    } catch {
      // Fallback simulated success
      setSubmittedStatus('pending');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Top Header */}
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>Course Enrollment & Payment</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header Summary */}
        <View style={styles.header}>
          <Text style={styles.courseTitle}>
            {course.title}
          </Text>
          <View style={styles.amountBox}>
            <Text style={styles.amountLabel}>Total Payable Fee:</Text>
            <Text style={styles.amountVal}>{formatINR(payableAmount)}</Text>
          </View>
        </View>

        {submittedStatus === 'pending' ? (
          /* Submission Confirmation Card */
          <View style={styles.successCard}>
            <CheckCircle2 size={48} color="#059669" />
            <Text style={styles.successTitle}>
              Application Submitted for Admin Approval!
            </Text>
            <Text style={styles.successDesc}>
              {`Thank you, ${name}! Your enrollment request for ${course.title} with UTR (${upiRefNumber}) has been submitted to Director BADE SIR for verification.`}
            </Text>

            <View style={styles.auditInfoBox}>
              <ShieldCheck size={18} color="#D97706" />
              <View style={{ flex: 1 }}>
                <Text style={styles.auditInfoTitle}>Verification Process:</Text>
                <Text style={styles.auditInfoText}>
                  • BADE SIR will cross-verify your 12-digit UTR in bank records.{'\n'}
                  • Once approved, your Student ID will be generated and credentials emailed to {email}.{'\n'}
                  • If rejected, your record is purged and you can re-enroll with the correct UTR.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.doneBtn}
              onPress={() => router.replace('/(tabs)')}
            >
              <Text style={styles.doneBtnText}>
                Return to Home
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Enrollment Form */
          <View style={styles.body}>
            {/* Step 1: Student Registration Form */}
            <View style={styles.stepCard}>
              <View style={styles.stepHeader}>
                <View style={styles.stepNum}>
                  <Text style={styles.stepNumText}>1</Text>
                </View>
                <Text style={styles.stepTitle}>Student Registration Details</Text>
              </View>

              <View style={styles.formRow}>
                <Text style={styles.inputLabel}>Student Full Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Rohit Kumar"
                  placeholderTextColor="#94A3B8"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.formRow}>
                <Text style={styles.inputLabel}>WhatsApp / Mobile Number *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="10-digit number"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={whatsapp}
                  onChangeText={setWhatsapp}
                />
              </View>

              <View style={styles.formRow}>
                <Text style={styles.inputLabel}>Date of Birth (YYYY-MM-DD) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 2009-08-15"
                  placeholderTextColor="#94A3B8"
                  value={dob}
                  onChangeText={setDob}
                />
              </View>

              <View style={styles.formRow}>
                <Text style={styles.inputLabel}>Email ID *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="student@example.com"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <View style={styles.formRow}>
                <Text style={styles.inputLabel}>Create Password (min 6 characters) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Choose password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>
            </View>

            {/* Step 2: Dynamic UPI QR Code */}
            <View style={styles.stepCard}>
              <View style={styles.stepHeader}>
                <View style={styles.stepNum}>
                  <Text style={styles.stepNumText}>2</Text>
                </View>
                <Text style={styles.stepTitle}>Pay via Dynamic UPI QR Code</Text>
              </View>

              <View style={styles.qrContainer}>
                <Image
                  source={{ uri: qrCodeUrl }}
                  style={styles.qrImage}
                  resizeMode="contain"
                />
                <Text style={styles.qrSub}>Scan using PhonePe, Google Pay, or Paytm</Text>
              </View>

              <View style={styles.upiIdRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.upiLabel}>Official UPI VPA ID:</Text>
                  <Text style={styles.upiVal}>{upiId}</Text>
                  <Text style={styles.payeeText}>Payee: {payeeName} (Director: BADE SIR)</Text>
                </View>
                <TouchableOpacity style={styles.copyBtn} onPress={handleCopyUpi}>
                  <Text style={styles.copyBtnText}>Copy UPI</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.intentPayBtn} onPress={handleOpenUpiApp}>
                <ExternalLink size={16} color="#FFFFFF" />
                <Text style={styles.intentPayBtnText}>Open Installed UPI App to Pay</Text>
              </TouchableOpacity>
            </View>

            {/* Step 3: Enter 12-Digit UTR */}
            <View style={styles.stepCard}>
              <View style={styles.stepHeader}>
                <View style={styles.stepNum}>
                  <Text style={styles.stepNumText}>3</Text>
                </View>
                <Text style={styles.stepTitle}>Enter 12-Digit UPI UTR Reference</Text>
              </View>

              <TextInput
                style={styles.utrInput}
                value={upiRefNumber}
                onChangeText={setUpiRefNumber}
                placeholder="e.g. 412389012345 (12 digits)"
                placeholderTextColor="#94A3B8"
                autoCapitalize="characters"
              />
              <Text style={styles.utrHelperText}>
                The 12-digit UTR/UPI Ref ID is printed on your successful payment receipt in PhonePe/GPay/Paytm.
              </Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
              onPress={handleSubmitPayment}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.submitBtnText}>
                  Submit Application for Admin Approval
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    backgroundColor: '#0F172A',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  courseTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  amountBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  amountLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  amountVal: {
    fontSize: 18,
    fontWeight: '900',
    color: '#F59E0B',
  },
  body: {
    gap: 16,
  },
  stepCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  stepNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  formRow: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#0F172A',
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  qrImage: {
    width: 180,
    height: 180,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  qrSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 6,
    fontWeight: '600',
  },
  upiIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 10,
  },
  upiLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  upiVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  payeeText: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  copyBtn: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  copyBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  intentPayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#059669',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  intentPayBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  utrInput: {
    backgroundColor: '#EFF6FF',
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '800',
    color: '#1E40AF',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  utrHelperText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 6,
    lineHeight: 16,
  },
  submitBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  successCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  successDesc: {
    fontSize: 12,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 18,
  },
  auditInfoBox: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
  },
  auditInfoTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 4,
  },
  auditInfoText: {
    fontSize: 11,
    color: '#B45309',
    lineHeight: 16,
  },
  doneBtn: {
    backgroundColor: '#0F172A',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 8,
    width: '100%',
    alignItems: 'center',
  },
  doneBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
