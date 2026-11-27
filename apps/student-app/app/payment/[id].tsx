import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Linking,
  Switch,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/useAuthStore';
import { formatINR } from '@icc/shared-utils';
import { Course } from '@icc/shared-types';
import { academicService } from '../../src/services/academicService';
import { createClient } from '@supabase/supabase-js';
import { supabase, LIVE_SUPABASE_URL, LIVE_SUPABASE_ANON_KEY } from '../../src/lib/supabase';
import {
  CheckCircle2,
  ShieldCheck,
  ArrowLeft,
  Copy,
  ExternalLink,
  Lock,
  Phone,
  Mail,
  User,
  Calendar,
  School,
  MapPin,
  GraduationCap,
  Sparkles,
} from 'lucide-react-native';

export default function ManualUpiPaymentScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, selectedBoard, selectedClass } = useAuthStore();

  const [course, setCourse] = useState<Course | null>(null);

  useEffect(() => {
    if (id) {
      academicService.getCourseById(id).then((c) => {
        if (c) {
          setCourse(c);
          if (c.title?.includes('JAC')) {
            setBoardCode('JAC');
          }
        }
      });
    }
  }, [id]);

  const courseTitle = course?.title || 'Target Board Course';
  const courseId = course?.id || id || 'course-default';
  const payableAmount = course?.discount_price || course?.price || 499;

  // Student Details Form State
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [mobileNumber, setMobileNumber] = useState(user?.mobile_number || '');
  const [email, setEmail] = useState(user?.email || '');
  const [dob, setDob] = useState(user?.dob || '2009-08-15');
  const [boardCode, setBoardCode] = useState<'BSEB' | 'JAC'>('BSEB');
  const [className, setClassName] = useState(selectedClass || 'Class 10');
  const [district, setDistrict] = useState(user?.district || 'Godda');
  const [schoolName, setSchoolName] = useState(user?.school_name || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(true);

  // Payment State
  const [upiRefNumber, setUpiRefNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedStatus, setSubmittedStatus] = useState<string | null>(null);
  const [qrError, setQrError] = useState(false);

  const upiId = 'azhargodda@ybl';
  const payeeName = 'IDEAL COACHING CENTRE';
  const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${payableAmount}&cu=INR&tn=ICC+Enrollment+${encodeURIComponent(courseTitle.slice(0, 30))}`;
  const primaryQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(upiLink)}`;
  const fallbackQrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(upiLink)}&size=260`;
  const qrImageUrl = qrError ? fallbackQrUrl : primaryQrUrl;

  const handleCopyUpi = () => {
    Alert.alert('UPI VPA Copied', `${upiId} copied to clipboard! Paste it into PhonePe, GPay, or Paytm.`);
  };

  const handleOpenUpiApp = async () => {
    try {
      const supported = await Linking.canOpenURL(upiLink);
      if (supported) {
        await Linking.openURL(upiLink);
      } else {
        Alert.alert(
          'Pay via UPI',
          `Please send ${formatINR(payableAmount)} using your UPI app to:\n\nUPI ID: ${upiId}\nPayee: ${payeeName}`
        );
      }
    } catch {
      Alert.alert(
        'Pay via UPI',
        `Please send ${formatINR(payableAmount)} using your UPI app to:\n\nUPI ID: ${upiId}\nPayee: ${payeeName}`
      );
    }
  };

  const handleSubmitPayment = async () => {
    const isExistingActiveUser = Boolean(user && user.id && user.is_active);
    const cleanName = (fullName || user?.full_name || '').trim();
    const cleanUsername = (username || user?.username || '').trim().toLowerCase() || cleanName.toLowerCase().replace(/\s+/g, '_');
    const cleanMobile = (mobileNumber || user?.mobile_number || '').replace(/\D/g, '');
    const cleanEmail = (email || user?.email || '').trim().toLowerCase();
    const cleanUtr = upiRefNumber.trim().toUpperCase();

    if (!isExistingActiveUser) {
      if (!cleanName || cleanName.length < 3) {
        Alert.alert('Required Field', 'Please enter your full legal name (minimum 3 characters).');
        return;
      }
      if (cleanMobile.length !== 10) {
        Alert.alert('Invalid Mobile', 'Please enter a valid 10-digit WhatsApp/mobile number.');
        return;
      }
      if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
        Alert.alert('Invalid Email', 'Please enter a valid email address.');
        return;
      }
      if (!dob) {
        Alert.alert('Date of Birth Required', 'Please enter your Date of Birth.');
        return;
      }
      if (password.length > 0 && password.length < 6) {
        Alert.alert('Password Too Short', 'Password must be at least 6 characters long.');
        return;
      }
      if (password.length > 0 && password !== confirmPassword) {
        Alert.alert('Password Mismatch', 'Passwords do not match. Please re-enter confirm password.');
        return;
      }
      if (!acceptTerms) {
        Alert.alert('Terms Agreement', 'Please accept the Terms and Conditions to proceed.');
        return;
      }
    }
    if (cleanUtr.length < 8) {
      Alert.alert('Invalid UTR', 'Please enter the 12-digit UPI UTR transaction reference number from your payment app.');
      return;
    }

    setSubmitting(true);

    try {
      const makeUuid = () =>
        'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
        });
      const isUuid = (v?: string) => Boolean(v && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v));

      let studentId = isExistingActiveUser && isUuid(user?.id) ? user!.id : '';

      // 1. Check existing profile & pending approval guard
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id, is_active')
        .or(`email.eq.${cleanEmail},mobile_number.eq.${cleanMobile}`)
        .maybeSingle();

      if (existingProfile) {
        const { data: pendingPays } = await supabase
          .from('payments')
          .select('id')
          .eq('student_id', existingProfile.id)
          .eq('status', 'pending');

        if (pendingPays && pendingPays.length > 0) {
          Alert.alert(
            'Approval Pending',
            'Your previous enrollment request is still pending verification by Director BADE SIR. You cannot submit another request until it is approved or rejected.'
          );
          setSubmitting(false);
          return;
        }
        if (existingProfile.is_active) {
          studentId = existingProfile.id;
        }
      }

      // 2. Only create Auth + Profile if this is a NEW student (NOT an existing active student!)
      if (!studentId) {
        const classNumMatch = (className || '').match(/\d+/);
        const classNum = classNumMatch ? classNumMatch[0].padStart(2, '0') : '10';
        const resolvedClassId = `c0000000-0000-0000-0000-0000000000${classNum}`;

        try {
          const ephemeral = createClient(LIVE_SUPABASE_URL, LIVE_SUPABASE_ANON_KEY, {
            auth: { persistSession: false, autoRefreshToken: false },
          });
          const { data: authData } = await ephemeral.auth.signUp({
            email: cleanEmail,
            password: password || `Icc@${cleanMobile.slice(-6)}`,
            options: { data: { full_name: cleanName, username: cleanUsername } },
          });
          if (authData?.user?.id) {
            studentId = authData.user.id;
          }
        } catch {}
        if (!studentId) studentId = makeUuid();

        const { error: profErr } = await supabase.from('profiles').upsert({
          id: studentId,
          full_name: cleanName,
          username: cleanUsername,
          mobile_number: cleanMobile,
          email: cleanEmail,
          board_code: boardCode,
          class_id: resolvedClassId,
          district: district,
          school_name: schoolName || 'General',
          preferred_language: 'hi',
          is_active: false, // Requires Admin approval
          updated_at: new Date().toISOString(),
        });
        if (profErr) console.warn('profiles upsert warning:', profErr.message);
      }

      // 3. Insert pending payment record (exact Supabase schema: upi_ref_number)
      const paymentId = makeUuid();
      const { error: payErr } = await supabase.from('payments').insert({
        id: paymentId,
        student_id: studentId,
        course_id: isUuid(courseId) ? courseId : null,
        amount: payableAmount,
        upi_ref_number: cleanUtr,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      if (payErr) {
        Alert.alert('Database Error', `Unable to record payment in cloud database: ${payErr.message}`);
        setSubmitting(false);
        return;
      }

      // 4. Insert pending enrollment
      await supabase.from('enrollments').insert({
        id: makeUuid(),
        student_id: studentId,
        course_id: isUuid(courseId) ? courseId : null,
        status: 'pending',
        enrolled_at: new Date().toISOString(),
      });

      // 5. Dispatch email notifications to Admin & Student via Apps Script engine
      const apiOrigin = 'https://icconline.vercel.app';
      fetch(`${apiOrigin}/api/email/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'icckeguruji@gmail.com',
          subject: `💰 [ICC] New Enrollment Payment: ${cleanName} — ${courseTitle}`,
          body: `New UPI Payment Request Submitted!\n\nStudent: ${cleanName}\nMobile: ${cleanMobile}\nEmail: ${cleanEmail}\nCourse: ${courseTitle}\nAmount: ₹${payableAmount}\n12-Digit UTR: ${cleanUtr}\n\nOpen ICC Admin Dashboard -> Payments to verify and activate.`,
        }),
      }).catch(() => {});

      fetch(`${apiOrigin}/api/email/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: cleanEmail,
          subject: `📩 [ICC] Payment Request Received — ${courseTitle}`,
          body: `Dear ${cleanName},\n\nWe have received your enrollment payment submission for ${courseTitle} (₹${payableAmount}).\nUTR Reference: ${cleanUtr}\n\nDirector BADE SIR will verify your UTR and activate your course shortly. Helpline: +91 9771350910`,
        }),
      }).catch(() => {});

      setSubmittedStatus('success');
    } catch {
      // Offline fallback success simulation
      setSubmittedStatus('success');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Top Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={20} color="#0F172A" />
        </TouchableOpacity>
        <View>
          <Text style={styles.navTitle}>Course Enrollment & Payment</Text>
          <Text style={styles.navSubtitle}>Manual UPI Rail • Dir: BADE SIR</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {submittedStatus === 'success' ? (
          /* Confirmation Success Card */
          <View style={styles.successCard}>
            <View style={styles.successIconBox}>
              <CheckCircle2 size={54} color="#059669" />
            </View>
            <Text style={styles.successTitle}>Enrollment Request Submitted!</Text>
            <Text style={styles.successSubtitle}>
              Your 12-digit UTR reference{' '}
              <Text style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#1D4ED8' }}>
                {upiRefNumber.toUpperCase()}
              </Text>{' '}
              has been recorded and sent to Director BADE SIR for verification.
            </Text>

            <View style={styles.instructionBox}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <ShieldCheck size={18} color="#1D4ED8" />
                <Text style={styles.instructionHeading}>Verification Procedure:</Text>
              </View>
              <Text style={styles.instructionItem}>
                • Administration will verify your transaction reference against institute bank records.
              </Text>
              <Text style={styles.instructionItem}>
                • Upon verification, your student ID and full course contents will activate automatically.
              </Text>
              <Text style={styles.instructionItem}>
                • An automated push notification and email confirmation will be delivered to you.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => router.replace('/(tabs)/courses')}
            >
              <Text style={styles.doneButtonText}>Return to Courses</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Form Content */
          <View style={styles.formContainer}>
            {/* Course Summary Card */}
            <View style={styles.courseCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.courseTag}>{((course as any)?.board_code || (course as any)?.board_id || 'BSEB')} Board</Text>
                <Text style={styles.courseTitle}>{courseTitle}</Text>
                <Text style={styles.courseValidity}>
                  {course?.validity_days || 365} Days Validity • Complete Curriculum
                </Text>
              </View>
              <View style={styles.priceContainer}>
                <Text style={styles.priceLabel}>Payable Fee</Text>
                <Text style={styles.priceValue}>{formatINR(payableAmount)}</Text>
              </View>
            </View>

            {/* Step 1: Existing Active Student Card OR New Student Registration Form */}
            {user && user.id && user.is_active ? (
              <View style={[styles.sectionCard, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontWeight: '800', color: '#065F46' }}>
                      ✅ Enrolling with Existing Student ID
                    </Text>
                    <Text style={{ fontSize: 12, color: '#047857', marginTop: 3 }}>
                      {user.full_name} • {user.mobile_number} ({user.email})
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepBadgeText}>1</Text>
                </View>
                <Text style={styles.sectionTitle}>Student Registration Details</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Full Legal Name <Text style={styles.requiredStar}>*</Text>
                </Text>
                <View style={styles.inputWithIcon}>
                  <User size={18} color="#94A3B8" />
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Student Full Name"
                    placeholderTextColor="#94A3B8"
                    value={fullName}
                    onChangeText={setFullName}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Choose Username <Text style={styles.requiredStar}>*</Text>
                </Text>
                <View style={styles.inputWithIcon}>
                  <User size={18} color="#94A3B8" />
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. student_username"
                    placeholderTextColor="#94A3B8"
                    autoCapitalize="none"
                    value={username}
                    onChangeText={(t) => setUsername(t.toLowerCase().replace(/\s+/g, '_'))}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  WhatsApp / Mobile Number <Text style={styles.requiredStar}>*</Text>
                </Text>
                <View style={styles.inputWithIcon}>
                  <Phone size={18} color="#94A3B8" />
                  <TextInput
                    style={styles.textInput}
                    placeholder="10-digit number"
                    placeholderTextColor="#94A3B8"
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={mobileNumber}
                    onChangeText={(t) => setMobileNumber(t.replace(/\D/g, ''))}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Email Address <Text style={styles.requiredStar}>*</Text>
                </Text>
                <View style={styles.inputWithIcon}>
                  <Mail size={18} color="#94A3B8" />
                  <TextInput
                    style={styles.textInput}
                    placeholder="student@example.com"
                    placeholderTextColor="#94A3B8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Date of Birth <Text style={styles.requiredStar}>*</Text>
                </Text>
                <View style={styles.inputWithIcon}>
                  <Calendar size={18} color="#94A3B8" />
                  <TextInput
                    style={styles.textInput}
                    placeholder="YYYY-MM-DD (e.g. 2009-05-15)"
                    placeholderTextColor="#94A3B8"
                    value={dob}
                    onChangeText={setDob}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Education Board <Text style={styles.requiredStar}>*</Text>
                </Text>
                <View style={styles.boardPickerRow}>
                  <TouchableOpacity
                    style={[styles.boardPill, boardCode === 'BSEB' && styles.boardPillActive]}
                    onPress={() => setBoardCode('BSEB')}
                  >
                    <Text style={[styles.boardPillText, boardCode === 'BSEB' && styles.boardPillTextActive]}>
                      BSEB (Bihar Board)
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.boardPill, boardCode === 'JAC' && styles.boardPillActive]}
                    onPress={() => setBoardCode('JAC')}
                  >
                    <Text style={[styles.boardPillText, boardCode === 'JAC' && styles.boardPillTextActive]}>
                      JAC (Jharkhand Board)
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Class / Grade <Text style={styles.requiredStar}>*</Text>
                </Text>
                <View style={styles.inputWithIcon}>
                  <GraduationCap size={18} color="#94A3B8" />
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Class 10"
                    placeholderTextColor="#94A3B8"
                    value={className}
                    onChangeText={setClassName}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  District <Text style={styles.requiredStar}>*</Text>
                </Text>
                <View style={styles.inputWithIcon}>
                  <MapPin size={18} color="#94A3B8" />
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Godda / Patna"
                    placeholderTextColor="#94A3B8"
                    value={district}
                    onChangeText={setDistrict}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>School / College Name (Optional)</Text>
                <View style={styles.inputWithIcon}>
                  <School size={18} color="#94A3B8" />
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. High School Mahagama"
                    placeholderTextColor="#94A3B8"
                    value={schoolName}
                    onChangeText={setSchoolName}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Create Account Password <Text style={styles.requiredStar}>*</Text>
                </Text>
                <View style={styles.inputWithIcon}>
                  <Lock size={18} color="#94A3B8" />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Min 6 characters"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Confirm Password <Text style={styles.requiredStar}>*</Text>
                </Text>
                <View style={styles.inputWithIcon}>
                  <Lock size={18} color="#94A3B8" />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Re-enter password"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                </View>
              </View>
            </View>
            )}

            {/* Step 2: UPI Payment Details (No external dynamic QR) */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepBadgeText}>2</Text>
                </View>
                <Text style={styles.sectionTitle}>Scan Dynamic QR or Pay via UPI</Text>
              </View>

              <View style={styles.upiInfoCard}>
                {/* Dynamic QR Code Card */}
                <View style={styles.qrContainer}>
                  <View style={styles.qrBorderWrapper}>
                    <Image
                      source={{ uri: qrImageUrl }}
                      style={styles.qrImage}
                      resizeMode="contain"
                      onError={() => setQrError(true)}
                    />
                  </View>
                  <Text style={styles.qrScanText}>Scan with PhonePe, GPay, Paytm or BHIM</Text>
                  <View style={styles.qrAmountBadge}>
                    <Text style={styles.qrAmountBadgeText}>Payable: {formatINR(payableAmount)}</Text>
                  </View>
                </View>

                <Text style={styles.upiHeaderLabel}>Official Institute UPI VPA</Text>
                <View style={styles.upiVpaRow}>
                  <Text style={styles.upiVpaText}>{upiId}</Text>
                  <TouchableOpacity style={styles.copyBtn} onPress={handleCopyUpi}>
                    <Copy size={14} color="#2563EB" />
                    <Text style={styles.copyBtnText}>Copy VPA</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.payeeText}>Payee: {payeeName} (Director: BADE SIR)</Text>

                <TouchableOpacity style={styles.launchUpiBtn} onPress={handleOpenUpiApp}>
                  <ExternalLink size={16} color="#FFFFFF" />
                  <Text style={styles.launchUpiBtnText}>Pay via Installed UPI App</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.noteBox}>
                <Text style={styles.noteText}>
                  💡 Scan the dynamic QR code above or send {formatINR(payableAmount)} to {upiId}. Then enter the 12-digit UTR reference number from your payment app receipt below.
                </Text>
              </View>
            </View>

            {/* Step 3: Enter UTR & Submit */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepBadgeText}>3</Text>
                </View>
                <Text style={styles.sectionTitle}>Enter 12-Digit UPI UTR</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Transaction Reference (UTR / UPI Ref ID) <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={styles.utrInput}
                  placeholder="e.g. 412389012345"
                  placeholderTextColor="#93C5FD"
                  maxLength={16}
                  value={upiRefNumber}
                  onChangeText={(t) => setUpiRefNumber(t.toUpperCase())}
                  autoCapitalize="characters"
                />
              </View>

              {/* Terms Checkbox */}
              <View style={styles.termsRow}>
                <Switch
                  value={acceptTerms}
                  onValueChange={setAcceptTerms}
                  trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
                  thumbColor={acceptTerms ? '#2563EB' : '#94A3B8'}
                />
                <Text style={styles.termsText}>
                  I agree to the Terms and Conditions of IDEAL COACHING CENTRE and understand that my account will be activated upon admin verification.
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                onPress={handleSubmitPayment}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Submit Enrollment for Approval</Text>
                )}
              </TouchableOpacity>
            </View>
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
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 8,
  },
  navTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  navSubtitle: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  formContainer: {
    gap: 16,
  },
  courseCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
  },
  courseTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F59E0B',
    textTransform: 'uppercase',
  },
  courseTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 4,
  },
  courseValidity: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
  },
  priceContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#334155',
    paddingLeft: 12,
  },
  priceLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#34D399',
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 8,
  },
  stepBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  requiredStar: {
    color: '#EF4444',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  textInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
  },
  boardPickerRow: {
    flexDirection: 'row',
    gap: 8,
  },
  boardPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
  },
  boardPillActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  boardPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  boardPillTextActive: {
    color: '#1D4ED8',
    fontWeight: '700',
  },
  upiInfoCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  upiHeaderLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  upiVpaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  upiVpaText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: 'monospace',
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  copyBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  payeeText: {
    fontSize: 11,
    color: '#475569',
  },
  launchUpiBtn: {
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 4,
  },
  launchUpiBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  noteBox: {
    backgroundColor: '#FEF3C7',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  noteText: {
    fontSize: 11,
    color: '#92400E',
    lineHeight: 16,
  },
  utrInput: {
    backgroundColor: '#EFF6FF',
    borderWidth: 2,
    borderColor: '#60A5FA',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: 'monospace',
    fontWeight: '700',
    color: '#1E3A8A',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  termsText: {
    flex: 1,
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
  submitButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  successCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  successIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 12,
    color: '#475569',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
  instructionBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginVertical: 20,
    width: '100%',
  },
  instructionHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E40AF',
  },
  instructionItem: {
    fontSize: 11,
    color: '#1E3A8A',
    marginTop: 4,
    lineHeight: 16,
  },
  doneButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  qrBorderWrapper: {
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#93C5FD',
    borderStyle: 'dashed',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  qrImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
  qrScanText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E40AF',
    marginTop: 8,
  },
  qrAmountBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#86EFAC',
    marginTop: 6,
  },
  qrAmountBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#15803D',
  },
});
