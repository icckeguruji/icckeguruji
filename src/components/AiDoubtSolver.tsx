'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  User,
  HelpCircle,
  Loader2,
  Copy,
  Check,
  RotateCcw,
  Zap,
  BookOpen
} from 'lucide-react';
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
      text: `Hello ${studentName}! I am your 24/7 AI Doubt Assistant for **ICC KE GURUJI**. Feel free to ask any question, formula clarification, numerical problem, or revision query related to "${course.title}"!`,
      time: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    "Explain Coulomb's Law with formula",
    "Important applications of Gauss's Law",
    "Derivation of Electric Field on Dipole",
    "Shortcuts for numerical problem solving",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `m-reset-${Date.now()}`,
        sender: 'ai',
        text: `Chat reset. What would you like to study or clarify next, ${studentName}?`,
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

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
      const aiReply = data.answer || 'I could not generate an answer right now. Please try asking again.';

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
          text: 'Network error. Please check your internet connection and try again.',
          time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[560px] bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-lg">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-700 px-5 py-4 flex items-center justify-between text-white shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/20 border border-white/20 flex items-center justify-center shadow-xs">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-white text-sm sm:text-base">
                ICC KE GURUJI • 24/7 AI Doubt Solver
              </h3>
              <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-400 text-slate-950 px-2 py-0.5 rounded-full font-black">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />
                Online
              </span>
            </div>
            <p className="text-[11px] text-blue-100 font-medium">
              Powered by Google Gemini 2.0 Flash • Board &amp; JEE/NEET Level Explanations
            </p>
          </div>
        </div>

        <button
          onClick={handleResetChat}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all text-xs flex items-center gap-1 active:scale-95"
          title="Reset conversation"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="hidden sm:inline font-bold">Clear Chat</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/70">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-3 ${m.sender === 'student' ? 'flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 text-xs font-bold shadow-xs ${
                m.sender === 'student'
                  ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white'
                  : 'bg-white text-indigo-700 border border-indigo-200'
              }`}
            >
              {m.sender === 'student' ? (
                <User className="w-4 h-4 text-white" />
              ) : (
                <Bot className="w-5 h-5 text-indigo-600" />
              )}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[85%] rounded-3xl p-4 text-xs sm:text-sm leading-relaxed shadow-xs relative group ${
                m.sender === 'student'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none'
                  : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-none'
              }`}
            >
              <div className="whitespace-pre-wrap font-sans">{m.text}</div>

              <div
                className={`text-[10px] mt-2 flex items-center justify-between font-semibold ${
                  m.sender === 'student' ? 'text-blue-200' : 'text-slate-400'
                }`}
              >
                <span>{m.sender === 'student' ? 'You' : 'AI Guruji'}</span>
                
                <div className="flex items-center gap-2">
                  <span>{m.time}</span>
                  {m.sender === 'ai' && (
                    <button
                      onClick={() => handleCopyMessage(m.id, m.text)}
                      className="opacity-0 group-hover:opacity-100 hover:text-slate-700 transition-opacity p-0.5"
                      title="Copy response"
                    >
                      {copiedId === m.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2.5 text-indigo-700 text-xs py-2.5 px-4 bg-indigo-50 border border-indigo-200 rounded-2xl font-bold w-fit shadow-xs animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
            <span>AI Guruji is formulating a detailed step-by-step solution...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Question Chips */}
      <div className="px-4 py-2.5 bg-white border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
        <span className="text-slate-500 shrink-0 font-extrabold flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5 text-indigo-500" /> Quick Doubts:
        </span>
        {quickPrompts.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="shrink-0 px-3 py-1 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 text-slate-700 font-bold border border-slate-200 transition-all cursor-pointer"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask any physics, chemistry, or math doubt..."
          className="flex-1 bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all font-medium"
        />
        <button
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-40 text-white rounded-2xl transition-all shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer shrink-0"
          aria-label="Send Doubt Query"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
