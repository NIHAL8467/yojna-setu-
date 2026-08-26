'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Landmark, Compass, Calculator, MapPin, Bot } from 'lucide-react';

export default function BottomNav() {
  const { activeTab, setActiveTab, t } = useApp();

  const items = [
    { id: 'home', label: t('nav.home'), icon: Landmark },
    { id: 'schemes', label: t('nav.schemes').replace('Smart ', '').replace(' (Scheme Recommender)', ''), icon: Compass },
    { id: 'calculator', label: t('nav.calculator'), icon: Calculator },
    { id: 'partners', label: t('nav.partners'), icon: MapPin },
    { id: 'assistant', label: t('nav.aiAssistant'), icon: Bot },
  ] as const;

  return (
    <nav
      id="mobile-bottom-nav"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 shadow-lg safe-bottom"
    >
      <div className="grid grid-cols-5 gap-1 max-w-md mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`mobile-tab-${item.id}`}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center min-h-[48px] py-1 px-0.5 rounded-lg transition-colors cursor-pointer ${
                isActive
                  ? 'bg-blue-900/10 text-blue-900 font-bold'
                  : 'text-slate-600 hover:text-slate-900 active:bg-slate-100'
              }`}
            >
              <Icon
                className={`w-5 h-5 transition-transform ${
                  isActive ? 'scale-110 text-blue-900 stroke-[2.5]' : 'text-slate-500'
                }`}
              />
              <span className="text-[10px] mt-0.5 leading-tight line-clamp-1 text-center font-medium">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
