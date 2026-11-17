'use client';

import React, { useState } from 'react';
import {
  MessageCircle,
  X,
  Send,
  CheckCheck,
  Sparkles,
  Phone,
  MapPin,
  BookOpen,
  Bell
} from 'lucide-react';
import { useEscapeKey } from '@/lib/useScrollLock';

interface WhatsAppFloatingWidgetProps {
  whatsappNumber?: string;
  coachingName?: string;
  directorName?: string;
}

export default function WhatsAppFloatingWidget({
  whatsappNumber = '+919771350910',
  coachingName = 'IDEAL COACHING CENTRE',
  directorName = 'BADE SIR'
}: WhatsAppFloatingWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [userQuery, setUserQuery] = useState('');

  useEscapeKey(isOpen, () => setIsOpen(false));

  const cleanPhone = whatsappNumber.replace(/[^0-9]/g, '');

  const quickChips = [
    { label: 'Class 10th Aakhiri Waar Batch', query: 'Hello Sir, I want admission in Class 10 Matric Board Batch (B-3).' },
    { label: 'Class 9th Mission 90 Days', query: 'Hello Sir, tell me details of Class 9th Mission 90 Days Batch (B-4).' },
    { label: 'Class 8th Antim Prahar (JAC)', query: 'Hello Sir, please give details of Class 8 Antim Prahar Batch (B-1).' },
    { label: 'Class 7th Gyansagar Batch (JAC)', query: 'Hello Sir, please give details of Class 7 Gyansagar Batch (B-2).' },
    { label: 'Ask a Doubt to Director Sir', query: 'Hello BADE SIR, I have an academic doubt regarding study material.' }
  ];

  const handleStartChat = (customText?: string) => {
    const textToSend = customText || userQuery.trim() || 'Hello IDEAL COACHING CENTRE, I would like to inquire about coaching classes.';
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(textToSend)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setUserQuery('');
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end select-none">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 active:scale-95 cursor-pointer relative ${
            isOpen
              ? 'bg-slate-800 hover:bg-slate-700 rotate-90 ring-4 ring-slate-700/50'
              : 'bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 ring-4 ring-emerald-500/30 hover:scale-105'
          }`}
          title="WhatsApp Helpline & Instant Admission Support"
          aria-label="Open WhatsApp Chat"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <>
              <span className="absolute -inset-1 rounded-full bg-emerald-400/30 animate-ping pointer-events-none" />
              <MessageCircle className="w-7 h-7 text-white fill-white/20" />
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] flex items-center justify-center border-2 border-white shadow-md animate-pulse">
                <Bell className="w-3 h-3 text-slate-950 fill-slate-950" />
              </span>
            </>
          )}
        </button>
      </div>

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:bottom-26 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-base border border-white/30 text-white">
                    ICC
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-emerald-700 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  </span>
                </div>
                <div>
                  <h4 className="font-black text-sm leading-tight flex items-center gap-1.5">
                    <span>{coachingName}</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[9px] font-extrabold uppercase">
                      Official
                    </span>
                  </h4>
                  <p className="text-[11px] text-emerald-100 flex items-center gap-1 mt-0.5">
                    <span>Director: {directorName}</span>
                    <span>•</span>
                    <span className="text-emerald-200 font-bold">Online</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Chat Bubble Area */}
          <div className="p-4 bg-slate-50 space-y-3 max-h-72 overflow-y-auto">
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-xs text-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  Official WhatsApp Desk
                </span>
                <span>Active</span>
              </div>
              <p className="leading-relaxed">
                नमस्ते! 🙏 Welcome to <strong>{coachingName}</strong> (Sarotiya, Mahagama, Godda).
                For Classes 1st to 12th admissions, fees, handwritten notes, or direct counseling with <strong>Director BADE SIR</strong>, tap an option below!
              </p>
              <div className="flex items-center gap-1 pt-1 text-[10px] text-slate-500">
                <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                <span className="truncate">Sarotiya, Mahagama, Godda (JH) 814165</span>
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block px-1">
                Quick Inquiries (1-Click WhatsApp):
              </span>
              <div className="flex flex-col gap-1.5">
                {quickChips.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleStartChat(chip.query)}
                    className="p-2.5 rounded-xl bg-white hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 text-left text-xs font-bold text-slate-700 hover:text-emerald-800 flex items-center justify-between transition-all group cursor-pointer shadow-2xs"
                  >
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition-transform" />
                      <span>{chip.label}</span>
                    </div>
                    <span className="text-emerald-600 text-xs">➜</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Chat Input Form */}
          <div className="p-3 bg-white border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleStartChat();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                placeholder="Type your question..."
                className="flex-1 p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
              />
              <button
                type="submit"
                className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/30 active:scale-95 transition-all cursor-pointer"
                title="Send on WhatsApp"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 px-1">
              <span className="flex items-center gap-1">
                <CheckCheck className="w-3.5 h-3.5 text-emerald-500" /> Verified Support
              </span>
              <a
                href={`tel:${cleanPhone}`}
                className="text-emerald-700 hover:underline font-bold flex items-center gap-1"
              >
                <Phone className="w-3 h-3" /> +91 9771350910
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
