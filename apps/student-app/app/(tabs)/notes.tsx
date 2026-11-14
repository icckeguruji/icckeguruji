import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  BookOpen,
  ShieldCheck,
  Eye,
  Sparkles,
  Download,
  CheckCircle2,
  Trash2,
  HardDriveDownload,
} from 'lucide-react-native';
import { formatBytes } from '@icc/shared-utils';
import { initialStudyMaterials } from '../../../admin-web/src/lib/sample-data';
import { CoachingHeader } from '../../src/components/CoachingHeader';
import { DataService } from '../../src/services/dataService';
import {
  OfflineStorageService,
  OfflineItem,
} from '../../src/services/offlineStorage';
import { StudyMaterial } from '@icc/shared-types';

export default function StudentNotesScreen() {
  const router = useRouter();

  const [materials, setMaterials] = useState<StudyMaterial[]>(initialStudyMaterials);
  const [offlineItems, setOfflineItems] = useState<OfflineItem[]>([]);
  const [downloadedIds, setDownloadedIds] = useState<string[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeSubject, setActiveSubject] = useState('all');

  const loadOfflineVault = async () => {
    const items = await OfflineStorageService.getDownloadedItems();
    setOfflineItems(items);
    setDownloadedIds(items.map((i) => i.id));
  };

  const loadMaterials = useCallback(async () => {
    setIsSyncing(true);
    try {
      const data = await DataService.fetchStudyMaterials();
      setMaterials(data);
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
    Alert.alert(
      'Remove from Device?',
      `Delete "${title}" from offline storage?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await OfflineStorageService.removeOfflineItem(id);
            await loadOfflineVault();
          },
        },
      ]
    );
  };

  const filteredMaterials = materials.filter((mat) => {
    if (activeSubject === 'offline') return downloadedIds.includes(mat.id);
    if (activeSubject === 'all') return true;
    const titleLower = (mat.title || '').toLowerCase();
    const descLower = (mat.description || '').toLowerCase();
    if (activeSubject === 'sci')
      return titleLower.includes('sci') || titleLower.includes('chem') || descLower.includes('sci');
    if (activeSubject === 'math')
      return titleLower.includes('math') || descLower.includes('math') || titleLower.includes('geom');
    if (activeSubject === 'sst')
      return titleLower.includes('sst') || titleLower.includes('hist') || descLower.includes('social');
    return true;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Branded Coaching Header with Logo, Name & Live Sync */}
      <CoachingHeader onRefresh={loadMaterials} isSyncing={isSyncing} />

      {/* Screen Title & Subheading */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Study Notes & Materials</Text>
            <Text style={styles.headerSub}>
              Curated topper notes, formula cheat sheets & solutions
            </Text>
          </View>
        </View>

        {/* Anti-Piracy Security & Offline Banner */}
        <View style={styles.drmBanner}>
          <ShieldCheck size={16} color="#059669" />
          <Text style={styles.drmBannerText}>
            Encrypted In-App Viewer • Offline Study Available • Screenshots Disabled
          </Text>
        </View>
      </View>

      {/* Subject Filter Bar with Offline Tab */}
      <View style={styles.subjectBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subjectScroll}>
          {[
            { id: 'all', label: 'All Subjects' },
            { id: 'offline', label: `💾 Saved Offline (${downloadedIds.length})` },
            { id: 'sci', label: 'Science' },
            { id: 'math', label: 'Mathematics' },
            { id: 'sst', label: 'Social Science' },
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
                    </View>
                    <Text style={styles.noteTitle} numberOfLines={2}>
                      {mat.title}
                    </Text>
                  </View>
                </View>

                <Text style={styles.noteDesc} numberOfLines={2}>
                  {mat.description}
                </Text>

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
                </View>
              </View>
            );
          })}
        </View>

        {filteredMaterials.length === 0 && (
          <View style={styles.emptyState}>
            <Sparkles size={32} color="#94A3B8" />
            <Text style={styles.emptyText}>
              {activeSubject === 'offline'
                ? 'No notes saved offline yet. Tap "Save Offline" on any note to study without internet!'
                : 'No materials found for this subject.'}
            </Text>
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
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  headerRow: {
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  drmBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  drmBannerText: {
    fontSize: 11,
    color: '#047857',
    fontWeight: '700',
    flex: 1,
  },
  subjectBar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 8,
  },
  subjectScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  subjectChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  subjectChipActive: {
    backgroundColor: '#1E3A8A',
  },
  subjectChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  subjectChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
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
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  noteIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  noteHeaderMeta: {
    flex: 1,
  },
  noteTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  noteType: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2563EB',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    letterSpacing: 0.5,
  },
  fileSize: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  offlinePill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  offlinePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#166534',
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 20,
  },
  noteDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 14,
  },
  actionButtonGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  readBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    paddingVertical: 9,
    borderRadius: 8,
  },
  readBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
  },
  downloadBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  downloadedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
  },
  downloadedBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 280,
  },
});
