'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { getAllSchemes, searchSchemes } from '@/lib/schemes';
import type { Scheme } from '@/types';
import { 
  Search, 
  X, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Percent, 
  IndianRupee, 
  Clock, 
  Users, 
  ShieldCheck,
  Layers,
  Filter
} from 'lucide-react';

export default function AllAvailableSchemesView() {
  const { 
    locale, 
    setActiveTab, 
    setSelectedTargetScheme, 
    updateUserProfile,
    userProfile 
  } = useApp();

  const allSchemes = useMemo(() => getAllSchemes(), []);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Filter schemes based on search query and category
  const filteredSchemes = useMemo(() => {
    let result = allSchemes;

    // Search query filtering
    if (searchQuery.trim()) {
      const searched = searchSchemes(searchQuery);
      const searchIds = new Set(searched.map((s) => s.id));
      result = result.filter((s) => searchIds.has(s.id));
    }

    // Category filtering
    if (selectedCategory !== 'ALL') {
      result = result.filter((s) => {
        if (selectedCategory === 'business') {
          return s.category === 'business' || s.id === 'micro_credit_finance' || s.id === 'term_loan_scheme';
        }
        if (selectedCategory === 'women') {
          return s.id === 'mahila_samriddhi_yojana' || s.eligibility.specialFocus?.includes('women');
        }
        if (selectedCategory === 'education') {
          return s.category === 'education' || s.id === 'educational_loan_scheme';
        }
        if (selectedCategory === 'green') {
          return s.category === 'green' || s.id === 'green_business_scheme';
        }
        if (selectedCategory === 'sanitation') {
          return s.category === 'sanitation' || s.id === 'swachhta_udayami_yojana';
        }
        return true;
      });
    }

    return result;
  }, [allSchemes, searchQuery, selectedCategory]);

  // Handle selecting a scheme to carry forward into demographic details flow
  const handleSelectScheme = (scheme: Scheme) => {
    setSelectedTargetScheme(scheme);

    // Apply relevant occupation/context pre-fill if appropriate
    if (scheme.id === 'educational_loan_scheme') {
      updateUserProfile({ occupation: 'education' });
    } else if (scheme.id === 'green_business_scheme') {
      updateUserProfile({ occupation: 'green_energy' });
    } else if (scheme.id === 'swachhta_udayami_yojana') {
      updateUserProfile({ occupation: 'sanitation' });
    } else if (scheme.id === 'mahila_samriddhi_yojana') {
      updateUserProfile({ gender: 'female', occupation: 'business' });
    } else if (scheme.category === 'business') {
      if (!userProfile.occupation) {
        updateUserProfile({ occupation: 'business' });
      }
    }

    // Direct transition to Demographic Details page (Step 1 of SchemeWizard)
    setActiveTab('schemes');
  };

  const categories = [
    { id: 'ALL', label: locale === 'hi' ? 'सभी योजनाएं' : 'All Schemes' },
    { id: 'business', label: locale === 'hi' ? 'लघु व्यवसाय व उद्योग' : 'Business & Micro-Finance' },
    { id: 'women', label: locale === 'hi' ? 'महिला उद्यमिता' : 'Women Empowerment' },
    { id: 'education', label: locale === 'hi' ? 'शिक्षा ऋण' : 'Education Loan' },
    { id: 'green', label: locale === 'hi' ? 'हरित व्यवसाय व सौर' : 'Green & Solar Energy' },
    { id: 'sanitation', label: locale === 'hi' ? 'स्वच्छता व अपशिष्ट' : 'Sanitation & Hygiene' },
  ];

  return (
    <div id="all-available-schemes-view" className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Header Row */}
      <div className="flex items-center justify-end gap-3 pt-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-2xs">
            <span className="text-[#003366] font-black">{filteredSchemes.length}</span> / {allSchemes.length}{' '}
            {locale === 'hi' ? 'योजनाएं उपलब्ध' : 'Schemes Available'}
          </span>
        </div>
      </div>

      {/* Main Hero Header */}
      <div className="text-center space-y-2.5 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#003366] border border-blue-200">
          <Layers className="w-3.5 h-3.5 text-amber-500" />
          <span>{locale === 'hi' ? 'राष्ट्रीय रियायती ऋण योजनाएं' : 'National Concessional Loan Directory'}</span>
        </div>
        
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0F294A] tracking-tight leading-tight">
          {locale === 'hi' 
            ? 'सभी उपलब्ध सरकारी योजनाएं' 
            : 'All Available Government Schemes'}
        </h1>

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          {locale === 'hi'
            ? 'बिना किसी जनसांख्यिकी जानकारी के सभी राष्ट्रीय वित्तीय व रियायती ऋण योजनाओं का अन्वेषण करें। अपनी व्यक्तिगत पात्रता व शर्तों की जांच करने के लिए किसी भी योजना का चयन करें।'
            : 'Explore all national financial assistance and affirmative welfare schemes directly. Select any scheme below to verify your personalized eligibility, subsidy benefit, and customized EMI terms.'}
        </p>
      </div>

      {/* Direct Search & Category Filter Section (No Demographic Details Required) */}
      <div id="all-schemes-search-filter-card" className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input Box */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="input-all-schemes-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                locale === 'hi'
                  ? 'योजना का नाम, कीवर्ड या लाभ खोजें (जैसे: महिला, व्यवसाय, शिक्षा, सौर, सफाई)...'
                  : 'Search schemes by name, keyword, or sector (e.g., women, business, education, solar, sanitation)...'
              }
              className="w-full pl-10 pr-10 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 focus:border-blue-900 focus:bg-white rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Active Results Pill */}
          <div className="text-xs text-slate-500 font-semibold shrink-0 flex items-center gap-1.5 self-end sm:self-auto">
            <Filter className="w-3.5 h-3.5 text-blue-900" />
            <span>
              {locale === 'hi' 
                ? `${filteredSchemes.length} योजनाएं प्रदर्शित` 
                : `Showing ${filteredSchemes.length} of ${allSchemes.length} schemes`}
            </span>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-1">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-[#003366] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Scheme Cards Grid */}
      {filteredSchemes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#0F294A]">
            {locale === 'hi' ? 'कोई योजना नहीं मिली' : 'No Schemes Found'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            {locale === 'hi'
              ? 'आपकी खोज के अनुसार कोई योजना नहीं मिली। कृपया भिन्न कीवर्ड खोजें या फ़िल्टर साफ़ करें।'
              : 'No government schemes matched your search or category filter. Try using different keywords or clearing your filters.'}
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('ALL');
            }}
            className="px-4 py-2 bg-[#003366] text-white rounded-xl text-xs font-bold hover:bg-blue-950 transition-colors cursor-pointer"
          >
            {locale === 'hi' ? 'फ़िल्टर हटाएं (Reset Filters)' : 'Reset Filters'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {filteredSchemes.map((scheme) => {
            const maxLoanLakhs = (scheme.terms.maxLoanAmountNumeric / 100000).toFixed(1);
            const tenureYears = (scheme.terms.maxTenureMonthsNumeric / 12).toFixed(0);

            return (
              <div
                key={scheme.id}
                id={`all-scheme-card-${scheme.id}`}
                className="relative overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                {/* Background Emblem Wallpaper */}
                <div
                  className="absolute inset-0 -z-10 bg-cover bg-center filter blur-[6px] scale-110 opacity-10 pointer-events-none"
                  style={{ backgroundImage: "url('/images/national-schemes-emblem.svg')" }}
                />

                {/* Card Top Header */}
                <div>
                  <div className="bg-slate-50/90 border-b border-slate-200 px-4 sm:px-5 py-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-[#003366] text-amber-300 text-xs font-black rounded-md uppercase tracking-wider">
                        {scheme.code}
                      </span>
                      <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                        {scheme.category.replace('_', ' ')}
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>{scheme.terms.nsfdcSharePercentNumeric}% NSFDC Share</span>
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 sm:p-5 space-y-3.5">
                    {/* Scheme Name & Description */}
                    <div>
                      <h2 className="text-base sm:text-lg font-black text-[#0F294A] group-hover:text-[#003366] transition-colors leading-snug">
                        {locale === 'hi' && scheme.nameHi ? scheme.nameHi : scheme.name}
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed line-clamp-3">
                        {locale === 'hi' && scheme.descriptionHi ? scheme.descriptionHi : scheme.description}
                      </p>
                    </div>

                    {/* Target Audience Tag */}
                    <div className="flex items-start gap-1.5 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <Users className="w-3.5 h-3.5 text-blue-900 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">
                        <strong className="text-slate-700">{locale === 'hi' ? 'पात्र वर्ग: ' : 'Target Beneficiaries: '}</strong>
                        {locale === 'hi' && scheme.targetAudienceHi ? scheme.targetAudienceHi : scheme.targetAudience}
                      </span>
                    </div>

                    {/* Key Metrics Grid (4 items) */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-blue-50/60 p-3 rounded-xl border border-blue-100/70 text-left">
                      <div className="p-1">
                        <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1 uppercase tracking-wider">
                          <Percent className="w-3 h-3 text-blue-800" />
                          Rate
                        </span>
                        <p className="text-sm font-black text-[#0F294A] mt-0.5">
                          {scheme.terms.interestRatePercentNumeric}% p.a.
                        </p>
                        {scheme.terms.interestRebateWomenPercent > 0 && (
                          <span className="text-[9px] text-emerald-700 font-semibold block">
                            (-{scheme.terms.interestRebateWomenPercent}% Women)
                          </span>
                        )}
                      </div>

                      <div className="p-1">
                        <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1 uppercase tracking-wider">
                          <IndianRupee className="w-3 h-3 text-blue-800" />
                          Max Cap
                        </span>
                        <p className="text-sm font-black text-[#0F294A] mt-0.5">
                          ₹{maxLoanLakhs} Lakhs
                        </p>
                        <span className="text-[9px] text-slate-500 font-medium block truncate">
                          ₹{scheme.terms.maxLoanAmountNumeric.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="p-1">
                        <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1 uppercase tracking-wider">
                          <Clock className="w-3 h-3 text-blue-800" />
                          Tenure
                        </span>
                        <p className="text-sm font-black text-[#0F294A] mt-0.5">
                          {scheme.terms.maxTenureMonthsNumeric} Mo
                        </p>
                        <span className="text-[9px] text-slate-500 font-medium block">
                          ({tenureYears} Years)
                        </span>
                      </div>

                      <div className="p-1">
                        <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1 uppercase tracking-wider">
                          <Sparkles className="w-3 h-3 text-blue-800" />
                          Moratorium
                        </span>
                        <p className="text-sm font-black text-[#0F294A] mt-0.5">
                          {scheme.terms.moratoriumMonthsNumeric} Months
                        </p>
                        <span className="text-[9px] text-slate-500 font-medium block">
                          Grace Period
                        </span>
                      </div>
                    </div>

                    {/* Key Highlights */}
                    {scheme.highlights && scheme.highlights.length > 0 && (
                      <div className="space-y-1 pt-1">
                        {scheme.highlights.slice(0, 2).map((highlight, idx) => (
                          <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-600">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{highlight}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Area */}
                <div className="p-4 sm:p-5 pt-0">
                  <button
                    id={`btn-select-scheme-${scheme.id}`}
                    type="button"
                    onClick={() => handleSelectScheme(scheme)}
                    className="w-full py-3 px-4 rounded-xl bg-[#003366] hover:bg-[#002244] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs hover:shadow-md transition-all cursor-pointer group/btn"
                  >
                    <span>
                      {locale === 'hi' 
                        ? 'यह योजना चुनें और पात्रता जांचें' 
                        : 'Select Scheme & Check Eligibility'}
                    </span>
                    <ArrowRight className="w-4 h-4 text-amber-400 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
