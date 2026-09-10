export type Locale = 'en' | 'hi';

export type ProjectCategory = 
  | 'business'
  | 'education'
  | 'transport'
  | 'green_energy'
  | 'sanitation'
  | 'artisan'
  | 'retail'
  | 'services'
  | 'agriculture'
  | 'manufacturing';

export type EducationLevel = 
  | 'none'
  | '10th_pass'
  | '12th_pass'
  | 'graduate'
  | 'post_graduate';

export type ApplicantCategory = 
  | 'male'
  | 'female'
  | 'shg'
  | 'safai_karamchari';

export interface SchemeEligibility {
  maxFamilyIncome: number;
  minAge?: number;
  maxAge?: number;
  projectTypes: string[];
  maxProjectCost: string;
  maxProjectCostNumeric: number;
  educationRequired?: string;
  specialFocus?: string[];
}

export interface SchemeTerms {
  maxLoanAmount: string;
  maxLoanAmountNumeric: number;
  interestRatePercent: string;
  interestRatePercentNumeric: number;
  interestRebateWomenPercent: number;
  maxTenureMonths: string;
  maxTenureMonthsNumeric: number;
  moratoriumMonths: string;
  moratoriumMonthsNumeric: number;
  nsfdcSharePercent: string;
  nsfdcSharePercentNumeric: number;
  promoterSharePercent: number;
  scaSharePercent: number;
}

export interface Scheme {
  id: string;
  code: string;
  name: string;
  nameHi: string;
  category: string;
  description: string;
  descriptionHi: string;
  targetAudience: string;
  targetAudienceHi: string;
  eligibility: SchemeEligibility;
  terms: SchemeTerms;
  requiredDocuments: string[];
  highlights: string[];
}

export interface ChannelPartner {
  id: string;
  name: string;
  nameHi: string;
  type: 'SCA' | 'Bank' | 'RRB' | 'NBFC-MFI';
  typeName: string;
  lat: number;
  lng: number;
  address: string;
  district: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  schemesProcessed: string[];
  fundUtilization: number;
  status: string;
  workingHours: string;
  isSimulated: boolean;
  distanceKm?: number;
}

export type SocialCategory = 'GENERAL' | 'OBC' | 'SC' | 'ST';

export type Gender = 'male' | 'female' | 'transgender';

export interface UserProfile {
  age: number;
  state: string;
  gender: Gender;
  occupation: string;
  income: number;
  category: SocialCategory;
  projectCost: number;
  educationLevel: EducationLevel;
}

export interface SchemeFilterInput {
  projectType: string;
  estimatedCost: number;
  familyIncome: number;
  educationLevel: EducationLevel;
  applicantCategory: ApplicantCategory;
  age?: number;
  state?: string;
  gender?: Gender;
  category?: SocialCategory;
}

export interface SchemeMatchResult {
  scheme: Scheme;
  rank: number;
  score: number; // 0 - 100
  isEligible: boolean;
  matchReasons: string[];
  warnings: string[];
  calculatedLoanLimit: number;
  estimatedInterestRate: number;
  concessionalEmiFor2L?: number;
  categorySubventionAmount?: number;
}

export interface AmortizationRow {
  month: number;
  openingBalance: number;
  emi: number;
  principalPaid: number;
  interestPaid: number;
  closingBalance: number;
  isMoratorium: boolean;
}

export interface EmiCalculationResult {
  monthlyEmi: number;
  principalAmount: number;
  totalInterest: number;
  totalRepayment: number;
  effectiveRate: number;
  tenureMonths: number;
  moratoriumMonths: number;
  amortizationSchedule: AmortizationRow[];
}
