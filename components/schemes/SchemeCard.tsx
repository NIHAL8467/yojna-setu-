'use client';

import React from 'react';
import type { SchemeMatchResult } from '@/types';
import { useApp } from '@/context/AppContext';
import { 
  CheckCircle2, 
  AlertCircle, 
  Percent, 
  Clock, 
  IndianRupee, 
  ShieldCheck, 
  ArrowRight, 
  Calculator, 
  MapPin, 
  Info,
  Sparkles
} from 'lucide-react';

interface SchemeCardProps {
  result: SchemeMatchResult;
  onViewDetails: (result: SchemeMatchResult) => void;
}

export default function SchemeCard({ result, onViewDetails }: SchemeCardProps) {
  const { t, locale, setSelectedSchemeForCalculator, setSelectedSchemeForPartners, setActiveTab } = useApp();
  const { scheme, matchReasons, warnings, score, isEligible, calculatedLoanLimit, estimatedInterestRate } = result;

  const handleCalculateEmi = () => {
    setSelectedSchemeForCalculator(scheme);
    setActiveTab('calculator');
  };

  const handleFindPartners = () => {
    setSelectedSchemeForPartners(scheme.id);
    setActiveTab('partners');
  };

  return (
    <div
      id={`scheme-card-${scheme.id}`}
      className={`relative overflow-hidden bg-white/95 rounded-2xl border transition-all shadow-xs hover:shadow-md ${
        isEligible
          ? 'border-blue-200 ring-1 ring-blue-50'
          : 'border-amber-200 bg-amber-50/20'
      }`}
    >
      {/* Blurred National Initiatives & Schemes Background Image */}
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center filter blur-[5px] scale-110 opacity-15 pointer-events-none"
        style={{ backgroundImage: "url('/images/national-schemes-emblem.svg')" }}
      />
      <div className="absolute inset-0 -z-10 bg-white/90 backdrop-blur-[1px] pointer-events-none" />

      {/* Top Banner with Scheme Code & Match Badge */}
      <div className="bg-slate-50 border-b border-slate-200 px-5 py-3.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 bg-blue-900 text-amber-300 text-xs font-bold rounded-md uppercase tracking-wider">
            {scheme.code}
          </span>
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Rank #{result.rank}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isEligible ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t('common.eligibilityChecked')} ({score}% Match)</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>{t('common.conditionalEligibility')}</span>
            </span>
          )}
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-4">
        {/* Title and Description */}
        <div>
          <h3 className="text-lg sm:text-xl font-black text-[#0F294A] tracking-tight leading-snug">
            {locale === 'hi' ? scheme.nameHi : scheme.name}
          </h3>
          <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
            {locale === 'hi' ? scheme.descriptionHi : scheme.description}
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-blue-50/60 p-3.5 rounded-xl border border-blue-100/80">
          <div className="p-1">
            <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
              <Percent className="w-3.5 h-3.5 text-blue-700" />
              Interest Rate
            </span>
            <p className="text-base font-bold text-blue-950 mt-0.5">
              ~{estimatedInterestRate}% p.a.
            </p>
          </div>

          <div className="p-1">
            <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
              <IndianRupee className="w-3.5 h-3.5 text-blue-700" />
              Max Loan Cap
            </span>
            <p className="text-base font-bold text-blue-950 mt-0.5">
              ₹{(scheme.terms.maxLoanAmountNumeric / 100000).toFixed(1)} Lakhs
            </p>
          </div>

          <div className="p-1">
            <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-blue-700" />
              Max Tenure
            </span>
            <p className="text-base font-bold text-blue-950 mt-0.5">
              {scheme.terms.maxTenureMonthsNumeric} Months
            </p>
          </div>

          <div className="p-1">
            <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-700" />
              Moratorium
            </span>
            <p className="text-base font-bold text-blue-950 mt-0.5">
              {scheme.terms.moratoriumMonthsNumeric} Months
            </p>
          </div>
        </div>

        {/* Category Concessional EMI Card */}
        {result.concessionalEmiFor2L && (
          <div className="bg-gradient-to-r from-blue-950 to-blue-900 text-white rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Category Subsidized EMI (₹2,00,000 Loan / 36M)
              </span>
              <p className="text-xs text-blue-200">
                Adjusted for your social category affirmative concession
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-xl sm:text-2xl font-black text-white">
                  ₹{result.concessionalEmiFor2L.toLocaleString('en-IN')}
                  <span className="text-xs font-normal text-blue-300">/mo</span>
                </span>
                {(result.categorySubventionAmount ?? 0) > 0 && (
                  <span className="block text-[10px] text-emerald-300 font-semibold">
                    Includes ₹{result.categorySubventionAmount}/mo subvention
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Match Reasons */}
        {matchReasons.length > 0 && (
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {t('schemes.reasonsTitle')}
            </h4>
            <ul className="space-y-1 pl-1">
              {matchReasons.map((reason, idx) => (
                <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Warnings / Prerequisites if any */}
        {warnings.length > 0 && (
          <div className="space-y-1.5 bg-amber-50/70 p-3 rounded-lg border border-amber-200/80">
            <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              {t('schemes.warningsTitle')}
            </h4>
            <ul className="space-y-1 pl-1">
              {warnings.map((warn, idx) => (
                <li key={idx} className="text-xs text-amber-900 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span>{warn}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={() => onViewDetails(result)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-blue-900 hover:bg-blue-50 border border-blue-200 transition-colors min-h-[44px] cursor-pointer"
          >
            <Info className="w-4 h-4" />
            <span>{t('common.viewDetails')}</span>
          </button>

          <div className="flex items-center justify-end w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCalculateEmi}
              style={scheme.id === 'mahila_samriddhi_yojana' ? { backgroundColor: '#5960f4' } : undefined}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors min-h-[44px] cursor-pointer ${
                scheme.id === 'mahila_samriddhi_yojana'
                  ? 'text-white hover:opacity-90'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
              }`}
            >
              <Calculator className={`w-4 h-4 ${scheme.id === 'mahila_samriddhi_yojana' ? 'text-white' : 'text-blue-900'}`} />
              <span>{t('common.calculateEmi')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
