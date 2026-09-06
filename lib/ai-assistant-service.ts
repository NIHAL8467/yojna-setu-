import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import schemesData from '@/data/schemes.json';
import partnersData from '@/data/partners.json';
import { matchSchemes } from '@/lib/rules-engine';
import { calculateEmiSchedule } from '@/lib/emi-calculator';
import type { Scheme, ChannelPartner, EducationLevel, ApplicantCategory, SchemeFilterInput } from '@/types';

export interface UserProfileContext {
  category?: string;
  annual_family_income?: number;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  state?: string;
  district?: string;
  purpose?: string;
  business_type?: string;
  estimated_project_cost?: number;
  loan_required?: number;
  education_status?: EducationLevel;
  applicant_type?: ApplicantCategory;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  text: string;
}

export interface AssistantChatRequest {
  message: string;
  conversationHistory?: ConversationMessage[];
  language?: 'en' | 'hi';
  locale?: 'en' | 'hi';
  userProfile?: UserProfileContext;
  schemeContext?: any;
}

export interface AssistantChatResponse {
  reply: string;
  language: 'en' | 'hi';
  sources: string[];
  suggestedQuestions: string[];
  userProfile: UserProfileContext;
  toolsUsed: string[];
}

// -------------------------------------------------------------
// Tool Definitions for @google/genai
// -------------------------------------------------------------
const toolDeclarations: FunctionDeclaration[] = [
  {
    name: 'get_all_schemes',
    description: 'Retrieve the complete verified list of all official NSFDC government concessional loan schemes available in Yojna Setu, with summaries of interest rates, loan limits, and target groups.',
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: 'get_scheme_details',
    description: 'Get verified details of a specific scheme by ID or code (e.g. MCF, TLS, ELS, MSY, GBS, SUY), including exact interest rates, women rebate, loan limits, moratorium, tenure, and required documents.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        schemeIdOrCode: {
          type: Type.STRING,
          description: "Scheme ID or code, such as 'MCF', 'TLS', 'ELS', 'MSY', 'GBS', 'SUY', 'micro_credit_finance', 'term_loan_scheme', 'educational_loan_scheme', 'mahila_samriddhi_yojana', 'green_business_scheme', 'swachhta_udayami_yojana'.",
        },
      },
      required: ['schemeIdOrCode'],
    },
  },
  {
    name: 'search_schemes',
    description: 'Search and filter official government loan schemes based on business/activity type, project cost, target group (women, sanitation worker, student, artisan), or keyword.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        category: {
          type: Type.STRING,
          description: "Category: 'business', 'education', 'transport', 'green_energy', 'sanitation', 'artisan', 'retail', 'services', 'agriculture', 'manufacturing'",
        },
        estimatedCost: {
          type: Type.NUMBER,
          description: 'Estimated total project cost or loan amount in INR',
        },
        applicantCategory: {
          type: Type.STRING,
          description: "'male', 'female', 'shg', or 'safai_karamchari'",
        },
        keyword: {
          type: Type.STRING,
          description: "Search keywords like 'e-rickshaw', 'solar', 'tailoring', 'study', 'cleaning', 'mechanized', 'shop'",
        },
      },
    },
  },
  {
    name: 'check_scheme_eligibility',
    description: 'Run Yojna Setu deterministic rules engine to evaluate applicant eligibility, match score (0-100), calculated loan limits, specific match reasons, and official warnings.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        familyIncome: {
          type: Type.NUMBER,
          description: 'Annual family income in INR (NSFDC eligibility ceiling is ₹5,00,000 p.a.)',
        },
        projectType: {
          type: Type.STRING,
          description: "Activity sector ('business', 'education', 'transport', 'green_energy', 'sanitation', 'artisan', 'retail', 'services', 'agriculture', 'manufacturing')",
        },
        estimatedCost: {
          type: Type.NUMBER,
          description: 'Total estimated project cost in INR',
        },
        applicantCategory: {
          type: Type.STRING,
          description: "'male', 'female', 'shg', or 'safai_karamchari'",
        },
        educationLevel: {
          type: Type.STRING,
          description: "'none', '10th_pass', '12th_pass', 'graduate', 'post_graduate'",
        },
      },
      required: ['familyIncome', 'projectType', 'estimatedCost'],
    },
  },
  {
    name: 'calculate_loan_emi',
    description: 'Calculate reducing-balance monthly EMI installment, total interest, and total repayment using the official NSFDC reducing balance formula, including optional moratorium grace period.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        principal: {
          type: Type.NUMBER,
          description: 'Principal loan amount in INR (e.g. 100000)',
        },
        annualInterestRatePercent: {
          type: Type.NUMBER,
          description: 'Annual interest rate percent (e.g. 4.0, 5.0, 6.0, 6.5)',
        },
        totalTenureMonths: {
          type: Type.INTEGER,
          description: 'Total tenure in months (e.g. 36 for 3 yrs, 60 for 5 yrs, 120 for 10 yrs)',
        },
        moratoriumMonths: {
          type: Type.INTEGER,
          description: 'Moratorium / gestation period in months where principal repayment is deferred (e.g. 3, 6, 12)',
        },
      },
      required: ['principal', 'annualInterestRatePercent', 'totalTenureMonths'],
    },
  },
  {
    name: 'search_channel_partners',
    description: 'Find authorized State Channelising Agencies (SCAs), Public Sector Banks, or RRBs in a given state or district where citizens submit NSFDC loan applications.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        state: {
          type: Type.STRING,
          description: "State name (e.g. 'Delhi', 'Uttar Pradesh', 'Haryana', etc.)",
        },
        district: {
          type: Type.STRING,
          description: 'District or city name',
        },
        schemeId: {
          type: Type.STRING,
          description: 'Optional scheme ID to check if supported by the partner',
        },
        partnerType: {
          type: Type.STRING,
          description: "Optional partner type: 'SCA', 'Bank', 'RRB', or 'NBFC-MFI'",
        },
      },
    },
  },
];

// -------------------------------------------------------------
// Tool Implementations (Deterministic Grounding Data)
// -------------------------------------------------------------
function executeTool(name: string, args: Record<string, any>): any {
  const schemes = schemesData as Scheme[];
  const partners = partnersData as ChannelPartner[];

  switch (name) {
    case 'get_all_schemes': {
      return schemes.map((s) => ({
        id: s.id,
        code: s.code,
        name: s.name,
        nameHi: s.nameHi,
        category: s.category,
        description: s.description,
        maxLoanAmount: `Up to ₹${s.terms.maxLoanAmountNumeric.toLocaleString('en-IN')}`,
        maxLoanAmountNumeric: s.terms.maxLoanAmountNumeric,
        interestRate: `${s.terms.interestRatePercentNumeric}% p.a.`,
        interestRateNumeric: s.terms.interestRatePercentNumeric,
        womenRebate: s.terms.interestRebateWomenPercent > 0 ? `${s.terms.interestRebateWomenPercent}% p.a. rebate` : 'None (Already concessional)',
        maxTenureMonths: s.terms.maxTenureMonthsNumeric,
        moratoriumMonths: s.terms.moratoriumMonthsNumeric,
        maxFamilyIncome: `₹${s.eligibility.maxFamilyIncome.toLocaleString('en-IN')} p.a.`,
        targetAudience: s.targetAudience,
      }));
    }

    case 'get_scheme_details': {
      const query = (args.schemeIdOrCode || '').toString().toLowerCase().trim();
      const found = schemes.find(
        (s) =>
          s.id.toLowerCase() === query ||
          s.code.toLowerCase() === query ||
          s.name.toLowerCase().includes(query) ||
          s.nameHi.toLowerCase().includes(query)
      );

      if (!found) {
        return {
          error: `No verified scheme found matching '${args.schemeIdOrCode}'. Available schemes: MCF, TLS, ELS, MSY, GBS, SUY.`,
        };
      }

      return {
        id: found.id,
        code: found.code,
        name: found.name,
        nameHi: found.nameHi,
        category: found.category,
        description: found.description,
        descriptionHi: found.descriptionHi,
        targetAudience: found.targetAudience,
        targetAudienceHi: found.targetAudienceHi,
        eligibility: {
          maxFamilyIncome: `₹${found.eligibility.maxFamilyIncome.toLocaleString('en-IN')} p.a.`,
          minAge: found.eligibility.minAge,
          maxAge: found.eligibility.maxAge,
          projectTypes: found.eligibility.projectTypes,
          educationRequired: found.eligibility.educationRequired || 'None',
          specialFocus: found.eligibility.specialFocus || [],
        },
        terms: {
          maxLoanAmount: `Up to ₹${found.terms.maxLoanAmountNumeric.toLocaleString('en-IN')}`,
          maxLoanAmountNumeric: found.terms.maxLoanAmountNumeric,
          interestRate: `${found.terms.interestRatePercentNumeric}% p.a.`,
          interestRateNumeric: found.terms.interestRatePercentNumeric,
          womenInterestRebate: found.terms.interestRebateWomenPercent > 0 ? `${found.terms.interestRebateWomenPercent}% rebate (Effective: ${found.terms.interestRatePercentNumeric - found.terms.interestRebateWomenPercent}% p.a.)` : '0%',
          maxTenureMonths: found.terms.maxTenureMonthsNumeric,
          moratoriumMonths: found.terms.moratoriumMonthsNumeric,
          nsfdcSharePercent: `${found.terms.nsfdcSharePercentNumeric}%`,
          promoterSharePercent: `${found.terms.promoterSharePercent}%`,
          scaSharePercent: `${found.terms.scaSharePercent}%`,
        },
        requiredDocuments: found.requiredDocuments,
        highlights: found.highlights,
      };
    }

    case 'search_schemes': {
      const { category, estimatedCost, applicantCategory, keyword } = args;
      const kw = (keyword || '').toLowerCase();

      let matched = schemes.filter((s) => {
        if (category && category !== 'all') {
          const directMatch = s.category === category || s.eligibility.projectTypes.includes(category);
          const generalMatch = (category === 'business' || category === 'retail' || category === 'artisan') && s.eligibility.projectTypes.includes('business');
          if (!directMatch && !generalMatch) return false;
        }

        if (applicantCategory === 'female' && s.id === 'mahila_samriddhi_yojana') {
          return true;
        }
        if (applicantCategory === 'male' && s.id === 'mahila_samriddhi_yojana') {
          return false;
        }
        if (applicantCategory === 'safai_karamchari' && s.id === 'swachhta_udayami_yojana') {
          return true;
        }

        if (kw) {
          const inName = s.name.toLowerCase().includes(kw) || s.nameHi.toLowerCase().includes(kw);
          const inDesc = s.description.toLowerCase().includes(kw);
          const inTypes = s.eligibility.projectTypes.some((t) => t.includes(kw));
          const inFocus = (s.eligibility.specialFocus || []).some((f) => f.includes(kw));
          if (!inName && !inDesc && !inTypes && !inFocus) return false;
        }

        return true;
      });

      if (matched.length === 0) {
        matched = schemes; // Fallback to all schemes
      }

      return matched.map((s) => ({
        id: s.id,
        code: s.code,
        name: s.name,
        nameHi: s.nameHi,
        maxLoanAmount: `₹${s.terms.maxLoanAmountNumeric.toLocaleString('en-IN')}`,
        interestRate: `${s.terms.interestRatePercentNumeric}% p.a.`,
        keyBenefit: s.highlights[0] || s.description,
      }));
    }

    case 'check_scheme_eligibility': {
      const filterInput: SchemeFilterInput = {
        familyIncome: Number(args.familyIncome) || 0,
        projectType: args.projectType || 'business',
        estimatedCost: Number(args.estimatedCost) || 100000,
        applicantCategory: (args.applicantCategory as ApplicantCategory) || 'male',
        educationLevel: (args.educationLevel as EducationLevel) || '10th_pass',
      };

      const matchResults = matchSchemes(filterInput);
      return matchResults.map((r) => ({
        rank: r.rank,
        schemeCode: r.scheme.code,
        schemeName: r.scheme.name,
        isEligible: r.isEligible,
        matchScore: r.score,
        calculatedLoanLimit: `₹${r.calculatedLoanLimit.toLocaleString('en-IN')}`,
        effectiveInterestRate: `${r.estimatedInterestRate}% p.a.`,
        matchReasons: r.matchReasons,
        warnings: r.warnings,
      }));
    }

    case 'calculate_loan_emi': {
      const principal = Math.max(1000, Number(args.principal) || 100000);
      const rate = Math.max(0.1, Number(args.annualInterestRatePercent) || 5.0);
      const tenure = Math.max(6, Number(args.totalTenureMonths) || 36);
      const moratorium = Math.max(0, Number(args.moratoriumMonths) || 0);

      const emiData = calculateEmiSchedule(principal, rate, tenure, moratorium);
      return {
        principalAmount: `₹${emiData.principalAmount.toLocaleString('en-IN')}`,
        annualInterestRate: `${emiData.effectiveRate}% p.a.`,
        tenureMonths: `${emiData.tenureMonths} months (${Math.round(emiData.tenureMonths / 12)} years)`,
        moratoriumMonths: `${emiData.moratoriumMonths} months gestation`,
        monthlyEmi: `₹${emiData.monthlyEmi.toLocaleString('en-IN')} / month`,
        totalInterestPayable: `₹${emiData.totalInterest.toLocaleString('en-IN')}`,
        totalAmountPayable: `₹${emiData.totalRepayment.toLocaleString('en-IN')}`,
        calculationMethod: 'Reducing Balance Formula: EMI = [P x r x (1+r)^n] / [(1+r)^n - 1]',
      };
    }

    case 'search_channel_partners': {
      const stateQuery = (args.state || '').toLowerCase().trim();
      const districtQuery = (args.district || '').toLowerCase().trim();
      const schemeQuery = (args.schemeId || '').toLowerCase().trim();
      const typeQuery = (args.partnerType || '').toUpperCase().trim();

      const filtered = partners.filter((p) => {
        if (stateQuery && !p.state.toLowerCase().includes(stateQuery)) return false;
        if (districtQuery && !p.district.toLowerCase().includes(districtQuery) && !p.address.toLowerCase().includes(districtQuery)) return false;
        if (typeQuery && p.type !== typeQuery) return false;
        if (schemeQuery && !p.schemesProcessed.some((s) => s.toLowerCase().includes(schemeQuery))) return false;
        return true;
      });

      const list = filtered.length > 0 ? filtered : partners.slice(0, 4);

      return list.map((p) => ({
        id: p.id,
        name: p.name,
        nameHi: p.nameHi,
        type: p.type,
        typeName: p.typeName,
        state: p.state,
        district: p.district,
        address: p.address,
        phone: p.phone,
        email: p.email,
        workingHours: p.workingHours,
        schemesProcessed: p.schemesProcessed,
      }));
    }

    default:
      return { error: `Tool ${name} is not recognized.` };
  }
}

// -------------------------------------------------------------
// System Prompt
// -------------------------------------------------------------
const SYSTEM_PROMPT = `You are "Yojna Setu Assistant", the official AI Scheme Guidance Assistant for the National Scheduled Castes Finance and Development Corporation (NSFDC), Ministry of Social Justice and Empowerment (MoSJE), Government of India.

Your core mission:
Provide trustworthy, respectful, multilingual, and citizen-friendly guidance to marginalized entrepreneurs, students, women artisans, Self-Help Groups (SHGs), and sanitation workers (Safai Karamcharis).

CRITICAL ARCHITECTURAL & ANTI-HALLUCINATION RULES:
1. Grounding in Verified Data:
   - You MUST NOT invent, guess, or fabricate scheme names, interest rates, loan ceilings, income limits, eligibility criteria, required documents, or channel partner contacts.
   - You MUST call the appropriate tool whenever you need verified facts:
     - Use 'get_all_schemes' or 'search_schemes' to find suitable schemes.
     - Use 'get_scheme_details' for deep dive into interest rates, loan caps, moratorium, or documents.
     - Use 'check_scheme_eligibility' to evaluate user eligibility and match score using the deterministic rules engine.
     - Use 'calculate_loan_emi' to calculate official reducing-balance EMIs.
     - Use 'search_channel_partners' to find SCAs and banks.
2. Missing Data Handling:
   - If a user asks for information that is not available in Yojna Setu's verified data or tools, state honestly:
     "This specific information is not currently available in Yojna Setu's verified database. Please confirm directly with your State Channelising Agency (SCA) or channel partner bank."
3. Mandatory Disclaimer:
   - Whenever discussing eligibility, loan approval, or sanctions, you MUST remind the citizen:
     "Note: Final eligibility and loan sanction are subject to physical document verification by your State Channelising Agency (SCA) or lending bank."
4. Language & Tone:
   - Tone: Courteous, plain, encouraging, accessible, simple, and respectful. Avoid heavy bureaucratic jargon.
   - Multilingual: Detect the user's language.
     - If the user asks in Hindi or Hinglish, respond in natural, clear conversational Hindi (हिंदी) or Hinglish as appropriate.
     - If the user asks in English, respond in clean Indian English.
5. Conversation Context & Memory:
   - Maintain context across the conversation.
   - If the user has already provided details (e.g., income, business type, gender, loan amount), do NOT ask for those details again. Build upon what is already known!
6. Formatting:
   - Use clear markdown formatting with bullet points and bold key values (e.g. **₹1,40,000**, **4% p.a.**, **36 months**).
   - Keep answers focused and actionable.

OUTPUT FORMAT AT THE END OF YOUR RESPONSE:
At the very end of your response, output two metadata tags on their own lines:
SOURCES: ["Code1", "Code2"] (e.g. SOURCES: ["MCF", "MSY"])
SUGGESTED_QUESTIONS: ["Follow up question 1?", "Follow up question 2?", "Follow up question 3?"]
USER_PROFILE_UPDATE: {"category":"SC","annual_family_income":300000,...} (include any newly discovered profile attributes, or leave empty object {})`;

// -------------------------------------------------------------
// Profile Extractor Helper
// -------------------------------------------------------------
export function extractProfileFromText(text: string, current: UserProfileContext = {}): UserProfileContext {
  const updated = { ...current };
  const lower = text.toLowerCase();

  // Category
  if (lower.includes('sc') || lower.includes('scheduled caste') || lower.includes('अनुसूचित जाति')) {
    updated.category = 'SC';
  }

  // Gender
  if (lower.includes('woman') || lower.includes('women') || lower.includes('female') || lower.includes('महिला') || lower.includes('aurat')) {
    updated.gender = 'female';
    updated.applicant_type = 'female';
  } else if (lower.includes('shg') || lower.includes('self help group') || lower.includes('स्वयं सहायता समूह')) {
    updated.applicant_type = 'shg';
  } else if (lower.includes('safai karamchari') || lower.includes('sanitation worker') || lower.includes('सफाई कर्मचारी') || lower.includes('manual scavenger')) {
    updated.applicant_type = 'safai_karamchari';
  }

  // Income pattern e.g. "3 lakh", "300000", "2.5 lakh", "3 lac", "30000"
  const lakhMatch = text.match(/([0-9]+(?:\.[0-9]+)?)\s*(?:lakh|lakhs|lac|lacs|लाख)/i);
  if (lakhMatch) {
    const num = parseFloat(lakhMatch[1]);
    if (!isNaN(num)) {
      if (lower.includes('income') || lower.includes('salary') || lower.includes('kamata') || lower.includes('aay') || lower.includes('आय')) {
        updated.annual_family_income = Math.round(num * 100000);
      } else if (lower.includes('cost') || lower.includes('loan') || lower.includes('chahiye') || lower.includes('need') || lower.includes('require')) {
        updated.estimated_project_cost = Math.round(num * 100000);
        updated.loan_required = Math.round(num * 100000);
      }
    }
  }

  // Direct rupee number match: ₹2,00,000 or 200000
  const rupeeMatch = text.match(/(?:rs\.?|inr|₹)?\s*([1-9][0-9,]{3,9})/i);
  if (rupeeMatch && !lakhMatch) {
    const rawNum = parseInt(rupeeMatch[1].replace(/,/g, ''), 10);
    if (!isNaN(rawNum) && rawNum >= 10000) {
      if (lower.includes('income') || lower.includes('आय')) {
        updated.annual_family_income = rawNum;
      } else if (lower.includes('loan') || lower.includes('cost') || lower.includes('budget') || lower.includes('chahiye')) {
        updated.estimated_project_cost = rawNum;
        updated.loan_required = rawNum;
      }
    }
  }

  // Business Type
  if (lower.includes('e-rickshaw') || lower.includes('erickshaw') || lower.includes('ई-रिक्शा') || lower.includes('rickshaw') || lower.includes('auto')) {
    updated.purpose = 'business';
    updated.business_type = 'e_rickshaw';
  } else if (lower.includes('solar') || lower.includes('सौर') || lower.includes('green energy')) {
    updated.purpose = 'business';
    updated.business_type = 'solar_units';
  } else if (lower.includes('tailor') || lower.includes('sewing') || lower.includes('सिलाई') || lower.includes('boutique') || lower.includes('कपड़े')) {
    updated.purpose = 'business';
    updated.business_type = 'tailoring';
  } else if (lower.includes('study') || lower.includes('college') || lower.includes('btech') || lower.includes('degree') || lower.includes('education') || lower.includes('पढ़ाई') || lower.includes('शिक्षा')) {
    updated.purpose = 'education';
    updated.business_type = 'higher_education';
  } else if (lower.includes('cleaning') || lower.includes('vacuum') || lower.includes('sanitation') || lower.includes('सफाई') || lower.includes('sewer')) {
    updated.purpose = 'sanitation';
    updated.business_type = 'mechanized_sanitation';
  } else if (lower.includes('shop') || lower.includes('dukaan') || lower.includes('दुकान') || lower.includes('grocery') || lower.includes('retail')) {
    updated.purpose = 'business';
    updated.business_type = 'retail_shop';
  }

  // State / City
  const knownLocations = ['Delhi', 'Uttar Pradesh', 'Noida', 'Lucknow', 'Gurugram', 'Haryana', 'Faridabad', 'Maharashtra', 'Mumbai', 'Bihar', 'Patna'];
  for (const loc of knownLocations) {
    if (lower.includes(loc.toLowerCase())) {
      if (['Delhi', 'Uttar Pradesh', 'Haryana', 'Maharashtra', 'Bihar'].includes(loc)) {
        updated.state = loc;
      } else {
        updated.district = loc;
      }
    }
  }

  return updated;
}

// -------------------------------------------------------------
// Deterministic Fallback Assistant (Rule-based Grounded Engine)
// -------------------------------------------------------------
function buildFallbackResponse(
  message: string,
  userProfile: UserProfileContext,
  language: 'en' | 'hi',
  schemeContext?: any
): AssistantChatResponse {
  const lower = message.toLowerCase();
  const schemes = schemesData as Scheme[];
  const toolsUsed: string[] = [];
  const sources: string[] = [];

  // Intent 1: EMI Calculation
  const isEmiQuery = lower.includes('emi') || lower.includes('installment') || lower.includes('किस्त') || lower.includes('monthly payment');
  if (isEmiQuery) {
    toolsUsed.push('calculate_loan_emi');
    const amount = userProfile.loan_required || userProfile.estimated_project_cost || 100000;
    const rate = 5.0;
    const tenure = 36;
    const emiResult = executeTool('calculate_loan_emi', {
      principal: amount,
      annualInterestRatePercent: rate,
      totalTenureMonths: tenure,
      moratoriumMonths: 3,
    });

    sources.push('MCF');
    const reply = language === 'hi'
      ? `### मासिक किस्त (EMI) गणना विवरण:\n\n` +
        `यदि आप **${emiResult.principalAmount}** का ऋण **${emiResult.annualInterestRate}** की रियायती ब्याज दर पर **${emiResult.tenureMonths}** के लिए लेते हैं (जिसमें 3 महीने का मोरटोरियम / छूट अवधि शामिल है):\n\n` +
        `- **अनुमानित मासिक ईएमआई**: **${emiResult.monthlyEmi}**\n` +
        `- **कुल ब्याज देय**: ${emiResult.totalInterestPayable}\n` +
        `- **कुल पुनर्भुगतान**: ${emiResult.totalAmountPayable}\n` +
        `- **गणना पद्धति**: ${emiResult.calculationMethod}\n\n` +
        `> **सुझाव**: महिला उद्यमियों को 0.5% अतिरिक्त ब्याज छूट मिलती है (प्रभावी दर 4.5% p.a.)।\n\n` +
        `*नोट: अंतिम ईएमआई और ऋण स्वीकृति संबंधित राज्य चैनेलाइजिंग एजेंसी (SCA) या बैंक द्वारा भौतिक दस्तावेजों के सत्यापन के अधीन है।*`
      : `### Monthly EMI Calculation Details:\n\n` +
        `For a loan of **${emiResult.principalAmount}** at a concessional rate of **${emiResult.annualInterestRate}** over **${emiResult.tenureMonths}** (including a 3-month moratorium/gestation period):\n\n` +
        `- **Estimated Monthly Installment**: **${emiResult.monthlyEmi}**\n` +
        `- **Total Interest Payable**: ${emiResult.totalInterestPayable}\n` +
        `- **Total Repayment Amount**: ${emiResult.totalAmountPayable}\n` +
        `- **Formula Used**: ${emiResult.calculationMethod}\n\n` +
        `> **Benefit**: Women entrepreneurs receive a 0.5% p.a. interest rebate (Effective: 4.5% p.a.).\n\n` +
        `*Note: Final eligibility and loan sanction are subject to verification of physical documents by your State Channelising Agency (SCA) or lending bank.*`;

    return {
      reply,
      language,
      sources,
      suggestedQuestions: [
        language === 'hi' ? 'इस ऋण के लिए कौन से दस्तावेज चाहिए?' : 'What documents are required for this loan?',
        language === 'hi' ? 'महिला समृद्धि योजना में कितनी ब्याज छूट है?' : 'What is the interest rebate under Mahila Samriddhi Yojana?',
        language === 'hi' ? 'नजदीकी चैनल पार्टनर बैंक कैसे खोजें?' : 'How do I locate my nearest Channel Partner bank?',
      ],
      userProfile,
      toolsUsed,
    };
  }

  // Intent 2: Documents Required
  const isDocQuery = lower.includes('document') || lower.includes('दस्तावेज') || lower.includes('कागजात') || lower.includes('proof') || lower.includes('certificate');
  if (isDocQuery) {
    toolsUsed.push('get_scheme_details');
    sources.push('MCF', 'TLS');
    const reply = language === 'hi'
      ? `### एनएसएफडीसी (NSFDC) ऋण हेतु आवश्यक मुख्य दस्तावेज:\n\n` +
        `1. **जाति प्रमाण पत्र (SC Caste Certificate)**: सक्षम राजस्व अधिकारी (Tehsildar / SDM) द्वारा जारी डिजिटल वैध प्रमाण पत्र।\n` +
        `2. **पारिवारिक आय प्रमाण पत्र (Income Certificate)**: वार्षिक पारिवारिक आय ₹5.00 लाख से कम होनी चाहिए।\n` +
        `3. **पहचान व निवास प्रमाण (KYC)**: आधार कार्ड (Aadhaar), वोटर आईडी या निवास प्रमाण पत्र।\n` +
        `4. **बैंक खाता विवरण (Bank Details)**: सक्रिय बैंक खाते की पासबुक या रद्द चेक (IFSC कोड सहित)।\n` +
        `5. **परियोजना प्रस्ताव / कोटेशन (Project Proposal/Estimate)**: व्यवसाय उपकरण, ई-रिक्शा, सिलाई मशीन या दुकान सामग्री का आधिकारिक कोटेशन।\n` +
        `6. **पासपोर्ट साइज फोटो** (2 प्रतियां)।\n\n` +
        `*नोट: अंतिम ऋण स्वीकृति संबंधित राज्य चैनेलाइजिंग एजेंसी (SCA) या बैंक द्वारा भौतिक दस्तावेजों के सत्यापन के अधीन है।*`
      : `### Mandatory Documents for NSFDC Loan Schemes:\n\n` +
        `1. **SC Caste Certificate**: Valid certificate issued by a competent revenue authority (Tehsildar / Sub-Divisional Magistrate).\n` +
        `2. **Family Income Certificate**: Proving annual household income is within ₹5.00 Lakhs p.a.\n` +
        `3. **KYC & Identity Proof**: Aadhaar Card, Voter ID, or domicile certificate.\n` +
        `4. **Bank Account Details**: Active Bank Passbook copy with IFSC or cancelled cheque.\n` +
        `5. **Project Proposal / Quotation**: Brief business plan, equipment quotation (e.g. for E-rickshaw, machinery, or shop inventory).\n` +
        `6. **Recent Passport-size Photographs** (2 copies).\n\n` +
        `*Note: Final eligibility and loan sanction are subject to verification of physical documents by your State Channelising Agency (SCA) or lending bank.*`;

    return {
      reply,
      language,
      sources,
      suggestedQuestions: [
        language === 'hi' ? 'आवेदन कैसे और कहाँ जमा करना है?' : 'Where and how do I submit my application?',
        language === 'hi' ? 'क्या ई-रिक्शा के लिए ग्रीन बिजनेस योजना उपलब्ध है?' : 'Is Green Business Scheme available for E-Rickshaws?',
        language === 'hi' ? 'मेरी ₹3 लाख आय पर कौन सी योजना सबसे अच्छी है?' : 'Which scheme is best for my ₹3 Lakh income?',
      ],
      userProfile,
      toolsUsed,
    };
  }

  // Intent 3: Women / Mahila Samriddhi
  const isWomenQuery = lower.includes('women') || lower.includes('mahila') || lower.includes('महिला') || lower.includes('aurat') || lower.includes('samriddhi') || lower.includes('shg');
  if (isWomenQuery) {
    toolsUsed.push('get_scheme_details');
    sources.push('MSY');
    const msy = schemes.find((s) => s.id === 'mahila_samriddhi_yojana')!;
    const reply = language === 'hi'
      ? `### महिला समृद्धि योजना (Mahila Samriddhi Yojana - MSY)\n\n` +
        `यह योजना विशेष रूप से अनुसूचित जाति की महिला उद्यमियों और महिला स्वयं सहायता समूहों (SHGs) के आर्थिक सशक्तिकरण के लिए तैयार की गई है।\n\n` +
        `- **अधिकतम ऋण सीमा**: **₹${msy.terms.maxLoanAmountNumeric.toLocaleString('en-IN')}** तक\n` +
        `- **रियायती ब्याज दर**: केवल **${msy.terms.interestRatePercentNumeric}% वार्षिक** (अति रियायती)\n` +
        `- **पुनर्भुगतान अवधि**: ${msy.terms.maxTenureMonthsNumeric} महीने (3 महीने मोरटोरियम सहित)\n` +
        `- **पात्रता**: वार्षिक पारिवारिक आय ₹5,00,000 से कम होनी चाहिए।\n` +
        `- **उद्देश्य**: सिलाई-कढ़ाई, किराना दुकान, हस्तशिल्प, डेयरी, ब्यूटी पार्लर व छोटे उत्पादक कार्य।\n\n` +
        `*नोट: अंतिम पात्रता और ऋण स्वीकृति राज्य चैनेलाइजिंग एजेंसी (SCA) या अग्रणी बैंकों द्वारा भौतिक दस्तावेज सत्यापन के अधीन है।*`
      : `### Mahila Samriddhi Yojana (MSY) for Women Entrepreneurs:\n\n` +
        `An exclusive micro-credit scheme tailored for SC women entrepreneurs and Self-Help Groups (SHGs).\n\n` +
        `- **Maximum Loan Limit**: Up to **₹${msy.terms.maxLoanAmountNumeric.toLocaleString('en-IN')}**\n` +
        `- **Concessional Interest Rate**: Only **${msy.terms.interestRatePercentNumeric}% p.a.**\n` +
        `- **Repayment Tenure**: ${msy.terms.maxTenureMonthsNumeric} months (with 3-month moratorium)\n` +
        `- **Income Ceiling**: Annual family income up to ₹5,00,000 p.a.\n` +
        `- **Eligible Activities**: Tailoring, handicrafts, retail grocery, dairy, beauty parlor, and micro-enterprises.\n\n` +
        `*Note: Final eligibility and loan sanction are subject to verification of physical documents by your State Channelising Agency (SCA) or lending bank.*`;

    return {
      reply,
      language,
      sources,
      suggestedQuestions: [
        language === 'hi' ? 'महिला समृद्धि योजना के लिए कौन से दस्तावेज चाहिए?' : 'What documents are required for Mahila Samriddhi Yojana?',
        language === 'hi' ? '₹1,40,000 के ऋण पर मासिक ईएमआई कितनी होगी?' : 'What will be the monthly EMI for a ₹1,40,000 loan?',
        language === 'hi' ? 'क्या स्वयं सहायता समूह (SHG) भी आवेदन कर सकता है?' : 'Can Self Help Groups (SHGs) also apply?',
      ],
      userProfile: { ...userProfile, gender: 'female', applicant_type: 'female' },
      toolsUsed,
    };
  }

  // Intent 4: Green Business / E-Rickshaw
  const isGreenQuery = lower.includes('green') || lower.includes('rickshaw') || lower.includes('ई-रिक्शा') || lower.includes('solar') || lower.includes('सौर') || lower.includes('ev');
  if (isGreenQuery) {
    toolsUsed.push('get_scheme_details');
    sources.push('GBS');
    const gbs = schemes.find((s) => s.id === 'green_business_scheme')!;
    const reply = language === 'hi'
      ? `### ग्रीन बिजनेस योजना (Green Business Scheme - GBS)\n\n` +
        `यह योजना पर्यावरण-अनुकूल व्यवसाय जैसे **ई-रिक्शा**, सोलर रूफटॉप, सोलर पंप और अपशिष्ट प्रबंधन इकाइयों के लिए वित्तीय सहायता प्रदान करती है।\n\n` +
        `- **अधिकतम ऋण सहायता**: **₹${gbs.terms.maxLoanAmountNumeric.toLocaleString('en-IN')}** (परियोजना लागत का 90% तक)\n` +
        `- **ब्याज दर**: **${gbs.terms.interestRatePercentNumeric}% वार्षिक** (महिला लाभार्थियों को 0.5% अतिरिक्त छूट)\n` +
        `- **पुनर्भुगतान अवधि**: ${gbs.terms.maxTenureMonthsNumeric} महीने (6 महीने मोरटोरियम सहित)\n` +
        `- **ई-रिक्शा के लिए अतिरिक्त आवश्यकता**: वैध ड्राइविंग लाइसेंस / कमर्शियल लाइसेंस और अधिकृत वाहन डीलर से कोटेशन।\n\n` +
        `*नोट: अंतिम ऋण स्वीकृति आपके राज्य की चैनेलाइजिंग एजेंसी (SCA) या अधिकृत बैंक द्वारा भौतिक दस्तावेज सत्यापन के अधीन है।*`
      : `### Green Business Scheme (GBS) - E-Rickshaws & Solar Units:\n\n` +
        `Provides concessional credit for climate-friendly and clean-energy micro-enterprises including battery-operated E-Rickshaws, solar rooftop units, and eco-friendly transport.\n\n` +
        `- **Max Loan Assistance**: Up to **₹${gbs.terms.maxLoanAmountNumeric.toLocaleString('en-IN')}** (up to 90% of unit cost)\n` +
        `- **Interest Rate**: **${gbs.terms.interestRatePercentNumeric}% p.a.** (0.5% rebate for women entrepreneurs)\n` +
        `- **Repayment Tenure**: ${gbs.terms.maxTenureMonthsNumeric} months (with 6-month gestation moratorium)\n` +
        `- **For E-Rickshaw Applicants**: Requires a valid Commercial Driving License and official proforma invoice from an authorized dealer.\n\n` +
        `*Note: Final eligibility and loan sanction are subject to verification of physical documents by your State Channelising Agency (SCA) or lending bank.*`;

    return {
      reply,
      language,
      sources,
      suggestedQuestions: [
        language === 'hi' ? 'ई-रिक्शा ऋण पर मासिक किस्त (EMI) कितनी होगी?' : 'What is the monthly EMI for an E-Rickshaw loan?',
        language === 'hi' ? 'इसके लिए कौन से दस्तावेज जमा करने होंगे?' : 'What documents must be submitted?',
        language === 'hi' ? 'नजदीकी राज्य एससी निगम (SCA) कार्यालय कहाँ है?' : 'Where is my State Channelising Agency (SCA) office?',
      ],
      userProfile: { ...userProfile, business_type: 'e_rickshaw', purpose: 'business' },
      toolsUsed,
    };
  }

  // Intent 5: Channel Partners / Where to apply
  const isPartnerQuery = lower.includes('partner') || lower.includes('where to apply') || lower.includes('कहाँ आवेदन') || lower.includes('bank') || lower.includes('sca') || lower.includes('office') || lower.includes('branch');
  if (isPartnerQuery) {
    toolsUsed.push('search_channel_partners');
    const partnerList = executeTool('search_channel_partners', { state: userProfile.state || '' });
    const reply = language === 'hi'
      ? `### आप आवेदन कहाँ और कैसे कर सकते हैं (चैनल पार्टनर्स):\n\n` +
        `एनएसएफडीसी (NSFDC) योजनाओं के तहत ऋण सीधे एनएसएफडीसी से नहीं, बल्कि अधिकृत **राज्य चैनेलाइजिंग एजेंसियों (SCA)**, सार्वजनिक क्षेत्र के बैंकों और क्षेत्रीय ग्रामीण बैंकों (RRB) के माध्यम से वितरित किए जाते हैं:\n\n` +
        `1. **राज्य अनुसूचित जाति वित्त एवं विकास निगम (SCA)**: प्रत्येक राज्य में जिला मुख्यालयों (Vikas Bhawan / कलेक्ट्रेट) में स्थित।\n` +
        `2. **अग्रणी सार्वजनिक क्षेत्र के बैंक**: जैसे पंजाब नेशनल बैंक (PNB), भारतीय स्टेट बैंक (SBI) आदि।\n` +
        `3. **क्षेत्रीय ग्रामीण बैंक (RRB)** और अधिकृत NBFC-MFI सूक्ष्म वित्त संस्थान।\n\n` +
        `आप वेबसाइट के **"Channel Partner Locator"** टैब पर जाकर अपने जिले के नजदीकी कार्यालय का पता, फोन नंबर और कार्य समय देख सकते हैं।\n\n` +
        `*नोट: अंतिम ऋण स्वीकृति भौतिक दस्तावेजों के सत्यापन के अधीन है।*`
      : `### Where and How to Apply (Channel Partner Network):\n\n` +
        `NSFDC concessional loans are disbursed at the grassroots level through authorized **State Channelising Agencies (SCAs)**, Public Sector Banks, and Regional Rural Banks (RRBs):\n\n` +
        `1. **State SC Finance & Development Corporations (SCA)**: Located in every state/UT at District Headquarters (usually inside Vikas Bhawan / Collectorate).\n` +
        `2. **Public Sector Banks**: Lead District Offices of PNB, SBI, and other scheduled commercial banks.\n` +
        `3. **Regional Rural Banks (RRB)** & authorized Micro-Finance Institutions (MFIs).\n\n` +
        `You can find exact office addresses, phone numbers, and working hours in the **Channel Partner Locator** tab on this portal.\n\n` +
        `*Note: Final loan sanction is subject to verification of physical documents by the partner branch.*`;

    return {
      reply,
      language,
      sources: ['MCF', 'TLS'],
      suggestedQuestions: [
        language === 'hi' ? 'आवेदन के साथ कौन से दस्तावेज संलग्न करने हैं?' : 'Which documents must be attached with the application?',
        language === 'hi' ? 'ऋण स्वीकृत होने में कितना समय लगता है?' : 'How long does the loan sanction process take?',
        language === 'hi' ? 'क्या महिलाओं के लिए विशेष ब्याज छूट उपलब्ध है?' : 'Is there a special interest rebate for women?',
      ],
      userProfile,
      toolsUsed,
    };
  }

  // Default Overview / Discovery
  toolsUsed.push('get_all_schemes');
  sources.push('MCF', 'TLS', 'ELS', 'MSY', 'GBS', 'SUY');
  const reply = language === 'hi'
    ? `### नमस्ते! मैं योजना सेतु सहायक (Yojna Setu Assistant) हूँ।\n\n` +
      `मैं सामाजिक न्याय और अधिकारिता मंत्रालय (MoSJE) एवं एनएसएफडीसी (NSFDC) की रियायती ऋण योजनाओं के बारे में आपकी सहायता के लिए तैयार हूँ।\n\n` +
      `हमारे सत्यापित डेटाबेस में निम्नलिखित मुख्य योजनाएं उपलब्ध हैं:\n\n` +
      `1. **लघु ऋण वित्त योजना (MCF)**: छोटे व्यवसाय, दुकानदारों व कारीगरों के लिए ₹1.40 लाख तक 5% ब्याज दर पर।\n` +
      `2. **महिला समृद्धि योजना (MSY)**: अनुसूचित जाति की महिला उद्यमियों के लिए विशेष 4% ब्याज दर पर ₹1.40 लाख तक।\n` +
      `3. **ग्रीन बिजनेस योजना (GBS)**: ई-रिक्शा, सोलर पैनल व पर्यावरण-अनुकूल उद्यमों हेतु ₹27 लाख तक 6% ब्याज दर पर।\n` +
      `4. **टर्म लोन योजना (TLS)**: बड़े वाणिज्यिक, निर्माण व सेवा उद्योगों हेतु ₹45 लाख तक।\n` +
      `5. **शिक्षा ऋण योजना (ELS)**: व्यावसायिक उच्च शिक्षा हेतु भारत और विदेश में ₹20 लाख तक 4% ब्याज दर पर।\n` +
      `6. **स्वच्छता उद्यमी योजना (SUY)**: सफाई कर्मचारियों के लिए मशीनीकृत स्वच्छता उपकरणों हेतु ₹45 लाख तक 4.5% ब्याज पर।\n\n` +
      `**पात्रता नियम**: आवेदक अनुसूचित जाति (SC) से होने चाहिए तथा वार्षिक पारिवारिक आय ₹5.00 लाख से कम होनी चाहिए। महिलाओं को 0.5% अतिरिक्त ब्याज छूट मिलती है।\n\n` +
      `*नोट: अंतिम ऋण स्वीकृति राज्य चैनेलाइजिंग एजेंसी (SCA) या बैंक द्वारा भौतिक दस्तावेज सत्यापन के अधीन है।*`
    : `### Welcome to Yojna Setu Assistant!\n\n` +
      `I am your official AI Guidance Assistant for concessional credit schemes offered by NSFDC, Ministry of Social Justice and Empowerment (MoSJE), Government of India.\n\n` +
      `Here is an overview of our verified concessional loan schemes:\n\n` +
      `1. **Micro Credit Finance (MCF)**: Micro-loans up to ₹1.40 Lakhs at 5.0% p.a. for small vendors, artisans, and trades.\n` +
      `2. **Mahila Samriddhi Yojana (MSY)**: Micro-credit exclusively for SC women entrepreneurs at an ultra-low 4.0% p.a. interest.\n` +
      `3. **Green Business Scheme (GBS)**: Up to ₹27 Lakhs at 6.0% p.a. for E-rickshaws, solar rooftops, and green technologies.\n` +
      `4. **Term Loan Scheme (TLS)**: Up to ₹45 Lakhs for viable commercial, transport, or manufacturing projects.\n` +
      `5. **Educational Loan Scheme (ELS)**: Up to ₹20 Lakhs at 4.0% p.a. (3.5% for girl students) for professional higher education.\n` +
      `6. **Swachhta Udayami Yojana (SUY)**: Up to ₹45 Lakhs at 4.5% p.a. for mechanized sanitation equipment to protect Safai Karamcharis.\n\n` +
      `**Core Eligibility**: Annual family income must be ≤ ₹5.00 Lakhs p.a. Women entrepreneurs receive an additional 0.5% p.a. interest rebate.\n\n` +
      `*Note: Final eligibility and loan sanction are subject to verification of physical documents by your State Channelising Agency (SCA) or lending bank.*`;

  return {
    reply,
    language,
    sources,
    suggestedQuestions: [
      language === 'hi' ? 'मेरी ₹3 लाख आय पर कौन सा ऋण मिल सकता है?' : 'What loan can I get with ₹3 Lakh annual family income?',
      language === 'hi' ? 'महिला समृद्धि योजना के लिए क्या नियम हैं?' : 'What are the rules for Mahila Samriddhi Yojana?',
      language === 'hi' ? 'ई-रिक्शा खरीदने के लिए कितना ऋण और ईएमआई होगी?' : 'How much loan and EMI for buying an E-Rickshaw?',
    ],
    userProfile,
    toolsUsed,
  };
}

// -------------------------------------------------------------
// Model Call Helper with Transient Spike Retry & Fallback
// -------------------------------------------------------------
async function generateContentWithFallback(
  ai: GoogleGenAI,
  contents: any[],
  tools: any[],
  systemInstruction: string
) {
  // Primary model 'gemini-3.8-flash' with official modern fallback 'gemini-3.6-flash'
  const candidateModels = ['gemini-3.8-flash', 'gemini-3.6-flash'];
  let lastError: any = null;

  for (const model of candidateModels) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction,
            tools,
          },
        });
        return response;
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || String(err);

        // If quota is exhausted or model is unavailable, immediately try next candidate model
        if (
          errMsg.includes('429') ||
          errMsg.includes('RESOURCE_EXHAUSTED') ||
          errMsg.includes('404') ||
          errMsg.includes('NOT_FOUND')
        ) {
          break;
        }

        const isTransient =
          errMsg.includes('503') ||
          errMsg.includes('UNAVAILABLE') ||
          errMsg.includes('high demand') ||
          errMsg.includes('500');

        if (isTransient && attempt === 0) {
          // Brief pause before retrying on temporary spike
          await new Promise((resolve) => setTimeout(resolve, 600));
          continue;
        }
        break;
      }
    }
  }

  throw lastError;
}

// -------------------------------------------------------------
// Primary Chat Processor with Gemini Tool Calling
// -------------------------------------------------------------
export async function processAssistantChat(req: AssistantChatRequest): Promise<AssistantChatResponse> {
  const { message, conversationHistory = [], language = 'en', locale = 'en', userProfile: initialProfile = {}, schemeContext } = req;
  const activeLang = req.language || req.locale || 'en';

  if (!message || !message.trim()) {
    return {
      reply: activeLang === 'hi' ? 'कृपया अपना प्रश्न लिखें।' : 'Please enter your question.',
      language: activeLang,
      sources: [],
      suggestedQuestions: [],
      userProfile: initialProfile,
      toolsUsed: [],
    };
  }

  // Update profile using lightweight heuristic
  let currentProfile = extractProfileFromText(message, initialProfile);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set. Executing deterministic fallback assistant.');
    return buildFallbackResponse(message, currentProfile, activeLang, schemeContext);
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    // Build chat contents array preserving conversation history
    const contents: any[] = [];

    // Provide context on current known profile & schemeContext
    const contextPreamble = `System Context:
- Citizen Language Preference: ${activeLang === 'hi' ? 'Hindi (हिंदी / Hinglish)' : 'English'}
- Current Known User Profile: ${JSON.stringify(currentProfile)}
${schemeContext ? `- Active Scheme Under Discussion: ${JSON.stringify(schemeContext)}` : ''}
Rule: Do NOT ask the user for information already present in the Known User Profile. Ground every factual claim using the provided tools.`;

    contents.push({
      role: 'user',
      parts: [{ text: contextPreamble }],
    });

    contents.push({
      role: 'model',
      parts: [{ text: 'Understood. I will strictly ground all scheme details, interest rates, eligibility criteria, and EMI calculations in the official NSFDC database and tools without hallucination.' }],
    });

    // Add prior conversation history (limit to last 6 turns to keep context fast and fresh)
    const recentHistory = conversationHistory.slice(-6);
    for (const item of recentHistory) {
      contents.push({
        role: item.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: item.text }],
      });
    }

    // Add current user query
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const toolsUsed: string[] = [];
    let loopCount = 0;
    const maxLoops = 3;
    let finalResponseText = '';

    while (loopCount < maxLoops) {
      loopCount++;
      const response = await generateContentWithFallback(
        ai,
        contents,
        [{ functionDeclarations: toolDeclarations }],
        SYSTEM_PROMPT
      );

      const functionCalls = response.functionCalls;

      if (functionCalls && functionCalls.length > 0) {
        // Execute tool calls
        const candidateContent = response.candidates?.[0]?.content;
        if (candidateContent) {
          contents.push(candidateContent);
        }

        const functionResponseParts: any[] = [];
        for (const fc of functionCalls) {
          const fnName = fc.name || '';
          if (!fnName) continue;
          toolsUsed.push(fnName);
          const toolResult = executeTool(fnName, fc.args || {});

          // In Gemini API, functionResponse.response MUST be a JSON Object (google.protobuf.Struct),
          // NEVER a JSON Array or primitive. If toolResult is an array or primitive, wrap it in { output: toolResult }.
          const responsePayload: Record<string, unknown> =
            typeof toolResult === 'object' && toolResult !== null && !Array.isArray(toolResult)
              ? (toolResult as Record<string, unknown>)
              : { output: toolResult };

          functionResponseParts.push({
            functionResponse: {
              name: fnName,
              id: fc.id,
              response: responsePayload,
            },
          });
        }

        contents.push({
          role: 'user',
          parts: functionResponseParts,
        });
      } else {
        // We received the final text answer
        finalResponseText = response.text || '';
        break;
      }
    }

    if (!finalResponseText) {
      return buildFallbackResponse(message, currentProfile, activeLang, schemeContext);
    }

    // Extract SOURCES, SUGGESTED_QUESTIONS, and USER_PROFILE_UPDATE from model response
    let cleanReply = finalResponseText;
    let sources: string[] = [];
    let suggestedQuestions: string[] = [];

    const sourcesMatch = cleanReply.match(/SOURCES:\s*(\[[^\]]*\])/i);
    if (sourcesMatch) {
      try {
        sources = JSON.parse(sourcesMatch[1]);
      } catch {
        // Ignore JSON parse error
      }
      cleanReply = cleanReply.replace(/SOURCES:\s*(\[[^\]]*\])/gi, '').trim();
    }

    const sqMatch = cleanReply.match(/SUGGESTED_QUESTIONS:\s*(\[[^\]]*\])/i);
    if (sqMatch) {
      try {
        suggestedQuestions = JSON.parse(sqMatch[1]);
      } catch {
        // Ignore JSON parse error
      }
      cleanReply = cleanReply.replace(/SUGGESTED_QUESTIONS:\s*(\[[^\]]*\])/gi, '').trim();
    }

    const upMatch = cleanReply.match(/USER_PROFILE_UPDATE:\s*(\{[^\}]*\})/i);
    if (upMatch) {
      try {
        const updateObj = JSON.parse(upMatch[1]);
        currentProfile = { ...currentProfile, ...updateObj };
      } catch {
        // Ignore JSON parse error
      }
      cleanReply = cleanReply.replace(/USER_PROFILE_UPDATE:\s*(\{[^\}]*\})/gi, '').trim();
    }

    // Default suggestions if model omitted them
    if (!suggestedQuestions || suggestedQuestions.length === 0) {
      suggestedQuestions = activeLang === 'hi'
        ? ['इस योजना के लिए कौन से दस्तावेज चाहिए?', 'मासिक ईएमआई (EMI) कितनी होगी?', 'नजदीकी चैनल पार्टनर बैंक कहाँ है?']
        : ['What documents are required for this scheme?', 'What would be the monthly EMI?', 'Where is the nearest channel partner bank?'];
    }

    return {
      reply: cleanReply,
      language: activeLang,
      sources,
      suggestedQuestions: suggestedQuestions.slice(0, 3),
      userProfile: currentProfile,
      toolsUsed,
    };
  } catch (err: any) {
    const errMsg = err?.message || String(err);
    console.warn('Gemini Assistant API unavailable or rate-limited; serving verified advisory fallback:', errMsg);
    // Graceful fallback to deterministic engine
    return buildFallbackResponse(message, currentProfile, activeLang, schemeContext);
  }
}
