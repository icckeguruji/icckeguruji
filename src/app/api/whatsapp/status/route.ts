import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { isAdminRequest } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

const WA_URL = process.env.WHATSAPP_SERVICE_URL || 'https://icc-whatsapp-miss-zoya.onrender.com';

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized: Admin login required.' }, { status: 401 });
  }
  // 1. Try local/remote Baileys microservice first
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(`${WA_URL}/status`, {
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timeout);

    if (res.ok) {
      const liveData = await res.json();
      return NextResponse.json({ ...liveData, isServiceOnline: true });
    }
  } catch {}

  // 2. Fallback to Supabase database state
  try {
    const { data } = await supabase
      .from('whatsapp_connection_status')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (data) {
      return NextResponse.json({
        status: data.status || 'DISCONNECTED',
        qrCodeDataUrl: data.qr_code,
        qrExpiresAt: data.qr_expires_at,
        connectedPhone: data.connected_phone,
        connectedName: data.connected_name,
        lastConnectedAt: data.last_connected_at,
        lastMessageAt: data.last_message_at,
        totalReceived: data.total_messages_received || 0,
        totalReplies: data.total_ai_replies_sent || 0,
        errorMessage: data.error_message,
        isBotEnabled: true,
        isServiceOnline: false,
      });
    }
  } catch {}

  // 3. Clean default disconnected state
  return NextResponse.json({
    status: 'DISCONNECTED',
    qrCodeDataUrl: null,
    connectedPhone: null,
    connectedName: null,
    totalReceived: 0,
    totalReplies: 0,
    isBotEnabled: true,
    isServiceOnline: false,
  });
}
