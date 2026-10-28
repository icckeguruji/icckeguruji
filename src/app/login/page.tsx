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
  ArrowLeft,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import Logo from '@/components/Logo';
import { authenticateUser, getStoredData } from '@/lib/storage';
import ForgotPasswordModal from '@/components/ForgotPasswordModal';

export default function LoginPage() {
  const router = useRouter();
  const [config] = useState(() => getStoredData().config);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    setTimeout(() => {
      const res = authenticateUser(identifier, password);

      if (res.success && res.user) {
        const isGuruji = res.user.role === 'admin';
        const isTeacher = res.user.role === 'teacher';
        setSuccess(
          isGuruji
            ? `Welcome Guruji! Opening Admin Dashboard...`
            : isTeacher
            ? `Welcome ${res.user.name}! Opening Faculty Portal...`
            : `Welcome, ${res.user.name}! Opening your classroom...`
        );

        setTimeout(() => {
          router.push(res.redirectTo || (isGuruji ? '/admin' : isTeacher ? '/teacher' : '/course/course-1'));
        }, 600);
      } else {
        setError(res.error || 'Invalid Email ID, Faculty ID, or Password.');
        setLoading(false);
      }
    }, 350);
  };

  const handleQuickFill = (type: 'rahul' | 'priya' | 'admin' | 'teacher') => {
    setError('');
    if (type === 'rahul') {
      setIdentifier('rahul.student@gmail.com');
      setPassword('student123');
    } else if (type === 'priya') {
      setIdentifier('priya.sharma99@gmail.com');
      setPassword('student123');
    } else if (type === 'teacher') {
      setIdentifier('ICC-T-101');
      setPassword('teacher123');
    } else {
      setIdentifier('admin@icckeguruji.com');
      setPassword('admin123');
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 flex flex-col justify-between selection:bg-blue-600 selection:text-white px-4 py-6 sm:py-10">
      {/* Top Header Link */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between pb-4">
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

      {/* Main Single Unified Login Card */}
      <div className="max-w-md w-full mx-auto bg-white border border-slate-200/90 rounded-3xl shadow-xl shadow-blue-500/5 p-6 sm:p-8 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="flex justify-center mb-2">
            <Logo size="md" logoUrl={config?.logoUrl} />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Sign In to ICC KE GURUJI
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
            Students and Admin can enter their registered Email or Mobile and Password to sign in to their dedicated portal.
          </p>
        </div>

        {/* Error / Success Alerts */}
        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 animate-pulse" />
            <span>{success}</span>
          </div>
        )}

        {/* Single Unified Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          {/* Email / Mobile Identifier */}
          <div>
            <label className="block text-slate-700 font-bold mb-1.5 text-xs">
              Faculty ID, Mobile Number or Email *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. ICC-T-101 or 9934215013 or student@gmail.com"
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
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Remember me</span>
            </label>
            <button
              type="button"
              className="text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
              onClick={() => setShowForgotModal(true)}
            >
              Forgot Password?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 shadow-lg shadow-blue-500/25 hover:from-blue-700 hover:to-violet-700 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in...
              </span>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In to My Account</span>
              </>
            )}
          </button>
        </form>

        {/* 1-Click Demo Fill Pills */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 text-center">
            ⚡ Quick 1-Click Demo Login Fill
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickFill('rahul')}
              className="p-2 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 text-slate-700 font-semibold text-center transition-colors flex flex-col items-center gap-0.5"
            >
              <span className="font-bold">Rahul (Student)</span>
              <span className="text-[10px] text-slate-400">Class 12</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('priya')}
              className="p-2 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 text-slate-700 font-semibold text-center transition-colors flex flex-col items-center gap-0.5"
            >
              <span className="font-bold">Priya (Student)</span>
              <span className="text-[10px] text-slate-400">Class 10</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('teacher')}
              className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 font-semibold text-center transition-colors flex flex-col items-center gap-0.5"
            >
              <span className="font-bold">Alok Sir (Faculty)</span>
              <span className="text-[10px] text-indigo-600">Physics Mentor</span>
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
          <span>Encrypted Session • Automatic Role Detection</span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="max-w-md w-full mx-auto text-center pt-6 text-xs text-slate-500 font-medium space-y-1">
        <div>© 2026 ICC KE GURUJI. All rights reserved.</div>
        <div className="text-[11px] text-slate-400">
          Developed by <strong className="text-slate-700">Muzaffar Iqbal Ishaati</strong> •{' '}
          <a href="tel:9934215013" className="hover:text-blue-600 font-mono">+91 9934215013</a>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <ForgotPasswordModal
          initialEmail={identifier.includes('@') ? identifier : ''}
          onClose={() => setShowForgotModal(false)}
          onSuccessReset={(user) => {
            setSuccess(`Welcome, ${user.name}! Password updated successfully.`);
            setTimeout(() => {
              router.push(user.role === 'admin' ? '/admin' : '/course/course-1');
            }, 600);
          }}
        />
      )}
    </div>
  );
}
