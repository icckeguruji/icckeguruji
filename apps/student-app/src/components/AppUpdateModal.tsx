import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Platform,
  ScrollView,
} from 'react-native';
import {
  Sparkles,
  ArrowDownCircle,
  CheckCircle2,
  X,
  Smartphone,
  ShieldCheck,
  BellRing,
} from 'lucide-react-native';
import { useAppUpdateStore, CURRENT_APP_VERSION } from '../services/appUpdateService';

const { width } = Dimensions.get('window');

export function AppUpdateModal() {
  const {
    hasUpdate,
    latestVersion,
    titleHi,
    changelogHi,
    changelogEn,
    isMandatory,
    isDownloading,
    downloadProgress,
    downloadedBytes,
    totalBytes,
    isReadyToInstall,
    dismissed,
    checkForUpdate,
    startDownloadAndInstall,
    installDownloadedApk,
    dismissUpdateBanner,
  } = useAppUpdateStore();

  const [activeLangTab, setActiveLangTab] = useState<'hi' | 'en'>('hi');

  useEffect(() => {
    // Automatically check for update on app mount
    checkForUpdate();
  }, []);

  if (!hasUpdate || dismissed) {
    return null;
  }

  const downloadedMB = (downloadedBytes / 1024 / 1024).toFixed(1);
  const totalMB = (totalBytes / 1024 / 1024).toFixed(1);

  const displayList = activeLangTab === 'hi' ? changelogHi : changelogEn;

  return (
    <Modal visible={true} transparent={true} animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Header Gradient Badge */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <ArrowDownCircle size={26} color="#2563EB" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.badgeRow}>
                <View style={styles.newBadge}>
                  <Sparkles size={11} color="#B45309" />
                  <Text style={styles.newBadgeText}>NEW APP UPDATE</Text>
                </View>
                <Text style={styles.versionText}>v{latestVersion}</Text>
              </View>
              <Text style={styles.title}>IDEAL COACHING CENTRE</Text>
              <Text style={styles.subTitle}>
                Current: v{CURRENT_APP_VERSION} → New: v{latestVersion}
              </Text>
            </View>

            {!isDownloading && !isMandatory && (
              <TouchableOpacity onPress={dismissUpdateBanner} style={styles.closeBtn}>
                <X size={18} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          {/* Hindi Title Banner */}
          <View style={styles.titleBanner}>
            <Text style={styles.titleBannerText}>
              {titleHi || 'नया आधिकारिक अपडेट उपलब्ध है'}
            </Text>
          </View>

          {/* Language Switch for Changelog */}
          <View style={styles.langToggleRow}>
            <Text style={styles.notesHeading}>📋 What&apos;s New / बदलाव:</Text>
            <View style={styles.langButtons}>
              <TouchableOpacity
                onPress={() => setActiveLangTab('hi')}
                style={[styles.langBtn, activeLangTab === 'hi' && styles.langBtnActive]}
              >
                <Text style={[styles.langBtnText, activeLangTab === 'hi' && styles.langBtnTextActive]}>
                  हिंदी
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setActiveLangTab('en')}
                style={[styles.langBtn, activeLangTab === 'en' && styles.langBtnActive]}
              >
                <Text style={[styles.langBtnText, activeLangTab === 'en' && styles.langBtnTextActive]}>
                  English
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Release Highlights / Changelog List */}
          <View style={styles.notesBox}>
            <ScrollView style={{ maxHeight: 150 }} showsVerticalScrollIndicator={true}>
              {displayList && displayList.length > 0 ? (
                displayList.map((item, idx) => (
                  <View key={idx} style={styles.changelogItem}>
                    <CheckCircle2 size={13} color="#10B981" style={{ marginTop: 2, flexShrink: 0 }} />
                    <Text style={styles.changelogItemText}>{item}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.notesText}>
                  Optimized video streaming, real-time counters, and fast offline notes cache.
                </Text>
              )}
            </ScrollView>
          </View>

          {/* Download Progress State */}
          {isDownloading ? (
            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Downloading in background...</Text>
                <Text style={styles.progressPercent}>{downloadProgress}%</Text>
              </View>

              {/* Progress Bar Track */}
              <View style={styles.progressBarTrack}>
                <View style={[styles.progressBarFill, { width: `${downloadProgress}%` }]} />
              </View>

              <View style={styles.progressMeta}>
                <Text style={styles.metaBytes}>
                  {downloadedMB} MB / {totalMB} MB
                </Text>
                <View style={styles.notifBadge}>
                  <BellRing size={11} color="#059669" />
                  <Text style={styles.metaStatus}>Notification bar progress live</Text>
                </View>
              </View>
            </View>
          ) : isReadyToInstall ? (
            /* Ready to Install State */
            <View style={styles.readyContainer}>
              <View style={styles.readyRow}>
                <CheckCircle2 size={18} color="#10B981" />
                <Text style={styles.readyText}>Download Complete! Auto-installing...</Text>
              </View>
              <TouchableOpacity
                style={styles.installBtn}
                onPress={installDownloadedApk}
                activeOpacity={0.8}
              >
                <Smartphone size={16} color="#FFFFFF" />
                <Text style={styles.installBtnText}>Tap to Install APK (अभी इंस्टॉल करें)</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Action Buttons (Download Now / Later) */
            <View style={styles.actionsRow}>
              {!isMandatory && (
                <TouchableOpacity
                  style={styles.laterBtn}
                  onPress={dismissUpdateBanner}
                  activeOpacity={0.7}
                >
                  <Text style={styles.laterBtnText}>Later (बाद में)</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.updateBtn, isMandatory && { flex: 1 }]}
                onPress={startDownloadAndInstall}
                activeOpacity={0.8}
              >
                <ArrowDownCircle size={16} color="#FFFFFF" />
                <Text style={styles.updateBtnText}>Update Now (अभी अपडेट करें)</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.footerNoteRow}>
            <ShieldCheck size={12} color="#64748B" />
            <Text style={styles.footerNote}>
              Direct verified download • Background auto-download & auto-install
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: Math.min(width - 32, 420),
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  newBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  newBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#B45309',
    letterSpacing: 0.4,
  },
  versionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  subTitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignSelf: 'flex-start',
  },
  titleBanner: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#2563EB',
  },
  titleBannerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E40AF',
  },
  langToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  notesHeading: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E293B',
  },
  langButtons: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    padding: 2,
  },
  langBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  langBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  langBtnText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  langBtnTextActive: {
    color: '#2563EB',
    fontWeight: '800',
  },
  notesBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  changelogItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 6,
  },
  changelogItemText: {
    fontSize: 11,
    color: '#334155',
    lineHeight: 16,
    flex: 1,
  },
  notesText: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 16,
  },
  progressContainer: {
    marginTop: 14,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2563EB',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 4,
  },
  progressMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  metaBytes: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  notifBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaStatus: {
    fontSize: 10,
    color: '#059669',
    fontWeight: '600',
  },
  readyContainer: {
    marginTop: 14,
    gap: 8,
  },
  readyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    justifyContent: 'center',
  },
  readyText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
  },
  installBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  installBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
  },
  laterBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  laterBtnText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
  },
  updateBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    paddingVertical: 11,
    borderRadius: 12,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  updateBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  footerNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 12,
  },
  footerNote: {
    fontSize: 10,
    color: '#94A3B8',
    textAlign: 'center',
  },
});
