'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Send,
  Bot,
  User,
  RotateCcw,
  Sparkles,
  ChevronDown,
  Shield,
  Loader2,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Calculator,
  MapPin,
  Compass,
  Square,
  Search,
  CheckCircle2,
  Users,
  GraduationCap,
  Tractor,
  HeartHandshake,
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
  isVoiceInput?: boolean;
}

// Quick suggestion topics for instant exploration
const QUICK_SUGGESTIONS = [
  { label: 'Find a Scheme', icon: Search, query: 'Find a Scheme' },
  { label: 'Check Eligibility', icon: CheckCircle2, query: 'Check Eligibility' },
  { label: 'Women & Child Schemes', icon: Users, query: 'Women & Child Schemes' },
  { label: 'Student Schemes', icon: GraduationCap, query: 'Student Schemes' },
  { label: 'Farmer Schemes', icon: Tractor, query: 'Farmer Schemes' },
  { label: 'Senior Citizen Schemes', icon: HeartHandshake, query: 'Senior Citizen Schemes' },
];

// Sample voice queries for 1-tap testing and fallbacks
const SAMPLE_VOICE_QUERIES = [
  { en: 'What are the benefits of PM Kisan?', hi: 'पीएम किसान योजना के क्या लाभ हैं?' },
  { en: 'Who is eligible for Mahila Samriddhi scheme?', hi: 'महिला समृद्धि योजना की पात्रता क्या है?' },
  { en: 'How to apply for PM Mudra loan?', hi: 'मुद्रा लोन के लिए आवेदन कैसे करें?' },
  { en: 'NSFDC concessional loan interest rates', hi: 'NSFDC ऋण की ब्याज दर कितनी है?' },
];

export function FloatingYojnaMitra() {
  const { locale, userProfile, userCategory, setActiveTab } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestionsDrawer, setShowSuggestionsDrawer] = useState(false);
  
  // Voice input state
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  
  // Voice output state
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  
  const messageIdCounterRef = useRef(1);
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-msg',
      role: 'assistant',
      text:
        locale === 'hi'
          ? "नमस्ते! 👋 मैं **योजना सेतु सहायक** हूँ। मैं सरकारी योजनाओं, पात्रता, लाभ और आवश्यक दस्तावेजों की सटीक जानकारी प्रदान करता हूँ।\n\nआप किसी भी योजना के बारे में पूछ सकते हैं (जैसे: **PM-KISAN**, **महिला समृद्धि योजना**, **मुद्रा योजना**, **शिक्षा ऋण**)।"
          : "Namaste! 👋 I am the **Yojna Setu Assistant**. I provide clear, factual answers on Indian government schemes, benefits, eligibility, and required documents.\n\nYou can ask about any scheme (such as **PM-KISAN**, **Mahila Samriddhi**, **PM Mudra**, **Education Loan**).",
      timestamp: 'Just now',
      suggestedQuestions: [
        'What is PM Kisan?',
        'Who can apply for Mahila Samriddhi?',
        'Show schemes for students',
        'Check loan EMI',
      ],
    },
  ]);

  // Clean text for text-to-speech synthesis
  const cleanForSpeech = (text: string): string => {
    return text
      .replace(/^#{1,4}\s*/gm, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      .replace(/- /g, '')
      .replace(/>/g, '')
      .replace(/\n+/g, '. ')
      .trim();
  };

  // Speak text using Web Speech API
  const speakText = useCallback((textToSpeak: string, msgId: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    window.speechSynthesis.cancel();

    const cleaned = cleanForSpeech(textToSpeak);
    if (!cleaned) return;

    const utterance = new SpeechSynthesisUtterance(cleaned);
    utterance.lang = locale === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setSpeakingMessageId(msgId);
    };

    utterance.onend = () => {
      setSpeakingMessageId(null);
    };

    utterance.onerror = () => {
      setSpeakingMessageId(null);
    };

    window.speechSynthesis.speak(utterance);
  }, [locale]);

  // Stop speech playback
  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
    }
  }, []);

  // Stop all audio recording (Web Speech API and MediaRecorder)
  const stopAllAudioRecording = useCallback((shouldProcess = true) => {
    // 1. Web Speech API
    if (recognitionRef.current) {
      try {
        if (shouldProcess) {
          recognitionRef.current.stop();
        } else {
          recognitionRef.current.abort();
        }
      } catch {
        // Ignore
      }
      recognitionRef.current = null;
    }

    // 2. MediaRecorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        if (!shouldProcess) {
          audioChunksRef.current = [];
        }
        mediaRecorderRef.current.stop();
      } catch {
        // Ignore
      }
      mediaRecorderRef.current = null;
    }

    // 3. Audio stream tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setIsListening(false);
  }, []);

  const closeChat = useCallback(() => {
    stopSpeaking();
    stopAllAudioRecording(false);
    setIsListening(false);
    setIsTranscribing(false);
    setIsOpen(false);
  }, [stopSpeaking, stopAllAudioRecording]);

  // Clean up speech synthesis & audio streams on component unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      stopAllAudioRecording(false);
    };
  }, [stopAllAudioRecording]);

  // Auto-scroll to bottom on message update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => {
        inputRef.current?.focus();
      }, 250);
    }
  }, [isOpen, messages, isLoading]);

  // Handle keyboard Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeChat();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeChat]);

  // Main message sender
  const handleSendMessage = async (textToSend?: string, isFromVoice = false) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    // If already speaking, stop previous speech
    stopSpeaking();
    setSpeechError(null);

    const currentMsgId = messageIdCounterRef.current++;
    const currentTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg: ChatMessage = {
      id: `user-${currentMsgId}`,
      role: 'user',
      text: query,
      timestamp: currentTimestamp,
      isVoiceInput: isFromVoice,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    // Prepare conversation history
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
      const newMsgId = `assistant-${assistantMsgId}`;

      const replyText =
        data.reply ||
        (locale === 'hi'
          ? 'योजना सेतु सहायक से संपर्क नहीं हो पाया। कृपया पुनः प्रयास करें।'
          : 'Unable to retrieve answer. Please try again.');

      const assistantMsg: ChatMessage = {
        id: newMsgId,
        role: 'assistant',
        text: replyText,
        timestamp: responseTimestamp,
        sources: data.sources || [],
        suggestedQuestions: data.suggestedQuestions || [],
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // If user asked via voice, auto-speak the response!
      // (Voice question -> Voice answer; Text question -> Text answer)
      if (isFromVoice) {
        setTimeout(() => {
          speakText(replyText, newMsgId);
        }, 150);
      }
    } catch (err) {
      console.error('Chat error:', err);
      const errMsgId = messageIdCounterRef.current++;
      const errTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const errorMsg: ChatMessage = {
        id: `err-${errMsgId}`,
        role: 'assistant',
        text:
          locale === 'hi'
            ? 'क्षमा करें, नेटवर्क में अस्थाई समस्या आ रही है। कृपया कुछ क्षणों बाद पुनः प्रयास करें।'
            : 'Sorry, there was a temporary connection issue. Please try again or choose from the suggestions below.',
        timestamp: errTimestamp,
        suggestedQuestions: ['What is PM Kisan?', 'Check loan EMI', 'Show schemes for women'],
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fallback voice recognition using MediaRecorder + Gemini API
  const startMediaRecorderFallback = async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setIsListening(false);
      setIsTranscribing(false);
      setSpeechError(
        locale === 'hi'
          ? 'आपके ब्राउज़र में माइक्रोफ़ोन समर्थित नहीं है। नीचे दिया गया कोई भी त्वरित वॉइस प्रश्न चुनें:'
          : 'Microphone is not supported in this browser. Try one of the quick voice queries:'
      );
      return;
    }

    try {
      setIsListening(true);
      setSpeechError(null);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType =
        typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported('audio/mp4')
          ? 'audio/mp4'
          : '';

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }
        setIsListening(false);

        if (audioChunksRef.current.length === 0) return;

        const audioBlob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        });
        audioChunksRef.current = [];

        if (audioBlob.size < 400) {
          return;
        }

        setIsTranscribing(true);
        try {
          const formData = new FormData();
          formData.append('audio', audioBlob, 'speech.webm');
          formData.append('language', locale || 'hi');

          const res = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData,
          });

          if (!res.ok) throw new Error(`Transcription failed: ${res.status}`);
          const data = await res.json();
          const transcript = data.transcript?.trim();

          if (transcript) {
            setInputMessage(transcript);
            handleSendMessage(transcript, true);
          } else {
            setSpeechError(
              locale === 'hi'
                ? 'आवाज़ समझ नहीं आई। कृपया पुनः बोलें या नीचे दिए गए सुझाव चुनें।'
                : 'Could not clearly recognize audio. Please try speaking again or tap a suggestion.'
            );
          }
        } catch (err: any) {
          console.error('Audio transcribe error:', err);
          setSpeechError(
            locale === 'hi'
              ? 'वॉइस ट्रांसक्रिप्शन में समस्या आई। नीचे दिए गए त्वरित प्रश्न से प्रयास करें:'
              : 'Voice transcription issue. Try one of the quick voice sample queries below:'
          );
        } finally {
          setIsTranscribing(false);
        }
      };

      recorder.start(250);
    } catch (micErr: any) {
      console.warn('Microphone permission or access error:', micErr);
      setIsListening(false);
      setIsTranscribing(false);
      setSpeechError(
        locale === 'hi'
          ? 'माइक्रोफ़ोन अनुमति नहीं मिली। आप नीचे दिए गए वॉइस प्रश्न पर टैप कर सकते हैं:'
          : 'Microphone access was denied or unavailable. Tap a sample query below to test voice answers:'
      );
    }
  };

  // Voice Input: Start or Stop Speech Recognition
  const toggleVoiceRecording = async () => {
    setSpeechError(null);

    // If currently listening, clicking the button stops recording and submits
    if (isListening) {
      stopAllAudioRecording(true);
      return;
    }

    // If currently transcribing, ignore extra clicks
    if (isTranscribing) return;

    stopSpeaking();

    // Check if Web Speech API is supported
    const SpeechRecognition =
      typeof window !== 'undefined'
        ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        : null;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.lang = locale === 'hi' ? 'hi-IN' : 'en-IN';
        recognition.continuous = false;
        recognition.interimResults = true; // Provides instant real-time transcript preview!
        recognition.maxAlternatives = 1;

        let accumulatedTranscript = '';

        recognition.onstart = () => {
          setIsListening(true);
          setSpeechError(null);
        };

        recognition.onresult = (event: any) => {
          let liveInterim = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const res = event.results[i];
            if (res.isFinal) {
              accumulatedTranscript += res[0].transcript;
            } else {
              liveInterim += res[0].transcript;
            }
          }
          const spokenText = (accumulatedTranscript || liveInterim).trim();
          if (spokenText) {
            setInputMessage(spokenText);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('Web Speech recognition event error:', event.error);
          // If permission denied or service blocked in iframe, try MediaRecorder fallback
          if (
            event.error === 'not-allowed' ||
            event.error === 'service-not-allowed' ||
            event.error === 'network'
          ) {
            recognitionRef.current = null;
            startMediaRecorderFallback();
          } else if (event.error === 'no-speech') {
            setIsListening(false);
            setSpeechError(
              locale === 'hi'
                ? 'कोई आवाज़ सुनाई नहीं दी। कृपया पुनः बोलें या त्वरित प्रश्न चुनें।'
                : 'No voice was detected. Please tap the mic again or try a sample question.'
            );
          } else {
            setIsListening(false);
            setSpeechError(
              locale === 'hi'
                ? 'वॉइस इनपुट में समस्या आई। नीचे दिए गए प्रश्न से प्रयास करें:'
                : 'Voice recognition issue. Please try again or choose from the samples.'
            );
          }
        };

        recognition.onend = () => {
          setIsListening(false);
          const finalQuery = (accumulatedTranscript || inputMessage).trim();
          if (finalQuery) {
            handleSendMessage(finalQuery, true);
          }
        };

        recognition.start();
        setIsListening(true);
        return;
      } catch (speechErr) {
        console.warn('SpeechRecognition failed to start, trying MediaRecorder:', speechErr);
      }
    }

    // Fallback: MediaRecorder + Gemini API
    startMediaRecorderFallback();
  };

  const handleResetChat = () => {
    stopSpeaking();
    setMessages([
      {
        id: 'welcome-msg',
        role: 'assistant',
        text:
          locale === 'hi'
            ? "नमस्ते! 👋 मैं **योजना सेतु सहायक** हूँ। मैं सरकारी योजनाओं, पात्रता, लाभ और आवश्यक दस्तावेजों की सटीक जानकारी प्रदान करता हूँ।\n\nआप किसी भी योजना के बारे में पूछ सकते हैं (जैसे: **PM-KISAN**, **महिला समृद्धि योजना**, **मुद्रा योजना**, **शिक्षा ऋण**)।"
            : "Namaste! 👋 I am the **Yojna Setu Assistant**. I provide clear, factual answers on Indian government schemes, benefits, eligibility, and required documents.\n\nYou can ask about any scheme (such as **PM-KISAN**, **Mahila Samriddhi**, **PM Mudra**, **Education Loan**).",
        timestamp: 'Just now',
        suggestedQuestions: [
          'What is PM Kisan?',
          'Who can apply for Mahila Samriddhi?',
          'Show schemes for students',
          'Check loan EMI',
        ],
      },
    ]);
    setShowSuggestionsDrawer(false);
    setSpeechError(null);
  };

  // Helper for rendering Markdown-like text safely with action chips
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

  // Detect tool/navigation suggestions in text to render actionable buttons
  const renderActionNavigationButtons = (text: string) => {
    const lower = text.toLowerCase();
    const actions: { label: string; icon: any; tab: 'explore-schemes' | 'calculator' | 'partners' }[] = [];

    if (lower.includes('recommender') || lower.includes('smart scheme') || lower.includes('check eligibility')) {
      actions.push({
        label: locale === 'hi' ? 'स्मार्ट योजना खोजकर्ता खोलें' : 'Open Scheme Recommender',
        icon: Compass,
        tab: 'explore-schemes',
      });
    }

    if (lower.includes('emi calculator') || lower.includes('calculator tab') || lower.includes('मासिक किस्त')) {
      actions.push({
        label: locale === 'hi' ? 'ईएमआई (EMI) कैलकुलेटर खोलें' : 'Open EMI Calculator',
        icon: Calculator,
        tab: 'calculator',
      });
    }

    if (lower.includes('channel partner') || lower.includes('locator') || lower.includes('नजदीकी कार्यालय') || lower.includes('बैंक शाखा')) {
      actions.push({
        label: locale === 'hi' ? 'चैनल पार्टनर लोकेटर खोलें' : 'Open Partner Locator',
        icon: MapPin,
        tab: 'partners',
      });
    }

    if (actions.length === 0) return null;

    return (
      <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
        {actions.map((act, i) => {
          const Icon = act.icon;
          return (
            <button
              key={i}
              onClick={() => {
                setActiveTab(act.tab);
                closeChat();
              }}
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-blue-900 hover:bg-blue-800 text-white px-2.5 py-1 rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <Icon className="w-3 h-3 text-amber-300" />
              <span>{act.label}</span>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <>
      {/* ------------------------------------------------------------- */}
      {/* 1. Floating Launcher Button (Fixed at bottom-right)           */}
      {/* ------------------------------------------------------------- */}
      <div
        id="yojna-mitra-floating-launcher"
        className="fixed bottom-4 right-3 sm:bottom-6 sm:right-6 lg:bottom-6 lg:right-6 z-40 pointer-events-auto"
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
              title="Yojna Setu Assistant"
              className="group relative w-14 h-14 sm:w-16 sm:h-16 lg:w-18 lg:h-18 rounded-full p-0 flex items-center justify-center bg-[#1a3d82] shadow-2xl shadow-blue-950/40 border-2 border-white/90 transition-all cursor-pointer select-none focus:outline-none focus:ring-4 focus:ring-blue-400/50 focus:ring-offset-2"
            >
              {/* Speech bubble */}
              <div
                id="yojna-setu-bubble"
                className="absolute -top-9 sm:-top-11 right-0 sm:right-1 flex flex-col items-center select-none pointer-events-none drop-shadow-md transition-transform group-hover:-translate-y-0.5"
              >
                <div className="bg-[#1a386d] text-white text-[11px] sm:text-xs font-bold tracking-wide px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-2xl shadow-lg border border-white/20 whitespace-nowrap">
                  Yojna Setu
                </div>
                <div className="w-2.5 h-2.5 bg-[#1a386d] rotate-45 -mt-1.5 border-r border-b border-white/10" />
              </div>

              {/* 3D Mascot Avatar */}
              <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
                <YojnaMascot size={64} className="w-full h-full scale-105" />
              </div>

              {/* Green status badge */}
              <span
                id="yojna-mitra-online-status"
                className="absolute bottom-0 right-0 sm:bottom-0.5 sm:right-0.5 w-4 h-4 sm:w-5 sm:h-5 bg-[#10b981] border-2 sm:border-[2.5px] border-white rounded-full shadow-md z-10"
              />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. Chatbot Open State Window                                  */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="yojna-mitra-chat-window"
            role="dialog"
            aria-label="Yojna Setu AI Government Scheme Assistant"
            aria-modal="false"
            initial={{ opacity: 0, scale: 0.9, y: 30, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-2.5 inset-x-2.5 xs:inset-x-3 sm:inset-x-auto sm:right-6 sm:bottom-6 lg:right-6 lg:bottom-6 z-50 sm:w-[420px] md:w-[440px] h-[540px] xs:h-[580px] max-h-[calc(100dvh-1.25rem)] sm:max-h-[640px] flex flex-col bg-white rounded-2xl shadow-2xl shadow-slate-900/30 border border-slate-200/90 overflow-hidden font-sans"
          >
            {/* National Tricolor Stripe */}
            <div className="h-1 w-full flex shrink-0">
              <div className="w-1/3 bg-[#FF9933]" />
              <div className="w-1/3 bg-white" />
              <div className="w-1/3 bg-[#138808]" />
            </div>

            {/* Header */}
            <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between border-b border-blue-800/40 shrink-0">
              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                <div className="relative shrink-0">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden flex items-center justify-center shadow-md border border-amber-400/50 bg-[#1a3d82]">
                    <YojnaMascot size={36} className="w-full h-full scale-105" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-emerald-500 border-2 border-blue-950 rounded-full" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="font-bold text-white text-sm sm:text-base tracking-tight leading-none truncate">
                      Yojna Setu Assistant
                    </h3>
                    <span className="text-[9px] sm:text-[10px] font-semibold bg-blue-800/80 text-amber-300 px-1.5 py-0.5 rounded border border-amber-400/30">
                      Gov Guide
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-blue-200 mt-0.5 font-normal truncate max-w-[190px] xs:max-w-none">
                    {locale === 'hi' ? 'सरकारी योजना एवं लाभ मार्गदर्शक' : 'Indian Government Scheme Assistant'}
                  </p>
                </div>
              </div>

              {/* Header Action Buttons */}
              <div className="flex items-center gap-0.5 sm:gap-1 shrink-0 ml-1">
                {/* Global Stop Speaking Button if currently reading aloud */}
                {speakingMessageId && (
                  <button
                    onClick={stopSpeaking}
                    title="Stop Voice Output"
                    aria-label="Stop Voice Output"
                    className="p-1 sm:p-1.5 text-amber-300 hover:text-white bg-amber-500/20 hover:bg-amber-500/30 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[10px] sm:text-[11px]"
                  >
                    <Square className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
                    <span className="font-medium hidden xs:inline">Stop</span>
                  </button>
                )}

                <button
                  id="yojna-mitra-reset-btn"
                  onClick={handleResetChat}
                  title="Reset conversation"
                  aria-label="Reset conversation"
                  className="p-1 sm:p-1.5 text-blue-200 hover:text-white hover:bg-blue-800/60 rounded-lg transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>

                <button
                  id="yojna-mitra-close-btn"
                  onClick={closeChat}
                  title="Close Assistant"
                  aria-label="Close Assistant"
                  className="p-1 sm:p-1.5 text-blue-200 hover:text-white hover:bg-blue-800/60 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>

            {/* Speaking Alert Bar (If Voice Output Active) */}
            <AnimatePresence>
              {speakingMessageId && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-amber-500/15 border-b border-amber-500/30 px-3 py-1 flex items-center justify-between text-xs text-amber-900 shrink-0"
                >
                  <div className="flex items-center gap-1.5 font-medium text-[10px] sm:text-[11px]">
                    <Volume2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-700 animate-pulse" />
                    <span>Speaking answer aloud...</span>
                  </div>
                  <button
                    onClick={stopSpeaking}
                    className="text-[10px] font-bold text-amber-900 hover:underline cursor-pointer"
                  >
                    Mute Audio
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick Suggestions Toggle Bar */}
            <div className="bg-slate-50 border-b border-slate-200/80 px-3 py-1.5 flex items-center justify-between text-xs shrink-0">
              <div className="flex items-center gap-1.5 text-slate-600 font-medium text-[11px] sm:text-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>{locale === 'hi' ? 'त्वरित सहायता विषय' : 'Quick assistance topics'}</span>
              </div>
              <button
                onClick={() => setShowSuggestionsDrawer(!showSuggestionsDrawer)}
                className="text-[10.5px] sm:text-[11px] text-blue-900 font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
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
                  className="bg-blue-50/70 border-b border-blue-100 p-2 sm:p-2.5 overflow-y-auto max-h-48 shrink-0"
                >
                  <p className="text-[10.5px] sm:text-[11px] font-semibold text-blue-950 mb-1.5">
                    {locale === 'hi' ? 'त्वरित जानकारी के लिए विषय चुनें:' : 'Select a topic to explore instantly:'}
                  </p>
                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-1.5">
                    {QUICK_SUGGESTIONS.map((sug) => {
                      const Icon = sug.icon;
                      return (
                        <button
                          key={sug.label}
                          onClick={() => {
                            handleSendMessage(sug.query, false);
                            setShowSuggestionsDrawer(false);
                          }}
                          className="flex items-center gap-1.5 bg-white hover:bg-blue-100/70 text-blue-950 border border-blue-200/80 rounded-lg p-1.5 text-left text-[10.5px] sm:text-[11px] font-medium transition-colors shadow-2xs cursor-pointer"
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

            {/* Messages Container */}
            <div
              id="yojna-mitra-messages-container"
              className="flex-1 overflow-y-auto p-2.5 sm:p-3.5 space-y-2.5 sm:space-y-3.5 bg-gradient-to-b from-slate-50/50 to-white min-h-0"
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-start gap-1.5 sm:gap-2 max-w-[96%] xs:max-w-[92%] sm:max-w-[88%]">
                    {msg.role === 'assistant' && (
                      <div className="w-6 h-6 sm:w-6.5 sm:h-6.5 rounded-full overflow-hidden shrink-0 mt-0.5 shadow-2xs border border-amber-400/40 bg-[#1a3d82]">
                        <YojnaMascot size={24} className="w-full h-full scale-105" />
                      </div>
                    )}

                    <div
                      className={`p-2.5 sm:p-3 rounded-2xl shadow-2xs break-words overflow-hidden ${
                        msg.role === 'user'
                          ? 'bg-blue-900 text-white rounded-tr-xs ml-auto'
                          : 'bg-white text-slate-800 rounded-tl-xs border border-slate-200/90 shadow-xs'
                      }`}
                    >
                      {/* Voice indicator on user message if spoken */}
                      {msg.role === 'user' && msg.isVoiceInput && (
                        <div className="flex items-center gap-1 text-[9.5px] sm:text-[10px] text-amber-300 font-medium mb-1">
                          <Mic className="w-3 h-3 shrink-0" />
                          <span>Spoken question</span>
                        </div>
                      )}

                      {msg.role === 'user' ? (
                        <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">
                          {msg.text}
                        </p>
                      ) : (
                        <div className="break-words">
                          {renderMessageContent(msg.text)}
                        </div>
                      )}

                      {/* Interactive Navigation/Action Buttons */}
                      {msg.role === 'assistant' && renderActionNavigationButtons(msg.text)}

                      {/* Verified Sources Badges */}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-2 pt-1.5 border-t border-slate-100 flex flex-wrap items-center gap-1">
                          <span className="text-[9.5px] sm:text-[10px] text-slate-500 font-medium">Verified:</span>
                          {msg.sources.map((src, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-0.5 text-[8.5px] sm:text-[9px] font-bold bg-slate-100 text-blue-950 px-1.5 py-0.5 rounded border border-slate-200 max-w-full truncate"
                            >
                              <Shield className="w-2.5 h-2.5 text-blue-700 shrink-0" />
                              <span className="truncate">{src}</span>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Timestamp and Listen-on-demand button for assistant */}
                      <div className="flex items-center justify-between text-[9px] sm:text-[9.5px] mt-1.5 pt-0.5 gap-2">
                        {msg.role === 'assistant' ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                if (speakingMessageId === msg.id) {
                                  stopSpeaking();
                                } else {
                                  speakText(msg.text, msg.id);
                                }
                              }}
                              className="inline-flex items-center gap-1 text-[9.5px] sm:text-[10px] font-medium text-blue-800 hover:text-blue-950 transition-colors cursor-pointer"
                              title={speakingMessageId === msg.id ? 'Stop reading' : 'Listen to this answer'}
                            >
                              {speakingMessageId === msg.id ? (
                                <>
                                  <VolumeX className="w-3 h-3 text-red-600 shrink-0" />
                                  <span className="text-red-600 font-bold">Mute</span>
                                </>
                              ) : (
                                <>
                                  <Volume2 className="w-3 h-3 text-blue-700 shrink-0" />
                                  <span>Listen</span>
                                </>
                              )}
                            </button>
                          </div>
                        ) : (
                          <div />
                        )}

                        <span className={msg.role === 'user' ? 'text-blue-200' : 'text-slate-400'}>
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>

                    {msg.role === 'user' && (
                      <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5 text-xs shadow-2xs">
                        <User className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>

                  {/* Initial Welcome Message: Show Quick Suggestion Buttons */}
                  {msg.id === 'welcome-msg' && messages.length === 1 && (
                    <div className="mt-2 sm:mt-2.5 ml-0 xs:ml-6 sm:ml-8 mr-1 space-y-1 sm:space-y-1.5">
                      <p className="text-[10.5px] sm:text-[11px] font-semibold text-slate-600">
                        {locale === 'hi' ? 'अक्सर पूछे जाने वाले प्रश्न:' : 'Frequently asked questions:'}
                      </p>
                      <div className="flex flex-wrap gap-1 sm:gap-1.5">
                        {msg.suggestedQuestions?.map((q, i) => (
                          <button
                            key={i}
                            onClick={() => handleSendMessage(q, false)}
                            className="inline-flex items-center gap-1 text-[10.5px] sm:text-[11px] font-medium bg-white hover:bg-blue-50 text-blue-950 border border-slate-200 hover:border-blue-400 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full shadow-2xs transition-all cursor-pointer text-left"
                          >
                            <span>→ {q}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dynamic Follow-up Suggestions from Assistant */}
                  {msg.role === 'assistant' &&
                    msg.id !== 'welcome-msg' &&
                    msg.suggestedQuestions &&
                    msg.suggestedQuestions.length > 0 &&
                    msg.id === messages[messages.length - 1].id && (
                      <div className="mt-1.5 sm:mt-2 ml-0 xs:ml-6 sm:ml-8 space-y-1">
                        <span className="text-[9.5px] sm:text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                          {locale === 'hi' ? 'सुझाए गए प्रश्न:' : 'Suggested questions:'}
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {msg.suggestedQuestions.slice(0, 3).map((q, i) => (
                            <button
                              key={i}
                              onClick={() => handleSendMessage(q, false)}
                              className="text-[10.5px] sm:text-[11px] text-left bg-blue-50 hover:bg-blue-100 text-blue-950 border border-blue-200/80 px-2 py-1 rounded-md transition-colors cursor-pointer"
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
                <div className="flex items-start gap-1.5 sm:gap-2 max-w-[85%]">
                  <div className="w-6 h-6 rounded-full bg-blue-950 text-amber-300 flex items-center justify-center shrink-0 mt-0.5 text-xs shadow-2xs">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="bg-white border border-slate-200/90 rounded-2xl rounded-tl-xs p-2.5 sm:p-3 shadow-2xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-900 animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-2 h-2 rounded-full bg-blue-700 animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
                      <span className="text-[11px] sm:text-xs text-slate-500 ml-1 font-medium truncate">
                        {locale === 'hi' ? 'योजना सेतु सहायक जानकारी तैयार कर रहा है...' : 'Yojna Setu Assistant is preparing your answer...'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Active Voice Listening Animation Overlay */}
              {isListening && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-2 sm:p-2.5 flex flex-col gap-1.5 text-xs text-red-900 shadow-xs">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping shrink-0" />
                      <span className="font-bold text-[11px] sm:text-xs truncate text-red-950">
                        {locale === 'hi' ? '🎙️ सुन रहा हूँ... बोलिए' : '🎙️ Listening... Speak your question now'}
                      </span>
                      {/* Animated audio wave bars */}
                      <div className="flex items-center gap-0.5 h-3 ml-1">
                        <span className="w-0.5 h-2.5 bg-red-600 rounded-full animate-[pulse_0.6s_ease-in-out_infinite]" />
                        <span className="w-0.5 h-3.5 bg-red-600 rounded-full animate-[pulse_0.4s_ease-in-out_infinite]" />
                        <span className="w-0.5 h-2 bg-red-600 rounded-full animate-[pulse_0.7s_ease-in-out_infinite]" />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => stopAllAudioRecording(true)}
                      className="text-[10.5px] sm:text-[11px] font-bold text-white bg-red-600 hover:bg-red-700 px-2.5 py-1 rounded-lg cursor-pointer shrink-0 shadow-2xs transition-colors"
                    >
                      {locale === 'hi' ? 'भेजें (Done)' : 'Done & Send'}
                    </button>
                  </div>
                  {inputMessage && (
                    <p className="text-[11px] text-red-800 bg-red-100/70 px-2 py-1 rounded font-medium italic truncate">
                      &ldquo;{inputMessage}&rdquo;
                    </p>
                  )}
                </div>
              )}

              {/* Transcribing State Banner */}
              {isTranscribing && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-2 sm:p-2.5 flex items-center gap-2 text-xs text-indigo-900 animate-pulse shadow-xs">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-700 shrink-0" />
                  <span className="font-semibold text-[11px] sm:text-xs">
                    {locale === 'hi'
                      ? 'AI आपकी आवाज़ समझ रहा है (Transcribing)...'
                      : 'AI is transcribing your voice query...'}
                  </span>
                </div>
              )}

              {/* Speech Error Banner with 1-Tap Quick Voice Samples */}
              {speechError && (
                <div className="bg-amber-50 border border-amber-300 rounded-xl p-2.5 text-[11px] text-amber-950 space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 font-semibold text-amber-900">
                      <Mic className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span>{speechError}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSpeechError(null)}
                      className="text-amber-950 font-bold ml-1 hover:text-red-700 cursor-pointer shrink-0 text-sm leading-none px-1"
                    >
                      ×
                    </button>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-1">
                      {locale === 'hi' ? 'त्वरित प्रश्न आज़माएं (1-क्लिक):' : 'Try sample voice query (1-tap):'}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {SAMPLE_VOICE_QUERIES.map((sq, idx) => {
                        const qText = locale === 'hi' ? sq.hi : sq.en;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setSpeechError(null);
                              setInputMessage(qText);
                              handleSendMessage(qText, true);
                            }}
                            className="text-[10px] bg-white hover:bg-amber-100 text-amber-950 border border-amber-300 px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer text-left shadow-2xs"
                          >
                            🎙️ {qText}
                          </button>
                        );
                      })}
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
                handleSendMessage(inputMessage, false);
              }}
              className="p-2 sm:p-3 bg-white border-t border-slate-200 shrink-0"
            >
              <div className="relative flex items-center gap-1 sm:gap-1.5">
                <input
                  ref={inputRef}
                  id="yojna-mitra-text-input"
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={
                    isListening
                      ? locale === 'hi'
                        ? 'सुन रहा हूँ... बोलिए'
                        : 'Listening... speak now'
                      : isTranscribing
                      ? locale === 'hi'
                        ? 'आवाज़ ट्रांसक्राइब हो रही है...'
                        : 'Transcribing voice query...'
                      : locale === 'hi'
                      ? 'योजना, पात्रता या दस्तावेज के बारे में पूछें...'
                      : 'Ask about schemes, eligibility, documents...'
                  }
                  disabled={isLoading || isListening || isTranscribing}
                  className="flex-1 min-w-0 pl-2.5 sm:pl-3 pr-2 py-2 sm:py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400 disabled:opacity-60"
                />

                {/* Voice Input Microphone Button */}
                <button
                  id="yojna-mitra-voice-btn"
                  type="button"
                  onClick={toggleVoiceRecording}
                  disabled={isLoading || isTranscribing}
                  aria-label={
                    isListening
                      ? 'Stop voice recording'
                      : isTranscribing
                      ? 'Transcribing audio'
                      : 'Start voice input'
                  }
                  title={
                    isListening
                      ? 'Stop recording and send / बोलना रोकें और भेजें'
                      : isTranscribing
                      ? 'Transcribing audio / ट्रांसक्राइब हो रहा है...'
                      : locale === 'hi'
                      ? 'बोलकर प्रश्न पूछें (Voice Input)'
                      : 'Ask by speaking (Voice Input)'
                  }
                  className={`group relative p-2 sm:p-2.5 rounded-xl transition-all cursor-pointer shrink-0 focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                    isListening
                      ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse shadow-lg shadow-red-500/50 ring-4 ring-red-400/40'
                      : isTranscribing
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/30'
                      : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 shadow-xs active:scale-95'
                  }`}
                >
                  {isListening ? (
                    <div className="relative flex items-center justify-center">
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-white animate-ping" />
                      <MicOff className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white animate-bounce" />
                    </div>
                  ) : isTranscribing ? (
                    <Loader2 className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white animate-spin" />
                  ) : (
                    <Mic className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-amber-900 transition-transform group-hover:scale-110" />
                  )}
                </button>

                {/* Text Submit Button */}
                <button
                  id="yojna-mitra-send-btn"
                  type="submit"
                  disabled={!inputMessage.trim() || isLoading || isListening || isTranscribing}
                  aria-label="Send message to Yojna Setu Assistant"
                  className="p-2 sm:p-2.5 bg-blue-950 hover:bg-blue-900 text-white rounded-xl disabled:opacity-40 disabled:hover:bg-blue-950 transition-colors cursor-pointer shrink-0 focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 sm:w-4.5 sm:h-4.5 animate-spin text-amber-300" />
                  ) : (
                    <Send className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-amber-300" />
                  )}
                </button>
              </div>

              <div className="flex flex-col xs:flex-row xs:items-center justify-between text-[9px] sm:text-[10px] text-slate-400 mt-1.5 px-0.5 gap-0.5">
                <span className="flex items-center gap-1 truncate">
                  <Shield className="w-3 h-3 text-emerald-600 shrink-0" />
                  Verified Government Scheme Data
                </span>
                <span className="hidden xs:inline">Type or tap 🎙️ to speak</span>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
