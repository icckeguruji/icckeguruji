import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, userRole } = body;

    const tokenCode = crypto.randomBytes(3).toString('hex').toUpperCase();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    const targetUserId = userId || 'u0000000-0000-0000-0000-000000000001';
    const targetRole = userRole || 'student';

    try {
      await supabase.from('whatsapp_link_tokens').insert({
        token_code: tokenCode,
        user_id: targetUserId,
        user_role: targetRole,
        expires_at: expiresAt,
      });
    } catch {}

    return NextResponse.json({
      success: true,
      tokenCode,
      expiresAt,
      validitySeconds: 300,
      instructions: `Send #LINK ${tokenCode} to the institute WhatsApp bot within 5 minutes to verify your account.`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
