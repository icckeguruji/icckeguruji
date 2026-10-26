'use client';

import React, { useState } from 'react';
import { Bot, Send, Sparkles, User, HelpCircle, Loader2 } from 'lucide-react';
import { Course } from '@/types';

interface Message {
  id: string;
  sender: 'student' | 'ai';
  text: string;
  time: string;
}

interface AiDoubtSolverProps {
  course: Course;
  studentName: string;
}

export default function AiDoubtSolver({ course, studentName }: AiDoubtSolverProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'ai',
      text: `Hello ${studentName}! I am your 24/7 AI Doubt Assistant for **ICC KE GURUJI**. Feel free to ask any question, formula clarification, or numerical problem related to "${course.title}"!`,
      time: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const quickPrompts = [
    "Explain Coulomb's Law with formula",
    "Important applications of Gauss's Law",
    "Shortcuts for numerical problem solving",
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'student',
      text: textToSend.trim(),
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/doubt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: textToSend,
          courseTitle: course.title,
          subject: course.category,
        }),
      });

      const data = await res.json();
      const aiReply = data.answer || 'Sorry, unable to generate an answer right now. Please try asking again.';

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: aiReply,
          time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (e) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: 'Network error. Please check your internet connection.',
          time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[520px] bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-md">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-4.5 flex items-center justify-between text-white shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h3 className="font-black text-white text-sm sm:text-base flex items-center gap-2">
              ICC KE GURUJI • 24/7 AI Doubt Assistant
              <span className="text-[10px] bg-emerald-400 text-slate-950 px-2 py-0.5 rounded-full font-black">
                Online
              </span>
            </h3>
            <p className="text-[11px] text-blue-100 font-medium">Powered by Google Gemini 1.5 Flash</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4.5 space-y-3.5 bg-slate-50">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-2.5 ${m.sender === 'student' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold shadow-xs ${
                m.sender === 'student'
                  ? 'bg-blue-600 text-white'
                  : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
              }`}
            >
              {m.sender === 'student' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-indigo-600" />}
            </div>

            <div
              className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                m.sender === 'student'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none whitespace-pre-wrap'
              }`}
            >
              <div>{m.text}</div>
              <div
                className={`text-[10px] mt-1.5 text-right font-medium ${
                  m.sender === 'student' ? 'text-blue-200' : 'text-slate-400'
                }`}
              >
                {m.time}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-indigo-600 text-xs py-2 bg-indigo-50 p-3 rounded-xl border border-indigo-100 font-medium w-fit">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Thinking and formulating solution...</span>
          </div>
        )}
      </div>

      {/* Suggested chips */}
      <div className="px-4 py-2.5 bg-white border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
        <span className="text-slate-400 shrink-0 font-bold flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" /> Quick:
        </span>
        {quickPrompts.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="shrink-0 px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold border border-slate-200 transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type your question or doubt here..."
          className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all"
        />
        <button
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl transition-all shadow-md shadow-blue-500/20"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
