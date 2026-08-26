import type { Scheme, SchemeFilterInput, SchemeMatchResult } from '@/types';
import { getAllSchemes } from './schemes';

/**
 * Deterministic rules engine to match user inputs against NSFDC schemes.
 */
export function matchSchemes(input: SchemeFilterInput): SchemeMatchResult[] {
  const allSchemes = getAllSchemes();
  const results: SchemeMatchResult[] = [];

  for (const scheme of allSchemes) {
    let score = 50; // base score
    const matchReasons: string[] = [];
    const warnings: string[] = [];
    let isEligible = true;

    // 1. Income Check (NSFDC cap is typically ₹5,00,000 p.a.)
    if (input.familyIncome > scheme.eligibility.maxFamilyIncome) {
      isEligible = false;
      warnings.push(`Annual family income (₹${input.familyIncome.toLocaleString('en-IN')}) exceeds scheme limit of ₹${scheme.eligibility.maxFamilyIncome.toLocaleString('en-IN')}.`);
      score -= 40;
    } else {
      score += 15;
      matchReasons.push(`Your family income (₹${input.familyIncome.toLocaleString('en-IN')}) is well within the ₹${scheme.eligibility.maxFamilyIncome.toLocaleString('en-IN')} ceiling.`);
      if (input.familyIncome > scheme.eligibility.maxFamilyIncome * 0.85) {
        warnings.push('Income is near the maximum eligibility threshold. Valid income certificate from Tehsildar/SDM will be strictly scrutinized.');
      }
    }

    // 2. Project Type / Sector Compatibility Check
    const projectTypes = scheme.eligibility.projectTypes;
    const isDirectProjectMatch = projectTypes.includes(input.projectType);
    const isGeneralBusinessMatch = (input.projectType === 'business' || input.projectType === 'artisan' || input.projectType === 'retail') && projectTypes.includes('business');

    if (isDirectProjectMatch) {
      score += 30;
      matchReasons.push(`Specifically designed for ${formatProjectTypeName(input.projectType)} projects.`);
    } else if (isGeneralBusinessMatch) {
      score += 20;
      matchReasons.push(`Covers general commercial, retail, and service activities.`);
    } else if (input.projectType === 'education' && scheme.category !== 'education') {
      isEligible = false;
      warnings.push('This is a business enterprise scheme, not applicable for educational course fees.');
      score -= 50;
    } else if (input.projectType !== 'education' && scheme.category === 'education') {
      isEligible = false;
      warnings.push('Educational Loan Scheme is solely applicable for professional/technical student courses.');
      score -= 50;
    } else {
      score -= 10;
    }

    // 3. Project Cost & Max Loan Amount Sizing
    const maxCost = scheme.eligibility.maxProjectCostNumeric;
    const nsfdcSharePct = scheme.terms.nsfdcSharePercentNumeric || 90;
    const calculatedLoanLimit = Math.min(
      scheme.terms.maxLoanAmountNumeric,
      Math.round(input.estimatedCost * (nsfdcSharePct / 100))
    );

    if (input.estimatedCost <= maxCost) {
      score += 15;
      matchReasons.push(`Project cost (₹${input.estimatedCost.toLocaleString('en-IN')}) is within the permissible limit of up to ₹${maxCost.toLocaleString('en-IN')}.`);
    } else {
      if (scheme.id === 'micro_credit_finance' || scheme.id === 'mahila_samriddhi_yojana') {
        warnings.push(`Your project cost (₹${input.estimatedCost.toLocaleString('en-IN')}) exceeds micro-credit ceiling (₹${maxCost.toLocaleString('en-IN')}). Consider applying under Term Loan Scheme for higher funding.`);
        score -= 20;
      } else {
        warnings.push(`Project cost exceeds ₹${maxCost.toLocaleString('en-IN')}. Maximum NSFDC assistance is capped at ₹${scheme.terms.maxLoanAmountNumeric.toLocaleString('en-IN')}.`);
        score -= 10;
      }
    }

    // 4. Demographic & Special Category Check (Women, SHG, Sanitation)
    let effectiveInterest = scheme.terms.interestRatePercentNumeric;
    if (input.applicantCategory === 'female') {
      if (scheme.id === 'mahila_samriddhi_yojana') {
        score += 25;
        matchReasons.push('100% targeted for women entrepreneurs with special concessional rates.');
      } else if (scheme.terms.interestRebateWomenPercent > 0) {
        effectiveInterest = Math.max(1, effectiveInterest - scheme.terms.interestRebateWomenPercent);
        score += 10;
        matchReasons.push(`Eligible for 0.5% p.a. interest rebate for women (Effective rate: ~${effectiveInterest}% p.a.).`);
      }
    } else if (scheme.id === 'mahila_samriddhi_yojana' && input.applicantCategory === 'male') {
      isEligible = false;
      warnings.push('Mahila Samriddhi Yojana is exclusively reserved for women entrepreneurs & women SHGs.');
      score -= 60;
    }

    if (input.applicantCategory === 'shg' && (scheme.id === 'micro_credit_finance' || scheme.id === 'mahila_samriddhi_yojana')) {
      score += 20;
      matchReasons.push('Supports group lending / Self-Help Group (SHG) micro-enterprise financing.');
    }

    if (input.applicantCategory === 'safai_karamchari') {
      if (scheme.id === 'swachhta_udayami_yojana') {
        score += 35;
        matchReasons.push('Highest priority scheme for mechanized sanitation & waste management equipment.');
      }
    }

    if (input.projectType === 'green_energy' && scheme.id === 'green_business_scheme') {
      score += 35;
      matchReasons.push('Special green concession for solar units, e-rickshaws, and clean energy.');
    }

    // 5. Education Requirement Check
    const requiredEdu = scheme.eligibility.educationRequired;
    if (requiredEdu === '12th_pass') {
      if (input.educationLevel === 'none' || input.educationLevel === '10th_pass') {
        if (scheme.category === 'education') {
          isEligible = false;
          warnings.push('Admission in professional degree/diploma requires at least 12th standard pass or equivalent.');
          score -= 40;
        }
      }
    }

    // Normalize score to 0 - 100
    const finalScore = Math.max(5, Math.min(99, score));

    results.push({
      scheme,
      rank: 1, // will sort and re-index
      score: finalScore,
      isEligible: isEligible && finalScore >= 40,
      matchReasons,
      warnings,
      calculatedLoanLimit,
      estimatedInterestRate: effectiveInterest,
    });
  }

  // Sort by eligibility first, then by match score descending, then by loan limit descending
  results.sort((a, b) => {
    if (a.isEligible !== b.isEligible) {
      return a.isEligible ? -1 : 1;
    }
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return b.calculatedLoanLimit - a.calculatedLoanLimit;
  });

  // Assign 1-indexed ranks
  return results.map((res, index) => ({
    ...res,
    rank: index + 1,
  }));
}

function formatProjectTypeName(type: string): string {
  const map: Record<string, string> = {
    business: 'Micro Business / Trade',
    education: 'Higher Education',
    transport: 'Commercial Transport',
    green_energy: 'Green Energy / Solar',
    sanitation: 'Sanitation & Cleaning',
    artisan: 'Artisans & Handicrafts',
    retail: 'Retail Shop',
    services: 'Service Enterprise',
    agriculture: 'Agri-allied',
    manufacturing: 'Small Manufacturing',
  };
  return map[type] || type;
}
