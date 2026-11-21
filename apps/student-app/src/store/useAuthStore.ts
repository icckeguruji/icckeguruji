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

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false, // Default: NOT logged in. Requires explicit login or remembered session
  user: null,
  language: 'en',
  selectedBoard: 'BSEB',
  selectedClass: 'Class 10',
  isDarkMode: false,

  initAuthStore: async () => {
    try {
      let rememberMe = 'false';
      let storedProfile: string | null = null;

      if (Platform.OS !== 'web') {
        rememberMe = (await SecureStore.getItemAsync('icc_remember_me')) || 'false';
        if (rememberMe === 'true') {
          storedProfile = await SecureStore.getItemAsync('icc_user_profile');
        }
      } else if (typeof window !== 'undefined') {
        rememberMe = localStorage.getItem('icc_remember_me') || 'false';
        if (rememberMe === 'true') {
          storedProfile = localStorage.getItem('icc_user_profile');
        }
      }

      // Only auto-login if Remember Me was explicitly checked AND a real profile exists
      if (rememberMe === 'true' && storedProfile) {
        const parsed = JSON.parse(storedProfile);
        // Exclude dummy demo student
        if (parsed && parsed.id && parsed.username !== 'rohit_kumar') {
          set({
            user: parsed,
            isAuthenticated: true,
            selectedBoard: parsed.board_code || get().selectedBoard,
          });
          return;
        }
      }

      // Otherwise remain logged out
      set({ isAuthenticated: false, user: null });
    } catch {
      set({ isAuthenticated: false, user: null });
    }
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
      await SecureStore.deleteItemAsync('icc_remember_me').catch(() => {});
    } else if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('icc_session');
        localStorage.removeItem('icc_user_profile');
        localStorage.removeItem('icc_remember_me');
      } catch {}
    }
    set({ isAuthenticated: false, user: null });
  },
}));
