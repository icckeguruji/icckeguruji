import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as ScreenCapture from 'expo-screen-capture';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { useAuthStore } from '../src/store/useAuthStore';
import { initLocalDatabase } from '../src/store/useLocalDb';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes cache for low data usage
      retry: 2,
    },
  },
});

const customLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#2563EB',
    secondary: '#F59E0B',
    background: '#F8FAFC',
    surface: '#FFFFFF',
  },
};

const customDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#3B82F6',
    secondary: '#FBBF24',
    background: '#090D16',
    surface: '#1E293B',
  },
};

export default function RootLayout() {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);

  // Anti-Piracy DRM: Block Screenshots & Screen Recording globally across Android app
  ScreenCapture.usePreventScreenCapture();

  useEffect(() => {
    initLocalDatabase();
    useAuthStore.getState().initAuthStore();
  }, []);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <PaperProvider theme={isDarkMode ? customDarkTheme : customLightTheme}>
          <StatusBar style={isDarkMode ? 'light' : 'dark'} translucent={false} backgroundColor={isDarkMode ? '#090D16' : '#FFFFFF'} />
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
              contentStyle: {
                backgroundColor: isDarkMode ? '#090D16' : '#F8FAFC',
              },
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="course/[id]"
              options={{
                headerShown: true,
                title: 'Course Details',
                headerTintColor: '#0F172A',
              }}
            />
            <Stack.Screen
              name="payment/[id]"
              options={{
                headerShown: true,
                title: 'UPI Payment',
                headerTintColor: '#0F172A',
              }}
            />
            <Stack.Screen
              name="lecture/[id]"
              options={{
                headerShown: true,
                title: 'Video Lecture',
                headerTintColor: '#FFFFFF',
                headerStyle: { backgroundColor: '#0F172A' },
              }}
            />
            <Stack.Screen
              name="exam/[id]"
              options={{
                headerShown: true,
                title: 'Active Test',
                headerTintColor: '#FFFFFF',
                headerStyle: { backgroundColor: '#1E3A8A' },
              }}
            />
            <Stack.Screen
              name="exam-result/[id]"
              options={{
                headerShown: true,
                title: 'Scorecard',
                headerTintColor: '#0F172A',
              }}
            />
            <Stack.Screen
              name="doubts/index"
              options={{
                headerShown: true,
                title: 'Doubt Clearance',
                headerTintColor: '#0F172A',
              }}
            />
            <Stack.Screen
              name="assignments/index"
              options={{
                headerShown: true,
                title: 'Assignments & Homework',
                headerTintColor: '#0F172A',
              }}
            />
            <Stack.Screen
              name="pdf-viewer/[id]"
              options={{
                headerShown: true,
                title: 'Study Material (Protected)',
                headerTintColor: '#FFFFFF',
                headerStyle: { backgroundColor: '#0F172A' },
              }}
            />
            <Stack.Screen
              name="notifications"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="admin/index"
              options={{
                headerShown: false,
              }}
            />
          </Stack>
        </PaperProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
