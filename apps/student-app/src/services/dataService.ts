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

// 4. Bandwidth-Protected Shared Realtime Channel
let sharedChannel: any = null;
let subscriberCount = 0;
let lastSyncTime = 0;

const debouncedCloudSync = async (onUpdate: () => void) => {
  const now = Date.now();
  // Throttle cloud sync to at most once every 10 seconds to protect egress quota
  if (now - lastSyncTime < 10000) {
    onUpdate();
    return;
  }
  lastSyncTime = now;
  try {
    await academicService.syncFromCloud();
    onUpdate();
  } catch {}
};

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

  // 4. Subscribe to Realtime Updates (Local Reactive + Bandwidth-Guarded Cloud Sync)
  subscribeToChanges: (onUpdate: () => void) => {
    const unsubscribeLocal = academicService.subscribe(onUpdate);

    if (!isSupabaseConfigured) return unsubscribeLocal;

    subscriberCount++;
    if (!sharedChannel) {
      try {
        sharedChannel = supabase
          .channel('icc-shared-sync')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'courses' }, () => {
            debouncedCloudSync(onUpdate);
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'live_classes' }, () => {
            debouncedCloudSync(onUpdate);
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'study_materials' }, () => {
            debouncedCloudSync(onUpdate);
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => {
            debouncedCloudSync(onUpdate);
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
            debouncedCloudSync(onUpdate);
          })
          .subscribe();
      } catch {
        sharedChannel = null;
      }
    }

    return () => {
      unsubscribeLocal();
      subscriberCount--;
      if (subscriberCount <= 0 && sharedChannel) {
        try {
          supabase.removeChannel(sharedChannel);
        } catch {}
        sharedChannel = null;
        subscriberCount = 0;
      }
    };
  },
};
