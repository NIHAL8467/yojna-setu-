import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import schemesData from '@/data/schemes.json';

const SYSTEM_INSTRUCTION = `You are the official AI Scheme & Document Advisory Assistant for the National Scheduled Castes Finance and Development Corporation (NSFDC), under the Ministry of Social Justice and Empowerment, Government of India.

Your mission is to guide Scheduled Caste (SC) entrepreneurs, students, women artisans, and sanitation workers in clear, encouraging, respectful, and plain language (in English or Hindi/Hinglish depending on user input).

Context about NSFDC Schemes:
1. Micro Credit Finance Scheme (MCF): Concessional micro-loans for small trades, street vendors, SHGs with family income <= 5 Lakhs. Concessional interest rate ~5% p.a.
2. Term Loan Scheme (TLS): Viable industrial/service/transport projects up to 50 Lakhs. Tenure up to 5-10 years.
3. Educational Loan Scheme (ELS): Meritorious SC students for technical/professional degrees in India and abroad. Concessional rate ~4% p.a. (3.5% for girl students), moratorium duration covers course period + 6-12 months.
4. Mahila Samriddhi Yojana (MSY): Concessional micro-loans exclusively for SC women entrepreneurs and women SHGs at 4% p.a. interest.
5. Green Business Scheme (GBS): Support for eco-friendly ventures like E-rickshaws, rooftop solar units, waste management.
6. Swachhta Udayami Yojana (SUY): Mechanized cleaning equipment, vacuum suction units for Safai Karamcharis to eliminate hazardous manual handling.

Key Policies:
- Target Group: Persons belonging to Scheduled Castes (SC) living below double the poverty line / family income up to ₹5.00 Lakhs p.a.
- Women Concession: 0.5% p.a. interest rebate on standard schemes.
- Channel Partners: Applications are submitted through State Channelising Agencies (SCAs) in each state/UT, Public Sector Banks (e.g. PNB, SBI), Regional Rural Banks (RRBs), and authorized NBFC-MFIs.
- Required Documents typically: SC Caste Certificate from Tehsildar/SDM, Annual Family Income Certificate, Aadhaar Card, Bank Passbook, Project Proposal / Quotation.

Provide concise, structured, and helpful guidance with bullet points. Always emphasize empowerment and step-by-step clarity.`;

export async function POST(req: NextRequest) {
  try {
    const { message, locale, schemeContext } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Graceful fallback if API key is not configured yet
      return NextResponse.json({
        reply: locale === 'hi'
          ? "एनएसएफडीसी (NSFDC) के तहत ऋण हेतु आपको सक्षम प्राधिकारी से जाति प्रमाण पत्र, आय प्रमाण पत्र (₹5 लाख/वर्ष से कम), आधार कार्ड, बैंक पासबुक और व्यवसाय कोटेशन की आवश्यकता होती है। आप अपने राज्य के एससी वित्त निगम (SCA) या अग्रणी बैंक में आवेदन कर सकते हैं।"
          : "Under NSFDC guidelines, you will need a valid SC Caste Certificate, Annual Family Income Certificate (below ₹5 Lakhs p.a.), Aadhaar Card, Bank Account details, and a brief project proposal or equipment quotation. Applications can be submitted through your State Channelising Agency (SCA) or lead Public Sector Banks.",
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const contextPrompt = `User language: ${locale === 'hi' ? 'Hindi (हिंदी)' : 'English'}
${schemeContext ? `Active Scheme Context: ${JSON.stringify(schemeContext)}` : ''}

User Query: ${message}

Provide a helpful, direct response to the applicant. Keep answers simple, jargon-free, and actionable.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: contextPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    const reply = response.text || (locale === 'hi' ? 'उत्तर प्राप्त नहीं हो सका।' : 'Unable to generate response.');
    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('Gemini Assistant Error:', error);
    return NextResponse.json({
      reply: "For NSFDC schemes, please ensure you have your SC Caste Certificate, Income Certificate (< ₹5 Lakhs), Aadhaar, Bank Details, and Project Quotation ready. Visit your local State Channelising Agency (SCA) or contact Toll-Free Helpline: 1800-11-2001.",
    });
  }
}
