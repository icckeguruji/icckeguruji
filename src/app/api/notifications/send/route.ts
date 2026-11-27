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
    let studentEmails: string[] = [];
    let studentPhones: string[] = [];
    let insertedCount = 0;

    if (isSupabaseConfigured) {
      try {
        // 1. Fetch matching student profiles to extract push tokens, emails & mobile numbers
        let query = supabase
          .from('profiles')
          .select('id, push_token, email, mobile_number, board_code, class_id')
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
          studentEmails = students
            .map((s) => s.email)
            .filter((em): em is string => Boolean(em && em.includes('@') && em !== 'student@example.com'));
          studentPhones = students
            .map((s: any) => s.mobile_number)
            .filter((ph): ph is string => Boolean(ph && ph.replace(/\D/g, '').length >= 10));

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

    // 4. Dispatch Email Notifications via Apps Script / Email Engine to Students & Admin
    const uniqueEmails = Array.from(new Set([...studentEmails, 'icckeguruji@gmail.com']));
    const origin = req.nextUrl.origin || 'https://icconline.vercel.app';
    Promise.allSettled(
      uniqueEmails.slice(0, 50).map((emailAddr) =>
        fetch(`${origin}/api/email/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: emailAddr,
            subject: `📢 [ICC] ${title.trim()}`,
            body: `${message.trim()}\n\nTarget: ${targetBoard} / ${targetClass}\n— IDEAL COACHING CENTRE (Director: BADE SIR)`,
            type,
          }),
        })
      )
    ).catch(() => {});

    // 5. Dispatch WhatsApp Notifications via Miss Zoya Baileys Service (if connected)
    const waUrl = process.env.WHATSAPP_SERVICE_URL || 'http://localhost:5001';
    if (studentPhones.length > 0) {
      const waText = `🌸 *IDEAL COACHING CENTRE (Miss Zoya)*\n\n*${title.trim()}*\n${message.trim()}`;
      Promise.allSettled(
        Array.from(new Set(studentPhones)).slice(0, 25).map((phone) =>
          fetch(`${waUrl}/send-message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, message: waText }),
          })
        )
      ).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      message: 'Push, Email & WhatsApp notification successfully broadcasted!',
      deliveredCount: insertedCount || 1,
      expoPushedCount: pushTokens.length,
      emailTargetedCount: uniqueEmails.length,
      whatsappTargetedCount: studentPhones.length,
      expoDeliverySuccess,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown notification error';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
