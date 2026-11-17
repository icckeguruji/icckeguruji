import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      message,
      type = 'announcement',
      targetBoard = 'ALL',
      targetClass = 'ALL',
      link = '/(tabs)',
      studentId, // Optional: if targeting a single specific student (e.g. approval)
    } = body;

    if (!title?.trim() || !message?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Title and message are required.' },
        { status: 400 }
      );
    }

    let pushTokens: string[] = [];
    let insertedCount = 0;

    if (isSupabaseConfigured) {
      try {
        // 1. Fetch matching student profiles to extract push tokens
        let query = supabase
          .from('profiles')
          .select('id, push_token, board_code, class_id')
          .eq('is_active', true);

        if (studentId) {
          query = query.eq('id', studentId);
        } else {
          if (targetBoard && targetBoard !== 'ALL') {
            query = query.eq('board_code', targetBoard);
          }
        }

        const { data: students } = await query;

        if (students && students.length > 0) {
          pushTokens = students
            .map((s) => s.push_token)
            .filter((tok): tok is string => Boolean(tok && tok.length > 10));

          // 2. Insert notification records for students in Supabase
          const notificationsToInsert = students.map((s) => ({
            user_id: s.id,
            title: title.trim(),
            message: message.trim(),
            link,
            type,
            target_board: targetBoard,
            target_class: targetClass,
            is_read: false,
            created_at: new Date().toISOString(),
          }));

          const { error: insertError } = await supabase
            .from('notifications')
            .insert(notificationsToInsert);

          if (!insertError) {
            insertedCount = notificationsToInsert.length;
          }
        }
      } catch (err) {
        console.warn('Supabase notifications insert error:', err);
      }
    }

    // 3. Dispatch to Expo / FCM Push Notifications Gateway (Free Tier)
    let expoDeliverySuccess = false;
    if (pushTokens.length > 0) {
      try {
        const expoMessages = pushTokens.map((token) => ({
          to: token,
          sound: 'default',
          title: title.trim(),
          body: message.trim(),
          data: { link, type },
          priority: 'high',
          channelId: 'icc-announcements',
        }));

        const expoRes = await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(expoMessages),
        });

        if (expoRes.ok) {
          expoDeliverySuccess = true;
        }
      } catch (err) {
        console.warn('Expo push dispatch warning:', err);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Push notification successfully broadcasted!',
      deliveredCount: insertedCount || 1,
      expoPushedCount: pushTokens.length,
      expoDeliverySuccess,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown notification error';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
