import React from 'react';
import Link from 'next/link';
import { ShieldCheck, MapPin, Phone, Mail, Heart } from 'lucide-react';

export function PublicFooter() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
        {/* Column 1: Brand */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-lg">
              ICC
            </div>
            <span className="font-extrabold text-base text-white">
              IDEAL COACHING CENTRE
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            बिहार विद्यालय परीक्षा समिति (BSEB) एवं झारखंड अधिविद्य परिषद् (JAC) के लिए समर्पित शीर्ष कोचिंग संस्थान। शत-प्रतिशत परीक्षा सफलता का विश्वसनीय मार्गदर्शक।
          </p>
          <div className="flex items-center space-x-2 text-xs text-emerald-400 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Zero-Cost Operating Policy</span>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h4 className="font-bold text-white text-sm mb-4">त्वरित लिंक (Quick Links)</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/courses" className="hover:text-white transition">
                मैट्रिक एवं इंटरमीडिएट कोर्स
              </Link>
            </li>
            <li>
              <Link href="/download-app" className="hover:text-white transition">
                एंड्रॉयड स्टूडेंट ऐप (APK Download)
              </Link>
            </li>
            <li>
              <Link href="/teachers" className="hover:text-white transition">
                हमारे विशेषज्ञ शिक्षक
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-white transition">
                संस्थान का परिचय
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Boards Covered */}
        <div>
          <h4 className="font-bold text-white text-sm mb-4">समर्थित बोर्ड (Target Boards)</h4>
          <ul className="space-y-2 text-xs text-slate-400">
            <li className="font-semibold text-slate-200">
              बिहार बोर्ड (BSEB Patna)
            </li>
            <li>कक्षा 9, 10 मैट्रिक बोर्ड विशेष</li>
            <li>कक्षा 11, 12 विज्ञान (I.Sc) बोर्ड विशेष</li>
            <li className="font-semibold text-slate-200 mt-2">
              झारखंड बोर्ड (JAC Ranchi)
            </li>
            <li>कक्षा 10 मैट्रिक बोर्ड सफलता बैच</li>
          </ul>
        </div>

        {/* Column 4: Contact */}
        <div className="space-y-3 text-xs">
          <h4 className="font-bold text-white text-sm mb-4">संपर्क सूत्र (Contact)</h4>
          <p className="flex items-start space-x-2">
            <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <span>मुख्य बाजार मार्ग, गांधी चौक के समीप, बिहार / झारखंड</span>
          </p>
          <p className="flex items-center space-x-2">
            <Phone className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <span>+91 98765 43210</span>
          </p>
          <p className="flex items-center space-x-2">
            <Mail className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <span>contact@idealcoachingcentre.com</span>
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
        <p>© 2026 IDEAL COACHING CENTRE. All Rights Reserved.</p>
        <div className="flex space-x-6 mt-4 sm:mt-0">
          <Link href="/privacy" className="hover:text-slate-300">
            गोपनीयता नीति (Privacy Policy)
          </Link>
          <Link href="/terms" className="hover:text-slate-300">
            नियम एवं शर्तें (Terms & Conditions)
          </Link>
        </div>
      </div>
    </footer>
  );
}
