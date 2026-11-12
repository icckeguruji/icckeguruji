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
  setLanguage: (lang: AppLanguage) => void;
  setUser: (user: UserProfile | null) => void;
  setBoard: (board: BoardCode) => void;
  setClass: (classId: string) => void;
  toggleDarkMode: () => void;
  logout: () => Promise<void>;
}

const defaultStudent: UserProfile = {
  id: 'u0000000-0000-0000-0000-000000000001',
  username: 'rohit_kumar',
  full_name: 'Rohit Kumar',
  mobile_number: '9876543210',
  email: 'rohit.kumar@example.com',
  board_code: 'BSEB',
  class_id: 'c0000000-0000-0000-0000-000000000010',
  district: 'Patna',
  school_name: 'Patna Collegiate High School',
  preferred_language: 'hi',
  is_active: true,
  created_at: '2026-04-01T00:00:00Z',
  updated_at: '2026-04-01T00:00:00Z',
};

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: true, // Default to demo student for immediate app usability
  user: defaultStudent,
  language: 'hi', // Strict requirement: Default language is Hindi
  selectedBoard: 'BSEB',
  selectedClass: 'Class 10',
  isDarkMode: false,

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
  },

  setBoard: (selectedBoard: BoardCode) => set({ selectedBoard }),

  setClass: (selectedClass: string) => set({ selectedClass }),

  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),

  logout: async () => {
    if (Platform.OS !== 'web') {
      await SecureStore.deleteItemAsync('icc_session');
    }
    set({ isAuthenticated: false, user: null });
  },
}));
