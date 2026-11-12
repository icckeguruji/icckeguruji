import React from 'react';
import { MapPin, Phone, Mail, MessageCircle, Clock } from 'lucide-react';
import { initialPlatformConfig } from '../../../admin-web/src/lib/sample-data';

export default function ContactPage() {
  const cfg = initialPlatformConfig.institution_profile;

  return (
    <div className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-black text-slate-900">
          संस्थान से संपर्क करें (Contact Us)
        </h1>
        <p className="text-sm text-slate-500">
          प्रवेश, कोर्स अथवा ऐप से जुड़ी किसी भी जानकारी के लिए हमें संपर्क करें
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact Info Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6 text-xs text-slate-700">
          <h2 className="text-lg font-bold text-slate-900">कार्यालय एवं सहायता केंद्र</h2>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 block text-xs">संस्थान का पता</span>
                <span className="text-slate-600">{cfg.address}</span>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Phone className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 block text-xs">हेल्पलाइन नंबर</span>
                <span className="text-slate-600 font-mono text-sm">{cfg.contact_phone}</span>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 block text-xs">आधिकारिक ईमेल</span>
                <span className="text-slate-600 font-mono">{cfg.contact_email}</span>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 block text-xs">सहायता समय</span>
                <span className="text-slate-600">सोमवार से शनिवार: 08:00 AM - 08:00 PM IST</span>
              </div>
            </div>
          </div>

          {/* WhatsApp Direct Link if configured */}
          {cfg.whatsapp_number && (
            <div className="pt-2">
              <a
                href={`https://wa.me/${cfg.whatsapp_number}?text=Hello%20Ideal%20Coaching%20Centre,%20I%20want%20information%20regarding%20courses.`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center space-x-2 w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>व्हाट्सएप पर सहायता प्राप्त करें (WhatsApp Help)</span>
              </a>
            </div>
          )}
        </div>

        {/* Send Inquiry Card */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8 shadow-sm space-y-4 text-xs">
          <h2 className="text-lg font-bold text-slate-900">संदेश भेजें (Send Inquiry)</h2>

          <div className="space-y-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">आपका नाम</label>
              <input
                type="text"
                placeholder="उदा. अमित कुमार"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">मोबाइल नंबर</label>
              <input
                type="text"
                placeholder="10 अंकों का मोबाइल नंबर"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">संदेश अथवा प्रश्न</label>
              <textarea
                rows={3}
                placeholder="आप क्या जानकारी चाहते हैं..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={() => alert('धन्यवाद! आपका संदेश प्राप्त हो गया है। हमारी टीम शीघ्र संपर्क करेगी।')}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition"
            >
              संदेश प्रेषित करें
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
