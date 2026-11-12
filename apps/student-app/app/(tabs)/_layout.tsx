import React from 'react';
import { Tabs } from 'expo-router';
import { useAuthStore } from '../../src/store/useAuthStore';
import { translations } from '@icc/shared-utils';
import { Text, View, StyleSheet } from 'react-native';

export default function TabsLayout() {
  const { language, isDarkMode } = useAuthStore();
  const t = translations[language];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF',
          borderTopColor: isDarkMode ? '#1E293B' : '#E2E8F0',
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#64748B',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t.home,
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18 }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="courses"
        options={{
          title: t.courses,
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18 }}>📚</Text>,
        }}
      />
      <Tabs.Screen
        name="live"
        options={{
          title: t.liveClasses,
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18 }}>🔴</Text>,
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          title: t.notes,
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18 }}>📄</Text>,
        }}
      />
      <Tabs.Screen
        name="tests"
        options={{
          title: t.tests,
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18 }}>📝</Text>,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t.profile,
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18 }}>👤</Text>,
        }}
      />
    </Tabs>
  );
}
