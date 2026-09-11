'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import YojnaWheelIllustration from '@/components/ui/YojnaWheelIllustration';
import { 
  Compass, 
  Calculator, 
  MapPin, 
  ArrowRight, 
  CheckCircle2, 
  FileText,
  FileCheck
} from 'lucide-react';

export default function HomeView() {
  const { locale, setActiveTab, setSelectedTargetScheme } = useApp();

  const quickServices = [
    {
      id: 'schemes',
      title: locale === 'hi' ? 'मेरी योजना खोजें' : 'Find My Scheme',
      desc: locale === 'hi' ? 'प्रोफ़ाइल के आधार पर योजनाएं खोजें' : 'Discover schemes based on profile',
      icon: FileCheck,
      action: () => setActiveTab('schemes'),
    },
    {
      id: 'calculator',
      title: locale === 'hi' ? 'ईएमआई गणना' : 'Calculate EMI',
      desc: locale === 'hi' ? 'मासिक किश्तों का सटीक अनुमान लगाएं' : 'Estimate monthly installments',
      icon: Calculator,
      action: () => setActiveTab('calculator'),
    },
    {
      id: 'partners',
      title: locale === 'hi' ? 'चैनल पार्टनर' : 'Channel Partner',
      desc: locale === 'hi' ? 'निकटतम राज्य एजेंसियां और बैंक खोजें' : 'Locate eligible partners near you',
      icon: MapPin,
      action: () => setActiveTab('partners'),
    },
  ] as const;

  return (
    <div id="home-view" className="space-y-12 sm:space-y-14">
      {/* HERO SECTION (Matches Stitch UI Mockup) */}
      <section className="py-2 sm:py-6 lg:py-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
          {/* Left Column: Headline, Description & CTAs */}
          <div className="flex-1 space-y-4 sm:space-y-6 text-left max-w-2xl w-full">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#0F294A] tracking-tight leading-[1.18] sm:leading-[1.15]">
              {locale === 'hi' 
                ? 'अपने लिए सही सरकारी योजना खोजें' 
                : 'Find the Right Government Scheme for You'}
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              {locale === 'hi'
                ? 'उपयुक्त रियायती ऋण योजनाओं की खोज करें, अपनी अनुमानित वित्तीय सहायता समझें, और पूर्ण पारदर्शिता व सरलता से अपने निकटतम चैनल पार्टनर खोजें।'
                : 'Discover suitable concessional schemes, understand your estimated financial support, and find an eligible channel partner near you with ease and transparency.'}
            </p>

            {/* Action Buttons as per Stitch UI */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 w-full sm:w-auto">
              <button
                id="btn-hero-find-scheme"
                type="button"
                onClick={() => {
                  setSelectedTargetScheme(null);
                  setActiveTab('schemes');
                }}
                className="w-full sm:w-auto px-6 sm:px-7 py-3.5 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer min-h-[46px] inline-flex items-center justify-center text-center"
              >
                {locale === 'hi' ? 'मेरी योजना खोजें' : 'Find My Scheme'}
              </button>

              <button
                id="btn-hero-explore-schemes"
                type="button"
                onClick={() => setActiveTab('explore-schemes')}
                className="w-full sm:w-auto px-6 sm:px-7 py-3.5 rounded-xl bg-[#003366] hover:bg-[#002244] text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer min-h-[46px] inline-flex items-center justify-center text-center"
              >
                {locale === 'hi' ? 'योजनाएं देखें' : 'Explore Schemes'}
              </button>
            </div>
          </div>

          {/* Right Column: Wheel Illustration Container Card */}
          <div className="w-full lg:w-[460px] max-w-full shrink-0 overflow-hidden">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-6 border border-slate-200/90 shadow-sm flex items-center justify-center overflow-hidden">
              <YojnaWheelIllustration className="w-full max-w-full" />
            </div>
          </div>
        </div>
      </section>

      {/* QUICK SERVICES SECTION (Matches Stitch UI Mockup) */}
      <section
        id="quick-services-section"
        className="bg-[#F1F5F9] rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-10 border border-slate-200/80 shadow-2xs space-y-5 sm:space-y-6"
      >
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#0F294A] tracking-tight">
            {locale === 'hi' ? 'त्वरित सेवाएं (Quick Services)' : 'Quick Services'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            {locale === 'hi'
              ? 'हमारे सबसे लोकप्रिय उपकरणों तक सीधे पहुंचें।'
              : 'Access our most popular tools directly.'}
          </p>
        </div>

        {/* 3 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {quickServices.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.id}
                id={`quick-service-card-${service.id}`}
                onClick={service.action}
                className="relative overflow-hidden bg-white/90 rounded-2xl p-6 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group h-full space-y-5"
              >
                {/* Blurred National Initiatives & Schemes Background Image */}
                <div
                  className="absolute inset-0 -z-10 bg-cover bg-center filter blur-[5px] scale-110 opacity-30 group-hover:scale-115 group-hover:opacity-40 transition-all duration-500 pointer-events-none"
                  style={{ backgroundImage: "url('/images/national-schemes-emblem.svg')" }}
                />
                {/* Soft backdrop overlay to ensure 100% crisp, readable foreground content */}
                <div className="absolute inset-0 -z-10 bg-white/85 backdrop-blur-[1px] group-hover:bg-white/75 transition-colors pointer-events-none" />

                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-full bg-blue-100/90 flex items-center justify-center mb-4 group-hover:bg-[#003366] group-hover:text-white transition-all text-[#003366] shadow-xs">
                    <Icon className="w-5 h-5 transition-colors" />
                  </div>

                  <h3 className="text-base font-bold text-[#0F294A] group-hover:text-[#003366] transition-colors">
                    {service.title}
                  </h3>

                  <p className="text-xs text-slate-600 font-medium mt-1.5 leading-relaxed">
                    {service.desc}
                  </p>
                </div>

                <div className="relative z-10 pt-2 flex items-center text-[#0F294A] group-hover:text-[#003366]">
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* HOW APPLICATION PROCESS WORKS */}
      <section className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-5 sm:p-8 space-y-5 sm:space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-[#0F294A] tracking-tight">
            {locale === 'hi' ? 'आवेदन प्रक्रिया (चरण-दर-चरण)' : 'How to Apply for Schemes (Step-by-Step)'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {locale === 'hi'
              ? 'योजना की खोज से लेकर ऋण वितरण तक स्पष्ट मार्गदर्शन।'
              : 'A clear roadmap from scheme discovery to loan disbursement and business setup.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            {
              step: '1',
              title: locale === 'hi' ? 'योजना चयन' : 'Discover & Check Fit',
              desc: locale === 'hi' ? 'स्मार्ट रिकमेंडर का उपयोग करके अपनी आवश्यकता अनुसार योजना चुनें।' : 'Use Smart Recommender to find schemes matching your budget, income, and trade.',
              icon: Compass,
            },
            {
              step: '2',
              title: locale === 'hi' ? 'दस्तावेज़ तैयार करें' : 'Prepare KYC & Docs',
              desc: locale === 'hi' ? 'जाति प्रमाण पत्र, आय प्रमाण पत्र, आधार एवं परियोजना रिपोर्ट तैयार रखें।' : 'Gather Category Certificate, Income Proof (< ₹5L), Aadhaar, and Quotation/DPR.',
              icon: FileText,
            },
            {
              step: '3',
              title: locale === 'hi' ? 'चैनल पार्टनर से संपर्क' : 'Visit Channel Partner',
              desc: locale === 'hi' ? 'निकटतम राज्य निगम (SCA) या बैंक शाखा में अपना आवेदन जमा करें।' : 'Submit your application at your nearest State Channelising Agency or Bank branch.',
              icon: MapPin,
            },
            {
              step: '4',
              title: locale === 'hi' ? 'स्वीकृति व ऋण वितरण' : 'Sanction & Moratorium',
              desc: locale === 'hi' ? 'रियायती दरों पर ऋण और व्यवसाय स्थापना के लिए मोरेटोरियम का लाभ लें।' : 'Receive concessional disbursement with repayment holidays during initial business setup.',
              icon: CheckCircle2,
            },
          ].map((item) => (
            <div key={item.step} className="bg-[#F8FAFC] rounded-2xl p-4 sm:p-5 border border-slate-200/90 space-y-2 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-[#003366] text-amber-300 font-black flex items-center justify-center text-xs">
                {item.step}
              </div>
              <h3 className="text-sm font-bold text-[#0F294A]">{item.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

