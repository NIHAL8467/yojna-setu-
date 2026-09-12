import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import schemesData from '@/data/schemes.json';
import partnersData from '@/data/partners.json';
import { matchSchemes } from '@/lib/rules-engine';
import { calculateEmiSchedule } from '@/lib/emi-calculator';
import {
  VERIFIED_SCHEMES_REGISTRY,
  findVerifiedScheme,
  searchVerifiedSchemesByTopic,
  VerifiedSchemeInfo,
} from '@/lib/national-schemes-data';
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
// Tool Declarations for @google/genai
// -------------------------------------------------------------
const toolDeclarations: FunctionDeclaration[] = [
  {
    name: 'get_all_schemes',
    description: 'Retrieve verified government schemes available on Yojna Setu (including NSFDC concessional loans and major national welfare schemes like PM-KISAN, PM-JAY, Mudra, PMAY).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        category: {
          type: Type.STRING,
          description: "Optional category filter: 'business', 'agriculture', 'education', 'women', 'health', 'housing', 'sanitation', 'artisan'",
        },
      },
    },
  },
  {
    name: 'get_scheme_details',
    description: 'Get verified factual details of a specific scheme (e.g., PM-KISAN, PM-JAY, PMAY, PMMY, PM SVANidhi, PM Vishwakarma, MCF, TLS, ELS, MSY, GBS, SUY, Sukanya Samriddhi).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        schemeIdOrCode: {
          type: Type.STRING,
          description: "Name, ID, or acronym of the scheme (e.g. 'PM-KISAN', 'Ayushman Bharat', 'Mudra', 'PMAY', 'PM SVANidhi', 'PM Vishwakarma', 'MCF', 'MSY', 'ELS', 'GBS', 'TLS', 'SUY').",
        },
      },
      required: ['schemeIdOrCode'],
    },
  },
  {
    name: 'search_schemes',
    description: 'Search government schemes by topic, target group (farmers, students, women, artisans, street vendors), or activity.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        targetGroupOrKeyword: {
          type: Type.STRING,
          description: "Search keywords, target group, or activity (e.g. 'farmers', 'women', 'students', 'scholarship', 'e-rickshaw', 'street vendor', 'artisan', 'health')",
        },
      },
      required: ['targetGroupOrKeyword'],
    },
  },
  {
    name: 'check_scheme_eligibility',
    description: 'Evaluate user eligibility and match score for NSFDC concessional loan schemes based on demographic inputs.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        familyIncome: {
          type: Type.NUMBER,
          description: 'Annual family income in INR (Ceiling: ₹5,00,000 p.a.)',
        },
        projectType: {
          type: Type.STRING,
          description: "Activity sector: 'business', 'education', 'transport', 'green_energy', 'sanitation', 'artisan', 'retail', 'services', 'agriculture'",
        },
        estimatedCost: {
          type: Type.NUMBER,
          description: 'Total estimated project or loan cost in INR',
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
    description: 'Calculate official reducing-balance monthly EMI installment and repayment schedule for concessional loans.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        principal: {
          type: Type.NUMBER,
          description: 'Principal loan amount in INR (e.g. 100000)',
        },
        annualInterestRatePercent: {
          type: Type.NUMBER,
          description: 'Annual interest rate percent (e.g. 4.0, 5.0, 6.0)',
        },
        totalTenureMonths: {
          type: Type.INTEGER,
          description: 'Total tenure in months (e.g. 36, 60)',
        },
        moratoriumMonths: {
          type: Type.INTEGER,
          description: 'Moratorium / gestation period in months where principal repayment is deferred',
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
      },
    },
  },
];

// -------------------------------------------------------------
// Tool Execution Engine
// -------------------------------------------------------------
function executeTool(name: string, args: Record<string, any>): any {
  const schemes = schemesData as Scheme[];
  const partners = partnersData as ChannelPartner[];

  switch (name) {
    case 'get_all_schemes': {
      const cat = (args.category || '').toLowerCase();
      const nsfdcList = schemes.map((s) => ({
        id: s.id,
        code: s.code,
        name: s.name,
        nameHi: s.nameHi,
        category: s.category,
        maxLoanAmount: `Up to ₹${s.terms.maxLoanAmountNumeric.toLocaleString('en-IN')}`,
        interestRate: `${s.terms.interestRatePercentNumeric}% p.a.`,
        targetAudience: s.targetAudience,
      }));

      const nationalList = VERIFIED_SCHEMES_REGISTRY.map((s) => ({
        id: s.id,
        code: s.code,
        name: s.name,
        nameHi: s.nameHi,
        category: s.category,
        targetGroup: s.targetGroup,
        benefit: s.financialBenefit,
      }));

      if (cat) {
        return [
          ...nsfdcList.filter((s) => s.category.toLowerCase().includes(cat)),
          ...nationalList.filter((s) => s.category.toLowerCase().includes(cat)),
        ];
      }

      return { nsfdcSchemes: nsfdcList, nationalWelfareSchemes: nationalList };
    }

    case 'get_scheme_details': {
      const query = (args.schemeIdOrCode || '').toString().toLowerCase().trim();

      // Check National Schemes registry first
      const natScheme = findVerifiedScheme(query);
      if (natScheme) {
        return {
          id: natScheme.id,
          code: natScheme.code,
          name: natScheme.name,
          nameHi: natScheme.nameHi,
          category: natScheme.category,
          targetGroup: natScheme.targetGroup,
          definition: natScheme.definition,
          definitionHi: natScheme.definitionHi,
          eligibility: natScheme.eligibility,
          eligibilityHi: natScheme.eligibilityHi,
          financialBenefit: natScheme.financialBenefit,
          financialBenefitHi: natScheme.financialBenefitHi,
          requiredDocuments: natScheme.requiredDocuments,
          requiredDocumentsHi: natScheme.requiredDocumentsHi,
          howToApply: natScheme.howToApply,
          howToApplyHi: natScheme.howToApplyHi,
          officialPortal: natScheme.officialPortal,
        };
      }

      // Check NSFDC schemesData
      const found = schemes.find(
        (s) =>
          s.id.toLowerCase() === query ||
          s.code.toLowerCase() === query ||
          s.name.toLowerCase().includes(query) ||
          s.nameHi.toLowerCase().includes(query)
      );

      if (found) {
        return {
          id: found.id,
          code: found.code,
          name: found.name,
          nameHi: found.nameHi,
          category: found.category,
          definition: found.description,
          definitionHi: found.descriptionHi,
          targetGroup: found.targetAudience,
          eligibility: [
            `Annual family income must be ≤ ₹${found.eligibility.maxFamilyIncome.toLocaleString('en-IN')} p.a.`,
            `Age between ${found.eligibility.minAge || 18} and ${found.eligibility.maxAge || 65} years.`,
            `Must belong to Scheduled Caste (SC) or specified target community.`,
            `Activity: ${found.eligibility.projectTypes.join(', ')}.`,
          ],
          financialBenefit: `Loan assistance up to ₹${found.terms.maxLoanAmountNumeric.toLocaleString('en-IN')} at ${found.terms.interestRatePercentNumeric}% p.a. interest (Women get 0.5% p.a. rebate).`,
          requiredDocuments: found.requiredDocuments,
          howToApply: 'Submit application with project proposal and caste certificate to your State Channelising Agency (SCA) at District Vikas Bhawan or designated Public Sector Bank.',
          terms: {
            maxLoan: found.terms.maxLoanAmountNumeric,
            interestRate: found.terms.interestRatePercentNumeric,
            tenureMonths: found.terms.maxTenureMonthsNumeric,
            moratoriumMonths: found.terms.moratoriumMonthsNumeric,
          },
        };
      }

      return {
        error: `Scheme '${args.schemeIdOrCode}' was not found in Yojna Setu's verified database. Available verified schemes include: PM-KISAN, PM-JAY (Ayushman Bharat), PMAY, PM Mudra, PM SVANidhi, PM Vishwakarma, Sukanya Samriddhi, Post-Matric Scholarship, MCF, TLS, ELS, MSY, GBS, SUY.`,
      };
    }

    case 'search_schemes': {
      const kw = (args.targetGroupOrKeyword || '').toLowerCase().trim();
      const matchedNat = searchVerifiedSchemesByTopic(kw);
      const matchedNsfdc = schemes.filter(
        (s) =>
          s.name.toLowerCase().includes(kw) ||
          s.category.toLowerCase().includes(kw) ||
          s.targetAudience.toLowerCase().includes(kw) ||
          s.eligibility.projectTypes.some((t) => t.includes(kw)) ||
          (s.eligibility.specialFocus || []).some((f) => f.includes(kw))
      );

      return [
        ...matchedNat.map((s) => ({
          code: s.code,
          name: s.name,
          category: s.category,
          targetGroup: s.targetGroup,
          summary: s.definition,
        })),
        ...matchedNsfdc.map((s) => ({
          code: s.code,
          name: s.name,
          category: s.category,
          targetGroup: s.targetAudience,
          summary: s.description,
        })),
      ];
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

      const filtered = partners.filter((p) => {
        if (stateQuery && !p.state.toLowerCase().includes(stateQuery)) return false;
        if (districtQuery && !p.district.toLowerCase().includes(districtQuery) && !p.address.toLowerCase().includes(districtQuery)) return false;
        return true;
      });

      const list = filtered.length > 0 ? filtered : partners.slice(0, 4);
      return list.map((p) => ({
        id: p.id,
        name: p.name,
        type: p.type,
        state: p.state,
        district: p.district,
        address: p.address,
        phone: p.phone,
        email: p.email,
        workingHours: p.workingHours,
      }));
    }

    default:
      return { error: `Tool ${name} is not recognized.` };
  }
}

// -------------------------------------------------------------
// System Prompt for Yojna Setu Assistant
// -------------------------------------------------------------
const SYSTEM_PROMPT = `You are the official "Yojna Setu Assistant", dedicated to helping Indian citizens understand and discover Indian government schemes and benefits.

CRITICAL DIRECTIVES:

1. ANSWER THE EXACT QUESTION ASKED:
- Understand the user's specific question and answer ONLY what is relevant to that question.
- Do NOT output long generic explanations, repetitive boilerplate, or unsolicited essays.
- Examples:
  * "What is PM Kisan?" -> Answer ONLY what the scheme is in 1-2 concise sentences. (e.g. "PM-KISAN is a Government of India scheme that provides financial support to eligible farmer families. The benefit is provided through direct bank transfer.")
  * "Who can apply for PM Kisan?" / "Who is eligible?" -> Answer ONLY about eligibility criteria.
  * "How much money is given?" -> Answer ONLY about the financial benefit / amount.
  * "Which documents are required?" -> Answer ONLY the bulleted list of documents.
  * "How to apply?" -> Answer ONLY the application steps / portal.
  * "What is the interest rate / EMI?" -> Answer ONLY the interest rate / EMI details.

2. CONTEXT AWARENESS & MULTI-TURN SESSION MEMORY:
- Maintain conversation context across the current session.
- When the user asks a follow-up without repeating the scheme name (e.g., "Who can apply?", "How much money?", "Documents required?", "Isme loan kitna milega?", "Kaise apply kare?"), automatically resolve the question to the scheme discussed in the previous turn.
- Do NOT ask the user to repeat the scheme name.

3. USE EXISTING VERIFIED SCHEME DATA:
- Answer using verified scheme data from the tools.
- Do NOT invent schemes, eligibility rules, benefits, application procedures, URLs, amounts, or government facts.
- If information is not available in the verified database, state clearly:
  "This specific information is not currently available in Yojna Setu's verified database. Please check official government portals (such as myscheme.gov.in) or visit your local administrative office."

4. DEMOGRAPHIC QUESTIONS:
- Do NOT ask for demographic information (income, age, caste, gender) for informational questions ("What is this scheme?", "What is the benefit?", etc.).
- ONLY ask for demographic details if the user specifically requests personalized eligibility assessment ("Am I eligible?", "Check my eligibility", "Mere liye kaunsi scheme hai?").

5. SCHEME DISCOVERY:
- If the user asks broad questions like "Students ke liye schemes batao", "Women ke liye government schemes?", "Farmers ke liye kya schemes hain?", "Scholarship schemes batao":
  * Present a concise list of 2-4 matching schemes with a 1-line description of each.
  * Do NOT ask for demographic details unless needed.

6. ACTIONS & NAVIGATION:
- When appropriate, mention relevant Yojna Setu tools:
  * "You can open the **Smart Scheme Recommender** to check schemes based on your details."
  * "Open the **EMI Calculator** from Yojna Setu to calculate monthly installments."
  * "Use the **Channel Partner Locator** to find nearby State Channelising Agency (SCA) or bank branches."

7. ERROR & OUT-OF-SCOPE QUESTIONS:
- If the user's question is unrelated to government schemes or Yojna Setu (e.g. general trivia, coding, sports):
  * Politely state: "I'm here to help with Indian government schemes, eligibility, benefits, documents, and Yojna Setu services. Please ask me something related to these."

8. LANGUAGE & TONE:
- Courteous, respectful, concise, clear, and direct.
- Respond in the language used by the user (Hindi, Hinglish, or English).

OUTPUT FORMAT AT THE END OF YOUR RESPONSE:
SOURCES: ["Code1", "Code2"] (e.g. SOURCES: ["PM-KISAN"] or SOURCES: ["MCF"])
SUGGESTED_QUESTIONS: ["Follow up question 1?", "Follow up question 2?", "Follow up question 3?"]
USER_PROFILE_UPDATE: {} (optional profile attributes discovered, or empty object {})`;

// -------------------------------------------------------------
// Active Scheme & Context Resolution Helper
// -------------------------------------------------------------
interface SchemeContextMatch {
  schemeKey: string;
  schemeName: string;
  nationalScheme?: VerifiedSchemeInfo;
  nsfdcScheme?: Scheme;
}

export function detectActiveSchemeFromHistory(
  currentMessage: string,
  history: ConversationMessage[]
): SchemeContextMatch | null {
  const schemes = schemesData as Scheme[];
  const allNat = VERIFIED_SCHEMES_REGISTRY;

  // 1. Check current message first
  const currentLower = currentMessage.toLowerCase();
  for (const s of allNat) {
    if (
      currentLower.includes(s.code.toLowerCase()) ||
      currentLower.includes(s.name.toLowerCase()) ||
      currentLower.includes(s.nameHi.toLowerCase()) ||
      s.keywords.some((k) => currentLower.includes(k))
    ) {
      return { schemeKey: s.id, schemeName: s.name, nationalScheme: s };
    }
  }

  for (const s of schemes) {
    if (
      currentLower.includes(s.code.toLowerCase()) ||
      currentLower.includes(s.name.toLowerCase()) ||
      currentLower.includes(s.nameHi.toLowerCase()) ||
      currentLower.includes(s.id.toLowerCase().replace(/_/g, ' '))
    ) {
      return { schemeKey: s.id, schemeName: s.name, nsfdcScheme: s };
    }
  }

  // Common keywords matching specific schemes
  if (currentLower.includes('e-rickshaw') || currentLower.includes('rickshaw') || currentLower.includes('solar')) {
    const gbs = schemes.find((s) => s.id === 'green_business_scheme');
    if (gbs) return { schemeKey: gbs.id, schemeName: gbs.name, nsfdcScheme: gbs };
  }
  if (currentLower.includes('safai') || currentLower.includes('sanitation') || currentLower.includes('cleaning machine')) {
    const suy = schemes.find((s) => s.id === 'swachhta_udayami_yojana');
    if (suy) return { schemeKey: suy.id, schemeName: suy.name, nsfdcScheme: suy };
  }
  if (currentLower.includes('micro credit') || currentLower.includes('mcf')) {
    const mcf = schemes.find((s) => s.id === 'micro_credit_finance');
    if (mcf) return { schemeKey: mcf.id, schemeName: mcf.name, nsfdcScheme: mcf };
  }

  // 2. If not found in current message, look back in conversation history (newest to oldest)
  const reversedHistory = [...history].reverse();
  for (const msg of reversedHistory) {
    const txt = msg.text.toLowerCase();
    for (const s of allNat) {
      if (
        txt.includes(s.code.toLowerCase()) ||
        txt.includes(s.name.toLowerCase()) ||
        txt.includes(s.nameHi.toLowerCase()) ||
        s.keywords.some((k) => txt.includes(k))
      ) {
        return { schemeKey: s.id, schemeName: s.name, nationalScheme: s };
      }
    }

    for (const s of schemes) {
      if (
        txt.includes(s.code.toLowerCase()) ||
        txt.includes(s.name.toLowerCase()) ||
        txt.includes(s.nameHi.toLowerCase()) ||
        txt.includes(s.id.toLowerCase().replace(/_/g, ' '))
      ) {
        return { schemeKey: s.id, schemeName: s.name, nsfdcScheme: s };
      }
    }

    if (txt.includes('e-rickshaw') || txt.includes('solar')) {
      const gbs = schemes.find((s) => s.id === 'green_business_scheme');
      if (gbs) return { schemeKey: gbs.id, schemeName: gbs.name, nsfdcScheme: gbs };
    }
    if (txt.includes('mahila') || txt.includes('women')) {
      const msy = schemes.find((s) => s.id === 'mahila_samriddhi_yojana');
      if (msy) return { schemeKey: msy.id, schemeName: msy.name, nsfdcScheme: msy };
    }
  }

  return null;
}

// -------------------------------------------------------------
// Deterministic Grounded Fallback Assistant
// -------------------------------------------------------------
export function buildFallbackResponse(
  message: string,
  userProfile: UserProfileContext,
  language: 'en' | 'hi',
  conversationHistory: ConversationMessage[] = []
): AssistantChatResponse {
  const lower = message.toLowerCase().trim();
  const schemes = schemesData as Scheme[];

  // 1. Identify active scheme from history or current message
  const activeMatch = detectActiveSchemeFromHistory(message, conversationHistory);
  const activeNat = activeMatch?.nationalScheme;
  const activeNsfdc = activeMatch?.nsfdcScheme;
  const activeSchemeName = activeNat?.name || activeNsfdc?.name;

  // 2. Identify Question Intent
  const isGreeting =
    lower === 'hi' ||
    lower === 'hello' ||
    lower === 'namaste' ||
    lower === 'नमस्ते' ||
    lower === 'hey' ||
    lower.startsWith('hi ') ||
    lower.startsWith('hello ');

  const isOutOfScope =
    (lower.includes('weather') ||
      lower.includes('cricket') ||
      lower.includes('capital of') ||
      lower.includes('recipe') ||
      lower.includes('write code') ||
      lower.includes('python') ||
      lower.includes('movie')) &&
    !lower.includes('scheme') &&
    !lower.includes('yojna');

  const isDefinitionQuery =
    lower.startsWith('what is') ||
    lower.startsWith('what are') ||
    lower.startsWith('tell me about') ||
    lower.includes('kya hai') ||
    lower.includes('क्या है') ||
    lower.includes('batao') ||
    lower.includes('बताएं') ||
    lower.includes('details of') ||
    lower.includes('overview');

  const isEligibilityQuery =
    lower.includes('who can apply') ||
    lower.includes('who is eligible') ||
    lower.includes('eligibility') ||
    lower.includes('qualify') ||
    lower.includes('eligible') ||
    lower.includes('patrata') ||
    lower.includes('पात्रता') ||
    lower.includes('कौन आवेदन') ||
    lower.includes('कौन पात्र') ||
    lower.includes('kaun apply');

  const isMoneyQuery =
    lower.includes('how much money') ||
    lower.includes('how much loan') ||
    lower.includes('how much financial') ||
    lower.includes('benefit') ||
    lower.includes('amount') ||
    lower.includes('kitna paisa') ||
    lower.includes('kitna loan') ||
    lower.includes('कितना पैसा') ||
    lower.includes('कितना ऋण') ||
    lower.includes('सहायता राशि') ||
    lower.includes('subsidy');

  const isDocQuery =
    lower.includes('document') ||
    lower.includes('documents') ||
    lower.includes('dastavez') ||
    lower.includes('दस्तावेज') ||
    lower.includes('कागजात') ||
    lower.includes('certificate') ||
    lower.includes('papers') ||
    lower.includes('required papers');

  const isApplyQuery =
    lower.includes('how to apply') ||
    lower.includes('where to apply') ||
    lower.includes('kaise apply') ||
    lower.includes('kahan aavedan') ||
    lower.includes('कहाँ आवेदन') ||
    lower.includes('कैसे आवेदन') ||
    lower.includes('registration') ||
    lower.includes('portal') ||
    lower.includes('apply');

  const isEmiQuery =
    lower.includes('emi') ||
    lower.includes('installment') ||
    lower.includes('interest rate') ||
    lower.includes('byaj') ||
    lower.includes('ब्याज') ||
    lower.includes('किस्त') ||
    lower.includes('monthly payment');

  const isDiscoveryQuery =
    lower.includes('schemes for') ||
    lower.includes('schemes list') ||
    lower.includes('available schemes') ||
    lower.includes('योजनाएं') ||
    lower.includes('योजना बताओ') ||
    lower.includes('students ke liye') ||
    lower.includes('women ke liye') ||
    lower.includes('farmers ke liye') ||
    lower.includes('scholarship');

  // Intent A: Out of Scope
  if (isOutOfScope) {
    const reply =
      language === 'hi'
        ? 'मैं सरकारी योजनाओं, पात्रता, लाभ, आवश्यक दस्तावेजों और योजना सेतु सेवाओं में आपकी सहायता के लिए हूँ। कृपया इनसे संबंधित कोई प्रश्न पूछें।'
        : "I'm here to help with Indian government schemes, eligibility, benefits, documents, and Yojna Setu services. Please ask me something related to these.";
    return {
      reply,
      language,
      sources: [],
      suggestedQuestions: ['What is PM Kisan?', 'Check Mahila Samriddhi Yojana', 'Explore student education loans'],
      userProfile,
      toolsUsed: [],
    };
  }

  // Intent B: Greeting
  if (isGreeting && !activeMatch) {
    const reply =
      language === 'hi'
        ? 'नमस्ते! मैं **योजना सेतु सहायक** हूँ। मैं सरकारी योजनाओं, पात्रता, लाभ और दस्तावेजों की सटीक जानकारी देने के लिए तैयार हूँ। आप किसी विशिष्ट योजना के बारे में पूछ सकते हैं (जैसे: **PM-KISAN**, **महिला समृद्धि योजना**, **मुद्रा योजना**, **शिक्षा ऋण**)।'
        : "Namaste! I am the **Yojna Setu Assistant**. I provide clear, factual guidance on Indian government schemes, eligibility, benefits, and required documents. You can ask about any scheme (such as **PM-KISAN**, **Mahila Samriddhi Yojana**, **PM Mudra**, **Education Loan**).";
    return {
      reply,
      language,
      sources: [],
      suggestedQuestions: ['What is PM Kisan?', 'Who can apply for Mahila Samriddhi?', 'Show schemes for students'],
      userProfile,
      toolsUsed: [],
    };
  }

  // Intent C: Specific Scheme Query (Grounded by Exact Slice)
  if (activeMatch) {
    // 1. ELIGIBILITY ONLY
    if (isEligibilityQuery) {
      if (activeNat) {
        const criteria = language === 'hi' ? activeNat.eligibilityHi : activeNat.eligibility;
        const reply =
          language === 'hi'
            ? `### ${activeNat.nameHi} - पात्रता शर्तें:\n\n` +
              criteria.map((c) => `- ${c}`).join('\n') +
              `\n\n*नोट: पात्रता सत्यापन संबंधित विभाग या बैंक द्वारा भौतिक दस्तावेजों के आधार पर किया जाता है।*`
            : `### Eligibility for ${activeNat.name}:\n\n` +
              criteria.map((c) => `- ${c}`).join('\n') +
              `\n\n*Note: Final qualification depends on physical verification of documents by the authorized department or partner bank.*`;
        return {
          reply,
          language,
          sources: [activeNat.code],
          suggestedQuestions: [
            language === 'hi' ? 'इसमें कितना पैसा मिलता है?' : 'How much money is given?',
            language === 'hi' ? 'कौन से दस्तावेज चाहिए?' : 'Which documents are required?',
            language === 'hi' ? 'आवेदन कैसे करें?' : 'How to apply?',
          ],
          userProfile,
          toolsUsed: ['get_scheme_details'],
        };
      }

      if (activeNsfdc) {
        const reply =
          language === 'hi'
            ? `### ${activeNsfdc.nameHi} - पात्रता शर्तें:\n\n` +
              `- **लक्षित वर्ग**: ${activeNsfdc.targetAudienceHi}\n` +
              `- **पारिवारिक आय सीमा**: वार्षिक आय ₹${activeNsfdc.eligibility.maxFamilyIncome.toLocaleString('en-IN')} से कम होनी चाहिए।\n` +
              `- **आयु सीमा**: ${activeNsfdc.eligibility.minAge || 18} से ${activeNsfdc.eligibility.maxAge || 65} वर्ष।\n` +
              `- **स्वीकृत गतिविधियाँ**: ${activeNsfdc.eligibility.projectTypes.join(', ')}।\n\n` +
              `*नोट: अंतिम पात्रता भौतिक दस्तावेज सत्यापन के अधीन है।*`
            : `### Eligibility for ${activeNsfdc.name}:\n\n` +
              `- **Target Group**: ${activeNsfdc.targetAudience}\n` +
              `- **Family Income Ceiling**: Annual household income must be ≤ ₹${activeNsfdc.eligibility.maxFamilyIncome.toLocaleString('en-IN')} p.a.\n` +
              `- **Age Criteria**: Between ${activeNsfdc.eligibility.minAge || 18} and ${activeNsfdc.eligibility.maxAge || 65} years.\n` +
              `- **Eligible Sectors**: ${activeNsfdc.eligibility.projectTypes.join(', ')}.\n\n` +
              `*Note: Eligibility depends on document verification by your State Channelising Agency (SCA) or bank.*`;
        return {
          reply,
          language,
          sources: [activeNsfdc.code],
          suggestedQuestions: [
            language === 'hi' ? 'अधिकतम ऋण राशि कितनी है?' : 'What is the maximum loan amount?',
            language === 'hi' ? 'आवश्यक दस्तावेज क्या हैं?' : 'What documents are needed?',
            language === 'hi' ? 'मासिक ईएमआई (EMI) कितनी होगी?' : 'What will be the monthly EMI?',
          ],
          userProfile,
          toolsUsed: ['get_scheme_details'],
        };
      }
    }

    // 2. FINANCIAL BENEFIT / AMOUNT ONLY
    if (isMoneyQuery) {
      if (activeNat) {
        const benefitText = language === 'hi' ? activeNat.financialBenefitHi : activeNat.financialBenefit;
        const reply =
          language === 'hi'
            ? `### ${activeNat.nameHi} - वित्तीय लाभ / सहायता राशि:\n\n${benefitText}`
            : `### Financial Benefit under ${activeNat.name}:\n\n${benefitText}`;
        return {
          reply,
          language,
          sources: [activeNat.code],
          suggestedQuestions: [
            language === 'hi' ? 'इसके लिए कौन आवेदन कर सकता है?' : 'Who can apply?',
            language === 'hi' ? 'आवश्यक दस्तावेज कौन से हैं?' : 'Which documents are required?',
            language === 'hi' ? 'आवेदन की प्रक्रिया क्या है?' : 'How to apply?',
          ],
          userProfile,
          toolsUsed: ['get_scheme_details'],
        };
      }

      if (activeNsfdc) {
        const reply =
          language === 'hi'
            ? `### ${activeNsfdc.nameHi} - वित्तीय सहायता व ऋण शर्तें:\n\n` +
              `- **अधिकतम ऋण सीमा**: **₹${activeNsfdc.terms.maxLoanAmountNumeric.toLocaleString('en-IN')}** तक\n` +
              `- **ब्याज दर**: **${activeNsfdc.terms.interestRatePercentNumeric}% वार्षिक** (महिला लाभार्थियों को 0.5% अतिरिक्त छूट)\n` +
              `- **पुनर्भुगतान अवधि**: अधिकतम ${activeNsfdc.terms.maxTenureMonthsNumeric} महीने (${activeNsfdc.terms.moratoriumMonthsNumeric} महीने मोरटोरियम सहित)`
            : `### Financial Terms for ${activeNsfdc.name}:\n\n` +
              `- **Maximum Loan Assistance**: Up to **₹${activeNsfdc.terms.maxLoanAmountNumeric.toLocaleString('en-IN')}**\n` +
              `- **Concessional Interest Rate**: **${activeNsfdc.terms.interestRatePercentNumeric}% p.a.** (Women receive a 0.5% p.a. rebate)\n` +
              `- **Repayment Tenure**: Up to ${activeNsfdc.terms.maxTenureMonthsNumeric} months (including ${activeNsfdc.terms.moratoriumMonthsNumeric} months moratorium)`;
        return {
          reply,
          language,
          sources: [activeNsfdc.code],
          suggestedQuestions: [
            language === 'hi' ? 'ईएमआई (EMI) की गणना कैसे करें?' : 'How to calculate monthly EMI?',
            language === 'hi' ? 'इसके लिए कौन से दस्तावेज चाहिए?' : 'Which documents are needed?',
            language === 'hi' ? 'नजदीकी बैंक या एससी निगम कहाँ है?' : 'Where is the nearest partner office?',
          ],
          userProfile,
          toolsUsed: ['get_scheme_details'],
        };
      }
    }

    // 3. REQUIRED DOCUMENTS ONLY
    if (isDocQuery) {
      if (activeNat) {
        const docs = language === 'hi' ? activeNat.requiredDocumentsHi : activeNat.requiredDocuments;
        const reply =
          language === 'hi'
            ? `### ${activeNat.nameHi} - आवश्यक दस्तावेज:\n\n` + docs.map((d, i) => `${i + 1}. **${d}**`).join('\n')
            : `### Required Documents for ${activeNat.name}:\n\n` + docs.map((d, i) => `${i + 1}. **${d}**`).join('\n');
        return {
          reply,
          language,
          sources: [activeNat.code],
          suggestedQuestions: [
            language === 'hi' ? 'आवेदन कैसे और कहाँ जमा करना है?' : 'How and where to apply?',
            language === 'hi' ? 'पात्रता की मुख्य शर्तें क्या हैं?' : 'Who is eligible?',
            language === 'hi' ? 'कितनी वित्तीय सहायता मिलती है?' : 'How much financial benefit?',
          ],
          userProfile,
          toolsUsed: ['get_scheme_details'],
        };
      }

      if (activeNsfdc) {
        const reply =
          language === 'hi'
            ? `### ${activeNsfdc.nameHi} - आवश्यक दस्तावेज:\n\n` +
              activeNsfdc.requiredDocuments.map((d, i) => `${i + 1}. **${d}**`).join('\n') +
              `\n\n*नोट: आवेदन के साथ स्व-सत्यापित प्रतियां संलग्न करनी होती हैं।*`
            : `### Required Documents for ${activeNsfdc.name}:\n\n` +
              activeNsfdc.requiredDocuments.map((d, i) => `${i + 1}. **${d}**`).join('\n') +
              `\n\n*Note: Self-attested copies should be submitted with the application form.*`;
        return {
          reply,
          language,
          sources: [activeNsfdc.code],
          suggestedQuestions: [
            language === 'hi' ? 'आवेदन कहाँ जमा करना है?' : 'Where to submit application?',
            language === 'hi' ? 'पात्रता की शर्तें क्या हैं?' : 'What are the eligibility conditions?',
            language === 'hi' ? 'नजदीकी चैनल पार्टनर कार्यालय कहाँ है?' : 'Where is the nearest Channel Partner office?',
          ],
          userProfile,
          toolsUsed: ['get_scheme_details'],
        };
      }
    }

    // 4. HOW TO APPLY ONLY
    if (isApplyQuery) {
      if (activeNat) {
        const applyText = language === 'hi' ? activeNat.howToApplyHi : activeNat.howToApply;
        const portalText = activeNat.officialPortal ? `\n\n**आधिकारिक पोर्टल**: ${activeNat.officialPortal}` : '';
        const portalTextEn = activeNat.officialPortal ? `\n\n**Official Portal**: ${activeNat.officialPortal}` : '';
        const reply =
          language === 'hi'
            ? `### ${activeNat.nameHi} - आवेदन प्रक्रिया:\n\n${applyText}${portalText}`
            : `### How to Apply for ${activeNat.name}:\n\n${applyText}${portalTextEn}`;
        return {
          reply,
          language,
          sources: [activeNat.code],
          suggestedQuestions: [
            language === 'hi' ? 'आवेदन के लिए कौन से दस्तावेज चाहिए?' : 'What documents are required?',
            language === 'hi' ? 'पात्रता शर्तें क्या हैं?' : 'Who can apply?',
            language === 'hi' ? 'कितना लाभ मिलता है?' : 'How much benefit is given?',
          ],
          userProfile,
          toolsUsed: ['get_scheme_details'],
        };
      }

      if (activeNsfdc) {
        const reply =
          language === 'hi'
            ? `### ${activeNsfdc.nameHi} - आवेदन प्रक्रिया:\n\n` +
              `1. अपने जिले के **राज्य चैनेलाइजिंग एजेंसी (SCA)** कार्यालय (विकास भवन / कलेक्ट्रेट) या अधिकृत सार्वजनिक क्षेत्र के बैंक (जैसे PNB, SBI) से आवेदन पत्र प्राप्त करें।\n` +
              `2. आवेदन पत्र भरकर सभी आवश्यक दस्तावेज (जाति प्रमाण पत्र, आय प्रमाण पत्र, आधार कार्ड, बैंक पासबुक और प्रोजेक्ट कोटेशन) संलग्न करें।\n` +
              `3. आप वेबसाइट के **"Channel Partner Locator"** टैब पर जाकर अपने नजदीकी कार्यालय का पता देख सकते हैं।`
            : `### How to Apply for ${activeNsfdc.name}:\n\n` +
              `1. Obtain the official application form from your **State Channelising Agency (SCA)** office at the District Vikas Bhawan / Collectorate, or from designated Public Sector Banks (e.g. PNB, SBI).\n` +
              `2. Attach mandatory documents (SC Caste Certificate, Income Certificate, Aadhaar, Bank passbook, and equipment quotation).\n` +
              `3. Use the **Channel Partner Locator** tab on Yojna Setu to find office addresses and contact numbers in your district.`;
        return {
          reply,
          language,
          sources: [activeNsfdc.code],
          suggestedQuestions: [
            language === 'hi' ? 'नजदीकी चैनल पार्टनर कार्यालय कैसे खोजें?' : 'How to locate nearest Channel Partner?',
            language === 'hi' ? 'आवश्यक दस्तावेज कौन से हैं?' : 'What documents are required?',
            language === 'hi' ? 'मासिक ईएमआई कितनी होगी?' : 'What will be the monthly EMI?',
          ],
          userProfile,
          toolsUsed: ['get_scheme_details'],
        };
      }
    }

    // 5. DEFINITION / OVERVIEW ONLY (e.g. "What is PM Kisan?")
    if (activeNat) {
      const def = language === 'hi' ? activeNat.definitionHi : activeNat.definition;
      return {
        reply: def,
        language,
        sources: [activeNat.code],
        suggestedQuestions: [
          language === 'hi' ? `Who can apply for ${activeNat.code}?` : `Who can apply for ${activeNat.code}?`,
          language === 'hi' ? `How much money is given?` : `How much money is given?`,
          language === 'hi' ? `Which documents are required?` : `Which documents are required?`,
        ],
        userProfile,
        toolsUsed: ['get_scheme_details'],
      };
    }

    if (activeNsfdc) {
      const def = language === 'hi' ? activeNsfdc.descriptionHi : activeNsfdc.description;
      return {
        reply: `${activeNsfdc.name}: ${def}`,
        language,
        sources: [activeNsfdc.code],
        suggestedQuestions: [
          language === 'hi' ? 'पात्रता की शर्तें क्या हैं?' : 'Who is eligible?',
          language === 'hi' ? 'अधिकतम ऋण कितना मिल सकता है?' : 'How much loan is given?',
          language === 'hi' ? 'आवश्यक दस्तावेज क्या हैं?' : 'Which documents are required?',
        ],
        userProfile,
        toolsUsed: ['get_scheme_details'],
      };
    }
  }

  // Intent D: EMI Calculation
  if (isEmiQuery) {
    const amount = userProfile.loan_required || userProfile.estimated_project_cost || 100000;
    const rate = 5.0;
    const tenure = 36;
    const emiResult = executeTool('calculate_loan_emi', {
      principal: amount,
      annualInterestRatePercent: rate,
      totalTenureMonths: tenure,
      moratoriumMonths: 3,
    });

    const reply =
      language === 'hi'
        ? `### मासिक किस्त (EMI) गणना:\n\n` +
          `ऋण राशि **${emiResult.principalAmount}** पर **${emiResult.annualInterestRate}** रियायती ब्याज दर और **${emiResult.tenureMonths}** की अवधि (3 महीने मोरटोरियम सहित):\n\n` +
          `- **मासिक ईएमआई (EMI)**: **${emiResult.monthlyEmi}**\n` +
          `- **कुल देय ब्याज**: ${emiResult.totalInterestPayable}\n` +
          `- **कुल पुनर्भुगतान**: ${emiResult.totalAmountPayable}\n\n` +
          `आप विभिन्न राशियों और अवधियों के लिए **EMI Calculator** टैब का उपयोग कर सकते हैं।`
        : `### Monthly EMI Calculation:\n\n` +
          `For a loan of **${emiResult.principalAmount}** at **${emiResult.annualInterestRate}** over **${emiResult.tenureMonths}** (including 3-month moratorium):\n\n` +
          `- **Monthly Installment (EMI)**: **${emiResult.monthlyEmi}**\n` +
          `- **Total Interest**: ${emiResult.totalInterestPayable}\n` +
          `- **Total Repayment**: ${emiResult.totalAmountPayable}\n\n` +
          `You can also use the **EMI Calculator** tab on Yojna Setu for custom loan amounts and terms.`;

    return {
      reply,
      language,
      sources: ['MCF'],
      suggestedQuestions: [
        language === 'hi' ? 'महिला समृद्धि योजना में कितनी ब्याज दर है?' : 'What is the interest rate for Mahila Samriddhi?',
        language === 'hi' ? 'इसके लिए कौन से दस्तावेज चाहिए?' : 'Which documents are required?',
        language === 'hi' ? 'नजदीकी चैनल पार्टनर बैंक कैसे खोजें?' : 'How to locate nearest partner bank?',
      ],
      userProfile,
      toolsUsed: ['calculate_loan_emi'],
    };
  }

  // Intent E: Discovery / Broad Topic Search
  if (isDiscoveryQuery || lower.includes('student') || lower.includes('women') || lower.includes('farmer')) {
    if (lower.includes('student') || lower.includes('scholarship') || lower.includes('education') || lower.includes('छात्र')) {
      const reply =
        language === 'hi'
          ? `### छात्रों एवं शिक्षा के लिए प्रमुख योजनाएं:\n\n` +
            `1. **शिक्षा ऋण योजना (ELS)**: भारत और विदेश में उच्च व व्यावसायिक शिक्षा हेतु ₹20 लाख से ₹30 लाख तक रियायती ऋण (4.0% ब्याज दर, छात्राओं हेतु 3.5%)।\n` +
            `2. **उत्तर-मैट्रिक छात्रवृत्ति (PMS-SC)**: 10वीं के बाद कॉलेज फीस की 100% प्रतिपूर्ति एवं मासिक निर्वाह भत्ता।\n\n` +
            `किसी विशिष्ट योजना के बारे में विस्तार से जानने के लिए पूछें (जैसे: "What is ELS?" या "PMS-SC eligibility")।`
          : `### Key Schemes for Students & Higher Education:\n\n` +
            `1. **Educational Loan Scheme (ELS)**: Concessional loans up to ₹20 Lakhs (India) / ₹30 Lakhs (Abroad) at 4.0% interest (3.5% for female students).\n` +
            `2. **Post Matric Scholarship (PMS-SC)**: 100% compulsory tuition fee coverage and monthly maintenance allowance for post-10th courses.\n\n` +
            `Ask about any of these (e.g. "What is ELS?" or "PMS-SC eligibility") for full details.`;
      return {
        reply,
        language,
        sources: ['ELS', 'PMS-SC'],
        suggestedQuestions: ['What is Educational Loan Scheme?', 'Eligibility for student education loan', 'What is Post Matric Scholarship?'],
        userProfile,
        toolsUsed: ['search_schemes'],
      };
    }

    if (lower.includes('women') || lower.includes('mahila') || lower.includes('महिला')) {
      const reply =
        language === 'hi'
          ? `### महिला उद्यमियों व बालिकाओं हेतु प्रमुख योजनाएं:\n\n` +
            `1. **महिला समृद्धि योजना (MSY)**: अनुसूचित जाति की महिला उद्यमियों व स्वयं सहायता समूहों हेतु ₹1.40 लाख तक विशेष 4% ब्याज पर ऋण।\n` +
            `2. **सुकन्या समृद्धि योजना (SSY)**: 10 वर्ष से कम उम्र की बालिकाओं के लिए उच्च ब्याज दर (~8.2%) व कर छूट वाली बचत योजना।\n` +
            `3. **महिला ब्याज छूट**: योजना सेतु के सभी अन्य ऋणों पर महिलाओं को 0.5% अतिरिक्त ब्याज छूट मिलती है।`
          : `### Key Government Schemes for Women Entrepreneurs & Girls:\n\n` +
            `1. **Mahila Samriddhi Yojana (MSY)**: Exclusive micro-credit up to ₹1.40 Lakhs at only 4.0% p.a. for SC women entrepreneurs & SHGs.\n` +
            `2. **Sukanya Samriddhi Yojana (SSY)**: Government-backed savings scheme for girl children with ~8.2% interest and tax exemptions.\n` +
            `3. **Affirmative Gender Rebate**: 0.5% p.a. additional interest discount across all NSFDC credit schemes.`;
      return {
        reply,
        language,
        sources: ['MSY', 'SSY'],
        suggestedQuestions: ['What is Mahila Samriddhi Yojana?', 'Who can apply for Mahila Samriddhi?', 'What is Sukanya Samriddhi Yojana?'],
        userProfile: { ...userProfile, gender: 'female' },
        toolsUsed: ['search_schemes'],
      };
    }

    if (lower.includes('farmer') || lower.includes('kisan') || lower.includes('किसान')) {
      const reply =
        language === 'hi'
          ? `### किसानों के लिए प्रमुख योजनाएं:\n\n` +
            `1. **पीएम किसान सम्मान निधि (PM-KISAN)**: पात्र किसान परिवारों को प्रति वर्ष ₹6,000 की वित्तीय सहायता (3 किस्तों में DBT के माध्यम से)।\n` +
            `2. **ग्रीन बिजनेस योजना (GBS)**: सौर पंप, सोलर रूफटॉप व कृषि उपकरण हेतु रियायती ऋण सहायता।`
          : `### Key Government Schemes for Farmers:\n\n` +
            `1. **PM-KISAN (Kisan Samman Nidhi)**: Direct income support of ₹6,000 per year transferred in 3 equal installments of ₹2,000.\n` +
            `2. **Green Business Scheme (GBS)**: Concessional finance up to ₹27 Lakhs for solar water pumps and eco-friendly farm enterprises.`;
      return {
        reply,
        language,
        sources: ['PM-KISAN', 'GBS'],
        suggestedQuestions: ['What is PM Kisan?', 'Who is eligible for PM Kisan?', 'Which documents are required for PM Kisan?'],
        userProfile,
        toolsUsed: ['search_schemes'],
      };
    }
  }

  // Default Overview
  const reply =
    language === 'hi'
      ? `### नमस्ते! मैं योजना सेतु सहायक हूँ।\n\n` +
        `मैं सरकारी योजनाओं की सटीक जानकारी प्रदान करने में आपकी सहायता कर सकता हूँ:\n\n` +
        `- **कृषि व किसान**: PM-KISAN सम्मान निधि\n` +
        `- **स्वास्थ्य**: आयुष्मान भारत (PM-JAY)\n` +
        `- **व्यापार व स्वरोजगार**: प्रधानमंत्री मुद्रा योजना (PMMY), लघु ऋण वित्त (MCF), महिला समृद्धि (MSY)\n` +
        `- **कारीगर व शिल्पकार**: प्रधानमंत्री विश्वकर्मा योजना\n` +
        `- **शिक्षा**: शिक्षा ऋण योजना (ELS), उत्तर-मैट्रिक छात्रवृत्ति\n` +
        `- **आवास**: प्रधानमंत्री आवास योजना (PMAY)\n\n` +
        `आप किसी भी योजना का नाम लिखकर पूछ सकते हैं (जैसे: **"What is PM Kisan?"**, **"Who is eligible?"** आदि)।`
      : `### Welcome! I am the Yojna Setu Assistant.\n\n` +
        `I provide direct, factual guidance on Indian government welfare and credit schemes:\n\n` +
        `- **Farmers**: PM-KISAN (Kisan Samman Nidhi)\n` +
        `- **Healthcare**: Ayushman Bharat (PM-JAY)\n` +
        `- **Business & Self-Employment**: PM Mudra, Micro Credit Finance (MCF), Mahila Samriddhi (MSY)\n` +
        `- **Artisans & Crafts**: PM Vishwakarma Scheme\n` +
        `- **Students & Education**: Educational Loan Scheme (ELS), Post-Matric Scholarship\n` +
        `- **Housing**: Pradhan Mantri Awas Yojana (PMAY)\n\n` +
        `Ask about any scheme (e.g. **"What is PM Kisan?"**, **"Who can apply?"**, **"What documents are needed?"**).`;

  return {
    reply,
    language,
    sources: ['PM-KISAN', 'MCF', 'MSY'],
    suggestedQuestions: ['What is PM Kisan?', 'Who can apply for PM Kisan?', 'Check schemes for students'],
    userProfile,
    toolsUsed: ['get_all_schemes'],
  };
}

// -------------------------------------------------------------
// Model Call Helper
// -------------------------------------------------------------
async function generateContentWithFallback(
  ai: GoogleGenAI,
  contents: any[],
  tools: any[],
  systemInstruction: string
) {
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
  const { message, conversationHistory = [], language = 'en', userProfile: initialProfile = {}, schemeContext } = req;
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

  const activeSchemeMatch = detectActiveSchemeFromHistory(message, conversationHistory);
  const activeSchemeName = activeSchemeMatch?.schemeName || (schemeContext ? schemeContext.name : undefined);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return buildFallbackResponse(message, initialProfile, activeLang, conversationHistory);
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

    const contents: any[] = [];

    const contextPreamble = `System Context:
- Language: ${activeLang === 'hi' ? 'Hindi (हिंदी / Hinglish)' : 'English'}
${activeSchemeName ? `- Active Scheme Under Discussion: "${activeSchemeName}" (If user asks a follow-up question like "Who can apply?", "How much money?", "Documents?", answer specifically for "${activeSchemeName}")` : ''}
- Rule: Answer the EXACT question asked concisely. Do NOT output unsolicited long essays.`;

    contents.push({
      role: 'user',
      parts: [{ text: contextPreamble }],
    });

    contents.push({
      role: 'model',
      parts: [{ text: 'Understood. I will answer the exact question asked with zero hallucination and maintain active scheme context.' }],
    });

    // Recent conversation turns (keep last 8 turns)
    const recentHistory = conversationHistory.slice(-8);
    for (const item of recentHistory) {
      contents.push({
        role: item.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: item.text }],
      });
    }

    // Current user message
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
        finalResponseText = response.text || '';
        break;
      }
    }

    if (!finalResponseText) {
      return buildFallbackResponse(message, initialProfile, activeLang, conversationHistory);
    }

    let cleanReply = finalResponseText;
    let sources: string[] = [];
    let suggestedQuestions: string[] = [];

    const sourcesMatch = cleanReply.match(/SOURCES:\s*(\[[^\]]*\])/i);
    if (sourcesMatch) {
      try {
        sources = JSON.parse(sourcesMatch[1]);
      } catch {
        // Ignore parse error
      }
      cleanReply = cleanReply.replace(/SOURCES:\s*(\[[^\]]*\])/gi, '').trim();
    }

    const sqMatch = cleanReply.match(/SUGGESTED_QUESTIONS:\s*(\[[^\]]*\])/i);
    if (sqMatch) {
      try {
        suggestedQuestions = JSON.parse(sqMatch[1]);
      } catch {
        // Ignore parse error
      }
      cleanReply = cleanReply.replace(/SUGGESTED_QUESTIONS:\s*(\[[^\]]*\])/gi, '').trim();
    }

    const upMatch = cleanReply.match(/USER_PROFILE_UPDATE:\s*(\{[^\}]*\})/i);
    if (upMatch) {
      cleanReply = cleanReply.replace(/USER_PROFILE_UPDATE:\s*(\{[^\}]*\})/gi, '').trim();
    }

    if (!suggestedQuestions || suggestedQuestions.length === 0) {
      if (activeSchemeMatch) {
        suggestedQuestions = [
          `Who can apply for ${activeSchemeMatch.schemeName}?`,
          `Which documents are needed?`,
          `How to apply?`,
        ];
      } else {
        suggestedQuestions = ['What is PM Kisan?', 'Show schemes for women', 'How to calculate EMI?'];
      }
    }

    return {
      reply: cleanReply,
      language: activeLang,
      sources,
      suggestedQuestions: suggestedQuestions.slice(0, 3),
      userProfile: initialProfile,
      toolsUsed,
    };
  } catch (err: any) {
    console.warn('Gemini Assistant API call failed; utilizing deterministic fallback engine:', err?.message || err);
    return buildFallbackResponse(message, initialProfile, activeLang, conversationHistory);
  }
}
