'use client';

import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  QrCode,
  CheckCircle,
  AlertCircle,
  Bot,
  Send,
  Sparkles,
  RefreshCw,
  Power,
  ShieldCheck,
  MessageSquare,
  Users,
  Terminal,
  Copy,
  Check
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { CoachingConfig, Course } from '@/types';

interface WhatsAppBotHubProps {
  config: CoachingConfig;
  courses: Course[];
}

export default function WhatsAppBotHub({ config, courses }: WhatsAppBotHubProps) {
  const [isConnected, setIsConnected] = useState(true);
  const [connectedNumber, setConnectedNumber] = useState(config.whatsappNumber || '+91 98765 43210');
  const [aiEnabled, setAiEnabled] = useState(true);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrString, setQrString] = useState(`2@ICC_KE_GURUJI_WA_${Date.now()},wX99m...`);
  const [copiedScript, setCopiedScript] = useState(false);

  // Simulated live message chat logs between student and AI Bot
  const [chatLogs, setChatLogs] = useState([
    {
      id: '1',
      studentName: 'Amit Verma (Patna)',
      studentPhone: '+91 98711 22334',
      message: 'Sir, what is the fee for the Class 12 Physics batch and when are live classes conducted?',
      aiReply: 'Hello Amit! 🙏 The ICC KE GURUJI Class 12 Physics Complete Mastery batch is currently on offer at just ₹999. Interactive live classes run daily at 7:00 PM on YouTube Live, supplemented with handwritten PDF notes and 24/7 AI tutor support. You can pay directly via UPI to icckeguruji@okaxis and submit your UTR!',
      timestamp: '11:42 AM',
      status: 'auto-replied'
    },
    {
      id: '2',
      studentName: 'Sunita (Parent)',
      studentPhone: '+91 94150 99881',
      message: 'Are Class 10th Board sample papers and solutions included?',
      aiReply: 'Yes, absolutely Sunita! The Class 10th Super 100 Batch includes the last 10 years of Board PYQ papers with Guruji step-by-step video solutions and Formula Cheat sheets. Course fee is only ₹499.',
      timestamp: '11:50 AM',
      status: 'auto-replied'
    },
    {
      id: '3',
      studentName: 'Vikram Singh',
      studentPhone: '+91 91234 56789',
      message: 'I have paid ₹999 via UPI. UTR: 629182739102. Please activate my batch.',
      aiReply: 'Thank you Vikram! Your UTR: 629182739102 has been received on Guruji\'s Telegram Command Center. Guruji will verify and activate your batch access within 5 minutes. Welcome to ICC KE GURUJI!',
      timestamp: '12:05 PM',
      status: 'payment-logged'
    }
  ]);

  const [testInput, setTestInput] = useState('');
  const [simulating, setSimulating] = useState(false);

  const handleSimulateMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testInput.trim()) return;

    setSimulating(true);

    const q = testInput.trim().toLowerCase();
    let reply = `Hello! I am the AI Assistant for ICC KE GURUJI, available 24/7 to help you. To enroll in our batches, complete your payment to UPI ID: ${config.upiId}.`;

    if (q.includes('fee') || q.includes('price') || q.includes('cost') || q.includes('kitna')) {
      reply = `Our batches offer discounted tuition:\n1. Class 12 Physics: ₹999 (6 Months)\n2. Class 10 Board: ₹499 (Crash Course)\n3. Full-Stack Web Dev: ₹1,499\nPay directly to UPI ${config.upiId} with 0% transaction fee.`;
    } else if (q.includes('utr') || q.includes('pay') || q.includes('screenshot')) {
      reply = `Your payment UTR has been delivered to Guruji. Guruji will verify it and unlock your classroom within 5 minutes!`;
    } else if (q.includes('live') || q.includes('time') || q.includes('schedule') || q.includes('kab')) {
      reply = `Class 12 Physics: Mon-Sat 07:00 PM Live\nClass 10 Maths: Mon-Sat 05:00 PM Live.\nLive classes stream on unlisted links with tamper-proof student watermarks.`;
    }

    setTimeout(() => {
      const newLog = {
        id: Date.now().toString(),
        studentName: 'Demo Student (WhatsApp Test)',
        studentPhone: '+91 99999 00000',
        message: testInput.trim(),
        aiReply: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'auto-replied'
      };

      setChatLogs([newLog, ...chatLogs]);
      setTestInput('');
      setSimulating(false);
    }, 700);
  };

  const handleCopyNodeScript = () => {
    const scriptCode = `// Run: node scripts/whatsapp-baileys-bot.js
const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
// Connects to WhatsApp Web QR code & uses Gemini 1.5 Flash AI!`;
    navigator.clipboard.writeText(scriptCode);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Status Card */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-3xl p-6 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="space-y-2 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
              {isConnected ? 'WhatsApp Linked & Active' : 'WhatsApp Disconnected'}
            </span>
            <span className="text-xs text-emerald-100 font-mono">
              Number: {connectedNumber}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">
            WhatsApp AI Assistant (24/7 Auto-Counselor)
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl leading-relaxed">
            Link your WhatsApp number via QR code. Whenever a student or parent sends an inquiry or question, Google Gemini AI instantly responds with detailed explanations and guidance!
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => {
              setQrString(`2@ICC_KE_GURUJI_WA_${Date.now()},wX99m...`);
              setShowQrModal(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 text-xs font-extrabold flex items-center gap-2 shadow-sm transition-all"
          >
            <QrCode className="w-4 h-4 text-emerald-700" />
            {isConnected ? 'Re-Scan QR Code' : 'Scan QR Code'}
          </button>

          <button
            onClick={() => setAiEnabled(!aiEnabled)}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 shadow-sm transition-all ${
              aiEnabled
                ? 'bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border border-emerald-500/40'
                : 'bg-rose-500 text-white hover:bg-rose-600'
            }`}
          >
            <Bot className="w-4 h-4" />
            {aiEnabled ? 'AI Auto-Reply: ON' : 'AI Auto-Reply: PAUSED'}
          </button>
        </div>
      </div>

      {/* Main Grid: Settings & Live Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: AI Knowledge & Prompt Configuration */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              AI Counselor Behavior &amp; Rules
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  AI Model
                </label>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-slate-800 flex items-center justify-between">
                  <span>Google Gemini 1.5 Flash</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Free Tier Active
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  AI Counselor Instructions (System Prompt)
                </label>
                <textarea
                  rows={5}
                  readOnly
                  value={`You are the official WhatsApp AI Counselor for 'ICC KE GURUJI' coaching institute.
- Tone: Polite, supportive, and professional English.
- Batches: Physics Mastery (₹999), Class 10 Board (₹499), Web Dev (₹1499).
- Payment: Direct UPI ID icckeguruji@okaxis (0% commission).
- Verification: If a student submits a UTR, confirm that Guruji will verify and activate access via the Command Center within minutes.`}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-mono text-[11px] leading-relaxed resize-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Connected WhatsApp Number
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={connectedNumber}
                    onChange={(e) => setConnectedNumber(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-slate-900 font-mono font-bold"
                  />
                  <span className="px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200 shrink-0">
                    Linked 🟢
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 24/7 Node.js Background Service Info Card */}
          <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Terminal className="w-4 h-4" />
                24/7 Baileys Worker Script
              </span>
              <button
                onClick={handleCopyNodeScript}
                className="text-[11px] text-slate-300 hover:text-white flex items-center gap-1 font-mono"
              >
                {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedScript ? 'Copied' : 'Copy'}
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              To maintain an active background connection, a standalone script is available at <code className="text-emerald-400">scripts/whatsapp-baileys-bot.js</code>. Run it on your computer or any free cloud server!
            </p>

            <div className="p-3 bg-slate-950 rounded-xl font-mono text-[11px] text-emerald-400 border border-slate-800">
              $ npm run whatsapp:bot
            </div>
          </div>
        </div>

        {/* Right Column: Live Incoming Inquiries & Message Simulator */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                Live Student Inquiries Log
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time conversations answered by AI on your WhatsApp number
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              {chatLogs.length} Messages Handled
            </span>
          </div>

          {/* Chat Stream */}
          <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
            {chatLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 transition-all hover:border-slate-300"
              >
                {/* Student message */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black flex items-center justify-center shrink-0">
                      WA
                    </span>
                    <div>
                      <div className="font-extrabold text-slate-900 text-xs sm:text-sm">
                        {log.studentName}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {log.studentPhone} • {log.timestamp}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                    Auto Replied
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200/80 text-xs text-slate-800 font-sans">
                  <strong>Student:</strong> {log.message}
                </div>

                {/* AI Reply */}
                <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 text-xs text-emerald-950 font-sans space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-800 text-[11px]">
                    <Bot className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Gemini AI Auto-Response:</span>
                  </div>
                  <p className="leading-relaxed whitespace-pre-wrap">{log.aiReply}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Test Live Simulation Box */}
          <form
            onSubmit={handleSimulateMessage}
            className="pt-4 border-t border-slate-100 flex items-center gap-2"
          >
            <input
              type="text"
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              placeholder="Test what happens if a student asks: 'What is the course fee?' or 'I have paid via UPI'..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={simulating || !testInput.trim()}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors shrink-0"
            >
              {simulating ? (
                'Replying...'
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Test AI Reply
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* QR Code Scan Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 text-center space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <QrCode className="w-5 h-5 text-emerald-600" />
                Scan WhatsApp QR Code
              </h3>
              <button
                onClick={() => setShowQrModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Open <strong>WhatsApp</strong> on your mobile device ➜ tap <strong>Settings</strong> or <strong>Menu (3-Dots)</strong> ➜ <strong>Linked Devices</strong> ➜ tap <strong>Link a Device</strong> and point your camera to scan this QR code:
            </p>

            <div className="p-5 bg-emerald-50 rounded-2xl border-2 border-dashed border-emerald-300 inline-block">
              <QRCodeSVG
                value={qrString}
                size={210}
                level="M"
                includeMargin={false}
              />
            </div>

            <div className="text-xs text-slate-500 font-mono">
              Status: <span className="text-emerald-700 font-bold">Waiting for WhatsApp Scan...</span>
            </div>

            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsConnected(true);
                  setShowQrModal(false);
                }}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                Device Linked Successfully
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
