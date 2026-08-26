'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Locale, Scheme } from '@/types';
import enMessages from '@/messages/en.json';
import hiMessages from '@/messages/hi.json';

interface AppContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (keyPath: string) => string;
  selectedSchemeForCalculator: Scheme | null;
  setSelectedSchemeForCalculator: (scheme: Scheme | null) => void;
  selectedSchemeForPartners: string | null;
  setSelectedSchemeForPartners: (schemeId: string | null) => void;
  activeTab: 'home' | 'schemes' | 'calculator' | 'partners' | 'assistant';
  setActiveTab: (tab: 'home' | 'schemes' | 'calculator' | 'partners' | 'assistant') => void;
  userCoords: { lat: number; lng: number } | null;
  setUserCoords: (coords: { lat: number; lng: number } | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedLocale = localStorage.getItem('nsfdc_locale') as Locale;
        if (savedLocale === 'en' || savedLocale === 'hi') {
          return savedLocale;
        }
      } catch {
        // Ignore
      }
    }
    return 'en';
  });
  const [selectedSchemeForCalculator, setSelectedSchemeForCalculator] = useState<Scheme | null>(null);
  const [selectedSchemeForPartners, setSelectedSchemeForPartners] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'schemes' | 'calculator' | 'partners' | 'assistant'>('home');
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem('nsfdc_locale', newLocale);
    } catch {
      // Ignore
    }
  };

  const t = (keyPath: string): string => {
    const messages = locale === 'hi' ? hiMessages : enMessages;
    const keys = keyPath.split('.');
    let current: any = messages;
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        // Fallback to English
        let fallback: any = enMessages;
        for (const fbKey of keys) {
          if (fallback && typeof fallback === 'object' && fbKey in fallback) {
            fallback = fallback[fbKey];
          } else {
            return keyPath;
          }
        }
        return typeof fallback === 'string' ? fallback : keyPath;
      }
    }
    return typeof current === 'string' ? current : keyPath;
  };

  return (
    <AppContext.Provider
      value={{
        locale,
        setLocale,
        t,
        selectedSchemeForCalculator,
        setSelectedSchemeForCalculator,
        selectedSchemeForPartners,
        setSelectedSchemeForPartners,
        activeTab,
        setActiveTab,
        userCoords,
        setUserCoords,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
