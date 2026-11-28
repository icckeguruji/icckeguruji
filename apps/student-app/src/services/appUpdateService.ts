import { Platform, Linking, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const CURRENT_APP_VERSION = Constants.expoConfig?.version || '1.0.2';
export const CURRENT_VERSION_CODE = Constants.expoConfig?.android?.versionCode || 3;

const GITHUB_LATEST_RELEASE_URL = 'https://api.github.com/repos/icckeguruji/icckeguruji/releases/latest';
const DEFAULT_APK_FALLBACK_URL = 'https://github.com/icckeguruji/icckeguruji/releases/download/v1.0.1/ideal-coaching-release.apk';
const CDN_MIRROR_PREFIX = 'https://ghproxy.net/';
const API_UPDATE_ENDPOINT = 'https://icconline.vercel.app/api/app-update';
const UPDATE_AVAIL_NOTIF_ID = 'icc-app-update-available';
const UPDATE_DOWNLOAD_NOTIF_ID = 'icc-app-update-download';
const UPDATE_PROGRESS_CHANNEL_ID = 'icc-app-update-progress';

export interface UpdateInfo {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion: string;
  versionCode: number;
  releaseNotes: string;
  titleHi: string;
  changelogEn: string[];
  changelogHi: string[];
  apkUrl: string;
  fileSizeBytes: number;
  isMandatory: boolean;
  publishedAt: string;
}

interface AppUpdateState {
  hasUpdate: boolean;
  latestVersion: string;
  versionCode: number;
  releaseNotes: string;
  titleHi: string;
  changelogEn: string[];
  changelogHi: string[];
  apkUrl: string;
  fileSizeBytes: number;
  isMandatory: boolean;
  isChecking: boolean;
  isDownloading: boolean;
  downloadProgress: number; // 0 to 100
  downloadedBytes: number;
  totalBytes: number;
  downloadedFilePath: string | null;
  isReadyToInstall: boolean;
  error: string | null;
  dismissed: boolean;
  checkForUpdate: (forceShow?: boolean) => Promise<UpdateInfo>;
  startDownloadAndInstall: () => Promise<void>;
  installDownloadedApk: () => Promise<void>;
  dismissUpdateBanner: () => void;
}

// Compare semantic version numbers (e.g. "1.0.2" > "1.0.1")
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

/**
 * Deletes any downloaded update APK files whose version is already installed (<= CURRENT_APP_VERSION).
 * Runs automatically on app launch and after update check so old APKs never clutter device storage.
 */
export async function cleanupOldApks(): Promise<void> {
  if (Platform.OS !== 'android') return;
  const dirs = [FileSystem.cacheDirectory, FileSystem.documentDirectory].filter(Boolean) as string[];
  for (const dir of dirs) {
    try {
      const files = await FileSystem.readDirectoryAsync(dir);
      for (const file of files) {
        if (!file.endsWith('.apk')) continue;
        const verMatch = file.match(/v(\d+\.\d+\.\d+)/i);
        const fileVer = verMatch ? verMatch[1] : null;
        if (!fileVer || !isNewerVersion(fileVer, CURRENT_APP_VERSION)) {
          await FileSystem.deleteAsync(`${dir}${file}`, { idempotent: true }).catch(() => {});
        }
      }
    } catch {}
  }
}

export const useAppUpdateStore = create<AppUpdateState>((set, get) => ({
  hasUpdate: false,
  latestVersion: CURRENT_APP_VERSION,
  versionCode: CURRENT_VERSION_CODE,
  releaseNotes: '',
  titleHi: 'नया अपडेट उपलब्ध है',
  changelogEn: [
    'Fixed Add Chapter & Subject button layout on all mobile screens',
    'Real-time Video and Handwritten Notes counters on Subject & Chapter cards',
    'Hindi Title option for Subjects, Disciplines, and Chapters',
    'Background auto-download with notification bar progress and auto-install',
    'AMOLED pure black theme optimizations for battery saving'
  ],
  changelogHi: [
    'मोबाइल स्क्रीन पर अध्याय एवं विषय जोड़ने वाले बटन का लेआउट ठीक किया गया',
    'विषय और अध्याय के बाहर वीडियो और हस्तलिखित नोट्स की वास्तविक संख्या',
    'विषय और अध्याय में हिंदी नाम (Title in Hindi) दर्ज करने की सुविधा',
    'बैकग्राउंड ऑटो-डाउनलोड, नोटिफिकेशन बार में प्रोग्रेस एवं स्वतः इंस्टॉलेशन',
    'AMOLED प्योर ब्लैक डार्क मोड और बैटरी बचत में सुधार'
  ],
  apkUrl: DEFAULT_APK_FALLBACK_URL,
  fileSizeBytes: 20.4 * 1024 * 1024,
  isMandatory: false,
  isChecking: false,
  isDownloading: false,
  downloadProgress: 0,
  downloadedBytes: 0,
  totalBytes: 0,
  downloadedFilePath: null,
  isReadyToInstall: false,
  error: null,
  dismissed: false,

  checkForUpdate: async (forceShow = false): Promise<UpdateInfo> => {
    set({ isChecking: true, error: null, ...(forceShow ? { dismissed: false } : {}) });

    let latestVersion = '1.0.2';
    let versionCode = 3;
    let apkUrl = DEFAULT_APK_FALLBACK_URL;
    let releaseNotes = '';
    let titleHi = 'नया आधिकारिक अपडेट उपलब्ध है (v1.0.2)';
    let changelogEn: string[] = [
      'Fixed Add Chapter & Subject button layout on all mobile screens',
      'Real-time Video and Handwritten Notes counters on Subject & Chapter cards',
      'Hindi Title option for Subjects, Disciplines, and Chapters',
      'Background auto-download with notification bar progress and auto-install',
      'AMOLED pure black theme optimizations for battery saving'
    ];
    let changelogHi: string[] = [
      'मोबाइल स्क्रीन पर अध्याय एवं विषय जोड़ने वाले बटन का लेआउट ठीक किया गया',
      'विषय और अध्याय के बाहर वीडियो और हस्तलिखित नोट्स की वास्तविक संख्या',
      'विषय और अध्याय में हिंदी नाम (Title in Hindi) दर्ज करने की सुविधा',
      'बैकग्राउंड ऑटो-डाउनलोड, नोटिफिकेशन बार में प्रोग्रेस एवं स्वतः इंस्टॉलेशन',
      'AMOLED प्योर ब्लैक डार्क मोड और बैटरी बचत में सुधार'
    ];
    let isMandatory = false;
    let fileSizeBytes = 20.4 * 1024 * 1024;
    let publishedAt = new Date().toISOString();

    // 1. Primary: Check authoritative backend API endpoint
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(API_UPDATE_ENDPOINT, {
        signal: controller.signal,
        headers: { 'Cache-Control': 'no-cache' },
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data && data.latest_version) {
          latestVersion = data.latest_version;
          versionCode = data.version_code || versionCode;
          apkUrl = data.apk_download_url || apkUrl;
          titleHi = data.title_hi || titleHi;
          if (Array.isArray(data.changelog_en) && data.changelog_en.length > 0) {
            changelogEn = data.changelog_en;
          }
          if (Array.isArray(data.changelog_hi) && data.changelog_hi.length > 0) {
            changelogHi = data.changelog_hi;
          }
          isMandatory = Boolean(data.is_mandatory);
          if (data.apk_size_mb) {
            fileSizeBytes = Math.round(data.apk_size_mb * 1024 * 1024);
          }
          publishedAt = data.release_date || publishedAt;
        }
      }
    } catch (e) {
      console.log('App update endpoint lookup note:', e);
    }

    // 2. Secondary: Check Supabase platform_settings ONLY if it has a higher version_code
    if (isSupabaseConfigured) {
      try {
        const { data: remoteData } = await supabase
          .from('platform_settings')
          .select('value')
          .eq('key', 'app_update_config')
          .maybeSingle();

        if (remoteData?.value && typeof remoteData.value === 'object') {
          const val = remoteData.value;
          const remoteCode = Number(val.version_code) || 0;
          if (
            val.latest_version &&
            (remoteCode > versionCode || isNewerVersion(val.latest_version, latestVersion))
          ) {
            latestVersion = val.latest_version;
            versionCode = remoteCode || versionCode;
            apkUrl = val.apk_download_url || apkUrl;
            titleHi = val.title_hi || titleHi;
            if (Array.isArray(val.changelog_en) && val.changelog_en.length > 0) changelogEn = val.changelog_en;
            if (Array.isArray(val.changelog_hi) && val.changelog_hi.length > 0) changelogHi = val.changelog_hi;
            isMandatory = Boolean(val.is_mandatory);
          }
        }
      } catch {}
    }

    // 3. Always cross-check GitHub Releases API in case a newer APK was just published
    try {
      const ghResponse = await fetch(GITHUB_LATEST_RELEASE_URL, {
        headers: { Accept: 'application/vnd.github.v3+json' },
      });
      if (ghResponse.ok) {
        const release = await ghResponse.json();
        const ghVer = (release.tag_name || '1.0.0').replace(/^v/i, '');
        const buildMatch = String(release.body || '').match(/Build\s+(\d+)/i);
        const ghCode = buildMatch ? parseInt(buildMatch[1], 10) : (parseInt(ghVer.split('.')[2] || '0', 10) + 1);
        if (ghCode > versionCode || isNewerVersion(ghVer, latestVersion)) {
          latestVersion = ghVer;
          versionCode = Math.max(versionCode, ghCode);
          titleHi = `नया आधिकारिक अपडेट उपलब्ध है (v${ghVer})`;
          releaseNotes = release.body || releaseNotes;
          publishedAt = release.published_at || publishedAt;
          if (Array.isArray(release.assets)) {
            const apkAsset = release.assets.find(
              (a: any) => a.name?.endsWith('.apk') || a.content_type === 'application/vnd.android.package-archive'
            );
            if (apkAsset?.browser_download_url) {
              apkUrl = apkAsset.browser_download_url;
              fileSizeBytes = apkAsset.size || fileSizeBytes;
            }
          }
        }
      }
    } catch {}

    const hasUpdate =
      versionCode > CURRENT_VERSION_CODE || isNewerVersion(latestVersion, CURRENT_APP_VERSION);

    if (!hasUpdate) {
      cleanupOldApks().catch(() => {});
    }

    set({
      hasUpdate,
      latestVersion,
      versionCode,
      releaseNotes,
      titleHi,
      changelogEn,
      changelogHi,
      apkUrl,
      fileSizeBytes,
      isMandatory,
      isChecking: false,
      ...(forceShow ? { dismissed: false } : {}),
    });

    // If update found, post high-priority alert in notification bar (single unified notification)
    if (hasUpdate && Platform.OS === 'android') {
      try {
        await Notifications.scheduleNotificationAsync({
          identifier: UPDATE_AVAIL_NOTIF_ID,
          content: {
            title: '🚀 IDEAL COACHING CENTRE App Update Available!',
            body: `New Version v${latestVersion} is ready to download. Tap to update with latest video & notes features.`,
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
      versionCode,
      releaseNotes,
      titleHi,
      changelogEn,
      changelogHi,
      apkUrl,
      fileSizeBytes,
      isMandatory,
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

    // Request notification permission & ensure silent progress channel on Android
    try {
      await Notifications.requestPermissionsAsync();
      await Notifications.setNotificationChannelAsync(UPDATE_PROGRESS_CHANNEL_ID, {
        name: 'App Update Download Progress',
        importance: Notifications.AndroidImportance.LOW,
        sound: null,
        enableVibrate: false,
        showBadge: false,
      });
    } catch {}

    set({ isDownloading: true, downloadProgress: 0, error: null, isReadyToInstall: false });

    // Target local path in cacheDirectory (always covered by Expo FileProvider for APK install)
    const targetFile = `${FileSystem.cacheDirectory || FileSystem.documentDirectory}icc-update-v${latestVersion}.apk`;

    // Remove old download file if exists
    try {
      const info = await FileSystem.getInfoAsync(targetFile);
      if (info.exists) {
        await FileSystem.deleteAsync(targetFile, { idempotent: true });
      }
    } catch {}

    let lastNotifTime = 0;
    let lastNotifPercent = -1;
    const startTime = Date.now();
    let lastBytes = 0;
    let lastTime = startTime;
    let downloadSpeedMBps = '0.0';

    const handleDownloadProgress = async (progress: FileSystem.DownloadProgressData) => {
      const total = progress.totalBytesExpectedToWrite || 21400000;
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

      // Update the SAME single Android notification in-place (every ~800ms or 5% step, no duplicate alerts)
      if ((percent !== lastNotifPercent && (now - lastNotifTime >= 800 || percent - lastNotifPercent >= 5)) || percent === 100) {
        lastNotifTime = now;
        lastNotifPercent = percent;
        try {
          await Notifications.scheduleNotificationAsync({
            identifier: UPDATE_DOWNLOAD_NOTIF_ID,
            content: {
              title: `📲 Downloading ICC v${latestVersion} (${percent}%) • ${downloadSpeedMBps} MB/s`,
              body: `${(written / 1024 / 1024).toFixed(1)} MB / ${(total / 1024 / 1024).toFixed(1)} MB`,
              sticky: percent < 100,
              sound: false,
              priority: Notifications.AndroidNotificationPriority.LOW,
            },
            trigger: { channelId: UPDATE_PROGRESS_CHANNEL_ID } as any,
          });
        } catch {}
      }
    };

    const notifyDownloadComplete = async (fileUri: string) => {
      try {
        await Notifications.scheduleNotificationAsync({
          identifier: UPDATE_DOWNLOAD_NOTIF_ID,
          content: {
            title: `✅ ICC v${latestVersion} Download Complete!`,
            body: 'Update downloaded. Tap to install now.',
            sticky: false,
            sound: true,
            priority: Notifications.AndroidNotificationPriority.HIGH,
            data: { type: 'install_apk', fileUri },
          },
          trigger: null,
        });
      } catch {}
    };

    const downloadCandidates = [
      apkUrl,
      'https://icconline.vercel.app/api/download-apk',
      `${CDN_MIRROR_PREFIX}${apkUrl}`,
    ].filter((u, idx, arr) => Boolean(u) && arr.indexOf(u) === idx);

    let lastErr: any = null;
    for (const candidateUrl of downloadCandidates) {
      try {
        lastNotifPercent = -1;
        lastBytes = 0;
        lastTime = Date.now();
        const downloadResumable = FileSystem.createDownloadResumable(
          candidateUrl,
          targetFile,
          { cache: false },
          handleDownloadProgress
        );
        const result = await downloadResumable.downloadAsync();
        if (result && result.uri) {
          const fileInfo = await FileSystem.getInfoAsync(result.uri);
          if (fileInfo.exists && (!('size' in fileInfo) || (fileInfo.size || 0) > 100000)) {
            set({
              isDownloading: false,
              downloadProgress: 100,
              downloadedFilePath: result.uri,
              isReadyToInstall: true,
            });
            await notifyDownloadComplete(result.uri);
            await get().installDownloadedApk();
            return;
          }
        }
      } catch (err: any) {
        lastErr = err;
      }
    }

    set({
      isDownloading: false,
      error: lastErr?.message || 'Failed to download update APK inside app.',
    });

    Alert.alert(
      'Download Failed',
      'Could not complete the in-app update download. Please check your internet connection and tap Retry.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Retry', onPress: () => get().startDownloadAndInstall() },
      ]
    );
  },

  installDownloadedApk: async () => {
    const { downloadedFilePath } = get();

    if (!downloadedFilePath) {
      await get().startDownloadAndInstall();
      return;
    }

    try {
      const contentUri = await FileSystem.getContentUriAsync(downloadedFilePath);
      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
        data: contentUri,
        flags: 268435457,
        type: 'application/vnd.android.package-archive',
      });
    } catch (err) {
      console.warn('IntentLauncher package install notice:', err);
      Alert.alert(
        'Install Update',
        'Download is complete! Tap "Install Now" below and allow "Install from this source" if prompted by Android.',
        [
          {
            text: 'Install Now',
            onPress: async () => {
              try {
                const cUri = await FileSystem.getContentUriAsync(downloadedFilePath);
                await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
                  data: cUri,
                  flags: 268435457,
                  type: 'application/vnd.android.package-archive',
                });
              } catch {
                Alert.alert('Install Permission Required', 'Please enable "Install unknown apps" for IDEAL COACHING CENTRE in Android Settings and tap Install again.');
              }
            },
          },
          { text: 'Later', style: 'cancel' },
        ]
      );
    }
  },

  dismissUpdateBanner: () => {
    set({ dismissed: true });
  },
}));
