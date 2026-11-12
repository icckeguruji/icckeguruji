import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useAuthStore } from '../../src/store/useAuthStore';
import { translations, formatBytes } from '@icc/shared-utils';
import { initialStudyMaterials } from '../../../admin-web/src/lib/sample-data';
import { LocalDbService } from '../../src/store/useLocalDb';

export default function StudentNotesScreen() {
  const { language, selectedBoard } = useAuthStore();
  const t = translations[language];

  const [activeSubject, setActiveSubject] = useState('all');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownloadOffline = async (item: any) => {
    setDownloadingId(item.id);
    setTimeout(async () => {
      await LocalDbService.saveDownloadedPdf({
        id: item.id,
        title: item.title,
        title_hi: item.title_hi,
        local_uri: `file:///storage/emulated/0/ICC/${item.file_path}`,
        file_size_bytes: item.file_size_bytes,
        material_type: item.material_type,
        board_code: selectedBoard,
        class_name: 'Class 10',
      });
      setDownloadingId(null);
      Alert.alert(
        language === 'hi' ? 'सफलता' : 'Success',
        language === 'hi'
          ? 'पीडीएफ ऑफ़लाइन पढ़ने के लिए सुरक्षित कर लिया गया है।'
          : 'PDF cached for offline reading.'
      );
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.notes}</Text>
        <Text style={styles.headerSub}>
          {language === 'hi'
            ? 'आपके कोर्स के आधार पर स्वतः आवंटित अध्ययन सामग्री'
            : 'Auto-assigned study materials & topper notes'}
        </Text>
      </View>

      {/* Subject Filter Bar */}
      <View style={styles.subjectBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subjectScroll}>
          {[
            { id: 'all', label: language === 'hi' ? 'सभी विषय' : 'All Subjects' },
            { id: 'sci', label: language === 'hi' ? 'विज्ञान (Science)' : 'Science' },
            { id: 'math', label: language === 'hi' ? 'गणित (Math)' : 'Mathematics' },
            { id: 'sst', label: language === 'hi' ? 'सामाजिक विज्ञान' : 'Social Science' },
          ].map((sub) => (
            <TouchableOpacity
              key={sub.id}
              style={[styles.subjectChip, activeSubject === sub.id && styles.subjectChipActive]}
              onPress={() => setActiveSubject(sub.id)}
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

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.notesList}>
          {initialStudyMaterials.map((mat) => {
            const isDownloading = downloadingId === mat.id;
            return (
              <View key={mat.id} style={styles.noteCard}>
                <View style={styles.noteIconBox}>
                  <Text style={{ fontSize: 24 }}>📑</Text>
                </View>

                <View style={styles.noteContent}>
                  <View style={styles.noteTypeRow}>
                    <Text style={styles.noteType}>
                      {mat.material_type.toUpperCase().replace('_', ' ')}
                    </Text>
                    <Text style={styles.fileSize}>{formatBytes(mat.file_size_bytes)}</Text>
                  </View>

                  <Text style={styles.noteTitle}>
                    {language === 'hi' ? mat.title_hi || mat.title : mat.title}
                  </Text>
                  <Text style={styles.noteDesc} numberOfLines={2}>
                    {mat.description}
                  </Text>

                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                      style={styles.readBtn}
                      onPress={() =>
                        Alert.alert(
                          language === 'hi' ? 'पीडीएफ व्यूअर' : 'PDF Viewer',
                          language === 'hi'
                            ? `सुरक्षित हस्ताक्षरित टोकन द्वारा ${mat.title} खोला जा रहा है।`
                            : `Opening ${mat.title} via 15-minute signed URL.`
                        )
                      }
                    >
                      <Text style={styles.readBtnText}>{t.readOnline}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.downloadBtn}
                      onPress={() => handleDownloadOffline(mat)}
                      disabled={isDownloading}
                    >
                      <Text style={styles.downloadBtnText}>
                        {isDownloading ? 'Downloading...' : `⬇️ ${t.downloadPdf}`}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
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
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
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
    gap: 14,
  },
  noteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  noteIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteContent: {
    flex: 1,
  },
  noteTypeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 20,
  },
  noteDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  readBtn: {
    flex: 1,
    backgroundColor: '#EFF6FF',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  readBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  downloadBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  downloadBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
});
