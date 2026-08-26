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
      className={`bg-white rounded-2xl border transition-all shadow-xs hover:shadow-md overflow-hidden ${
        isEligible
          ? 'border-blue-200 ring-1 ring-blue-50'
          : 'border-amber-200 bg-amber-50/20'
      }`}
    >
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
          <h3 className="text-lg sm:text-xl font-bold text-blue-950 tracking-tight leading-snug">
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
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onViewDetails(result)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-blue-900 hover:bg-blue-50 border border-blue-200 transition-colors min-h-[44px] cursor-pointer"
          >
            <Info className="w-4 h-4" />
            <span>{t('common.viewDetails')}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCalculateEmi}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors min-h-[44px] cursor-pointer"
            >
              <Calculator className="w-4 h-4 text-blue-900" />
              <span>{t('common.calculateEmi')}</span>
            </button>

            <button
              type="button"
              onClick={handleFindPartners}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-900 hover:bg-blue-950 text-white shadow-xs transition-colors min-h-[44px] cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>{t('common.findNearbyPartners')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
