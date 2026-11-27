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

    // 2. Secondary: Check Supabase platform_settings if configured
    if (isSupabaseConfigured) {
      try {
        const { data: remoteData } = await supabase
          .from('platform_settings')
          .select('value')
          .eq('key', 'app_update_config')
          .maybeSingle();

        if (remoteData?.value && typeof remoteData.value === 'object') {
          const val = remoteData.value;
          if (val.latest_version) {
            latestVersion = val.latest_version;
            versionCode = val.version_code || versionCode;
            apkUrl = val.apk_download_url || apkUrl;
            titleHi = val.title_hi || titleHi;
            if (Array.isArray(val.changelog_en)) changelogEn = val.changelog_en;
            if (Array.isArray(val.changelog_hi)) changelogHi = val.changelog_hi;
            isMandatory = Boolean(val.is_mandatory);
          }
        }
      } catch {}
    }

    // 3. Fallback: Check GitHub Releases API
    if (!latestVersion || latestVersion === CURRENT_APP_VERSION) {
      try {
        const ghResponse = await fetch(GITHUB_LATEST_RELEASE_URL, {
          headers: { Accept: 'application/vnd.github.v3+json' },
        });
        if (ghResponse.ok) {
          const release = await ghResponse.json();
          latestVersion = (release.tag_name || '1.0.0').replace(/^v/i, '');
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
      } catch {}
    }

    const hasUpdate =
      versionCode > CURRENT_VERSION_CODE || isNewerVersion(latestVersion, CURRENT_APP_VERSION);

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

    // If update found, post high-priority alert in notification bar
    if (hasUpdate && Platform.OS === 'android') {
      try {
        await Notifications.scheduleNotificationAsync({
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

    // Request notification permission on Android
    try {
      await Notifications.requestPermissionsAsync();
    } catch {}

    set({ isDownloading: true, downloadProgress: 0, error: null, isReadyToInstall: false });

    // Target local path on device
    const targetFile = `${FileSystem.documentDirectory || FileSystem.cacheDirectory}ideal-coaching-v${latestVersion}.apk`;

    // Remove old download file if exists
    try {
      const info = await FileSystem.getInfoAsync(targetFile);
      if (info.exists) {
        await FileSystem.deleteAsync(targetFile, { idempotent: true });
      }
    } catch {}

    try {
      let lastNotifPercent = -1;
      const startTime = Date.now();
      let lastBytes = 0;
      let lastTime = startTime;
      let downloadSpeedMBps = '0.0';

      const downloadResumable = FileSystem.createDownloadResumable(
        apkUrl,
        targetFile,
        {
          headers: {
            'Accept-Encoding': 'identity',
            'User-Agent': 'ICC-Android-App-Updater/1.0.2',
          },
          cache: false,
        },
        async (progress) => {
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

          // Update Android notification bar progress every 10%
          if (percent - lastNotifPercent >= 10 || percent === 100) {
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

        // Auto launch native Android Package Installer immediately
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
        'Would you like to open the direct download link in your mobile browser?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Download in Browser',
            onPress: () => Linking.openURL('https://icconline.vercel.app/api/download-apk'),
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
      // flags: FLAG_GRANT_READ_URI_PERMISSION (1) | FLAG_ACTIVITY_NEW_TASK (268435456) = 268435457
      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
        data: contentUri,
        flags: 268435457,
        type: 'application/vnd.android.package-archive',
      });
    } catch (err) {
      console.warn('IntentLauncher package install notice:', err);
      // Fallback
      Alert.alert(
        'Install Update / ऐप इंस्टॉल करें',
        'डाउनलोड पूरा हो चुका है! कृपया नीचे "Install Now" दबाकर ऐप को इंस्टॉल करें। (यदि फोन परमिशन मांगे तो "Allow from this source" चालू करें)',
        [
          {
            text: 'Install Now (अभी इंस्टॉल करें)',
            onPress: async () => {
              try {
                const cUri = await FileSystem.getContentUriAsync(downloadedFilePath);
                await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
                  data: cUri,
                  flags: 268435457,
                  type: 'application/vnd.android.package-archive',
                });
              } catch {
                Linking.openURL('https://icconline.vercel.app/api/download-apk');
              }
            },
          },
          {
            text: 'Direct APK Link',
            onPress: () => Linking.openURL('https://icconline.vercel.app/api/download-apk'),
          },
        ]
      );
    }
  },

  dismissUpdateBanner: () => {
    set({ dismissed: true });
  },
}));
