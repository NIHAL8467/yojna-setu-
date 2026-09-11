'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  RotateCcw,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  Shield,
  Loader2,
  HelpCircle,
  BookOpen,
  Users,
  GraduationCap,
  Tractor,
  HeartHandshake,
  Search,
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { YojnaMascot } from './YojnaMascot';

interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  timestamp: string;
  sources?: string[];
  suggestedQuestions?: string[];
}

const QUICK_SUGGESTIONS = [
  { label: 'Find a Scheme', icon: Search, query: 'Find a Scheme' },
  { label: 'Check Eligibility', icon: CheckCircle2, query: 'Check Eligibility' },
  { label: 'Women & Child Schemes', icon: Users, query: 'Women & Child Schemes' },
  { label: 'Student Schemes', icon: GraduationCap, query: 'Student Schemes' },
  { label: 'Farmer Schemes', icon: Tractor, query: 'Farmer Schemes' },
  { label: 'Senior Citizen Schemes', icon: HeartHandshake, query: 'Senior Citizen Schemes' },
];

export function FloatingYojnaMitra() {
  const { locale, userProfile, userCategory } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestionsDrawer, setShowSuggestionsDrawer] = useState(false);
  const messageIdCounterRef = useRef(1);

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-msg',
      role: 'assistant',
      text:
        locale === 'hi'
          ? "नमस्ते! 👋 मैं **योजना मित्र (Yojna Mitra)** हूँ। मैं सरकारी योजनाओं को खोजने और आपकी पात्रता समझने में आपकी सहायता कर सकता हूँ।"
          : "Namaste! 👋 I'm **Yojna Mitra**. I can help you find government schemes and understand your eligibility.",
      timestamp: 'Just now',
      suggestedQuestions: [
        'Find a Scheme',
        'Check Eligibility',
        'Women & Child Schemes',
        'Student Schemes',
      ],
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on message update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      // Focus input when opened
      setTimeout(() => {
        inputRef.current?.focus();
      }, 250);
    }
  }, [isOpen, messages, isLoading]);

  // Handle keyboard Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    const currentMsgId = messageIdCounterRef.current++;
    const currentTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg: ChatMessage = {
      id: `user-${currentMsgId}`,
      role: 'user',
      text: query,
      timestamp: currentTimestamp,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    // Format conversation history for the backend
    const conversationHistory = messages.map((m) => ({
      role: m.role,
      text: m.text,
    }));

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          conversationHistory,
          language: locale || 'en',
          userProfile: {
            category: userCategory || userProfile.category || 'SC',
            annual_family_income: userProfile.income || 250000,
            state: userProfile.state || 'Delhi',
            gender: userProfile.gender || 'male',
            loan_required: userProfile.projectCost || 200000,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      const assistantMsgId = messageIdCounterRef.current++;
      const responseTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const assistantMsg: ChatMessage = {
        id: `assistant-${assistantMsgId}`,
        role: 'assistant',
        text:
          data.reply ||
          (locale === 'hi'
            ? 'योजना सेतु सहायक से संपर्क नहीं हो पाया। कृपया पुनः प्रयास करें।'
            : 'Unable to retrieve answer. Please try again.'),
        timestamp: responseTimestamp,
        sources: data.sources || [],
        suggestedQuestions: data.suggestedQuestions || [],
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const errMsgId = messageIdCounterRef.current++;
      const errTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const errorMsg: ChatMessage = {
        id: `err-${errMsgId}`,
        role: 'assistant',
        text:
          locale === 'hi'
            ? 'क्षमा करें, नेटवर्क में समस्या आ रही है। कृपया कुछ क्षणों बाद पुनः प्रयास करें या नीचे दिए गए सुझावों में से चुनें।'
            : 'Sorry, there was a temporary connection issue. Please try again or choose from the suggestions below.',
        timestamp: errTimestamp,
        suggestedQuestions: ['Find a Scheme', 'Check Eligibility', 'Farmer Schemes'],
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome-msg',
        role: 'assistant',
        text:
          locale === 'hi'
            ? "नमस्ते! 👋 मैं **योजना मित्र (Yojna Mitra)** हूँ। मैं सरकारी योजनाओं को खोजने और आपकी पात्रता समझने में आपकी सहायता कर सकता हूँ।"
            : "Namaste! 👋 I'm **Yojna Mitra**. I can help you find government schemes and understand your eligibility.",
        timestamp: 'Just now',
        suggestedQuestions: [
          'Find a Scheme',
          'Check Eligibility',
          'Women & Child Schemes',
          'Student Schemes',
        ],
      },
    ]);
    setShowSuggestionsDrawer(false);
  };

  // Helper for rendering Markdown-like text safely
  const renderMessageContent = (text: string) => {
    const lines = text.split('\n');

    return (
      <div className="space-y-1.5 text-xs sm:text-sm">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-1" />;

          // Heading ### or ##
          if (trimmed.startsWith('###') || trimmed.startsWith('##')) {
            const headingText = trimmed.replace(/^#{2,3}\s*/, '');
            return (
              <h4 key={idx} className="font-bold text-blue-950 text-xs sm:text-sm mt-2 mb-0.5">
                {headingText}
              </h4>
            );
          }

          // Blockquote / Tip / Note
          if (trimmed.startsWith('>') || trimmed.startsWith('*नोट:') || trimmed.startsWith('*Note:')) {
            return (
              <div
                key={idx}
                className="bg-amber-50 border-l-2 border-amber-500 px-2.5 py-1.5 rounded-r text-[11px] sm:text-xs text-amber-950 my-1 font-medium"
              >
                {trimmed.replace(/^>\s*/, '')}
              </div>
            );
          }

          // Bullet item
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            const bulletText = trimmed.replace(/^[-*]\s*/, '');
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-0.5">
                <span className="text-amber-600 font-bold shrink-0 mt-0.5">•</span>
                <span className="text-slate-800">{renderInlineBold(bulletText)}</span>
              </div>
            );
          }

          // Numbered item: e.g. "1. ", "2. "
          const numMatch = trimmed.match(/^(\d+)\.\s*(.*)/);
          if (numMatch) {
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-0.5">
                <span className="font-bold text-blue-900 shrink-0 text-xs mt-0.5">{numMatch[1]}.</span>
                <span className="text-slate-800">{renderInlineBold(numMatch[2])}</span>
              </div>
            );
          }

          return (
            <p key={idx} className="leading-relaxed text-slate-800">
              {renderInlineBold(line)}
            </p>
          );
        })}
      </div>
    );
  };

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
    <>
      {/* ------------------------------------------------------------- */}
      {/* 1. Floating Launcher Button (Fixed at bottom-right)           */}
      {/* ------------------------------------------------------------- */}
      <div
        id="yojna-mitra-floating-launcher"
        className="fixed bottom-20 right-4 sm:bottom-22 sm:right-6 lg:bottom-6 lg:right-6 z-40 pointer-events-auto"
      >
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              id="yojna-mitra-open-button"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              whileHover={{ scale: 1.06, y: -2 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => setIsOpen(true)}
              aria-expanded={isOpen}
              aria-controls="yojna-mitra-chat-window"
              aria-label="Open Yojna Setu Assistant"
              title="Yojna Setu"
              className="group relative w-16 h-16 sm:w-18 sm:h-18 rounded-full p-0 flex items-center justify-center bg-[#1a3d82] shadow-2xl shadow-blue-950/40 border-2 border-white/90 transition-all cursor-pointer select-none focus:outline-none focus:ring-4 focus:ring-blue-400/50 focus:ring-offset-2"
            >
              {/* Reference Image: "Yojna Setu" speech bubble */}
              <div
                id="yojna-setu-bubble"
                className="absolute -top-10 sm:-top-11 right-0 sm:right-1 flex flex-col items-center select-none pointer-events-none drop-shadow-md transition-transform group-hover:-translate-y-0.5"
              >
                <div className="bg-[#1a386d] text-white text-xs sm:text-sm font-bold tracking-wide px-3 py-1 rounded-2xl shadow-lg border border-white/20 whitespace-nowrap">
                  Yojna Setu
                </div>
                {/* Downward tail pointing to the mascot */}
                <div className="w-2.5 h-2.5 bg-[#1a386d] rotate-45 -mt-1.5 border-r border-b border-white/10" />
              </div>

              {/* Reference Image: 3D Mascot Avatar */}
              <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
                <YojnaMascot size={72} className="w-full h-full scale-105" />
              </div>

              {/* Reference Image: Solid Green Circular Status Badge with White Outline Ring */}
              <span
                id="yojna-mitra-online-status"
                className="absolute bottom-0 right-0 sm:bottom-0.5 sm:right-0.5 w-5 h-5 sm:w-5.5 sm:h-5.5 bg-[#10b981] border-2 sm:border-[2.5px] border-white rounded-full shadow-md z-10"
              />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. Chatbot Open State Window (Rounded compact chat panel)      */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="yojna-mitra-chat-window"
            role="dialog"
            aria-label="Yojna Mitra AI Chat Assistant"
            aria-modal="false"
            initial={{ opacity: 0, scale: 0.9, y: 30, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-20 right-3 sm:bottom-22 sm:right-6 lg:bottom-6 lg:right-6 z-50 w-[calc(100vw-1.5rem)] sm:w-[410px] max-w-[430px] h-[580px] max-h-[82vh] sm:max-h-[640px] flex flex-col bg-white rounded-2xl shadow-2xl shadow-slate-900/30 border border-slate-200/90 overflow-hidden font-sans"
          >
            {/* National Tricolor Hairline Stripe on Top */}
            <div className="h-1 w-full flex">
              <div className="w-1/3 bg-[#FF9933]" />
              <div className="w-1/3 bg-white" />
              <div className="w-1/3 bg-[#138808]" />
            </div>

            {/* Header: Yojna Mitra with Subtitle and Controls */}
            <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white px-4 py-3 flex items-center justify-between border-b border-blue-800/40">
              <div className="flex items-center gap-2.5">
                {/* Assistant Avatar with pulse */}
                <div className="relative">
                  <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center shadow-md border border-amber-400/50 bg-[#1a3d82]">
                    <YojnaMascot size={36} className="w-full h-full scale-105" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-blue-950 rounded-full" />
                </div>

                {/* Header Titles */}
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-white text-base tracking-tight leading-none">
                      Yojna Mitra
                    </h3>
                    <span className="text-[10px] font-semibold bg-blue-800/80 text-amber-300 px-1.5 py-0.5 rounded border border-amber-400/30">
                      Gov Guide
                    </span>
                  </div>
                  <p className="text-[11px] text-blue-200 mt-0.5 font-normal">
                    Your guide to Government Schemes
                  </p>
                </div>
              </div>

              {/* Action Buttons: Reset & Close */}
              <div className="flex items-center gap-1">
                <button
                  id="yojna-mitra-reset-btn"
                  onClick={handleResetChat}
                  title="Reset conversation"
                  aria-label="Reset conversation"
                  className="p-1.5 text-blue-200 hover:text-white hover:bg-blue-800/60 rounded-lg transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  id="yojna-mitra-close-btn"
                  onClick={() => setIsOpen(false)}
                  title="Minimize Yojna Mitra"
                  aria-label="Minimize Yojna Mitra"
                  className="p-1.5 text-blue-200 hover:text-white hover:bg-blue-800/60 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Suggestions Toggle Bar */}
            <div className="bg-slate-50 border-b border-slate-200/80 px-3 py-1.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Quick assistance topics</span>
              </div>
              <button
                onClick={() => setShowSuggestionsDrawer(!showSuggestionsDrawer)}
                className="text-[11px] text-blue-900 font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>{showSuggestionsDrawer ? 'Hide topics' : 'View all'}</span>
                <ChevronDown
                  className={`w-3 h-3 transition-transform ${showSuggestionsDrawer ? 'rotate-180' : ''}`}
                />
              </button>
            </div>

            {/* Expandable Suggestions Drawer */}
            <AnimatePresence>
              {showSuggestionsDrawer && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-blue-50/70 border-b border-blue-100 p-2.5 overflow-hidden"
                >
                  <p className="text-[11px] font-semibold text-blue-950 mb-1.5">
                    Select a topic to explore instantly:
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {QUICK_SUGGESTIONS.map((sug) => {
                      const Icon = sug.icon;
                      return (
                        <button
                          key={sug.label}
                          onClick={() => {
                            handleSendMessage(sug.query);
                            setShowSuggestionsDrawer(false);
                          }}
                          className="flex items-center gap-1.5 bg-white hover:bg-blue-100/70 text-blue-950 border border-blue-200/80 rounded-lg p-1.5 text-left text-[11px] font-medium transition-colors shadow-2xs cursor-pointer"
                        >
                          <Icon className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                          <span className="truncate">{sug.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages Scroll Area */}
            <div
              id="yojna-mitra-messages-container"
              className="flex-1 overflow-y-auto p-3.5 space-y-3.5 bg-gradient-to-b from-slate-50/50 to-white"
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-start gap-2 max-w-[92%]">
                    {msg.role === 'assistant' && (
                      <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 mt-0.5 shadow-2xs border border-amber-400/40 bg-[#1a3d82]">
                        <YojnaMascot size={24} className="w-full h-full scale-105" />
                      </div>
                    )}

                    <div
                      className={`p-3 rounded-2xl shadow-2xs ${
                        msg.role === 'user'
                          ? 'bg-blue-900 text-white rounded-tr-xs ml-auto'
                          : 'bg-white text-slate-800 rounded-tl-xs border border-slate-200/90 shadow-xs'
                      }`}
                    >
                      {msg.role === 'user' ? (
                        <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                          {msg.text}
                        </p>
                      ) : (
                        renderMessageContent(msg.text)
                      )}

                      {/* Verified Sources Badges */}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-2 pt-1.5 border-t border-slate-100 flex flex-wrap items-center gap-1">
                          <span className="text-[10px] text-slate-500 font-medium">Verified Sources:</span>
                          {msg.sources.map((src, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-slate-100 text-blue-950 px-1.5 py-0.5 rounded border border-slate-200"
                            >
                              <Shield className="w-2.5 h-2.5 text-blue-700" />
                              {src}
                            </span>
                          ))}
                        </div>
                      )}

                      <div
                        className={`text-[9px] mt-1.5 flex justify-end ${
                          msg.role === 'user' ? 'text-blue-200' : 'text-slate-400'
                        }`}
                      >
                        {msg.timestamp}
                      </div>
                    </div>

                    {msg.role === 'user' && (
                      <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5 text-xs shadow-2xs">
                        <User className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>

                  {/* Initial Welcome Message: Show Quick Suggestion Buttons right inside message */}
                  {msg.id === 'welcome-msg' && messages.length === 1 && (
                    <div className="mt-2.5 ml-8 mr-1 space-y-1.5">
                      <p className="text-[11px] font-semibold text-slate-600">
                        Frequently asked government scheme topics:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {QUICK_SUGGESTIONS.map((sug) => {
                          const Icon = sug.icon;
                          return (
                            <button
                              key={sug.label}
                              onClick={() => handleSendMessage(sug.query)}
                              className="inline-flex items-center gap-1 text-[11px] font-medium bg-white hover:bg-blue-50 text-blue-950 border border-slate-200 hover:border-blue-400 px-2.5 py-1.5 rounded-full shadow-2xs transition-all cursor-pointer"
                            >
                              <Icon className="w-3 h-3 text-blue-700" />
                              <span>{sug.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Dynamic Follow-up Suggestions from Assistant */}
                  {msg.role === 'assistant' &&
                    msg.id !== 'welcome-msg' &&
                    msg.suggestedQuestions &&
                    msg.suggestedQuestions.length > 0 &&
                    msg.id === messages[messages.length - 1].id && (
                      <div className="mt-2 ml-8 space-y-1">
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                          Suggested questions:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {msg.suggestedQuestions.slice(0, 3).map((q, i) => (
                            <button
                              key={i}
                              onClick={() => handleSendMessage(q)}
                              className="text-[11px] text-left bg-blue-50 hover:bg-blue-100 text-blue-950 border border-blue-200/80 px-2 py-1 rounded-md transition-colors cursor-pointer"
                            >
                              → {q}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              ))}

              {/* Typing / Loading Animation */}
              {isLoading && (
                <div className="flex items-start gap-2 max-w-[85%]">
                  <div className="w-6 h-6 rounded-full bg-blue-950 text-amber-300 flex items-center justify-center shrink-0 mt-0.5 text-xs shadow-2xs">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="bg-white border border-slate-200/90 rounded-2xl rounded-tl-xs p-3 shadow-2xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-900 animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-2 h-2 rounded-full bg-blue-700 animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
                      <span className="text-xs text-slate-500 ml-1 font-medium">
                        Yojna Mitra is consulting schemes...
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Form at the bottom */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 bg-white border-t border-slate-200"
            >
              <div className="relative flex items-center">
                <input
                  ref={inputRef}
                  id="yojna-mitra-text-input"
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={
                    locale === 'hi'
                      ? 'योजना, पात्रता या दस्तावेज के बारे में पूछें...'
                      : 'Ask about schemes, eligibility, documents...'
                  }
                  disabled={isLoading}
                  className="w-full pl-3 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400 disabled:opacity-60"
                />

                <button
                  id="yojna-mitra-send-btn"
                  type="submit"
                  disabled={!inputMessage.trim() || isLoading}
                  aria-label="Send message to Yojna Mitra"
                  className="absolute right-1.5 p-1.5 bg-blue-950 hover:bg-blue-900 text-white rounded-lg disabled:opacity-40 disabled:hover:bg-blue-950 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                  ) : (
                    <Send className="w-4 h-4 text-amber-300" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5 px-0.5">
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-emerald-600" />
                  Official Scheme Information
                </span>
                <span>Press Enter to send</span>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
