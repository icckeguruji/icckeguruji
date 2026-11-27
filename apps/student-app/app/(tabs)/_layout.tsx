import React from 'react';
import { Tabs } from 'expo-router';
import { useAppTheme } from '../../src/hooks/useAppTheme';
import { View, StyleSheet, Platform } from 'react-native';
import { Home, BookOpen, Radio, FileText, CheckSquare, User } from 'lucide-react-native';

export default function TabsLayout() {
  const theme = useAppTheme();
  const isDark = theme.isDark;
  const activeBg = isDark ? 'rgba(59, 130, 246, 0.18)' : '#EFF6FF';
  const liveActiveBg = isDark ? 'rgba(239, 68, 68, 0.18)' : '#FEF2F2';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: theme.tabBarBg,
          borderTopColor: theme.tabBarBorder,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 84 : 66,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: isDark ? 0.4 : 0.06,
          shadowRadius: 6,
        },
        tabBarActiveTintColor: isDark ? '#60A5FA' : '#2563EB',
        tabBarInactiveTintColor: isDark ? '#94A3B8' : '#64748B',
        tabBarLabelStyle: {
          fontSize: 10.5,
          fontWeight: '700',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrapper, focused && { backgroundColor: activeBg }]}>
              <Home size={19} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="courses"
        options={{
          title: 'Courses',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrapper, focused && { backgroundColor: activeBg }]}>
              <BookOpen size={19} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="live"
        options={{
          title: 'Live',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrapper, focused && { backgroundColor: liveActiveBg }]}>
              <Radio size={19} color={focused ? (isDark ? '#F87171' : '#DC2626') : color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          title: 'Notes',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrapper, focused && { backgroundColor: activeBg }]}>
              <FileText size={19} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="tests"
        options={{
          title: 'Quiz',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrapper, focused && { backgroundColor: activeBg }]}>
              <CheckSquare size={19} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrapper, focused && { backgroundColor: activeBg }]}>
              <User size={19} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 34,
    height: 26,
    borderRadius: 13,
  },
});
