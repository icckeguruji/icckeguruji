'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  X,
  Send,
  Sparkles,
  ArrowRight,
  BookOpen,
  GraduationCap,
  RotateCcw,
} from 'lucide-react';
import Link from 'next/link';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  time?: string;
}

export default function GrokAICounselorWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'Namaste! Welcome to IDEAL COACHING CENTRE (ICC). I am your AI Counselor powered by **Grok AI**.\n\nAsk me anything about BSEB & JAC Board courses, fees, batch timings, UPI enrollment, or guidance from Director **BADE SIR**!',
      time: 'Just now',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (customPrompt?: string) => {
    const text = customPrompt || input.trim();
    if (!text || loading) return;

    const userMsg: Message = {
      role: 'user',
      content: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/grok', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskType: 'counselor',
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();
      if (data.success && data.text) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content:
              'For complete course admission assistance, please visit our Courses page or contact Director BADE SIR at +91 9771350910.',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'You can enroll in BSEB/JAC courses directly on our Courses tab or connect with Director BADE SIR at +91 9771350910.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickChips = [
    'What are the course fees?',
    'How to enroll via UPI?',
    'BSEB Class 10 Toppers Batch details',
    'Director BADE SIR contact',
  ];

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-24 right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group flex items-center space-x-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white px-4 py-3 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-blue-400/40"
          aria-label="Open AI Counselor"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
            </span>
          </div>
          <span className="font-bold text-xs hidden sm:inline tracking-wide">
            Ask Grok AI 🤖
          </span>
        </button>
      </div>

      {/* Floating Chat Modal Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[92vw] sm:w-[400px] h-[540px] max-h-[80vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Bot className="w-5 h-5 text-blue-200" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h3 className="font-bold text-sm text-white">ICC AI Counselor</h3>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-500/40 text-blue-100 border border-indigo-400/30">
                    Grok AI
                  </span>
                </div>
                <div className="flex items-center space-x-1.5 text-[11px] text-blue-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Instant 24/7 Academic Support</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Info Bar */}
          <div className="bg-blue-50/80 px-3.5 py-2 border-b border-blue-100/60 flex items-center justify-between text-[11px] text-blue-900">
            <span className="flex items-center gap-1 font-medium">
              <GraduationCap className="w-3.5 h-3.5 text-blue-600" /> BSEB & JAC Specialization
            </span>
            <Link
              href="/courses"
              onClick={() => setIsOpen(false)}
              className="font-bold text-blue-700 hover:text-blue-900 flex items-center gap-0.5 underline"
            >
              View Courses <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/60 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${
                  m.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed shadow-sm whitespace-pre-line ${
                    m.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none'
                  }`}
                >
                  {m.content}
                </div>
                {m.time && (
                  <span className="text-[10px] text-slate-400 px-1 mt-1">
                    {m.time}
                  </span>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center space-x-2 bg-white border border-slate-200 text-slate-500 rounded-2xl px-3.5 py-2.5 w-fit rounded-bl-none">
                <Sparkles className="w-3.5 h-3.5 animate-spin text-blue-600" />
                <span className="text-[11px] font-medium">Grok AI is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="p-2.5 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto no-scrollbar">
            {quickChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip)}
                disabled={loading}
                className="whitespace-nowrap bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 px-2.5 py-1 rounded-full text-[11px] font-medium transition border border-slate-200/80"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
              placeholder="Ask Grok AI about admissions, syllabus, fees..."
              disabled={loading}
              className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl transition shadow"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
