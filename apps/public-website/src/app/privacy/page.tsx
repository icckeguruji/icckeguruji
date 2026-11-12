'use client';

import React from 'react';
import { useLanguage } from '@/components/LanguageContext';

export default function PrivacyPage() {
  const { t } = useLanguage();

  return (
    <div className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-sm text-slate-700 leading-relaxed">
      <h1 className="text-3xl font-black text-slate-900">
        {t('गोपनीयता नीति', 'Privacy Policy')}
      </h1>
      <p className="text-xs text-slate-500">
        {t('अंतिम अद्यतन: 12 नवंबर 2026', 'Last Updated: November 12, 2026')}
      </p>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">
          {t('1. डेटा संग्रहण एवं सुरक्षा', '1. Data Collection & Privacy')}
        </h2>
        <p>
          {t(
            'आइडियल कोचिंग सेंटर अपने विद्यार्थियों की व्यक्तिगत जानकारी की सुरक्षा के लिए पूर्णतः प्रतिबद्ध है। हम केवल पंजीकरण और पहचान के लिए आवश्यक जानकारी (नाम, मोबाइल नंबर, ईमेल पता, बोर्ड एवं कक्षा) एकत्र करते हैं।',
            'IDEAL COACHING CENTRE is committed to protecting student data privacy. We collect only required enrollment identifiers: Full Name, Username, Mobile Number, Email Address, Board, and Class.'
          )}
        </p>

        <h2 className="text-lg font-bold text-slate-900">
          {t('2. शून्य-एसएमएस एवं ईमेल सुरक्षा नीति', '2. Zero-SMS & Email OTP Authentication')}
        </h2>
        <p>
          {t(
            'हमारे प्लेटफ़ॉर्म पर किसी भी अनधिकृत तीसरे पक्ष के एसएमएस गेटवे का उपयोग नहीं किया जाता है। लॉगिन सत्यापन ओटीपी केवल छात्र के पंजीकृत ईमेल पते पर भेजा जाता है।',
            'Our platform does not use third-party commercial SMS gateways. Security authentication OTPs are strictly dispatched to the student registered email inbox.'
          )}
        </p>

        <h2 className="text-lg font-bold text-slate-900">
          {t('3. भुगतान डेटा सुरक्षा', '3. Payment Data Privacy')}
        </h2>
        <p>
          {t(
            'संस्थान क्रेडिट कार्ड या बैंकिंग पासवर्ड जैसी संवेदनशील वित्तीय जानकारी कभी एकत्र नहीं करता। सभी भुगतान सीधे विद्यार्थी के यूपीआई ऐप (Google Pay, PhonePe, Paytm, BHIM) के माध्यम से किए जाते हैं।',
            'We do not capture or store debit/credit card numbers or banking passwords. All transactions are initiated directly inside external UPI applications via VPA and QR.'
          )}
        </p>

        <h2 className="text-lg font-bold text-slate-900">
          {t('4. डेटा विलोपन अनुरोध', '4. Data Deletion Rights')}
        </h2>
        <p>
          {t(
            'कोई भी विद्यार्थी अपने खाते और सभी संबंधित डेटा को स्थायी रूप से हटाने के लिए contact@idealcoachingcentre.com पर अनुरोध भेज सकता है।',
            'Students may request complete deletion of their account records by contacting support at contact@idealcoachingcentre.com.'
          )}
        </p>
      </div>
    </div>
  );
}
