import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BookOpen, ShieldCheck, Eye, Sparkles } from 'lucide-react-native';
import { formatBytes } from '@icc/shared-utils';
import { initialStudyMaterials } from '../../../admin-web/src/lib/sample-data';
import { CoachingHeader } from '../../src/components/CoachingHeader';
import { DataService } from '../../src/services/dataService';
import { StudyMaterial } from '@icc/shared-types';

export default function StudentNotesScreen() {
  const router = useRouter();

  const [materials, setMaterials] = useState<StudyMaterial[]>(initialStudyMaterials);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeSubject, setActiveSubject] = useState('all');

  const loadMaterials = useCallback(async () => {
    setIsSyncing(true);
    try {
      const data = await DataService.fetchStudyMaterials();
      setMaterials(data);
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

  const openDocument = (mat: StudyMaterial) => {
    router.push(`/pdf-viewer/${mat.id}`);
  };

  const filteredMaterials = materials.filter((mat) => {
    if (activeSubject === 'all') return true;
    const titleLower = (mat.title || '').toLowerCase();
    const descLower = (mat.description || '').toLowerCase();
    if (activeSubject === 'sci') return titleLower.includes('sci') || titleLower.includes('chem') || descLower.includes('sci');
    if (activeSubject === 'math') return titleLower.includes('math') || descLower.includes('math') || titleLower.includes('geom');
    if (activeSubject === 'sst') return titleLower.includes('sst') || titleLower.includes('hist') || descLower.includes('social');
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

        {/* Anti-Piracy Security Banner */}
        <View style={styles.drmBanner}>
          <ShieldCheck size={16} color="#059669" />
          <Text style={styles.drmBannerText}>
            Protected In-App Viewer • Downloads & Screenshots Disabled
          </Text>
        </View>
      </View>

      {/* Subject Filter Bar */}
      <View style={styles.subjectBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subjectScroll}>
          {[
            { id: 'all', label: 'All Subjects' },
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
          {filteredMaterials.map((mat) => (
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
                  </View>
                  <Text style={styles.noteTitle} numberOfLines={2}>
                    {mat.title}
                  </Text>
                </View>
              </View>

              <Text style={styles.noteDesc} numberOfLines={2}>
                {mat.description}
              </Text>

              {/* In-App Reader Only Action */}
              <TouchableOpacity
                style={styles.readBtn}
                onPress={() => openDocument(mat)}
                activeOpacity={0.8}
              >
                <Eye size={16} color="#FFFFFF" />
                <Text style={styles.readBtnText}>Read Inside App (Secure)</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {filteredMaterials.length === 0 && (
          <View style={styles.emptyState}>
            <Sparkles size={32} color="#94A3B8" />
            <Text style={styles.emptyText}>No materials found for this subject.</Text>
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
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  drmBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 10,
  },
  drmBannerText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#065F46',
  },
  subjectBar: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  subjectScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  subjectChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
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
    paddingBottom: 40,
  },
  notesList: {
    gap: 14,
  },
  noteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  noteIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteHeaderMeta: {
    flex: 1,
  },
  noteTypeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  },
  fileSize: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  noteTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 21,
  },
  noteDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 8,
    marginBottom: 14,
    lineHeight: 18,
  },
  readBtn: {
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 10,
  },
  readBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 10,
  },
  emptyText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
  },
});
