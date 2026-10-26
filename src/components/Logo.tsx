'use client';

import React from 'react';

interface LogoProps {
  className?: string;
  showTagline?: boolean;
  size?: 'sm' | 'md' | 'lg';
  logoUrl?: string;
}

export default function Logo({ className = '', showTagline = true, size = 'md', logoUrl }: LogoProps) {
  const iconSizes = {
    sm: 'w-8 h-8 rounded-xl',
    md: 'w-10 h-10 rounded-2xl',
    lg: 'w-12 h-12 rounded-2xl',
  };

  const titleSizes = {
    sm: 'text-base font-black',
    md: 'text-lg sm:text-xl font-black',
    lg: 'text-2xl font-black',
  };

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 select-none shrink-0 whitespace-nowrap ${className}`}>
      {/* Emblem Icon or Custom Logo */}
      <div
        className={`${iconSizes[size]} bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0 relative overflow-hidden`}
      >
        {logoUrl ? (
          <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
        ) : (
          <>
            {/* Subtle geometric pattern overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent pointer-events-none" />
            
            {/* SVG Emblem */}
            <svg
              viewBox="0 0 40 40"
              className="w-5 h-5 sm:w-6 sm:h-6 drop-shadow-sm shrink-0"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Open Book */}
              <path
                d="M9 28C13 25 17 25 20 27C23 25 27 25 31 28V14C27 11 23 11 20 13C17 11 13 11 9 14V28Z"
                fill="white"
              />
              {/* Book Spine */}
              <path d="M20 13V27" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="round" />
              {/* Flame / Knowledge Star */}
              <path
                d="M20 5C18.5 7.5 17.5 9.5 20 11.5C22.5 9.5 21.5 7.5 20 5Z"
                fill="#F59E0B"
              />
            </svg>
          </>
        )}
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col shrink-0">
        <div className={`${titleSizes[size]} tracking-tight leading-none text-slate-900 flex items-center gap-1.5 whitespace-nowrap`}>
          <span className="font-black">ICC</span>
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent font-black">
            KE GURUJI
          </span>
        </div>
        {showTagline && (
          <div className="flex items-center gap-1 mt-1 whitespace-nowrap">
            <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">
              Live Classes &amp; AI Guruji
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
          </div>
        )}
      </div>
    </div>
  );
}
