'use client';

import React, { useState, useEffect } from 'react';
import { AdminHeader } from '@/components/AdminHeader';
import {
  MessageSquare,
  QrCode,
  ShieldCheck,
  Smartphone,
  RefreshCw,
  Power,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  Users,
  Copy,
  Check,
  KeyRound,
  ExternalLink,
  Bot,
  Zap,
} from 'lucide-react';

interface WhatsAppStatus {
  status: 'DISCONNECTED' | 'SCAN_QR' | 'CONNECTING' | 'CONNECTED' | 'ERROR';
  qrCodeDataUrl: string | null;
  qrExpiresAt: string | null;
  connectedPhone: string | null;
  connectedName: string | null;
  lastConnectedAt: string | null;
  lastMessageAt: string | null;
  totalReceived: number;
  totalReplies: number;
  errorMessage: string | null;
  isBotEnabled: boolean;
  isServiceOnline: boolean;
}

export default function WhatsAppAdminPage() {
  const [status, setStatus] = useState<WhatsAppStatus>({
    status: 'DISCONNECTED',
    qrCodeDataUrl: null,
    qrExpiresAt: null,
    connectedPhone: null,
    connectedName: null,
    lastConnectedAt: null,
    lastMessageAt: null,
    totalReceived: 0,
    totalReplies: 0,
    errorMessage: null,
    isBotEnabled: true,
    isServiceOnline: false,
  });

  const [loading, setLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Account Linking Token Generator
  const [tokenLoading, setTokenLoading] = useState(false);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [tokenRole, setTokenRole] = useState<'student' | 'teacher' | 'admin'>('student');
  const [copiedToken, setCopiedToken] = useState(false);

  // Fetch status
  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/whatsapp/status', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch {}
  };

  useEffect(() => {
    fetchStatus();
    // Poll every 3s only during QR scan / connecting, and 30s when connected or idle. Pauses when tab is hidden.
    const pollInterval = status.status === 'SCAN_QR' || status.status === 'CONNECTING' ? 3000 : 30000;
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      fetchStatus();
    }, pollInterval);
    return () => clearInterval(interval);
  }, [status.status]);

  // Handle Connect
  const handleConnect = async () => {
    setLoading(true);
    setActionMsg(null);
    try {
      const res = await fetch('/api/whatsapp/connect', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setActionMsg({ type: 'success', text: 'WhatsApp connection initiated! Please scan the QR code below.' });
        fetchStatus();
      } else {
        setActionMsg({ type: 'error', text: data.error || 'Failed to start WhatsApp service.' });
      }
    } catch {
      setActionMsg({ type: 'error', text: 'Failed to communicate with WhatsApp backend service.' });
    } finally {
      setLoading(false);
    }
  };

  // Handle Disconnect
  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect the active WhatsApp account?')) return;
    setLoading(true);
    try {
      await fetch('/api/whatsapp/disconnect', { method: 'POST' });
      setActionMsg({ type: 'success', text: 'WhatsApp account disconnected cleanly.' });
      fetchStatus();
    } catch {
      setActionMsg({ type: 'error', text: 'Error disconnecting WhatsApp account.' });
    } finally {
      setLoading(false);
    }
  };

  // Handle Toggle Bot
  const handleToggleBot = async () => {
    const nextVal = !status.isBotEnabled;
    try {
      await fetch('/api/whatsapp/toggle-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: nextVal }),
      });
      setStatus((prev) => ({ ...prev, isBotEnabled: nextVal }));
      setActionMsg({
        type: 'success',
        text: nextVal ? 'AI Bot enabled for automated replies.' : 'AI Bot paused. Auto-replies suspended.',
      });
    } catch {}
  };

  // Generate 5-Minute Linking Token
  const handleGenerateLinkToken = async () => {
    setTokenLoading(true);
    try {
      const res = await fetch('/api/whatsapp/create-link-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'u0000000-0000-0000-0000-000000000001',
          userRole: tokenRole,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedToken(data.tokenCode);
      }
    } catch {
      alert('Failed to generate token');
    } finally {
      setTokenLoading(false);
    }
  };

  const handleCopyToken = () => {
    if (!generatedToken) return;
    navigator.clipboard.writeText(`#LINK ${generatedToken}`);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  return (
    <div className="flex-1 pb-16">
      <AdminHeader
        titleHi="व्हाट्सएप AI असिस्टेंट (Baileys Web Rail)"
        titleEn="WhatsApp AI Assistant"
        subtitleHi="QR कोड स्कैन कर संस्थान का आधिकारिक व्हाट्सएप बॉट सक्रिय करें"
        subtitleEn="QR-based linked-device integration for automated student, teacher & public AI support"
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Action feedback message */}
        {actionMsg && (
          <div
            className={`p-4 rounded-2xl flex items-center justify-between text-xs font-semibold ${
              actionMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            <span>{actionMsg.text}</span>
            <button onClick={() => setActionMsg(null)} className="text-slate-400 hover:text-slate-700">
              ✕
            </button>
          </div>
        )}

        {/* Operational Disclosure Banner (Part 1 Compliance) */}
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex items-start space-x-3 text-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-amber-900">
              Operational Architecture & Zero-Cost Policy Notice
            </h4>
            <p className="text-amber-800 leading-relaxed text-[11px]">
              This service uses <strong>@whiskeysockets/baileys</strong> multi-device linked-device Web automation with zero paid WhatsApp Business API fees. To safeguard the institute account against automated rate-limiting, bulk unsolicited broadcasting is strictly prohibited. The bot operates purely in reactive one-to-one conversational mode for student doubts, notes, fees, and syllabus queries.
            </p>
          </div>
        </div>

        {/* Analytics & Health Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                status.status === 'CONNECTED'
                  ? 'bg-emerald-100 text-emerald-600'
                  : status.status === 'SCAN_QR'
                  ? 'bg-blue-100 text-blue-600 animate-pulse'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Connection Status
              </span>
              <span
                className={`text-base font-black ${
                  status.status === 'CONNECTED'
                    ? 'text-emerald-600'
                    : status.status === 'SCAN_QR'
                    ? 'text-blue-600'
                    : 'text-slate-700'
                }`}
              >
                {status.status === 'CONNECTED'
                  ? 'Active & Linked'
                  : status.status === 'SCAN_QR'
                  ? 'Waiting for Scan'
                  : status.status === 'CONNECTING'
                  ? 'Connecting...'
                  : 'Disconnected'}
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Messages Received
              </span>
              <span className="text-xl font-black text-slate-900">{status.totalReceived || 0}</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                AI Replies Dispatched
              </span>
              <span className="text-xl font-black text-slate-900">{status.totalReplies || 0}</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                AI Bot Automation
              </span>
              <span className={`text-base font-black ${status.isBotEnabled ? 'text-emerald-600' : 'text-slate-400'}`}>
                {status.isBotEnabled ? 'ENABLED (24/7)' : 'PAUSED'}
              </span>
            </div>
          </div>
        </div>

        {/* Main Connection Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: QR Scan or Connected Device Details */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-blue-600" />
                  <span>WhatsApp Linked Device Manager</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Connect one WhatsApp phone as the official AI conversational assistant for IDEAL COACHING CENTRE
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleToggleBot}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 border ${
                    status.isBotEnabled
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-slate-100 text-slate-600 border-slate-300'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{status.isBotEnabled ? 'Bot: Active' : 'Bot: Paused'}</span>
                </button>

                <button
                  onClick={fetchStatus}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition border border-slate-200"
                  title="Refresh Status"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Connection State View */}
            {status.status === 'CONNECTED' ? (
              /* Connected State Card */
              <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                      Device Connected Successfully
                    </span>
                    <h4 className="text-lg font-black text-slate-900">
                      +{status.connectedPhone || '919771350910'}
                    </h4>
                    <span className="text-xs text-slate-600 font-medium">
                      Display Name: {status.connectedName || 'IDEAL COACHING CENTRE'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
                  <div className="bg-white p-3 rounded-xl border border-emerald-200/80">
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                      Last Connected Time
                    </span>
                    <span className="font-bold text-slate-800">
                      {status.lastConnectedAt
                        ? new Date(status.lastConnectedAt).toLocaleString('en-IN')
                        : 'Just now'}
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-emerald-200/80">
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                      Session Persistence
                    </span>
                    <span className="font-bold text-emerald-700 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Encrypted at Rest
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex items-center space-x-3">
                  <button
                    onClick={handleDisconnect}
                    disabled={loading}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition shadow-sm"
                  >
                    Disconnect WhatsApp
                  </button>
                  <button
                    onClick={handleConnect}
                    disabled={loading}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                  >
                    Reconnect Session
                  </button>
                </div>
              </div>
            ) : status.status === 'SCAN_QR' && status.qrCodeDataUrl ? (
              /* QR Code Scan View */
              <div className="flex flex-col md:flex-row items-center gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="bg-white p-4 rounded-2xl border-2 border-blue-500 shadow-md flex-shrink-0 text-center">
                  <img
                    src={status.qrCodeDataUrl}
                    alt="Scan WhatsApp QR Code"
                    className="w-56 h-56 object-contain mx-auto"
                  />
                  <div className="mt-2 flex items-center justify-center space-x-1.5 text-[11px] font-bold text-blue-700">
                    <Clock className="w-3.5 h-3.5 animate-spin" />
                    <span>Auto-refreshes every 45s</span>
                  </div>
                </div>

                <div className="space-y-3 flex-1 text-xs text-slate-700">
                  <h4 className="text-sm font-black text-slate-900">
                    How to Link Official WhatsApp Account:
                  </h4>
                  <ol className="list-decimal pl-5 space-y-1.5 text-slate-600 leading-relaxed">
                    <li>Open WhatsApp on the coaching director/reception phone.</li>
                    <li>Tap <strong>Settings</strong> (or 3 dots on top right) → <strong>Linked Devices</strong>.</li>
                    <li>Tap <strong>Link a Device</strong>.</li>
                    <li>Point your camera at this QR code to scan.</li>
                  </ol>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 text-[11px] font-medium">
                    ⚡ Once scanned, this page will automatically change to <strong>Connected</strong>. No page refresh needed.
                  </div>
                </div>
              </div>
            ) : (
              /* Disconnected Prompt */
              <div className="text-center py-10 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-4">
                <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
                  <Smartphone className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-slate-800">
                    No WhatsApp Account Linked
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Connect an official phone number to activate instant automated AI replies for BSEB & JAC syllabus, admission enquiries, and student support.
                  </p>
                </div>
                <button
                  onClick={handleConnect}
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md transition inline-flex items-center space-x-2"
                >
                  <QrCode className="w-4 h-4" />
                  <span>{loading ? 'Initializing Baileys...' : 'Connect WhatsApp & Generate QR'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Account Linking Token Generator */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-500" />
                <span>Account Linking Simulator</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Generate secure 5-minute cryptographic tokens to test linking WhatsApp identities to student, teacher, or admin roles.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Target Role</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['student', 'teacher', 'admin'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setTokenRole(r)}
                      className={`py-2 text-center rounded-xl font-bold uppercase text-[10px] border transition ${
                        tokenRole === r
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerateLinkToken}
                disabled={tokenLoading}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition flex items-center justify-center space-x-2"
              >
                <span>{tokenLoading ? 'Generating...' : 'Generate 5-Minute Link Code'}</span>
              </button>

              {generatedToken && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl space-y-2">
                  <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                    Active Linking Command (Valid for 5 Mins)
                  </span>
                  <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-blue-200">
                    <span className="font-mono font-bold text-blue-900 text-base select-all">
                      #LINK {generatedToken}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyToken}
                      className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                      title="Copy Token"
                    >
                      {copiedToken ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Send this exact text to the connected WhatsApp bot from your mobile to link your identity.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-2 text-xs text-slate-600">
              <span className="font-bold text-slate-800 block text-[11px]">Identity Protection Rules:</span>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-500">
                <li>Zero access to student results or fee records without verified token linking.</li>
                <li>Public visitors receive only published course fees & syllabus details.</li>
                <li>Tokens self-destruct upon single use or after 5 minutes.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Sample Conversations / Inquiries Handled */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Supported Query Types & Intents</h3>
              <p className="text-xs text-slate-500">
                Automated NLP handling in English, Hindi, and Hinglish with zero fake data invention
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-bold text-blue-700 block text-xs">1. Public Visitor Queries</span>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                "What is Class 10 fee?", "BSEB or JAC batch timings?", "Admission kaise le?", " बड़े सर का नंबर?"
              </p>
              <span className="text-[10px] text-slate-400 block font-semibold">Response: Real course prices & official UPI VPA.</span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
              <span className="font-bold text-emerald-800 block text-xs">2. Linked Student Queries</span>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                "When is my next live class?", "Mera payment status?", "Sunday test marks dikhao", "Class 10 notes"
              </p>
              <span className="text-[10px] text-emerald-700 block font-semibold">Response: Verified personal records from student database.</span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
              <span className="font-bold text-amber-800 block text-xs">3. Linked Admin Queries</span>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                "Total active students", "Pending payment requests", "Today's scheduled classes"
              </p>
              <span className="text-[10px] text-amber-700 block font-semibold">Response: Institute administrative KPI summary.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
