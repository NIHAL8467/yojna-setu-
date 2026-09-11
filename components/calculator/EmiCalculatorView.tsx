'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { getAllSchemes } from '@/lib/schemes';
import { 
  calculateEmiSchedule, 
  CATEGORY_CONCESSIONS, 
  calculateCategoryAdjustedEmi 
} from '@/lib/emi-calculator';
import type { Scheme, EmiCalculationResult, SocialCategory } from '@/types';
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
  Check,
  CheckCircle2,
  Users,
  ArrowLeft
} from 'lucide-react';

export default function EmiCalculatorView() {
  const { 
    t, 
    locale, 
    selectedSchemeForCalculator, 
    setSelectedSchemeForPartners, 
    setActiveTab,
    goBack,
    userCategory,
    setUserCategory
  } = useApp();

  const schemes = getAllSchemes();
  const defaultScheme = selectedSchemeForCalculator || schemes[0];

  const [selectedSchemeId, setSelectedSchemeId] = useState<string>(defaultScheme?.id || 'micro_credit_finance');
  const [isWomenApplicant, setIsWomenApplicant] = useState(false);
  const [principal, setPrincipal] = useState<number>(200000); // Defaults to ₹2,00,000 as requested
  const [interestRate, setInterestRate] = useState<number>(defaultScheme?.terms.interestRatePercentNumeric || 5.0);
  const [tenureMonths, setTenureMonths] = useState<number>(defaultScheme?.terms.maxTenureMonthsNumeric || 36);
  const [moratoriumMonths, setMoratoriumMonths] = useState<number>(defaultScheme?.terms.moratoriumMonthsNumeric || 3);

  const applySchemeDefaults = React.useCallback((scheme: Scheme) => {
    const loanAmt = Math.min(scheme.terms.maxLoanAmountNumeric, 200000);
    setPrincipal(loanAmt > 0 ? loanAmt : 200000);
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

  // Base calculation
  const calculation: EmiCalculationResult = calculateEmiSchedule(
    principal,
    effectiveRate,
    tenureMonths,
    moratoriumMonths
  );

  // Category Concessional Adjustments
  const categoryAdjustment = calculateCategoryAdjustedEmi(
    principal,
    calculation.monthlyEmi,
    userCategory
  );

  const finalMonthlyEmi = categoryAdjustment.adjustedEmi;

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

  const principalPresets = [
    { label: '₹50,000', value: 50000 },
    { label: '₹1 Lakh', value: 100000 },
    { label: '₹2 Lakhs (Standard)', value: 200000, highlight: true },
    { label: '₹5 Lakhs', value: 500000 },
    { label: '₹10 Lakhs', value: 1000000 },
  ];

  const categories: SocialCategory[] = ['GENERAL', 'OBC', 'SC', 'ST'];

  return (
    <div id="emi-calculator-view" className="max-w-5xl mx-auto space-y-6">
      {/* Go Back Button */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <button
          id="btn-calculator-go-back"
          type="button"
          onClick={goBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-200 shadow-2xs transition-all hover:text-[#003366] hover:border-blue-300 cursor-pointer"
          aria-label={locale === 'hi' ? 'पिछले पृष्ठ पर वापस जाएं' : 'Go back to previous page'}
        >
          <ArrowLeft className="w-4 h-4 text-[#003366]" />
          <span>{locale === 'hi' ? 'वापस जाएं (Go Back)' : 'Go Back'}</span>
        </button>
      </div>

      {/* Header */}
      <div className="text-center space-y-2 mb-6">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0F294A] tracking-tight leading-tight">
          {t('calculator.title')}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          {locale === 'hi' 
            ? 'जाति श्रेणी (Category / Caste) के अनुसार रियायती ब्याज दर व मासिक ईएमआई की सटीक गणना करें।'
            : 'Calculate reducing-balance monthly EMI with government concessional subventions based on Social Category.'}
        </p>
      </div>

      {/* Category / Caste Concession Bar */}
      <div className="bg-white rounded-2xl border border-blue-200 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <span className="text-xs font-bold text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-800 shrink-0" />
              <span>Select Category (Caste) — Concessional EMI Subvention</span>
            </span>
            <p className="text-xs text-slate-500 mt-0.5">
              Select your social category to check affirmative scheme eligibility and concessional terms:
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-md bg-blue-50 text-blue-950 border border-blue-200 self-start sm:self-auto">
            Active: <span className="text-blue-700 underline">{userCategory || 'None (Standard)'}</span>
          </span>
        </div>

        {/* 4 Category Selection Buttons Grid */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          {categories.map((cat) => {
            const isSelected = userCategory === cat;
            const concession = CATEGORY_CONCESSIONS[cat];
            return (
              <button
                key={cat}
                type="button"
                id={`btn-calc-category-${cat}`}
                onClick={() => setUserCategory(cat)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative flex items-center justify-between min-h-[56px] ${
                  isSelected
                    ? 'border-blue-900 bg-blue-50/80 ring-2 ring-blue-900 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span className="font-extrabold text-xs sm:text-sm text-blue-950 tracking-wide">
                  {concession.label}
                </span>
                {isSelected && (
                  <CheckCircle2 className="w-4 h-4 text-blue-900 shrink-0 ml-2" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* LEFT COLUMN: Input Form Controls (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 lg:p-7 shadow-xs space-y-6">
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
                {t('calculator.interestRebateNote')} (0.5% additional rebate)
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

          {/* 1. Principal Loan Amount with Presets */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                {t('calculator.loanAmount')}
              </label>
              <div className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-[#0F294A] rounded-lg border border-blue-200 font-bold text-sm tabular-nums">
                <span>₹</span>
                <span>{principal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Quick Amount Presets */}
            <div className="flex flex-wrap gap-2">
              {principalPresets.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setPrincipal(preset.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer min-h-[32px] ${
                    principal === preset.value
                      ? 'bg-blue-900 text-white shadow-xs'
                      : preset.highlight
                      ? 'bg-amber-100 text-amber-950 border border-amber-300 hover:bg-amber-200'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
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
              <span className="font-semibold text-blue-900">₹2 Lakhs</span>
              <span>₹50 Lakhs</span>
            </div>
          </div>

          {/* 2. Interest Rate */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                {t('calculator.interestRate')}
              </label>
              <div className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-[#0F294A] rounded-lg border border-blue-200 font-bold text-sm tabular-nums">
                <span>{effectiveRate.toFixed(1)}%</span>
                <span className="text-[10px] text-slate-500 font-medium">p.a.</span>
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
              <div className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-[#0F294A] rounded-lg border border-blue-200 font-bold text-sm tabular-nums">
                <span>{tenureMonths} Months</span>
                <span className="text-[10px] text-slate-500 font-medium">
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
              <span className="font-semibold text-blue-900">3 Years (36M)</span>
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
              <div className="flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-950 rounded-lg border border-amber-200 font-bold text-sm tabular-nums">
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
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                {t('calculator.monthlyEmi')} ({userCategory})
              </span>
              <span className="px-2 py-0.5 bg-blue-800 text-blue-200 text-[10px] font-bold rounded">
                Reducing Balance
              </span>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-light text-blue-200">₹</span>
              <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                {finalMonthlyEmi.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-blue-200">/ month</span>
            </div>

            {/* Category Subvention Highlight */}
            {categoryAdjustment.monthlySubvention > 0 && (
              <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-xl p-3 text-xs space-y-1">
                <div className="flex items-center justify-between text-emerald-300 font-bold">
                  <span>{userCategory} Affirmative Subvention:</span>
                  <span>-₹{categoryAdjustment.monthlySubvention.toLocaleString('en-IN')}/mo</span>
                </div>
                <div className="flex items-center justify-between text-emerald-200 text-[11px]">
                  <span>Total Government Savings (36 mos):</span>
                  <span className="font-bold">₹{categoryAdjustment.totalSubventionSavings.toLocaleString('en-IN')}</span>
                </div>
              </div>
            )}

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
