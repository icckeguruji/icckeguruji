import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import {
  Sparkles,
  ArrowDownCircle,
  CheckCircle2,
  X,
  AlertCircle,
  Smartphone,
  RefreshCw,
} from 'lucide-react-native';
import { useAppUpdateStore, CURRENT_APP_VERSION } from '../services/appUpdateService';

const { width } = Dimensions.get('window');

export function AppUpdateModal() {
  const {
    hasUpdate,
    latestVersion,
    releaseNotes,
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

  useEffect(() => {
    // Automatically check for update on app mount
    checkForUpdate();
  }, []);

  if (!hasUpdate || dismissed) {
    return null;
  }

  const downloadedMB = (downloadedBytes / 1024 / 1024).toFixed(1);
  const totalMB = (totalBytes / 1024 / 1024).toFixed(1);

  return (
    <Modal visible={true} transparent={true} animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Header Gradient Badge */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <ArrowDownCircle size={28} color="#2563EB" />
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

            {!isDownloading && (
              <TouchableOpacity onPress={dismissUpdateBanner} style={styles.closeBtn}>
                <X size={18} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          {/* Release Highlights / Notes */}
          <View style={styles.notesBox}>
            <Text style={styles.notesHeading}>📋 What&apos;s New in this Update:</Text>
            <Text style={styles.notesText} numberOfLines={4}>
              {releaseNotes || 'Optimized performance, reduced app size, mobile admin console, and offline notes vault.'}
            </Text>
          </View>

          {/* Download Progress State */}
          {isDownloading ? (
            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Downloading APK Update...</Text>
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
                <Text style={styles.metaStatus}>Visible in Notification Bar</Text>
              </View>
            </View>
          ) : isReadyToInstall ? (
            /* Ready to Install State */
            <View style={styles.readyContainer}>
              <View style={styles.readyRow}>
                <CheckCircle2 size={20} color="#10B981" />
                <Text style={styles.readyText}>Download Complete! Ready to install.</Text>
              </View>
              <TouchableOpacity
                style={styles.installBtn}
                onPress={installDownloadedApk}
                activeOpacity={0.8}
              >
                <Smartphone size={16} color="#FFFFFF" />
                <Text style={styles.installBtnText}>Tap to Install APK</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Action Buttons (Download Now / Later) */
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.laterBtn}
                onPress={dismissUpdateBanner}
                activeOpacity={0.7}
              >
                <Text style={styles.laterBtnText}>Later</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.updateBtn}
                onPress={startDownloadAndInstall}
                activeOpacity={0.8}
              >
                <ArrowDownCircle size={16} color="#FFFFFF" />
                <Text style={styles.updateBtnText}>Update Now</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.footerNote}>
            Direct zero-cost update • Auto-install package archive
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: Math.min(width - 32, 420),
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
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
    width: 48,
    height: 48,
    borderRadius: 24,
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
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  newBadgeText: {
    fontSize: 10,
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
    fontSize: 15,
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
  notesBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  notesHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
  progressContainer: {
    marginTop: 16,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E40AF',
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2563EB',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#DBEAFE',
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
    marginTop: 8,
  },
  metaBytes: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  metaStatus: {
    fontSize: 10,
    color: '#059669',
    fontWeight: '700',
  },
  readyContainer: {
    marginTop: 16,
  },
  readyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    justifyContent: 'center',
  },
  readyText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
  },
  installBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#059669',
    paddingVertical: 12,
    borderRadius: 10,
  },
  installBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  laterBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  laterBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  updateBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 10,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  updateBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  footerNote: {
    fontSize: 10,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 12,
  },
});
