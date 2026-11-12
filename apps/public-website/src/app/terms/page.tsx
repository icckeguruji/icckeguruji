import React from 'react';

export default function TermsPage() {
  return (
    <div className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-sm text-slate-700 leading-relaxed">
      <h1 className="text-3xl font-black text-slate-900">नियम एवं शर्तें (Terms & Conditions)</h1>
      <p className="text-xs text-slate-500">अंतिम अद्यतन: 12 नवंबर 2026</p>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">1. संस्थान के नियम एवं स्वीकृति</h2>
        <p>
          आइडियल कोचिंग सेंटर के ऐप अथवा वेबसाइट का उपयोग करने पर आप इन नियमों से बंधे होने की सहमति देते हैं। यह सेवा केवल बिहार विद्यालय परीक्षा समिति (BSEB) एवं झारखंड अधिविद्य परिषद् (JAC) के शैक्षणिक उपयोग हेतु है।
        </p>

        <h2 className="text-lg font-bold text-slate-900">2. अध्ययन सामग्री का उपयोग</h2>
        <p>
          संस्थान द्वारा प्रदान किए गए सभी व्याख्यान, वीडियो, पीडीएफ नोट्स और टेस्ट पेपर आइडियल कोचिंग सेंटर की बौद्धिक संपदा हैं। इनका व्यावसायिक पुनर्वितरण सख्त वर्जित है।
        </p>

        <h2 className="text-lg font-bold text-slate-900">3. शुल्क एवं सक्रियता नीति</h2>
        <p>
          मैनुअल यूपीआई द्वारा किए गए भुगतानों का UTR संस्थान द्वारा सत्यापित किए जाने के उपरांत ही कोर्स की वैधता सक्रिय की जाती है। कोर्स की निर्धारित वैधता अवधि समाप्त होने पर नवीनीकरण आवश्यक होगा।
        </p>
      </div>
    </div>
  );
}
