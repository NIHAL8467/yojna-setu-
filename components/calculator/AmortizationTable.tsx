'use client';

import React, { useState } from 'react';
import type { EmiCalculationResult } from '@/types';
import { useApp } from '@/context/AppContext';
import { exportAmortizationCsv } from '@/lib/emi-calculator';
import { Download, Printer, ChevronDown, ChevronUp, Sparkles, IndianRupee } from 'lucide-react';

interface AmortizationTableProps {
  calculation: EmiCalculationResult;
}

export default function AmortizationTable({ calculation }: AmortizationTableProps) {
  const { t } = useApp();
  const [isExpanded, setIsExpanded] = useState(false);
  const [displayCount, setDisplayCount] = useState(12);

  const { amortizationSchedule, moratoriumMonths } = calculation;

  const handleDownloadCsv = () => {
    const csvData = exportAmortizationCsv(calculation);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `YojnaSetu_EMI_Amortization_Schedule_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const visibleRows = isExpanded ? amortizationSchedule : amortizationSchedule.slice(0, displayCount);

  return (
    <div id="amortization-table-container" className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header with Export buttons */}
      <div className="bg-slate-50 border-b border-slate-200 px-5 py-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-blue-950 flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-blue-900" />
            <span>{t('calculator.scheduleTab')}</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Full {amortizationSchedule.length}-month reducing-balance schedule
            {moratoriumMonths > 0 && ` (Includes ${moratoriumMonths} months gestation moratorium)`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors shadow-2xs min-h-[36px] cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-blue-900" />
            <span>{t('calculator.downloadCsv')}</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors shadow-2xs min-h-[36px] cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>{t('calculator.printSchedule')}</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">{t('calculator.monthCol')}</th>
              <th className="py-3 px-4">{t('calculator.openingCol')}</th>
              <th className="py-3 px-4">{t('calculator.emiCol')}</th>
              <th className="py-3 px-4">{t('calculator.principalCol')}</th>
              <th className="py-3 px-4">{t('calculator.interestCol')}</th>
              <th className="py-3 px-4">{t('calculator.closingCol')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visibleRows.map((row) => (
              <tr
                key={row.month}
                className={
                  row.isMoratorium
                    ? 'bg-amber-50/50 hover:bg-amber-50 text-amber-950 font-medium'
                    : 'hover:bg-slate-50/80 text-slate-800'
                }
              >
                <td className="py-2.5 px-4 font-semibold">
                  <div className="flex items-center gap-1.5">
                    <span>M{row.month}</span>
                    {row.isMoratorium && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold bg-amber-200 text-amber-900 rounded">
                        Moratorium
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-2.5 px-4 tabular-nums font-medium text-slate-600">₹{row.openingBalance.toLocaleString('en-IN')}</td>
                <td className="py-2.5 px-4 tabular-nums font-bold text-[#0F294A]">
                  ₹{row.emi.toLocaleString('en-IN')}
                </td>
                <td className="py-2.5 px-4 tabular-nums font-semibold text-emerald-800">
                  ₹{row.principalPaid.toLocaleString('en-IN')}
                </td>
                <td className="py-2.5 px-4 tabular-nums font-semibold text-rose-800">
                  ₹{row.interestPaid.toLocaleString('en-IN')}
                </td>
                <td className="py-2.5 px-4 tabular-nums font-bold text-[#0F294A]">
                  ₹{row.closingBalance.toLocaleString('en-IN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Show more / collapse toggle */}
      {amortizationSchedule.length > 12 && (
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-900 hover:text-blue-950 p-2 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <span>
              {isExpanded
                ? 'Show First 12 Months Only'
                : `Show All ${amortizationSchedule.length} Months`}
            </span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      )}
    </div>
  );
}
