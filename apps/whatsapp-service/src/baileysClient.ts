import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  WASocket,
} from '@whiskeysockets/baileys';
import pino from 'pino';
import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';
import { supabase } from './supabaseClient.js';
import { resolveSenderIdentity, verifyAndLinkToken } from './accountLinker.js';
import { processAiMessage } from './aiEngine.js';

export interface WhatsAppServiceState {
  status: 'DISCONNECTED' | 'SCAN_QR' | 'PAIRING_CODE' | 'CONNECTING' | 'CONNECTED' | 'ERROR';
  qrCodeDataUrl: string | null;
  qrExpiresAt: string | null;
  pairingCode: string | null;
  pairingPhone: string | null;
  connectedPhone: string | null;
  connectedName: string | null;
  lastConnectedAt: string | null;
  lastMessageAt: string | null;
  totalReceived: number;
  totalReplies: number;
  errorMessage: string | null;
  isBotEnabled: boolean;
}

class WhatsAppClientManager {
  private socket: WASocket | null = null;
  private isConnecting: boolean = false;
  private processedMessageIds = new Set<string>();
  private sessionDir: string;

  public state: WhatsAppServiceState = {
    status: 'DISCONNECTED',
    qrCodeDataUrl: null,
    qrExpiresAt: null,
    pairingCode: null,
    pairingPhone: null,
    connectedPhone: null,
    connectedName: null,
    lastConnectedAt: null,
    lastMessageAt: null,
    totalReceived: 0,
    totalReplies: 0,
    errorMessage: null,
    isBotEnabled: true,
  };

  constructor() {
    this.sessionDir = path.resolve(process.cwd(), 'data/auth_session');
    if (!fs.existsSync(this.sessionDir)) {
      fs.mkdirSync(this.sessionDir, { recursive: true });
    }
  }

  public async updateSupabaseStatus() {
    try {
      await supabase
        .from('whatsapp_connection_status')
        .upsert({
          id: 1,
          status: this.state.status,
          qr_code: this.state.qrCodeDataUrl,
          qr_expires_at: this.state.qrExpiresAt,
          connected_phone: this.state.connectedPhone,
          connected_name: this.state.connectedName,
          last_connected_at: this.state.lastConnectedAt,
          last_message_at: this.state.lastMessageAt,
          total_messages_received: this.state.totalReceived,
          total_ai_replies_sent: this.state.totalReplies,
          error_message: this.state.errorMessage,
          updated_at: new Date().toISOString(),
        });
    } catch (err) {
      console.error('[WhatsApp Service] Supabase status sync error:', err);
    }
  }

  public async startConnection(phoneNumber?: string): Promise<void> {
    if (this.state.status === 'CONNECTED') {
      return;
    }

    // If switching to phone pairing mode, reset any in-progress unlinked socket
    const cleanPhone = phoneNumber ? phoneNumber.replace(/\D/g, '') : '';
    const formattedPhone =
      cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

    if (this.isConnecting && !formattedPhone) {
      return;
    }
    if (formattedPhone && this.socket) {
      try { this.socket.end(undefined); } catch {}
      this.socket = null;
      this.clearSession();
    }

    this.isConnecting = true;
    this.state.status = 'CONNECTING';
    this.state.qrCodeDataUrl = null;
    this.state.pairingCode = null;
    this.state.pairingPhone = formattedPhone || null;
    this.state.errorMessage = null;
    await this.updateSupabaseStatus();

    try {
      const { state, saveCreds } = await useMultiFileAuthState(this.sessionDir);

      this.socket = makeWASocket({
        auth: state,
        printQRInTerminal: !formattedPhone,
        logger: pino({ level: 'silent' }) as any,
        browser: ['IDEAL COACHING CENTRE', 'Chrome', '124.0.0'],
        defaultQueryTimeoutMs: 60000,
      });

      if (formattedPhone && !state.creds.registered) {
        setTimeout(async () => {
          try {
            if (!this.socket || this.state.status === 'CONNECTED') return;
            const rawCode = await this.socket.requestPairingCode(formattedPhone);
            const prettyCode = rawCode.length === 8 ? `${rawCode.slice(0, 4)}-${rawCode.slice(4)}` : rawCode;
            this.state.status = 'PAIRING_CODE';
            this.state.pairingCode = prettyCode;
            this.state.qrCodeDataUrl = null;
            this.state.qrExpiresAt = new Date(Date.now() + 120000).toISOString();
            console.log(`[WhatsApp Service] Pairing Code generated for +${formattedPhone}: ${prettyCode}`);
            await this.updateSupabaseStatus();
          } catch (pairErr: any) {
            console.error('[WhatsApp Service] Pairing code error:', pairErr);
            this.state.errorMessage = pairErr?.message || 'Failed to generate pairing code';
            await this.updateSupabaseStatus();
          }
        }, 1800);
      }

      // 1. Connection Updates
      this.socket.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr && !this.state.pairingPhone) {
          try {
            const qrDataUrl = await QRCode.toDataURL(qr, { margin: 2, scale: 6 });
            this.state.status = 'SCAN_QR';
            this.state.qrCodeDataUrl = qrDataUrl;
            this.state.qrExpiresAt = new Date(Date.now() + 45000).toISOString();
            console.log('[WhatsApp Service] Fresh QR code generated for Admin scan.');
            await this.updateSupabaseStatus();
          } catch (qrErr) {
            console.error('[WhatsApp Service] Error generating QR data URL:', qrErr);
          }
        }

        if (connection === 'connecting') {
          this.state.status = 'CONNECTING';
          await this.updateSupabaseStatus();
        }

        if (connection === 'open') {
          this.isConnecting = false;
          this.state.status = 'CONNECTED';
          this.state.qrCodeDataUrl = null;
          this.state.qrExpiresAt = null;
          this.state.pairingCode = null;
          this.state.pairingPhone = null;
          this.state.errorMessage = null;
          this.state.lastConnectedAt = new Date().toISOString();

          const user = this.socket?.user;
          if (user) {
            this.state.connectedPhone = user.id.split(':')[0] || user.id.split('@')[0];
            this.state.connectedName = user.name || 'IDEAL COACHING CENTRE Bot';
          }

          console.log(`[WhatsApp Service] ✅ WhatsApp Connected! Account: ${this.state.connectedPhone} (${this.state.connectedName})`);
          await this.updateSupabaseStatus();
        }

        if (connection === 'close') {
          this.isConnecting = false;
          const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
          const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

          console.log(`[WhatsApp Service] Connection closed. Reason: ${statusCode}, Should Reconnect: ${shouldReconnect}`);

          if (statusCode === DisconnectReason.loggedOut) {
            this.state.status = 'DISCONNECTED';
            this.state.connectedPhone = null;
            this.state.connectedName = null;
            this.state.qrCodeDataUrl = null;
            this.clearSession();
            await this.updateSupabaseStatus();
          } else {
            this.state.status = 'DISCONNECTED';
            this.state.errorMessage = 'Connection interrupted. Reconnecting...';
            await this.updateSupabaseStatus();
            setTimeout(() => this.startConnection(), 4000);
          }
        }
      });

      // 2. Save Credentials on Update
      this.socket.ev.on('creds.update', saveCreds);

      // 3. Process Incoming Messages
      this.socket.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify' || !this.state.isBotEnabled) return;

        for (const msg of messages) {
          if (!msg.message || msg.key.fromMe) continue;

          const remoteJid = msg.key.remoteJid;
          if (!remoteJid || remoteJid.endsWith('@g.us') || remoteJid === 'status@broadcast') {
            continue; // Ignore group chats and status updates
          }

          const msgId = msg.key.id || `${Date.now()}`;
          if (this.processedMessageIds.has(msgId)) continue;
          this.processedMessageIds.add(msgId);
          if (this.processedMessageIds.size > 2000) {
            this.processedMessageIds.clear();
          }

          // Extract text content
          const text =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text ||
            msg.message.imageMessage?.caption ||
            '';

          if (!text.trim()) continue;

          this.state.totalReceived += 1;
          this.state.lastMessageAt = new Date().toISOString();

          console.log(`[WhatsApp Incoming] [${remoteJid}] ${text}`);

          // Process the message asynchronously
          this.handleIncomingMessage(remoteJid, text.trim(), msg.pushName || undefined);
        }
      });
    } catch (err: any) {
      this.isConnecting = false;
      this.state.status = 'ERROR';
      this.state.errorMessage = err.message || 'Unknown connection error';
      console.error('[WhatsApp Service] Startup error:', err);
      await this.updateSupabaseStatus();
    }
  }

  private async handleIncomingMessage(senderJid: string, text: string, pushName?: string) {
    try {
      // 1. Resolve Identity
      const identity = await resolveSenderIdentity(senderJid);

      let reply = '';

      // 2. Check for Account Linking Command
      const upper = text.toUpperCase();
      if (upper.startsWith('#LINK') || upper.startsWith('LINK ') || (/^[A-Z0-9]{6}$/.test(text.toUpperCase()) && !identity.isLinked)) {
        const linkRes = await verifyAndLinkToken(senderJid, text, pushName);
        reply = linkRes.message;
      } else {
        // 3. Process via Miss Zoya AI & Live Database Tools
        reply = await processAiMessage({
          senderJid,
          senderText: text,
          identity,
          pushName,
        });
      }

      // 4. Send Reply via WhatsApp
      if (this.socket && reply) {
        await this.socket.sendMessage(senderJid, { text: reply });
        this.state.totalReplies += 1;
        await this.updateSupabaseStatus();
        console.log(`[WhatsApp Outgoing] Replied to [${senderJid}]`);
      }
    } catch (err) {
      console.error(`[WhatsApp Service] Error processing message from ${senderJid}:`, err);
    }
  }

  public async disconnectWhatsApp(): Promise<void> {
    if (this.socket) {
      try {
        await this.socket.logout();
      } catch {}
      this.socket = null;
    }
    this.state.status = 'DISCONNECTED';
    this.state.connectedPhone = null;
    this.state.connectedName = null;
    this.state.qrCodeDataUrl = null;
    this.clearSession();
    await this.updateSupabaseStatus();
  }

  public async sendWhatsAppMessage(phone: string, text: string): Promise<{ success: boolean; error?: string }> {
    if (!this.socket || this.state.status !== 'CONNECTED') {
      return { success: false, error: 'WhatsApp is not connected right now.' };
    }
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) {
      return { success: false, error: 'Invalid phone number.' };
    }
    const normalized = digits.length === 10 ? `91${digits}` : digits;
    const jid = `${normalized}@s.whatsapp.net`;
    try {
      await this.socket.sendMessage(jid, { text });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to send WhatsApp message' };
    }
  }

  public toggleBot(enabled: boolean) {
    this.state.isBotEnabled = enabled;
  }

  private clearSession() {
    try {
      if (fs.existsSync(this.sessionDir)) {
        fs.rmSync(this.sessionDir, { recursive: true, force: true });
        fs.mkdirSync(this.sessionDir, { recursive: true });
      }
    } catch (err) {
      console.error('[WhatsApp Service] Clear session error:', err);
    }
  }
}

export const whatsAppManager = new WhatsAppClientManager();
