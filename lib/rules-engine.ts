import type { Scheme, SchemeFilterInput, SchemeMatchResult, SocialCategory } from '@/types';
import { getAllSchemes } from './schemes';
import { getStandard2LEmi, CATEGORY_CONCESSIONS } from './emi-calculator';

/**
 * Deterministic rules engine to match user inputs against NSFDC / Government schemes.
 * Incorporates Age, State, Gender, Occupation, Income, and Social Category.
 */
export function matchSchemes(input: SchemeFilterInput): SchemeMatchResult[] {
  const allSchemes = getAllSchemes();
  const results: SchemeMatchResult[] = [];
  const selectedCategory: SocialCategory = input.category || 'GENERAL';
  const concessionalEmi = getStandard2LEmi(selectedCategory);
  const subventionAmount = Math.max(0, 6499 - concessionalEmi);
  const familyIncome = input.familyIncome ?? 0;
  const estimatedCost = input.estimatedCost ?? 0;

  for (const scheme of allSchemes) {
    let score = 50; // base score
    const matchReasons: string[] = [];
    const warnings: string[] = [];
    let isEligible = true;

    // 0. Age Eligibility Check
    if (input.age !== undefined && input.age !== null) {
      if (input.age < 18) {
        isEligible = false;
        warnings.push(`Applicant age (${input.age} yrs) is below minimum required legal loan age of 18.`);
        score -= 50;
      } else if (input.age > 65) {
        isEligible = false;
        warnings.push(`Applicant age (${input.age} yrs) exceeds maximum age limit of 65 years for concessional credit.`);
        score -= 40;
      } else if (input.age >= 18 && input.age <= 45) {
        score += 10;
        matchReasons.push(`Age ${input.age} qualifies under prime entrepreneurial & self-employment bracket.`);
      } else {
        matchReasons.push(`Age ${input.age} is eligible within the 18-65 permissible age range.`);
      }
    }

    // 1. Social Category Affirmative Action Matching
    if (selectedCategory === 'SC') {
      score += 25;
      matchReasons.push(`Eligible under NSFDC Scheduled Caste Concessional Mandate (₹1,000/mo EMI relief, ~₹5,499/mo on ₹2L).`);
    } else if (selectedCategory === 'ST') {
      score += 25;
      matchReasons.push(`Eligible under NSTFDC Scheduled Tribe Priority Channel (₹1,500/mo EMI relief, ~₹4,999/mo on ₹2L).`);
    } else if (selectedCategory === 'OBC') {
      score += 20;
      matchReasons.push(`Eligible under NBCFDC Backward Classes Credit Line (₹500/mo EMI relief, ~₹5,999/mo on ₹2L).`);
    } else {
      score += 10;
      matchReasons.push(`Eligible under Standard Institutional Lending / PMEGP / Mudra (~₹6,499/mo on ₹2L).`);
    }

    // State Representation
    if (input.state && input.state !== 'All India') {
      matchReasons.push(`Designated State Channelising Agency (SCA) operational in ${input.state}.`);
    }

    // 2. Income Check (NSFDC / Government ceiling is typically ₹3,00,000 to ₹5,00,000 p.a.)
    if (familyIncome > 0 && familyIncome > scheme.eligibility.maxFamilyIncome) {
      isEligible = false;
      warnings.push(`Annual family income (₹${familyIncome.toLocaleString('en-IN')}) exceeds scheme ceiling of ₹${scheme.eligibility.maxFamilyIncome.toLocaleString('en-IN')}.`);
      score -= 40;
    } else if (familyIncome > 0) {
      score += 15;
      matchReasons.push(`Your family income (₹${familyIncome.toLocaleString('en-IN')}) is within the ₹${scheme.eligibility.maxFamilyIncome.toLocaleString('en-IN')} limit.`);
      if (familyIncome > scheme.eligibility.maxFamilyIncome * 0.85) {
        warnings.push('Income is near the maximum eligibility threshold. Keep Tehsildar income certificate ready.');
      }
    }

    // 3. Project Type / Sector Compatibility Check
    const projectTypes = scheme.eligibility.projectTypes;
    const isDirectProjectMatch = input.projectType ? projectTypes.includes(input.projectType) : false;
    const isGeneralBusinessMatch = input.projectType ? (input.projectType === 'business' || input.projectType === 'artisan' || input.projectType === 'retail') && projectTypes.includes('business') : false;

    if (isDirectProjectMatch) {
      score += 30;
      matchReasons.push(`Specifically designed for ${formatProjectTypeName(input.projectType)} projects.`);
    } else if (isGeneralBusinessMatch) {
      score += 20;
      matchReasons.push(`Covers general commercial, retail, and small enterprise activities.`);
    } else if (input.projectType === 'education' && scheme.category !== 'education') {
      isEligible = false;
      warnings.push('Enterprise loan scheme is not applicable for educational course fees.');
      score -= 50;
    } else if (input.projectType && input.projectType !== 'education' && scheme.category === 'education') {
      isEligible = false;
      warnings.push('Education Loan Scheme is solely reserved for professional student degrees.');
      score -= 50;
    } else if (input.projectType) {
      score -= 10;
    }

    // 4. Project Cost & Max Loan Amount Sizing
    const maxCost = scheme.eligibility.maxProjectCostNumeric;
    const nsfdcSharePct = scheme.terms.nsfdcSharePercentNumeric || 90;
    const costForCalculation = estimatedCost > 0 ? estimatedCost : 200000;
    const calculatedLoanLimit = Math.min(
      scheme.terms.maxLoanAmountNumeric,
      Math.round(costForCalculation * (nsfdcSharePct / 100))
    );

    if (estimatedCost > 0) {
      if (estimatedCost <= maxCost) {
        score += 15;
        matchReasons.push(`Project cost (₹${estimatedCost.toLocaleString('en-IN')}) is within the permissible limit of up to ₹${maxCost.toLocaleString('en-IN')}.`);
      } else {
        if (scheme.id === 'micro_credit_finance' || scheme.id === 'mahila_samriddhi_yojana') {
          warnings.push(`Project cost (₹${estimatedCost.toLocaleString('en-IN')}) exceeds micro-credit ceiling (₹${maxCost.toLocaleString('en-IN')}). Consider applying under Term Loan Scheme for higher funding.`);
          score -= 20;
        } else {
          warnings.push(`Project cost exceeds ₹${maxCost.toLocaleString('en-IN')}. Maximum assistance is capped at ₹${scheme.terms.maxLoanAmountNumeric.toLocaleString('en-IN')}.`);
          score -= 10;
        }
      }
    }

    // 5. Gender & Special Categories
    let effectiveInterest = scheme.terms.interestRatePercentNumeric;
    const isFemale = input.gender === 'female' || input.applicantCategory === 'female';
    if (isFemale) {
      if (scheme.id === 'mahila_samriddhi_yojana') {
        score += 30;
        matchReasons.push('100% targeted for women entrepreneurs with special concessional rates.');
      } else if (scheme.terms.interestRebateWomenPercent > 0) {
        effectiveInterest = Math.max(1, effectiveInterest - scheme.terms.interestRebateWomenPercent);
        score += 12;
        matchReasons.push(`Eligible for 0.5% p.a. interest rebate for women (Effective rate: ~${effectiveInterest}% p.a.).`);
      }
    } else if (scheme.id === 'mahila_samriddhi_yojana' && !isFemale) {
      isEligible = false;
      warnings.push('Mahila Samriddhi Yojana is exclusively reserved for women entrepreneurs & women SHGs.');
      score -= 60;
    }

    if (input.applicantCategory === 'shg' && (scheme.id === 'micro_credit_finance' || scheme.id === 'mahila_samriddhi_yojana')) {
      score += 20;
      matchReasons.push('Supports group lending / Self-Help Group (SHG) micro-enterprise financing.');
    }

    if (input.applicantCategory === 'safai_karamchari' || input.projectType === 'sanitation') {
      if (scheme.id === 'swachhta_udayami_yojana') {
        score += 35;
        matchReasons.push('Highest priority scheme for mechanized sanitation & waste management equipment.');
      }
    }

    if (input.projectType === 'green_energy' && scheme.id === 'green_business_scheme') {
      score += 35;
      matchReasons.push('Special green concession for solar units, e-rickshaws, and clean energy.');
    }

    // 6. Education Requirement Check
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
      concessionalEmiFor2L: concessionalEmi,
      categorySubventionAmount: subventionAmount,
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
