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
let isRemoteSyncInProgress = false;

const triggerRemoteSync = async () => {
  const now = Date.now();
  // Throttle cloud sync to at most once every 3 seconds to protect egress quota
  if (now - lastSyncTime < 3000 || isRemoteSyncInProgress) {
    return;
  }
  lastSyncTime = now;
  isRemoteSyncInProgress = true;
  try {
    await academicService.syncFromCloud();
  } catch {} finally {
    isRemoteSyncInProgress = false;
  }
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

  // 4. Force sync from cloud
  syncAllFromCloud: async () => {
    return academicService.syncFromCloud();
  },

  // 5. Subscribe to Realtime Updates (Local Reactive + Bandwidth-Guarded Cloud Sync)
  subscribeToChanges: (onUpdate: () => void) => {
    const unsubscribeLocal = academicService.subscribe(onUpdate);

    if (!isSupabaseConfigured) return unsubscribeLocal;

    subscriberCount++;
    if (!sharedChannel) {
      try {
        sharedChannel = supabase
          .channel('icc-shared-sync')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'courses' }, () => {
            triggerRemoteSync();
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'live_classes' }, () => {
            triggerRemoteSync();
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'study_materials' }, () => {
            triggerRemoteSync();
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => {
            triggerRemoteSync();
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
            triggerRemoteSync();
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
