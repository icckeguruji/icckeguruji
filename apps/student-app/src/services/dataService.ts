// IDEAL COACHING CENTRE — STUDENT APP LIVE DATA & SYNC SERVICE
// Delegates to academicService for persistent authoritative data and connects to Supabase realtime

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { academicService } from './academicService';
import { Course, StudyMaterial, LiveClass } from '@icc/shared-types';

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  error?: string | null;
}

export const DataService = {
  // 1. Authoritative courses from persistent academic repository
  fetchCourses: async (): Promise<Course[]> => {
    return academicService.getCourses();
  },

  // 2. Authoritative live classes from persistent academic repository
  fetchLiveClasses: async (): Promise<LiveClass[]> => {
    return academicService.getLiveClasses();
  },

  // 3. Authoritative study materials from persistent academic repository
  fetchStudyMaterials: async (): Promise<StudyMaterial[]> => {
    return academicService.getStudyMaterials();
  },

  // 4. Subscribe to Realtime Updates
  subscribeToChanges: (onUpdate: () => void) => {
    if (!isSupabaseConfigured) return () => {};

    try {
      const channel = supabase
        .channel('icc-student-app-sync')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'courses' }, () => {
          academicService.syncFromCloud().then(onUpdate).catch(() => {});
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'live_classes' }, () => {
          academicService.syncFromCloud().then(onUpdate).catch(() => {});
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'study_materials' }, () => {
          academicService.syncFromCloud().then(onUpdate).catch(() => {});
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch {
      return () => {};
    }
  },
};
