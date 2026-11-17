import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { LanguageProvider } from '@/components/LanguageContext';
import { AppShell } from '@/components/AppShell';

const inter = Inter({ subsets: ['latin'], display: 'swap', preload: false, fallback: ['system-ui', 'arial'] });

export const metadata: Metadata = {
  title: 'IDEAL COACHING CENTRE — Excellence in BSEB & JAC Board Exams',
  description: 'Official digital learning and administration platform for IDEAL COACHING CENTRE (BSEB & JAC Boards), Sarotiya, Mahagama, Godda (JH).',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <LanguageProvider>
          <AppShell>{children}</AppShell>
        </LanguageProvider>
      </body>
    </html>
  );
}
