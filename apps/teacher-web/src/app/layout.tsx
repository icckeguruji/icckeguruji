import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { TeacherSidebar } from '@/components/TeacherSidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'IDEAL COACHING CENTRE — Teacher Portal',
  description: 'Teacher & Faculty Dashboard for BSEB & JAC State Board Education',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hi">
      <body className={inter.className}>
        <div className="flex min-h-screen bg-slate-50">
          <TeacherSidebar />
          <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
