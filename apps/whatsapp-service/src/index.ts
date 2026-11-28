import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { whatsAppManager } from './baileysClient.js';
import { supabase } from './supabaseClient.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// 1. Health & Status
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    bot: 'Miss Zoya',
    service: 'IDEAL COACHING CENTRE - WhatsApp AI Assistant Service',
    whatsappStatus: whatsAppManager.state.status,
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'IDEAL COACHING CENTRE - WhatsApp AI Assistant Service',
    timestamp: new Date().toISOString(),
  });
});

app.get('/status', (req, res) => {
  res.json(whatsAppManager.state);
});

// 2. Connect & Disconnect Actions (Supports QR Code OR Phone Number Pairing Code)
app.post('/connect', async (req, res) => {
  try {
    const { phoneNumber } = req.body || {};
    await whatsAppManager.startConnection(phoneNumber);
    // Wait up to 6s so pairingCode or qrCodeDataUrl is returned immediately in the HTTP response
    const startWait = Date.now();
    while (Date.now() - startWait < 6000) {
      const s = whatsAppManager.state;
      if (s.pairingCode || s.qrCodeDataUrl || s.status === 'CONNECTED' || s.status === 'ERROR') {
        break;
      }
      await new Promise((r) => setTimeout(r, 250));
    }
    res.json({ success: true, message: phoneNumber ? 'Pairing code initiated' : 'WhatsApp QR connection initiated', state: whatsAppManager.state });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2b. Send WhatsApp Notification from Admin Dashboard / Student App
app.post('/send-message', async (req, res) => {
  try {
    const { phone, message } = req.body || {};
    if (!phone || !message) {
      return res.status(400).json({ success: false, error: 'phone and message are required' });
    }
    const result = await whatsAppManager.sendWhatsAppMessage(phone, message);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json({ success: true, message: 'WhatsApp notification sent!' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/disconnect', async (req, res) => {
  try {
    await whatsAppManager.disconnectWhatsApp();
    res.json({ success: true, message: 'WhatsApp disconnected successfully', state: whatsAppManager.state });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/toggle-bot', (req, res) => {
  const { enabled } = req.body;
  whatsAppManager.toggleBot(!!enabled);
  res.json({ success: true, isBotEnabled: whatsAppManager.state.isBotEnabled });
});

// 3. Create Short-Lived Account Linking Token (Expires in 5 minutes)
app.post('/create-link-token', async (req, res) => {
  try {
    const { userId, userRole } = req.body;
    if (!userId || !userRole) {
      return res.status(400).json({ success: false, error: 'userId and userRole are required' });
    }

    // Generate random 6-character alphanumeric token (e.g. 8F2A9K)
    const tokenCode = crypto.randomBytes(3).toString('hex').toUpperCase();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('whatsapp_link_tokens')
      .insert({
        token_code: tokenCode,
        user_id: userId,
        user_role: userRole,
        expires_at: expiresAt,
      })
      .select('id, token_code, expires_at')
      .single();

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    res.json({
      success: true,
      tokenCode: data.token_code,
      expiresAt: data.expires_at,
      validitySeconds: 300,
      instructions: `Send #LINK ${data.token_code} to our WhatsApp number to link your account.`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Conversation Audit Logs for Admin Dashboard
app.get('/conversations', async (req, res) => {
  try {
    const { data } = await supabase
      .from('whatsapp_conversations')
      .select('*')
      .order('last_message_at', { ascending: false })
      .limit(20);

    res.json({ conversations: data || [] });
  } catch (err: any) {
    res.status(500).json({ conversations: [], error: err.message });
  }
});

// Start Express Listener (0.0.0.0 required for Render)
app.listen(Number(PORT), '0.0.0.0', async () => {
  console.log(`[WhatsApp Service] 🚀 Miss Zoya WhatsApp AI Supervisor listening on 0.0.0.0:${PORT}`);
  console.log(`[WhatsApp Service] Director: BADE SIR | IDEAL COACHING CENTRE (BSEB & JAC)`);
  const hasSavedSession = await whatsAppManager.restoreSessionFromSupabase();
  if (hasSavedSession) {
    console.log('[WhatsApp Service] 🔄 Auto-reconnecting saved WhatsApp session from Supabase...');
    whatsAppManager.startConnection().catch((e) => console.warn('Auto-reconnect error:', e));
  }

  // Self keep-alive ping every 10 minutes
  const selfUrl = process.env.RENDER_EXTERNAL_URL || 'https://icc-whatsapp-miss-zoya.onrender.com';
  setInterval(() => {
    fetch(`${selfUrl}/health`).catch(() => {});
  }, 10 * 60 * 1000);
});
