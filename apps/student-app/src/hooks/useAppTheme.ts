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
      bg: '#000000', // PURE BLACK AMOLED
      surface: '#0A0A0A',
      surfaceCard: '#121212',
      cardBorder: '#27272A',
      text: '#FFFFFF',
      textSecondary: '#A1A1AA',
      textMuted: '#71717A',
      primary: '#3B82F6',
      primaryBg: '#1E293B',
      accent: '#60A5FA',
      border: '#27272A',
      inputBg: '#18181B',
      inputBorder: '#3F3F46',
      headerBg: '#000000',
      headerBorder: '#27272A',
      drawerBg: '#050505',
      tabBarBg: '#000000',
      tabBarBorder: '#27272A',
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
