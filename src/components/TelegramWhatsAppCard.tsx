'use client';

import React from 'react';
import { Send, MessageSquare, Bell, CheckCircle2, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { CoachingConfig } from '@/types';

interface TelegramWhatsAppCardProps {
  config: CoachingConfig;
  courseTitle: string;
}

export default function TelegramWhatsAppCard({ config, courseTitle }: TelegramWhatsAppCardProps) {
  const cleanPhone = config.whatsappNumber.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Namaste Sir! Maine "${courseTitle}" course enroll kiya hai aur mujhe guidance chahiye.`)}`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* Telegram Card */}
      <div className="p-6 rounded-3xl bg-sky-50/70 border border-sky-200 text-slate-800 flex flex-col justify-between shadow-xs">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-sky-500 text-white flex items-center justify-center shadow-sm">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-base">Official Telegram Community</h4>
                <p className="text-xs text-sky-700 font-semibold">Paid Members Only • Automated Alerts</p>
              </div>
            </div>
            <span className="text-[10px] bg-sky-200/80 text-sky-900 px-2.5 py-0.5 rounded-full font-bold">
              Bot Active
            </span>
          </div>

          <p className="text-xs text-slate-600 mb-4 leading-relaxed">
            Har live class shuru hone se 10 minute pehle Telegram bot aapko direct notification bhejega aur naye PDF notes group me share honge.
          </p>

          <div className="space-y-2 text-xs text-slate-700 bg-white p-3.5 rounded-2xl border border-sky-100 mb-5 shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Live Class alert 10 min pehle</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Direct PDF notes broadcast</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Telegram Bot: <strong>@{config.telegramBotUsername}</strong></span>
            </div>
          </div>
        </div>

        <a
          href={config.telegramGroupLink}
          target="_blank"
          rel="noreferrer"
          className="w-full py-3 px-4 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
        >
          <span>Join Paid Telegram Community</span>
          <ArrowUpRight className="w-4 h-4" />
        </a>
      </div>

      {/* WhatsApp Support Card */}
      <div className="p-6 rounded-3xl bg-emerald-50/70 border border-emerald-200 text-slate-800 flex flex-col justify-between shadow-xs">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-base">WhatsApp Instant Helpline</h4>
                <p className="text-xs text-emerald-800 font-semibold">Direct Guruji &amp; Admin Support</p>
              </div>
            </div>
            <span className="text-[10px] bg-emerald-200/80 text-emerald-900 px-2.5 py-0.5 rounded-full font-bold">
              Direct Chat
            </span>
          </div>

          <p className="text-xs text-slate-600 mb-4 leading-relaxed">
            Agar payment verification ya live class link mein koi bhi samasya aaye, toh hamare WhatsApp helpline par turant message karein.
          </p>

          <div className="space-y-2 text-xs text-slate-700 bg-white p-3.5 rounded-2xl border border-emerald-100 mb-5 shadow-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Verified Coaching Account: <strong>{config.merchantName}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Official Phone: <strong>{config.whatsappNumber}</strong></span>
            </div>
          </div>
        </div>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
        >
          <span>Chat on WhatsApp Helpline</span>
          <ArrowUpRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
