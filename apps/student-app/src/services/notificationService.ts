import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import * as SecureStore from 'expo-secure-store';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { create } from 'zustand';

// Configure notification presentation when app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationItem {
  id: string;
  user_id?: string;
  title: string;
  message: string;
  type: 'live' | 'test' | 'notes' | 'announcement' | 'approval';
  link?: string;
  is_read: boolean;
  created_at: string;
  target_board?: string;
  target_class?: string;
}

const SEED_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: '🔴 Live Class Alert: Science (Class 10)',
    message: 'Bade Sir is starting Live Physics Class at 7:00 PM today on "Light: Reflection & Refraction". Be ready with your notebook!',
    type: 'live',
    link: '/(tabs)/live',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    target_board: 'ALL',
  },
  {
    id: 'notif-2',
    title: '📝 Sunday Board Mock Test Announced',
    message: 'Weekly All-Bihar & JAC Mega Mock Test is scheduled for this Sunday 10:00 AM. 100 Objective + Subjective Questions.',
    type: 'test',
    link: '/(tabs)/tests',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    target_board: 'ALL',
  },
  {
    id: 'notif-3',
    title: '📚 New Handwritten Notes Available',
    message: 'Class 10th & 12th Board Formula Cheat Sheets & VVI Model Papers have been uploaded. Read them inside the app.',
    type: 'notes',
    link: '/(tabs)/notes',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    target_board: 'ALL',
  },
  {
    id: 'notif-4',
    title: '⚡ 24/7 Grok AI Guruji Activated',
    message: 'Stuck on a tough Physics, Math, or Chemistry question? Ask ICC AI Guruji in the Doubts tab for instant step-by-step help!',
    type: 'announcement',
    link: '/doubts',
    is_read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    target_board: 'ALL',
  },
  {
    id: 'notif-5',
    title: '🎉 Welcome to Ideal Coaching Centre!',
    message: 'Your student account is active. Access video lectures, live classes, exams, and protected notes anytime.',
    type: 'approval',
    link: '/(tabs)',
    is_read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    target_board: 'ALL',
  },
];

const READ_STORAGE_KEY = 'icc_read_notification_ids';

interface NotificationStore {
  notifications: NotificationItem[];
  unreadCount: number;
  pushToken: string | null;
  isLoading: boolean;
  initPushNotifications: (userId?: string, boardCode?: string) => Promise<string | null>;
  fetchNotifications: (userId?: string, boardCode?: string) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearNotification: (id: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: SEED_NOTIFICATIONS,
  unreadCount: SEED_NOTIFICATIONS.filter((n) => !n.is_read).length,
  pushToken: null,
  isLoading: false,

  initPushNotifications: async (userId?: string, boardCode?: string) => {
    let token: string | null = null;

    try {
      // Setup Android notification channels
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('icc-announcements', {
          name: 'ICC Announcements & Live Alerts',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#2563EB',
          sound: 'default',
        });
      }

      // Check device compatibility (Physical device vs Simulator)
      if (Device.isDevice && Platform.OS !== 'web') {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus === 'granted') {
          try {
            const tokenResponse = await Notifications.getExpoPushTokenAsync();
            token = tokenResponse.data;
            set({ pushToken: token });

            // Persist locally
            await SecureStore.setItemAsync('icc_expo_push_token', token);

            // Sync with Supabase profiles if logged in
            if (token && userId && isSupabaseConfigured) {
              await supabase
                .from('profiles')
                .update({ push_token: token })
                .eq('id', userId);
            }
          } catch (tokErr) {
            console.log('Push token generation note:', tokErr);
          }
        }
      }

      // Start Realtime Listener for Supabase notifications
      if (isSupabaseConfigured) {
        try {
          supabase
            .channel('public:notifications')
            .on(
              'postgres_changes',
              { event: 'INSERT', schema: 'public', table: 'notifications' },
              async (payload) => {
                const incoming = payload.new as NotificationItem;
                if (!incoming || !incoming.title) return;

                // Check board or user filter
                if (
                  incoming.target_board &&
                  incoming.target_board !== 'ALL' &&
                  boardCode &&
                  incoming.target_board !== boardCode
                ) {
                  return;
                }

                // Trigger in-app notification popup if app is in foreground
                try {
                  await Notifications.scheduleNotificationAsync({
                    content: {
                      title: incoming.title,
                      body: incoming.message,
                      data: { link: incoming.link, type: incoming.type },
                      sound: true,
                    },
                    trigger: null,
                  });
                } catch {}

                // Prepend to store state
                const current = get().notifications;
                const updated = [incoming, ...current.filter((n) => n.id !== incoming.id)];
                set({
                  notifications: updated,
                  unreadCount: updated.filter((n) => !n.is_read).length,
                });
              }
            )
            .subscribe();
        } catch (subErr) {
          console.warn('Realtime subscription notice:', subErr);
        }
      }

      // Fetch initial notifications
      await get().fetchNotifications(userId, boardCode);
    } catch (err) {
      console.warn('Push notification initialization notice:', err);
    }

    return token;
  },

  fetchNotifications: async (userId?: string, boardCode?: string) => {
    set({ isLoading: true });
    try {
      let readIds: string[] = [];
      if (Platform.OS !== 'web') {
        const stored = await SecureStore.getItemAsync(READ_STORAGE_KEY);
        if (stored) {
          try {
            readIds = JSON.parse(stored);
          } catch {}
        }
      }

      if (isSupabaseConfigured) {
        try {
          let query = supabase.from('notifications').select('*');

          if (userId) {
            query = query.or(`user_id.eq.${userId},target_board.eq.ALL${boardCode ? `,target_board.eq.${boardCode}` : ''}`);
          }

          const { data, error } = await query.order('created_at', { ascending: false }).limit(30);

          if (!error && data && data.length > 0) {
            const mapped = data.map((n: any) => ({
              id: n.id,
              user_id: n.user_id,
              title: n.title,
              message: n.message,
              type: (n.type || 'announcement') as NotificationItem['type'],
              link: n.link || '/(tabs)',
              is_read: n.is_read || readIds.includes(n.id),
              created_at: n.created_at || new Date().toISOString(),
              target_board: n.target_board,
              target_class: n.target_class,
            }));

            set({
              notifications: mapped,
              unreadCount: mapped.filter((n: NotificationItem) => !n.is_read).length,
              isLoading: false,
            });
            return;
          }
        } catch (dbErr) {
          console.warn('Supabase fetch notifications notice:', dbErr);
        }
      }

      // Fallback with persisted read IDs
      const mergedSeed = SEED_NOTIFICATIONS.map((n) => ({
        ...n,
        is_read: readIds.includes(n.id) ? true : n.is_read,
      }));

      set({
        notifications: mergedSeed,
        unreadCount: mergedSeed.filter((n) => !n.is_read).length,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  markAsRead: async (id: string) => {
    const list = get().notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n));
    const unread = list.filter((n) => !n.is_read).length;
    set({ notifications: list, unreadCount: unread });

    // Persist read state
    try {
      if (Platform.OS !== 'web') {
        const stored = await SecureStore.getItemAsync(READ_STORAGE_KEY);
        const ids: string[] = stored ? JSON.parse(stored) : [];
        if (!ids.includes(id)) {
          ids.push(id);
          await SecureStore.setItemAsync(READ_STORAGE_KEY, JSON.stringify(ids));
        }
      }

      if (isSupabaseConfigured) {
        await supabase.from('notifications').update({ is_read: true }).eq('id', id);
      }
    } catch {}
  },

  markAllAsRead: async () => {
    const list = get().notifications.map((n) => ({ ...n, is_read: true }));
    set({ notifications: list, unreadCount: 0 });

    try {
      const allIds = list.map((n) => n.id);
      if (Platform.OS !== 'web') {
        await SecureStore.setItemAsync(READ_STORAGE_KEY, JSON.stringify(allIds));
      }

      if (isSupabaseConfigured) {
        await supabase.from('notifications').update({ is_read: true }).neq('id', 'placeholder');
      }
    } catch {}
  },

  clearNotification: async (id: string) => {
    const list = get().notifications.filter((n) => n.id !== id);
    set({ notifications: list, unreadCount: list.filter((n) => !n.is_read).length });
  },
}));
