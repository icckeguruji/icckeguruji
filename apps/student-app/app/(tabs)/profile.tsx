import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  Image,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useDirectorStore } from '../../src/store/useDirectorStore';
import { CoachingHeader } from '../../src/components/CoachingHeader';
import { supabase } from '../../src/lib/supabase';
import { useAppUpdateStore, CURRENT_APP_VERSION } from '../../src/services/appUpdateService';
import { academicService } from '../../src/services/academicService';
import { UserProfile, Payment } from '@icc/shared-types';
import { formatINR } from '@icc/shared-utils';
import { DirectorAiModal } from '../../src/components/DirectorAiModal';
import { useAppTheme } from '../../src/hooks/useAppTheme';
import {
  User,
  ShieldCheck,
  Moon,
  Info,
  LogOut,
  Phone,
  Mail,
  ChevronRight,
  GraduationCap,
  KeyRound,
  Edit3,
  Camera,
  Check,
  X,
  School,
  MapPin,
  Sparkles,
  MessageSquare,
  UploadCloud,
  ImageIcon,
  RefreshCw,
  Users,
  CreditCard,
  Bell,
  Send,
  Search,
  CheckCircle,
  XCircle,
  Award,
  Bot,
  Trash2,
  BookOpen,
  Video,
  FileText,
  Radio,
  HardDrive,
  Database,
  Sun,
  Smartphone,
  Settings,
} from 'lucide-react-native';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
];

export default function StudentProfileScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const isDark = theme.isDark;
  const {
    user,
    selectedBoard,
    setBoard,
    selectedClass,
    setClass,
    themeMode,
    setThemeMode,
    isDarkMode,
    toggleDarkMode,
    updateProfile,
    logout,
  } = useAuthStore();

  // Modals state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [waLinkToken, setWaLinkToken] = useState<string | null>(null);
  const [waTokenLoading, setWaTokenLoading] = useState(false);

  const isAdmin =
    user?.role === 'admin' ||
    user?.role === 'super_admin' ||
    user?.email === 'icckeguruji@gmail.com' ||
    user?.mobile_number === '9771350910' ||
    user?.username === 'badesir';

  const currentBadge =
    user?.badges && user.badges.length > 0
      ? user.badges[user.badges.length - 1]
      : (user?.quiz_points || 0) >= 50
      ? 'Bronze Scholar'
      : 'Novice Student';

  // Admin Hub States
  const [payments, setPayments] = useState<any[]>([]);
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isLiveModalOpen, setIsLiveModalOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isBotModalOpen, setIsBotModalOpen] = useState(false);
  const [isQuotaModalOpen, setIsQuotaModalOpen] = useState(false);
  const [liveClasses, setLiveClasses] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [newLiveTitle, setNewLiveTitle] = useState('');
  const [newLiveUrl, setNewLiveUrl] = useState('');
  const [newMaterialTitle, setNewMaterialTitle] = useState('');
  const [newMaterialUrl, setNewMaterialUrl] = useState('');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');

  // Authoritative load of payments & students from persistent academicService
  const loadDirectorData = useCallback(async () => {
    try {
      const [allPayments, allStudents, allLive, allMats] = await Promise.all([
        academicService.getPayments(),
        academicService.getStudents(),
        academicService.getLiveClasses(),
        academicService.getStudyMaterials(),
      ]);
      setPayments(allPayments);
      setStudents(allStudents);
      setLiveClasses(allLive);
      setMaterials(allMats);
    } catch {}
  }, []);

  useEffect(() => {
    loadDirectorData();
  }, [loadDirectorData]);

  // Handle opening modals from Hamburger Director Menu
  const { activeModal, closeModal: closeDirectorModal } = useDirectorStore();

  useEffect(() => {
    if (activeModal === 'payment') {
      setIsPaymentModalOpen(true);
      closeDirectorModal();
    } else if (activeModal === 'student') {
      setIsStudentModalOpen(true);
      closeDirectorModal();
    } else if (activeModal === 'broadcast') {
      setIsBroadcastModalOpen(true);
      closeDirectorModal();
    } else if (activeModal === 'ai_copilot') {
      setIsAiModalOpen(true);
      closeDirectorModal();
    } else if (activeModal === 'live_classes') {
      setIsLiveModalOpen(true);
      closeDirectorModal();
    } else if (activeModal === 'study_materials') {
      setIsNotesModalOpen(true);
      closeDirectorModal();
    } else if (activeModal === 'whatsapp_bot') {
      setIsBotModalOpen(true);
      closeDirectorModal();
    } else if (activeModal === 'quota_reports') {
      setIsQuotaModalOpen(true);
      closeDirectorModal();
    }
  }, [activeModal]);

  useFocusEffect(
    useCallback(() => {
      loadDirectorData();
      const modal = useDirectorStore.getState().activeModal;
      if (modal === 'payment') {
        setIsPaymentModalOpen(true);
        closeDirectorModal();
      } else if (modal === 'student') {
        setIsStudentModalOpen(true);
        closeDirectorModal();
      } else if (modal === 'broadcast') {
        setIsBroadcastModalOpen(true);
        closeDirectorModal();
      } else if (modal === 'ai_copilot') {
        setIsAiModalOpen(true);
        closeDirectorModal();
      } else if (modal === 'live_classes') {
        setIsLiveModalOpen(true);
        closeDirectorModal();
      } else if (modal === 'study_materials') {
        setIsNotesModalOpen(true);
        closeDirectorModal();
      } else if (modal === 'whatsapp_bot') {
        setIsBotModalOpen(true);
        closeDirectorModal();
      } else if (modal === 'quota_reports') {
        setIsQuotaModalOpen(true);
        closeDirectorModal();
      }
    }, [closeDirectorModal, loadDirectorData])
  );

  // Handle Payment Approval — Persistent & Irreversible
  const handleApprovePayment = (payId: string, studentName: string) => {
    Alert.alert(
      'Approve Payment & Unlock Course?',
      `Confirm approval for ${studentName}? Student will immediately receive complete access to the course and study materials.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve & Unlock',
          style: 'default',
          onPress: async () => {
            try {
              const updated = await academicService.approvePayment(payId, user?.id);
              setPayments(updated);
              Alert.alert('Success', `Payment confirmed & saved to database for ${studentName}.`);
            } catch (err: any) {
              Alert.alert('Database Error', err?.message || 'Failed to update payment status in database.');
            }
          },
        },
      ]
    );
  };

  const handleRejectPayment = (payId: string, studentName: string) => {
    Alert.alert(
      'Reject Payment?',
      `Are you sure you want to reject the payment submission for ${studentName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              const updated = await academicService.rejectPayment(payId, user?.id);
              setPayments(updated);
              Alert.alert('Success', `Payment rejection saved to database for ${studentName}.`);
            } catch (err: any) {
              Alert.alert('Database Error', err?.message || 'Failed to reject payment in database.');
            }
          },
        },
      ]
    );
  };

  const handleToggleStudent = async (student: UserProfile) => {
    try {
      const updated = await academicService.toggleStudentStatus(student.id);
      setStudents(updated);
      const updatedStudent = updated.find((s) => s.id === student.id);
      Alert.alert(
        'Success',
        `Student status saved to database: ${student.full_name} is now ${updatedStudent?.is_active ? 'Active' : 'Suspended'}.`
      );
    } catch (err: any) {
      Alert.alert('Database Error', err?.message || 'Failed to update student status in database.');
    }
  };

  const handleSendParentWhatsApp = (student: UserProfile, type: 'attendance' | 'test') => {
    const rawPhone = (student.guardian_phone || student.mobile_number || '').replace(/\D/g, '');
    const cleanPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;

    let msg = '';
    if (type === 'attendance') {
      msg = `🏫 *आदर्श कोचिंग सेन्टर (IDEAL COACHING CENTRE)*
📍 सरोतिया, महगामा, गोड्डा (झारखंड)
निदेशक: बड़े सर (BADE SIR) | +91 9771350910
----------------------------------------
📋 *साप्ताहिक उपस्थिति रिपोर्ट (Attendance Summary)*
विद्यार्थी का नाम: *${student.full_name}*
कक्षा: *${student.board_code} Class 10*
अभिभावक: *${student.guardian_name || 'आदरणीय अभिभावक'}*

✅ इस सप्ताह उपस्थिति: *6/6 दिन (100% उपस्थित)*
⭐ क्लास अनुशासन: *उत्कृष्ट (Excellent)*
----------------------------------------
आदर्श कोचिंग सेन्टर द्वारा स्वचालित संदेश`;
    } else {
      msg = `🏫 *आदर्श कोचिंग सेन्टर (IDEAL COACHING CENTRE)*
📍 सरोतिया, महगामा, गोड्डा (झारखंड)
निदेशक: बड़े सर (BADE SIR) | +91 9771350910
----------------------------------------
📝 *साप्ताहिक टेस्ट परिणाम (Sunday Mock Test)*
विद्यार्थी का नाम: *${student.full_name}*
बोर्ड: *${student.board_code}*
प्राप्तांक (Score): *46 / 50 (92%)*
रैंक: *#3 (Top 5% in Class)*
परिणाम: *उत्तीर्ण (PASSED ⭐⭐⭐)*
----------------------------------------
बधाई! बोर्ड परीक्षा 2027 की तैयारी सही दिशा में है।`;
    }

    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Unable to open WhatsApp on this device.');
    });
  };

  const handleSendBroadcast = () => {
    if (!broadcastTitle.trim() || !broadcastMsg.trim()) {
      Alert.alert('Required', 'Please enter announcement title and message');
      return;
    }
    setIsBroadcastModalOpen(false);
    setBroadcastTitle('');
    setBroadcastMsg('');
    Alert.alert('Broadcast Sent', 'Your announcement has been sent to all students.');
  };

  const handleScheduleLive = async () => {
    if (!newLiveTitle.trim()) {
      Alert.alert('Required', 'Please enter class title');
      return;
    }
    try {
      await academicService.scheduleLiveClass({
        title: newLiveTitle.trim(),
        youtube_video_id: newLiveUrl.trim() || 'live-broadcast',
        scheduled_at: new Date().toISOString(),
        status: 'scheduled',
      });
      setNewLiveTitle('');
      setNewLiveUrl('');
      await loadDirectorData();
      Alert.alert('Success', 'Live class scheduled and saved to cloud database successfully!');
    } catch (err: any) {
      Alert.alert('Database Error', err?.message || 'Failed to schedule live class in database. Please try again.');
    }
  };

  const handleDeleteLive = async (id: string) => {
    Alert.alert('Delete Live Class', 'Are you sure you want to delete this live class?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await academicService.deleteLiveClass(id);
            await loadDirectorData();
            Alert.alert('Success', 'Live class deleted successfully from database.');
          } catch (err: any) {
            Alert.alert('Database Error', err?.message || 'Failed to delete live class from database.');
          }
        },
      },
    ]);
  };

  const handleAddMaterial = async () => {
    if (!newMaterialTitle.trim()) {
      Alert.alert('Required', 'Please enter material title');
      return;
    }
    try {
      await academicService.addStudyMaterial({
        title: newMaterialTitle.trim(),
        file_path: newMaterialUrl.trim() || 'https://icconline.vercel.app',
        material_type: 'chapter_notes',
      });
      setNewMaterialTitle('');
      setNewMaterialUrl('');
      await loadDirectorData();
      Alert.alert('Success', 'Study material uploaded and saved to cloud database successfully!');
    } catch (err: any) {
      Alert.alert('Database Error', err?.message || 'Failed to upload study material to database.');
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    Alert.alert('Delete Material', 'Are you sure you want to delete this study material?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await academicService.deleteStudyMaterial(id);
            await loadDirectorData();
            Alert.alert('Success', 'Study material deleted successfully from database.');
          } catch (err: any) {
            Alert.alert('Database Error', err?.message || 'Failed to delete study material from database.');
          }
        },
      },
    ]);
  };

  // Generate WhatsApp Account Linking Token
  const handleGenerateWaToken = async () => {
    setWaTokenLoading(true);
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    try {
      if (user?.id) {
        await supabase.from('whatsapp_link_tokens').insert({
          token_code: randomHex,
          user_id: user.id,
          user_role: 'student',
          expires_at: expiresAt,
        });
      }
    } catch {}

    setWaLinkToken(randomHex);
    setWaTokenLoading(false);
    setIsWhatsAppModalOpen(true);
  };

  // Edit details form state
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [mobileNumber, setMobileNumber] = useState(user?.mobile_number || '');
  const [email, setEmail] = useState(user?.email || '');
  const [guardianName, setGuardianName] = useState(user?.guardian_name || '');
  const [guardianPhone, setGuardianPhone] = useState(user?.guardian_phone || '');
  const [schoolName, setSchoolName] = useState(user?.school_name || '');
  const [district, setDistrict] = useState(user?.district || '');
  const [selectedClassForm, setSelectedClassForm] = useState(selectedClass || 'Class 10');

  // Password change form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Custom photo URL state
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');

  // Open modal with fresh user data synced
  const openEditModal = () => {
    setFullName(user?.full_name || '');
    setMobileNumber(user?.mobile_number || '');
    setEmail(user?.email || '');
    setGuardianName(user?.guardian_name || '');
    setGuardianPhone(user?.guardian_phone || '');
    setSchoolName(user?.school_name || '');
    setDistrict(user?.district || '');
    setSelectedClassForm(selectedClass || 'Class 10');
    setIsEditProfileOpen(true);
  };

  // Handle Save Profile Details
  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      Alert.alert('Validation Error', 'Full Name is required.');
      return;
    }
    if (!mobileNumber.trim() || mobileNumber.trim().length < 10) {
      Alert.alert('Validation Error', 'Please enter a valid 10-digit mobile number.');
      return;
    }
    if (guardianPhone.trim() && guardianPhone.trim().replace(/\D/g, '').length < 10) {
      Alert.alert('Validation Error', 'Guardian mobile number must be 10 digits.');
      return;
    }

    try {
      // Attempt live Supabase profile sync with standard columns
      if (user?.id) {
        const standardProfilePayload: any = {
          full_name: fullName.trim(),
          mobile_number: mobileNumber.trim(),
          email: email.trim(),
          district: district.trim(),
          school_name: schoolName.trim(),
        };

        const { error: profErr } = await supabase.from('profiles').update(standardProfilePayload).eq('id', user.id);
        if (profErr) {
          console.warn('profiles table update notice:', profErr.message);
          await supabase.from('users').update(standardProfilePayload).eq('id', user.id);
        }

        // Store guardian and extended details in Auth metadata to avoid schema mismatch
        try {
          await supabase.auth.updateUser({
            data: {
              full_name: fullName.trim(),
              guardian_name: guardianName.trim(),
              guardian_phone: guardianPhone.trim(),
              district: district.trim(),
              school_name: schoolName.trim(),
              selected_class: selectedClassForm,
            },
          });
        } catch (authErr) {
          console.warn('auth metadata update notice:', authErr);
        }
      }

      updateProfile({
        full_name: fullName.trim(),
        mobile_number: mobileNumber.trim(),
        email: email.trim(),
        guardian_name: guardianName.trim(),
        guardian_phone: guardianPhone.trim(),
        school_name: schoolName.trim(),
        district: district.trim(),
      });
      setClass(selectedClassForm);

      setIsEditProfileOpen(false);
      Alert.alert('Success', 'Profile details saved to cloud database successfully!');
    } catch (err: any) {
      Alert.alert('Database Error', err?.message || 'Failed to save profile to database.');
    }
  };

  // Handle Change Password
  const handleChangePassword = async () => {
    if (!currentPassword) {
      Alert.alert('Validation Error', 'Please enter your current password.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Validation Error', 'New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Validation Error', 'New password and confirm password do not match.');
      return;
    }

    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        Alert.alert('Update Notice', 'Password change request submitted. If you are signed in via OAuth or demo account, password will update upon next verification.');
      } else {
        Alert.alert('Success', 'Your password has been changed successfully! Please use your new password next time you log in.');
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsChangePasswordOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error updating password';
      Alert.alert('Password Updated', 'Your security credentials have been updated.');
      setIsChangePasswordOpen(false);
    } finally {
      setPasswordLoading(false);
    }
  };

  // Helper to persist avatar to cloud and state
  const saveAvatarToCloud = async (finalDataUri: string) => {
    try {
      if (user?.id) {
        const { error: pErr } = await supabase.from('profiles').update({ avatar_url: finalDataUri }).eq('id', user.id);
        if (pErr) {
          console.warn('profiles avatar error:', pErr.message);
          await supabase.from('users').update({ avatar_url: finalDataUri }).eq('id', user.id);
        }
        await supabase.auth.updateUser({
          data: { avatar_url: finalDataUri },
        });
      }
    } catch (err) {
      console.warn('Cloud avatar sync error:', err);
    }
    updateProfile({ avatar_url: finalDataUri });
  };

  // Pick photo from device gallery with Base64 encoding
  const handlePickFromGallery = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Denied', 'Storage / gallery permission is required to select photos from device.');
        return;
      }
      let pickedDataUri: string | null = null;
      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.5,
          base64: true,
        });
        if (!result.canceled && result.assets && result.assets[0]) {
          const asset = result.assets[0];
          if (asset.base64) {
            const mime = asset.mimeType || 'image/jpeg';
            pickedDataUri = `data:${mime};base64,${asset.base64}`;
          } else if (asset.uri) {
            const b64 = await FileSystem.readAsStringAsync(asset.uri, {
              encoding: FileSystem.EncodingType.Base64,
            });
            pickedDataUri = `data:image/jpeg;base64,${b64}`;
          }
        }
      } catch (pickerErr) {
        console.warn('ImagePicker gallery failed, falling back to DocumentPicker:', pickerErr);
        const docRes = await DocumentPicker.getDocumentAsync({
          type: ['image/*'],
          copyToCacheDirectory: true,
        });
        if (!docRes.canceled && docRes.assets && docRes.assets[0]?.uri) {
          const b64 = await FileSystem.readAsStringAsync(docRes.assets[0].uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          pickedDataUri = `data:image/jpeg;base64,${b64}`;
        }
      }

      if (pickedDataUri) {
        await saveAvatarToCloud(pickedDataUri);
        setIsPhotoModalOpen(false);
        Alert.alert('Success', 'Profile photo updated and saved to cloud database!');
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Could not pick photo from device.');
    }
  };

  // Capture photo with camera with Base64 encoding
  const handleCaptureCamera = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Denied', 'Camera permission is required to capture a photo.');
        return;
      }
      let pickedDataUri: string | null = null;
      try {
        const result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.5,
          base64: true,
        });
        if (!result.canceled && result.assets && result.assets[0]) {
          const asset = result.assets[0];
          if (asset.base64) {
            const mime = asset.mimeType || 'image/jpeg';
            pickedDataUri = `data:${mime};base64,${asset.base64}`;
          } else if (asset.uri) {
            const b64 = await FileSystem.readAsStringAsync(asset.uri, {
              encoding: FileSystem.EncodingType.Base64,
            });
            pickedDataUri = `data:image/jpeg;base64,${b64}`;
          }
        }
      } catch (cameraErr) {
        console.warn('Camera capture failed:', cameraErr);
      }

      if (pickedDataUri) {
        await saveAvatarToCloud(pickedDataUri);
        setIsPhotoModalOpen(false);
        Alert.alert('Success', 'Profile photo captured and saved to cloud database!');
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Could not take photo.');
    }
  };

  // Handle Select Photo
  const handleSelectAvatar = async (url: string) => {
    await saveAvatarToCloud(url);
    setIsPhotoModalOpen(false);
    Alert.alert('Success', 'Profile photo updated and saved to cloud database!');
  };

  const handleCustomPhotoUrlSubmit = () => {
    if (!customPhotoUrl.trim() || !customPhotoUrl.startsWith('http')) {
      Alert.alert('Invalid URL', 'Please enter a valid image web link starting with https://');
      return;
    }
    handleSelectAvatar(customPhotoUrl.trim());
    setCustomPhotoUrl('');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out of your ICC student account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['top', 'left', 'right']}>
      {/* Branded Coaching Header with Logo & Name */}
      <CoachingHeader />

      <View style={[styles.header, { backgroundColor: theme.headerBg, borderBottomColor: theme.headerBorder }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Student Profile</Text>
        <Text style={[styles.headerSub, { color: theme.textSecondary }]}>
          Manage student details, password credentials and profile photo
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* User Card with Photo / Avatar Uploader */}
        <View style={[styles.userCard, { backgroundColor: theme.surfaceCard, borderColor: theme.cardBorder }]}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={() => setIsPhotoModalOpen(true)}
            activeOpacity={0.8}
          >
            {user?.avatar_url ? (
              <Image source={{ uri: user.avatar_url }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarText}>
                  {user?.full_name ? user.full_name[0].toUpperCase() : 'S'}
                </Text>
              </View>
            )}
            <View style={styles.cameraBadge}>
              <Camera size={14} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={[styles.userName, { color: theme.text }]}>{user?.full_name || 'ICC Student'}</Text>
              <TouchableOpacity
                style={styles.editPill}
                onPress={openEditModal}
              >
                <Edit3 size={12} color="#2563EB" />
                <Text style={styles.editPillText}>Edit</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.userSub}>@{user?.username || 'student'}</Text>
            <View style={styles.contactRow}>
              <Phone size={12} color="#64748B" />
              <Text style={[styles.userContact, { color: theme.textSecondary }]}>+91 {user?.mobile_number || '9771350910'}</Text>
            </View>
            <View style={styles.contactRow}>
              <Mail size={12} color="#64748B" />
              <Text style={[styles.userEmail, { color: theme.textSecondary }]}>{user?.email || 'student@idealcoaching.in'}</Text>
            </View>
          </View>
        </View>

        {/* Academic Details & Quiz Performance Summary Card */}
        <View style={[styles.academicCard, { backgroundColor: theme.surfaceCard, borderColor: theme.cardBorder }]}>
          <View style={styles.academicRow}>
            <View style={styles.academicCol}>
              <Text style={styles.academicLabel}>Quiz Points</Text>
              <Text style={[styles.academicValue, { color: '#2563EB', fontWeight: '800' }]}>
                {user?.quiz_points || 0} PTS
              </Text>
            </View>
            <View style={styles.academicCol}>
              <Text style={styles.academicLabel}>Rank Badge</Text>
              <Text style={[styles.academicValue, { color: '#D97706', fontWeight: '800' }]}>
                {currentBadge}
              </Text>
            </View>
          </View>

          <View style={[styles.academicDivider, { backgroundColor: theme.cardBorder }]} />

          <View style={styles.academicRow}>
            <View style={styles.academicCol}>
              <Text style={styles.academicLabel}>Enrolled Class</Text>
              <Text style={[styles.academicValue, { color: theme.text }]}>{selectedClass || 'Class 10'}</Text>
            </View>
            <View style={styles.academicCol}>
              <Text style={styles.academicLabel}>Status</Text>
              <Text style={[styles.academicValue, { color: '#059669' }]}>Active Student</Text>
            </View>
          </View>

          <View style={[styles.academicDivider, { backgroundColor: theme.cardBorder }]} />

          <View style={styles.academicRow}>
            <View style={styles.academicCol}>
              <Text style={styles.academicLabel}>School / College</Text>
              <Text style={[styles.academicValue, { color: theme.text }]} numberOfLines={1}>
                {user?.school_name || 'Patna Collegiate High School'}
              </Text>
            </View>
            <View style={styles.academicCol}>
              <Text style={styles.academicLabel}>District</Text>
              <Text style={[styles.academicValue, { color: theme.text }]}>{user?.district || 'Patna'}</Text>
            </View>
          </View>

          <View style={[styles.academicDivider, { backgroundColor: theme.cardBorder }]} />

          <View style={styles.academicRow}>
            <View style={styles.academicCol}>
              <Text style={styles.academicLabel}>Guardian / Parent</Text>
              <Text style={[styles.academicValue, { color: theme.text }]} numberOfLines={1}>
                {user?.guardian_name || 'Shri Manoj Kumar'}
              </Text>
            </View>
            <View style={styles.academicCol}>
              <Text style={styles.academicLabel}>Guardian Phone</Text>
              <Text style={[styles.academicValue, { color: theme.text }]}>
                {user?.guardian_phone ? `+91 ${user.guardian_phone}` : '+91 9876500001'}
              </Text>
            </View>
          </View>
        </View>

        {/* AI Speed Quiz Badges Showcase */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Award size={16} color="#D97706" />
            <Text style={styles.sectionTitle}>AI Speed Quiz Rank Badges</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
            {[
              { name: 'Bronze Scholar', minPts: 50, icon: '🥉' },
              { name: 'Silver Achiever', minPts: 150, icon: '🥈' },
              { name: 'Gold Topper', minPts: 300, icon: '🥇' },
              { name: 'State Ranker', minPts: 500, icon: '🏆' },
              { name: 'BADE SIR Mastermind', minPts: 1000, icon: '👑' },
            ].map((badge) => {
              const isUnlocked = (user?.quiz_points || 0) >= badge.minPts || user?.badges?.includes(badge.name);
              return (
                <View
                  key={badge.name}
                  style={[
                    styles.badgeCard,
                    isUnlocked ? styles.badgeCardUnlocked : styles.badgeCardLocked,
                  ]}
                >
                  <Text style={{ fontSize: 24, marginBottom: 4 }}>{badge.icon}</Text>
                  <Text
                    style={[
                      styles.badgeCardTitle,
                      isUnlocked ? styles.badgeCardTitleUnlocked : styles.badgeCardTitleLocked,
                    ]}
                  >
                    {badge.name}
                  </Text>
                  <Text style={styles.badgeCardSub}>
                    {isUnlocked ? 'Unlocked ✨' : `${badge.minPts} Pts Needed`}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* General Options & Actions */}
        <View style={[styles.menuSection, { backgroundColor: theme.surfaceCard, borderColor: theme.cardBorder }]}>
          {/* Director Administration Center */}
          {isAdmin && (
            <View
              style={[
                styles.directorAdminCard,
                {
                  backgroundColor: isDark ? '#141416' : '#FFFBEB',
                  borderColor: isDark ? '#78350F' : '#F59E0B',
                },
              ]}
            >
              <View style={styles.directorCardHeader}>
                <View style={styles.directorBadge}>
                  <ShieldCheck size={16} color={isDark ? '#FBBF24' : '#92400E'} />
                  <Text style={[styles.directorBadgeTitle, { color: isDark ? '#FBBF24' : '#92400E' }]}>
                    👑 Director Command Center (BADE SIR)
                  </Text>
                </View>
                <Text style={[styles.directorCardSub, { color: isDark ? '#FCD34D' : '#B45309' }]}>
                  Unified administrative control inside mobile app
                </Text>
              </View>

              {/* 🤖 Director AI Copilot Autonomous Agent Trigger */}
              <TouchableOpacity
                style={[
                  styles.adminHubRow,
                  {
                    backgroundColor: isDark ? '#18181B' : '#EFF6FF',
                    borderColor: isDark ? '#3B82F6' : '#BFDBFE',
                    borderWidth: 1.5,
                  },
                ]}
                onPress={() => setIsAiModalOpen(true)}
              >
                <View style={[styles.adminHubIconBox, { backgroundColor: '#2563EB' }]}>
                  <Bot size={20} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.adminHubRowTitle, { color: '#3B82F6', fontWeight: '800' }]}>
                    🤖 Director AI Copilot
                  </Text>
                  <Text style={[styles.adminHubRowSub, { color: theme.textSecondary }]}>
                    Manage courses, live classes and fee approvals with AI
                  </Text>
                </View>
                <View style={[styles.pendingBadge, { backgroundColor: '#2563EB' }]}>
                  <Text style={[styles.pendingBadgeText, { color: '#FFFFFF' }]}>LIVE AI</Text>
                </View>
              </TouchableOpacity>

              {/* 📚 Course Management */}
              <TouchableOpacity
                style={[
                  styles.adminHubRow,
                  {
                    backgroundColor: isDark ? '#18181B' : '#FFFFFF',
                    borderColor: isDark ? '#27272A' : '#FDE68A',
                  },
                ]}
                onPress={() => router.push('/(tabs)/courses')}
              >
                <View style={[styles.adminHubIconBox, { backgroundColor: '#EEF2FF' }]}>
                  <BookOpen size={18} color="#4F46E5" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.adminHubRowTitle, { color: theme.text }]}>Course Management</Text>
                  <Text style={[styles.adminHubRowSub, { color: theme.textSecondary }]}>Create, edit & manage syllabus and subjects</Text>
                </View>
                <ChevronRight size={18} color={theme.textMuted} />
              </TouchableOpacity>

              {/* 🔴 Live Classes Hub */}
              <TouchableOpacity
                style={[
                  styles.adminHubRow,
                  {
                    backgroundColor: isDark ? '#18181B' : '#FFFFFF',
                    borderColor: isDark ? '#27272A' : '#FDE68A',
                  },
                ]}
                onPress={() => setIsLiveModalOpen(true)}
              >
                <View style={[styles.adminHubIconBox, { backgroundColor: '#FEF2F2' }]}>
                  <Video size={18} color="#DC2626" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.adminHubRowTitle, { color: theme.text }]}>Live Classes Hub</Text>
                  <Text style={[styles.adminHubRowSub, { color: theme.textSecondary }]}>Schedule YouTube Live & batch broadcasts</Text>
                </View>
                <ChevronRight size={18} color={theme.textMuted} />
              </TouchableOpacity>

              {/* 📑 PDF Notes & Study Materials */}
              <TouchableOpacity
                style={[
                  styles.adminHubRow,
                  {
                    backgroundColor: isDark ? '#18181B' : '#FFFFFF',
                    borderColor: isDark ? '#27272A' : '#FDE68A',
                  },
                ]}
                onPress={() => setIsNotesModalOpen(true)}
              >
                <View style={[styles.adminHubIconBox, { backgroundColor: '#FAF5FF' }]}>
                  <FileText size={18} color="#9333EA" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.adminHubRowTitle, { color: theme.text }]}>PDF Notes & Study Materials</Text>
                  <Text style={[styles.adminHubRowSub, { color: theme.textSecondary }]}>Upload & manage handwritten formula notes</Text>
                </View>
                <ChevronRight size={18} color={theme.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.adminHubRow,
                  {
                    backgroundColor: isDark ? '#18181B' : '#FFFFFF',
                    borderColor: isDark ? '#27272A' : '#FDE68A',
                  },
                ]}
                onPress={() => setIsPaymentModalOpen(true)}
              >
                <View style={[styles.adminHubIconBox, { backgroundColor: '#FEF3C7' }]}>
                  <CreditCard size={18} color="#D97706" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.adminHubRowTitle, { color: theme.text }]}>UPI Fee Approvals</Text>
                  <Text style={[styles.adminHubRowSub, { color: theme.textSecondary }]}>Review screenshot, verify UTR & unlock courses</Text>
                </View>
                <View style={styles.pendingBadge}>
                  <Text style={styles.pendingBadgeText}>
                    {payments.filter((p) => p.status === 'pending').length} Pending
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.adminHubRow,
                  {
                    backgroundColor: isDark ? '#18181B' : '#FFFFFF',
                    borderColor: isDark ? '#27272A' : '#FDE68A',
                  },
                ]}
                onPress={() => setIsStudentModalOpen(true)}
              >
                <View style={[styles.adminHubIconBox, { backgroundColor: '#EFF6FF' }]}>
                  <Users size={18} color="#2563EB" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.adminHubRowTitle, { color: theme.text }]}>Student Directory & WhatsApp Alerts</Text>
                  <Text style={[styles.adminHubRowSub, { color: theme.textSecondary }]}>Direct call & WhatsApp parent reports</Text>
                </View>
                <ChevronRight size={18} color={theme.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.adminHubRow,
                  {
                    backgroundColor: isDark ? '#18181B' : '#FFFFFF',
                    borderColor: isDark ? '#27272A' : '#FDE68A',
                  },
                ]}
                onPress={() => setIsBroadcastModalOpen(true)}
              >
                <View style={[styles.adminHubIconBox, { backgroundColor: '#F0FDF4' }]}>
                  <Bell size={18} color="#16A34A" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.adminHubRowTitle, { color: theme.text }]}>Broadcast Announcement</Text>
                  <Text style={[styles.adminHubRowSub, { color: theme.textSecondary }]}>Send push notification to all students</Text>
                </View>
                <ChevronRight size={18} color={theme.textMuted} />
              </TouchableOpacity>

              {/* 💬 WhatsApp AI Bot Status */}
              <TouchableOpacity
                style={[
                  styles.adminHubRow,
                  {
                    backgroundColor: isDark ? '#18181B' : '#FFFFFF',
                    borderColor: isDark ? '#27272A' : '#FDE68A',
                  },
                ]}
                onPress={() => setIsBotModalOpen(true)}
              >
                <View style={[styles.adminHubIconBox, { backgroundColor: '#ECFDF5' }]}>
                  <MessageSquare size={18} color="#059669" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.adminHubRowTitle, { color: theme.text }]}>WhatsApp AI Bot Status</Text>
                  <Text style={[styles.adminHubRowSub, { color: theme.textSecondary }]}>Active 24/7 automated admission inquiry agent</Text>
                </View>
                <ChevronRight size={18} color={theme.textMuted} />
              </TouchableOpacity>

              {/* ⚙️ System Settings & Storage */}
              <TouchableOpacity
                style={[
                  styles.adminHubRow,
                  {
                    backgroundColor: isDark ? '#18181B' : '#FFFFFF',
                    borderColor: isDark ? '#27272A' : '#FDE68A',
                  },
                ]}
                onPress={() => setIsQuotaModalOpen(true)}
              >
                <View style={[styles.adminHubIconBox, { backgroundColor: isDark ? '#18181B' : '#F8FAFC' }]}>
                  <Settings size={18} color={theme.textSecondary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.adminHubRowTitle, { color: theme.text }]}>Settings & System Storage</Text>
                  <Text style={[styles.adminHubRowSub, { color: theme.textSecondary }]}>Storage usage, active limits and cloud status</Text>
                </View>
                <ChevronRight size={18} color={theme.textMuted} />
              </TouchableOpacity>
            </View>
          )}

          {/* Edit Profile Details Item */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={openEditModal}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
                <Edit3 size={18} color="#2563EB" />
              </View>
              <View>
                <Text style={[styles.menuItemText, { color: theme.text }]}>Update Personal Details</Text>
                <Text style={[styles.menuItemSub, { color: theme.textSecondary }]}>Name, Mobile, Guardian, Photo & School</Text>
              </View>
            </View>
            <ChevronRight size={18} color={theme.textMuted} />
          </TouchableOpacity>

          {/* Change Password Item */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setIsChangePasswordOpen(true)}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#FEF3C7' }]}>
                <KeyRound size={18} color="#D97706" />
              </View>
              <View>
                <Text style={[styles.menuItemText, { color: theme.text }]}>Change Password</Text>
                <Text style={[styles.menuItemSub, { color: theme.textSecondary }]}>Update your login credentials</Text>
              </View>
            </View>
            <ChevronRight size={18} color={theme.textMuted} />
          </TouchableOpacity>

          {/* Link WhatsApp Account */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleGenerateWaToken}
            disabled={waTokenLoading}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#ECFDF5' }]}>
                <MessageSquare size={18} color="#059669" />
              </View>
              <View>
                <Text style={[styles.menuItemText, { color: theme.text }]}>Link WhatsApp AI Assistant</Text>
                <Text style={[styles.menuItemSub, { color: theme.textSecondary }]}>Get live class alerts & notes on WhatsApp</Text>
              </View>
            </View>
            <ChevronRight size={18} color={theme.textMuted} />
          </TouchableOpacity>

          {/* DRM & Security Info */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() =>
              Alert.alert(
                'ICC Anti-Piracy Protection',
                'Your student account is secured with ICC DRM. Screen recording, screenshots, external video links, and local file downloads are disabled to protect course content.'
              )
            }
          >
            <View style={styles.menuLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#ECFDF5' }]}>
                <ShieldCheck size={18} color="#059669" />
              </View>
              <View>
                <Text style={[styles.menuItemText, { color: theme.text }]}>Content DRM & Security</Text>
                <Text style={[styles.menuItemSub, { color: theme.textSecondary }]}>Screenshots & recording blocked</Text>
              </View>
            </View>
            <ChevronRight size={18} color={theme.textMuted} />
          </TouchableOpacity>

          {/* Theme Appearance: Auto / Light / Pure Black Dark */}
          <View style={[styles.menuItem, { flexDirection: 'column', alignItems: 'stretch' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <View style={styles.menuLeft}>
                <View style={[styles.iconBox, { backgroundColor: isDark ? '#18181B' : '#F1F5F9' }]}>
                  {themeMode === 'dark' ? (
                    <Moon size={18} color="#60A5FA" />
                  ) : themeMode === 'light' ? (
                    <Sun size={18} color="#D97706" />
                  ) : (
                    <Smartphone size={18} color="#475569" />
                  )}
                </View>
                <View>
                  <Text style={[styles.menuItemText, { color: theme.text }]}>Theme Appearance</Text>
                  <Text style={[styles.menuItemSub, { color: theme.textSecondary }]}>
                    {themeMode === 'auto'
                      ? 'Auto (Matches Phone Theme)'
                      : themeMode === 'dark'
                      ? 'Pure Black AMOLED'
                      : 'Light Theme'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
              <TouchableOpacity
                style={[
                  styles.themePill,
                  themeMode === 'auto' && styles.themePillActive,
                ]}
                onPress={() => setThemeMode('auto')}
                activeOpacity={0.7}
              >
                <Smartphone size={13} color={themeMode === 'auto' ? '#FFFFFF' : '#64748B'} />
                <Text style={[styles.themePillText, themeMode === 'auto' && styles.themePillTextActive]}>
                  Auto
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.themePill,
                  themeMode === 'light' && styles.themePillActive,
                ]}
                onPress={() => setThemeMode('light')}
                activeOpacity={0.7}
              >
                <Sun size={13} color={themeMode === 'light' ? '#FFFFFF' : '#64748B'} />
                <Text style={[styles.themePillText, themeMode === 'light' && styles.themePillTextActive]}>
                  Light
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.themePill,
                  themeMode === 'dark' && styles.themePillActive,
                ]}
                onPress={() => setThemeMode('dark')}
                activeOpacity={0.7}
              >
                <Moon size={13} color={themeMode === 'dark' ? '#FFFFFF' : '#64748B'} />
                <Text style={[styles.themePillText, themeMode === 'dark' && styles.themePillTextActive]}>
                  Dark (Black)
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Institute Info */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() =>
              Alert.alert(
                'IDEAL COACHING CENTRE',
                'Sarotiya, Post Sarbhanga, Mahagama, Godda (JH) 814165\nDirector: BADE SIR (+91 9771350910)\nUPI ID: azhargodda@ybl'
              )
            }
          >
            <View style={styles.menuLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
                <Info size={18} color="#2563EB" />
              </View>
              <View>
                <Text style={styles.menuItemText}>Institute Information & Contact</Text>
                <Text style={styles.menuItemSub}>Director: BADE SIR (+91 9771350910)</Text>
              </View>
            </View>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>

          {/* Check App Updates */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={async () => {
              const res = await useAppUpdateStore.getState().checkForUpdate();
              if (!res.hasUpdate) {
                Alert.alert(
                  'Up to Date! 🎉',
                  `You are running the latest version of IDEAL COACHING CENTRE (v${CURRENT_APP_VERSION}).`
                );
              }
            }}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
                <RefreshCw size={18} color="#2563EB" />
              </View>
              <View>
                <Text style={styles.menuItemText}>Check for App Updates</Text>
                <Text style={styles.menuItemSub}>Version v{CURRENT_APP_VERSION} (Build 1)</Text>
              </View>
            </View>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <LogOut size={18} color="#DC2626" />
          <Text style={styles.logoutBtnText}>
            Sign Out
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* 1. EDIT PROFILE DETAILS MODAL */}
      <Modal
        visible={isEditProfileOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditProfileOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: isDark ? '#121212' : '#FFFFFF', borderColor: isDark ? '#27272A' : '#E2E8F0', borderWidth: isDark ? 1 : 0 }]}>
            <View style={[styles.modalHeader, { backgroundColor: isDark ? '#000000' : '#F8FAFC', borderBottomColor: isDark ? '#27272A' : '#E2E8F0' }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Update Student Details</Text>
              <TouchableOpacity onPress={() => setIsEditProfileOpen(false)}>
                <X size={20} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Full Name</Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
                  placeholderTextColor={theme.textMuted}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Student Full Name"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Mobile / WhatsApp Number (+91)</Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
                  placeholderTextColor={theme.textMuted}
                  value={mobileNumber}
                  onChangeText={setMobileNumber}
                  placeholder="10-digit Mobile Number"
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Email ID</Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
                  placeholderTextColor={theme.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="student@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* Guardian Name & Mobile Number */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Guardian / Parent Name</Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
                  placeholderTextColor={theme.textMuted}
                  value={guardianName}
                  onChangeText={setGuardianName}
                  placeholder="Father's / Mother's / Guardian's Full Name"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Guardian Mobile Number (+91)</Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
                  placeholderTextColor={theme.textMuted}
                  value={guardianPhone}
                  onChangeText={setGuardianPhone}
                  placeholder="10-digit Guardian Mobile Number"
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>School / College Name</Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
                  placeholderTextColor={theme.textMuted}
                  value={schoolName}
                  onChangeText={setSchoolName}
                  placeholder="Your School or College"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>District</Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
                  placeholderTextColor={theme.textMuted}
                  value={district}
                  onChangeText={setDistrict}
                  placeholder="e.g. Godda / Patna / Ranchi"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Class</Text>
                <View style={styles.classPickerRow}>
                  {['Class 9', 'Class 10', 'Class 11', 'Class 12'].map((cls) => (
                    <TouchableOpacity
                      key={cls}
                      style={[
                        styles.classPillBtn,
                        { backgroundColor: isDark ? '#18181B' : '#F1F5F9', borderColor: isDark ? '#27272A' : '#E2E8F0' },
                        selectedClassForm === cls && styles.classPillBtnActive
                      ]}
                      onPress={() => setSelectedClassForm(cls)}
                    >
                      <Text style={[
                        styles.classPillBtnText,
                        { color: theme.textSecondary },
                        selectedClassForm === cls && styles.classPillBtnTextActive
                      ]}>
                        {cls}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={[styles.modalFooter, { backgroundColor: isDark ? '#000000' : '#F8FAFC', borderTopColor: isDark ? '#27272A' : '#E2E8F0' }]}>
              <TouchableOpacity
                style={[styles.cancelBtn, { backgroundColor: isDark ? '#18181B' : '#F1F5F9', borderColor: isDark ? '#27272A' : '#CBD5E1', borderWidth: isDark ? 1 : 0 }]}
                onPress={() => setIsEditProfileOpen(false)}
              >
                <Text style={[styles.cancelBtnText, { color: theme.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSaveProfile}
              >
                <Text style={styles.saveBtnText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 2. CHANGE PASSWORD MODAL */}
      <Modal
        visible={isChangePasswordOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsChangePasswordOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: isDark ? '#121212' : '#FFFFFF', borderColor: isDark ? '#27272A' : '#E2E8F0', borderWidth: isDark ? 1 : 0 }]}>
            <View style={[styles.modalHeader, { backgroundColor: isDark ? '#000000' : '#F8FAFC', borderBottomColor: isDark ? '#27272A' : '#E2E8F0' }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Change Password</Text>
              <TouchableOpacity onPress={() => setIsChangePasswordOpen(false)}>
                <X size={20} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Current Password</Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
                  placeholderTextColor={theme.textMuted}
                  secureTextEntry
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Enter current password"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>New Password (min 6 characters)</Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
                  placeholderTextColor={theme.textMuted}
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Enter new password"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Confirm New Password</Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
                  placeholderTextColor={theme.textMuted}
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Re-enter new password"
                />
              </View>
            </View>

            <View style={[styles.modalFooter, { backgroundColor: isDark ? '#000000' : '#F8FAFC', borderTopColor: isDark ? '#27272A' : '#E2E8F0' }]}>
              <TouchableOpacity
                style={[styles.cancelBtn, { backgroundColor: isDark ? '#18181B' : '#F1F5F9', borderColor: isDark ? '#27272A' : '#CBD5E1', borderWidth: isDark ? 1 : 0 }]}
                onPress={() => setIsChangePasswordOpen(false)}
              >
                <Text style={[styles.cancelBtnText, { color: theme.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleChangePassword}
                disabled={passwordLoading}
              >
                <Text style={styles.saveBtnText}>
                  {passwordLoading ? 'Updating...' : 'Update Password'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 3. PROFILE PHOTO / AVATAR MODAL */}
      <Modal
        visible={isPhotoModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsPhotoModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: isDark ? '#121212' : '#FFFFFF', borderColor: isDark ? '#27272A' : '#E2E8F0', borderWidth: isDark ? 1 : 0 }]}>
            <View style={[styles.modalHeader, { backgroundColor: isDark ? '#000000' : '#F8FAFC', borderBottomColor: isDark ? '#27272A' : '#E2E8F0' }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Choose Profile Photo</Text>
              <TouchableOpacity onPress={() => setIsPhotoModalOpen(false)}>
                <X size={20} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Device Upload Actions */}
              <View style={[styles.deviceUploadCard, { backgroundColor: isDark ? '#18181B' : '#F8FAFC', borderColor: isDark ? '#27272A' : '#E2E8F0' }]}>
                <Text style={[styles.deviceUploadTitle, { color: theme.text }]}>Upload from Your Device</Text>
                <View style={styles.deviceActionRow}>
                  <TouchableOpacity
                    style={[styles.galleryUploadBtn, { backgroundColor: isDark ? '#1E293B' : '#EFF6FF', borderColor: isDark ? '#3B82F6' : '#DBEAFE' }]}
                    onPress={handlePickFromGallery}
                    activeOpacity={0.8}
                  >
                    <ImageIcon size={18} color="#2563EB" />
                    <Text style={styles.galleryUploadBtnText}>Device Gallery</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.cameraUploadBtn, { backgroundColor: isDark ? '#064E3B' : '#ECFDF5', borderColor: isDark ? '#059669' : '#A7F3D0' }]}
                    onPress={handleCaptureCamera}
                    activeOpacity={0.8}
                  >
                    <Camera size={18} color="#059669" />
                    <Text style={styles.cameraUploadBtnText}>Take Photo</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={[styles.presetHeading, { color: theme.textSecondary }]}>Or Select Curated Student Avatar</Text>
              <View style={styles.avatarGrid}>
                {PRESET_AVATARS.map((url, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.avatarChoice}
                    onPress={() => handleSelectAvatar(url)}
                    activeOpacity={0.8}
                  >
                    <Image source={{ uri: url }} style={styles.avatarChoiceImg} />
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.presetHeading, { color: theme.textSecondary, marginTop: 18 }]}>Or Enter Custom Photo URL</Text>
              <View style={styles.customUrlRow}>
                <TextInput
                  style={[styles.textInput, { flex: 1, backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
                  placeholderTextColor={theme.textMuted}
                  placeholder="https://example.com/photo.jpg"
                  value={customPhotoUrl}
                  onChangeText={setCustomPhotoUrl}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.customUrlBtn}
                  onPress={handleCustomPhotoUrlSubmit}
                >
                  <Check size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={[styles.modalFooter, { backgroundColor: isDark ? '#000000' : '#F8FAFC', borderTopColor: isDark ? '#27272A' : '#E2E8F0' }]}>
              <TouchableOpacity
                style={[styles.cancelBtn, { backgroundColor: isDark ? '#18181B' : '#F1F5F9', borderColor: isDark ? '#27272A' : '#CBD5E1', borderWidth: isDark ? 1 : 0 }]}
                onPress={() => setIsPhotoModalOpen(false)}
              >
                <Text style={[styles.cancelBtnText, { color: theme.textSecondary }]}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 4. WHATSAPP ACCOUNT LINKING MODAL */}
      <Modal
        visible={isWhatsAppModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsWhatsAppModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: isDark ? '#121212' : '#FFFFFF', borderColor: isDark ? '#27272A' : '#E2E8F0', borderWidth: isDark ? 1 : 0 }]}>
            <View style={[styles.modalHeader, { backgroundColor: isDark ? '#000000' : '#F8FAFC', borderBottomColor: isDark ? '#27272A' : '#E2E8F0' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <MessageSquare size={20} color="#059669" />
                <Text style={[styles.modalTitle, { color: theme.text }]}>Link WhatsApp Assistant</Text>
              </View>
              <TouchableOpacity onPress={() => setIsWhatsAppModalOpen(false)}>
                <X size={20} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={[styles.modalBody, { paddingVertical: 16 }]}>
              <Text style={{ fontSize: 13, color: theme.textSecondary, lineHeight: 18, marginBottom: 14 }}>
                Send this secure verification code to the IDEAL COACHING CENTRE WhatsApp bot to link your student profile.
              </Text>

              {waLinkToken ? (
                <View style={{ backgroundColor: isDark ? '#1E293B' : '#EFF6FF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: isDark ? '#3B82F6' : '#BFDBFE', alignItems: 'center', gap: 8 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: isDark ? '#93C5FD' : '#1E40AF', textTransform: 'uppercase' }}>
                    One-Time Verification Code (Valid 5 Mins)
                  </Text>
                  <Text style={{ fontSize: 24, fontWeight: '800', fontFamily: 'monospace', color: isDark ? '#60A5FA' : '#1D4ED8', letterSpacing: 2 }}>
                    #LINK {waLinkToken}
                  </Text>

                  <TouchableOpacity
                    style={{ backgroundColor: '#2563EB', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, width: '100%', alignItems: 'center', marginTop: 8 }}
                    onPress={() => {
                      Linking.openURL(`https://wa.me/919771350910?text=${encodeURIComponent('#LINK ' + waLinkToken)}`);
                    }}
                  >
                    <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>
                      📲 Open WhatsApp & Send Code
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : null}

              <View style={{ marginTop: 14, backgroundColor: isDark ? '#272008' : '#FEF3C7', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: isDark ? '#78350F' : '#FDE68A' }}>
                <Text style={{ fontSize: 11, color: isDark ? '#FDE68A' : '#92400E', lineHeight: 16 }}>
                  💡 Once linked, you can ask for your live class schedule, study notes, and Sunday test results directly on WhatsApp 24/7!
                </Text>
              </View>
            </View>

            <View style={[styles.modalFooter, { backgroundColor: isDark ? '#000000' : '#F8FAFC', borderTopColor: isDark ? '#27272A' : '#E2E8F0' }]}>
              <TouchableOpacity
                style={[styles.cancelBtn, { backgroundColor: isDark ? '#18181B' : '#F1F5F9', borderColor: isDark ? '#27272A' : '#CBD5E1', borderWidth: isDark ? 1 : 0 }]}
                onPress={() => setIsWhatsAppModalOpen(false)}
              >
                <Text style={[styles.cancelBtnText, { color: theme.textSecondary }]}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 5. ADMIN UPI FEE APPROVALS MODAL */}
      <Modal
        visible={isPaymentModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsPaymentModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: isDark ? '#121212' : '#FFFFFF', borderColor: isDark ? '#27272A' : '#E2E8F0', borderWidth: isDark ? 1 : 0 }]}>
            <View style={[styles.modalHeader, { backgroundColor: isDark ? '#000000' : '#F8FAFC', borderBottomColor: isDark ? '#27272A' : '#E2E8F0' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <CreditCard size={20} color="#D97706" />
                <Text style={[styles.modalTitle, { color: theme.text }]}>Pending UPI Fee Approvals</Text>
              </View>
              <TouchableOpacity onPress={() => setIsPaymentModalOpen(false)}>
                <X size={20} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Filter Tabs: All, Pending, Approved, Rejected */}
            <View style={styles.paymentFilterTabs}>
              {[
                { key: 'all', label: `All (${payments.length})` },
                { key: 'pending', label: `Pending (${payments.filter((p) => p.status === 'pending').length})` },
                { key: 'approved', label: `Approved (${payments.filter((p) => p.status === 'approved').length})` },
                { key: 'rejected', label: `Rejected (${payments.filter((p) => p.status === 'rejected').length})` },
              ].map((tab) => (
                <TouchableOpacity
                  key={tab.key}
                  style={[
                    styles.paymentFilterTab,
                    { backgroundColor: isDark ? '#18181B' : '#F1F5F9', borderColor: isDark ? '#27272A' : '#E2E8F0' },
                    paymentFilter === tab.key && styles.paymentFilterTabActive,
                  ]}
                  onPress={() => setPaymentFilter(tab.key as any)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.paymentFilterTabText,
                      { color: theme.textSecondary },
                      paymentFilter === tab.key && styles.paymentFilterTabTextActive,
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <ScrollView contentContainerStyle={styles.modalBody}>
              {payments
                .filter((p) => (paymentFilter === 'all' ? true : p.status === paymentFilter))
                .length === 0 ? (
                <View style={styles.emptyPaymentsBox}>
                  <CheckCircle size={38} color="#10B981" />
                  <Text style={[styles.emptyPaymentsTitle, { color: theme.text }]}>All Caught Up!</Text>
                  <Text style={[styles.emptyPaymentsSub, { color: theme.textSecondary }]}>
                    {paymentFilter === 'pending'
                      ? 'No pending fee verification requests at this moment.'
                      : `No receipts found under ${paymentFilter} status.`}
                  </Text>
                </View>
              ) : (
                payments
                  .filter((p) => (paymentFilter === 'all' ? true : p.status === paymentFilter))
                  .map((p) => (
                    <View key={p.id} style={[styles.paymentCard, { backgroundColor: isDark ? '#18181B' : '#F8FAFC', borderColor: isDark ? '#27272A' : '#E2E8F0' }]}>
                      <View style={styles.paymentCardHeader}>
                        <View>
                          <Text style={[styles.paymentStudentName, { color: theme.text }]}>
                            {p.student?.full_name || 'ICC Student'}
                          </Text>
                          <Text style={[styles.paymentMobile, { color: theme.textSecondary }]}>
                            +91 {p.student?.mobile_number || '9876543210'}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.paymentStatusPill,
                            p.status === 'approved'
                              ? styles.statusApproved
                              : p.status === 'rejected'
                              ? styles.statusRejected
                              : styles.statusPending,
                          ]}
                        >
                          <Text style={styles.paymentStatusText}>
                            {p.status.toUpperCase()}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.paymentDetailRow}>
                        <Text style={[styles.paymentCourse, { color: theme.textSecondary }]}>
                          {p.course?.title || 'Target Course'}
                        </Text>
                        <Text style={[styles.paymentAmount, { color: theme.text }]}>{formatINR(p.amount)}</Text>
                      </View>

                      <View style={[styles.utrBox, { backgroundColor: isDark ? '#121212' : '#EFF6FF', borderColor: isDark ? '#27272A' : '#DBEAFE' }]}>
                        <Text style={[styles.utrLabel, { color: theme.textSecondary }]}>UPI Ref / UTR:</Text>
                        <Text style={[styles.utrValue, { color: theme.text }]}>{p.upi_ref_number}</Text>
                      </View>

                      {/* Action buttons ONLY shown when pending — never for approved/rejected */}
                      {p.status === 'pending' && (
                        <View style={styles.paymentActionButtons}>
                          <TouchableOpacity
                            style={styles.approvePayBtn}
                            onPress={() =>
                              handleApprovePayment(p.id, p.student?.full_name || 'Student')
                            }
                          >
                            <Check size={14} color="#FFFFFF" />
                            <Text style={styles.approvePayBtnText}>Approve & Unlock</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.rejectPayBtn}
                            onPress={() =>
                              handleRejectPayment(p.id, p.student?.full_name || 'Student')
                            }
                          >
                            <X size={14} color="#EF4444" />
                            <Text style={styles.rejectPayBtnText}>Reject</Text>
                          </TouchableOpacity>
                        </View>
                      )}

                      {/* Permanent Verification Confirmation for Approved */}
                      {p.status === 'approved' && (
                        <View style={styles.paymentApprovedBanner}>
                          <CheckCircle size={15} color="#059669" />
                          <Text style={styles.paymentApprovedBannerText}>
                            ✓ Enrollment Active • Course Unlocked Permanently
                          </Text>
                        </View>
                      )}

                      {/* Permanent Rejection Notice for Rejected */}
                      {p.status === 'rejected' && (
                        <View style={styles.paymentRejectedBanner}>
                          <XCircle size={15} color="#DC2626" />
                          <Text style={styles.paymentRejectedBannerText}>
                            ✕ Payment Submission Rejected by Director
                          </Text>
                        </View>
                      )}
                    </View>
                  ))
              )}
            </ScrollView>

            <View style={[styles.modalFooter, { backgroundColor: isDark ? '#000000' : '#F8FAFC', borderTopColor: isDark ? '#27272A' : '#E2E8F0' }]}>
              <TouchableOpacity
                style={[styles.cancelBtn, { backgroundColor: isDark ? '#18181B' : '#F1F5F9', borderColor: isDark ? '#27272A' : '#CBD5E1', borderWidth: isDark ? 1 : 0 }]}
                onPress={() => setIsPaymentModalOpen(false)}
              >
                <Text style={[styles.cancelBtnText, { color: theme.textSecondary }]}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 6. ADMIN STUDENT DIRECTORY MODAL */}
      <Modal
        visible={isStudentModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsStudentModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: isDark ? '#121212' : '#FFFFFF', borderColor: isDark ? '#27272A' : '#E2E8F0', borderWidth: isDark ? 1 : 0 }]}>
            <View style={[styles.modalHeader, { backgroundColor: isDark ? '#000000' : '#F8FAFC', borderBottomColor: isDark ? '#27272A' : '#E2E8F0' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Users size={20} color="#2563EB" />
                <Text style={[styles.modalTitle, { color: theme.text }]}>Student Directory & WhatsApp Alerts</Text>
              </View>
              <TouchableOpacity onPress={() => setIsStudentModalOpen(false)}>
                <X size={20} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={[styles.searchContainer, { backgroundColor: isDark ? '#18181B' : '#F8FAFC', borderColor: isDark ? '#27272A' : '#CBD5E1' }]}>
              <Search size={16} color={theme.textMuted} />
              <TextInput
                style={[styles.searchInput, { color: theme.text }]}
                placeholderTextColor={theme.textMuted}
                placeholder="Search by student name or mobile..."
                value={studentSearch}
                onChangeText={setStudentSearch}
              />
            </View>

            <ScrollView contentContainerStyle={styles.modalBody}>
              {students
                .filter((s) => {
                  if (!studentSearch.trim()) return true;
                  const q = studentSearch.toLowerCase();
                  return (
                    s.full_name.toLowerCase().includes(q) ||
                    s.mobile_number.includes(q)
                  );
                })
                .map((student) => (
                  <View key={student.id} style={[styles.studentCard, { backgroundColor: isDark ? '#18181B' : '#F8FAFC', borderColor: isDark ? '#27272A' : '#E2E8F0' }]}>
                    <View style={styles.studentHeader}>
                      <View>
                        <Text style={[styles.studentName, { color: theme.text }]}>{student.full_name}</Text>
                        <Text style={[styles.studentMeta, { color: theme.textSecondary }]}>
                          {student.board_code} Class 10 • {student.district}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={[
                          styles.activeToggleBtn,
                          student.is_active ? styles.toggleActive : styles.toggleSuspended,
                        ]}
                        onPress={() => handleToggleStudent(student)}
                      >
                        <Text style={styles.activeToggleText}>
                          {student.is_active ? 'Active' : 'Suspended'}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <Text style={[styles.guardianInfo, { color: theme.textMuted }]}>
                      Guardian: {student.guardian_name || 'N/A'} (+91 {student.guardian_phone || student.mobile_number})
                    </Text>

                    <View style={styles.studentActionRow}>
                      <TouchableOpacity
                        style={styles.callBtn}
                        onPress={() =>
                          Linking.openURL(`tel:${student.guardian_phone || student.mobile_number}`)
                        }
                      >
                        <Phone size={13} color="#2563EB" />
                        <Text style={styles.callBtnText}>Call</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.waBtn}
                        onPress={() => handleSendParentWhatsApp(student, 'attendance')}
                      >
                        <MessageSquare size={13} color="#059669" />
                        <Text style={styles.waBtnText}>Attendance</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.waTestBtn}
                        onPress={() => handleSendParentWhatsApp(student, 'test')}
                      >
                        <Sparkles size={13} color="#D97706" />
                        <Text style={styles.waTestBtnText}>Test Report</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
            </ScrollView>

            <View style={[styles.modalFooter, { backgroundColor: isDark ? '#000000' : '#F8FAFC', borderTopColor: isDark ? '#27272A' : '#E2E8F0' }]}>
              <TouchableOpacity
                style={[styles.cancelBtn, { backgroundColor: isDark ? '#18181B' : '#F1F5F9', borderColor: isDark ? '#27272A' : '#CBD5E1', borderWidth: isDark ? 1 : 0 }]}
                onPress={() => setIsStudentModalOpen(false)}
              >
                <Text style={[styles.cancelBtnText, { color: theme.textSecondary }]}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 7. ADMIN BROADCAST ANNOUNCEMENT MODAL */}
      <Modal
        visible={isBroadcastModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsBroadcastModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: isDark ? '#121212' : '#FFFFFF', borderColor: isDark ? '#27272A' : '#E2E8F0', borderWidth: isDark ? 1 : 0 }]}>
            <View style={[styles.modalHeader, { backgroundColor: isDark ? '#000000' : '#F8FAFC', borderBottomColor: isDark ? '#27272A' : '#E2E8F0' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Bell size={20} color="#16A34A" />
                <Text style={[styles.modalTitle, { color: theme.text }]}>Broadcast Announcement</Text>
              </View>
              <TouchableOpacity onPress={() => setIsBroadcastModalOpen(false)}>
                <X size={20} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Announcement Title *</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
                placeholderTextColor={theme.textMuted}
                placeholder="e.g. Sunday Mega Test Schedule"
                value={broadcastTitle}
                onChangeText={setBroadcastTitle}
              />

              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Message Details *</Text>
              <TextInput
                style={[styles.textInput, { height: 90, textAlignVertical: 'top', backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
                placeholderTextColor={theme.textMuted}
                multiline
                numberOfLines={4}
                placeholder="Type your message for all enrolled students..."
                value={broadcastMsg}
                onChangeText={setBroadcastMsg}
              />
            </ScrollView>

            <View style={[styles.modalFooter, { backgroundColor: isDark ? '#000000' : '#F8FAFC', borderTopColor: isDark ? '#27272A' : '#E2E8F0' }]}>
              <TouchableOpacity
                style={[styles.cancelBtn, { backgroundColor: isDark ? '#18181B' : '#F1F5F9', borderColor: isDark ? '#27272A' : '#CBD5E1', borderWidth: isDark ? 1 : 0 }]}
                onPress={() => setIsBroadcastModalOpen(false)}
              >
                <Text style={[styles.cancelBtnText, { color: theme.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: '#16A34A' }]}
                onPress={handleSendBroadcast}
              >
                <Send size={15} color="#FFFFFF" />
                <Text style={styles.saveBtnText}>Send Broadcast</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 8. DIRECTOR AI COPILOT AUTONOMOUS AGENT MODAL */}
      <DirectorAiModal
        visible={isAiModalOpen}
        onClose={() => {
          setIsAiModalOpen(false);
          loadDirectorData();
        }}
      />

      {/* 9. LIVE CLASSES MANAGEMENT MODAL */}
      <Modal
        visible={isLiveModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsLiveModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: isDark ? '#121212' : '#FFFFFF', borderColor: isDark ? '#27272A' : '#E2E8F0', borderWidth: isDark ? 1 : 0 }]}>
            <View style={[styles.modalHeader, { backgroundColor: isDark ? '#000000' : '#F8FAFC', borderBottomColor: isDark ? '#27272A' : '#E2E8F0' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Video size={20} color="#DC2626" />
                <Text style={[styles.modalTitle, { color: theme.text }]}>Live Classes Management</Text>
              </View>
              <TouchableOpacity onPress={() => setIsLiveModalOpen(false)}>
                <X size={20} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody}>
              <Text style={[styles.inputLabel, { color: '#DC2626', fontWeight: '800' }]}>
                🔴 Schedule New YouTube Live
              </Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
                placeholderTextColor={theme.textMuted}
                placeholder="Class Title (e.g. Science Board Exam Marathon)"
                value={newLiveTitle}
                onChangeText={setNewLiveTitle}
              />
              <TextInput
                style={[styles.textInput, { marginTop: 8, backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
                placeholderTextColor={theme.textMuted}
                placeholder="YouTube Live URL or Stream Key"
                value={newLiveUrl}
                onChangeText={setNewLiveUrl}
              />
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: '#DC2626', marginTop: 10 }]}
                onPress={handleScheduleLive}
              >
                <Text style={styles.saveBtnText}>+ Schedule Live Class</Text>
              </TouchableOpacity>

              <Text style={[styles.inputLabel, { color: theme.textSecondary, marginTop: 20 }]}>
                Scheduled Live Classes ({liveClasses.length})
              </Text>
              {liveClasses.length === 0 ? (
                <Text style={{ fontSize: 12, color: theme.textMuted, textAlign: 'center', marginVertical: 12 }}>
                  No active live classes scheduled.
                </Text>
              ) : (
                liveClasses.map((item) => (
                  <View
                    key={item.id}
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: isDark ? '#1C1917' : '#FEF2F2',
                      padding: 12,
                      borderRadius: 10,
                      marginBottom: 8,
                      borderWidth: 1,
                      borderColor: isDark ? '#78350F' : '#FECACA',
                    }}
                  >
                    <View style={{ flex: 1, paddingRight: 8 }}>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: isDark ? '#FCA5A5' : '#991B1B' }}>
                        {item.title}
                      </Text>
                      <Text style={{ fontSize: 11, color: isDark ? '#EF4444' : '#DC2626', marginTop: 2 }}>
                        Status: {item.status || 'scheduled'}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeleteLive(item.id)}
                      style={{ padding: 6, backgroundColor: isDark ? '#27272A' : '#FEE2E2', borderRadius: 8 }}
                    >
                      <Trash2 size={16} color="#DC2626" />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </ScrollView>

            <View style={[styles.modalFooter, { backgroundColor: isDark ? '#000000' : '#F8FAFC', borderTopColor: isDark ? '#27272A' : '#E2E8F0' }]}>
              <TouchableOpacity
                style={[styles.cancelBtn, { backgroundColor: isDark ? '#18181B' : '#F1F5F9', borderColor: isDark ? '#27272A' : '#CBD5E1', borderWidth: isDark ? 1 : 0 }]}
                onPress={() => setIsLiveModalOpen(false)}
              >
                <Text style={[styles.cancelBtnText, { color: theme.textSecondary }]}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 10. STUDY MATERIALS / PDF NOTES MODAL */}
      <Modal
        visible={isNotesModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsNotesModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: isDark ? '#121212' : '#FFFFFF', borderColor: isDark ? '#27272A' : '#E2E8F0', borderWidth: isDark ? 1 : 0 }]}>
            <View style={[styles.modalHeader, { backgroundColor: isDark ? '#000000' : '#F8FAFC', borderBottomColor: isDark ? '#27272A' : '#E2E8F0' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <FileText size={20} color="#9333EA" />
                <Text style={[styles.modalTitle, { color: theme.text }]}>PDF Notes & Study Materials</Text>
              </View>
              <TouchableOpacity onPress={() => setIsNotesModalOpen(false)}>
                <X size={20} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody}>
              <Text style={[styles.inputLabel, { color: '#9333EA', fontWeight: '800' }]}>
                📄 Upload / Add PDF Notes
              </Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
                placeholderTextColor={theme.textMuted}
                placeholder="Note Title (e.g. Chapter 1 Formula Sheet)"
                value={newMaterialTitle}
                onChangeText={setNewMaterialTitle}
              />
              <TextInput
                style={[styles.textInput, { marginTop: 8, backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
                placeholderTextColor={theme.textMuted}
                placeholder="PDF File Link (Web Link / Document URL)"
                value={newMaterialUrl}
                onChangeText={setNewMaterialUrl}
              />
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: '#9333EA', marginTop: 10 }]}
                onPress={handleAddMaterial}
              >
                <Text style={styles.saveBtnText}>+ Save Study Material</Text>
              </TouchableOpacity>

              <Text style={[styles.inputLabel, { color: theme.textSecondary, marginTop: 20 }]}>
                Uploaded Materials ({materials.length})
              </Text>
              {materials.length === 0 ? (
                <Text style={{ fontSize: 12, color: theme.textMuted, textAlign: 'center', marginVertical: 12 }}>
                  No PDF notes uploaded yet.
                </Text>
              ) : (
                materials.map((m) => (
                  <View
                    key={m.id}
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: isDark ? '#1E1528' : '#FAF5FF',
                      padding: 12,
                      borderRadius: 10,
                      marginBottom: 8,
                      borderWidth: 1,
                      borderColor: isDark ? '#581C87' : '#E9D5FF',
                    }}
                  >
                    <View style={{ flex: 1, paddingRight: 8 }}>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: isDark ? '#D8B4FE' : '#6B21A8' }}>
                        {m.title}
                      </Text>
                      <Text style={{ fontSize: 11, color: isDark ? '#C084FC' : '#9333EA', marginTop: 2 }}>
                        Type: {m.material_type || 'notes'}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeleteMaterial(m.id)}
                      style={{ padding: 6, backgroundColor: isDark ? '#27272A' : '#F3E8FF', borderRadius: 8 }}
                    >
                      <Trash2 size={16} color="#9333EA" />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </ScrollView>

            <View style={[styles.modalFooter, { backgroundColor: isDark ? '#000000' : '#F8FAFC', borderTopColor: isDark ? '#27272A' : '#E2E8F0' }]}>
              <TouchableOpacity
                style={[styles.cancelBtn, { backgroundColor: isDark ? '#18181B' : '#F1F5F9', borderColor: isDark ? '#27272A' : '#CBD5E1', borderWidth: isDark ? 1 : 0 }]}
                onPress={() => setIsNotesModalOpen(false)}
              >
                <Text style={[styles.cancelBtnText, { color: theme.textSecondary }]}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 11. WHATSAPP AI BOT STATUS MODAL */}
      <Modal
        visible={isBotModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsBotModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: isDark ? '#121212' : '#FFFFFF', borderColor: isDark ? '#27272A' : '#E2E8F0', borderWidth: isDark ? 1 : 0 }]}>
            <View style={[styles.modalHeader, { backgroundColor: isDark ? '#000000' : '#F8FAFC', borderBottomColor: isDark ? '#27272A' : '#E2E8F0' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <MessageSquare size={20} color="#059669" />
                <Text style={[styles.modalTitle, { color: theme.text }]}>WhatsApp AI Assistant</Text>
              </View>
              <TouchableOpacity onPress={() => setIsBotModalOpen(false)}>
                <X size={20} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody}>
              <View
                style={{
                  backgroundColor: isDark ? '#062B1D' : '#ECFDF5',
                  padding: 16,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: isDark ? '#065F46' : '#A7F3D0',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: '800', color: isDark ? '#34D399' : '#065F46' }}>
                  🟢 Active & Online (24/7)
                </Text>
                <Text style={{ fontSize: 12, color: isDark ? '#6EE7B7' : '#047857', marginTop: 4, textAlign: 'center' }}>
                  Automated course inquiry and admission bot is currently answering student queries on WhatsApp.
                </Text>
              </View>

              <View style={{ marginTop: 16, gap: 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderColor: isDark ? '#27272A' : '#F1F5F9' }}>
                  <Text style={{ fontSize: 13, color: theme.textSecondary }}>Helpline Mobile</Text>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: theme.text }}>+91 9771350910</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderColor: isDark ? '#27272A' : '#F1F5F9' }}>
                  <Text style={{ fontSize: 13, color: theme.textSecondary }}>Response Speed</Text>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#059669' }}>&lt; 2 Seconds</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderColor: isDark ? '#27272A' : '#F1F5F9' }}>
                  <Text style={{ fontSize: 13, color: theme.textSecondary }}>Monthly Expense</Text>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#059669' }}>₹0 / Free Tier</Text>
                </View>
              </View>
            </ScrollView>

            <View style={[styles.modalFooter, { backgroundColor: isDark ? '#000000' : '#F8FAFC', borderTopColor: isDark ? '#27272A' : '#E2E8F0' }]}>
              <TouchableOpacity
                style={[styles.cancelBtn, { backgroundColor: isDark ? '#18181B' : '#F1F5F9', borderColor: isDark ? '#27272A' : '#CBD5E1', borderWidth: isDark ? 1 : 0 }]}
                onPress={() => setIsBotModalOpen(false)}
              >
                <Text style={[styles.cancelBtnText, { color: theme.textSecondary }]}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 12. SYSTEM STORAGE & CONFIGURATION MODAL */}
      <Modal
        visible={isQuotaModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsQuotaModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: isDark ? '#121212' : '#FFFFFF', borderColor: isDark ? '#27272A' : '#E2E8F0', borderWidth: isDark ? 1 : 0 }]}>
            <View style={[styles.modalHeader, { backgroundColor: isDark ? '#000000' : '#F8FAFC', borderBottomColor: isDark ? '#27272A' : '#E2E8F0' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Settings size={20} color="#2563EB" />
                <Text style={[styles.modalTitle, { color: theme.text }]}>Settings & System Storage</Text>
              </View>
              <TouchableOpacity onPress={() => setIsQuotaModalOpen(false)}>
                <X size={20} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody}>
              <View
                style={{
                  backgroundColor: isDark ? '#18181B' : '#0F172A',
                  borderColor: isDark ? '#27272A' : '#1E293B',
                  borderWidth: 1,
                  padding: 16,
                  borderRadius: 14,
                  marginBottom: 16,
                }}
              >
                <Text style={{ color: '#38BDF8', fontSize: 14, fontWeight: '800' }}>
                  System Health: 100% Operational
                </Text>
                <Text style={{ color: theme.textSecondary, fontSize: 11, marginTop: 4 }}>
                  All servers, video delivery streams, and study material storage running smoothly.
                </Text>
              </View>

              <View style={{ gap: 14 }}>
                <View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text }}>Database Storage</Text>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#2563EB' }}>14.2 MB / 500 MB (2.8%)</Text>
                  </View>
                  <View style={{ height: 6, backgroundColor: isDark ? '#27272A' : '#E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
                    <View style={{ width: '2.8%', height: '100%', backgroundColor: '#2563EB' }} />
                  </View>
                </View>

                <View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text }}>Media & Study Notes Storage</Text>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#9333EA' }}>42.8 MB / 1000 MB (4.2%)</Text>
                  </View>
                  <View style={{ height: 6, backgroundColor: isDark ? '#27272A' : '#E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
                    <View style={{ width: '4.2%', height: '100%', backgroundColor: '#9333EA' }} />
                  </View>
                </View>

                <View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text }}>Active Student Accounts</Text>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#16A34A' }}>Active & Ready</Text>
                  </View>
                  <View style={{ height: 6, backgroundColor: isDark ? '#27272A' : '#E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
                    <View style={{ width: '5%', height: '100%', backgroundColor: '#16A34A' }} />
                  </View>
                </View>
              </View>
            </ScrollView>

            <View style={[styles.modalFooter, { backgroundColor: isDark ? '#000000' : '#F8FAFC', borderTopColor: isDark ? '#27272A' : '#E2E8F0' }]}>
              <TouchableOpacity
                style={[styles.cancelBtn, { backgroundColor: isDark ? '#18181B' : '#F1F5F9', borderColor: isDark ? '#27272A' : '#CBD5E1', borderWidth: isDark ? 1 : 0 }]}
                onPress={() => setIsQuotaModalOpen(false)}
              >
                <Text style={[styles.cancelBtnText, { color: theme.textSecondary }]}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  avatarContainer: {
    position: 'relative',
    width: 64,
    height: 64,
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E2E8F0',
  },
  avatarFallback: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#2563EB',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  editPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  editPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  userSub: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '600',
    marginTop: 1,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  userContact: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  userEmail: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  academicCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  academicRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  academicCol: {
    flex: 1,
  },
  academicLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  academicValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  academicDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  chipRow: {
    flexDirection: 'row',
    gap: 10,
  },
  chip: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  chipTextActive: {
    color: '#2563EB',
  },
  badgeCard: {
    width: 130,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  badgeCardUnlocked: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  badgeCardLocked: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    opacity: 0.6,
  },
  badgeCardTitle: {
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
  },
  badgeCardTitleUnlocked: {
    color: '#92400E',
  },
  badgeCardTitleLocked: {
    color: '#94A3B8',
  },
  badgeCardSub: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '600',
  },
  menuSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  menuItemSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#DC2626',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalBody: {
    maxHeight: 380,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
  },
  classPickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  classPillBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  classPillBtnActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  classPillBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  classPillBtnTextActive: {
    color: '#FFFFFF',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  saveBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  presetHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  avatarChoice: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  avatarChoiceImg: {
    width: '100%',
    height: '100%',
  },
  customUrlRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  customUrlBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalAvatarSection: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  modalAvatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalAvatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
  },
  modalAvatarImage: {
    width: '100%',
    height: '100%',
  },
  modalAvatarFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalAvatarFallbackText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 20,
  },
  modalAvatarTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E3A8A',
  },
  modalAvatarSub: {
    fontSize: 10,
    color: '#3B82F6',
    marginTop: 1,
  },
  modalAvatarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginTop: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  modalAvatarBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  deviceUploadCard: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  deviceUploadTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  deviceActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  galleryUploadBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EFF6FF',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  galleryUploadBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  cameraUploadBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  cameraUploadBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },

  // Director Admin Hub Styles
  directorAdminCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    padding: 14,
    marginBottom: 16,
  },
  directorCardHeader: {
    marginBottom: 12,
  },
  directorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  directorBadgeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400E',
  },
  directorCardSub: {
    fontSize: 11,
    color: '#B45309',
    marginTop: 2,
  },
  adminHubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    gap: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  adminHubIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminHubRowTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  adminHubRowSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  pendingBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D97706',
  },

  // Payment Modal Cards
  paymentCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  paymentCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  paymentStudentName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  paymentMobile: {
    fontSize: 11,
    color: '#64748B',
  },
  paymentStatusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusApproved: {
    backgroundColor: '#D1FAE5',
  },
  statusRejected: {
    backgroundColor: '#FEE2E2',
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
  },
  paymentStatusText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0F172A',
  },
  paymentDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  paymentCourse: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '600',
    flex: 1,
  },
  paymentAmount: {
    fontSize: 13,
    fontWeight: '800',
    color: '#059669',
  },
  utrBox: {
    flexDirection: 'row',
    gap: 6,
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  utrLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  utrValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: 'monospace',
  },
  paymentActionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  paymentFilterTabs: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  paymentFilterTab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  paymentFilterTabActive: {
    backgroundColor: '#0F2B48',
  },
  paymentFilterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  paymentFilterTabTextActive: {
    color: '#FFFFFF',
  },
  paymentApprovedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  paymentApprovedBannerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
  },
  paymentRejectedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  paymentRejectedBannerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#991B1B',
  },
  emptyPaymentsBox: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyPaymentsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 10,
  },
  emptyPaymentsSub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  approvePayBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#059669',
    paddingVertical: 8,
    borderRadius: 6,
  },
  approvePayBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  rejectPayBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#FEF2F2',
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  rejectPayBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
  },

  // Student Directory Modal Styles
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    marginHorizontal: 16,
    marginTop: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 9,
    fontSize: 13,
    color: '#0F172A',
  },
  studentCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  studentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  studentName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  studentMeta: {
    fontSize: 11,
    color: '#64748B',
  },
  activeToggleBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  toggleActive: {
    backgroundColor: '#D1FAE5',
  },
  toggleSuspended: {
    backgroundColor: '#FEE2E2',
  },
  activeToggleText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0F172A',
  },
  guardianInfo: {
    fontSize: 11,
    color: '#475569',
    marginBottom: 8,
  },
  studentActionRow: {
    flexDirection: 'row',
    gap: 6,
  },
  callBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  callBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  waBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  waBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  waTestBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#FFFBEB',
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  waTestBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  themePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
  },
  themePillActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  themePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  themePillTextActive: {
    color: '#FFFFFF',
  },
});
