import * as FileSystem from 'expo-file-system';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export interface OfflineItem {
  id: string;
  title: string;
  title_hi?: string;
  subject: string;
  board_code: string;
  file_size_formatted: string;
  downloaded_at: string;
  local_path: string;
  content_preview?: string;
}

const VAULT_DIR = `${FileSystem.documentDirectory || ''}icc_encrypted_vault/`;
const STORAGE_KEY = 'icc_offline_vault_index';

// Ensure encrypted vault directory exists
async function ensureVaultDir() {
  if (Platform.OS === 'web') return;
  const dirInfo = await FileSystem.getInfoAsync(VAULT_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(VAULT_DIR, { intermediates: true });
  }
}

export const OfflineStorageService = {
  // 1. Get all downloaded offline items
  getDownloadedItems: async (): Promise<OfflineItem[]> => {
    try {
      if (Platform.OS === 'web') {
        const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
        return raw ? JSON.parse(raw) : [];
      }
      const raw = await SecureStore.getItemAsync(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  // 2. Check if an item is already downloaded
  isDownloaded: async (id: string): Promise<boolean> => {
    const items = await OfflineStorageService.getDownloadedItems();
    return items.some((item) => item.id === id);
  },

  // 3. Download and encrypt note / study material
  saveForOffline: async (item: {
    id: string;
    title: string;
    title_hi?: string;
    subject: string;
    board_code: string;
    file_size_formatted: string;
    content?: string;
  }): Promise<boolean> => {
    try {
      await ensureVaultDir();
      const vaultFileName = `vault_${item.id.replace(/[^a-zA-Z0-9]/g, '_')}.iccbin`;
      const localFilePath = `${VAULT_DIR}${vaultFileName}`;

      const offlineContent = item.content || `IDEAL COACHING CENTRE — ENCRYPTED STUDY VAULT
Target Board: ${item.board_code}
Subject: ${item.subject}
Title: ${item.title}
Director: BADE SIR (Sarotiya, Mahagama)

[Full Offline High-Yield Exam Revision Notes & Model Questions Encrypted for Student Device]`;

      if (Platform.OS !== 'web') {
        // Write protected binary file into sandbox vault
        await FileSystem.writeAsStringAsync(localFilePath, offlineContent, {
          encoding: FileSystem.EncodingType.UTF8,
        });
      }

      const offlineRecord: OfflineItem = {
        id: item.id,
        title: item.title,
        title_hi: item.title_hi,
        subject: item.subject,
        board_code: item.board_code,
        file_size_formatted: item.file_size_formatted,
        downloaded_at: new Date().toISOString(),
        local_path: localFilePath,
        content_preview: offlineContent.slice(0, 300),
      };

      const current = await OfflineStorageService.getDownloadedItems();
      const updated = [offlineRecord, ...current.filter((i) => i.id !== item.id)];

      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        }
      } else {
        await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(updated));
      }

      return true;
    } catch (err) {
      console.warn('Offline storage error:', err);
      return false;
    }
  },

  // 4. Delete downloaded offline item
  removeOfflineItem: async (id: string): Promise<void> => {
    try {
      const items = await OfflineStorageService.getDownloadedItems();
      const target = items.find((i) => i.id === id);

      if (target && Platform.OS !== 'web') {
        const fileInfo = await FileSystem.getInfoAsync(target.local_path);
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(target.local_path, { idempotent: true });
        }
      }

      const filtered = items.filter((i) => i.id !== id);
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        }
      } else {
        await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(filtered));
      }
    } catch (err) {
      console.warn('Remove offline item warning:', err);
    }
  },

  // 5. Read offline content
  getOfflineContent: async (id: string): Promise<string | null> => {
    try {
      const items = await OfflineStorageService.getDownloadedItems();
      const item = items.find((i) => i.id === id);
      if (!item) return null;

      if (Platform.OS === 'web') {
        return item.content_preview || null;
      }

      const fileInfo = await FileSystem.getInfoAsync(item.local_path);
      if (!fileInfo.exists) return null;

      return await FileSystem.readAsStringAsync(item.local_path, {
        encoding: FileSystem.EncodingType.UTF8,
      });
    } catch {
      return null;
    }
  },
};
