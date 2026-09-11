'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import LanguageToggle from './LanguageToggle';
import YojnaSetuLogo from '@/components/ui/YojnaSetuLogo';
import { 
  Calculator, 
  Compass, 
  MapPin, 
  Landmark,
  Sparkles,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';

export default function Header() {
  const { activeTab, setActiveTab, t, locale } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { 
      id: 'home', 
      label: locale === 'hi' ? 'होम' : 'Home', 
      desc: locale === 'hi' ? 'मुख्य पृष्ठ' : 'Portal Homepage',
      icon: Landmark 
    },
    { 
      id: 'schemes', 
      label: locale === 'hi' ? 'स्मार्ट योजना चयन' : 'Smart Scheme Recommender', 
      desc: locale === 'hi' ? 'पात्रता व सिफारिशें' : 'Check Eligibility & Concessions',
      icon: Compass 
    },
    { 
      id: 'calculator', 
      label: locale === 'hi' ? 'ईएमआई कैलकुलेटर' : 'EMI Calculator', 
      desc: locale === 'hi' ? 'किश्त और ब्याज गणना' : 'Amortization & Subventions',
      icon: Calculator 
    },
    { 
      id: 'partners', 
      label: locale === 'hi' ? 'चैनल पार्टनर' : 'Channel Partner', 
      desc: locale === 'hi' ? 'निकटतम केंद्र व बैंक' : 'Find SCA Agencies & Banks',
      icon: MapPin 
    },
  ] as const;

  const handleNavClick = (tabId: 'home' | 'schemes' | 'calculator' | 'partners') => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <header id="main-header" className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Main Top Header Row */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Logo + Tagline */}
        <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
          <button
            id="btn-logo-home"
            type="button"
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2 text-left group cursor-pointer focus:outline-none shrink-0"
            aria-label="Yojna Setu Home"
          >
            <YojnaSetuLogo size="md" showText={true} />
          </button>

          {/* Hindi Slogan with vertical divider as shown in Stitch design */}
          <div className="hidden sm:flex items-center gap-3 pl-3 border-l-2 border-slate-300 shrink-0">
            <span className="text-xs sm:text-sm font-bold text-[#003366] leading-tight tracking-tight">
              मेरी योजना,
              <br />
              मेरी तरक्की।
            </span>
          </div>
        </div>

        {/* Right: Language Toggle + Mobile Menu Trigger */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <LanguageToggle />

          {/* Hamburger Menu Button (Visible on mobile/tablet screens < lg) */}
          <button
            id="btn-mobile-menu-toggle"
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            className="lg:hidden p-2 text-slate-700 hover:text-blue-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border border-slate-200"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-[#003366]" />
            ) : (
              <Menu className="w-5 h-5 text-[#003366]" />
            )}
          </button>
        </div>
      </div>

      {/* Route-Based Navigation Bar: Hidden on Home page, only active page pill on other pages */}
      {activeTab !== 'home' && (
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pb-2.5 sm:pb-3">
          <nav
            id="nav-main-pill-bar"
            aria-label="Current Page Navigation"
            className="flex items-center bg-[#F1F5F9] p-1 sm:p-1.5 rounded-xl sm:rounded-full border border-slate-200/90 shadow-2xs w-fit max-w-full"
          >
            {activeTab === 'schemes' && (
              <button
                id="nav-item-schemes"
                type="button"
                onClick={() => handleNavClick('schemes')}
                aria-current="page"
                className="flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-lg sm:rounded-full text-xs font-bold bg-[#003366] text-white shadow-xs whitespace-nowrap cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                <span id="active-page-name-schemes">{locale === 'hi' ? 'स्मार्ट योजना चयन' : 'Smart Scheme Recommender'}</span>
              </button>
            )}

            {activeTab === 'calculator' && (
              <button
                id="nav-item-calculator"
                type="button"
                onClick={() => handleNavClick('calculator')}
                aria-current="page"
                className="flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-lg sm:rounded-full text-xs font-bold bg-[#003366] text-white shadow-xs whitespace-nowrap cursor-pointer"
              >
                <Calculator className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                <span id="active-page-name-calculator">{locale === 'hi' ? 'ईएमआई कैलकुलेटर' : 'EMI Calculator'}</span>
              </button>
            )}

            {activeTab === 'partners' && (
              <button
                id="nav-item-partners"
                type="button"
                onClick={() => handleNavClick('partners')}
                aria-current="page"
                className="flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-lg sm:rounded-full text-xs font-bold bg-[#003366] text-white shadow-xs whitespace-nowrap cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                <span id="active-page-name-partners">{locale === 'hi' ? 'चैनल पार्टनर' : 'Channel Partner'}</span>
              </button>
            )}
          </nav>
        </div>
      )}

      {/* Mobile Drawer Dropdown Menu (Accessible when hamburger is clicked) */}
      {isMobileMenuOpen && (
        <div
          id="mobile-dropdown-menu"
          className="lg:hidden bg-white border-t border-slate-200 shadow-xl px-4 py-3 space-y-1.5 animate-in slide-in-from-top-2 duration-150"
        >
          <div className="pb-2 mb-1 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold px-2">
            <span>Navigation Menu</span>
            <span className="text-[11px] bg-blue-50 text-blue-900 px-2 py-0.5 rounded font-bold">
              Yojna Setu
            </span>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`mobile-drawer-${item.id}`}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 text-blue-950 font-bold border border-blue-200'
                    : 'text-slate-700 hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isActive ? 'bg-[#003366] text-amber-300' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#0F294A]">{item.label}</div>
                    <div className="text-[10px] text-slate-500 font-normal">{item.desc}</div>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 ${isActive ? 'text-[#003366]' : 'text-slate-400'}`} />
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}

