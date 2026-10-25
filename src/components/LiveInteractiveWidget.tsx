'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  CheckCircle,
  Clock,
  MessageSquare,
  Sparkles,
  Send,
  ThumbsUp,
  Flame,
  Award,
  Bookmark
} from 'lucide-react';
import { Lesson, User } from '@/types';

interface LiveInteractiveWidgetProps {
  lesson: Lesson;
  currentUser: User;
}

export default function LiveInteractiveWidget({ lesson, currentUser }: LiveInteractiveWidgetProps) {
  const [selectedPollOption, setSelectedPollOption] = useState<number | null>(null);
  const [pollVoted, setPollVoted] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { id: '1', name: 'Aman Patel', text: 'Guruji numerical 2 ka trick mindblowing tha! 🙏', time: '11:04 AM' },
    { id: '2', name: 'Neha Sharma', text: 'Sign convention me jo left to right rule bataya, ab doubt clear hai sir.', time: '11:06 AM' },
    { id: '3', name: 'Rohan Mehra', text: 'Option A 100% correct hai!', time: '11:08 AM' },
  ]);
  const [newMsg, setNewMsg] = useState('');
  const [reactionCount, setReactionCount] = useState(48);

  const pollQuestion = {
    question: "Guruji's In-Class Live Check: Electric field inside a uniformly charged conducting spherical shell is?",
    options: [
      { text: "Zero everywhere inside (E = 0)", percent: 79, isCorrect: true },
      { text: "kq / r²", percent: 12, isCorrect: false },
      { text: "Infinite at the center", percent: 6, isCorrect: false },
      { text: "Depends on dielectric constant", percent: 3, isCorrect: false }
    ]
  };

  const handleVote = (idx: number) => {
    setSelectedPollOption(idx);
    setPollVoted(true);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim()) return;

    const msg = {
      id: Date.now().toString(),
      name: currentUser.name || 'Rahul Kumar',
      text: newMsg.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages((prev) => [...prev, msg]);
    setNewMsg('');
  };

  const handleReaction = () => {
    setReactionCount((prev) => prev + 1);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-4">
      {/* Left: Live Teacher Poll & Key Timestamps */}
      <div className="lg:col-span-7 space-y-4">
        {/* Live Guruji In-Class Poll */}
        <div className="bg-gradient-to-br from-amber-500/10 via-white to-blue-500/10 rounded-3xl p-5 sm:p-6 border border-amber-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              LIVE CLASS IN-SESSION POLL
            </span>
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              Guruji Check
            </span>
          </div>

          <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug">
            {pollQuestion.question}
          </h3>

          {/* Options */}
          <div className="space-y-2.5">
            {pollQuestion.options.map((opt, idx) => {
              const isSelected = selectedPollOption === idx;

              return (
                <div
                  key={idx}
                  onClick={() => !pollVoted && handleVote(idx)}
                  className={`relative p-3.5 rounded-2xl border transition-all cursor-pointer overflow-hidden ${
                    isSelected
                      ? opt.isCorrect
                        ? 'border-emerald-500 bg-emerald-50/80'
                        : 'border-red-400 bg-red-50/70'
                      : pollVoted
                      ? opt.isCorrect
                        ? 'border-emerald-300 bg-emerald-50/30'
                        : 'border-slate-200 bg-white'
                      : 'border-slate-200 bg-white hover:border-blue-400 hover:shadow-xs'
                  }`}
                >
                  {/* Progress bar background if voted */}
                  {pollVoted && (
                    <div
                      className={`absolute top-0 bottom-0 left-0 transition-all duration-700 opacity-20 ${
                        opt.isCorrect ? 'bg-emerald-600' : 'bg-slate-400'
                      }`}
                      style={{ width: `${opt.percent}%` }}
                    />
                  )}

                  <div className="relative z-10 flex items-center justify-between gap-3 text-xs sm:text-sm">
                    <span className="font-bold text-slate-800">
                      {String.fromCharCode(65 + idx)}. {opt.text}
                    </span>
                    {pollVoted && (
                      <span
                        className={`font-black shrink-0 ${
                          opt.isCorrect ? 'text-emerald-700' : 'text-slate-500'
                        }`}
                      >
                        {opt.percent}% {opt.isCorrect && '✓'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {pollVoted && (
            <div className="p-3 rounded-xl bg-emerald-100/70 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
              Your vote has been recorded! 79% of students in the batch answered correctly.
            </div>
          )}
        </div>

        {/* Timestamps & Key Moments */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <Bookmark className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Key Chapter Moments &amp; Timestamps
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200/80 cursor-pointer transition-colors flex items-center justify-between">
              <span className="font-semibold text-slate-800">01:45 • Core Definition &amp; Formula</span>
              <span className="font-mono text-blue-600 font-bold">01:45</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200/80 cursor-pointer transition-colors flex items-center justify-between">
              <span className="font-semibold text-slate-800">12:30 • Derivation on Whiteboard</span>
              <span className="font-mono text-blue-600 font-bold">12:30</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200/80 cursor-pointer transition-colors flex items-center justify-between">
              <span className="font-semibold text-slate-800">24:15 • NCERT Exemplar Problem #3</span>
              <span className="font-mono text-blue-600 font-bold">24:15</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200/80 cursor-pointer transition-colors flex items-center justify-between">
              <span className="font-semibold text-slate-800">38:00 • Board Exam 5-Marker Hint</span>
              <span className="font-mono text-blue-600 font-bold">38:00</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Live Batch Chat Stream */}
      <div className="lg:col-span-5 bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between h-[420px]">
        {/* Chat Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Batch Live Chat
            </span>
          </div>

          <button
            onClick={handleReaction}
            className="px-2.5 py-1 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-1 transition-all"
          >
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            {reactionCount} Likes
          </button>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1 text-xs">
          {chatMessages.map((m) => (
            <div key={m.id} className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="font-extrabold text-blue-700">{m.name}</span>
                <span className="text-[10px] text-slate-400">{m.time}</span>
              </div>
              <p className="text-slate-800 leading-snug">{m.text}</p>
            </div>
          ))}
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="pt-2 border-t border-slate-100 flex items-center gap-2">
          <input
            type="text"
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            placeholder="Type a reaction or question..."
            className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-colors shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
