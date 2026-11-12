'use client';

import React from 'react';
import { useLanguage } from '@/components/LanguageContext';

export default function TermsPage() {
  const { t } = useLanguage();

  return (
    <div className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-sm text-slate-700 leading-relaxed">
      <h1 className="text-3xl font-black text-slate-900">
        {t('नियम एवं शर्तें', 'Terms & Conditions')}
      </h1>
      <p className="text-xs text-slate-500">
        {t('अंतिम अद्यतन: 12 नवंबर 2026', 'Last Updated: November 12, 2026')}
      </p>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">
          {t('1. संस्थान के नियम एवं स्वीकृति', '1. Terms of Acceptance')}
        </h2>
        <p>
          {t(
            'आइडियल कोचिंग सेंटर के ऐप अथवा वेबसाइट का उपयोग करने पर आप इन नियमों से बंधे होने की सहमति देते हैं। यह सेवा केवल बिहार विद्यालय परीक्षा समिति (BSEB) एवं झारखंड अधिविद्य परिषद् (JAC) के शैक्षणिक उपयोग हेतु है।',
            'By using the IDEAL COACHING CENTRE mobile application and web portals, you agree to these terms. This service is strictly intended for BSEB and JAC academic preparation.'
          )}
        </p>

        <h2 className="text-lg font-bold text-slate-900">
          {t('2. अध्ययन सामग्री का उपयोग', '2. Intellectual Property & Study Material')}
        </h2>
        <p>
          {t(
            'संस्थान द्वारा प्रदान किए गए सभी व्याख्यान, वीडियो, पीडीएफ नोट्स और टेस्ट पेपर आइडियल कोचिंग सेंटर की बौद्धिक संपदा हैं। इनका व्यावसायिक पुनर्वितरण सख्त वर्जित है।',
            'All lecture videos, notes, PDF materials, and examination test banks are the intellectual property of IDEAL COACHING CENTRE. Unauthorized commercial re-distribution or sharing is strictly prohibited.'
          )}
        </p>

        <h2 className="text-lg font-bold text-slate-900">
          {t('3. शुल्क एवं सक्रियता नीति', '3. Fee Payment & Course Activation')}
        </h2>
        <p>
          {t(
            'मैनुअल यूपीआई द्वारा किए गए भुगतानों का UTR संस्थान द्वारा सत्यापित किए जाने के उपरांत ही कोर्स की वैधता सक्रिय की जाती है। कोर्स की निर्धारित वैधता अवधि समाप्त होने पर नवीनीकरण आवश्यक होगा।',
            'Course enrollment is activated strictly after manual bank verification of the 12-digit UPI UTR transaction reference submitted by the student.'
          )}
        </p>
      </div>
    </div>
  );
}
