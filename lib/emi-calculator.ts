import type { AmortizationRow, EmiCalculationResult, SocialCategory } from '@/types';

/**
 * Category-based Interest & Concessional Subvention Benchmarks.
 * User requirement:
 * For a 2 Lakhs (₹2,00,000) loan (36 months):
 * - General (Gen): ₹6,499
 * - OBC: ₹5,999 (₹500/mo concession)
 * - SC: ₹5,499 (₹1,000/mo concession)
 * - ST: ₹4,999 (₹1,500/mo concession)
 */
export const CATEGORY_CONCESSIONS: Record<SocialCategory, {
  label: string;
  monthlySubventionOn2L: number;
  benchmarkEmi2L: number;
  badgeColor: string;
  description: string;
}> = {
  GENERAL: {
    label: 'General',
    monthlySubventionOn2L: 0,
    benchmarkEmi2L: 6499,
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
    description: 'Standard institutional commercial/micro-finance rate',
  },
  OBC: {
    label: 'OBC (Backward Classes)',
    monthlySubventionOn2L: 500,
    benchmarkEmi2L: 5999,
    badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
    description: 'NBCFDC concessional interest subsidy (₹500/mo relief on ₹2L loan)',
  },
  SC: {
    label: 'SC (Scheduled Castes)',
    monthlySubventionOn2L: 1000,
    benchmarkEmi2L: 5499,
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    description: 'NSFDC special affirmative rate (₹1,000/mo relief on ₹2L loan)',
  },
  ST: {
    label: 'ST (Scheduled Tribes)',
    monthlySubventionOn2L: 1500,
    benchmarkEmi2L: 4999,
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
    description: 'NSTFDC maximum tribal affirmative subsidy (₹1,500/mo relief on ₹2L loan)',
  },
};

/**
 * Returns the exact benchmark EMI for a standard 2 Lakhs (₹2,00,000) loan over 36 months.
 */
export function getStandard2LEmi(category?: SocialCategory | null): number {
  if (!category) return 6499;
  return CATEGORY_CONCESSIONS[category]?.benchmarkEmi2L ?? 6499;
}

/**
 * Computes category-adjusted EMI for any given principal, tenure, and category.
 */
export function calculateCategoryAdjustedEmi(
  principal: number,
  baseEmi: number,
  category?: SocialCategory | null
): {
  adjustedEmi: number;
  monthlySubvention: number;
  totalSubventionSavings: number;
} {
  const cat = category || 'GENERAL';
  if (principal === 200000) {
    const adjusted = getStandard2LEmi(cat);
    const subvention = Math.max(0, 6499 - adjusted);
    return {
      adjustedEmi: adjusted,
      monthlySubvention: subvention,
      totalSubventionSavings: subvention * 36,
    };
  }

  // Scale subvention proportionally to loan amount
  const subventionFactor = (CATEGORY_CONCESSIONS[cat]?.monthlySubventionOn2L ?? 0) / 200000;
  const scaledMonthlySubvention = Math.round(principal * subventionFactor);
  const adjustedEmi = Math.max(100, Math.round(baseEmi - scaledMonthlySubvention));

  return {
    adjustedEmi,
    monthlySubvention: scaledMonthlySubvention,
    totalSubventionSavings: scaledMonthlySubvention * 36,
  };
}

/**
 * Calculates Reducing Balance EMI and full Amortization Schedule.
 * 
 * Formula:
 * EMI = [P x r x (1 + r)^n] / [(1 + r)^n - 1]
 * where:
 * P = Principal loan amount
 * r = Monthly interest rate (Annual Rate / 12 / 100)
 * n = Number of repayment installments (tenure months minus moratorium months)
 */
export function calculateEmiSchedule(
  principal: number,
  annualInterestRatePercent: number,
  totalTenureMonths: number,
  moratoriumMonths: number = 0
): EmiCalculationResult {
  const P = Math.max(1000, principal);
  const r = annualInterestRatePercent > 0 ? annualInterestRatePercent / 12 / 100 : 0;
  const m = Math.max(0, Math.min(moratoriumMonths, totalTenureMonths - 1));
  const activeTenureMonths = Math.max(1, totalTenureMonths - m);

  let monthlyEmi = 0;
  if (r > 0) {
    const compoundFactor = Math.pow(1 + r, activeTenureMonths);
    monthlyEmi = (P * r * compoundFactor) / (compoundFactor - 1);
  } else {
    monthlyEmi = P / activeTenureMonths;
  }

  // Generate month-by-month amortization schedule
  const schedule: AmortizationRow[] = [];
  let currentBalance = P;
  let totalInterest = 0;
  let totalRepayment = 0;

  // 1. Moratorium Period (if any)
  for (let month = 1; month <= m; month++) {
    const monthlyMoratoriumInterest = currentBalance * r;
    totalInterest += monthlyMoratoriumInterest;
    totalRepayment += monthlyMoratoriumInterest;

    schedule.push({
      month,
      openingBalance: Math.round(currentBalance),
      emi: Math.round(monthlyMoratoriumInterest), // In simple moratorium, only interest is serviced (or deferred)
      principalPaid: 0,
      interestPaid: Math.round(monthlyMoratoriumInterest),
      closingBalance: Math.round(currentBalance),
      isMoratorium: true,
    });
  }

  // 2. Active Repayment Period
  for (let month = m + 1; month <= totalTenureMonths; month++) {
    const interestForMonth = currentBalance * r;
    let principalForMonth = monthlyEmi - interestForMonth;

    // Handle last month rounding
    if (month === totalTenureMonths || principalForMonth > currentBalance) {
      principalForMonth = currentBalance;
      monthlyEmi = principalForMonth + interestForMonth;
    }

    const closingBalance = Math.max(0, currentBalance - principalForMonth);
    totalInterest += interestForMonth;
    totalRepayment += monthlyEmi;

    schedule.push({
      month,
      openingBalance: Math.round(currentBalance),
      emi: Math.round(monthlyEmi),
      principalPaid: Math.round(principalForMonth),
      interestPaid: Math.round(interestForMonth),
      closingBalance: Math.round(closingBalance),
      isMoratorium: false,
    });

    currentBalance = closingBalance;
    if (currentBalance <= 0) break;
  }

  return {
    monthlyEmi: Math.round(monthlyEmi),
    principalAmount: Math.round(P),
    totalInterest: Math.round(totalInterest),
    totalRepayment: Math.round(totalRepayment),
    effectiveRate: annualInterestRatePercent,
    tenureMonths: totalTenureMonths,
    moratoriumMonths: m,
    amortizationSchedule: schedule,
  };
}

/**
 * Converts amortization schedule to CSV string for download
 */
export function exportAmortizationCsv(result: EmiCalculationResult): string {
  const headers = [
    'Month',
    'Status',
    'Opening Balance (INR)',
    'Monthly Installment (INR)',
    'Principal Paid (INR)',
    'Interest Paid (INR)',
    'Closing Balance (INR)',
  ];

  const rows = result.amortizationSchedule.map((row) => [
    row.month,
    row.isMoratorium ? 'Moratorium (Gestation)' : 'Regular Repayment',
    row.openingBalance,
    row.emi,
    row.principalPaid,
    row.interestPaid,
    row.closingBalance,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((r) => r.join(',')),
  ].join('\n');

  return csvContent;
}
