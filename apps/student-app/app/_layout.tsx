import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
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

  useEffect(() => {
    initLocalDatabase();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={isDarkMode ? customDarkTheme : customLightTheme}>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />
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
              title: 'कोर्स विवरण (Course Details)',
              headerTintColor: '#0F172A',
            }}
          />
          <Stack.Screen
            name="payment/[id]"
            options={{
              headerShown: true,
              title: 'शुल्क भुगतान (UPI Payment)',
              headerTintColor: '#0F172A',
            }}
          />
          <Stack.Screen
            name="lecture/[id]"
            options={{
              headerShown: true,
              title: 'वीडियो व्याख्यान (Video Lecture)',
              headerTintColor: '#FFFFFF',
              headerStyle: { backgroundColor: '#0F172A' },
            }}
          />
          <Stack.Screen
            name="exam/[id]"
            options={{
              headerShown: true,
              title: 'ऑनलाइन परीक्षा (Active Test)',
              headerTintColor: '#FFFFFF',
              headerStyle: { backgroundColor: '#1E3A8A' },
            }}
          />
          <Stack.Screen
            name="exam-result/[id]"
            options={{
              headerShown: true,
              title: 'परीक्षा परिणाम (Scorecard)',
              headerTintColor: '#0F172A',
            }}
          />
          <Stack.Screen
            name="doubts/index"
            options={{
              headerShown: true,
              title: 'शंका समाधान (Doubt Clearance)',
              headerTintColor: '#0F172A',
            }}
          />
          <Stack.Screen
            name="assignments/index"
            options={{
              headerShown: true,
              title: 'गृहकार्य एवं असाइनमेंट (Assignments)',
              headerTintColor: '#0F172A',
            }}
          />
        </Stack>
      </PaperProvider>
    </QueryClientProvider>
  );
}
