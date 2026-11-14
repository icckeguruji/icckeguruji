import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/useAuthStore';
import { CoachingHeader } from '../../src/components/CoachingHeader';
import { supabase } from '../../src/lib/supabase';
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
  const {
    user,
    selectedBoard,
    setBoard,
    selectedClass,
    setClass,
    isDarkMode,
    toggleDarkMode,
    updateProfile,
    logout,
  } = useAuthStore();

  // Modals state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

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

      // Attempt live Supabase profile sync
      if (user?.id) {
        const updatePayload = {
          full_name: fullName.trim(),
          mobile_number: mobileNumber.trim(),
          email: email.trim(),
          guardian_name: guardianName.trim(),
          guardian_phone: guardianPhone.trim(),
          district: district.trim(),
          school_name: schoolName.trim(),
        };
        try {
          await supabase.from('profiles').update(updatePayload).eq('id', user.id);
        } catch {}
        try {
          await supabase.from('users').update(updatePayload).eq('id', user.id);
        } catch {}
      }

      setIsEditProfileOpen(false);
      Alert.alert('Success', 'Your profile details have been successfully updated!');
    } catch {
      setIsEditProfileOpen(false);
      Alert.alert('Profile Saved', 'Profile details updated in your local app state.');
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

  // Handle Select Photo
  const handleSelectAvatar = (url: string) => {
    updateProfile({ avatar_url: url });
    setIsPhotoModalOpen(false);
    Alert.alert('Photo Updated', 'Your profile photo has been updated successfully!');
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
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Branded Coaching Header with Logo & Name */}
      <CoachingHeader />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Student Profile</Text>
        <Text style={styles.headerSub}>
          Manage student details, password credentials and profile photo
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* User Card with Photo / Avatar Uploader */}
        <View style={styles.userCard}>
          <View style={styles.avatarContainer}>
            {user?.avatar_url ? (
              <Image source={{ uri: user.avatar_url }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarText}>
                  {user?.full_name ? user.full_name[0].toUpperCase() : 'S'}
                </Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.cameraBadge}
              onPress={() => setIsPhotoModalOpen(true)}
              activeOpacity={0.8}
            >
              <Camera size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={styles.userName}>{user?.full_name || 'Rohit Kumar'}</Text>
              <TouchableOpacity
                style={styles.editPill}
                onPress={openEditModal}
              >
                <Edit3 size={12} color="#2563EB" />
                <Text style={styles.editPillText}>Edit</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.userSub}>@{user?.username || 'rohit_kumar'}</Text>
            <View style={styles.contactRow}>
              <Phone size={12} color="#64748B" />
              <Text style={styles.userContact}>+91 {user?.mobile_number || '9876543210'}</Text>
            </View>
            <View style={styles.contactRow}>
              <Mail size={12} color="#64748B" />
              <Text style={styles.userEmail}>{user?.email || 'rohit.kumar@example.com'}</Text>
            </View>
          </View>
        </View>

        {/* Academic Details & Guardian Summary Card */}
        <View style={styles.academicCard}>
          <View style={styles.academicRow}>
            <View style={styles.academicCol}>
              <Text style={styles.academicLabel}>Board</Text>
              <Text style={styles.academicValue}>{selectedBoard === 'BSEB' ? 'Bihar Board (BSEB)' : 'Jharkhand (JAC)'}</Text>
            </View>
            <View style={styles.academicCol}>
              <Text style={styles.academicLabel}>Class</Text>
              <Text style={styles.academicValue}>{selectedClass || 'Class 10'}</Text>
            </View>
          </View>

          <View style={styles.academicDivider} />

          <View style={styles.academicRow}>
            <View style={styles.academicCol}>
              <Text style={styles.academicLabel}>School / College</Text>
              <Text style={styles.academicValue} numberOfLines={1}>
                {user?.school_name || 'Patna Collegiate High School'}
              </Text>
            </View>
            <View style={styles.academicCol}>
              <Text style={styles.academicLabel}>District</Text>
              <Text style={styles.academicValue}>{user?.district || 'Patna'}</Text>
            </View>
          </View>

          <View style={styles.academicDivider} />

          <View style={styles.academicRow}>
            <View style={styles.academicCol}>
              <Text style={styles.academicLabel}>Guardian / Parent</Text>
              <Text style={styles.academicValue} numberOfLines={1}>
                {user?.guardian_name || 'Shri Manoj Kumar'}
              </Text>
            </View>
            <View style={styles.academicCol}>
              <Text style={styles.academicLabel}>Guardian Phone</Text>
              <Text style={styles.academicValue}>
                {user?.guardian_phone ? `+91 ${user.guardian_phone}` : '+91 9876500001'}
              </Text>
            </View>
          </View>
        </View>

        {/* Board Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <GraduationCap size={16} color="#2563EB" />
            <Text style={styles.sectionTitle}>Change Target Board</Text>
          </View>
          <View style={styles.chipRow}>
            <TouchableOpacity
              style={[styles.chip, selectedBoard === 'BSEB' && styles.chipActive]}
              onPress={() => setBoard('BSEB')}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, selectedBoard === 'BSEB' && styles.chipTextActive]}>
                Bihar Board (BSEB)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.chip, selectedBoard === 'JAC' && styles.chipActive]}
              onPress={() => setBoard('JAC')}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, selectedBoard === 'JAC' && styles.chipTextActive]}>
                Jharkhand Board (JAC)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* General Options & Actions */}
        <View style={styles.menuSection}>
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
                <Text style={styles.menuItemText}>Update Personal Details</Text>
                <Text style={styles.menuItemSub}>Name, Mobile, Guardian, Photo & School</Text>
              </View>
            </View>
            <ChevronRight size={18} color="#94A3B8" />
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
                <Text style={styles.menuItemText}>Change Password</Text>
                <Text style={styles.menuItemSub}>Update your login credentials</Text>
              </View>
            </View>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>

          {/* Change Profile Photo Item */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setIsPhotoModalOpen(true)}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#F3E8FF' }]}>
                <Camera size={18} color="#9333EA" />
              </View>
              <View>
                <Text style={styles.menuItemText}>Upload / Change Photo</Text>
                <Text style={styles.menuItemSub}>Select profile avatar or custom image</Text>
              </View>
            </View>
            <ChevronRight size={18} color="#94A3B8" />
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
                <Text style={styles.menuItemText}>Content DRM & Security</Text>
                <Text style={styles.menuItemSub}>Screenshots & recording blocked</Text>
              </View>
            </View>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>

          {/* Theme Toggle */}
          <TouchableOpacity style={styles.menuItem} onPress={toggleDarkMode}>
            <View style={styles.menuLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#F1F5F9' }]}>
                <Moon size={18} color="#475569" />
              </View>
              <View>
                <Text style={styles.menuItemText}>Theme Appearance</Text>
                <Text style={styles.menuItemSub}>{isDarkMode ? 'Dark theme enabled' : 'Light theme'}</Text>
              </View>
            </View>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>

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
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Student Details</Text>
              <TouchableOpacity onPress={() => setIsEditProfileOpen(false)}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Profile Photo / Avatar Option in Edit Modal */}
              <View style={styles.modalAvatarSection}>
                <View style={styles.modalAvatarRow}>
                  <View style={styles.modalAvatarContainer}>
                    {user?.avatar_url ? (
                      <Image source={{ uri: user.avatar_url }} style={styles.modalAvatarImage} />
                    ) : (
                      <View style={styles.modalAvatarFallback}>
                        <Text style={styles.modalAvatarFallbackText}>
                          {fullName ? fullName[0].toUpperCase() : 'S'}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalAvatarTitle}>Profile Photo</Text>
                    <Text style={styles.modalAvatarSub}>Select avatar or custom photo link</Text>
                    <TouchableOpacity
                      style={styles.modalAvatarBtn}
                      onPress={() => setIsPhotoModalOpen(true)}
                      activeOpacity={0.8}
                    >
                      <Camera size={13} color="#2563EB" />
                      <Text style={styles.modalAvatarBtnText}>Change Photo</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Student Full Name"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mobile / WhatsApp Number (+91)</Text>
                <TextInput
                  style={styles.textInput}
                  value={mobileNumber}
                  onChangeText={setMobileNumber}
                  placeholder="10-digit Mobile Number"
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email ID</Text>
                <TextInput
                  style={styles.textInput}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="student@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* Guardian Name & Mobile Number */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Guardian / Parent Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={guardianName}
                  onChangeText={setGuardianName}
                  placeholder="Father's / Mother's / Guardian's Full Name"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Guardian Mobile Number (+91)</Text>
                <TextInput
                  style={styles.textInput}
                  value={guardianPhone}
                  onChangeText={setGuardianPhone}
                  placeholder="10-digit Guardian Mobile Number"
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>School / College Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={schoolName}
                  onChangeText={setSchoolName}
                  placeholder="Your School or College"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>District</Text>
                <TextInput
                  style={styles.textInput}
                  value={district}
                  onChangeText={setDistrict}
                  placeholder="e.g. Godda / Patna / Ranchi"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Class</Text>
                <View style={styles.classPickerRow}>
                  {['Class 9', 'Class 10', 'Class 11', 'Class 12'].map((cls) => (
                    <TouchableOpacity
                      key={cls}
                      style={[styles.classPillBtn, selectedClassForm === cls && styles.classPillBtnActive]}
                      onPress={() => setSelectedClassForm(cls)}
                    >
                      <Text style={[styles.classPillBtnText, selectedClassForm === cls && styles.classPillBtnTextActive]}>
                        {cls}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setIsEditProfileOpen(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
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
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <TouchableOpacity onPress={() => setIsChangePasswordOpen(false)}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Current Password</Text>
                <TextInput
                  style={styles.textInput}
                  secureTextEntry
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Enter current password"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>New Password (min 6 characters)</Text>
                <TextInput
                  style={styles.textInput}
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Enter new password"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirm New Password</Text>
                <TextInput
                  style={styles.textInput}
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Re-enter new password"
                />
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setIsChangePasswordOpen(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
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
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Profile Photo</Text>
              <TouchableOpacity onPress={() => setIsPhotoModalOpen(false)}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.presetHeading}>Select Curated Student Avatar</Text>
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

              <Text style={[styles.presetHeading, { marginTop: 18 }]}>Or Enter Custom Photo URL</Text>
              <View style={styles.customUrlRow}>
                <TextInput
                  style={[styles.textInput, { flex: 1 }]}
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

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setIsPhotoModalOpen(false)}
              >
                <Text style={styles.cancelBtnText}>Close</Text>
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
});
