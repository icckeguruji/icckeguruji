// IDEAL COACHING CENTRE — OFFLINE SQLITE LOCAL CACHE
// Caches downloaded PDF notes, bookmarks, and lecture watch progress locally

import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

let db: any = null;

export const initLocalDatabase = async () => {
  if (Platform.OS === 'web') return;
  try {
    db = await SQLite.openDatabaseAsync('icc_offline_cache.db');

    // Create offline tables
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS downloaded_materials (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        title_hi TEXT,
        local_uri TEXT NOT NULL,
        file_size_bytes INTEGER NOT NULL,
        material_type TEXT NOT NULL,
        board_code TEXT NOT NULL,
        class_name TEXT NOT NULL,
        downloaded_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS offline_bookmarks (
        id TEXT PRIMARY KEY NOT NULL,
        item_type TEXT NOT NULL,
        title TEXT NOT NULL,
        subtitle TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS offline_watch_progress (
        lecture_id TEXT PRIMARY KEY NOT NULL,
        watched_seconds INTEGER NOT NULL,
        is_completed INTEGER NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);
  } catch (err) {
    console.error('Failed to initialize local SQLite cache:', err);
  }
};

export const LocalDbService = {
  saveDownloadedPdf: async (item: {
    id: string;
    title: string;
    title_hi?: string;
    local_uri: string;
    file_size_bytes: number;
    material_type: string;
    board_code: string;
    class_name: string;
  }) => {
    if (!db || Platform.OS === 'web') return;
    await db.runAsync(
      `INSERT OR REPLACE INTO downloaded_materials 
       (id, title, title_hi, local_uri, file_size_bytes, material_type, board_code, class_name, downloaded_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.id,
        item.title,
        item.title_hi || item.title,
        item.local_uri,
        item.file_size_bytes,
        item.material_type,
        item.board_code,
        item.class_name,
        new Date().toISOString(),
      ]
    );
  },

  getDownloadedPdfs: async () => {
    if (!db || Platform.OS === 'web') return [];
    return await db.getAllAsync('SELECT * FROM downloaded_materials ORDER BY downloaded_at DESC');
  },

  deleteDownloadedPdf: async (id: string) => {
    if (!db || Platform.OS === 'web') return;
    await db.runAsync('DELETE FROM downloaded_materials WHERE id = ?', [id]);
  },
};
