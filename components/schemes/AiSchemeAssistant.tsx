'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Bot, Send, User, Sparkles, AlertCircle, HelpCircle, FileText, CheckCircle2, RotateCcw, ShieldCheck, ArrowRight } from 'lucide-react';
import type { UserProfileContext } from '@/lib/ai-assistant-service';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  sources?: string[];
  suggestedQuestions?: string[];
  toolsUsed?: string[];
}

export default function AiSchemeAssistant() {
  const { t, locale, selectedSchemeForCalculator } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text:
        locale === 'hi'
          ? 'नमस्ते! मैं योजना सेतु का आधिकारिक एआई सहायक (Yojna Setu Assistant) हूँ।\n\nआप मुझसे एनएसएफडीसी (NSFDC) ऋण योजनाओं, पात्रता नियमों, रियायती ब्याज दरों (महिलाओं के लिए 0.5% अतिरिक्त छूट), ईएमआई गणना, आवश्यक दस्तावेजों या नजदीकी चैनल पार्टनर बैंक के बारे में कोई भी प्रश्न पूछ सकते हैं।'
          : 'Welcome! I am the official Yojna Setu AI Scheme Assistant for NSFDC concessional loans.\n\nYou can ask me about loan schemes, family income ceilings (<= ₹5 Lakhs), 0.5% women interest rebates, reducing-balance EMI calculations, required documents, or how to apply at your State Channelising Agency (SCA).',
      timestamp: 'Just now',
      sources: ['MCF', 'TLS', 'MSY'],
      suggestedQuestions:
        locale === 'hi'
          ? [
              'मेरी ₹3 लाख आय पर कौन सा ऋण मिल सकता है?',
              'महिला समृद्धि योजना में क्या लाभ हैं?',
              'ई-रिक्शा के लिए ग्रीन बिजनेस योजना क्या है?',
            ]
          : [
              'What schemes are available for ₹3 Lakh income?',
              'What are the benefits of Mahila Samriddhi Yojana?',
              'How much loan can I get for an E-Rickshaw?',
            ],
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState<string>('Consulting verified database...');
  const [userProfile, setUserProfile] = useState<UserProfileContext>({});
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const messageCounterRef = useRef(1);

  const sampleQuestions = [
    t('ai.sample1'),
    t('ai.sample2'),
    t('ai.sample3'),
    t('ai.sample4'),
  ];

  // Auto-scroll ONLY inside the chat container, keeping the browser window/page position stable
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isLoading]);

  const handleResetChat = () => {
    setUserProfile({});
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'assistant',
        text:
          locale === 'hi'
            ? 'बातचीत रीसेट कर दी गई है। आप एक नए प्रश्न के साथ शुरुआत कर सकते हैं। आप किस प्रकार के व्यवसाय या शिक्षा के लिए ऋण खोज रहे हैं?'
            : 'Conversation has been reset. How may I assist you with government concessional loans today?',
        timestamp: 'Just now',
        sources: ['MCF', 'TLS'],
        suggestedQuestions:
          locale === 'hi'
            ? [
                'मेरी ₹3 लाख आय पर कौन सा ऋण मिल सकता है?',
                'महिला समृद्धि योजना के क्या नियम हैं?',
                'ऋण के लिए आवश्यक दस्तावेजों की सूची दें।',
              ]
            : [
                'What schemes are available for ₹3 Lakh income?',
                'What are the terms of Mahila Samriddhi Yojana?',
                'List all documents required for loan application.',
              ],
      },
    ]);
  };

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputText;
    if (!textToSend.trim() || isLoading) return;

    messageCounterRef.current += 1;
    const userMsg: ChatMessage = {
      id: `msg-user-${messageCounterRef.current}`,
      sender: 'user',
      text: textToSend,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    // Dynamic loading hint based on user query
    const lower = textToSend.toLowerCase();
    if (lower.includes('emi') || lower.includes('किस्त') || lower.includes('calculate')) {
      setLoadingStatus(locale === 'hi' ? 'मासिक ईएमआई की गणना की जा रही है...' : 'Calculating reducing-balance EMI...');
    } else if (lower.includes('document') || lower.includes('दस्तावेज')) {
      setLoadingStatus(locale === 'hi' ? 'सत्यापित दस्तावेजों की सूची खोजी जा रही है...' : 'Fetching verified document checklist...');
    } else if (lower.includes('partner') || lower.includes('bank') || lower.includes('sca') || lower.includes('कार्यालय')) {
      setLoadingStatus(locale === 'hi' ? 'चैनल पार्टनर बैंक व एससीए खोजे जा रहे हैं...' : 'Locating authorized SCAs and partner banks...');
    } else {
      setLoadingStatus(locale === 'hi' ? 'योजना सेतु डेटाबेस और पात्रता नियमों से मिलान...' : 'Consulting Yojna Setu verified rules & database...');
    }

    try {
      // Build conversation history for context preservation
      const conversationHistory = messages.map((m) => ({
        role: m.sender === 'user' ? ('user' as const) : ('assistant' as const),
        text: m.text,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          conversationHistory,
          locale,
          language: locale,
          userProfile,
          schemeContext: selectedSchemeForCalculator,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();

      if (data.userProfile) {
        setUserProfile((prev) => ({ ...prev, ...data.userProfile }));
      }

      messageCounterRef.current += 1;
      const assistantReply: ChatMessage = {
        id: `msg-ai-${messageCounterRef.current}`,
        sender: 'assistant',
        text: data.reply || (locale === 'hi' ? 'उत्तर प्राप्त नहीं हो सका।' : 'Unable to get answer.'),
        timestamp: 'Just now',
        sources: Array.isArray(data.sources) ? data.sources : [],
        suggestedQuestions: Array.isArray(data.suggestedQuestions) ? data.suggestedQuestions : [],
        toolsUsed: Array.isArray(data.toolsUsed) ? data.toolsUsed : [],
      };

      setMessages((prev) => [...prev, assistantReply]);
    } catch (err) {
      console.error('Chat error:', err);
      // Fallback
      messageCounterRef.current += 1;
      const fallbackReply: ChatMessage = {
        id: `msg-ai-${messageCounterRef.current}`,
        sender: 'assistant',
        text:
          locale === 'hi'
            ? 'एनएसएफडीसी (NSFDC) योजनाओं के तहत ऋण के लिए जाति प्रमाण पत्र, वार्षिक पारिवारिक आय प्रमाण पत्र (< ₹5 लाख), आधार कार्ड, बैंक पासबुक और व्यवसाय कोटेशन तैयार रखें।\n\nआप अपने नजदीकी राज्य अनुसूचित जाति वित्त एवं विकास निगम (SCA) या अग्रणी सार्वजनिक क्षेत्र के बैंक में आवेदन कर सकते हैं।'
            : 'For NSFDC assistance, please keep your SC Caste Certificate, Annual Family Income Certificate (< ₹5 Lakhs p.a.), Aadhaar Card, Bank Passbook, and project quotation ready.\n\nApplications can be submitted directly through your State Channelising Agency (SCA) or authorized lead bank branch.',
        timestamp: 'Just now',
        sources: ['MCF', 'TLS'],
        suggestedQuestions: [
          locale === 'hi' ? 'आवेदन कैसे और कहाँ जमा करें?' : 'How and where to submit the application?',
          locale === 'hi' ? 'मासिक ईएमआई (EMI) कैसे निकालें?' : 'How is reducing-balance EMI calculated?',
        ],
      };
      setMessages((prev) => [...prev, fallbackReply]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to format structured markdown-like text
  const renderFormattedText = (content: string) => {
    const lines = content.split('\n');

    return (
      <div className="space-y-2">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-1" />;

          // Heading ### or ##
          if (trimmed.startsWith('###') || trimmed.startsWith('##')) {
            const headingText = trimmed.replace(/^#{2,3}\s*/, '');
            return (
              <h4 key={idx} className="font-bold text-blue-950 text-sm sm:text-base mt-2 mb-1">
                {headingText}
              </h4>
            );
          }

          // Blockquote / Tip / Note
          if (trimmed.startsWith('>') || trimmed.startsWith('*नोट:') || trimmed.startsWith('*Note:')) {
            return (
              <div
                key={idx}
                className="bg-amber-50 border-l-3 border-amber-500 px-3 py-1.5 rounded-r-md text-[11px] sm:text-xs text-amber-950 my-1 font-medium"
              >
                {trimmed.replace(/^>\s*/, '')}
              </div>
            );
          }

          // Bullet item
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            const bulletText = trimmed.replace(/^[-*]\s*/, '');
            return (
              <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm pl-1">
                <span className="text-amber-500 font-bold mt-0.5">•</span>
                <span>{renderInlineBold(bulletText)}</span>
              </div>
            );
          }

          // Numbered item: e.g. "1. ", "2. "
          const numMatch = trimmed.match(/^(\d+)\.\s*(.*)/);
          if (numMatch) {
            return (
              <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm pl-1">
                <span className="font-bold text-blue-900 shrink-0 text-xs mt-0.5">{numMatch[1]}.</span>
                <span>{renderInlineBold(numMatch[2])}</span>
              </div>
            );
          }

          return (
            <p key={idx} className="text-xs sm:text-sm leading-relaxed">
              {renderInlineBold(line)}
            </p>
          );
        })}
      </div>
    );
  };

  // Helper for **bold** text
  const renderInlineBold = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div id="ai-assistant-view" className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 mb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-bold border border-amber-300">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Yojna Setu AI Scheme & Policy Assistant</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-950 tracking-tight">
          {t('ai.title')}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
          {t('ai.subtitle')}
        </p>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[620px]">
        {/* Chat Control Subheader */}
        <div className="bg-slate-100/90 border-b border-slate-200 px-4 py-2 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-medium text-slate-700">
              {locale === 'hi' ? 'सत्यापित योजना डेटाबेस सक्रिय' : 'Verified NSFDC Database Active'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleResetChat}
            className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-blue-900 px-2 py-1 rounded hover:bg-slate-200/80 transition cursor-pointer"
            title="Clear and reset chat history"
          >
            <RotateCcw className="w-3 h-3 text-slate-500" />
            <span>{locale === 'hi' ? 'बातचीत रीसेट करें' : 'Reset Chat'}</span>
          </button>
        </div>

        {/* Chat Message List */}
        <div ref={chatContainerRef} className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  msg.sender === 'user'
                    ? 'bg-blue-900 text-amber-300'
                    : 'bg-amber-500 text-blue-950 shadow-xs'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-2xs space-y-2.5 ${
                  msg.sender === 'user'
                    ? 'bg-blue-900 text-white rounded-tr-none'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                }`}
              >
                {msg.sender === 'user' ? (
                  <p className="whitespace-pre-line">{msg.text}</p>
                ) : (
                  renderFormattedText(msg.text)
                )}

                {/* Sources badges if available */}
                {msg.sender === 'assistant' && msg.sources && msg.sources.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      Verified Schemes:
                    </span>
                    {msg.sources.map((s, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2 py-0.5 bg-blue-50 text-blue-900 border border-blue-200 rounded text-[10px] font-bold"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                {/* Dynamic follow-up questions from response */}
                {msg.sender === 'assistant' &&
                  msg.suggestedQuestions &&
                  msg.suggestedQuestions.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 space-y-1.5">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <HelpCircle className="w-3 h-3 text-amber-600" />
                        Suggested Next Steps:
                      </span>
                      <div className="flex flex-col gap-1">
                        {msg.suggestedQuestions.map((q, qIdx) => (
                          <button
                            key={qIdx}
                            type="button"
                            onClick={() => handleSendMessage(q)}
                            className="text-left text-[11px] text-blue-950 hover:text-blue-800 bg-slate-50 hover:bg-amber-50/80 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-amber-300 transition-colors flex items-center justify-between group cursor-pointer"
                          >
                            <span>{q}</span>
                            <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-amber-600 transition" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                <span
                  className={`block text-[10px] mt-1 text-right ${
                    msg.sender === 'user' ? 'text-blue-200' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-500 text-blue-950 flex items-center justify-center">
                <Bot className="w-4 h-4 animate-bounce" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-600 flex items-center gap-2 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-blue-900 animate-pulse" />
                <span className="w-2 h-2 rounded-full bg-blue-900 animate-pulse delay-75" />
                <span className="w-2 h-2 rounded-full bg-blue-900 animate-pulse delay-150" />
                <span>{loadingStatus}</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Sample Questions Carousel */}
        <div className="bg-slate-100/90 border-t border-slate-200 px-4 py-2.5 overflow-x-auto flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-bold text-slate-500 shrink-0">Quick prompts:</span>
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(q)}
              className="text-[11px] font-medium bg-white hover:bg-slate-200 text-blue-950 px-2.5 py-1 rounded-full border border-slate-300 shrink-0 transition-colors cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3.5 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            id="input-ai-chat"
            type="text"
            placeholder={t('ai.inputPlaceholder')}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            disabled={isLoading}
            className="flex-1 px-4 py-3 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-900 focus:outline-none min-h-[48px] disabled:opacity-60"
          />
          <button
            id="btn-send-ai-chat"
            type="button"
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isLoading}
            className="px-5 py-3 bg-blue-900 hover:bg-blue-950 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 min-h-[48px] cursor-pointer"
          >
            <span>{t('ai.send')}</span>
            <Send className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </div>
    </div>
  );
}

