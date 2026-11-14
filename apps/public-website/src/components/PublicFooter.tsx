'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, MapPin, Phone, Mail } from 'lucide-react';
import { useLanguage } from './LanguageContext';

export function PublicFooter() {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
        {/* Column 1: Brand */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <img
              src="/logo.png"
              alt="IDEAL COACHING CENTRE"
              className="w-10 h-10 object-contain rounded-xl bg-white p-0.5"
            />
            <span className="font-extrabold text-base text-white">
              IDEAL COACHING CENTRE
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {t(
              'कक्षा 1 से 12वीं तक • बिहार बोर्ड (BSEB) एवं झारखंड बोर्ड (JAC) के लिए समर्पित शीर्ष कोचिंग संस्थान। डायरेक्टर बड़े सर के नेतृत्व में शत-प्रतिशत सफलता।',
              'Classes 1st to 12th premier coaching institution for BSEB & JAC board exams under Director BADE SIR.'
            )}
          </p>
          <div className="flex items-center space-x-2 text-xs text-emerald-400 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>{t('शून्य-लागत अवसंरचना मॉडल', 'Zero-Cost Infrastructure Model')}</span>
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
                {t('मैट्रिक एवं इंटरमीडिएट कोर्स', 'Matric & Intermediate Courses')}
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
          </ul>
        </div>

        {/* Column 3: Boards Covered */}
        <div>
          <h4 className="font-bold text-white text-sm mb-4">
            {t('समर्थित बोर्ड', 'Target Boards')}
          </h4>
          <ul className="space-y-2 text-xs text-slate-400">
            <li className="font-semibold text-slate-200">
              {t('बिहार बोर्ड (BSEB)', 'Bihar Board (BSEB)')}
            </li>
            <li>{t('कक्षा 9 एवं 10 मैट्रिक बोर्ड विशेष', 'Classes 9 & 10 Matric Board Special')}</li>
            <li>{t('कक्षा 11 एवं 12 विज्ञान बोर्ड विशेष', 'Classes 11 & 12 Science Special')}</li>
            <li className="font-semibold text-slate-200 mt-2">
              {t('झारखंड बोर्ड (JAC)', 'Jharkhand Board (JAC)')}
            </li>
            <li>{t('कक्षा 10 मैट्रिक बोर्ड सफलता बैच', 'Class 10 Board Target Batch')}</li>
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
            <Mail className="w-4 h-4 text-sky-400 flex-shrink-0" />
            <a href="mailto:icckeguruji@gmail.com" className="hover:text-sky-300 transition">
              icckeguruji@gmail.com
            </a>
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
        <p>© 2026 IDEAL COACHING CENTRE. {t('सर्वाधिकार सुरक्षित।', 'All Rights Reserved.')}</p>
        <div className="flex space-x-6 mt-4 sm:mt-0">
          <Link href="/privacy" className="hover:text-slate-300">
            {t('गोपनीयता नीति', 'Privacy Policy')}
          </Link>
          <Link href="/terms" className="hover:text-slate-300">
            {t('नियम एवं शर्तें', 'Terms & Conditions')}
          </Link>
        </div>
      </div>
    </footer>
  );
}
