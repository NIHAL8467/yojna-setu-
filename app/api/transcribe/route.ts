import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File | null;
    const language = (formData.get('language') as string) || 'hi';

    if (!audioFile) {
      return NextResponse.json({ error: 'Audio file is required' }, { status: 400 });
    }

    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Audio = buffer.toString('base64');
    const mimeType = audioFile.type || 'audio/webm';

    // Model selection: Try gemini-3.5-transcribe first, fallback to gemini-3.8-flash if needed
    let transcript = '';
    const prompt = `You are a speech-to-text transcriber for Yojna Setu, an Indian government welfare schemes portal.
Transcribe the spoken audio query accurately.
The speaker may speak in Hindi, Indian English, or mixed Hinglish.
Target language preference: ${language === 'hi' ? 'Hindi or Hinglish' : 'English or Hindi'}.
Rules:
1. Return ONLY the verbatim transcribed query text.
2. Do NOT add quotes, markdown formatting, prefixes, or explanations.
3. If the audio is silent or uninterpretable, return "PM Kisan Yojana" or the best approximation.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-transcribe',
        contents: [
          {
            inlineData: {
              mimeType: mimeType.split(';')[0] || 'audio/webm',
              data: base64Audio,
            },
          },
          prompt,
        ],
      });
      transcript = response.text?.trim() || '';
    } catch (primaryErr) {
      console.warn('Primary transcribe model error, trying gemini-3.8-flash:', primaryErr);
      const fallbackResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          {
            inlineData: {
              mimeType: mimeType.split(';')[0] || 'audio/webm',
              data: base64Audio,
            },
          },
          prompt,
        ],
      });
      transcript = fallbackResponse.text?.trim() || '';
    }

    // Clean up any extraneous quotes
    transcript = transcript.replace(/^["']|["']$/g, '').trim();

    return NextResponse.json({
      success: true,
      transcript: transcript || (language === 'hi' ? 'प्रधानमंत्री योजना जानकारी' : 'Government schemes info'),
    });
  } catch (error: any) {
    console.error('Audio transcription API failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to transcribe audio',
        fallback: 'PM Kisan Yojana eligibility',
      },
      { status: 500 }
    );
  }
}
