import { NextRequest, NextResponse } from 'next/server';
import { processAssistantChat } from '@/lib/ai-assistant-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, locale, language, schemeContext, conversationHistory, userProfile } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const response = await processAssistantChat({
      message,
      locale: locale || language || 'en',
      language: language || locale || 'en',
      schemeContext,
      conversationHistory: Array.isArray(conversationHistory) ? conversationHistory : [],
      userProfile: typeof userProfile === 'object' && userProfile !== null ? userProfile : {},
    });

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Gemini Assistant Route Error:', error);
    return NextResponse.json({
      reply: "For NSFDC schemes, please ensure you have your SC Caste Certificate, Income Certificate (< ₹5 Lakhs), Aadhaar, Bank Details, and Project Quotation ready. Visit your local State Channelising Agency (SCA) or contact Toll-Free Helpline: 1800-11-2001.",
      language: 'en',
      sources: ['MCF', 'TLS'],
      suggestedQuestions: ['What documents are required?', 'How to calculate EMI?'],
      userProfile: {},
      toolsUsed: [],
    });
  }
}

