import { create } from 'zustand';
import { UserProfile, BoardCode, AppLanguage } from '@icc/shared-types';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  language: AppLanguage;
  selectedBoard: BoardCode;
  selectedClass: string;
  isDarkMode: boolean;
  initAuthStore: () => Promise<void>;
  setLanguage: (lang: AppLanguage) => void;
  setUser: (user: UserProfile | null) => void;
  setBoard: (board: BoardCode) => void;
  setClass: (classId: string) => void;
  toggleDarkMode: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  logout: () => Promise<void>;
}

const defaultStudent: UserProfile = {
  id: 'u0000000-0000-0000-0000-000000000001',
  username: 'rohit_kumar',
  full_name: 'Rohit Kumar',
  mobile_number: '9876543210',
  email: 'rohit.kumar@example.com',
  dob: '2008-05-15',
  guardian_name: 'Shri Manoj Kumar',
  guardian_phone: '9876500001',
  board_code: 'BSEB',
  class_id: 'c0000000-0000-0000-0000-000000000010',
  district: 'Patna',
  school_name: 'Patna Collegiate High School',
  preferred_language: 'en',
  is_active: true,
  created_at: '2026-04-01T00:00:00Z',
  updated_at: '2026-04-01T00:00:00Z',
};

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: true, // Default to demo student for immediate app usability
  user: defaultStudent,
  language: 'en', // Default language is English as required
  selectedBoard: 'BSEB',
  selectedClass: 'Class 10',
  isDarkMode: false,

  initAuthStore: async () => {
    try {
      if (Platform.OS !== 'web') {
        const storedProfile = await SecureStore.getItemAsync('icc_user_profile');
        if (storedProfile) {
          const parsed = JSON.parse(storedProfile);
          set({
            user: parsed,
            isAuthenticated: true,
            selectedBoard: parsed.board_code || get().selectedBoard,
          });
        }
      } else if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('icc_user_profile');
        if (stored) {
          const parsed = JSON.parse(stored);
          set({
            user: parsed,
            isAuthenticated: true,
            selectedBoard: parsed.board_code || get().selectedBoard,
          });
        }
      }
    } catch {}
  },

  setLanguage: (language: AppLanguage) => {
    set({ language });
    if (Platform.OS !== 'web') {
      SecureStore.setItemAsync('icc_language', language);
    }
  },

  setUser: (user: UserProfile | null) => {
    set({
      user,
      isAuthenticated: !!user,
      selectedBoard: user?.board_code || get().selectedBoard,
    });
    if (user) {
      if (Platform.OS !== 'web') {
        SecureStore.setItemAsync('icc_user_profile', JSON.stringify(user)).catch(() => {});
      } else if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('icc_user_profile', JSON.stringify(user));
        } catch {}
      }
    }
  },

  setBoard: (selectedBoard: BoardCode) => set({ selectedBoard }),

  setClass: (selectedClass: string) => set({ selectedClass }),

  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),

  updateProfile: (updates: Partial<UserProfile>) => {
    set((state) => {
      if (!state.user) return state;
      const updatedUser: UserProfile = {
        ...state.user,
        ...updates,
        updated_at: new Date().toISOString(),
      };
      if (Platform.OS !== 'web') {
        SecureStore.setItemAsync('icc_user_profile', JSON.stringify(updatedUser)).catch(() => {});
      } else if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('icc_user_profile', JSON.stringify(updatedUser));
        } catch {}
      }
      return {
        user: updatedUser,
        selectedBoard: updatedUser.board_code || state.selectedBoard,
      };
    });
  },

  logout: async () => {
    if (Platform.OS !== 'web') {
      await SecureStore.deleteItemAsync('icc_session').catch(() => {});
      await SecureStore.deleteItemAsync('icc_user_profile').catch(() => {});
    } else if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('icc_user_profile');
      } catch {}
    }
    set({ isAuthenticated: false, user: null });
  },
}));
