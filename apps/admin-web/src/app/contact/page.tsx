'use client';

import React from 'react';
import { MapPin, Phone, Mail, MessageCircle, Clock } from 'lucide-react';
import { initialPlatformConfig } from '@/lib/sample-data';
import { useLanguage } from '@/components/LanguageContext';

export default function ContactPage() {
  const cfg = initialPlatformConfig.institution_profile;
  const { t } = useLanguage();

  return (
    <div className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-black text-slate-900">
          {t('संस्थान से संपर्क करें', 'Contact Our Institute')}
        </h1>
        <p className="text-sm text-slate-500">
          {t(
            'प्रवेश, कोर्स अथवा ऐप से जुड़ी किसी भी जानकारी के लिए हमें संपर्क करें',
            'Get in touch with our counseling and student support desk for course admissions and mobile app assistance'
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact Info Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6 text-xs text-slate-700">
          <h2 className="text-lg font-bold text-slate-900">
            {t('कार्यालय एवं सहायता केंद्र', 'Office & Support Desk')}
          </h2>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 block text-xs">
                  {t('संस्थान का पता', 'Campus Address')}
                </span>
                <span className="text-slate-600">{cfg.address}</span>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Phone className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 block text-xs">
                  {t('हेल्पलाइन नंबर', 'Helpline Phone')}
                </span>
                <span className="text-slate-600 font-mono text-sm">{cfg.contact_phone}</span>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 block text-xs">
                  {t('आधिकारिक ईमेल', 'Official Email')}
                </span>
                <span className="text-slate-600 font-mono">{cfg.contact_email}</span>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 block text-xs">
                  {t('सहायता समय', 'Office Hours')}
                </span>
                <span className="text-slate-600">
                  {t('सोमवार से शनिवार: 08:00 AM - 08:00 PM IST', 'Monday to Saturday: 08:00 AM - 08:00 PM IST')}
                </span>
              </div>
            </div>
          </div>

          {/* WhatsApp Direct Link if configured */}
          {cfg.whatsapp_number && (
            <div className="pt-2">
              <a
                href={`https://wa.me/${cfg.whatsapp_number}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center space-x-2 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{t('व्हाट्सएप पर संदेश भेजें', 'Message on WhatsApp')}</span>
              </a>
            </div>
          )}
        </div>

        {/* Quick Inquiry Form */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-4 text-xs">
          <h2 className="text-lg font-bold text-slate-900">
            {t('त्वरित संदेश भेजें', 'Send an Inquiry')}
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t('आपका नाम', 'Your Name')}
              </label>
              <input
                type="text"
                placeholder={t('पूरा नाम दर्ज करें', 'Enter your full name')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t('मोबाइल नंबर', 'Mobile Number')}
              </label>
              <input
                type="tel"
                placeholder="9876543210"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t('बोर्ड एवं कक्षा', 'Board & Class')}
              </label>
              <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <option>{t('बिहार बोर्ड - कक्षा 10', 'Bihar Board (BSEB) - Class 10')}</option>
                <option>{t('बिहार बोर्ड - कक्षा 12 (विज्ञान)', 'Bihar Board (BSEB) - Class 12 Science')}</option>
                <option>{t('झारखंड बोर्ड - कक्षा 10', 'Jharkhand Board (JAC) - Class 10')}</option>
                <option>{t('कक्षा 9 आधार बैच', 'Class 9 Foundation Batch')}</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t('संदेश / प्रश्न', 'Your Message')}
              </label>
              <textarea
                rows={3}
                placeholder={t('अपनी शंका अथवा प्रश्न लिखें...', 'Type your questions or queries...')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
              ></textarea>
            </div>

            <button
              onClick={() => alert(t('धन्यवाद! आपका संदेश प्राप्त हो गया है।', 'Thank you! Your inquiry has been submitted.'))}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition shadow"
            >
              {t('संदेश सबमिट करें', 'Submit Message')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
