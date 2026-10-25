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
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const UPI_ID = process.env.UPI_ID || 'icckeguruji@okaxis';

async function callGeminiAi(studentMessage, studentName) {
  if (!GEMINI_API_KEY) {
    // Intelligent educational fallback when API key is not configured
    const msgLower = studentMessage.toLowerCase();
    if (msgLower.includes('fee') || msgLower.includes('price') || msgLower.includes('course')) {
      return `Namaste ${studentName || ''}! 🙏\nICC KE GURUJI coaching ke batches:\n1. Class 12 Physics Complete: ₹999\n2. Class 10 Board Crash Course: ₹499\n3. Full-Stack Web Dev: ₹1,499\n\nDirect UPI ID: ${UPI_ID} par pay karke UTR number share karein, batch turant active ho jayega!`;
    }
    if (msgLower.includes('utr') || msgLower.includes('pay') || msgLower.includes('done')) {
      return `Dhanyawad! Aapka payment details Guruji ke Telegram Command Center par receive ho chuka hai. Guruji 5 minute mein verify karke aapka batch unlock kar denge. Welcome to ICC KE GURUJI!`;
    }
    return `Namaste! 🙏 Main ICC KE GURUJI ka official 24/7 AI Counselor hun. Aap batch details, live class timing ya fees ke bare mein puch sakte hain. Aapki kya sahayata karun?`;
  }

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
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 250, temperature: 0.7 }
        })
      }
    );

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Namaste! Guruji jald hi aapse sampark karenge.';
  } catch (err) {
    console.error('Gemini error:', err);
    return 'Namaste! Aapka message receive ho gaya hai. Guruji jald hi aapse sampark karenge.';
  }
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
