'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BatchesRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/courses');
  }, [router]);

  return (
    <div className="flex-1 flex items-center justify-center min-h-[50vh]">
      <p className="text-slate-500 text-sm">Redirecting to Course Management...</p>
    </div>
  );
}
