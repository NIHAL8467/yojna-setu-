import { NextRequest, NextResponse } from 'next/server';
import { sendGroqChat } from '@/lib/groq-chat-service';

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON request body.' },
        { status: 400 }
      );
    }

    // Support both `message` property and OpenAI-style `messages` array
    let message = body.message;
    if (!message && Array.isArray(body.messages) && body.messages.length > 0) {
      const last = body.messages[body.messages.length - 1];
      message = last.content || last.text;
    }

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json(
        { success: false, error: 'A valid message string is required.' },
        { status: 400 }
      );
    }

    const conversationHistory = Array.isArray(body.conversationHistory)
      ? body.conversationHistory
      : Array.isArray(body.messages)
      ? body.messages.slice(0, -1)
      : [];

    const result = await sendGroqChat({
      message: message.trim(),
      conversationHistory,
      language: body.language || body.locale || 'en',
      locale: body.locale || body.language || 'en',
      userProfile: typeof body.userProfile === 'object' && body.userProfile !== null ? body.userProfile : {},
      schemeContext: body.schemeContext,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          response: result.error,
          reply: result.error,
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      success: true,
      response: result.response,
      reply: result.response,
      sources: result.sources || [],
      suggestedQuestions: result.suggestedQuestions || [],
    });
  } catch (error: any) {
    console.error('API /api/chat Groq handler error:', error);
    const errorMessage = error?.message || 'Internal server error occurred while processing chat.';
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        response: errorMessage,
        reply: errorMessage,
      },
      { status: 200 }
    );
  }
}
