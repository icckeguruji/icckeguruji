import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { PublicNavbar } from '@/components/PublicNavbar';
import { PublicFooter } from '@/components/PublicFooter';
import { LanguageProvider } from '@/components/LanguageContext';
import WhatsAppFloatingWidget from '@/components/WhatsAppFloatingWidget';
import GrokAICounselorWidget from '@/components/GrokAICounselorWidget';

const inter = Inter({ subsets: ['latin'], display: 'swap', preload: false, fallback: ['system-ui', 'arial'] });

export const metadata: Metadata = {
  title: 'IDEAL COACHING CENTRE — Classes 1–12 | BSEB & JAC Board',
  description:
    'Premier coaching for Bihar Board (BSEB) & Jharkhand Board (JAC) Classes 1st to 12th — daily live classes, handwritten notes, and weekly Sunday tests under Director BADE SIR. Sarotiya, Mahagama, Godda.',
  keywords: [
    'BSEB Coaching',
    'JAC Board Coaching',
    'Ideal Coaching Centre Godda',
    'Bihar Board Class 10',
    'Jharkhand Matric',
    'BADE SIR Godda',
    'Class 10 Aakhiri Waar',
    'Mission 90 Days Class 9',
  ],
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LanguageProvider>
          <div className="flex flex-col min-h-screen">
            <PublicNavbar />
            <main className="flex-1">{children}</main>
            <PublicFooter />
            {/* WhatsApp Floating Widget — Director Helpline */}
            <WhatsAppFloatingWidget />
            {/* Grok AI Admission Counselor Widget */}
            <GrokAICounselorWidget />
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
