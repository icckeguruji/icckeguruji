'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/LanguageContext';
import { supabase } from '@/lib/supabase';
import {
  ShieldCheck,
  Mail,
  Phone,
  KeyRound,
  ArrowRight,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';

type LoginStep = 'login' | 'forgot' | 'forgot-sent';

export default function AdminLoginPage() {
  const { t } = useLanguage();
  const router = useRouter();

  const [step, setStep] = useState<LoginStep>('login');
  const [identifier, setIdentifier] = useState(''); // email or mobile
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  /** Detect if input is a mobile number (10 digits or starts with +91) */
  const isMobile = (val: string) =>
    /^(\+91)?\d{10}$/.test(val.replace(/\s/g, ''));

  const resolveEmail = async (val: string): Promise<string | null> => {
    if (!isMobile(val)) return val.trim();
    // Try to look up email from phone via Supabase RPC
    const phone = val.replace(/\s/g, '').replace(/^\+91/, '');
    const { data, error } = await supabase.rpc('get_email_by_phone', {
      phone_number: phone,
    });
    if (error || !data) return null;
    return data as string;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    if (!identifier.trim()) {
      setErrorMsg(t('ईमेल या मोबाइल नंबर दर्ज करें', 'Enter email or mobile number'));
      return;
    }
    if (!password) {
      setErrorMsg(t('पासवर्ड दर्ज करें', 'Enter your password'));
      return;
    }

    setLoading(true);
    try {
      let email: string | null = await resolveEmail(identifier);

      if (!email) {
        setErrorMsg(
          t(
            'इस मोबाइल नंबर से कोई खाता नहीं मिला। कृपया ईमेल से लॉगिन करें।',
            'No account found for this mobile number. Please login with email.'
          )
        );
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(
          t(
            'लॉगिन विफल: ' + error.message,
            'Login failed: ' + error.message
          )
        );
        setLoading(false);
        return;
      }

      // Determine role & store cookie for middleware
      const user = data.user;
      const appRole = (user?.app_metadata?.role as string | undefined) ?? 'admin';

      if (data.session?.access_token && typeof document !== 'undefined') {
        document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=604800; SameSite=Lax`;
        document.cookie = `icc-role=${appRole}; path=/; max-age=604800; SameSite=Lax`;
      }

      if (appRole === 'teacher') {
        router.push('/teacher');
      } else {
        // admin or any other role → full dashboard
        router.push('/');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setErrorMsg(t('अप्रत्याशित त्रुटि: ' + msg, 'Unexpected error: ' + msg));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!forgotEmail.includes('@')) {
      setErrorMsg(t('कृपया मान्य ईमेल पता दर्ज करें', 'Enter a valid email address'));
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: 'https://icc-admin-portal.vercel.app/login',
    });
    setLoading(false);
    if (error) {
      setErrorMsg(t('त्रुटि: ' + error.message, 'Error: ' + error.message));
    } else {
      setStep('forgot-sent');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-950 border border-slate-800 rounded-3xl p-8 shadow-2xl text-slate-100 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mx-auto shadow-lg overflow-hidden">
            <Image src="/logo.png" alt="ICC Logo" width={56} height={56} className="object-contain" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            IDEAL COACHING CENTRE
          </h2>
          <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
            {t('प्रशासक एवं संकाय लॉगिन', 'Admin & Faculty Portal')}
          </p>
          <p className="text-[11px] text-slate-400">
            {t('बिहार बोर्ड (BSEB) एवं झारखंड बोर्ड (JAC)', 'Bihar & Jharkhand State Board System')}
          </p>
        </div>

        {/* Security Notice */}
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-start space-x-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-300 leading-relaxed">
            {t(
              'सुरक्षा नीति: केवल अधिकृत प्रशासक एवं शिक्षक लॉगिन कर सकते हैं।',
              'Security policy: Only authorized admins and faculty may login.'
            )}
          </p>
        </div>

        {/* Error / Info Messages */}
        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl font-medium">
            {errorMsg}
          </div>
        )}
        {infoMsg && (
          <div className="p-3 bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs rounded-xl font-medium">
            {infoMsg}
          </div>
        )}

        {/* LOGIN FORM */}
        {step === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            {/* Email or Mobile */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                {t('ईमेल या मोबाइल नंबर', 'Email or Mobile Number')}
              </label>
              <div className="relative">
                {isMobile(identifier) ? (
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                ) : (
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                )}
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={t('admin@icc.edu या 9771350910', 'admin@icc.edu or 9771350910')}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                {t('पासवर्ड', 'Password')}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-10 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <button
                type="button"
                onClick={() => { setStep('forgot'); setErrorMsg(''); }}
                className="text-blue-400 hover:text-blue-300 text-[11px] font-medium underline underline-offset-2"
              >
                {t('पासवर्ड भूल गए?', 'Forgot Password?')}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-xl transition flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/30"
            >
              <span>{loading ? t('लॉगिन हो रहा है...', 'Signing in...') : t('लॉगिन करें', 'Sign In')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Footer info */}
            <p className="text-center text-[10px] text-slate-500 pt-2">
              {t('निदेशक: BADE SIR · +91 9771350910', 'Director: BADE SIR · +91 9771350910')}
            </p>
          </form>
        )}

        {/* FORGOT PASSWORD FORM */}
        {step === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-4 text-xs">
            <div className="text-center">
              <KeyRound className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <h3 className="font-bold text-white text-sm">
                {t('पासवर्ड रीसेट करें', 'Reset Password')}
              </h3>
              <p className="text-slate-400 text-[11px] mt-1">
                {t(
                  'अपना पंजीकृत ईमेल दर्ज करें। रीसेट लिंक भेजा जाएगा।',
                  'Enter your registered email. A reset link will be sent.'
                )}
              </p>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                {t('ईमेल पता', 'Email Address')}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="admin@idealcoachingcentre.com"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-xl transition flex items-center justify-center space-x-2"
            >
              <span>{loading ? t('भेजा जा रहा है...', 'Sending...') : t('रीसेट लिंक भेजें', 'Send Reset Link')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => { setStep('login'); setErrorMsg(''); }}
              className="w-full text-slate-400 hover:text-white text-[11px] text-center font-medium"
            >
              {t('← वापस लॉगिन पर जाएं', '← Back to Login')}
            </button>
          </form>
        )}

        {/* FORGOT SENT CONFIRMATION */}
        {step === 'forgot-sent' && (
          <div className="space-y-5 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <div>
              <h3 className="font-bold text-white text-sm">
                {t('रीसेट लिंक भेजा गया!', 'Reset Link Sent!')}
              </h3>
              <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                {t(
                  `${forgotEmail} पर पासवर्ड रीसेट लिंक भेजा गया है। कृपया अपना ईमेल जांचें।`,
                  `A password reset link has been sent to ${forgotEmail}. Please check your inbox.`
                )}
              </p>
            </div>
            <button
              onClick={() => { setStep('login'); setErrorMsg(''); setForgotEmail(''); }}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition text-xs"
            >
              {t('← लॉगिन पर वापस जाएं', '← Return to Login')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
