'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Bot, Send, User, Sparkles, AlertCircle, HelpCircle, FileText, CheckCircle2 } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export default function AiSchemeAssistant() {
  const { t, locale, selectedSchemeForCalculator } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text:
        locale === 'hi'
          ? 'नमस्ते! मैं एनएसएफडीसी (NSFDC) एआई सहायक हूँ। आप मुझसे ऋण योजनाओं, ब्याज छूट, आवश्यक दस्तावेजों या आवेदन प्रक्रिया के बारे में कोई भी प्रश्न पूछ सकते हैं।'
          : 'Welcome! I am the official NSFDC Scheme & Advisory AI Assistant. You can ask me about loan schemes, concessional interest rates, required documents, or application guidelines.',
      timestamp: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sampleQuestions = [
    t('ai.sample1'),
    t('ai.sample2'),
    t('ai.sample3'),
    t('ai.sample4'),
  ];

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputText;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${messages.length + 1}`,
      sender: 'user',
      text: textToSend,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/gemini/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          locale,
          schemeContext: selectedSchemeForCalculator,
        }),
      });

      const data = await res.json();
      const assistantReply: ChatMessage = {
        id: `msg-${messages.length + 2}`,
        sender: 'assistant',
        text: data.reply || (locale === 'hi' ? 'उत्तर प्राप्त नहीं हो सका।' : 'Unable to get answer.'),
        timestamp: 'Just now',
      };

      setMessages((prev) => [...prev, assistantReply]);
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackReply: ChatMessage = {
        id: `msg-${messages.length + 2}`,
        sender: 'assistant',
        text:
          locale === 'hi'
            ? 'एनएसएफडीसी योजनाओं के लिए जाति प्रमाण पत्र, आय प्रमाण पत्र (< ₹5 लाख) एवं व्यवसाय प्रस्ताव तैयार रखें। नजदीकी एससीए कार्यालय से संपर्क करें।'
            : 'For NSFDC assistance, keep your Caste Certificate, Family Income Certificate (< ₹5 Lakhs), and project estimate ready. Visit your State Channelising Agency (SCA) or call 1800-11-2001.',
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, fallbackReply]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="ai-assistant-view" className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 mb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-bold border border-amber-300">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Yojna Setu Guidance Assistant</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-950 tracking-tight">
          {t('ai.title')}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
          {t('ai.subtitle')}
        </p>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[580px]">
        {/* Chat Message List */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/50">
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
                className={`max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-2xs ${
                  msg.sender === 'user'
                    ? 'bg-blue-900 text-white rounded-tr-none'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none whitespace-pre-line'
                }`}
              >
                <p>{msg.text}</p>
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
              <div className="bg-white border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-900 animate-pulse" />
                <span className="w-2 h-2 rounded-full bg-blue-900 animate-pulse delay-75" />
                <span className="w-2 h-2 rounded-full bg-blue-900 animate-pulse delay-150" />
                <span>Consulting NSFDC scheme guidelines...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Sample Questions */}
        <div className="bg-slate-100/90 border-t border-slate-200 px-4 py-2.5 overflow-x-auto flex items-center gap-2">
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
            className="flex-1 px-4 py-3 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-900 focus:outline-none min-h-[48px]"
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
