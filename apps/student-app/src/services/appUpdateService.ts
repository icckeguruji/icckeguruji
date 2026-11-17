import { Platform, Linking, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const CURRENT_APP_VERSION = Constants.expoConfig?.version || '1.0.0';
export const CURRENT_VERSION_CODE = Constants.expoConfig?.android?.versionCode || 1;

const GITHUB_LATEST_RELEASE_URL = 'https://api.github.com/repos/icckeguruji/icckeguruji/releases/latest';
const DEFAULT_APK_FALLBACK_URL = 'https://github.com/icckeguruji/icckeguruji/releases/latest/download/ideal-coaching-release.apk';
const CDN_MIRROR_PREFIX = 'https://ghproxy.net/';

export interface UpdateInfo {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion: string;
  releaseNotes: string;
  apkUrl: string;
  fileSizeBytes: number;
  publishedAt: string;
}

interface AppUpdateState {
  hasUpdate: boolean;
  latestVersion: string;
  releaseNotes: string;
  apkUrl: string;
  fileSizeBytes: number;
  isChecking: boolean;
  isDownloading: boolean;
  downloadProgress: number; // 0 to 100
  downloadedBytes: number;
  totalBytes: number;
  downloadedFilePath: string | null;
  isReadyToInstall: boolean;
  error: string | null;
  dismissed: boolean;
  checkForUpdate: () => Promise<UpdateInfo>;
  startDownloadAndInstall: () => Promise<void>;
  installDownloadedApk: () => Promise<void>;
  dismissUpdateBanner: () => void;
}

// Compare semantic version numbers (e.g. "1.0.1" > "1.0.0")
function isNewerVersion(latest: string, current: string): boolean {
  const cleanLatest = latest.replace(/^v/i, '').trim();
  const cleanCurrent = current.replace(/^v/i, '').trim();
  if (cleanLatest === cleanCurrent) return false;

  const latestParts = cleanLatest.split('.').map((p) => parseInt(p, 10) || 0);
  const currentParts = cleanCurrent.split('.').map((p) => parseInt(p, 10) || 0);

  const length = Math.max(latestParts.length, currentParts.length);
  for (let i = 0; i < length; i++) {
    const l = latestParts[i] || 0;
    const c = currentParts[i] || 0;
    if (l > c) return true;
    if (l < c) return false;
  }
  return false;
}

export const useAppUpdateStore = create<AppUpdateState>((set, get) => ({
  hasUpdate: false,
  latestVersion: CURRENT_APP_VERSION,
  releaseNotes: '',
  apkUrl: DEFAULT_APK_FALLBACK_URL,
  fileSizeBytes: 0,
  isChecking: false,
  isDownloading: false,
  downloadProgress: 0,
  downloadedBytes: 0,
  totalBytes: 0,
  downloadedFilePath: null,
  isReadyToInstall: false,
  error: null,
  dismissed: false,

  checkForUpdate: async (): Promise<UpdateInfo> => {
    set({ isChecking: true, error: null });

    let latestVersion = CURRENT_APP_VERSION;
    let apkUrl = DEFAULT_APK_FALLBACK_URL;
    let releaseNotes = '';
    let fileSizeBytes = 0;
    let publishedAt = new Date().toISOString();

    try {
      // 1. Check GitHub Releases API
      const response = await fetch(GITHUB_LATEST_RELEASE_URL, {
        headers: { Accept: 'application/vnd.github.v3+json' },
      });

      if (response.ok) {
        const release = await response.json();
        latestVersion = (release.tag_name || '1.0.0').replace(/^v/i, '');
        releaseNotes = release.body || 'New features, performance enhancements, and bug fixes.';
        publishedAt = release.published_at || publishedAt;

        // Find APK asset in release
        if (Array.isArray(release.assets)) {
          const apkAsset = release.assets.find(
            (a: any) => a.name?.endsWith('.apk') || a.content_type === 'application/vnd.android.package-archive'
          );
          if (apkAsset && apkAsset.browser_download_url) {
            apkUrl = apkAsset.browser_download_url;
            fileSizeBytes = apkAsset.size || 0;
          }
        }
      }
    } catch (err) {
      console.log('GitHub Release check error:', err);
    }

    // 2. Check Supabase app_versions if configured
    if (isSupabaseConfigured) {
      try {
        const { data: remoteData } = await supabase
          .from('app_versions')
          .select('*')
          .order('version_code', { ascending: false })
          .limit(1)
          .single();

        if (remoteData && remoteData.version_name) {
          if (isNewerVersion(remoteData.version_name, latestVersion)) {
            latestVersion = remoteData.version_name;
            apkUrl = remoteData.download_url || apkUrl;
            releaseNotes = remoteData.release_notes || releaseNotes;
          }
        }
      } catch {}
    }

    const hasUpdate = isNewerVersion(latestVersion, CURRENT_APP_VERSION);

    set({
      hasUpdate,
      latestVersion,
      releaseNotes,
      apkUrl,
      fileSizeBytes,
      isChecking: false,
    });

    // If a new update is found, trigger a notification in the notification bar
    if (hasUpdate && Platform.OS === 'android') {
      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '🚀 IDEAL COACHING CENTRE App Update Available!',
            body: `New Version ${latestVersion} is ready to download. Tap to update and get latest notes & video features.`,
            data: { type: 'app_update', version: latestVersion, url: apkUrl },
            sound: true,
            priority: Notifications.AndroidNotificationPriority.HIGH,
          },
          trigger: null,
        });
      } catch {}
    }

    return {
      hasUpdate,
      currentVersion: CURRENT_APP_VERSION,
      latestVersion,
      releaseNotes,
      apkUrl,
      fileSizeBytes,
      publishedAt,
    };
  },

  startDownloadAndInstall: async () => {
    const { apkUrl, latestVersion } = get();

    if (!apkUrl) {
      Alert.alert('Download Error', 'APK download URL could not be resolved.');
      return;
    }

    if (Platform.OS !== 'android') {
      Linking.openURL(apkUrl);
      return;
    }

    set({ isDownloading: true, downloadProgress: 0, error: null, isReadyToInstall: false });

    // Target local path on device cache
    const targetFile = `${FileSystem.documentDirectory}ideal-coaching-v${latestVersion}.apk`;

    try {
      // Create resumable download with live progress callback and optimized headers
      let lastNotifPercent = -1;
      let startTime = Date.now();
      let lastBytes = 0;
      let lastTime = startTime;
      let downloadSpeedMBps = '0.0';

      const downloadResumable = FileSystem.createDownloadResumable(
        apkUrl,
        targetFile,
        {
          headers: {
            'Accept-Encoding': 'identity',
            'User-Agent': 'ICC-Android-App-Updater/1.0.1',
          },
          cache: false,
        },
        async (progress) => {
          const total = progress.totalBytesExpectedToWrite || 22000000;
          const written = progress.totalBytesWritten;
          const percent = Math.min(100, Math.round((written / total) * 100));

          const now = Date.now();
          const timeDelta = (now - lastTime) / 1000;
          if (timeDelta >= 1) {
            const bytesDelta = written - lastBytes;
            downloadSpeedMBps = (bytesDelta / timeDelta / (1024 * 1024)).toFixed(1);
            lastTime = now;
            lastBytes = written;
          }

          set({
            downloadProgress: percent,
            downloadedBytes: written,
            totalBytes: total,
          });

          // Update Android notification bar progress every 15%
          if (percent - lastNotifPercent >= 15 || percent === 100) {
            lastNotifPercent = percent;
            try {
              await Notifications.scheduleNotificationAsync({
                content: {
                  title: `📲 Downloading ICC Update (${percent}%) • ${downloadSpeedMBps} MB/s`,
                  body: `${(written / 1024 / 1024).toFixed(1)} MB of ${(total / 1024 / 1024).toFixed(1)} MB downloaded`,
                  sticky: percent < 100,
                  sound: false,
                },
                trigger: null,
              });
            } catch {}
          }
        }
      );

      const result = await downloadResumable.downloadAsync();

      if (result && result.uri) {
        set({
          isDownloading: false,
          downloadProgress: 100,
          downloadedFilePath: result.uri,
          isReadyToInstall: true,
        });

        // Notify user in notification bar
        try {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: '✅ Download Complete!',
              body: 'IDEAL COACHING CENTRE update downloaded. Tap to install now.',
              sound: true,
              data: { type: 'install_apk', fileUri: result.uri },
            },
            trigger: null,
          });
        } catch {}

        // Launch Automatic Package Installer
        await get().installDownloadedApk();
      } else {
        throw new Error('Download did not return file URI');
      }
    } catch (primaryErr: any) {
      console.warn('Primary download attempt error, attempting CDN mirror fallback:', primaryErr);

      try {
        const mirrorUrl = `${CDN_MIRROR_PREFIX}${apkUrl}`;
        const mirrorResumable = FileSystem.createDownloadResumable(
          mirrorUrl,
          targetFile,
          {
            headers: { 'Accept-Encoding': 'identity' },
            cache: false,
          }
        );
        const mirrorResult = await mirrorResumable.downloadAsync();
        if (mirrorResult && mirrorResult.uri) {
          set({
            isDownloading: false,
            downloadProgress: 100,
            downloadedFilePath: mirrorResult.uri,
            isReadyToInstall: true,
          });
          await get().installDownloadedApk();
          return;
        }
      } catch (mirrorErr) {
        console.warn('CDN mirror download error:', mirrorErr);
      }

      set({
        isDownloading: false,
        error: primaryErr?.message || 'Failed to download update APK',
      });

      // Fallback: Open in Android browser or Download Manager
      Alert.alert(
        'Direct Download Fallback',
        'Would you like to open the download link in your device browser/Download Manager?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Download in Browser',
            onPress: () => Linking.openURL(apkUrl),
          },
        ]
      );
    }
  },

  installDownloadedApk: async () => {
    const { downloadedFilePath, apkUrl } = get();

    if (!downloadedFilePath) {
      if (apkUrl) {
        Linking.openURL(apkUrl);
      }
      return;
    }

    try {
      // Resolve content URI through Android FileProvider
      const contentUri = await FileSystem.getContentUriAsync(downloadedFilePath);

      // Launch native Android Intent for package installation
      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
        data: contentUri,
        flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
        type: 'application/vnd.android.package-archive',
      });
    } catch (err) {
      console.warn('IntentLauncher package install notice:', err);
      // Fallback: If FileProvider or IntentLauncher has permission restriction, fallback to browser download
      Alert.alert(
        'Install Update',
        'Download finished! Please tap below to confirm installation in Android Package Installer.',
        [
          {
            text: 'Install Now',
            onPress: async () => {
              try {
                const cUri = await FileSystem.getContentUriAsync(downloadedFilePath);
                await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
                  data: cUri,
                  flags: 1,
                  type: 'application/vnd.android.package-archive',
                });
              } catch {
                Linking.openURL(apkUrl);
              }
            },
          },
        ]
      );
    }
  },

  dismissUpdateBanner: () => {
    set({ dismissed: true });
  },
}));
