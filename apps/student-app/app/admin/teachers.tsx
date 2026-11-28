import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Plus, Edit3, Trash2, UserCheck, Phone, Mail, X } from 'lucide-react-native';
import { academicService, Teacher } from '../../src/services/academicService';
import { useAppTheme } from '../../src/hooks/useAppTheme';

export default function AdminTeachersScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const isDark = theme.isDark;

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Teacher | null>(null);

  const [fullName, setFullName] = useState('');
  const [qualification, setQualification] = useState('');
  const [subjects, setSubjects] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');

  const loadTeachers = useCallback(async () => {
    try {
      const list = await academicService.getTeachers();
      setTeachers(list);
    } catch {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadTeachers();
  }, [loadTeachers]);

  const openAdd = () => {
    setEditing(null);
    setFullName('');
    setQualification('');
    setSubjects('');
    setMobile('');
    setEmail('');
    setModalOpen(true);
  };

  const openEdit = (t: Teacher) => {
    setEditing(t);
    setFullName(t.full_name || '');
    setQualification(t.qualification || '');
    setSubjects(t.subjects || '');
    setMobile(t.mobile || '');
    setEmail(t.email || '');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!fullName.trim() || !subjects.trim()) {
      Alert.alert('Required', 'Please enter Teacher Name and Subjects.');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await academicService.updateTeacher(editing.id, {
          full_name: fullName.trim(),
          qualification: qualification.trim() || 'Experienced Faculty',
          subjects: subjects.trim(),
          mobile: mobile.trim(),
          email: email.trim(),
        });
        Alert.alert('Success', 'Teacher record updated in cloud database.');
      } else {
        await academicService.addTeacher({
          full_name: fullName.trim(),
          qualification: qualification.trim() || 'Experienced Faculty',
          subjects: subjects.trim(),
          mobile: mobile.trim(),
          email: email.trim(),
          assignedBatches: 1,
        });
        Alert.alert('Success', 'New teacher added to cloud database.');
      }
      setModalOpen(false);
      await loadTeachers();
    } catch (e: any) {
      Alert.alert('Database Error', e?.message || 'Failed to save teacher record.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (t: Teacher) => {
    Alert.alert('Delete Teacher', `Remove "${t.full_name}" from faculty directory?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await academicService.deleteTeacher(t.id);
            await loadTeachers();
            Alert.alert('Success', 'Teacher deleted from cloud database.');
          } catch (e: any) {
            Alert.alert('Database Error', e?.message || 'Failed to delete teacher.');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['top', 'left', 'right']}>
      <View style={[styles.header, { backgroundColor: theme.headerBg, borderBottomColor: theme.headerBorder }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: isDark ? '#18181B' : '#F1F5F9' }]}
        >
          <ArrowLeft size={20} color={theme.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Teachers & Faculty</Text>
          <Text style={[styles.headerSub, { color: theme.textSecondary }]}>Faculty Records (No Login Required)</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Plus size={16} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadTeachers();
              }}
              colors={['#2563EB']}
            />
          }
        >
          {teachers.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: theme.surfaceCard, borderColor: theme.cardBorder }]}>
              <UserCheck size={32} color="#94A3B8" />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No Teachers Added</Text>
              <Text style={[styles.emptySub, { color: theme.textSecondary }]}>Tap Add above to create a faculty record.</Text>
            </View>
          ) : (
            teachers.map((t) => (
              <View key={t.id} style={[styles.card, { backgroundColor: theme.surfaceCard, borderColor: theme.cardBorder }]}>
                <View style={styles.cardTop}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{(t.full_name || 'T').charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.name, { color: theme.text }]}>{t.full_name}</Text>
                    <Text style={[styles.qual, { color: theme.textSecondary }]}>{t.qualification}</Text>
                    <Text style={styles.subj}>{t.subjects}</Text>
                  </View>
                  <View style={styles.actions}>
                    <TouchableOpacity onPress={() => openEdit(t)} style={[styles.iconAction, { backgroundColor: isDark ? '#1E293B' : '#EFF6FF' }]}>
                      <Edit3 size={15} color="#2563EB" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(t)} style={[styles.iconAction, { backgroundColor: isDark ? '#2C0B0E' : '#FEF2F2' }]}>
                      <Trash2 size={15} color="#DC2626" />
                    </TouchableOpacity>
                  </View>
                </View>
                {(t.mobile || t.email) ? (
                  <View style={[styles.metaRow, { borderTopColor: theme.cardBorder }]}>
                    {t.mobile ? (
                      <View style={styles.metaItem}>
                        <Phone size={12} color={theme.textSecondary} />
                        <Text style={[styles.metaText, { color: theme.textSecondary }]}>+91 {t.mobile}</Text>
                      </View>
                    ) : null}
                    {t.email ? (
                      <View style={styles.metaItem}>
                        <Mail size={12} color={theme.textSecondary} />
                        <Text style={[styles.metaText, { color: theme.textSecondary }]}>{t.email}</Text>
                      </View>
                    ) : null}
                  </View>
                ) : null}
              </View>
            ))
          )}
        </ScrollView>
      )}

      <Modal visible={modalOpen} transparent animationType="slide" onRequestClose={() => setModalOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.surfaceCard, borderColor: theme.cardBorder }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {editing ? 'Edit Teacher Record' : 'Add New Teacher'}
              </Text>
              <TouchableOpacity onPress={() => setModalOpen(false)}>
                <X size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
              placeholderTextColor={theme.textMuted}
              placeholder="Full Name (e.g. BADE SIR)"
              value={fullName}
              onChangeText={setFullName}
            />
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
              placeholderTextColor={theme.textMuted}
              placeholder="Qualification (e.g. M.Sc., B.Ed.)"
              value={qualification}
              onChangeText={setQualification}
            />
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
              placeholderTextColor={theme.textMuted}
              placeholder="Subjects (e.g. Mathematics & Science)"
              value={subjects}
              onChangeText={setSubjects}
            />
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
              placeholderTextColor={theme.textMuted}
              placeholder="Mobile Number (10 digits)"
              keyboardType="phone-pad"
              value={mobile}
              onChangeText={setMobile}
            />
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
              placeholderTextColor={theme.textMuted}
              placeholder="Email (Optional)"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            <TouchableOpacity
              style={[styles.saveBtn, saving && { opacity: 0.65 }]}
              disabled={saving}
              onPress={handleSave}
            >
              <Text style={styles.saveBtnText}>{saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Teacher'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '800' },
  headerSub: { fontSize: 11, fontWeight: '600' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 16, gap: 12 },
  emptyCard: { padding: 28, borderRadius: 16, borderWidth: 1, alignItems: 'center', gap: 6 },
  emptyTitle: { fontSize: 15, fontWeight: '800' },
  emptySub: { fontSize: 12, textAlign: 'center' },
  card: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 10 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  name: { fontSize: 15, fontWeight: '800' },
  qual: { fontSize: 12, fontWeight: '600', marginTop: 1 },
  subj: { fontSize: 12, fontWeight: '700', color: '#2563EB', marginTop: 2 },
  actions: { flexDirection: 'row', gap: 6 },
  iconAction: { width: 34, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, borderTopWidth: 1, paddingTop: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: 11.5, fontWeight: '600' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 16 },
  modalCard: { borderRadius: 18, borderWidth: 1, padding: 18, gap: 10 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  modalTitle: { fontSize: 16, fontWeight: '800' },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13 },
  saveBtn: { backgroundColor: '#2563EB', borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 4 },
  saveBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
});
