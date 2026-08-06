import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Bot, Send, Mic, Paperclip, User, Search, Copy, Trash2, Check, ExternalLink, ChevronDown, Sparkles } from 'lucide-react';
import { getJSON, setJSON, removeItem } from '../../utils/storage';
import { cn } from '../../utils/cn';
import { useChat } from '../../contexts/ChatContext';
import { useLanguage } from '../../contexts/LanguageContext';
import Badge from '../common/Badge';
import { URGENCY_TONE } from '../../constants/urgency';

// Expandable "AI Analysis" panel — surfaces the pipeline trace
// (detected language, intent, disease category, urgency, confidence)
// behind a canned chatbot reply so the AI's reasoning isn't a black
// box, without cluttering the default chat view.
function AIAnalysisPanel({ analysis }) {
  const [open, setOpen] = useState(false);
  if (!analysis) return null;
  return (
    <div className="mt-2 border-t border-slate-200/50 pt-1.5 text-xs dark:border-white/5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 font-medium text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
      >
        <Sparkles className="h-3 w-3" /> AI Analysis <ChevronDown className={cn('h-3 w-3 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <Badge tone="neutral">Language: {analysis.detectedLanguage.name}</Badge>
          <Badge tone="sky">Intent: {analysis.intent.label}</Badge>
          <Badge tone="neutral">Category: {analysis.diseaseCategory}</Badge>
          <Badge tone={URGENCY_TONE[analysis.urgencyLevel]}>Urgency: {analysis.urgencyLevel}</Badge>
          <Badge tone="neutral">Confidence: {Math.round(analysis.confidence * 100)}%</Badge>
        </div>
      )}
    </div>
  );
}

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

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const { t } = useLanguage();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy — try selecting the text manually.");
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={t('Copy response')}
      className="ml-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-slate-400 opacity-0 transition-opacity hover:text-brand-600 group-hover:opacity-100 dark:hover:text-brand-400 focus:opacity-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-brand-500" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

export default function ChatbotWidget({
  title = 'HealthGuard Assistant',
  subtitle = '● Online',
  storageKey,
  initialMessage = "Hi! How can I help you today?",
  suggestedQuestions = [],
  categories = [],
  onSend,
  sidebarExtra = null,
}) {
  const { t, languageCode } = useLanguage();
  const welcomeMsg = useMemo(() => ({ id: 'welcome', role: 'assistant', content: t(initialMessage) }), [initialMessage, t]);

  const [messages, setMessages] = useState(() => {
    if (storageKey) {
      const saved = getJSON(storageKey, null);
      if (saved && Array.isArray(saved) && saved.length > 0) return saved;
    }
    return [];
  });

  const displayedMessages = useMemo(() => {
    if (messages.length === 0) return [welcomeMsg];
    return messages;
  }, [messages, welcomeMsg]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const { reportMessageCount, markSeen } = useChat();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  }, []);

  useEffect(() => {
    if (storageKey) setJSON(storageKey, messages);
    reportMessageCount(messages.length === 0 ? 1 : messages.length);
  }, [messages, storageKey, reportMessageCount]);

  useEffect(() => {
    markSeen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const send = async (text, category) => {
    const trimmed = text.trim();
    if (!trimmed && !attachedFile) return;
    if (isTyping) return;

    let messageText = trimmed;
    if (attachedFile && !trimmed) {
      messageText = `${t('attached')}: ${attachedFile.name}`;
    }

    const userMsg = {
      id: `u_${Date.now()}`,
      role: 'user',
      content: messageText,
      attachment: attachedFile ? { name: attachedFile.name } : undefined,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setAttachedFile(null);
    setIsTyping(true);

    try {
      const reply = await onSend({ message: messageText, category, topic: category, languageCode });
      setIsTyping(false);

      if (!reply || !reply.content || !reply.content.trim()) {
        setMessages((prev) => [
          ...prev,
          {
            id: `err_${Date.now()}`,
            role: 'assistant',
            content: t("Sorry, I received an empty response. Please try again."),
            isError: true,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: reply.id || `msg_${Date.now()}`,
            role: 'assistant',
            content: reply.content,
            citations: reply.citations,
            confidence: reply.confidence,
            aiAnalysis: reply.aiAnalysis,
          },
        ]);
      }
    } catch (error) {
      setIsTyping(false);
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'assistant',
          content: t("Sorry, there was an error processing your request. Please try again later."),
          isError: true,
        },
      ]);
    }
  };

  const clearChat = () => {
    setMessages([]);
    if (storageKey) removeItem(storageKey);
    setSearchQuery('');
    setSearchOpen(false);
    toast.success(t('Chat cleared'));
  };

  const silenceTimerRef = useRef(null);

  const resetSilenceTimeout = (rec) => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(() => {
      if (rec) {
        try {
          rec.stop();
        } catch (e) {
          console.error(e);
        }
      }
      setIsRecording(false);
      toast(t('Speech recognition timed out due to silence.'), { id: 'voice-toast', icon: '📴' });
    }, 5000);
  };

  const handleVoiceClick = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error(t('Speech recognition is not supported in this browser. Please try Chrome or Edge.'));
      return;
    }

    if (isRecording) {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = false;

      let recLang = 'en-US';
      if (languageCode === 'ta') recLang = 'ta-IN';
      else if (languageCode === 'hi') recLang = 'hi-IN';
      else if (languageCode === 'or') recLang = 'or-IN';
      rec.lang = recLang;

      rec.onstart = () => {
        setIsRecording(true);
        resetSilenceTimeout(rec);
        toast(t('Listening...'), { id: 'voice-toast', icon: '🎙️', duration: 3000 });
      };

      rec.onresult = (event) => {
        resetSilenceTimeout(rec);
        const currentIndex = event.resultIndex;
        const transcript = event.results[currentIndex][0].transcript;
        if (transcript) {
          setInput((prev) => prev + (prev ? ' ' : '') + transcript);
        }
      };

      rec.onerror = (e) => {
        console.error(e);
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        if (e.error === 'not-allowed') {
          toast.error(t('Microphone permission denied. Please allow microphone access in settings.'), { id: 'voice-toast' });
        } else if (e.error === 'no-speech') {
          toast.error(t('No speech detected. Please speak louder.'), { id: 'voice-toast' });
        } else {
          toast.error(`${t('Voice recognition error')}: ${e.error}`, { id: 'voice-toast' });
        }
        setIsRecording(false);
      };

      rec.onend = () => {
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        setIsRecording(false);
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      console.error(err);
      toast.error('Failed to start speech recognition.');
      setIsRecording(false);
    }
  };

  const handleFileClick = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile({
        name: file.name,
        size: file.size,
        type: file.type,
      });
      toast.success(`"${file.name}" ${t('attached')}`);
    }
    e.target.value = '';
  };

  const visibleMessages = searchQuery.trim()
    ? displayedMessages.filter((m) => m.content.toLowerCase().includes(searchQuery.trim().toLowerCase()))
    : displayedMessages;

  return (
    <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_280px]">
      <div className="glass-panel flex h-[38rem] flex-col overflow-hidden p-0">
        <div className="flex items-center justify-between gap-2 border-b border-slate-200/70 px-5 py-3.5 dark:border-white/10">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-white">
              <Bot className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{t(title)}</p>
              <p className="text-xs text-brand-600 dark:text-brand-400">
                {subtitle.startsWith('●') ? `● ${t(subtitle.substring(2).trim())}` : t(subtitle)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              aria-label={t('Search chat')}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-brand-500',
                searchOpen && 'bg-slate-100 text-brand-600 dark:bg-white/5 dark:text-brand-400'
              )}
            >
              <Search className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={clearChat}
              aria-label={t('Clear chat')}
              className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-signal-rose/10 hover:text-signal-rose focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-b border-slate-200/70 dark:border-white/10"
            >
              <div className="px-4 py-2.5">
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('Search this conversation…')}
                  className="input-field py-1.5 text-base"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {visibleMessages.length === 0 && (
            <p className="pt-6 text-center text-sm text-slate-400">{t('No messages match your search.')}</p>
          )}
          {visibleMessages.map((m) => (
            <div key={m.id} className={cn('group flex items-start gap-3', m.role === 'user' && 'flex-row-reverse')}>
              <span
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                  m.role === 'user' ? 'bg-slate-200 dark:bg-white/10' : 'bg-brand-500/15 text-brand-600 dark:text-brand-400'
                )}
              >
                {m.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </span>
              <div
                className={cn(
                  'relative flex max-w-[85%] flex-col rounded-2xl px-4 py-3 text-base whitespace-pre-wrap break-words shadow-sm',
                  m.role === 'user'
                    ? 'bg-brand-500 text-white'
                    : m.isError
                    ? 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/20 dark:text-rose-200 dark:border-rose-900/30'
                    : 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200'
                )}
              >
                <span>{m.content}</span>
                {m.attachment && (
                  <div className="mt-1.5 flex items-center gap-1.5 rounded bg-black/10 px-2.5 py-1 text-sm text-white/90">
                    <Paperclip className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate max-w-[180px]">{m.attachment.name}</span>
                  </div>
                )}
                {m.confidence !== undefined && (
                  <div className="mt-2 text-xs text-slate-400 dark:text-slate-300 flex items-center gap-1.5 border-t border-slate-200/50 dark:border-white/5 pt-1.5">
                    <span>{t('Confidence')}:</span>
                    <span className="font-semibold text-brand-600 dark:text-brand-400">{(m.confidence * 100).toFixed(0)}%</span>
                  </div>
                )}
                {m.citations && m.citations.length > 0 && (
                  <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex flex-col gap-1 border-t border-slate-200/50 dark:border-white/5 pt-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{t('Sources')}:</span>
                    <ul className="list-inside list-disc space-y-1">
                      {m.citations.map((c, idx) => (
                        <li key={idx}>
                          {c.url ? (
                            <a
                              href={c.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-brand-600 dark:text-brand-400 hover:underline"
                            >
                              {t(c.title)} <ExternalLink className="h-3 w-3 inline" />
                            </a>
                          ) : (
                            <span>{t(c.title)}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {m.aiAnalysis && <AIAnalysisPanel analysis={m.aiAnalysis} />}
                {m.role === 'assistant' && !m.isError && (
                  <div className="absolute right-2 top-2">
                    <CopyButton text={m.content} />
                  </div>
                )}
              </div>
            </div>
          ))}
          <AnimatePresence>
            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-500/15 text-brand-600 dark:text-brand-400">
                  <Bot className="h-4 w-4" />
                </span>
                <span className="rounded-2xl bg-slate-100 px-4 py-3 dark:bg-white/10">
                  <TypingDots />
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {suggestedQuestions.length > 0 && (
          <div className="flex gap-2 overflow-x-auto border-t border-slate-200/70 px-5 py-3 dark:border-white/10">
            {suggestedQuestions.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => send(q)}
                className="shrink-0 rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:border-brand-400 hover:text-brand-600 dark:border-white/10 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
              >
                {t(q)}
              </button>
            ))}
          </div>
        )}

        {attachedFile && (
          <div className="flex items-center gap-2 border-t border-slate-200/70 bg-slate-50/50 px-5 py-2 dark:border-white/10 dark:bg-white/[0.02]">
            <span className="flex items-center gap-1.5 rounded-full bg-brand-500/10 px-3 py-1 text-sm font-medium text-brand-700 dark:bg-brand-500/15 dark:text-brand-400 border border-brand-500/20">
              <Paperclip className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate max-w-[200px]">{attachedFile.name}</span>
              <span className="text-xs text-slate-400">({(attachedFile.size / 1024).toFixed(1)} KB)</span>
              <button
                type="button"
                onClick={() => setAttachedFile(null)}
                className="ml-1 text-slate-400 hover:text-signal-rose focus:outline-none font-bold text-base cursor-pointer"
                aria-label={t('Remove attachment')}
              >
                &times;
              </button>
            </span>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-2 border-t border-slate-200/70 px-4 py-3 dark:border-white/10 bg-white/50 dark:bg-surface-darkcard/50 backdrop-blur-sm"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf,.doc,.docx,.txt"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={handleFileClick}
            aria-label={t('Attach a file (UI preview)')}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-brand-500 dark:hover:bg-white/5 dark:hover:text-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
          >
            <Paperclip className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={handleVoiceClick}
            aria-label={isRecording ? t("Stop voice input") : t("Voice input (UI preview)")}
            className={cn(
              "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-brand-500 dark:hover:bg-white/5 dark:hover:text-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer",
              isRecording && "bg-signal-rose text-white hover:bg-signal-rose hover:text-white dark:hover:bg-signal-rose"
            )}
          >
            {isRecording && (
              <motion.span
                className="absolute inset-0 rounded-full bg-signal-rose"
                animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
                transition={{ duration: 1.4, repeat: Infinity }}
              />
            )}
            <Mic className="h-5 w-5 relative z-10" />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('Type your question…')}
            className="input-field flex-1 py-2.5 text-base"
            disabled={isTyping}
          />
          <button
            type="submit"
            aria-label={t('Send')}
            disabled={isTyping || (!input.trim() && !attachedFile)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white hover:bg-brand-600 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-40 disabled:scale-100 disabled:pointer-events-none cursor-pointer"
          >
            <Send className="h-4.5 w-4.5" />
          </button>
        </form>
      </div>

      {(categories.length > 0 || sidebarExtra) && (
        <div className="space-y-4">
          {categories.length > 0 && (
            <div className="surface-card p-5">
              <p className="text-base font-semibold text-slate-900 dark:text-white">{t('Topics')}</p>
              <div className="mt-3 flex flex-col gap-2">
                {categories.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => send(c.prompt, c.key)}
                    className="flex items-center gap-2.5 rounded-lg border border-slate-200 px-3 py-2.5 text-left text-base font-medium text-slate-600 hover:border-brand-300 hover:text-brand-600 dark:border-white/10 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
                  >
                    {c.icon && <c.icon className="h-4 w-4 shrink-0" />}
                    {t(c.label)}
                  </button>
                ))}
              </div>
            </div>
          )}
          {typeof sidebarExtra === 'function' ? React.createElement(sidebarExtra, { send }) : sidebarExtra}
        </div>
      )}
    </div>
  );
}
