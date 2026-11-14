'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
export default function TeacherRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    window.location.replace('https://icc-admin-portal.vercel.app/login');
  }, []);
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center text-white space-y-3">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-semibold">Redirecting to Admin Portal...</p>
        <p className="text-xs text-slate-400">Teacher portal has been merged with Admin Portal</p>
        <a href="https://icc-admin-portal.vercel.app/login" className="text-emerald-400 text-xs underline">
          Click here if not redirected
        </a>
      </div>
    </div>
  );
}
