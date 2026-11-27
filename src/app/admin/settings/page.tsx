'use client';

import React, { useEffect, useState } from 'react';
import { AdminHeader } from '@/components/AdminHeader';
import { useLanguage } from '@/components/LanguageContext';
import { initialPlatformConfig } from '@/lib/sample-data';
import {
  CreditCard,
  Building,
  Save,
  CheckCircle,
  Smartphone,
  UploadCloud,
} from 'lucide-react';

export default function SettingsPage() {
  const { t } = useLanguage();
  const [config, setConfig] = useState(initialPlatformConfig);
  const [savedSuccess, setSavedSuccess] = useState('');
  const [appUpdate, setAppUpdate] = useState({
    latest_version: '1.0.3',
    version_code: 4,
    apk_download_url: 'https://github.com/icckeguruji/icckeguruji/releases/download/v1.0.1/ideal-coaching-release.apk',
    title_hi: 'नया आधिकारिक अपडेट उपलब्ध है (v1.0.3)',
    changelog_en_text: '100% True Dark Mode across all screens\nAI Smart Quiz restored (Hindi & Urdu)\nLive-to-Recorded YouTube auto-promotion',
    changelog_hi_text: 'पूरी ऐप में 100% क्लियर डार्क मोड\nAI स्मार्ट क्विज़ वापस जोड़ा गया\nलाइव क्लास खत्म होने पर वीडियो रिकॉर्डेड में दिखेगा',
    is_mandatory: false,
  });
  const [publishingUpdate, setPublishingUpdate] = useState(false);

  useEffect(() => {
    fetch('/api/app-update')
      .then((r) => r.json())
      .then((d) => {
        if (d?.latest_version) {
          setAppUpdate({
            latest_version: d.latest_version,
            version_code: d.version_code || 4,
            apk_download_url: d.apk_download_url || '',
            title_hi: d.title_hi || '',
            changelog_en_text: Array.isArray(d.changelog_en) ? d.changelog_en.join('\n') : '',
            changelog_hi_text: Array.isArray(d.changelog_hi) ? d.changelog_hi.join('\n') : '',
            is_mandatory: Boolean(d.is_mandatory),
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(t('सेटिंग्स सफलतापूर्वक सहेजी गईं!', 'Settings saved successfully!'));
    setTimeout(() => setSavedSuccess(''), 3000);
  };

  const handlePublishAppUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPublishingUpdate(true);
    try {
      const res = await fetch('/api/app-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latest_version: appUpdate.latest_version.trim(),
          version_code: Number(appUpdate.version_code) || 4,
          apk_download_url: appUpdate.apk_download_url.trim(),
          title_en: `Update Available (v${appUpdate.latest_version.trim()})`,
          title_hi: appUpdate.title_hi.trim(),
          changelog_en: appUpdate.changelog_en_text.split('\n').map((s) => s.trim()).filter(Boolean),
          changelog_hi: appUpdate.changelog_hi_text.split('\n').map((s) => s.trim()).filter(Boolean),
          is_mandatory: appUpdate.is_mandatory,
          release_date: new Date().toISOString().split('T')[0],
        }),
      });
      if (res.ok) {
        setSavedSuccess(`Android App Update v${appUpdate.latest_version} published live with changelog!`);
        setTimeout(() => setSavedSuccess(''), 4000);
      }
    } finally {
      setPublishingUpdate(false);
    }
  };

  return (
    <div className="flex-1 pb-12">
      <AdminHeader
        titleHi="ऐप अपडेट और सेटिंग्स"
        titleEn="App Update & Settings"
        subtitleHi="Android ऐप अपडेट, चेंजलॉग, संस्थान प्रोफ़ाइल एवं UPI सेटिंग्स"
        subtitleEn="Publish Android app updates with changelog, institute profile & UPI settings"
      />

      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        {savedSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl flex items-center space-x-2 text-xs font-semibold">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{savedSuccess}</span>
          </div>
        )}

        {/* Android App Update Publisher */}
        <form onSubmit={handlePublishAppUpdate} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Smartphone className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              {t('Android ऐप अपडेट पब्लिश करें (Changelog के साथ)', 'Publish Android App Update & Changelog')}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Version Name (e.g. 1.0.3)</label>
              <input
                type="text"
                value={appUpdate.latest_version}
                onChange={(e) => setAppUpdate({ ...appUpdate, latest_version: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Version Code (Integer)</label>
              <input
                type="number"
                value={appUpdate.version_code}
                onChange={(e) => setAppUpdate({ ...appUpdate, version_code: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center space-x-2 font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={appUpdate.is_mandatory}
                  onChange={(e) => setAppUpdate({ ...appUpdate, is_mandatory: e.target.checked })}
                />
                <span>Mandatory Update</span>
              </label>
            </div>
            <div className="sm:col-span-3">
              <label className="block font-semibold text-slate-700 mb-1">APK Download URL</label>
              <input
                type="url"
                value={appUpdate.apk_download_url}
                onChange={(e) => setAppUpdate({ ...appUpdate, apk_download_url: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
              />
            </div>
            <div className="sm:col-span-3">
              <label className="block font-semibold text-slate-700 mb-1">Update Headline (Hindi)</label>
              <input
                type="text"
                value={appUpdate.title_hi}
                onChange={(e) => setAppUpdate({ ...appUpdate, title_hi: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div className="sm:col-span-3 md:col-span-1">
              <label className="block font-semibold text-slate-700 mb-1">Changelog (English - 1 per line)</label>
              <textarea
                rows={4}
                value={appUpdate.changelog_en_text}
                onChange={(e) => setAppUpdate({ ...appUpdate, changelog_en_text: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div className="sm:col-span-3 md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Changelog (Hindi - 1 per line)</label>
              <textarea
                rows={4}
                value={appUpdate.changelog_hi_text}
                onChange={(e) => setAppUpdate({ ...appUpdate, changelog_hi_text: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={publishingUpdate}
              className="flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{publishingUpdate ? 'Publishing...' : 'Publish Live App Update'}</span>
            </button>
          </div>
        </form>

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
                <label className="block font-semibold text-slate-700 mb-1">{t('संस्थान टैगलाइन', 'Institute Tagline')}</label>
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
                <label className="block font-semibold text-slate-700 mb-1">{t('छात्रों के लिए निर्देश', 'Payment Instructions for Students')}</label>
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
