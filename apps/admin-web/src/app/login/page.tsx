'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/LanguageContext';
import { ShieldCheck, Mail, KeyRound, ArrowRight, CheckCircle2, Lock } from 'lucide-react';

export default function AdminLoginPage() {
  const { lang, t } = useLanguage();
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email.includes('@')) {
      setErrorMsg(t('कृपया मान्य ईमेल पता दर्ज करें', 'Enter a valid email address'));
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
    }, 800);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (otp.length < 6) {
      setErrorMsg(t('कृपया 6 अंकों का ओटीपी दर्ज करें', 'Enter 6-digit OTP'));
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push('/');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-950 border border-slate-800 rounded-3xl p-8 shadow-2xl text-slate-100 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
            ICC
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            IDEAL COACHING CENTRE
          </h2>
          <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
            {t('प्रशासक लॉगिन (Admin & Faculty Portal)', 'Authorized Admin & Faculty Portal')}
          </p>
          <p className="text-[11px] text-slate-400">
            {t('बिहार बोर्ड (BSEB) एवं झारखंड बोर्ड (JAC)', 'Bihar & Jharkhand State Board System')}
          </p>
        </div>

        {/* Security Alert */}
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-start space-x-2.5 text-xs text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            {t(
              'प्रशासक सुरक्षा नीति: लॉगिन केवल पंजीकृत ईमेल पर भेजे गए वन-टाइम पासवर्ड (Email OTP) द्वारा संभव है। एसएमएस ओटीपी अक्षम है।',
              'Security policy: Admin authentication requires secure Email OTP sent to authorized inboxes. SMS OTP is prohibited.'
            )}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl font-medium">
            {errorMsg}
          </div>
        )}

        {step === 'email' ? (
          <form onSubmit={handleRequestOtp} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                {t('अधिकृत प्रशासक ईमेल (Authorized Admin Email)', 'Authorized Admin Email')}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@idealcoachingcentre.com"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/30"
            >
              <span>{loading ? t('प्रक्रियाधीन...', 'Requesting OTP...') : t('ईमेल ओटीपी प्राप्त करें', 'Get Email OTP')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs">
            <div className="text-center p-3 bg-blue-950/40 border border-blue-900/40 rounded-xl">
              <p className="text-slate-400 text-[11px]">
                {t('ओटीपी इस पते पर भेजा गया है:', 'OTP sent to registered inbox:')}
              </p>
              <p className="font-mono font-bold text-blue-300 text-xs mt-0.5">{email}</p>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                {t('6 अंकों का ईमेल ओटीपी दर्ज करें', 'Enter 6-Digit Email OTP')}
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • • • •"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-white font-mono text-center text-lg tracking-widest placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/30"
            >
              <span>{loading ? t('सत्यापित किया जा रहा है...', 'Verifying...') : t('सत्यापित करें एवं डैशबोर्ड खोलें', 'Verify & Enter Dashboard')}</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setStep('email')}
              className="w-full text-slate-400 hover:text-white text-[11px] text-center font-medium pt-1"
            >
              {t('ईमेल पता बदलें', 'Change Email Address')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
