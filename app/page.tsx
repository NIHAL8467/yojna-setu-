'use client';

import React from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BottomNav from '@/components/layout/BottomNav';
import HomeView from '@/components/home/HomeView';
import SchemeWizard from '@/components/schemes/SchemeWizard';
import EmiCalculatorView from '@/components/calculator/EmiCalculatorView';
import PartnerLocatorView from '@/components/partners/PartnerLocatorView';
import AiSchemeAssistant from '@/components/schemes/AiSchemeAssistant';

function AppContent() {
  const { activeTab } = useApp();

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col justify-between text-slate-800 antialiased selection:bg-amber-500 selection:text-blue-950 font-sans">
      <div>
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {activeTab === 'home' && <HomeView />}
          {activeTab === 'schemes' && <SchemeWizard />}
          {activeTab === 'calculator' && <EmiCalculatorView />}
          {activeTab === 'partners' && <PartnerLocatorView />}
          {activeTab === 'assistant' && <AiSchemeAssistant />}
        </main>
      </div>

      <Footer />
      <BottomNav />
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
