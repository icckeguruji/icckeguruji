import { useColorScheme } from 'react-native';
import { useAuthStore, ThemeMode } from '../store/useAuthStore';

export interface ThemeColors {
  isDark: boolean;
  themeMode: ThemeMode;
  bg: string;
  surface: string;
  surfaceCard: string;
  cardBorder: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryBg: string;
  accent: string;
  border: string;
  inputBg: string;
  inputBorder: string;
  headerBg: string;
  headerBorder: string;
  drawerBg: string;
  tabBarBg: string;
  tabBarBorder: string;
}

export function useAppTheme(): ThemeColors {
  const systemScheme = useColorScheme();
  const { themeMode, isDarkMode } = useAuthStore();

  const isDark =
    themeMode === 'dark' || (themeMode === 'auto' && systemScheme === 'dark') || isDarkMode;

  if (isDark) {
    return {
      isDark: true,
      themeMode,
      bg: '#09090B',
      surface: '#111827',
      surfaceCard: '#161B26',
      cardBorder: '#334155',
      text: '#F8FAFC',
      textSecondary: '#CBD5E1',
      textMuted: '#94A3B8',
      primary: '#60A5FA',
      primaryBg: 'rgba(59, 130, 246, 0.18)',
      accent: '#93C5FD',
      border: '#334155',
      inputBg: '#1E293B',
      inputBorder: '#475569',
      headerBg: '#09090B',
      headerBorder: '#1E293B',
      drawerBg: '#0F172A',
      tabBarBg: '#09090B',
      tabBarBorder: '#1E293B',
    };
  }

  return {
    isDark: false,
    themeMode,
    bg: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceCard: '#FFFFFF',
    cardBorder: '#E2E8F0',
    text: '#0F172A',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    primary: '#2563EB',
    primaryBg: '#EFF6FF',
    accent: '#1D4ED8',
    border: '#E2E8F0',
    inputBg: '#F8FAFC',
    inputBorder: '#CBD5E1',
    headerBg: '#FFFFFF',
    headerBorder: '#E2E8F0',
    drawerBg: '#FFFFFF',
    tabBarBg: '#FFFFFF',
    tabBarBorder: '#E2E8F0',
  };
}
