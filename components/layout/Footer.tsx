'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import YojnaSetuLogo from '@/components/ui/YojnaSetuLogo';
import { PhoneCall, Globe, Code2, CheckCircle2, Heart } from 'lucide-react';

export default function Footer() {
  const { t, setActiveTab } = useApp();

  return (
    <footer id="main-footer" className="bg-white text-slate-700 text-sm border-t border-slate-200 mt-16 pb-20 lg:pb-8 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: About Yojna Setu */}
          <div className="md:col-span-2 space-y-3.5">
            <div className="inline-block">
              <YojnaSetuLogo size="md" showText={true} />
            </div>
            <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
              Yojna Setu connects aspiring entrepreneurs and students with concessional credit, government loan subsidies, reducing-balance amortizations, and authorized State Channelising Agencies.
            </p>
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-semibold border border-amber-200">
                <Code2 className="w-3.5 h-3.5 text-amber-600" />
                Crafted with care by Developers
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 text-xs font-semibold border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Empowering Marginalized Communities
              </span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-[#003366]">
              Core Modules
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <button
                  type="button"
                  onClick={() => setActiveTab('schemes')}
                  className="text-slate-600 hover:text-[#003366] hover:underline transition-colors text-left cursor-pointer"
                >
                  {t('nav.schemes')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveTab('calculator')}
                  className="text-slate-600 hover:text-[#003366] hover:underline transition-colors text-left cursor-pointer"
                >
                  {t('nav.calculator')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveTab('partners')}
                  className="text-slate-600 hover:text-[#003366] hover:underline transition-colors text-left cursor-pointer"
                >
                  {t('nav.partners')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveTab('assistant')}
                  className="text-slate-600 hover:text-[#003366] hover:underline transition-colors text-left cursor-pointer"
                >
                  {t('nav.aiAssistant')}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Helpline & Portal Info */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-[#003366]">
              Assistance & Helpline
            </h4>
            <div className="space-y-2.5 text-xs text-slate-600">
              <a
                href="tel:1800112001"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50/80 text-[#003366] font-bold border border-blue-100 hover:bg-blue-100/70 transition-colors"
              >
                <PhoneCall className="w-4 h-4 shrink-0 text-[#003366]" />
                <span>1800-11-2001 (Toll Free)</span>
              </a>
              <a
                href="https://nsfdc.nic.in"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-slate-600 hover:text-[#003366] transition-colors"
              >
                <Globe className="w-4 h-4 shrink-0 text-slate-400" />
                <span>nsfdc.nic.in (National Portal)</span>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-500 font-medium">
          <p className="flex items-center gap-1.5">
            © 2026 Yojna Setu • Designed and built by Developers
            <Heart className="w-3 h-3 text-rose-500 inline fill-rose-500" />
          </p>
          <p>National Scheme Bridge for Welfare & Concessional Credit</p>
        </div>
      </div>
    </footer>
  );
}
