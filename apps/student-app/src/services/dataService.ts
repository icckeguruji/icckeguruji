// IDEAL COACHING CENTRE — STUDENT APP LIVE DATA & SYNC SERVICE
// Delegates to academicService for persistent authoritative data and connects to Supabase realtime

import { academicService } from './academicService';
import { Course, StudyMaterial, LiveClass } from '@icc/shared-types';

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  error?: string | null;
}

// 4. Bandwidth-Protected Sync
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

  // 5. Subscribe to Realtime Updates (Local Reactive from authoritative academic repository)
  subscribeToChanges: (onUpdate: () => void) => {
    return academicService.subscribe(onUpdate);
  },
};
