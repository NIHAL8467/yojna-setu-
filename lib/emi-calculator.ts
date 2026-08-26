import type { AmortizationRow, EmiCalculationResult } from '@/types';

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
