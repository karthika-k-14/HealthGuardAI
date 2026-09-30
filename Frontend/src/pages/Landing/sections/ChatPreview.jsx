import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, Mic, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { fetchSuggestedQuestions } from '../../../api/landingApi';
import { sendChatMessage } from '../../../api/chatbotApi';
import { cn } from '../../../utils/cn';

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-slate-500"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </span>
  );
}

export default function ChatPreview() {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [suggested, setSuggested] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef(null);
  const recognitionRef = useRef(null);

  // Reset welcome message when language changes
  useEffect(() => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: t('chat_welcome_message'),
    }]);
  }, [i18n.language, t]);

  useEffect(() => {
    fetchSuggestedQuestions().then(setSuggested);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }
    };
  }, []);

  const toggleVoiceInput = async () => {
    if (isListening) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error(t('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.'));
      return;
    }

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const testStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        testStream.getTracks().forEach((trk) => trk.stop());
      }
    } catch (permErr) {
      console.warn('Microphone permission check failed:', permErr);
      if (permErr.name === 'NotAllowedError' || permErr.name === 'PermissionDeniedError') {
        toast.error(t('Microphone permission blocked. Please enable microphone access in your browser address bar.'));
      } else if (permErr.name === 'NotFoundError' || permErr.name === 'DevicesNotFoundError') {
        toast.error(t('No microphone found. Please connect a microphone.'));
      } else {
        toast.error(t('Could not access microphone: ' + (permErr.message || 'Unknown error')));
      }
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;

      const langMap = { ta: 'ta-IN', hi: 'hi-IN', or: 'or-IN' };
      rec.lang = langMap[i18n.language] || 'en-IN';

      rec.onstart = () => {
        setIsListening(true);
        toast.success(t('Listening... Speak now'), { id: 'chat-preview-mic' });
      };

      rec.onresult = (e) => {
        let transcript = '';
        for (let i = 0; i < e.results.length; i++) {
          transcript += e.results[i][0].transcript;
        }
        if (transcript) {
          setInput(transcript);
        }
      };

      rec.onerror = (e) => {
        console.warn('ChatPreview mic error:', e.error);
        if (e.error === 'no-speech') {
          // ignore
        } else if (e.error === 'not-allowed') {
          toast.error(t('Microphone permission denied.'), { id: 'chat-preview-mic' });
        } else if (e.error === 'network') {
          toast.error(t('Speech recognition service offline or unreachable.'), { id: 'chat-preview-mic' });
        }
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      console.error('Failed to start recognition:', err);
      toast.error(t('Failed to start voice input'));
      setIsListening(false);
    }
  };

  const send = async (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (isListening) {
      try { recognitionRef.current?.stop(); } catch (e) {}
      setIsListening(false);
    }
    const userMsg = { id: `u_${Date.now()}`, role: 'user', content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const reply = await sendChatMessage(trimmed, i18n.language);
    setIsTyping(false);
    setMessages((prev) => [...prev, { id: reply.id, role: 'assistant', content: reply.content }]);
  };

  return (
    <section id="ai-assistant" className="px-6 py-16 sm:px-8">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="section-eyebrow">
            <Bot className="h-3.5 w-3.5" /> {t('AI Assistant')}
          </span>
          <h2 className="mt-3 font-display text-3xl font-semibold text-slate-900 dark:text-white">
            {t('chat_preview_heading')}
          </h2>
          <p className="mt-4 max-w-md text-sm text-slate-500 dark:text-slate-400">
            {t('chat_preview_description')}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="glass-panel flex h-[26rem] flex-col overflow-hidden p-0"
        >
          <div className="flex items-center gap-2 border-b border-slate-200/70 px-5 py-3.5 dark:border-white/10">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-white">
              <Bot className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('HealthGuard Assistant')}</p>
              <p className="text-xs text-brand-600 dark:text-brand-400">● {t('Online')}</p>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
            {messages.map((m) => (
              <div key={m.id} className={cn('flex items-end gap-2', m.role === 'user' && 'flex-row-reverse')}>
                <span
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
                    m.role === 'user' ? 'bg-slate-200 dark:bg-white/10' : 'bg-brand-500/15 text-brand-600 dark:text-brand-400'
                  )}
                >
                  {m.role === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                </span>
                <p
                  className={cn(
                    'max-w-[75%] rounded-2xl px-3.5 py-2 text-sm',
                    m.role === 'user'
                      ? 'bg-brand-500 text-white'
                      : 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200'
                  )}
                >
                  {m.content}
                </p>
              </div>
            ))}
            <AnimatePresence>
              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-500/15 text-brand-600 dark:text-brand-400">
                    <Bot className="h-3.5 w-3.5" />
                  </span>
                  <span className="rounded-2xl bg-slate-100 px-3.5 py-2 dark:bg-white/10">
                    <TypingDots />
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {suggested.length > 0 && (
            <div className="flex gap-2 overflow-x-auto border-t border-slate-200/70 px-5 py-3 dark:border-white/10">
              {suggested.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => send(t(q))}
                  className="shrink-0 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-brand-400 hover:text-brand-600 dark:border-white/10 dark:text-slate-300"
                >
                  {t(q)}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => { e.preventDefault(); send(input); }}
            className="flex items-center gap-2 border-t border-slate-200/70 px-4 py-3 dark:border-white/10"
          >
            <button
              type="button"
              id="landing-chat-mic-btn"
              aria-label={isListening ? t('Stop voice input') : t('Voice input')}
              title={isListening ? t('Stop voice input') : t('Voice input')}
              className={cn(
                "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors cursor-pointer",
                isListening
                  ? "bg-rose-500 text-white shadow-md shadow-rose-500/30"
                  : "text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/5 dark:hover:text-slate-200"
              )}
              onClick={toggleVoiceInput}
            >
              {isListening && (
                <motion.span
                  className="absolute inset-0 rounded-full bg-rose-500"
                  animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}
              <Mic className={cn("h-4 w-4 relative z-10", isListening && "animate-pulse")} />
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('Type your question…')}
              className="input-field flex-1 py-2"
            />
            <button
              type="submit"
              aria-label={t('Send')}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white hover:bg-brand-600"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
