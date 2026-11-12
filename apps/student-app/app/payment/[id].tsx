import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/useAuthStore';
import { translations, formatINR } from '@icc/shared-utils';
import { initialCourses, initialPlatformConfig } from '../../../admin-web/src/lib/sample-data';

export default function ManualUpiPaymentScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { language, user } = useAuthStore();
  const t = translations[language];

  const course = initialCourses.find((c) => c.id === id) || initialCourses[0];
  const payableAmount = course.discount_price || course.price;

  const [upiRefNumber, setUpiRefNumber] = useState('');
  const [screenshotSelected, setScreenshotSelected] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedStatus, setSubmittedStatus] = useState<string | null>(null);

  const handleSubmitPayment = () => {
    if (upiRefNumber.trim().length < 8) {
      Alert.alert(
        language === 'hi' ? 'त्रुटि' : 'Error',
        language === 'hi'
          ? 'कृपया मान्य 12 अंकों का UPI UTR / Transaction ID दर्ज करें'
          : 'Please enter valid 12-digit UPI UTR / Reference number'
      );
      return;
    }

    setSubmitting(true);

    setTimeout(() => {
      setSubmitting(false);
      setSubmittedStatus('pending');
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.courseTitle}>
            {language === 'hi' ? course.title_hi || course.title : course.title}
          </Text>
          <View style={styles.amountBox}>
            <Text style={styles.amountLabel}>
              {language === 'hi' ? 'कुल देय शुल्क (Total Payable):' : 'Total Payable Fee:'}
            </Text>
            <Text style={styles.amountVal}>{formatINR(payableAmount)}</Text>
          </View>
        </View>

        {submittedStatus === 'pending' ? (
          /* Submission Confirmation Card */
          <View style={styles.successCard}>
            <Text style={{ fontSize: 44, textAlign: 'center', marginBottom: 10 }}>⏳</Text>
            <Text style={styles.successTitle}>
              {language === 'hi' ? 'भुगतान सत्यापन प्रक्रियाधीन!' : 'Payment Under Review!'}
            </Text>
            <Text style={styles.successDesc}>
              {language === 'hi'
                ? `आपका UPI UTR (${upiRefNumber}) संस्थान के प्रशासन को सत्यापन हेतु भेज दिया गया है। 1 घंटे के भीतर बैंक से पुष्टि होते ही आपका कोर्स सक्रिय कर दिया जाएगा।`
                : `Your transaction reference (${upiRefNumber}) has been submitted for admin verification. Enrollment will be activated upon bank statement confirmation.`}
            </Text>

            <View style={styles.auditInfoBox}>
              <Text style={styles.auditInfoText}>
                🛡️ सुरक्षा नीति: यह एक अपरिवर्तनीय ऑडिट रिकॉर्ड के रूप में सुरक्षित है।
              </Text>
            </View>

            <TouchableOpacity
              style={styles.doneBtn}
              onPress={() => router.replace('/(tabs)')}
            >
              <Text style={styles.doneBtnText}>
                {language === 'hi' ? 'डैशबोर्ड पर वापस जाएं' : 'Return to Dashboard'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Payment Form */
          <View style={styles.body}>
            {/* Step 1: Scan & Pay */}
            <View style={styles.stepCard}>
              <View style={styles.stepHeader}>
                <View style={styles.stepNum}>
                  <Text style={styles.stepNumText}>1</Text>
                </View>
                <Text style={styles.stepTitle}>
                  {language === 'hi' ? 'दिए गए क्यूआर कोड या UPI ID पर भुगतान करें' : 'Scan QR Code or Pay via UPI'}
                </Text>
              </View>

              <View style={styles.qrContainer}>
                <Image
                  source={{ uri: initialPlatformConfig.payment_config.qr_code_url }}
                  style={styles.qrImage}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.upiIdRow}>
                <View>
                  <Text style={styles.upiLabel}>संस्थान UPI VPA ID:</Text>
                  <Text style={styles.upiVal}>
                    {initialPlatformConfig.payment_config.upi_id}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.copyBtn}
                  onPress={() =>
                    Alert.alert(
                      'UPI ID',
                      `${initialPlatformConfig.payment_config.upi_id} क्लिपबोर्ड पर कॉपी हो गया`
                    )
                  }
                >
                  <Text style={styles.copyBtnText}>कॉपी करें</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.bankName}>
                खाताधारक: {initialPlatformConfig.payment_config.account_holder_name} (SBI)
              </Text>
            </View>

            {/* Step 2: Submit UTR */}
            <View style={styles.stepCard}>
              <View style={styles.stepHeader}>
                <View style={styles.stepNum}>
                  <Text style={styles.stepNumText}>2</Text>
                </View>
                <Text style={styles.stepTitle}>
                  {language === 'hi'
                    ? '12 अंकों का UTR / Transaction Reference दर्ज करें'
                    : 'Enter 12-Digit UPI UTR Reference'}
                </Text>
              </View>

              <TextInput
                style={styles.utrInput}
                value={upiRefNumber}
                onChangeText={setUpiRefNumber}
                placeholder="उदा. 412389012345 (12 digits)"
                placeholderTextColor="#94A3B8"
                autoCapitalize="characters"
              />

              {/* Upload Screenshot simulation */}
              <TouchableOpacity
                style={[styles.uploadBox, screenshotSelected && styles.uploadBoxDone]}
                onPress={() => setScreenshotSelected(!screenshotSelected)}
              >
                <Text style={{ fontSize: 20 }}>📸</Text>
                <Text style={styles.uploadText}>
                  {screenshotSelected
                    ? '✅ रसीद स्क्रीनशॉट संलग्न किया गया'
                    : 'भुगतान रसीद का स्क्रीनशॉट संलग्न करें (वैकल्पिक)'}
                </Text>
              </TouchableOpacity>
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
                  {language === 'hi'
                    ? 'सत्यापन अनुरोध सबमिट करें'
                    : 'Submit Verification Request'}
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
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  courseTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 22,
  },
  amountBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  amountLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  amountVal: {
    fontSize: 18,
    fontWeight: '900',
    color: '#059669',
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
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  qrContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  qrImage: {
    width: 170,
    height: 170,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  upiIdRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  upiLabel: {
    fontSize: 10,
    color: '#64748B',
  },
  upiVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  copyBtn: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  copyBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  bankName: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
  },
  utrInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '700',
    fontFamily: 'monospace',
    marginBottom: 12,
  },
  uploadBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    gap: 6,
  },
  uploadBoxDone: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  uploadText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
    textAlign: 'center',
  },
  submitBtn: {
    backgroundColor: '#059669',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  successCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#D97706',
    textAlign: 'center',
  },
  successDesc: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 10,
    marginBottom: 16,
  },
  auditInfoBox: {
    backgroundColor: '#EFF6FF',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  auditInfoText: {
    fontSize: 11,
    color: '#1E40AF',
    textAlign: 'center',
  },
  doneBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  doneBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
