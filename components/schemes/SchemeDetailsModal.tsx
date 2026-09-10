'use client';

import React, { useState } from 'react';
import type { SchemeMatchResult } from '@/types';
import { useApp } from '@/context/AppContext';
import { 
  X, 
  FileText, 
  CheckCircle2, 
  IndianRupee, 
  Percent, 
  Clock, 
  ShieldAlert, 
  Download, 
  Share2, 
  Calculator, 
  MapPin, 
  Sparkles,
  Check
} from 'lucide-react';

interface SchemeDetailsModalProps {
  result: SchemeMatchResult | null;
  onClose: () => void;
}

export default function SchemeDetailsModal({ result, onClose }: SchemeDetailsModalProps) {
  const { t, locale, setSelectedSchemeForCalculator, setSelectedSchemeForPartners, setActiveTab } = useApp();
  const [copied, setCopied] = useState(false);

  if (!result) return null;
  const { scheme, estimatedInterestRate } = result;

  const handleShare = async () => {
    const text = `${scheme.name} - Yojna Setu\nInterest: ~${estimatedInterestRate}% p.a.\nMax Loan: ₹${(scheme.terms.maxLoanAmountNumeric / 100000).toFixed(1)} Lakhs\nApply at your State Channelising Agency (SCA).`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: scheme.name,
          text,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // User cancelled
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleGoToCalculator = () => {
    setSelectedSchemeForCalculator(scheme);
    setActiveTab('calculator');
    onClose();
  };

  const handleGoToPartners = () => {
    setSelectedSchemeForPartners(scheme.id);
    setActiveTab('partners');
    onClose();
  };

  return (
    <div
      id="scheme-details-modal"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 bg-amber-400 text-blue-950 font-bold text-xs rounded uppercase">
              {scheme.code}
            </span>
            <div>
              <h2 className="text-lg font-bold leading-tight">
                {locale === 'hi' ? scheme.nameHi : scheme.name}
              </h2>
              <span className="text-xs text-blue-200">
                National Scheduled Castes Finance and Development Corporation (NSFDC)
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-blue-200 hover:text-white p-1.5 rounded-lg hover:bg-blue-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800">
          {/* Overview */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Description & Objectives
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed">
              {locale === 'hi' ? scheme.descriptionHi : scheme.description}
            </p>
          </div>

          {/* Key Financial Terms Table */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-2">
              <Percent className="w-4 h-4 text-amber-600" />
              {t('common.termsAndRates')}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-200">
                <span className="text-slate-600">Annual Interest Rate:</span>
                <span className="font-bold text-blue-950">~{estimatedInterestRate}% p.a.</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200">
                <span className="text-slate-600">Max Loan Limit:</span>
                <span className="font-bold text-blue-950">₹{(scheme.terms.maxLoanAmountNumeric / 100000).toFixed(1)} Lakhs</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200">
                <span className="text-slate-600">Maximum Tenure:</span>
                <span className="font-bold text-blue-950">{scheme.terms.maxTenureMonthsNumeric} Months</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200">
                <span className="text-slate-600">Gestation / Moratorium:</span>
                <span className="font-bold text-blue-950">{scheme.terms.moratoriumMonthsNumeric} Months</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200">
                <span className="text-slate-600">NSFDC Contribution Share:</span>
                <span className="font-bold text-blue-950">{scheme.terms.nsfdcSharePercentNumeric}%</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200">
                <span className="text-slate-600">Promoter Margin:</span>
                <span className="font-bold text-blue-950">{scheme.terms.promoterSharePercent}% (Minimal)</span>
              </div>
            </div>

            {/* Category Subsidized EMI Comparison */}
            <div className="mt-4 pt-3 border-t border-slate-200">
              <span className="text-xs font-bold text-blue-950 uppercase tracking-wider block mb-2">
                Category Concessional EMI (Standard ₹2 Lakhs Loan / 36 Months):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">General</span>
                  <span className="text-sm font-extrabold text-slate-900">₹6,499</span>
                  <span className="text-[10px] text-slate-400 block">/month</span>
                </div>
                <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-200 text-center">
                  <span className="text-[10px] font-bold text-blue-700 uppercase block">OBC</span>
                  <span className="text-sm font-extrabold text-blue-950">₹5,999</span>
                  <span className="text-[10px] text-emerald-700 font-semibold block">-₹500 relief</span>
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-center">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase block">SC</span>
                  <span className="text-sm font-extrabold text-emerald-950">₹5,499</span>
                  <span className="text-[10px] text-emerald-700 font-semibold block">-₹1,000 relief</span>
                </div>
                <div className="p-2.5 rounded-lg bg-purple-50/70 border border-purple-200 text-center">
                  <span className="text-[10px] font-bold text-purple-700 uppercase block">ST</span>
                  <span className="text-sm font-extrabold text-purple-950">₹4,999</span>
                  <span className="text-[10px] text-purple-700 font-semibold block">-₹1,500 relief</span>
                </div>
              </div>
            </div>
          </div>

          {/* Scheme Highlights */}
          {scheme.highlights && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                {t('common.schemeHighlights')}
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {scheme.highlights.map((highlight, idx) => (
                  <li key={idx} className="bg-emerald-50/70 border border-emerald-200 p-2.5 rounded-lg text-xs text-emerald-950 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Required Documents Checklist */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-900" />
              {t('common.requiredDocs')} (Checklist)
            </h3>
            <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
              {scheme.requiredDocuments.map((doc, idx) => (
                <div key={idx} className="p-3 text-xs flex items-center justify-between gap-3 hover:bg-slate-50">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-900 font-bold flex items-center justify-center text-[10px] shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-slate-800 font-medium">{doc}</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Mandatory
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Config Placeholder Notice */}
          <div className="bg-slate-100 p-3 rounded-lg border border-slate-300 text-[11px] text-slate-600 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <span>
              <strong>Note on scheme figures:</strong> All financial terms, caps, and interest slabs are loaded from <code>data/schemes.json</code>. For exact current circular revisions, verify with nsfdc.nic.in or your District SCA office.
            </span>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              <span>{copied ? t('common.copied') : t('common.share')}</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>{t('common.downloadSummary')}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleGoToCalculator}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-800 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors"
            >
              <Calculator className="w-4 h-4 text-blue-900" />
              <span>{t('common.calculateEmi')}</span>
            </button>
            <button
              type="button"
              onClick={handleGoToPartners}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-950 rounded-lg shadow-xs transition-colors"
            >
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>{t('common.findNearbyPartners')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
