'use client';

import React, { createContext, useContext } from 'react';
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
  const t = (_hiText: string, enText: string) => enText;

  return (
    <LanguageContext.Provider
      value={{
        lang: 'en',
        setLang: () => {},
        toggleLang: () => {},
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
