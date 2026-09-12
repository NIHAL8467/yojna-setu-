/**
 * Yojna Setu - Groq Chat Service
 * Integrates Groq's OpenAI-compatible Chat Completions API
 * Endpoint: https://api.groq.com/openai/v1/chat/completions
 * Model: Configurable via GROQ_MODEL (default: llama-3.3-70b-versatile)
 * Key: Accessed securely from server-side process.env.GROQ_API_KEY
 */

export interface GroqChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ConversationHistoryItem {
  role: 'user' | 'assistant' | 'system';
  text?: string;
  content?: string;
}

export interface GroqChatRequest {
  message: string;
  conversationHistory?: ConversationHistoryItem[];
  language?: string;
  locale?: string;
  userProfile?: {
    category?: string;
    annual_family_income?: number;
    state?: string;
    gender?: string;
    loan_required?: number;
    [key: string]: any;
  };
  schemeContext?: any;
}

export interface GroqChatSuccessResponse {
  success: true;
  response: string;
  reply: string; // Provided for backward compatibility
  sources?: string[];
  suggestedQuestions?: string[];
}

export interface GroqChatErrorResponse {
  success: false;
  error: string;
}

export type GroqChatResult = GroqChatSuccessResponse | GroqChatErrorResponse;

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Comprehensive Yojna Setu System Prompt covering all Indian government schemes
const YOJNA_SETU_SYSTEM_PROMPT = `You are the official "Yojna Setu AI Assistant" (योजना सेतु सहायक), dedicated to helping Indian citizens understand and discover Indian government welfare schemes, benefits, eligibility, and Yojna Setu portal services.

MISSION & ROLE:
Provide accurate, factual, and easy-to-understand information about Central and State Government schemes in India. Help farmers, women, students, artisans, street vendors, senior citizens, and entrepreneurs discover opportunities and navigate application processes.

CORE DOMAINS YOU SPECIALIZE IN:

1. FARMER SCHEMES:
- PM-KISAN (Pradhan Mantri Kisan Samman Nidhi): Provides eligible farmer families ₹6,000 per year in 3 equal installments of ₹2,000 every four months via Direct Benefit Transfer (DBT). Eligibility: Landholding farmer families. Portal: pmkisan.gov.in. Documents: Aadhaar, landholding papers (Khatauni/Khasra), bank account linked to Aadhaar.
- PM Fasal Bima Yojana (PMFBY): Crop insurance covering non-preventable natural risks (drought, flood, pests) with low farmer premium (2% Kharif, 1.5% Rabi, 5% commercial/horticulture).
- Kisan Credit Card (KCC): Concessional institutional credit for agriculture, dairy, and fisheries at effective 4% p.a. interest with timely repayment.
- PM Krishi Sinchayee Yojana (PMKSY): Subsidies for drip and sprinkler micro-irrigation systems ("Per Drop More Crop").

2. WOMEN & GIRL CHILD SCHEMES:
- Mahila Samriddhi Yojana (MSY - NSFDC): Micro-credit loans up to ₹1,40,000 per woman entrepreneur / Self Help Group (SHG) member at a highly concessional interest rate of only 4% p.a. for income-generating activities.
- Sukanya Samriddhi Yojana (SSY): High-interest small savings scheme for girl children up to age 10; tax benefits under Section 80C, matures at age 21 or upon marriage after age 18.
- PM Matru Vandana Yojana (PMMVY): Direct cash incentive of ₹5,000 for first child and ₹6,000 for second girl child to support maternal nutrition.
- Lakhpati Didi Scheme: Financial and skill enablement for Women SHG members to earn sustainable annual income of at least ₹1 Lakh.
- Stand-Up India: Bank loans from ₹10 Lakhs up to ₹1 Crore for at least one woman or SC/ST borrower per bank branch for setting up greenfield enterprises.

3. STUDENT & SCHOLARSHIP SCHEMES:
- Post-Matric & Pre-Matric Scholarships (SC/ST/OBC/Minorities): Tuition fee waiver and monthly maintenance allowances administered through National Scholarship Portal (scholarships.gov.in).
- PM Uchchatar Shiksha Protsahan (PM-USP) / Central Sector Scheme: Merit-cum-means scholarships for higher education after Class 12.
- NSFDC Educational Loan Scheme (ELS): Concessional education loan up to ₹20 Lakhs for studies in India and ₹30 Lakhs abroad at 4% p.a. interest (3.5% p.a. for female students).

4. EMPLOYMENT, BUSINESS & LOAN SCHEMES:
- PM Mudra Yojana (PMMY): Collateral-free business loans up to ₹10-20 Lakhs in 3 tiers:
  * Shishu: Loans up to ₹50,000 (for new/micro ventures).
  * Kishore: Loans from ₹50,000 to ₹5,00,000 (for expanding businesses).
  * Tarun: Loans from ₹5,00,000 up to ₹10,00,000 (extended up to ₹20 Lakhs for established borrowers).
- PM SVANidhi: Working capital loans for street vendors (₹10,000 first tranche, ₹20,000 second, ₹50,000 third) with 7% interest subsidy on timely digital repayment.
- PM Vishwakarma: Holistic support for 18 traditional artisan trades (carpenters, blacksmiths, potters, cobblers, tailors, etc.) including recognition certificate & ID, 5-7 days skill training with ₹500/day stipend, ₹15,000 toolkit voucher, and collateral-free enterprise development loans up to ₹3 Lakhs (₹1 Lakh + ₹2 Lakh) at 5% interest.
- PMEGP (Prime Minister's Employment Generation Programme): Credit-linked subsidy scheme offering 15% to 35% government subsidy on project costs up to ₹50 Lakhs (manufacturing) and ₹20 Lakhs (services).
- NSFDC Term Loan Scheme (TLS) & Micro Credit Finance (MCF): Low-interest loans for SC entrepreneurs with annual family income up to ₹5,00,000.

5. HEALTHCARE & HOUSING SCHEMES:
- Ayushman Bharat PM-JAY: Health insurance coverage up to ₹5,00,000 per family per year for secondary and tertiary hospitalization across empaneled public and private hospitals. Fully cashless and paperless.
- Pradhan Mantri Awas Yojana (PMAY-U / PMAY-G): Pucca housing with basic amenities for economically weaker sections (EWS/LIG) and rural households, with interest subsidy or direct financial assistance.

6. PENSION & SOCIAL SECURITY SCHEMES:
- Atal Pension Yojana (APY): Guaranteed monthly pension of ₹1,000 to ₹5,000 from age 60 for unorganized sector workers joining between ages 18-40.
- PM Shram Yogi Maan-dhan (PM-SYM): Monthly pension of ₹3,000 from age 60 for unorganized workers with monthly income ≤ ₹15,000.
- National Social Assistance Programme (NSAP): Indira Gandhi National Old Age Pension, Widow Pension, and Disability Pension schemes.

7. YOJNA SETU SERVICES (Mention when relevant):
- Smart Scheme Recommender: Interactive wizard matching citizens to eligible schemes based on caste category, annual income, state, and business/education needs.
- Loan EMI Calculator: Instant reducing balance EMI calculator showing monthly installments, total interest, and special 1% interest concessions for women and special categories.
- Channel Partner Locator: GPS and district-wise locator to find State Channelising Agencies (SCAs), Public Sector Banks, and Regional Rural Banks.

CONVERSATION & MEMORY RULES:
- PRESERVE MULTI-TURN CONTEXT: When the user asks a follow-up question without naming the scheme (e.g. "Who is eligible?", "Isme kitna paisa milta hai?", "How to apply?", "Kaunse document chahiye?"), automatically resolve "isme" / "it" to the specific scheme discussed in the immediate previous turn. Do NOT ask the user to repeat the scheme name.
- ANSWER SPECIFICALLY: If the user asks for eligibility, answer eligibility. If they ask for amount/benefit, answer the amount. If they ask for documents, list the required documents.
- LANGUAGE ADAPTATION: Answer in the same language the user uses (Hindi, English, or Hinglish).
- TONE & FORMAT: Helpful, respectful, and structured. Use bullet points and bold titles for easy reading.
- FACTUAL INTEGRITY: Provide accurate government facts and official portals (myscheme.gov.in, pmkisan.gov.in, etc.). If a scheme is outside the scope of Indian government schemes, politely redirect to welfare schemes.`;

/**
 * Execute chat completion with Groq's OpenAI-compatible API
 */
export async function sendGroqChat(req: GroqChatRequest): Promise<GroqChatResult> {
  const apiKey = process.env.GROQ_API_KEY?.trim();

  if (!apiKey) {
    return {
      success: false,
      error: 'GROQ_API_KEY environment variable is not configured on the server. Please set GROQ_API_KEY in your server environment (e.g., in Vercel settings or .env).',
    };
  }

  const configuredModel = process.env.GROQ_MODEL?.trim() || 'llama-3.3-70b-versatile';
  // If primary model encounters an issue, fallback to high-availability instant model
  const candidateModels = [configuredModel, 'llama-3.1-8b-instant'];

  // Normalize conversation history for Groq messages array
  const groqMessages: GroqChatMessage[] = [
    {
      role: 'system',
      content: YOJNA_SETU_SYSTEM_PROMPT,
    },
  ];

  // Append user profile context if provided
  if (req.userProfile && Object.keys(req.userProfile).length > 0) {
    const profileParts: string[] = [];
    if (req.userProfile.category) profileParts.push(`Category: ${req.userProfile.category}`);
    if (req.userProfile.annual_family_income) profileParts.push(`Annual Income: ₹${req.userProfile.annual_family_income}`);
    if (req.userProfile.state) profileParts.push(`State: ${req.userProfile.state}`);
    if (req.userProfile.gender) profileParts.push(`Gender: ${req.userProfile.gender}`);
    if (req.userProfile.loan_required) profileParts.push(`Loan Requirement: ₹${req.userProfile.loan_required}`);

    if (profileParts.length > 0) {
      groqMessages.push({
        role: 'system',
        content: `Current User Profile Context: ${profileParts.join(' | ')}. Use this for personalized eligibility when applicable.`,
      });
    }
  }

  // Append recent conversation turns for multi-turn session memory
  if (Array.isArray(req.conversationHistory) && req.conversationHistory.length > 0) {
    const recentHistory = req.conversationHistory.slice(-10);
    for (const turn of recentHistory) {
      const text = turn.content || turn.text || '';
      if (!text.trim()) continue;

      const role: 'user' | 'assistant' =
        turn.role === 'assistant' ? 'assistant' : 'user';

      groqMessages.push({
        role,
        content: text.trim(),
      });
    }
  }

  // Ensure current user message is appended as the latest message
  const lastMessage = groqMessages[groqMessages.length - 1];
  const currentMsgText = req.message.trim();

  if (!lastMessage || lastMessage.role !== 'user' || lastMessage.content !== currentMsgText) {
    groqMessages.push({
      role: 'user',
      content: currentMsgText,
    });
  }

  let lastError = '';

  for (const model of candidateModels) {
    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: groqMessages,
          temperature: 0.5,
          max_tokens: 1024,
        }),
      });

      const contentType = response.headers.get('content-type') || '';
      let data: any = null;

      // Safe Content-Type check to prevent "Unexpected token '<', <!doctype ... is not valid JSON"
      if (contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch (jsonErr: any) {
          const rawText = await response.text().catch(() => '');
          lastError = `Failed to parse Groq response as JSON: ${rawText.slice(0, 100)}`;
          continue;
        }
      } else {
        // Non-JSON response (HTML or plain text from Cloudflare or edge error page)
        const errorText = await response.text().catch(() => '');
        const cleanSnippet = errorText
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 150);

        lastError = `Groq API returned HTTP ${response.status} (${contentType || 'non-JSON'}): ${cleanSnippet || 'Service unavailable'}`;
        // If it's a 5xx gateway error or model not found, try next candidate model
        if (response.status >= 500 || response.status === 404) {
          continue;
        }
        return {
          success: false,
          error: lastError,
        };
      }

      if (!response.ok) {
        const errorMsg = data?.error?.message || `Groq API error (status ${response.status})`;
        lastError = errorMsg;

        // If model decommissioned or not found, try fallback candidate model
        if (response.status === 404 || errorMsg.toLowerCase().includes('model') || errorMsg.toLowerCase().includes('decommissioned')) {
          continue;
        }

        return {
          success: false,
          error: errorMsg,
        };
      }

      const aiText = data?.choices?.[0]?.message?.content?.trim();

      if (!aiText) {
        lastError = 'Groq API returned an empty response.';
        continue;
      }

      // Generate context-appropriate follow-up questions
      const suggestedQuestions = generateSuggestedFollowUps(currentMsgText, aiText, req.language || req.locale);

      return {
        success: true,
        response: aiText,
        reply: aiText,
        sources: extractSources(aiText),
        suggestedQuestions,
      };
    } catch (networkErr: any) {
      lastError = networkErr?.message || 'Network request to Groq API failed.';
      console.error('Groq request error:', networkErr);
    }
  }

  return {
    success: false,
    error: lastError || 'Failed to generate response from Groq API.',
  };
}

/**
 * Generate 2-3 dynamic follow-up suggestions based on the conversation
 */
function generateSuggestedFollowUps(userQuery: string, aiResponse: string, lang?: string): string[] {
  const isHindi = lang === 'hi' || /[\u0900-\u097F]/.test(userQuery);
  const lowerQuery = userQuery.toLowerCase();
  const lowerResp = aiResponse.toLowerCase();

  if (lowerQuery.includes('kisan') || lowerResp.includes('kisan')) {
    return isHindi
      ? ['पीएम किसान के लिए कौन से दस्तावेज चाहिए?', 'आवेदन कैसे करें?', 'ई-केवाईसी (e-KYC) कैसे करें?']
      : ['Which documents are required for PM Kisan?', 'How to apply online?', 'How to do PM Kisan e-KYC?'];
  }

  if (lowerQuery.includes('mahila') || lowerResp.includes('mahila') || lowerQuery.includes('women')) {
    return isHindi
      ? ['महिला समृद्धि योजना की ब्याज दर क्या है?', 'आवश्यक दस्तावेज क्या हैं?', 'कहाँ आवेदन करें?']
      : ['What is the interest rate for Mahila Samriddhi?', 'Required documents list', 'Where to apply for MSY?'];
  }

  if (lowerQuery.includes('mudra') || lowerResp.includes('mudra')) {
    return isHindi
      ? ['मुद्रा लोन के प्रकार (शिशु, किशोर, तरुण)', 'मुद्रा लोन के लिए दस्तावेज', 'ब्याज दर कितनी होती है?']
      : ['Mudra loan tiers (Shishu, Kishore, Tarun)', 'Documents needed for Mudra loan', 'What is the interest rate?'];
  }

  if (lowerQuery.includes('student') || lowerQuery.includes('scholarship') || lowerResp.includes('scholarship')) {
    return isHindi
      ? ['पोस्ट-मैट्रिक छात्रवृत्ति की पात्रता', 'नेशनल स्कॉलरशिप पोर्टल (NSP) पर आवेदन', 'शिक्षा ऋण योजना (ELS)']
      : ['Post-Matric scholarship eligibility', 'Apply on National Scholarship Portal', 'NSFDC Education Loan Scheme'];
  }

  if (lowerQuery.includes('emi') || lowerQuery.includes('loan') || lowerResp.includes('emi')) {
    return isHindi
      ? ['ईएमआई कैलकुलेटर कैसे उपयोग करें?', 'महिलाओं के लिए 1% छूट', 'निकटतम चैनल पार्टनर खोजें']
      : ['How to use the EMI Calculator?', '1% concession for women beneficiaries', 'Find nearest Channel Partner'];
  }

  return isHindi
    ? ['पीएम किसान योजना क्या है?', 'महिलाओं के लिए सरकारी योजनाएं', 'मुद्रा लोन कैसे प्राप्त करें?']
    : ['What is PM Kisan scheme?', 'Show schemes for women', 'How to get a Mudra loan?'];
}

/**
 * Extract scheme mentions as sources
 */
function extractSources(text: string): string[] {
  const sources: string[] = [];
  const patterns: [RegExp, string][] = [
    [/PM-?KISAN/i, 'PM-KISAN'],
    [/MUDRA|PMMY/i, 'PM Mudra'],
    [/MAHILA SAMRIDDHI|MSY/i, 'Mahila Samriddhi'],
    [/AYUSHMAN|PM-?JAY/i, 'PM-JAY'],
    [/SVANIDHI/i, 'PM SVANidhi'],
    [/VISHWAKARMA/i, 'PM Vishwakarma'],
    [/SUKANYA/i, 'Sukanya Samriddhi'],
    [/PMAY/i, 'PMAY'],
    [/MCF/i, 'NSFDC MCF'],
    [/TLS/i, 'NSFDC TLS'],
    [/ELS/i, 'NSFDC ELS'],
  ];

  for (const [regex, label] of patterns) {
    if (regex.test(text) && !sources.includes(label)) {
      sources.push(label);
    }
  }

  return sources.slice(0, 3);
}
