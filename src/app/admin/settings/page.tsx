'use client';

import React, { useState } from 'react';
import { AdminHeader } from '@/components/AdminHeader';
import { useLanguage } from '@/components/LanguageContext';
import { initialPlatformConfig } from '@/lib/sample-data';
import {
  Settings,
  ShieldCheck,
  CreditCard,
  Building,
  HardDrive,
  Database,
  Users,
  Save,
  CheckCircle,
  AlertCircle,
  QrCode,
} from 'lucide-react';

export default function SettingsPage() {
  const { lang, t } = useLanguage();
  const [config, setConfig] = useState(initialPlatformConfig);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="flex-1 pb-12">
      <AdminHeader
        titleHi="सेटिंग्स"
        titleEn="Settings"
        subtitleHi="संस्थान प्रोफ़ाइल, UPI भुगतान विन्यास एवं सिस्टम सेटिंग्स"
        subtitleEn="Configure institution profile, UPI VPA & platform settings"
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Saved Success Banner */}
        {savedSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl flex items-center space-x-2 text-xs font-semibold">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{t('सेटिंग्स सफलतापूर्वक सहेजी गईं!', 'Settings saved successfully!')}</span>
          </div>
        )}

        {/* Free Tier Compliance Monitor Card */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md border border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-2.5">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              <div>
                <h3 className="font-bold text-sm text-slate-100">
                  {t('शून्य-लागत संसाधन कोटा मॉनिटर (Free-Tier Capacity)', 'Zero-Cost Free-Tier Capacity Monitor')}
                </h3>
                <p className="text-xs text-slate-400">
                  {t('मंथली ऑपरेटिंग खर्च: ₹0.00 | कोई सशुल्क अपग्रेड नहीं', 'Monthly Operating Cost: ₹0.00 | No paid upgrades')}
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30">
              100% Free Plan Compliant
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-5 text-xs">
            {/* Database Limit */}
            <div className="space-y-2">
              <div className="flex justify-between text-slate-300">
                <span className="flex items-center"><Database className="w-3.5 h-3.5 mr-1 text-blue-400" /> PostgreSQL DB</span>
                <span className="font-bold">14.2 MB / 500 MB (2.8%)</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '2.8%' }}></div>
              </div>
              <p className="text-[10px] text-slate-400">
                {t('सुरक्षित सीमा में है। 485 MB शेष।', 'Within safe threshold. 485 MB free.')}
              </p>
            </div>

            {/* Storage Limit */}
            <div className="space-y-2">
              <div className="flex justify-between text-slate-300">
                <span className="flex items-center"><HardDrive className="w-3.5 h-3.5 mr-1 text-purple-400" /> Storage (PDFs/Receipts)</span>
                <span className="font-bold">42.8 MB / 1000 MB (4.2%)</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '4.2%' }}></div>
              </div>
              <p className="text-[10px] text-slate-400">
                {t('वीडियो यूट्यूब पर हैं। केवल नोट्स संग्रहित।', 'Videos on YouTube. Only notes stored.')}
              </p>
            </div>

            {/* Auth Users Limit */}
            <div className="space-y-2">
              <div className="flex justify-between text-slate-300">
                <span className="flex items-center"><Users className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Monthly Active Users</span>
                <span className="font-bold">3 / 50,000 MAU (&lt;0.1%)</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '0.1%' }}></div>
              </div>
              <p className="text-[10px] text-slate-400">
                {t('सुरक्षित ईमेल ओटीपी प्रमाणीकरण', 'Secure Email OTP Verification')}
              </p>
            </div>
          </div>
        </div>

        {/* Configuration Form */}
        <form onSubmit={handleSave} className="space-y-6">
          {/* Institution Info */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-900 text-sm flex items-center pb-2 border-b border-slate-100">
              <Building className="w-4 h-4 mr-2 text-blue-600" />
              {t('संस्थान सामान्य विवरण', 'Institution Profile')}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t('संस्थान का नाम', 'Institution Name')}</label>
                <input
                  type="text"
                  value={config.institution_profile.name}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      institution_profile: { ...config.institution_profile, name: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t('संस्थान ईमेल', 'Contact Email')}</label>
                <input
                  type="email"
                  value={config.institution_profile.contact_email}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      institution_profile: { ...config.institution_profile, contact_email: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">{t('टैगलाइन (हिंदी)', 'Tagline (Hindi)')}</label>
                <input
                  type="text"
                  value={config.institution_profile.tagline}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      institution_profile: { ...config.institution_profile, tagline: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* UPI Payment Configuration */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-900 text-sm flex items-center pb-2 border-b border-slate-100">
              <CreditCard className="w-4 h-4 mr-2 text-emerald-600" />
              {t('मैनुअल यूपीआई (UPI) भुगतान विन्यास', 'Manual UPI Payment Settings')}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t('UPI VPA / आईडी', 'UPI VPA / ID')}</label>
                <input
                  type="text"
                  value={config.payment_config.upi_id}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      payment_config: { ...config.payment_config, upi_id: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t('खाताधारक का नाम', 'Account Holder Name')}</label>
                <input
                  type="text"
                  value={config.payment_config.account_holder_name}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      payment_config: { ...config.payment_config, account_holder_name: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">{t('छात्रों के लिए निर्देश (हिंदी)', 'Instructions for Students (Hindi)')}</label>
                <textarea
                  rows={3}
                  value={config.payment_config.instructions_hi}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      payment_config: { ...config.payment_config, instructions_hi: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center space-x-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
            >
              <Save className="w-4 h-4" />
              <span>{t('परिवर्तन सहेजें', 'Save All Changes')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
