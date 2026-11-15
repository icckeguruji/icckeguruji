import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  BookOpen,
  ShieldCheck,
  Eye,
  Download,
  CheckCircle2,
  Trash2,
  HardDriveDownload,
  Plus,
  FileText,
  Upload,
  X,
  FileCheck,
} from 'lucide-react-native';
import { formatBytes } from '@icc/shared-utils';
import { initialStudyMaterials } from '../../../admin-web/src/lib/sample-data';
import { CoachingHeader } from '../../src/components/CoachingHeader';
import { DataService } from '../../src/services/dataService';
import { academicService } from '../../src/services/academicService';
import { OfflineStorageService, OfflineItem } from '../../src/services/offlineStorage';
import { StudyMaterial, MaterialType } from '@icc/shared-types';
import { useAuthStore } from '../../src/store/useAuthStore';
import * as DocumentPicker from 'expo-document-picker';

export default function StudentNotesScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  const isAdmin =
    user?.role === 'admin' ||
    user?.role === 'super_admin' ||
    user?.role === 'teacher' ||
    user?.email === 'icckeguruji@gmail.com' ||
    user?.mobile_number === '9771350910' ||
    user?.username === 'badesir';

  const [materials, setMaterials] = useState<StudyMaterial[]>(initialStudyMaterials);
  const [offlineItems, setOfflineItems] = useState<OfflineItem[]>([]);
  const [downloadedIds, setDownloadedIds] = useState<string[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeSubject, setActiveSubject] = useState('all');

  // Admin Upload Note Modal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [pickedFile, setPickedFile] = useState<{ name: string; size: number; uri: string } | null>(
    null
  );
  const [noteForm, setNoteForm] = useState({
    title: '',
    title_hi: '',
    subject_name: 'Science',
    class_name: 'Class 10',
    chapter_name: 'Chapter 1: Chemical Reactions',
    description: '',
    material_type: 'chapter_notes' as MaterialType,
    is_free: true,
  });

  const loadOfflineVault = async () => {
    const items = await OfflineStorageService.getDownloadedItems();
    setOfflineItems(items);
    setDownloadedIds(items.map((i) => i.id));
  };

  const loadMaterials = useCallback(async () => {
    setIsSyncing(true);
    try {
      const data = await academicService.getStudyMaterials();
      if (data && data.length > 0) {
        setMaterials(data);
      } else {
        const remoteData = await DataService.fetchStudyMaterials();
        setMaterials(remoteData);
      }
      await loadOfflineVault();
    } catch {
      // Keep initial
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    loadMaterials();
    const unsubscribe = DataService.subscribeToChanges(() => {
      loadMaterials();
    });
    return () => unsubscribe();
  }, [loadMaterials]);

  const openDocument = (matId: string) => {
    router.push(`/pdf-viewer/${matId}`);
  };

  const handleDownloadOffline = async (mat: StudyMaterial) => {
    const success = await OfflineStorageService.saveForOffline({
      id: mat.id,
      title: mat.title,
      title_hi: mat.title_hi,
      subject: mat.subject?.name_hi || mat.subject?.name || 'General',
      board_code: 'BSEB/JAC',
      file_size_formatted: formatBytes(mat.file_size_bytes),
    });

    if (success) {
      Alert.alert(
        '💾 Saved Offline!',
        `"${mat.title}" has been encrypted and saved to your device. You can study this anytime without internet.`
      );
      await loadOfflineVault();
    } else {
      Alert.alert('Download Error', 'Could not save file to offline vault.');
    }
  };

  const handleRemoveOffline = async (id: string, title: string) => {
    Alert.alert('Remove from Device?', `Delete "${title}" from offline storage?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await OfflineStorageService.removeOfflineItem(id);
          await loadOfflineVault();
        },
      },
    ]);
  };

  // Pick PDF file from mobile storage
  const handlePickDocument = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!res.canceled && res.assets && res.assets[0]) {
        const asset = res.assets[0];
        setPickedFile({
          name: asset.name,
          size: asset.size || 2048000,
          uri: asset.uri,
        });
        if (!noteForm.title) {
          setNoteForm((prev) => ({
            ...prev,
            title: asset.name.replace('.pdf', '').replace(/_/g, ' '),
          }));
        }
      }
    } catch (err: any) {
      Alert.alert('File Picker Error', err.message || 'Could not select document');
    }
  };

  // Save Uploaded Note
  const handleUploadNote = async () => {
    if (!noteForm.title.trim()) {
      Alert.alert('Required', 'Please enter Document Title');
      return;
    }

    try {
      const newMat = await academicService.addStudyMaterial({
        title: noteForm.title.trim(),
        title_hi: noteForm.title_hi.trim() || noteForm.title.trim(),
        description: noteForm.description.trim() || `${noteForm.subject_name} • ${noteForm.chapter_name}`,
        file_path: pickedFile?.uri || 'bseb/class10/notes.pdf',
        file_size_bytes: pickedFile?.size || 2400000,
        material_type: noteForm.material_type,
        is_free: noteForm.is_free,
      });

      setIsUploadModalOpen(false);
      setPickedFile(null);
      setNoteForm({
        title: '',
        title_hi: '',
        subject_name: 'Science',
        class_name: 'Class 10',
        chapter_name: 'Chapter 1: Chemical Reactions',
        description: '',
        material_type: 'chapter_notes',
        is_free: true,
      });
      loadMaterials();
      Alert.alert('Success', 'PDF Study Material uploaded and linked to syllabus!');
    } catch (err: any) {
      Alert.alert('Upload Error', err.message || 'Failed to save study material');
    }
  };

  // Delete Study Material
  const handleDeleteNote = (id: string, title: string) => {
    Alert.alert('Delete Note?', `Are you sure you want to permanently delete "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await academicService.deleteStudyMaterial(id);
          loadMaterials();
          Alert.alert('Deleted', 'Note removed from library.');
        },
      },
    ]);
  };

  const filteredMaterials = materials.filter((mat) => {
    if (activeSubject === 'offline') {
      return downloadedIds.includes(mat.id);
    }
    if (activeSubject === 'sci') {
      return mat.title.toLowerCase().includes('chem') || mat.title.toLowerCase().includes('sci') || mat.title.toLowerCase().includes('bio') || mat.title.toLowerCase().includes('phy');
    }
    if (activeSubject === 'math') {
      return mat.title.toLowerCase().includes('math') || mat.title.toLowerCase().includes('real number');
    }
    if (activeSubject === 'sst') {
      return mat.title.toLowerCase().includes('sst') || mat.title.toLowerCase().includes('history') || mat.title.toLowerCase().includes('geography');
    }
    return true;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Branded Coaching Header with Logo, Name & Live Sync */}
      <CoachingHeader onRefresh={loadMaterials} isSyncing={isSyncing} />

      {/* Admin Action Bar */}
      {isAdmin && (
        <View style={styles.adminBar}>
          <View style={styles.adminBadgeRow}>
            <ShieldCheck size={14} color="#B45309" />
            <Text style={styles.adminBadgeText}>Director PDF Library</Text>
          </View>
          <TouchableOpacity
            style={styles.uploadBtn}
            onPress={() => setIsUploadModalOpen(true)}
            activeOpacity={0.8}
          >
            <Plus size={15} color="#FFFFFF" />
            <Text style={styles.uploadBtnText}>+ Upload PDF Notes</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Subject Filter Bar with Offline Tab */}
      <View style={styles.subjectBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.subjectScroll}
        >
          {[
            { id: 'all', label: 'All Notes' },
            { id: 'offline', label: `💾 Saved Offline (${downloadedIds.length})` },
            { id: 'sci', label: 'Science (विज्ञान)' },
            { id: 'math', label: 'Mathematics (गणित)' },
            { id: 'sst', label: 'Social Science (सामाजिक)' },
          ].map((sub) => (
            <TouchableOpacity
              key={sub.id}
              style={[styles.subjectChip, activeSubject === sub.id && styles.subjectChipActive]}
              onPress={() => setActiveSubject(sub.id)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.subjectChipText,
                  activeSubject === sub.id && styles.subjectChipTextActive,
                ]}
              >
                {sub.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={isSyncing}
            onRefresh={loadMaterials}
            colors={['#2563EB']}
            tintColor="#2563EB"
          />
        }
      >
        <View style={styles.notesList}>
          {filteredMaterials.map((mat) => {
            const isSaved = downloadedIds.includes(mat.id);
            return (
              <View key={mat.id} style={styles.noteCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.noteIconBox}>
                    <BookOpen size={22} color="#2563EB" />
                  </View>

                  <View style={styles.noteHeaderMeta}>
                    <View style={styles.noteTypeRow}>
                      <Text style={styles.noteType}>
                        {mat.material_type.toUpperCase().replace('_', ' ')}
                      </Text>
                      <Text style={styles.fileSize}>{formatBytes(mat.file_size_bytes)}</Text>
                      {isSaved && (
                        <View style={styles.offlinePill}>
                          <Text style={styles.offlinePillText}>💾 Offline Ready</Text>
                        </View>
                      )}
                      {mat.is_free && (
                        <View style={styles.freePill}>
                          <Text style={styles.freePillText}>FREE</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.noteTitle} numberOfLines={2}>
                      {mat.title}
                    </Text>
                  </View>
                </View>

                {mat.description ? (
                  <Text style={styles.noteDesc} numberOfLines={2}>
                    {mat.description}
                  </Text>
                ) : null}

                {/* Actions: In-App Reader & Offline Download */}
                <View style={styles.actionButtonGroup}>
                  <TouchableOpacity
                    style={styles.readBtn}
                    onPress={() => openDocument(mat.id)}
                    activeOpacity={0.8}
                  >
                    <Eye size={16} color="#FFFFFF" />
                    <Text style={styles.readBtnText}>Read (Secure)</Text>
                  </TouchableOpacity>

                  {isSaved ? (
                    <TouchableOpacity
                      style={styles.downloadedBtn}
                      onPress={() => handleRemoveOffline(mat.id, mat.title)}
                      activeOpacity={0.7}
                    >
                      <CheckCircle2 size={16} color="#059669" />
                      <Text style={styles.downloadedBtnText}>Saved 💾</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.downloadBtn}
                      onPress={() => handleDownloadOffline(mat)}
                      activeOpacity={0.7}
                    >
                      <HardDriveDownload size={16} color="#2563EB" />
                      <Text style={styles.downloadBtnText}>Save Offline</Text>
                    </TouchableOpacity>
                  )}

                  {/* Admin Delete Action */}
                  {isAdmin && (
                    <TouchableOpacity
                      style={styles.deleteNoteBtn}
                      onPress={() => handleDeleteNote(mat.id, mat.title)}
                    >
                      <Trash2 size={16} color="#EF4444" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Admin Upload PDF Notes Modal */}
      <Modal
        visible={isUploadModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsUploadModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <FileText size={20} color="#2563EB" />
                <Text style={styles.modalTitle}>Upload Handwritten PDF Notes</Text>
              </View>
              <TouchableOpacity onPress={() => setIsUploadModalOpen(false)}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody}>
              {/* Document Picker Box */}
              <TouchableOpacity
                style={[styles.filePickerBox, pickedFile && styles.filePickerBoxSelected]}
                onPress={handlePickDocument}
                activeOpacity={0.8}
              >
                {pickedFile ? (
                  <View style={{ alignItems: 'center', gap: 4 }}>
                    <FileCheck size={32} color="#059669" />
                    <Text style={styles.pickedFileName} numberOfLines={1}>
                      {pickedFile.name}
                    </Text>
                    <Text style={styles.pickedFileSize}>
                      {formatBytes(pickedFile.size)} • Tap to change
                    </Text>
                  </View>
                ) : (
                  <View style={{ alignItems: 'center', gap: 6 }}>
                    <Upload size={32} color="#2563EB" />
                    <Text style={styles.pickerPromptTitle}>Select PDF from Device Storage</Text>
                    <Text style={styles.pickerPromptSub}>
                      Handwritten notes, NCERT solutions or question bank
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              <Text style={styles.inputLabel}>Document Title (English) *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Ch 01: Chemical Reactions Master Notes"
                value={noteForm.title}
                onChangeText={(text) => setNoteForm((prev) => ({ ...prev, title: text }))}
              />

              <Text style={styles.inputLabel}>Title (Hindi)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. पाठ 01: रासायनिक अभिक्रियाएं हस्तलिखित नोट्स"
                value={noteForm.title_hi}
                onChangeText={(text) => setNoteForm((prev) => ({ ...prev, title_hi: text }))}
              />

              <View style={styles.formRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Class</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Class 10"
                    value={noteForm.class_name}
                    onChangeText={(text) => setNoteForm((prev) => ({ ...prev, class_name: text }))}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Subject</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Science"
                    value={noteForm.subject_name}
                    onChangeText={(text) =>
                      setNoteForm((prev) => ({ ...prev, subject_name: text }))
                    }
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Chapter Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Chapter 1: Chemical Reactions & Equations"
                value={noteForm.chapter_name}
                onChangeText={(text) =>
                  setNoteForm((prev) => ({ ...prev, chapter_name: text }))
                }
              />

              <Text style={styles.inputLabel}>Material Type</Text>
              <View style={styles.typeRow}>
                {[
                  { id: 'chapter_notes' as MaterialType, label: 'Chapter Notes' },
                  { id: 'formula_sheet' as MaterialType, label: 'Formula Sheet' },
                  { id: 'pyq' as MaterialType, label: 'PYQ Solutions' },
                  { id: 'revision_notes' as MaterialType, label: 'Revision' },
                ].map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.typeChip,
                      noteForm.material_type === type.id && styles.typeChipActive,
                    ]}
                    onPress={() =>
                      setNoteForm((prev) => ({ ...prev, material_type: type.id }))
                    }
                  >
                    <Text
                      style={[
                        styles.typeChipText,
                        noteForm.material_type === type.id && styles.typeChipTextActive,
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.freeToggleRow}>
                <TouchableOpacity
                  style={[styles.toggleBtn, noteForm.is_free && styles.toggleBtnActive]}
                  onPress={() => setNoteForm((p) => ({ ...p, is_free: true }))}
                >
                  <Text
                    style={[styles.toggleBtnText, noteForm.is_free && styles.toggleBtnTextActive]}
                  >
                    Free Access For All Students
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.toggleBtn, !noteForm.is_free && styles.toggleBtnActive]}
                  onPress={() => setNoteForm((p) => ({ ...p, is_free: false }))}
                >
                  <Text
                    style={[
                      styles.toggleBtnText,
                      !noteForm.is_free && styles.toggleBtnTextActive,
                    ]}
                  >
                    Enrolled Students Only
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setIsUploadModalOpen(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleUploadNote}>
                <Text style={styles.saveBtnText}>Save to PDF Library</Text>
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
  adminBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  adminBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  adminBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#92400E',
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  uploadBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subjectBar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  subjectScroll: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  subjectChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  subjectChipActive: {
    backgroundColor: '#2563EB',
  },
  subjectChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  subjectChipTextActive: {
    color: '#FFFFFF',
  },
  scroll: {
    padding: 16,
    paddingBottom: 30,
  },
  notesList: {
    gap: 12,
  },
  noteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  noteIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noteHeaderMeta: {
    flex: 1,
  },
  noteTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  noteType: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2563EB',
  },
  fileSize: {
    fontSize: 10,
    color: '#94A3B8',
  },
  offlinePill: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  offlinePillText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#059669',
  },
  freePill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  freePillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#166534',
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  noteDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
    marginBottom: 10,
  },
  actionButtonGroup: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  readBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  readBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  downloadBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  downloadBtnText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '700',
  },
  downloadedBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDF4',
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  downloadedBtnText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '700',
  },
  deleteNoteBtn: {
    padding: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalBody: {
    padding: 16,
  },
  filePickerBox: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    marginBottom: 10,
  },
  filePickerBoxSelected: {
    borderColor: '#059669',
    backgroundColor: '#F0FDF4',
  },
  pickerPromptTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
  pickerPromptSub: {
    fontSize: 11,
    color: '#64748B',
  },
  pickedFileName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#065F46',
  },
  pickedFileSize: {
    fontSize: 11,
    color: '#047857',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 4,
    marginTop: 8,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#0F172A',
  },
  formRow: {
    flexDirection: 'row',
    gap: 10,
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  typeChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
  },
  typeChipActive: {
    backgroundColor: '#2563EB',
  },
  typeChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  typeChipTextActive: {
    color: '#FFFFFF',
  },
  freeToggleRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    alignItems: 'center',
  },
  toggleBtnActive: {
    backgroundColor: '#2563EB',
  },
  toggleBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  toggleBtnTextActive: {
    color: '#FFFFFF',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  saveBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#2563EB',
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
