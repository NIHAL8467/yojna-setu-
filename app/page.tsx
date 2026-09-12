'use client';

import React, { useEffect } from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HomeView from '@/components/home/HomeView';
import AllAvailableSchemesView from '@/components/schemes/AllAvailableSchemesView';
import SchemeWizard from '@/components/schemes/SchemeWizard';
import EmiCalculatorView from '@/components/calculator/EmiCalculatorView';
import PartnerLocatorView from '@/components/partners/PartnerLocatorView';
import { FloatingYojnaMitra } from '@/components/chatbot/FloatingYojnaMitra';

function AppContent() {
  const { activeTab } = useApp();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col justify-between text-slate-800 antialiased selection:bg-amber-500 selection:text-blue-950 font-sans">
      <div>
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {activeTab === 'home' && <HomeView />}
          {activeTab === 'explore-schemes' && <AllAvailableSchemesView />}
          {activeTab === 'schemes' && <SchemeWizard />}
          {activeTab === 'calculator' && <EmiCalculatorView />}
          {activeTab === 'partners' && <PartnerLocatorView />}
        </main>
      </div>

      <Footer />
      <FloatingYojnaMitra />
    </div>
  );
}

export default function Page() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
