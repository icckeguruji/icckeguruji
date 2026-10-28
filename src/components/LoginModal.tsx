'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  ShieldCheck,
  ExternalLink,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { User as UserType } from '@/types';
import { authenticateUser } from '@/lib/storage';
import ForgotPasswordModal from '@/components/ForgotPasswordModal';

interface LoginModalProps {
  onClose: () => void;
  onLoginSuccess: (user: UserType) => void;
}

export default function LoginModal({ onClose, onLoginSuccess }: LoginModalProps) {
  const router = useRouter();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    setTimeout(() => {
      const res = authenticateUser(identifier, password);
      if (res.success && res.user) {
        const isGuruji = res.user.role === 'admin';
        setSuccess(
          isGuruji
            ? 'Welcome Guruji! Opening Admin Dashboard...'
            : `Welcome, ${res.user.name}!`
        );
        onLoginSuccess(res.user);

        setTimeout(() => {
          onClose();
          if (res.redirectTo) {
            router.push(res.redirectTo);
          }
        }, 500);
      } else {
        setError(res.error || 'Invalid Email ID or Password.');
        setLoading(false);
      }
    }, 300);
  };

  const handleQuickFill = (type: 'rahul' | 'priya' | 'admin') => {
    setError('');
    if (type === 'rahul') {
      setIdentifier('rahul.student@gmail.com');
      setPassword('student123');
    } else if (type === 'priya') {
      setIdentifier('priya.sharma99@gmail.com');
      setPassword('student123');
    } else {
      setIdentifier('admin@icckeguruji.com');
      setPassword('admin123');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-6 text-slate-800 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <LogIn className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-black text-lg text-white">Login • ICC KE GURUJI</h3>
              <p className="text-xs text-blue-100 font-medium">Automatic Student &amp; Admin Access</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 transition-colors text-white"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="p-3 mb-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 animate-pulse" />
              <span>{success}</span>
            </div>
          )}

          {/* Unified Single Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
            {/* Email / Phone Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email ID or Mobile Number *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. rahul.student@gmail.com or 9876543210"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex justify-end mt-1">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* 1-Click Fast Demo Fill */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center mb-2.5">
              ⚡ 1-Click Quick Demo Login
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => handleQuickFill('rahul')}
                className="p-2 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-xl text-left transition-colors"
              >
                <div className="text-blue-700 font-bold truncate">Rahul</div>
                <div className="text-[10px] text-slate-500">Student</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('priya')}
                className="p-2 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-xl text-left transition-colors"
              >
                <div className="text-blue-700 font-bold truncate">Priya</div>
                <div className="text-[10px] text-slate-500">Student</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('admin')}
                className="p-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl text-left transition-colors"
              >
                <div className="text-purple-800 font-bold truncate">Guruji</div>
                <div className="text-[10px] text-purple-600">Admin</div>
              </button>
            </div>
          </div>

          {/* Full page link */}
          <div className="mt-4 text-center">
            <Link
              href="/login"
              onClick={onClose}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline"
            >
              <span>Open Fullscreen Login Page</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <ForgotPasswordModal
          initialEmail={identifier.includes('@') ? identifier : ''}
          onClose={() => setShowForgotModal(false)}
          onSuccessReset={(user) => {
            onLoginSuccess(user);
            onClose();
          }}
        />
      )}
    </div>
  );
}
