import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-sm text-slate-700 leading-relaxed">
      <h1 className="text-3xl font-black text-slate-900">गोपनीयता नीति (Privacy Policy)</h1>
      <p className="text-xs text-slate-500">अंतिम अद्यतन: 12 नवंबर 2026</p>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">1. डेटा संग्रहण एवं सुरक्षा</h2>
        <p>
          आइडियल कोचिंग सेंटर (IDEAL COACHING CENTRE) अपने विद्यार्थियों की व्यक्तिगत जानकारी की सुरक्षा के लिए पूर्णतः प्रतिबद्ध है। हम केवल पंजीकरण और पहचान के लिए आवश्यक जानकारी (नाम, मोबाइल नंबर, ईमेल पता, बोर्ड एवं कक्षा) एकत्र करते हैं।
        </p>

        <h2 className="text-lg font-bold text-slate-900">2. शून्य-एसएमएस एवं ईमेल सुरक्षा नीति</h2>
        <p>
          हमारे प्लेटफ़ॉर्म पर किसी भी अनधिकृत तीसरे पक्ष के एसएमएस गेटवे का उपयोग नहीं किया जाता है। लॉगिन सत्यापन ओटीपी केवल छात्र के पंजीकृत ईमेल पते पर भेजा जाता है।
        </p>

        <h2 className="text-lg font-bold text-slate-900">3. भुगतान डेटा सुरक्षा</h2>
        <p>
          संस्थान क्रेडिट कार्ड या बैंकिंग पासवर्ड जैसी संवेदनशील वित्तीय जानकारी कभी एकत्र नहीं करता। सभी भुगतान सीधे विद्यार्थी के यूपीआई ऐप (Google Pay, PhonePe, Paytm, BHIM) के माध्यम से किए जाते हैं।
        </p>

        <h2 className="text-lg font-bold text-slate-900">4. डेटा विलोपन अनुरोध</h2>
        <p>
          कोई भी विद्यार्थी अपने खाते और सभी संबंधित डेटा को स्थायी रूप से हटाने के लिए contact@idealcoachingcentre.com पर अनुरोध भेज सकता है।
        </p>
      </div>
    </div>
  );
}
