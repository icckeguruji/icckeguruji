import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { PublicNavbar } from '@/components/PublicNavbar';
import { PublicFooter } from '@/components/PublicFooter';
import { LanguageProvider } from '@/components/LanguageContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'IDEAL COACHING CENTRE — Premier BSEB & JAC Board Coaching',
  description: 'Excellence in Bihar Board (BSEB) & Jharkhand Board (JAC) matric and intermediate examinations. Daily live classes, topper notes, and mock tests.',
  keywords: ['BSEB Coaching', 'JAC Board Coaching', 'Bihar Board Class 10', 'Jharkhand Matric', 'Ideal Coaching Centre'],
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
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
