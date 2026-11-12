import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { PublicNavbar } from '@/components/PublicNavbar';
import { PublicFooter } from '@/components/PublicFooter';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'IDEAL COACHING CENTRE — बिहार (BSEB) एवं झारखंड (JAC) बोर्ड कोचिंग',
  description: 'बिहार एवं झारखंड बोर्ड परीक्षा में शत-प्रतिशत सफलता का विश्वसनीय संस्थान। दैनिक लाइव कक्षाएं, संपूर्ण टॉपर नोट्स एवं ऑनलाइन टेस्ट।',
  keywords: ['BSEB Coaching', 'JAC Board Coaching', 'Bihar Board Class 10', 'Jharkhand Matric', 'Ideal Coaching Centre'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hi">
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen">
          <PublicNavbar />
          <main className="flex-1">{children}</main>
          <PublicFooter />
        </div>
      </body>
    </html>
  );
}
