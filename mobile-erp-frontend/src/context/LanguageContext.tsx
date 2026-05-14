"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, translations, languageNames } from '@/lib/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem('erp-language') as Language;
    if (savedLang && ['en', 'bn', 'ar', 'hi'].includes(savedLang)) {
      setLanguageState(savedLang);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute('lang', language);
      document.documentElement.setAttribute('dir', languageNames[language].dir);
    }
  }, [language, mounted]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('erp-language', lang);
  };

  const t = (key: string): string => {
    if (!translations[key]) {
      // console.warn(`Translation key "${key}" not found.`);
      return key;
    }
    return translations[key][language] || translations[key]['en'] || key;
  };

  const dir = languageNames[language].dir;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
