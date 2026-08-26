'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import LanguageToggle from './LanguageToggle';
import YojnaSetuLogo from '@/components/ui/YojnaSetuLogo';
import { 
  Calculator, 
  Compass, 
  MapPin, 
  Bot, 
  Landmark,
  Sparkles
} from 'lucide-react';

export default function Header() {
  const { activeTab, setActiveTab, t, locale } = useApp();

  const navItems = [
    { id: 'home', label: locale === 'hi' ? 'होम (Home)' : 'Home', icon: Landmark },
    { id: 'schemes', label: locale === 'hi' ? 'स्मार्ट योजना चयन' : 'Smart Scheme Recommender', icon: Compass },
    { id: 'calculator', label: locale === 'hi' ? 'ईएमआई कैलकुलेटर' : 'EMI Calculator', icon: Calculator },
    { id: 'partners', label: locale === 'hi' ? 'चैनल पार्टनर खोजें' : 'Channel Partner', icon: MapPin },
    { id: 'assistant', label: locale === 'hi' ? 'योजना सहायक' : 'Scheme Assistant', icon: Bot },
  ] as const;

  return (
    <header id="main-header" className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Main Top Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Left: Logo + Tagline */}
        <div className="flex items-center gap-3.5">
          <button
            id="btn-logo-home"
            type="button"
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2 text-left group cursor-pointer focus:outline-none"
          >
            <YojnaSetuLogo size="md" showText={true} />
          </button>

          {/* Hindi Slogan with vertical divider as shown in Stitch design */}
          <div className="hidden sm:flex items-center gap-3 pl-3 border-l-2 border-slate-300">
            <span className="text-xs sm:text-sm font-bold text-[#003366] leading-tight tracking-tight">
              मेरी योजना,
              <br />
              मेरी तरक्की।
            </span>
          </div>
        </div>

        {/* Right: Language Toggle */}
        <div className="flex items-center gap-3">
          <LanguageToggle />
        </div>
      </div>

      {/* Secondary Row: Rounded-Full Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-3">
        <nav
          id="nav-main-pill-bar"
          className="flex items-center gap-1.5 bg-[#F1F5F9] p-1.5 rounded-2xl sm:rounded-full border border-slate-200/90 shadow-2xs overflow-x-auto scrollbar-none"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer min-h-[38px] ${
                  isActive
                    ? 'bg-[#003366] text-white shadow-xs'
                    : 'text-slate-700 hover:text-[#003366] hover:bg-slate-200/80'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

