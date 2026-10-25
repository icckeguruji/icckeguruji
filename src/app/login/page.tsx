'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  UserCheck
} from 'lucide-react';
import Logo from '@/components/Logo';
import { authenticateUser } from '@/lib/storage';

export default function LoginPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'student' | 'admin'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    setTimeout(() => {
      const res = authenticateUser(email, password);

      if (res.success && res.user) {
        setSuccess(`Swagat hai, ${res.user.name}! Logging you in...`);
        setTimeout(() => {
          if (res.user?.role === 'admin') {
            router.push('/admin');
          } else {
            router.push('/course/course-1');
          }
        }, 600);
      } else {
        setError(res.error || 'Email ya Password galat hai.');
        setLoading(false);
      }
    }, 400);
  };

  const handleQuickFill = (type: 'student-rahul' | 'student-priya' | 'admin') => {
    setError('');
    if (type === 'student-rahul') {
      setActiveTab('student');
      setEmail('rahul.student@gmail.com');
      setPassword('student123');
    } else if (type === 'student-priya') {
      setActiveTab('student');
      setEmail('priya.sharma99@gmail.com');
      setPassword('student123');
    } else {
      setActiveTab('admin');
      setEmail('admin@icckeguruji.com');
      setPassword('admin123');
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 flex flex-col justify-between selection:bg-blue-600 selection:text-white px-4 py-6 sm:py-10">
      {/* Top Header Link */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between pb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors p-2 rounded-xl hover:bg-white/80"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
        <div className="text-[11px] font-bold text-slate-400 font-mono">
          SSL SECURED 256-BIT
        </div>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto bg-white border border-slate-200/90 rounded-3xl shadow-xl shadow-blue-500/5 p-6 sm:p-8 relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="flex justify-center mb-2">
            <Logo size="md" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {activeTab === 'student' ? 'Student Portal Login' : 'Guruji Admin Console'}
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            {activeTab === 'student'
              ? 'Apne live lectures, notes aur AI Doubt Guruji access karne ke liye login karein.'
              : 'Coaching batches, payments aur CMS manage karne ke liye Guruji credentials use karein.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl mb-6 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('student');
              setError('');
            }}
            className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'student'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Student Login</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('admin');
              setError('');
            }}
            className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'admin'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Guruji Admin</span>
          </button>
        </div>

        {/* Error / Success Alerts */}
        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 animate-pulse" />
            <span>{success}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          {/* Email Input */}
          <div>
            <label className="block text-slate-700 font-bold mb-1.5 text-xs">
              Email ID *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={activeTab === 'student' ? 'e.g. rahul.student@gmail.com' : 'admin@icckeguruji.com'}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 text-xs sm:text-sm focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 focus:outline-none font-medium transition-all"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-slate-700 font-bold text-xs">
                Password *
              </label>
              <span className="text-[11px] text-slate-400 font-normal">
                Min 6 characters
              </span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 text-xs sm:text-sm focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 focus:outline-none font-medium transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember me & Helper info */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 rounded-sm"
              />
              <span>Remember me</span>
            </label>
            <span className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer" onClick={() => alert('Demo Accounts ke passwords: "student123" ya "admin123" hain.')}>
              Forgot Password?
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 rounded-2xl font-bold text-xs sm:text-sm text-white shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] ${
              activeTab === 'student'
                ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 shadow-blue-500/25 hover:from-blue-700 hover:to-violet-700'
                : 'bg-gradient-to-r from-purple-600 to-indigo-700 shadow-purple-500/25 hover:from-purple-700 hover:to-indigo-800'
            }`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Verifying Credentials...
              </span>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>{activeTab === 'student' ? 'Sign In to Classroom' : 'Access Admin Console'}</span>
              </>
            )}
          </button>
        </form>

        {/* 1-Click Demo Logins Pills */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 text-center">
            ⚡ 1-Click Quick Demo Fill
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickFill('student-rahul')}
              className="p-2 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 text-slate-700 font-semibold text-center transition-colors flex flex-col items-center gap-0.5"
            >
              <span className="font-bold">Rahul (Student)</span>
              <span className="text-[10px] text-slate-400">Class 12 Physics</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('student-priya')}
              className="p-2 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 text-slate-700 font-semibold text-center transition-colors flex flex-col items-center gap-0.5"
            >
              <span className="font-bold">Priya (Student)</span>
              <span className="text-[10px] text-slate-400">Class 10 Board</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('admin')}
              className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 font-semibold text-center transition-colors flex flex-col items-center gap-0.5"
            >
              <span className="font-bold">Guruji (Admin)</span>
              <span className="text-[10px] text-purple-600">Full Access</span>
            </button>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-5 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Encrypted Session • Zero Data Sharing</span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="max-w-md w-full mx-auto text-center pt-6 text-xs text-slate-400">
        © 2026 ICC KE GURUJI. All rights reserved.
      </div>
    </div>
  );
}
