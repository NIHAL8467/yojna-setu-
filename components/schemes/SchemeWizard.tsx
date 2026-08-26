'use client';

import React, { useState } from 'react';
import type { SchemeFilterInput, SchemeMatchResult, EducationLevel, ApplicantCategory } from '@/types';
import { matchSchemes } from '@/lib/rules-engine';
import { useApp } from '@/context/AppContext';
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
  Check
} from 'lucide-react';

export default function SchemeWizard() {
  const { t, locale } = useApp();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedResultForModal, setSelectedResultForModal] = useState<SchemeMatchResult | null>(null);

  // Form State
  const [formData, setFormData] = useState<SchemeFilterInput>({
    projectType: 'business',
    estimatedCost: 150000,
    familyIncome: 250000,
    educationLevel: '10th_pass',
    applicantCategory: 'male',
  });

  const [hasCalculated, setHasCalculated] = useState(false);
  const [results, setResults] = useState<SchemeMatchResult[]>([]);

  // Project Type Options
  const projectTypes = [
    {
      id: 'business',
      label: t('schemes.projectTypeBusiness'),
      desc: 'Small shop, grocery, service center, retail kiosk',
      icon: Store,
      color: 'text-blue-700 bg-blue-50 border-blue-200',
    },
    {
      id: 'education',
      label: t('schemes.projectTypeEducation'),
      desc: 'Engineering, Medical, MBA, Tech courses in India & Abroad',
      icon: GraduationCap,
      color: 'text-purple-700 bg-purple-50 border-purple-200',
    },
    {
      id: 'transport',
      label: t('schemes.projectTypeTransport'),
      desc: 'Auto-rickshaw, commercial taxi, delivery vehicle, e-cart',
      icon: Truck,
      color: 'text-amber-700 bg-amber-50 border-amber-200',
    },
    {
      id: 'green_energy',
      label: t('schemes.projectTypeGreen'),
      desc: 'Solar rooftop, E-rickshaw, organic farming, waste recycling',
      icon: Leaf,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
    {
      id: 'sanitation',
      label: t('schemes.projectTypeSanitation'),
      desc: 'Vacuum suction machine, sewer cleaning equipment',
      icon: Sparkles,
      color: 'text-teal-700 bg-teal-50 border-teal-200',
    },
    {
      id: 'artisan',
      label: t('schemes.projectTypeArtisan'),
      desc: 'Tailoring, leather craft, pottery, weaving, handicrafts',
      icon: Scissors,
      color: 'text-rose-700 bg-rose-50 border-rose-200',
    },
  ];

  // Presets for Cost & Income
  const costPresets = [
    { label: '₹50,000 (Micro)', value: 50000 },
    { label: '₹1.50 Lakhs (Standard)', value: 150000 },
    { label: '₹5.00 Lakhs (Medium)', value: 500000 },
    { label: '₹10.00 Lakhs (Higher)', value: 1000000 },
    { label: '₹25.00 Lakhs (Commercial)', value: 2500000 },
  ];

  const incomePresets = [
    { label: '₹1.20 Lakhs/yr (BPL)', value: 120000 },
    { label: '₹2.50 Lakhs/yr', value: 250000 },
    { label: '₹3.50 Lakhs/yr', value: 350000 },
    { label: '₹4.80 Lakhs/yr (Near Limit)', value: 480000 },
  ];

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    } else {
      executeMatching();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const executeMatching = () => {
    const res = matchSchemes(formData);
    setResults(res);
    setHasCalculated(true);
  };

  const handleReset = () => {
    setFormData({
      projectType: 'business',
      estimatedCost: 150000,
      familyIncome: 250000,
      educationLevel: '10th_pass',
      applicantCategory: 'male',
    });
    setHasCalculated(false);
    setCurrentStep(1);
  };

  return (
    <div id="scheme-wizard-container" className="max-w-5xl mx-auto space-y-6">
      {/* Wizard Header */}
      <div className="text-center space-y-2 mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-950 tracking-tight">
          {t('schemes.title')}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
          {t('schemes.subtitle')}
        </p>
      </div>

      {!hasCalculated ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-8">
          <StepIndicator
            currentStep={currentStep}
            totalSteps={4}
            onStepClick={(s) => setCurrentStep(s)}
            locale={locale}
          />

          {/* STEP 1: Project Type */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-lg font-bold text-blue-950">
                  {t('schemes.step1Title')}
                </h2>
                <p className="text-xs text-slate-600">
                  {t('schemes.step1Desc')}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {projectTypes.map((item) => {
                  const Icon = item.icon;
                  const isSelected = formData.projectType === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`project-type-${item.id}`}
                      type="button"
                      onClick={() => setFormData({ ...formData, projectType: item.id })}
                      className={`p-4 rounded-xl border-2 text-left transition-all flex flex-col justify-between min-h-[110px] cursor-pointer ${
                        isSelected
                          ? 'border-blue-900 bg-blue-50/70 shadow-xs ring-2 ring-blue-900/10'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className={`p-2.5 rounded-lg border ${item.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        {isSelected && (
                          <span className="w-6 h-6 rounded-full bg-blue-900 text-amber-300 flex items-center justify-center">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <div className="mt-3">
                        <p className="text-sm font-bold text-blue-950">{item.label}</p>
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{item.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Project Cost */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200 max-w-2xl mx-auto">
              <div className="border-b border-slate-100 pb-3 text-center sm:text-left">
                <h2 className="text-lg font-bold text-blue-950">
                  {t('schemes.step2Title')}
                </h2>
                <p className="text-xs text-slate-600">
                  {t('schemes.step2Desc')}
                </p>
              </div>

              {/* Display Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center">
                <span className="text-xs font-semibold uppercase text-blue-800 tracking-wider">
                  Selected Financial Requirement
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold text-blue-950 mt-1 flex items-center justify-center gap-1">
                  <IndianRupee className="w-7 h-7 text-blue-900" />
                  <span>{formData.estimatedCost.toLocaleString('en-IN')}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  ({(formData.estimatedCost / 100000).toFixed(2)} Lakh Rupees)
                </p>
              </div>

              {/* Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-500 font-medium">
                  <span>₹25,000</span>
                  <span>₹50,00,000 (50 Lakhs Max)</span>
                </div>
                <input
                  id="input-project-cost-slider"
                  type="range"
                  min="25000"
                  max="5000000"
                  step="25000"
                  value={formData.estimatedCost}
                  onChange={(e) =>
                    setFormData({ ...formData, estimatedCost: Number(e.target.value) })
                  }
                  className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-900"
                />
              </div>

              {/* Quick Select Presets */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  {t('schemes.quickSelectPresets')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {costPresets.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, estimatedCost: preset.value })}
                      className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all min-h-[38px] cursor-pointer ${
                        formData.estimatedCost === preset.value
                          ? 'bg-blue-900 text-white border-blue-900'
                          : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Annual Family Income */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200 max-w-2xl mx-auto">
              <div className="border-b border-slate-100 pb-3 text-center sm:text-left">
                <h2 className="text-lg font-bold text-blue-950">
                  {t('schemes.step3Title')}
                </h2>
                <p className="text-xs text-slate-600">
                  {t('schemes.step3Desc')}
                </p>
              </div>

              {/* Display Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center">
                <span className="text-xs font-semibold uppercase text-slate-600 tracking-wider">
                  Annual Household Income
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold text-blue-950 mt-1 flex items-center justify-center gap-1">
                  <IndianRupee className="w-7 h-7 text-blue-900" />
                  <span>{formData.familyIncome.toLocaleString('en-IN')}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Per Annum (All Family Members)</p>
              </div>

              {/* Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-500 font-medium">
                  <span>₹50,000</span>
                  <span className="text-amber-700 font-bold">₹5,00,000 (NSFDC Ceiling)</span>
                </div>
                <input
                  id="input-family-income-slider"
                  type="range"
                  min="50000"
                  max="600000"
                  step="10000"
                  value={formData.familyIncome}
                  onChange={(e) =>
                    setFormData({ ...formData, familyIncome: Number(e.target.value) })
                  }
                  className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-900"
                />
              </div>

              {/* Presets */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  {t('schemes.quickSelectPresets')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {incomePresets.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, familyIncome: preset.value })}
                      className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all min-h-[38px] cursor-pointer ${
                        formData.familyIncome === preset.value
                          ? 'bg-blue-900 text-white border-blue-900'
                          : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Guideline Banner */}
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{t('schemes.incomeWarningLimit')}</span>
              </div>
            </div>
          )}

          {/* STEP 4: Applicant Category & Education */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in duration-200 max-w-2xl mx-auto">
              <div className="border-b border-slate-100 pb-3 text-center sm:text-left">
                <h2 className="text-lg font-bold text-blue-950">
                  {t('schemes.step4Title')}
                </h2>
                <p className="text-xs text-slate-600">
                  {t('schemes.step4Desc')}
                </p>
              </div>

              {/* Category Radio Group */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  {t('schemes.genderLabel')}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { id: 'male', label: t('schemes.genderMale') },
                    { id: 'female', label: t('schemes.genderFemale') },
                    { id: 'shg', label: t('schemes.genderShg') },
                    { id: 'safai_karamchari', label: t('schemes.genderSafai') },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, applicantCategory: cat.id as ApplicantCategory })
                      }
                      className={`p-3.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between min-h-[48px] cursor-pointer ${
                        formData.applicantCategory === cat.id
                          ? 'border-blue-900 bg-blue-50 text-blue-950 font-bold ring-1 ring-blue-900'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{cat.label}</span>
                      {formData.applicantCategory === cat.id && (
                        <Check className="w-4 h-4 text-blue-900 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Education Level */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  {t('schemes.educationStatus')}
                </label>
                <select
                  id="select-education-level"
                  value={formData.educationLevel}
                  onChange={(e) =>
                    setFormData({ ...formData, educationLevel: e.target.value as EducationLevel })
                  }
                  className="w-full px-4 py-3 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-900 focus:outline-none min-h-[48px] cursor-pointer"
                >
                  <option value="none">{t('schemes.eduNone')}</option>
                  <option value="10th_pass">{t('schemes.edu10th')}</option>
                  <option value="12th_pass">{t('schemes.edu12th')}</option>
                  <option value="graduate">{t('schemes.eduGraduate')}</option>
                  <option value="post_graduate">{t('schemes.eduPostGraduate')}</option>
                </select>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
            {currentStep > 1 ? (
              <button
                id="btn-wizard-back"
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors min-h-[48px] cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t('common.back')}</span>
              </button>
            ) : (
              <div />
            )}

            <button
              id="btn-wizard-next"
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-7 py-2.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-950 rounded-xl shadow-md hover:shadow transition-all min-h-[48px] cursor-pointer"
            >
              <span>{currentStep === 4 ? t('common.submit') : t('common.next')}</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        </div>
      ) : (
        /* RESULTS VIEW */
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Top Filter Summary & Reset Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                  {results.filter((r) => r.isEligible).length} Eligible Schemes Found
                </span>
                <span className="text-xs text-slate-500">
                  Target: {formData.projectType.toUpperCase()} | Budget: ₹{formData.estimatedCost.toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Ranked by scheme match confidence, concessional interest rates, and loan coverage.
              </p>
            </div>

            <button
              id="btn-modify-criteria"
              type="button"
              onClick={() => setHasCalculated(false)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-blue-950 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition-colors min-h-[44px] cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4 text-blue-900" />
              <span>{t('schemes.modifyCriteria')}</span>
            </button>
          </div>

          {/* Scheme Result Cards List */}
          <div className="space-y-4">
            {results.length > 0 ? (
              results.map((result) => (
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
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-xl text-xs font-bold"
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
