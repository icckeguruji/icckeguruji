/**
 * ICC KE GURUJI — WhatsApp 24/7 AI Counselor Bot
 * 
 * Powered by:
 * - @whiskeysockets/baileys (WhatsApp Web Multi-Device Socket)
 * - Google Gemini 1.5 Flash API (24/7 Hinglish educational counselor)
 * 
 * How to Run:
 * 1. npm install @whiskeysockets/baileys qrcode-terminal
 * 2. node scripts/whatsapp-baileys-bot.js
 * 3. Scan the terminal QR code with your WhatsApp -> Linked Devices!
 */

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const path = require('path');
const fs = require('fs');

const AUTH_FOLDER = path.join(__dirname, '../auth_info_baileys');
let GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const envPath = path.join(__dirname, '../.env.local');
if (!GEMINI_API_KEY && fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/GEMINI_API_KEY=([^\r\n]+)/);
  if (match) {
    GEMINI_API_KEY = match[1].trim();
  }
}
const UPI_ID = process.env.UPI_ID || 'icckeguruji@okaxis';

async function callGeminiAi(studentMessage, studentName) {
  const msgLower = (studentMessage || '').toLowerCase();

  // Smart immediate handlers for high-priority student inquiries
  if (msgLower.includes('fee') || msgLower.includes('price') || msgLower.includes('kitna') || msgLower.includes('kitne')) {
    return `Namaste ${studentName || ''}! 🙏\nICC KE GURUJI coaching ke active batches:\n1. Class 12 Physics Complete: ₹999\n2. Class 10 Board Crash Course: ₹499\n3. Full-Stack Web Dev: ₹1,499\n\nDirect UPI ID: ${UPI_ID} par pay karke UTR number share karein, batch turant active ho jayega!`;
  }
  if (msgLower.includes('utr') || msgLower.includes('pay kar diya') || msgLower.includes('paid') || msgLower.includes('screenshot')) {
    return `Dhanyawad ${studentName || ''}! 🙏 Aapka payment details Guruji ke Telegram Command Center par receive ho chuka hai. Guruji 5 minute mein verify karke aapka batch unlock kar denge. Welcome to ICC KE GURUJI!`;
  }

  if (GEMINI_API_KEY) {
    try {
      const prompt = `Aap 'ICC KE GURUJI' coaching institute ke official WhatsApp AI Counselor hain.
Student Name: ${studentName || 'Student'}
Student's incoming WhatsApp message: "${studentMessage}"

Instructions:
1. Explain in polite, encouraging, and friendly Hinglish.
2. Batches: Class 12 Physics (₹999), Class 10 Board (₹499), Web Dev (₹1499).
3. Payment: Direct UPI ${UPI_ID} (0% gateway commission).
4. If they send a UTR or payment confirmation, confirm that Guruji is reviewing it from his Telegram dashboard right now.
Keep reply concise (3-5 lines max) so it looks natural on WhatsApp.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 250, temperature: 0.7 }
          }),
          signal: AbortSignal.timeout(6000)
        }
      );

      if (response.ok) {
        const data = await response.json();
        const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (replyText) return replyText;
      }
    } catch (err) {
      console.log('Gemini call skipped/timed out, using smart counselor response.');
    }
  }

  // Educational Hinglish counselor fallback
  return `Namaste ${studentName || ''}! 🙏 Main ICC KE GURUJI ka official 24/7 AI Counselor hun.\nAap batch details, live classes schedule, notes, ya fees ke bare mein puch sakte hain. Aapki kya sahayata karun?`;
}

async function startWhatsAppBot() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('\n📲 Scan this QR code from WhatsApp (Linked Devices):');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('Connection closed due to:', lastDisconnect?.error, ', reconnecting:', shouldReconnect);
      if (shouldReconnect) {
        startWhatsAppBot();
      }
    } else if (connection === 'open') {
      console.log('✅ WhatsApp Bot Connected 24/7 for ICC KE GURUJI!');
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const msg of messages) {
      if (msg.key.fromMe) continue; // Don't reply to self
      const remoteJid = msg.key.remoteJid;
      if (!remoteJid || remoteJid.includes('@g.us')) continue; // Ignore group messages, reply only to DMs

      const text =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        '';

      if (!text) continue;

      const senderName = msg.pushName || 'Student';
      console.log(`📩 Incoming message from ${senderName} (${remoteJid}): ${text}`);

      // Call Gemini AI
      const aiResponse = await callGeminiAi(text, senderName);

      // Send auto-reply on WhatsApp
      await sock.sendMessage(remoteJid, { text: aiResponse });
      console.log(`🤖 AI Replied to ${senderName}: ${aiResponse.slice(0, 60)}...`);
    }
  });
}

// Start bot
console.log('🚀 Starting ICC KE GURUJI WhatsApp Baileys AI Bot...');
startWhatsAppBot().catch(console.error);
