'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { getAllSchemes } from '@/lib/schemes';
import { calculateEmiSchedule } from '@/lib/emi-calculator';
import type { Scheme, EmiCalculationResult } from '@/types';
import AmortizationTable from './AmortizationTable';
import { 
  Calculator, 
  Percent, 
  Clock, 
  IndianRupee, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  RotateCcw, 
  MapPin, 
  Info,
  Check
} from 'lucide-react';

export default function EmiCalculatorView() {
  const { t, locale, selectedSchemeForCalculator, setSelectedSchemeForPartners, setActiveTab } = useApp();
  const schemes = getAllSchemes();

  const defaultScheme = selectedSchemeForCalculator || schemes[0];

  const [selectedSchemeId, setSelectedSchemeId] = useState<string>(defaultScheme?.id || 'micro_credit_finance');
  const [isWomenApplicant, setIsWomenApplicant] = useState(false);
  const [principal, setPrincipal] = useState<number>(() => {
    const loanAmt = Math.min(defaultScheme?.terms.maxLoanAmountNumeric || 100000, 150000);
    return loanAmt > 0 ? loanAmt : 100000;
  });
  const [interestRate, setInterestRate] = useState<number>(defaultScheme?.terms.interestRatePercentNumeric || 5.0);
  const [tenureMonths, setTenureMonths] = useState<number>(defaultScheme?.terms.maxTenureMonthsNumeric || 36);
  const [moratoriumMonths, setMoratoriumMonths] = useState<number>(defaultScheme?.terms.moratoriumMonthsNumeric || 3);

  const applySchemeDefaults = React.useCallback((scheme: Scheme) => {
    const loanAmt = Math.min(scheme.terms.maxLoanAmountNumeric, 150000);
    setPrincipal(loanAmt > 0 ? loanAmt : 100000);
    setInterestRate(scheme.terms.interestRatePercentNumeric || 5.0);
    setTenureMonths(scheme.terms.maxTenureMonthsNumeric || 36);
    setMoratoriumMonths(scheme.terms.moratoriumMonthsNumeric || 3);
  }, []);

  const handleSchemeChange = (schemeId: string) => {
    setSelectedSchemeId(schemeId);
    if (schemeId === 'custom') return;
    const scheme = schemes.find((s) => s.id === schemeId);
    if (scheme) {
      applySchemeDefaults(scheme);
    }
  };

  // Effective interest rate with women rebate if toggled
  const effectiveRate = isWomenApplicant
    ? Math.max(1, interestRate - 0.5)
    : interestRate;

  // Calculate schedule
  const calculation: EmiCalculationResult = calculateEmiSchedule(
    principal,
    effectiveRate,
    tenureMonths,
    moratoriumMonths
  );

  const principalRatio = calculation.totalRepayment > 0 
    ? Math.round((calculation.principalAmount / calculation.totalRepayment) * 100)
    : 100;
  const interestRatio = 100 - principalRatio;

  const handleGoToPartners = () => {
    if (selectedSchemeId !== 'custom') {
      setSelectedSchemeForPartners(selectedSchemeId);
    }
    setActiveTab('partners');
  };

  return (
    <div id="emi-calculator-view" className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-950 tracking-tight">
          {t('calculator.title')}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
          {t('calculator.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Input Form Controls (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-6">
          {/* Scheme Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              {t('calculator.selectScheme')}
            </label>
            <select
              id="select-calculator-scheme"
              value={selectedSchemeId}
              onChange={(e) => handleSchemeChange(e.target.value)}
              className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-900 focus:outline-none min-h-[48px] font-semibold text-blue-950 cursor-pointer"
            >
              {schemes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} - {locale === 'hi' ? s.nameHi : s.name} (Max ~₹{(s.terms.maxLoanAmountNumeric / 100000).toFixed(1)}L)
                </option>
              ))}
              <option value="custom">✏️ {t('calculator.customScheme')}</option>
            </select>
          </div>

          {/* Women Concession Toggle */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                Women Entrepreneur Concession
              </span>
              <p className="text-[11px] text-amber-800">
                {t('calculator.interestRebateNote')}
              </p>
            </div>
            <button
              type="button"
              id="btn-toggle-women-rebate"
              onClick={() => setIsWomenApplicant(!isWomenApplicant)}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                isWomenApplicant ? 'bg-amber-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-xs absolute top-0.5 transition-transform ${
                  isWomenApplicant ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* 1. Principal Loan Amount */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                {t('calculator.loanAmount')}
              </label>
              <div className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-950 rounded-lg border border-blue-200 font-mono font-bold text-sm">
                <span>₹</span>
                <span>{principal.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <input
              id="input-calc-principal"
              type="range"
              min="20000"
              max="5000000"
              step="10000"
              value={principal}
              onChange={(e) => setPrincipal(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-900"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>₹20,000</span>
              <span>₹25 Lakhs</span>
              <span>₹50 Lakhs</span>
            </div>
          </div>

          {/* 2. Interest Rate */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                {t('calculator.interestRate')}
              </label>
              <div className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-950 rounded-lg border border-blue-200 font-mono font-bold text-sm">
                <span>{effectiveRate.toFixed(1)}%</span>
                <span className="text-[10px] text-slate-500">p.a.</span>
              </div>
            </div>
            <input
              id="input-calc-rate"
              type="range"
              min="2.0"
              max="14.0"
              step="0.25"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-900"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>2% (Concessional)</span>
              <span>6% (Standard NSFDC)</span>
              <span>14% (Commercial)</span>
            </div>
          </div>

          {/* 3. Tenure */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                {t('calculator.tenureMonths')}
              </label>
              <div className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-950 rounded-lg border border-blue-200 font-mono font-bold text-sm">
                <span>{tenureMonths} Months</span>
                <span className="text-[10px] text-slate-500">
                  ({(tenureMonths / 12).toFixed(1)} yrs)
                </span>
              </div>
            </div>
            <input
              id="input-calc-tenure"
              type="range"
              min="6"
              max="120"
              step="6"
              value={tenureMonths}
              onChange={(e) => setTenureMonths(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-900"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>6 Months</span>
              <span>3 Years (36M)</span>
              <span>5 Years (60M)</span>
              <span>10 Years (120M)</span>
            </div>
          </div>

          {/* 4. Moratorium Period */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                {t('calculator.moratoriumMonths')} (Gestation)
              </label>
              <div className="flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-950 rounded-lg border border-amber-200 font-mono font-bold text-sm">
                <span>{moratoriumMonths} Months</span>
              </div>
            </div>
            <input
              id="input-calc-moratorium"
              type="range"
              min="0"
              max="24"
              step="1"
              value={moratoriumMonths}
              onChange={(e) => setMoratoriumMonths(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
            />
            <p className="text-[11px] text-slate-500">
              {t('calculator.moratoriumNote')}
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Results Summary Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main EMI Highlight Box */}
          <div className="bg-gradient-to-br from-blue-900 to-blue-950 text-white rounded-2xl p-6 shadow-md border border-blue-800 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
              {t('calculator.monthlyEmi')}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-light text-blue-200">₹</span>
              <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                {calculation.monthlyEmi.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-blue-200">/ month</span>
            </div>

            <div className="border-t border-blue-800/80 pt-4 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-blue-300 block">{t('calculator.principalAmount')}</span>
                <span className="text-base font-bold text-white">
                  ₹{calculation.principalAmount.toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-amber-300 block">{t('calculator.totalInterest')}</span>
                <span className="text-base font-bold text-amber-300">
                  ₹{calculation.totalInterest.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="border-t border-blue-800/80 pt-3 flex justify-between items-center text-xs">
              <span className="text-blue-200">{t('calculator.totalRepayment')}</span>
              <span className="text-base font-extrabold text-white">
                ₹{calculation.totalRepayment.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Visual Breakdown Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              {t('calculator.summaryTab')}
            </h4>

            {/* Split Bar */}
            <div className="h-4 w-full rounded-full overflow-hidden flex bg-slate-100">
              <div
                className="bg-blue-900 h-full transition-all duration-500"
                style={{ width: `${principalRatio}%` }}
                title={`Principal: ${principalRatio}%`}
              />
              <div
                className="bg-amber-500 h-full transition-all duration-500"
                style={{ width: `${interestRatio}%` }}
                title={`Interest: ${interestRatio}%`}
              />
            </div>

            <div className="flex justify-between items-center text-xs pt-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-900" />
                <span className="text-slate-600 font-medium">Principal ({principalRatio}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-slate-600 font-medium">Interest ({interestRatio}%)</span>
              </div>
            </div>

            <button
              id="btn-calc-find-partners"
              type="button"
              onClick={handleGoToPartners}
              className="w-full mt-3 py-3 px-4 bg-amber-500 hover:bg-amber-600 text-blue-950 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 min-h-[48px] cursor-pointer"
            >
              <MapPin className="w-4 h-4" />
              <span>{t('common.findNearbyPartners')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Amortization Schedule Table */}
      <div className="mt-8">
        <AmortizationTable calculation={calculation} />
      </div>
    </div>
  );
}
