'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppLanguage } from '@icc/shared-types';

interface LanguageContextType {
  lang: AppLanguage;
  setLang: (l: AppLanguage) => void;
  toggleLang: () => void;
  t: (hiText: string, enText: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  toggleLang: () => {},
  t: (_hi, en) => en,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<AppLanguage>('en');

  useEffect(() => {
    const saved = localStorage.getItem('icc_teacher_lang') as AppLanguage;
    if (saved === 'hi' || saved === 'en') {
      setLang(saved);
    } else {
      setLang('en');
    }
  }, []);

  const handleSetLang = (l: AppLanguage) => {
    setLang(l);
    localStorage.setItem('icc_teacher_lang', l);
  };

  const toggleLang = () => {
    handleSetLang(lang === 'hi' ? 'en' : 'hi');
  };

  const t = (hiText: string, enText: string) => (lang === 'hi' ? hiText : enText);

  return (
    <LanguageContext.Provider value={{ lang, setLang: handleSetLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
