'use client';

import React from 'react';
import { UserCheck, Briefcase, GraduationCap, Award, Check } from 'lucide-react';

export interface StepItem {
  num: number;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface StepIndicatorProps {
  currentStep: number;
  totalSteps?: number;
  onStepClick?: (step: number) => void;
  locale?: string;
  steps?: StepItem[];
}

export default function StepIndicator({
  currentStep,
  totalSteps = 4,
  onStepClick,
  locale = 'en',
  steps: customSteps,
}: StepIndicatorProps) {
  const steps: StepItem[] = customSteps || [
    { num: 1, title: locale === 'hi' ? 'विवरण व जाति' : 'Demographics', icon: UserCheck },
    { num: 2, title: locale === 'hi' ? 'व्यवसाय' : 'Occupation', icon: Briefcase },
    { num: 3, title: locale === 'hi' ? 'शिक्षा' : 'Education', icon: GraduationCap },
    { num: 4, title: locale === 'hi' ? 'योजनाएं' : 'Results', icon: Award },
  ];

  return (
    <div id="step-indicator" className="w-full mb-6">
      <div className="flex items-center justify-between relative max-w-xl mx-auto px-4">
        {/* Background track line */}
        <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1 bg-slate-200 z-0" />
        
        {/* Active progress bar */}
        <div
          className="absolute left-8 top-1/2 -translate-y-1/2 h-1 bg-blue-900 transition-all duration-300 z-0"
          style={{
            width: `${((Math.min(currentStep, totalSteps) - 1) / (totalSteps - 1)) * (100 - 14)}%`,
          }}
        />

        {steps.map((step) => {
          const Icon = step.icon;
          const isCompleted = currentStep > step.num;
          const isCurrent = currentStep === step.num;
          const isClickable = onStepClick && step.num <= currentStep;

          return (
            <div key={step.num} className="relative z-10 flex flex-col items-center">
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick(step.num)}
                className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-xs ${
                  isCompleted
                    ? 'bg-emerald-600 text-white cursor-pointer hover:bg-emerald-700'
                    : isCurrent
                    ? 'bg-blue-900 text-amber-300 ring-4 ring-blue-100 scale-105'
                    : 'bg-white border-2 border-slate-300 text-slate-500'
                }`}
                aria-label={`Step ${step.num}: ${step.title}`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5 stroke-[2.5]" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </button>
              <span
                className={`text-xs mt-1.5 font-semibold tracking-tight ${
                  isCurrent
                    ? 'text-blue-950 font-bold'
                    : isCompleted
                    ? 'text-emerald-800'
                    : 'text-slate-500'
                }`}
              >
                {step.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
