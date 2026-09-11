'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Locale, Scheme, UserProfile, SocialCategory } from '@/types';
import enMessages from '@/messages/en.json';
import hiMessages from '@/messages/hi.json';

const DEFAULT_USER_PROFILE: UserProfile = {
  age: null,
  state: '',
  district: '',
  gender: null,
  occupation: '',
  income: null,
  category: null,
  projectCost: null,
  educationLevel: '',
};

interface AppContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (keyPath: string) => string;
  selectedSchemeForCalculator: Scheme | null;
  setSelectedSchemeForCalculator: (scheme: Scheme | null) => void;
  selectedSchemeForPartners: string | null;
  setSelectedSchemeForPartners: (schemeId: string | null) => void;
  activeTab: 'home' | 'schemes' | 'calculator' | 'partners' | 'explore-schemes';
  setActiveTab: (tab: 'home' | 'schemes' | 'calculator' | 'partners' | 'explore-schemes') => void;
  selectedTargetScheme: Scheme | null;
  setSelectedTargetScheme: (scheme: Scheme | null) => void;
  goBack: () => void;
  userCoords: { lat: number; lng: number } | null;
  setUserCoords: (coords: { lat: number; lng: number } | null) => void;
  // User Profile & Category Concession
  userProfile: UserProfile;
  updateUserProfile: (patch: Partial<UserProfile>) => void;
  userCategory: SocialCategory | null;
  setUserCategory: (category: SocialCategory | null) => void;
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
  const [selectedTargetScheme, setSelectedTargetScheme] = useState<Scheme | null>(null);
  const [activeTab, setActiveTabState] = useState<'home' | 'schemes' | 'calculator' | 'partners' | 'explore-schemes'>('home');
  const [tabHistory, setTabHistory] = useState<('home' | 'schemes' | 'calculator' | 'partners' | 'explore-schemes')[]>(['home']);

  const setActiveTab = useCallback((tab: 'home' | 'schemes' | 'calculator' | 'partners' | 'explore-schemes') => {
    setActiveTabState(tab);
    setTabHistory((prev) => (prev[prev.length - 1] === tab ? prev : [...prev, tab]));
  }, []);

  const goBack = useCallback(() => {
    setTabHistory((prev) => {
      if (prev.length > 1) {
        const next = [...prev];
        next.pop(); // remove current active tab
        const prevTab = next[next.length - 1] || 'home';
        setActiveTabState(prevTab);
        return next;
      }
      setActiveTabState('home');
      return ['home'];
    });
  }, []);

  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('yojna_user_profile_v3');
        if (saved) {
          return { ...DEFAULT_USER_PROFILE, ...JSON.parse(saved) };
        }
      } catch {
        // Ignore
      }
    }
    return DEFAULT_USER_PROFILE;
  });

  const updateUserProfile = useCallback((patch: Partial<UserProfile>) => {
    setUserProfile((prev) => {
      const updated = { ...prev, ...patch };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('yojna_user_profile_v3', JSON.stringify(updated));
        } catch {
          // Ignore
        }
      }
      return updated;
    });
  }, []);

  const setUserCategory = useCallback((category: SocialCategory | null) => {
    updateUserProfile({ category });
  }, [updateUserProfile]);

  const userCategory = userProfile.category ?? null;

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
        selectedTargetScheme,
        setSelectedTargetScheme,
        activeTab,
        setActiveTab,
        goBack,
        userCoords,
        setUserCoords,
        userProfile,
        updateUserProfile,
        userCategory,
        setUserCategory,
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

export const useAppContext = useApp;
