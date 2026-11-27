'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, MapPin, Phone, Mail, Lock } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { AdminApi } from '@/lib/api';

export function PublicFooter() {
  const { t } = useLanguage();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const syncAuth = () => {
      setIsLoggedIn(AdminApi.isAdminLoggedIn());
    };
    syncAuth();

    window.addEventListener('icc_auth_changed', syncAuth);
    window.addEventListener('storage', syncAuth);
    window.addEventListener('focus', syncAuth);

    return () => {
      window.removeEventListener('icc_auth_changed', syncAuth);
      window.removeEventListener('storage', syncAuth);
      window.removeEventListener('focus', syncAuth);
    };
  }, []);

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
        {/* Column 1: Brand */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-full overflow-hidden bg-white p-1 border border-slate-700 shadow-sm flex items-center justify-center flex-shrink-0">
              <img
                src="/logo.png"
                alt="IDEAL COACHING CENTRE"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <span className="font-extrabold text-base text-white">
              IDEAL COACHING CENTRE
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {t(
              'कक्षा 1 से 12वीं तक • गुणवत्तापूर्ण एवं परिणामोन्मुखी शिक्षा का अग्रणी संस्थान। डायरेक्टर बड़े सर के मार्गदर्शन में शत-प्रतिशत सफलता एवं सर्वांगीण विकास।',
              'Premier academic coaching institution for Classes 1st to 12th under the leadership of Director BADE SIR.'
            )}
          </p>
          <div className="flex items-center space-x-2 text-xs text-emerald-400 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>{t('विश्वसनीय एवं उच्च गुणवत्ता शिक्षा', 'Trusted & High-Quality Education')}</span>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h4 className="font-bold text-white text-sm mb-4">
            {t('त्वरित लिंक', 'Quick Links')}
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/courses" className="hover:text-white transition">
                {t('पाठ्यक्रम एवं शुल्क', 'Courses & Fee Structure')}
              </Link>
            </li>
            <li>
              <Link href="/download-app" className="hover:text-white transition">
                {t('एंड्रॉयड स्टूडेंट ऐप डाउनलोड', 'Android Student App (APK)')}
              </Link>
            </li>
            <li>
              <Link href="/teachers" className="hover:text-white transition">
                {t('हमारे विशेषज्ञ शिक्षक', 'Our Faculty Members')}
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-white transition">
                {t('संस्थान का परिचय', 'About Our Institution')}
              </Link>
            </li>
            <li>
              {isLoggedIn ? (
                <Link href="/admin" className="hover:text-emerald-300 text-emerald-400 transition font-bold flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t('डायरेक्टर डैशबोर्ड', 'Director Dashboard')}</span>
                </Link>
              ) : (
                <Link href="/login" className="hover:text-amber-400 text-amber-300 transition font-semibold flex items-center space-x-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t('डायरेक्टर पोर्टल लॉगिन', 'Director Portal Login')}</span>
                </Link>
              )}
            </li>
          </ul>
        </div>

        {/* Column 3: Classes & Streams Covered */}
        <div>
          <h4 className="font-bold text-white text-sm mb-4">
            {t('प्रमुख कक्षाएं एवं संकाय', 'Classes & Streams')}
          </h4>
          <ul className="space-y-2 text-xs text-slate-400">
            <li className="font-semibold text-slate-200">
              {t('कक्षा 10वीं (मैट्रिक विशेष बैच)', 'Class 10th (Matric Special Batch)')}
            </li>
            <li>{t('कक्षा 12वीं विज्ञान (Physics, Chem, Math, Bio)', 'Class 12th Science Stream')}</li>
            <li>{t('कक्षा 12वीं कला एवं वाणिज्य (Arts & Commerce)', 'Class 12th Arts & Commerce')}</li>
            <li className="font-semibold text-slate-200 mt-2">
              {t('फाउंडेशन एवं बेसिक विंग', 'Foundation & Basic Wing')}
            </li>
            <li>{t('कक्षा 9वीं प्री-बोर्ड फाउंडेशन', 'Class 9th Foundation Batch')}</li>
            <li>{t('कक्षा 1 से 8वीं मजबूत आधारशिला', 'Classes 1st to 8th Strong Foundation')}</li>
          </ul>
        </div>

        {/* Column 4: Contact */}
        <div className="space-y-3 text-xs">
          <h4 className="font-bold text-white text-sm mb-4">
            {t('संपर्क सूत्र', 'Contact Information')}
          </h4>
          <p className="flex items-start space-x-2">
            <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <span>Sarotiya, Post Sarbhanga, Mahagama, Godda (JH) 814165</span>
          </p>
          <p className="flex items-center space-x-2">
            <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <a href="tel:+919771350910" className="hover:text-emerald-300 transition">
              +91 9771350910 (Director BADE SIR)
            </a>
          </p>
          <p className="flex items-center space-x-2">
            <Mail className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <a href="mailto:icckeguruji@gmail.com" className="hover:text-blue-300 transition">
              icckeguruji@gmail.com
            </a>
          </p>
          <div className="pt-2">
            <span className="text-amber-400 font-medium text-[11px]">
              IDEAL COACHING Official Web Portal
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 gap-4">
        <p>
          &copy; {new Date().getFullYear()} IDEAL COACHING CENTRE. All rights reserved. Directed by BADE SIR.
        </p>
        <div className="flex space-x-6 text-xs">
          <Link href="/privacy" className="hover:text-slate-300 transition">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-slate-300 transition">
            Terms of Service
          </Link>
          <Link href="/contact" className="hover:text-slate-300 transition">
            Contact Us
          </Link>
        </div>
      </div>
    </footer>
  );
}
