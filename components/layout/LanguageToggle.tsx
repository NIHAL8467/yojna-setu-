'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Languages } from 'lucide-react';

export default function LanguageToggle() {
  const { locale, setLocale } = useApp();

  return (
    <div
      id="language-toggle-wrapper"
      className="inline-flex items-center gap-1 sm:gap-1.5 bg-slate-100/90 border border-slate-200 rounded-lg p-0.5 sm:p-1 shadow-2xs shrink-0"
    >
      <Languages className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600 ml-1 sm:ml-1.5 shrink-0" />
      <button
        id="btn-lang-en"
        type="button"
        onClick={() => setLocale('en')}
        className={`px-2 sm:px-3 py-1 text-[11px] sm:text-xs font-bold rounded-md transition-all cursor-pointer min-h-[28px] sm:min-h-[30px] ${
          locale === 'en'
            ? 'bg-[#003366] text-white shadow-xs'
            : 'text-slate-700 hover:text-blue-950 hover:bg-slate-200/80'
        }`}
        aria-label="Switch to English"
      >
        English
      </button>
      <button
        id="btn-lang-hi"
        type="button"
        onClick={() => setLocale('hi')}
        className={`px-2 sm:px-3 py-1 text-[11px] sm:text-xs font-bold rounded-md transition-all cursor-pointer min-h-[28px] sm:min-h-[30px] ${
          locale === 'hi'
            ? 'bg-[#003366] text-white shadow-xs'
            : 'text-slate-700 hover:text-blue-950 hover:bg-slate-200/80'
        }`}
        aria-label="Switch to Hindi"
      >
        हिन्दी
      </button>
    </div>
  );
}

