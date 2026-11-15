import { supabase } from './supabaseClient.js';

export interface SenderIdentity {
  isLinked: boolean;
  userId: string | null;
  userRole: 'public' | 'student' | 'teacher' | 'admin';
  userName?: string;
}

export async function resolveSenderIdentity(senderJid: string): Promise<SenderIdentity> {
  try {
    const { data: link } = await supabase
      .from('whatsapp_account_links')
      .select('user_id, user_role, is_active')
      .eq('whatsapp_sender_id', senderJid)
      .eq('is_active', true)
      .maybeSingle();

    if (link && link.user_id) {
      // Fetch user profile name
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', link.user_id)
        .maybeSingle();

      return {
        isLinked: true,
        userId: link.user_id,
        userRole: link.user_role as 'student' | 'teacher' | 'admin',
        userName: profile?.full_name || 'Member',
      };
    }
  } catch {}

  return {
    isLinked: false,
    userId: null,
    userRole: 'public',
  };
}

export async function verifyAndLinkToken(
  senderJid: string,
  rawTokenText: string,
  displayPhone?: string
): Promise<{ success: boolean; message: string; role?: string; name?: string }> {
  const cleanCode = rawTokenText
    .replace(/^#?LINK/i, '')
    .trim()
    .toUpperCase();

  if (cleanCode.length < 4) {
    return {
      success: false,
      message: 'Invalid linking token format. Please send the token as #LINK XXXXXX.',
    };
  }

  try {
    const { data: tokenRecord, error } = await supabase
      .from('whatsapp_link_tokens')
      .select('id, token_code, user_id, user_role, expires_at, used_at')
      .eq('token_code', cleanCode)
      .is('used_at', null)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (error || !tokenRecord) {
      return {
        success: false,
        message: 'This linking code is either invalid or has expired (validity: 5 minutes). Please generate a fresh code in your App/Website Profile.',
      };
    }

    // Link WhatsApp identity to the user account
    await supabase.from('whatsapp_account_links').upsert(
      {
        user_id: tokenRecord.user_id,
        user_role: tokenRecord.user_role,
        whatsapp_sender_id: senderJid,
        whatsapp_display_phone: displayPhone || senderJid.split('@')[0],
        is_active: true,
        linked_at: new Date().toISOString(),
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: 'whatsapp_sender_id' }
    );

    // Invalidate the token
    await supabase
      .from('whatsapp_link_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('id', tokenRecord.id);

    // Fetch user name
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', tokenRecord.user_id)
      .maybeSingle();

    const name = profile?.full_name || 'User';

    return {
      success: true,
      message: `✅ Congratulations ${name}! Your WhatsApp is now securely linked to your IDEAL COACHING CENTRE ${tokenRecord.user_role.toUpperCase()} account.\n\nYou can now ask me for your enrolled courses, live class schedules, study notes, Sunday test results, and fee status directly here!`,
      role: tokenRecord.user_role,
      name,
    };
  } catch (err: any) {
    return {
      success: false,
      message: 'Failed to link account due to database error: ' + (err.message || 'Unknown error'),
    };
  }
}

export async function unlinkSender(senderJid: string): Promise<boolean> {
  try {
    await supabase
      .from('whatsapp_account_links')
      .update({ is_active: false, revoked_at: new Date().toISOString() })
      .eq('whatsapp_sender_id', senderJid);
    return true;
  } catch {
    return false;
  }
}
