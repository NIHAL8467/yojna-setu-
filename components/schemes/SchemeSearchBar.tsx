'use client';

import React, { useState, useMemo } from 'react';
import type { Scheme, Locale } from '@/types';
import { searchSchemes } from '@/lib/schemes';
import { 
  Search, 
  X, 
  Sparkles, 
  ChevronRight, 
  Percent, 
  IndianRupee, 
  CheckCircle2, 
  AlertCircle,
  Tag
} from 'lucide-react';

interface SchemeSearchBarProps {
  onSelectScheme: (scheme: Scheme) => void;
  selectedScheme: Scheme | null;
  locale: Locale;
}

const POPULAR_KEYWORDS = [
  { id: 'scholarship', label: 'Scholarship', labelHi: 'छात्रवृत्ति (Scholarship)' },
  { id: 'education', label: 'Education', labelHi: 'शिक्षा (Education)' },
  { id: 'women', label: 'Women', labelHi: 'महिला (Women)' },
  { id: 'farmers', label: 'Farmers', labelHi: 'किसान (Farmers)' },
  { id: 'business', label: 'Business', labelHi: 'व्यवसाय (Business)' },
  { id: 'employment', label: 'Employment', labelHi: 'रोजगार (Employment)' },
  { id: 'health', label: 'Health', labelHi: 'स्वास्थ्य / स्वच्छता (Health)' },
  { id: 'housing', label: 'Housing', labelHi: 'आवास (Housing)' },
  { id: 'pension', label: 'Pension', labelHi: 'पेंशन (Pension)' },
  { id: 'disability', label: 'Disability', labelHi: 'दिव्यांगजन (Disability)' },
];

export default function SchemeSearchBar({
  onSelectScheme,
  selectedScheme,
  locale,
}: SchemeSearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Search execution
  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    return searchSchemes(query);
  }, [query]);

  const handleClear = () => {
    setQuery('');
  };

  const handleSelect = (scheme: Scheme) => {
    onSelectScheme(scheme);
  };

  return (
    <div id="direct-scheme-search-section" className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="space-y-0.5">
          <h2 className="text-sm sm:text-base font-bold text-[#003366] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>
              {locale === 'hi'
                ? 'प्रत्यक्ष योजना खोज (जनसांख्यिकी विवरण की आवश्यकता नहीं)'
                : 'Direct Scheme Search (No Demographics Required)'}
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            {locale === 'hi'
              ? 'बिना कोई फॉर्म भरे सीधे नाम, कीवर्ड या लाभ द्वारा केंद्रीय व राज्य योजनाएं खोजें:'
              : 'Search directly by name, keyword or benefit without filling in any demographic details first:'}
          </p>
        </div>

        {selectedScheme && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-semibold self-start sm:self-auto shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span className="truncate max-w-[150px] sm:max-w-[200px]">
              {selectedScheme.code}: {selectedScheme.name}
            </span>
          </div>
        )}
      </div>

      {/* Search Input Box */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            id="input-scheme-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder={
              locale === 'hi'
                ? 'नाम, कीवर्ड या लाभ द्वारा योजना खोजें (जैसे: scholarship, women, education)...'
                : 'Search government schemes by name, keyword or benefit...'
            }
            className="w-full pl-11 pr-10 py-3 sm:py-3.5 text-xs sm:text-sm bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-300 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/15 rounded-xl text-slate-900 placeholder:text-slate-400 font-medium transition-all outline-none"
          />
          {query && (
            <button
              id="btn-clear-scheme-search"
              type="button"
              onClick={handleClear}
              className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-200 transition-colors cursor-pointer"
              title="Clear search"
              aria-label="Clear search input"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Suggested Keyword Chips */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
          <Tag className="w-3 h-3 text-slate-400" />
          <span>{locale === 'hi' ? 'लोकप्रिय कीवर्ड:' : 'Suggested Keywords:'}</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {POPULAR_KEYWORDS.map((item) => {
            const isSelected = query.toLowerCase() === item.id;
            return (
              <button
                key={item.id}
                id={`chip-keyword-${item.id}`}
                type="button"
                onClick={() => setQuery(item.id)}
                className={`text-xs px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#003366] text-white border-[#003366] shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border-slate-200'
                }`}
              >
                {locale === 'hi' ? item.labelHi : item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* SEARCH RESULTS SECTION */}
      {query.trim().length > 0 && (
        <div id="search-results-container" className="pt-2 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>
              {searchResults.length > 0
                ? `${searchResults.length} ${locale === 'hi' ? 'योजनाएं मिलीं' : 'Matching Schemes Found'}`
                : locale === 'hi' ? 'खोज परिणाम' : 'Search Results'}
            </span>
            {searchResults.length > 0 && (
              <span className="text-[11px] text-slate-500 font-normal">
                {locale === 'hi'
                  ? 'अपनी पात्रता जांचने के लिए किसी भी योजना पर क्लिक करें'
                  : 'Click any scheme to evaluate eligibility'}
              </span>
            )}
          </div>

          {searchResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {searchResults.map((scheme) => {
                const isCurrent = selectedScheme?.id === scheme.id;
                const maxLoanInLakhs = (scheme.terms.maxLoanAmountNumeric / 100000).toFixed(1);

                return (
                  <div
                    key={scheme.id}
                    id={`search-result-card-${scheme.id}`}
                    onClick={() => handleSelect(scheme)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group ${
                      isCurrent
                        ? 'border-[#003366] bg-blue-50/50 shadow-sm ring-2 ring-[#003366]/20'
                        : 'border-slate-200 bg-white hover:border-[#003366]/60 hover:shadow-xs hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 text-[11px] font-extrabold bg-[#003366] text-amber-300 rounded">
                            {scheme.code}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide bg-slate-100 px-2 py-0.5 rounded">
                            {scheme.category.replace('_', ' ')}
                          </span>
                        </div>
                        {isCurrent && (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Active Target</span>
                          </span>
                        )}
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#003366] transition-colors leading-snug">
                          {locale === 'hi' && scheme.nameHi ? scheme.nameHi : scheme.name}
                        </h3>
                        <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                          {locale === 'hi' && scheme.descriptionHi ? scheme.descriptionHi : scheme.description}
                        </p>
                      </div>

                      {/* Main Benefits Badges */}
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-amber-50 text-amber-900 border border-amber-200 font-bold">
                          <Percent className="w-3 h-3 text-amber-700" />
                          <span>{scheme.terms.interestRatePercentNumeric}% p.a. Concessional</span>
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 text-slate-800 font-semibold">
                          <IndianRupee className="w-3 h-3 text-slate-500" />
                          <span>Up to ₹{maxLoanInLakhs} Lakhs</span>
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">
                        {scheme.targetAudience.slice(0, 45)}...
                      </span>
                      <button
                        type="button"
                        id={`btn-select-scheme-${scheme.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(scheme);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#003366] hover:bg-blue-950 transition-colors shadow-2xs shrink-0 cursor-pointer"
                      >
                        <span>{isCurrent ? 'Selected (चयनित)' : 'Select & Check Eligibility'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              id="search-empty-state"
              className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-2"
            >
              <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center mx-auto">
                <AlertCircle className="w-5 h-5" />
              </div>
              <p className="text-sm font-bold text-slate-800">
                {locale === 'hi' 
                  ? 'कोई योजना नहीं मिली। कृपया कोई अन्य कीवर्ड आज़माएं।' 
                  : 'No schemes found. Try another keyword.'}
              </p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {locale === 'hi'
                  ? 'उपरोक्त सुझाए गए कीवर्ड जैसे "scholarship", "education", "women", "farmers" या "business" आज़माएं।'
                  : 'Try searching for common terms like "scholarship", "education", "women", "farmers", "business" or "employment".'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
