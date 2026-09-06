import { NextRequest, NextResponse } from 'next/server';
import { processAssistantChat } from '@/lib/ai-assistant-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, conversationHistory, language, locale, userProfile, schemeContext } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'A valid message string is required.' },
        { status: 400 }
      );
    }

    const response = await processAssistantChat({
      message,
      conversationHistory: Array.isArray(conversationHistory) ? conversationHistory : [],
      language: language || locale || 'en',
      locale: locale || language || 'en',
      userProfile: typeof userProfile === 'object' && userProfile !== null ? userProfile : {},
      schemeContext,
    });

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('API /api/chat Error:', error);
    return NextResponse.json(
      {
        reply: "For NSFDC assistance, please keep your SC Caste Certificate, Income Certificate (< ₹5 Lakhs p.a.), Aadhaar Card, Bank Passbook, and project quotation ready. Applications can be submitted through your State Channelising Agency (SCA) or lead Public Sector Banks (e.g., PNB, SBI).",
        language: 'en',
        sources: ['MCF', 'TLS'],
        suggestedQuestions: [
          'What documents are needed for micro finance?',
          'How do I calculate EMI?',
          'Where is my local State Channelising Agency?'
        ],
        userProfile: {},
        toolsUsed: [],
      },
      { status: 200 }
    );
  }
}
