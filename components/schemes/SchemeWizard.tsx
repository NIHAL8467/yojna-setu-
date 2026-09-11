'use client';

import React, { useState, useMemo } from 'react';
import type { 
  SchemeMatchResult, 
  EducationLevel, 
  SocialCategory, 
  Gender, 
  UserProfile 
} from '@/types';
import { matchSchemes } from '@/lib/rules-engine';
import { getStandard2LEmi, CATEGORY_CONCESSIONS } from '@/lib/emi-calculator';
import { useApp } from '@/context/AppContext';
import { INDIAN_STATES } from '@/lib/constants';
import StepIndicator from '@/components/ui/StepIndicator';
import SchemeCard from './SchemeCard';
import SchemeDetailsModal from './SchemeDetailsModal';
import { 
  Store, 
  GraduationCap, 
  Truck, 
  Leaf, 
  Sparkles, 
  Scissors, 
  IndianRupee, 
  ArrowRight, 
  ArrowLeft,
  RotateCcw, 
  SlidersHorizontal,
  Info,
  Check,
  CheckCircle2,
  Users,
  MapPin,
  Calendar,
  UserCheck,
  Briefcase,
  Layers,
  ChevronRight,
  AlertCircle,
  Building2
} from 'lucide-react';

export default function SchemeWizard() {
  const { t, locale, userProfile, updateUserProfile, userCategory, setUserCategory } = useApp();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedResultForModal, setSelectedResultForModal] = useState<SchemeMatchResult | null>(null);
  const [step1Errors, setStep1Errors] = useState<string[]>([]);
  const [step2Error, setStep2Error] = useState<string | null>(null);
  const [step3Error, setStep3Error] = useState<string | null>(null);

  // Project Type (Occupation) options
  const occupations = [
    {
      id: 'business',
      label: locale === 'hi' ? 'लघु व्यापार / दुकान' : 'Small Business / Retail',
      desc: 'Grocery, retail kiosk, micro-trading, service center',
      icon: Store,
      color: 'text-blue-700 bg-blue-50 border-blue-200',
    },
    {
      id: 'artisan',
      label: locale === 'hi' ? 'कारीगर / हस्तशिल्प' : 'Artisan & Handicrafts',
      desc: 'Tailoring, leather craft, pottery, weaving, metal work',
      icon: Scissors,
      color: 'text-rose-700 bg-rose-50 border-rose-200',
    },
    {
      id: 'transport',
      label: locale === 'hi' ? 'वाणिज्यिक वाहन / ई-रिक्शा' : 'Transport / Commercial Vehicle',
      desc: 'E-rickshaw, auto-rickshaw, light goods carrier, taxi',
      icon: Truck,
      color: 'text-amber-700 bg-amber-50 border-amber-200',
    },
    {
      id: 'green_energy',
      label: locale === 'hi' ? 'हरित ऊर्जा / सौर' : 'Green Energy & Solar',
      desc: 'Solar rooftop, clean energy equipment, recycling unit',
      icon: Leaf,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
    {
      id: 'sanitation',
      label: locale === 'hi' ? 'स्वच्छता / अपशिष्ट प्रबंधन' : 'Mechanized Sanitation',
      desc: 'Vacuum suction machine, sewer cleaning, sanitation vehicle',
      icon: Sparkles,
      color: 'text-teal-700 bg-teal-50 border-teal-200',
    },
    {
      id: 'education',
      label: locale === 'hi' ? 'उच्च व व्यावसायिक शिक्षा' : 'Higher & Professional Education',
      desc: 'Engineering, Medical, MBA, Polytechnic, degree courses',
      icon: GraduationCap,
      color: 'text-purple-700 bg-purple-50 border-purple-200',
    },
  ];

  const costPresets = [
    { label: '₹50,000', value: 50000 },
    { label: '₹1.50 Lakhs', value: 150000 },
    { label: '₹2.00 Lakhs (Standard)', value: 200000, highlight: true },
    { label: '₹5.00 Lakhs', value: 500000 },
    { label: '₹10.00 Lakhs', value: 1000000 },
  ];

  const incomePresets = [
    { label: '₹1.20L (BPL)', value: 120000 },
    { label: '₹2.50L (Standard)', value: 250000 },
    { label: '₹3.50L', value: 350000 },
    { label: '₹5.00L (Govt Ceiling)', value: 500000 },
  ];

  const categories: SocialCategory[] = ['GENERAL', 'OBC', 'SC', 'ST'];

  // AUTOMATIC DETERMINISTIC SCHEME MATCHING (useMemo: ZERO state updates, ZERO infinite loops)
  const matchResults: SchemeMatchResult[] = useMemo(() => {
    return matchSchemes({
      projectType: userProfile.occupation || '',
      estimatedCost: userProfile.projectCost ?? 0,
      familyIncome: userProfile.income ?? 0,
      educationLevel: userProfile.educationLevel || '',
      applicantCategory: userProfile.gender === 'female' ? 'female' : 'male',
      age: userProfile.age,
      state: userProfile.state,
      gender: userProfile.gender,
      category: userProfile.category,
    });
  }, [userProfile]);

  const eligibleCount = useMemo(() => {
    return matchResults.filter((r) => r.isEligible).length;
  }, [matchResults]);

  const standard2LEmi = getStandard2LEmi(userProfile.category);
  const subventionAmount = Math.max(0, 6499 - standard2LEmi);

  // Step 1 Validation & Proceed
  const handleNextFromStep1 = () => {
    const errors: string[] = [];
    if (!userProfile.state || userProfile.state.trim() === '') {
      errors.push(locale === 'hi' ? 'राज्य (State)' : 'State');
    }
    if (userProfile.age === null || userProfile.age === undefined || userProfile.age < 18 || userProfile.age > 65) {
      errors.push(locale === 'hi' ? 'आयु 18-65 वर्ष (Age)' : 'Age (between 18-65 years)');
    }
    if (!userProfile.gender) {
      errors.push(locale === 'hi' ? 'लिंग (Gender)' : 'Gender');
    }
    if (userProfile.income === null || userProfile.income === undefined || userProfile.income <= 0) {
      errors.push(locale === 'hi' ? 'वार्षिक पारिवारिक आय (Annual Income)' : 'Annual Family Income');
    }
    if (userProfile.projectCost === null || userProfile.projectCost === undefined || userProfile.projectCost <= 0) {
      errors.push(locale === 'hi' ? 'ऋण आवश्यकता / लागत (Loan Requirement)' : 'Loan Requirement / Cost');
    }
    if (!userProfile.category) {
      errors.push(locale === 'hi' ? 'जाति वर्ग (Social Category / Caste)' : 'Social Category (Caste)');
    }

    if (errors.length > 0) {
      setStep1Errors(errors);
      return;
    }

    setStep1Errors([]);
    setCurrentStep(2);
  };

  // Step 2 Validation & Proceed
  const handleNextFromStep2 = () => {
    if (!userProfile.occupation || userProfile.occupation.trim() === '') {
      setStep2Error(
        locale === 'hi' 
          ? 'कृपया अपना व्यवसाय / कार्यक्षेत्र चुनें' 
          : 'Please select an Occupation / Sector to continue'
      );
      return;
    }
    setStep2Error(null);
    setCurrentStep(3);
  };

  // Step 3 Validation & Proceed to Results
  const handleNextFromStep3 = () => {
    if (!userProfile.educationLevel || userProfile.educationLevel.trim() === '') {
      setStep3Error(
        locale === 'hi'
          ? 'कृपया अपनी शैक्षणिक योग्यता चुनें'
          : 'Please select your Education Level to view matched schemes'
      );
      return;
    }
    setStep3Error(null);
    setCurrentStep(4);
  };

  const handleResetProfile = () => {
    updateUserProfile({
      age: null,
      state: '',
      district: '',
      gender: null,
      occupation: '',
      income: null,
      category: null,
      projectCost: null,
      educationLevel: '',
    });
    setStep1Errors([]);
    setStep2Error(null);
    setStep3Error(null);
    setCurrentStep(1);
  };

  return (
    <div id="scheme-wizard-container" className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 mb-2">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0F294A] tracking-tight leading-tight">
          {locale === 'hi' 
            ? 'अपनी पात्रता व श्रेणी अनुसार योजनाएं खोजें'
            : 'Find Schemes Matched to Your Profile & Category'}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          {locale === 'hi'
            ? 'आयु, राज्य, लिंग, व्यवसाय, आय और जाति वर्ग भरें — चरणबद्ध रूप से उपयुक्त योजनाएं एवं रियायती ईएमआई देखें।'
            : 'Fill in your details step-by-step to calculate eligible central and state affirmative schemes with concessional EMIs.'}
        </p>
      </div>

      {/* Reusable Step Indicator */}
      <StepIndicator
        currentStep={currentStep}
        totalSteps={4}
        onStepClick={(step) => {
          if (step < currentStep) {
            setCurrentStep(step);
          } else if (step === 2 && currentStep === 1) {
            handleNextFromStep1();
          } else if (step === 3 && currentStep === 2) {
            handleNextFromStep2();
          }
        }}
        locale={locale}
      />

      {/* ========================================================================= */}
      {/* STEP 1: Applicant Demographics & Financial Parameters + Social Category */}
      {/* ========================================================================= */}
      {currentStep === 1 && (
        <div id="step-1-container" className="space-y-6">
          {/* A. DEMOGRAPHIC CONTROLS CARD: Age, State, District, Gender, Income, Cost */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-blue-900" />
                <span>1. Applicant Demographics & Financial Parameters</span>
              </span>
              <button
                type="button"
                onClick={handleResetProfile}
                className="text-xs text-slate-500 hover:text-blue-900 flex items-center gap-1 font-semibold cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* State */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-800" />
                  <span>State (राज्य) *</span>
                </label>
                <select
                  id="select-profile-state"
                  value={userProfile.state || ''}
                  onChange={(e) => {
                    updateUserProfile({ state: e.target.value });
                    if (step1Errors.length > 0) setStep1Errors([]);
                  }}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-900 focus:outline-none min-h-[42px] font-semibold text-blue-950 cursor-pointer"
                >
                  <option value="">-- Select State (राज्य चुनें) --</option>
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* District / City */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-blue-800" />
                  <span>District / City (जिला / शहर)</span>
                </label>
                <input
                  id="input-profile-district"
                  type="text"
                  placeholder="e.g. Ranchi, Varanasi"
                  value={userProfile.district || ''}
                  onChange={(e) => updateUserProfile({ district: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-900 focus:outline-none min-h-[42px] font-semibold text-blue-950"
                />
              </div>

              {/* Age */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-800" />
                    <span>Age (आयु) *</span>
                  </label>
                  <div className="px-2.5 py-0.5 bg-blue-50 text-[#0F294A] rounded-lg border border-blue-200 font-bold text-xs tabular-nums">
                    {userProfile.age ? `${userProfile.age} Years` : 'Unselected'}
                  </div>
                </div>
                <input
                  id="input-profile-age-num"
                  type="number"
                  min="18"
                  max="65"
                  placeholder="Enter age (18 - 65 yrs)"
                  value={userProfile.age ?? ''}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : null;
                    updateUserProfile({ age: val });
                    if (step1Errors.length > 0) setStep1Errors([]);
                  }}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-900 focus:outline-none min-h-[42px] font-semibold text-blue-950"
                />
                <input
                  id="input-profile-age"
                  type="range"
                  min="18"
                  max="65"
                  step="1"
                  value={userProfile.age ?? 18}
                  onChange={(e) => {
                    updateUserProfile({ age: Number(e.target.value) });
                    if (step1Errors.length > 0) setStep1Errors([]);
                  }}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-900"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>18 yrs (Min)</span>
                  <span className="text-blue-900 font-semibold">{userProfile.age ? `${userProfile.age} yrs` : '--'}</span>
                  <span>65 yrs (Max)</span>
                </div>
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-blue-800" />
                  <span>Gender (लिंग) *</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['male', 'female', 'transgender'] as Gender[]).map((g) => (
                    <button
                      key={g}
                      type="button"
                      id={`btn-gender-${g}`}
                      onClick={() => {
                        updateUserProfile({ gender: g });
                        if (step1Errors.length > 0) setStep1Errors([]);
                      }}
                      className={`py-2 px-2 text-center rounded-xl border text-xs font-bold capitalize transition-all cursor-pointer ${
                        userProfile.gender === g
                          ? 'border-blue-900 bg-blue-900 text-white shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {g === 'female' ? 'Female ♀' : g === 'male' ? 'Male ♂' : 'Trans'}
                    </button>
                  ))}
                </div>
                {userProfile.gender === 'female' && (
                  <span className="text-[11px] text-amber-800 font-semibold block">
                    ⭐ Eligible for Mahila Samriddhi & 0.5% interest rebate!
                  </span>
                )}
              </div>
            </div>

            {/* Income and Cost Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
              {/* Household Income */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Annual Family Income (वार्षिक आय) *
                  </label>
                  <div className="flex items-center gap-1 px-3 py-1 bg-slate-50 text-[#0F294A] rounded-lg border border-slate-200 font-bold text-xs tabular-nums">
                    <span>₹</span>
                    <span>{userProfile.income !== null && userProfile.income !== undefined ? userProfile.income.toLocaleString('en-IN') : '0'}</span>
                  </div>
                </div>

                <input
                  id="input-profile-income-num"
                  type="number"
                  placeholder="Enter annual income in ₹ (e.g. 250000)"
                  value={userProfile.income ?? ''}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : null;
                    updateUserProfile({ income: val });
                    if (step1Errors.length > 0) setStep1Errors([]);
                  }}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-900 focus:outline-none min-h-[42px] font-semibold text-blue-950"
                />

                <input
                  id="input-profile-income"
                  type="range"
                  min="50000"
                  max="600000"
                  step="10000"
                  value={userProfile.income ?? 50000}
                  onChange={(e) => {
                    updateUserProfile({ income: Number(e.target.value) });
                    if (step1Errors.length > 0) setStep1Errors([]);
                  }}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-900"
                />

                <div className="flex flex-wrap gap-1.5">
                  {incomePresets.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => {
                        updateUserProfile({ income: p.value });
                        if (step1Errors.length > 0) setStep1Errors([]);
                      }}
                      className={`px-2 py-1 text-[11px] font-semibold rounded-md border transition-all cursor-pointer ${
                        userProfile.income === p.value
                          ? 'bg-blue-900 text-white border-blue-900'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Project Cost / Loan Requirement */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Loan Requirement / Cost (ऋण आवश्यकता) *
                  </label>
                  <div className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-[#0F294A] rounded-lg border border-blue-200 font-bold text-xs tabular-nums">
                    <span>₹</span>
                    <span>{userProfile.projectCost !== null && userProfile.projectCost !== undefined ? userProfile.projectCost.toLocaleString('en-IN') : '0'}</span>
                  </div>
                </div>

                <input
                  id="input-profile-cost-num"
                  type="number"
                  placeholder="Enter loan requirement in ₹ (e.g. 200000)"
                  value={userProfile.projectCost ?? ''}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : null;
                    updateUserProfile({ projectCost: val });
                    if (step1Errors.length > 0) setStep1Errors([]);
                  }}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-900 focus:outline-none min-h-[42px] font-semibold text-blue-950"
                />

                <input
                  id="input-profile-cost"
                  type="range"
                  min="25000"
                  max="5000000"
                  step="25000"
                  value={userProfile.projectCost ?? 25000}
                  onChange={(e) => {
                    updateUserProfile({ projectCost: Number(e.target.value) });
                    if (step1Errors.length > 0) setStep1Errors([]);
                  }}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-900"
                />

                <div className="flex flex-wrap gap-1.5">
                  {costPresets.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => {
                        updateUserProfile({ projectCost: p.value });
                        if (step1Errors.length > 0) setStep1Errors([]);
                      }}
                      className={`px-2 py-1 text-[11px] font-semibold rounded-md border transition-all cursor-pointer ${
                        userProfile.projectCost === p.value
                          ? 'bg-blue-900 text-white border-blue-900'
                          : p.highlight
                          ? 'bg-amber-100 text-amber-950 border-amber-300 font-bold'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* B. MERGED SECTION: Social Category (Caste) — Concessional Subvention Benchmark */}
          <div className="bg-white rounded-2xl border border-blue-200 p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-800 shrink-0" />
                  <span>2. Social Category (Caste) — Concessional Subvention Benchmark *</span>
                </span>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select your social category to calculate affirmative interest concessions:
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-md bg-blue-50 text-blue-950 border border-blue-200 self-start sm:self-auto">
                Selected: <span className="text-blue-700 underline">{userProfile.category || 'None selected'}</span>
              </span>
            </div>

            {/* 4 Category Pills */}
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
              {categories.map((cat) => {
                const isSelected = userProfile.category === cat;
                const benchmark = getStandard2LEmi(cat);
                const concession = CATEGORY_CONCESSIONS[cat];
                return (
                  <button
                    key={cat}
                    type="button"
                    id={`btn-profile-cat-${cat}`}
                    onClick={() => {
                      updateUserProfile({ category: cat });
                      setUserCategory(cat);
                      if (step1Errors.length > 0) setStep1Errors([]);
                    }}
                    className={`p-3 sm:p-3.5 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between min-h-[90px] sm:min-h-[96px] ${
                      isSelected
                        ? 'border-blue-900 bg-blue-50/90 ring-2 ring-blue-900 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-blue-950 tracking-wide">
                          {concession.label}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-blue-900 shrink-0" />
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        ₹2L Loan EMI:
                      </span>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-baseline justify-between flex-wrap gap-1">
                      <span className="text-base sm:text-lg font-black text-blue-950">
                        ₹{benchmark.toLocaleString('en-IN')}
                        <span className="text-[10px] font-normal text-slate-500">/mo</span>
                      </span>
                      {concession.monthlySubventionOn2L > 0 && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          -₹{concession.monthlySubventionOn2L}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Validation Feedback & Step 1 Navigation Button */}
          {step1Errors.length > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>Please fill in the required fields before continuing:</span>
              </div>
              <ul className="list-disc list-inside pl-1 text-red-700 space-y-0.5">
                {step1Errors.map((err) => (
                  <li key={err}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              id="btn-step-1-next"
              type="button"
              onClick={handleNextFromStep1}
              className="px-6 py-3.5 bg-blue-900 hover:bg-blue-950 text-white font-bold text-sm rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>Next: Occupation & Sector (आगे बढ़ें)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: Occupation / Sector (व्यवसाय व कार्यक्षेत्र)                       */}
      {/* ========================================================================= */}
      {currentStep === 2 && (
        <div id="step-2-container" className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-blue-900" />
                  <span>2. Occupation / Sector (व्यवसाय व कार्यक्षेत्र) *</span>
                </span>
                <p className="text-xs text-slate-500 mt-1">
                  Choose your trade or proposed project sector for sector-specific schemes:
                </p>
              </div>
              {userProfile.occupation && (
                <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-lg">
                  Selected
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {occupations.map((item) => {
                const Icon = item.icon;
                const isSelected = userProfile.occupation === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    id={`btn-profile-occ-${item.id}`}
                    onClick={() => {
                      updateUserProfile({ occupation: item.id });
                      setStep2Error(null);
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between min-h-[90px] cursor-pointer ${
                      isSelected
                        ? 'border-blue-900 bg-blue-50/80 shadow-xs ring-2 ring-blue-900/15'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className={`p-2 rounded-lg border ${item.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-blue-900 text-amber-300 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <div className="mt-2">
                      <p className="text-xs font-bold text-blue-950">{item.label}</p>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{item.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {step2Error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{step2Error}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              id="btn-step-2-back"
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-5 py-3 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back: Demographics (वापस जाएं)</span>
            </button>

            <button
              id="btn-step-2-next"
              type="button"
              onClick={handleNextFromStep2}
              className="px-6 py-3.5 bg-blue-900 hover:bg-blue-950 text-white font-bold text-sm rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>Next: Education Level (आगे बढ़ें)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: Education Level (शैक्षणिक योग्यता)                                */}
      {/* ========================================================================= */}
      {currentStep === 3 && (
        <div id="step-3-container" className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-blue-900" />
                <span>3. Education Level (शैक्षणिक योग्यता) *</span>
              </span>
              <p className="text-xs text-slate-500 mt-1">
                Certain schemes (e.g. Higher Education Loan, PMEGP higher slabs) have minimum qualification benchmarks:
              </p>
            </div>

            <div className="max-w-md space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Select Your Educational Qualification
              </label>
              <select
                id="select-profile-edu"
                value={userProfile.educationLevel || ''}
                onChange={(e) => {
                  updateUserProfile({ educationLevel: e.target.value as EducationLevel });
                  setStep3Error(null);
                }}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-900 focus:outline-none font-medium text-blue-950 cursor-pointer min-h-[44px]"
              >
                <option value="">-- Select Education Level (शैक्षणिक योग्यता चुनें) --</option>
                <option value="none">Below 10th</option>
                <option value="10th_pass">10th Standard Pass</option>
                <option value="12th_pass">12th Standard Pass</option>
                <option value="graduate">Graduate (Degree)</option>
                <option value="post_graduate">Post Graduate</option>
              </select>
            </div>
          </div>

          {step3Error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{step3Error}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              id="btn-step-3-back"
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-5 py-3 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back: Occupation (वापस जाएं)</span>
            </button>

            <button
              id="btn-step-3-next"
              type="button"
              onClick={handleNextFromStep3}
              className="px-6 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Find Matching Schemes (पात्र योजनाएं खोजें)</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: Live Auto-Matched Schemes Results & Cards                         */}
      {/* ========================================================================= */}
      {currentStep === 4 && (
        <div id="step-4-container" className="space-y-6">
          {/* Navigation Bar to Modify or Reset */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <button
              id="btn-modify-criteria"
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 border border-slate-300 bg-slate-50 hover:bg-slate-100 text-blue-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Modify Criteria / Demographics (विवरण बदलें)</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 hidden sm:inline">
                Profile: {userProfile.state} • {userProfile.category} • {userProfile.occupation}
              </span>
              <button
                type="button"
                onClick={handleResetProfile}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-red-700 font-semibold border border-slate-200 rounded-lg hover:bg-red-50 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Search</span>
              </button>
            </div>
          </div>

          {/* 3. LIVE AUTO-MATCHED SCHEMES RESULTS SUMMARY BANNER */}
          <div className="bg-gradient-to-r from-blue-950 to-blue-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 sm:px-3 py-1 bg-emerald-400 text-blue-950 text-xs font-black rounded-full uppercase tracking-wider whitespace-nowrap">
                    ✓ {eligibleCount} Eligible Schemes Auto-Matched
                  </span>
                  <span className="text-xs text-blue-200 truncate">
                    {userProfile.state || 'All India'} • Age {userProfile.age ?? '--'} • {(userProfile.gender || '').toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-blue-200 leading-relaxed">
                  Auto-matched for <span className="font-bold text-white">{(userProfile.occupation || '').toUpperCase()}</span> sector with annual income ₹{(userProfile.income ?? 0).toLocaleString('en-IN')}.
                </p>
              </div>

              {/* Category Concessional Callout */}
              <div className="bg-blue-900/90 border border-blue-700/80 rounded-xl px-4 py-2.5 sm:py-3 text-left sm:text-right self-stretch sm:self-auto shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block">
                  {userProfile.category || 'General'} Concessional EMI
                </span>
                <span className="text-xl sm:text-2xl font-black text-white">
                  ₹{standard2LEmi.toLocaleString('en-IN')}
                  <span className="text-xs font-normal text-blue-300">/mo</span>
                </span>
                <span className="text-[10px] text-emerald-300 block font-semibold">
                  {subventionAmount > 0 
                    ? `(₹${subventionAmount}/mo affirmative relief)` 
                    : 'Standard institutional benchmark'}
                </span>
              </div>
            </div>
          </div>

          {/* 4. SCHEME RESULT CARDS LIST */}
          <div className="space-y-4">
            {matchResults.length > 0 ? (
              matchResults.map((result) => (
                <SchemeCard
                  key={result.scheme.id}
                  result={result}
                  onViewDetails={(res) => setSelectedResultForModal(res)}
                />
              ))
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
                <p className="text-base font-bold text-slate-800">{t('schemes.noMatchTitle')}</p>
                <p className="text-xs text-slate-600 max-w-md mx-auto">{t('schemes.noMatchDesc')}</p>
                <button
                  type="button"
                  onClick={handleResetProfile}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{t('common.reset')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Scheme Details Modal */}
      <SchemeDetailsModal
        result={selectedResultForModal}
        onClose={() => setSelectedResultForModal(null)}
      />
    </div>
  );
}
