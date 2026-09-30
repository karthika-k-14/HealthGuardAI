import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Bot, Send, Mic, Paperclip, User, Search, Copy, Trash2, Check, ExternalLink, ChevronDown, Sparkles, Utensils } from 'lucide-react';
import { getJSON, setJSON, removeItem } from '../../utils/storage';
import { cn } from '../../utils/cn';
import { useChat } from '../../contexts/ChatContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCaseContext } from '../../contexts/CaseContext';
import Badge from '../common/Badge';
import { URGENCY_TONE } from '../../constants/urgency';
import { PATHS } from '../../constants/routes';
import { isValidAssessment } from '../../utils/assessmentUtils';

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

function speakText(text, languageCode = 'en') {
  if (!('speechSynthesis' in window) || !text) return;
  try {
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#•]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    let lang = 'en-US';
    if (languageCode === 'ta' || /[\u0B80-\u0BFF]/.test(cleanText)) lang = 'ta-IN';
    else if (languageCode === 'hi' || /[\u0900-\u097F]/.test(cleanText)) lang = 'hi-IN';
    else if (languageCode === 'or') lang = 'or-IN';
    else lang = 'en-IN';
    utterance.lang = lang;
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.error('Speech synthesis error:', e);
  }
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
  actionButtonText = 'Analyze Symptoms & Check Risk',
}) {
  const { t, languageCode } = useLanguage();
  const caseContext = useCaseContext();
  const updateAssessment = caseContext?.updateAssessment;
  const welcomeMsg = useMemo(() => ({ id: 'welcome', role: 'assistant', content: t(initialMessage) }), [initialMessage, t]);

  const lastFacilityRef = useRef(null);

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
  const [audioLevel, setAudioLevel] = useState(0);

  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const audioStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const { reportMessageCount, markSeen } = useChat();

  // Cleanup media/audio tracks on component unmount
  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.abort();
      } catch (e) {}
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        try {
          audioContextRef.current.close();
        } catch (e) {}
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

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

  const send = async (text, category, overrideLang) => {
    const trimmed = text.trim();
    if (!trimmed && !attachedFile) return;
    if (isTyping) return;

    let messageText = trimmed;
    if (attachedFile && !trimmed) {
      messageText = `${t('attached')}: ${attachedFile.name}`;
    }

    const lower = messageText.toLowerCase();

    // Auto-detect language: Tamil script [\u0B80-\u0BFF], Hindi script [\u0900-\u097F], or overrideLang
    let effectiveLang = overrideLang || languageCode;
    if (/[\u0B80-\u0BFF]/.test(messageText) || voiceLang === 'ta-IN') {
      effectiveLang = 'ta';
    } else if (/[\u0900-\u097F]/.test(messageText) || voiceLang === 'hi-IN') {
      effectiveLang = 'hi';
    }

    const userMsg = {
      id: `u_${Date.now()}`,
      role: 'user',
      content: messageText,
      attachment: attachedFile ? { name: attachedFile.name } : undefined,
    };

    const imageBase64ToSend = attachedFile?.data || null;

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setAttachedFile(null);
    setIsTyping(true);

    try {
      const reply = await onSend({ message: messageText, category, topic: category, languageCode: effectiveLang, imageBase64: imageBase64ToSend });
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
        if (reply.facilityName || reply.phone || reply.navigationUrl) {
          lastFacilityRef.current = {
            facilityName: reply.facilityName,
            phone: reply.phone,
            navigationUrl: reply.navigationUrl,
          };
        }

        const safeRisk = typeof reply.riskScore === 'number'
          ? Math.min(100, Math.max(0, Math.round(reply.riskScore)))
          : null;

        setMessages((prev) => [
          ...prev,
          {
            id: reply.id || `msg_${Date.now()}`,
            role: 'assistant',
            content: reply.content,
            clinicalSummary: reply.clinicalSummary || null,
            diseaseCategory: reply.diseaseCategory || null,
            urgencyLevel: reply.urgencyLevel || null,
            riskScore: safeRisk,
            queryType: reply.queryType || null,
            isDoctorFollowUp: Boolean(reply.isDoctorFollowUp),
            stage: reply.stage || null,
            quickReplies: Array.isArray(reply.quickReplies) ? reply.quickReplies : [],
            extractedSymptoms: Array.isArray(reply.extractedSymptoms) ? reply.extractedSymptoms : [],
            recommendations: Array.isArray(reply.recommendations) ? reply.recommendations : [],
            emergencyEscalated: Boolean(reply.emergencyEscalated),
            escalationStatus: reply.escalationStatus || (reply.emergencyEscalated ? 'Activated' : null),
            assignedWorker: reply.assignedWorker || reply.assignedAshaName || null,
            timestamp: reply.timestamp || new Date().toISOString(),
            citations: reply.citations,
            confidence: reply.confidence != null ? reply.confidence : null,
            aiAnalysis: reply.aiAnalysis,
            actionLinks: reply.actionLinks,
            isEmergency: Boolean(reply.emergencyEscalated) || reply.urgencyLevel === 'CRITICAL',
          },
        ]);

        speakText(reply.content, effectiveLang);
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

  const handleAssessSymptoms = (customSymptomsText = '') => {
    const textToAssess = (customSymptomsText || input).trim();
    if (!textToAssess) {
      toast.error(t('Please enter your symptoms to analyze.'));
      return;
    }
    send(textToAssess);
  };

  const clearChat = () => {
    setMessages([]);
    if (storageKey) removeItem(storageKey);
    setSearchQuery('');
    setSearchOpen(false);
    toast.success(t('Chat cleared'));
  };



  const [voiceLang, setVoiceLang] = useState(() => {
    if (languageCode === 'ta') return 'ta-IN';
    if (languageCode === 'hi') return 'hi-IN';
    if (languageCode === 'or') return 'or-IN';
    return 'en-IN';
  });

  // Keep voice language in sync with app language
  useEffect(() => {
    if (languageCode === 'ta') setVoiceLang('ta-IN');
    else if (languageCode === 'hi') setVoiceLang('hi-IN');
    else if (languageCode === 'or') setVoiceLang('or-IN');
    else setVoiceLang('en-IN');
  }, [languageCode]);

  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');

  const isRecordingRef = useRef(false);

  const startVoiceRecording = async (targetLang) => {
    const selectedLang = targetLang || voiceLang || 'en-IN';

    // 1. First ensure microphone stream & hardware permission via getUserMedia
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioStreamRef.current = stream;

        // Set up real-time audio volume analyser for soundbars visualizer
        try {
          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          if (AudioContextClass) {
            const ctx = new AudioContextClass();
            audioContextRef.current = ctx;
            const source = ctx.createMediaStreamSource(stream);
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 64;
            source.connect(analyser);
            analyserRef.current = analyser;

            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            const updateMeter = () => {
              if (!isRecordingRef.current) return;
              analyser.getByteFrequencyData(dataArray);
              let sum = 0;
              for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
              const avg = sum / (dataArray.length || 1);
              setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
              animFrameRef.current = requestAnimationFrame(updateMeter);
            };
            animFrameRef.current = requestAnimationFrame(updateMeter);
          }
        } catch (visErr) {
          console.warn('AudioContext visualizer not available:', visErr);
        }
      }
    } catch (permErr) {
      console.error('Microphone permission check failed:', permErr);
      if (permErr.name === 'NotAllowedError' || permErr.name === 'PermissionDeniedError') {
        toast.error(t('Microphone permission blocked. Please enable Microphone in your browser address bar settings.'), { id: 'voice-toast' });
      } else if (permErr.name === 'NotFoundError' || permErr.name === 'DevicesNotFoundError') {
        toast.error(t('No microphone hardware detected. Please plug in a microphone.'), { id: 'voice-toast' });
      } else {
        toast.error(t('Microphone error: ' + (permErr.message || 'Unable to access audio device.')), { id: 'voice-toast' });
      }
      setIsRecording(false);
      isRecordingRef.current = false;
      return;
    }

    // 2. Launch Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error(t('Speech recognition is not supported in this browser. Please use Google Chrome, Microsoft Edge, or Safari.'), { id: 'voice-toast' });
      // Keep mic indicator active so user knows hardware mic is working
      isRecordingRef.current = true;
      setIsRecording(true);
      return;
    }

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }

      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = selectedLang;

      rec.onstart = () => {
        isRecordingRef.current = true;
        setIsRecording(true);
        const langName = selectedLang === 'ta-IN' ? 'தமிழ்' : selectedLang === 'hi-IN' ? 'हिन्दी' : selectedLang === 'or-IN' ? 'ଓଡ଼ିଆ' : 'English';
        toast.success(`Microphone active: Listening in ${langName}`, { id: 'voice-toast' });
      };

      rec.onresult = (event) => {
        let finalStr = '';
        let interimStr = '';
        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          const transcript = res[0]?.transcript || '';
          if (res.isFinal) {
            finalStr += transcript + ' ';
          } else {
            interimStr += transcript;
          }
        }
        setVoiceTranscript(finalStr.trim());
        setInterimTranscript(interimStr.trim());
        const total = (finalStr + ' ' + interimStr).trim();
        if (total) {
          setInput(total);
        }
      };

      rec.onerror = (e) => {
        console.warn('Speech recognition event:', e.error);
        if (e.error === 'no-speech') return; // Silence pause, do not stop
        if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
          toast.error(t('Microphone permission denied in browser settings.'), { id: 'voice-toast' });
          handleStopVoice();
        } else if (e.error === 'network') {
          toast.error(t('Speech recognition service offline or unreachable. Please speak clearly or type directly.'), { id: 'voice-toast' });
          handleStopVoice();
        } else if (e.error === 'audio-capture') {
          toast.error(t('No microphone hardware detected or audio capture failed.'), { id: 'voice-toast' });
          handleStopVoice();
        } else if (e.error !== 'aborted') {
          toast.error(`Speech recognition: ${e.error}`, { id: 'voice-toast' });
          handleStopVoice();
        }
      };

      rec.onend = () => {
        if (isRecordingRef.current) {
          // If still marked as recording, restart with a new instance to avoid InvalidStateError
          try {
            const nextRec = new SpeechRecognition();
            nextRec.continuous = true;
            nextRec.interimResults = true;
            nextRec.lang = selectedLang;
            nextRec.onresult = rec.onresult;
            nextRec.onerror = rec.onerror;
            nextRec.onend = rec.onend;
            recognitionRef.current = nextRec;
            nextRec.start();
          } catch (restartErr) {
            console.warn('Speech recognition restart:', restartErr);
          }
        } else {
          setIsRecording(false);
        }
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      console.error('Speech recognition exception:', err);
      toast.error('Failed to start speech recognition. Please check microphone.');
      isRecordingRef.current = false;
      setIsRecording(false);
    }
  };

  const handleVoiceClick = () => {
    if (isRecording) {
      handleStopVoice();
    } else {
      setVoiceTranscript('');
      setInterimTranscript('');
      startVoiceRecording(voiceLang);
    }
  };

  const handleStopVoice = () => {
    isRecordingRef.current = false;
    try {
      recognitionRef.current?.stop();
    } catch (e) {}
    recognitionRef.current = null;

    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((t) => t.stop());
      audioStreamRef.current = null;
    }
    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch (e) {}
      audioContextRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setAudioLevel(0);
    setIsRecording(false);
  };

  const handleCancelVoice = () => {
    handleStopVoice();
    setVoiceTranscript('');
    setInterimTranscript('');
    setInput('');
    toast('Voice input cancelled', { icon: '✖️' });
  };

  const handleSendVoice = () => {
    handleStopVoice();
    const textToSend = (voiceTranscript + ' ' + interimTranscript).trim() || input.trim();
    if (textToSend) {
      const activeCode = voiceLang === 'ta-IN' ? 'ta' : voiceLang === 'hi-IN' ? 'hi' : voiceLang === 'or-IN' ? 'or' : 'en';
      send(textToSend, null, activeCode);
      setVoiceTranscript('');
      setInterimTranscript('');
    }
  };

  const changeVoiceLanguage = (newLang) => {
    setVoiceLang(newLang);
    if (isRecording) {
      handleStopVoice();
      setTimeout(() => {
        startVoiceRecording(newLang);
      }, 250);
    }
  };

  const handleFileClick = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedFile({
          name: file.name,
          size: file.size,
          type: file.type,
          data: reader.result,
        });
        toast.success(`"${file.name}" ${t('attached')}`);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const visibleMessages = searchQuery.trim()
    ? displayedMessages.filter((m) => m.content.toLowerCase().includes(searchQuery.trim().toLowerCase()))
    : displayedMessages;

  return (
    <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1fr_420px]">
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
                    : m.emergencyAlert || m.riskLevel === 'EMERGENCY'
                    ? 'bg-rose-50 text-rose-900 border-2 border-rose-500 dark:bg-rose-950/40 dark:text-rose-100'
                    : 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200'
                )}
              >
                {(m.emergencyAlert || m.riskLevel === 'EMERGENCY') && (
                  <div className="mb-2.5 flex items-center gap-2 rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-bold text-white shadow animate-pulse">
                    <span>🚨 EMERGENCY RISK DETECTED</span>
                  </div>
                )}
                {(m.isTriage || m.emergencyAlert || (m.riskLevel && m.riskLevel !== 'LOW')) && m.currentStage && (
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold">
                    <span className="text-brand-600 dark:text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-md font-mono text-[11px] border border-brand-500/20">
                      🔄 {m.currentStage.replace(/_/g, ' ')}
                    </span>
                  </div>
                )}
                {(m.isTriage || m.emergencyAlert || (m.riskLevel && m.riskLevel !== 'LOW')) && m.riskLevel && (
                  <div className="mb-2 flex items-center gap-2 text-xs font-bold">
                    <span className="text-slate-500 dark:text-slate-400">Risk Classification:</span>
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-full text-xs font-bold",
                      (m.riskLevel === 'EMERGENCY' || m.riskLevel.includes('EMERGENCY')) && "bg-rose-600 text-white animate-pulse",
                      (m.riskLevel === 'HIGH' || m.riskLevel.includes('HIGH')) && "bg-rose-500 text-white",
                      (m.riskLevel === 'MODERATE' || m.riskLevel.includes('MODERATE')) && "bg-amber-500 text-slate-900",
                      (m.riskLevel === 'LOW' || m.riskLevel.includes('LOW')) && "bg-emerald-500 text-white"
                    )}>
                      {(m.riskLevel === 'EMERGENCY' || m.riskLevel.includes('EMERGENCY')) ? '🚨 EMERGENCY' :
                       (m.riskLevel === 'HIGH' || m.riskLevel.includes('HIGH')) ? '🔴 HIGH' :
                       (m.riskLevel === 'MODERATE' || m.riskLevel.includes('MODERATE')) ? '🟡 MODERATE' : '🟢 LOW'}
                    </span>
                  </div>
                )}

                {/* Informational Guidance Badge — NO confidence, NO risk score, NO urgency */}
                {(['DISEASE_AWARENESS', 'PREVENTION', 'FACILITY', 'INFORMATIONAL', 'GENERAL_INFO'].includes(m.queryType) || (m.urgencyLevel == null && m.riskScore == null && !m.isDoctorFollowUp)) && (
                  <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-[11px] font-bold text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                      📖 Disease Guidance & Health Knowledge
                    </span>
                    {m.diseaseCategory && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-0.5 text-[11px] font-bold text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                        🔬 {m.diseaseCategory}
                      </span>
                    )}
                  </div>
                )}

                {/* Doctor Follow-Up Consultation in Progress Badge */}
                {m.isDoctorFollowUp && (
                  <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-700/60">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      🩺 Doctor Consultation ({m.stage ? `Question ${m.stage} of 3` : 'Follow-up Intake'})
                    </span>
                  </div>
                )}

                {/* Clinical AI Assessment Badges — rendered ONLY for final clinical triage evaluations */}
                {!['DISEASE_AWARENESS', 'PREVENTION', 'FACILITY', 'INFORMATIONAL', 'GENERAL_INFO'].includes(m.queryType) && !m.isDoctorFollowUp && (m.urgencyLevel || m.riskScore != null) && (
                  <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
                    {m.diseaseCategory && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-0.5 text-[11px] font-bold text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                        🔬 {m.diseaseCategory}
                      </span>
                    )}
                    {m.confidence != null && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        📈 Confidence: {Math.round(m.confidence <= 1.0 ? m.confidence * 100 : m.confidence)}%
                      </span>
                    )}
                    {m.urgencyLevel && (
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        m.urgencyLevel === 'CRITICAL' ? 'bg-rose-600 text-white animate-pulse' :
                        m.urgencyLevel === 'HIGH'     ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300' :
                        m.urgencyLevel === 'MEDIUM'   ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' :
                                                        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                      }`}>
                        {m.urgencyLevel === 'CRITICAL' ? '🚨' : m.urgencyLevel === 'HIGH' ? '🔴' : m.urgencyLevel === 'MEDIUM' ? '🟡' : '🟢'} {m.urgencyLevel}
                      </span>
                    )}
                    {m.riskScore != null && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                        📊 Risk Score: {Math.min(100, Math.max(0, Math.round(m.riskScore)))}/100
                      </span>
                    )}
                  </div>
                )}

                {/* Extracted Symptoms List */}
                {m.extractedSymptoms && m.extractedSymptoms.length > 0 && !['DISEASE_AWARENESS', 'PREVENTION', 'FACILITY', 'INFORMATIONAL', 'GENERAL_INFO'].includes(m.queryType) && (
                  <div className="mb-2.5 flex flex-wrap items-center gap-1.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.04] p-2 border border-slate-200/50 dark:border-white/5">
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Identified Symptoms:</span>
                    {m.extractedSymptoms.map((sym, idx) => (
                      <span key={idx} className="inline-flex items-center rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-800 dark:text-amber-200 border border-amber-500/20">
                        {sym}
                      </span>
                    ))}
                  </div>
                )}

                {/* Clinical Summary Block — ONLY shown for clinical evaluations, NEVER for informational queries */}
                {m.clinicalSummary && !['DISEASE_AWARENESS', 'PREVENTION', 'FACILITY', 'INFORMATIONAL', 'GENERAL_INFO'].includes(m.queryType) && !m.isDoctorFollowUp && (
                  <div className="mb-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/20 p-2.5 border border-blue-200/60 dark:border-blue-900/30 text-xs">
                    <p className="font-bold text-blue-900 dark:text-blue-200 mb-0.5">🩺 Clinical Assessment Summary</p>
                    <p className="text-blue-800 dark:text-blue-300 leading-relaxed">{m.clinicalSummary}</p>
                  </div>
                )}

                <span className="whitespace-pre-line">{m.content}</span>

                {/* Interactive Quick Replies for Doctor Follow-up Questions */}
                {m.quickReplies && m.quickReplies.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200/50 dark:border-white/10">
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
                      <span>🩺</span> Doctor's quick reply options:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {m.quickReplies.map((qr, qIdx) => (
                        <button
                          key={qIdx}
                          type="button"
                          onClick={() => send(qr)}
                          className="rounded-full border border-brand-500/30 bg-white/95 dark:bg-slate-800/90 hover:bg-brand-50 hover:border-brand-500 dark:hover:bg-brand-950/40 px-3 py-1.5 text-xs font-semibold text-brand-700 dark:text-brand-300 transition-all shadow-2xs hover:scale-[1.02] active:scale-[0.98]"
                        >
                          {qr}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Clinical Recommendations */}
                {m.recommendations && m.recommendations.length > 0 && !m.isDoctorFollowUp && (
                  <div className="mt-2.5 border-t border-slate-200/50 pt-2 dark:border-white/5">
                    <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Clinical Recommendations</p>
                    <ul className="space-y-1">
                      {m.recommendations.slice(0, 5).map((rec, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                          <span className="mt-0.5 text-brand-500 font-bold">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Emergency Escalation Status Banner */}
                {m.emergencyEscalated && (
                  <div className="mt-3 rounded-xl border-2 border-rose-500/60 bg-rose-500/10 p-3 text-xs dark:bg-rose-950/40 dark:border-rose-700/60 shadow-sm">
                    <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-bold">
                      <span className="animate-pulse text-sm">⚠</span> Emergency Escalation Activated
                    </div>
                    <div className="mt-1.5 space-y-1 text-[11.5px] text-slate-700 dark:text-slate-200">
                      <p><span className="font-semibold text-slate-900 dark:text-white">Assigned Worker:</span> {m.assignedWorker || m.assignedAshaName || 'Assigned ASHA Worker & PHC Medical Team'}</p>
                      <p><span className="font-semibold text-slate-900 dark:text-white">Current Status:</span> {m.escalationStatus || 'Dispatched for Priority Follow-up'}</p>
                    </div>
                  </div>
                )}

                {/* Message Timestamp */}
                {m.timestamp && (
                  <div className="mt-2 text-[10px] text-slate-400 dark:text-slate-500 text-right">
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
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
                {m.actionLinks && m.actionLinks.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-200/50 pt-2 dark:border-white/10">
                    {m.actionLinks.map((link, idx) => {
                      const isExternal = link.url?.startsWith('http') || link.url?.startsWith('tel');
                      return isExternal ? (
                        <a
                          key={idx}
                          href={link.url}
                          target={link.url.startsWith('http') ? '_blank' : '_self'}
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-bold transition-all shadow-sm cursor-pointer"
                        >
                          <Utensils className="h-3.5 w-3.5" />
                          <span>{link.label}</span>
                        </a>
                      ) : (
                        <Link
                          key={idx}
                          to={link.url}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-bold transition-all shadow-sm cursor-pointer"
                        >
                          <Utensils className="h-3.5 w-3.5" />
                          <span>{link.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
                {m.isAssessment && isValidAssessment(m.assessment) && (
                  <div className="mt-3 border-t border-slate-200/50 pt-2.5 dark:border-white/10">
                    <Link
                      to={PATHS.CITIZEN_ANALYTICS}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-bold transition-all shadow-sm cursor-pointer"
                    >
                      <Utensils className="h-3.5 w-3.5" />
                      <span>Generate Nutrition Plan</span>
                    </Link>
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

        {suggestedQuestions && suggestedQuestions.length > 0 && (
          <div className="flex items-center justify-between gap-2 overflow-x-auto border-t border-slate-200/70 px-5 py-2.5 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
            <div className="flex gap-2 overflow-x-auto">
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => send(q)}
                  className="shrink-0 rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:border-brand-400 hover:text-brand-600 dark:border-white/10 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
                >
                  {t(q)}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => handleAssessSymptoms()}
              className="shrink-0 flex items-center gap-1.5 rounded-full bg-brand-600 text-white px-3.5 py-1.5 text-xs font-bold shadow-sm hover:bg-brand-700 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
            >
              🩺 {t(actionButtonText)}
            </button>
          </div>
        )}

        {/* ChatGPT-style Audio Voice Recording Interface */}
        {isRecording && (
          <div className="border-t border-brand-500/30 bg-gradient-to-r from-brand-500/10 via-purple-500/10 to-brand-500/10 p-4 backdrop-blur-md">
            <div className="flex flex-col gap-3">
              {/* Header: Waveform Soundbars + Language Selector */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 h-7 px-1.5 rounded-lg bg-black/10 dark:bg-white/5">
                    {[10, 20, 14, 28, 18, 26, 12, 22].map((baseH, idx) => {
                      const dynamicH = audioLevel > 0
                        ? Math.max(5, Math.min(30, Math.round(5 + (audioLevel / 100) * baseH * 1.3)))
                        : Math.max(4, Math.round(baseH * 0.35));
                      return (
                        <motion.span
                          key={idx}
                          className={cn(
                            "w-1 rounded-full transition-all duration-75",
                            audioLevel > 15 ? "bg-signal-emerald" : "bg-signal-rose"
                          )}
                          animate={{ height: dynamicH }}
                          transition={{ duration: 0.08 }}
                        />
                      );
                    })}
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                    <span className={cn("h-2.5 w-2.5 rounded-full animate-ping", audioLevel > 10 ? "bg-signal-emerald" : "bg-signal-rose")} />
                    {audioLevel > 10 ? 'Speaking...' : 'Listening...'} ({voiceLang === 'ta-IN' ? 'தமிழ்' : voiceLang === 'hi-IN' ? 'हिन्दी' : voiceLang === 'or-IN' ? 'ଓଡ଼ିଆ' : 'English'})
                  </span>
                </div>

                {/* 1-Tap Language Switcher Pills */}
                <div className="flex items-center gap-1 bg-white/80 dark:bg-black/40 p-1 rounded-xl border border-slate-200 dark:border-white/10 text-xs">
                  {[
                    { code: 'en-IN', short: 'English' },
                    { code: 'ta-IN', short: 'தமிழ்' },
                    { code: 'hi-IN', short: 'हिन्दी' },
                    { code: 'or-IN', short: 'ଓଡ଼ିଆ' },
                  ].map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => changeVoiceLanguage(l.code)}
                      className={cn(
                        "px-2.5 py-1 rounded-lg font-bold transition-all text-xs cursor-pointer",
                        voiceLang === l.code
                          ? "bg-brand-500 text-white shadow-sm"
                          : "text-slate-600 hover:text-brand-600 dark:text-slate-300"
                      )}
                    >
                      {l.short}
                    </button>
                  ))}
                </div>
              </div>

              {/* Real-time live transcript display */}
              <div className="min-h-[44px] max-h-[90px] overflow-y-auto rounded-xl bg-white/90 dark:bg-black/50 border border-slate-200 dark:border-white/10 p-2.5 text-sm text-slate-800 dark:text-slate-100 shadow-inner">
                {voiceTranscript || interimTranscript ? (
                  <p className="leading-relaxed">
                    <span className="font-medium text-slate-900 dark:text-white">{voiceTranscript} </span>
                    <span className="text-slate-400 dark:text-slate-500 italic">{interimTranscript}</span>
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    Listening in {voiceLang === 'ta-IN' ? 'தமிழ்' : voiceLang === 'hi-IN' ? 'हिन्दी' : 'English'}... Speak into your microphone.
                  </p>
                )}
              </div>

              {/* Cancel and Send Buttons */}
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCancelVoice}
                  className="btn-secondary px-3.5 py-1.5 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendVoice}
                  disabled={!voiceTranscript && !interimTranscript && !input.trim()}
                  className="btn-primary flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold cursor-pointer disabled:opacity-40"
                >
                  <Send className="h-3.5 w-3.5" /> Send Voice Message
                </button>
              </div>
            </div>
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
              <p className="text-lg font-bold text-slate-900 dark:text-white">{t('Topics')}</p>
              <div className="mt-3.5 flex flex-col gap-3">
                {categories.map((c) => (
                  <div key={c.key} className="space-y-2">
                    <button
                      type="button"
                      onClick={() => send(c.prompt, c.key)}
                      className="w-full flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-slate-50/50 px-4 py-3 text-left text-base font-bold text-slate-800 hover:border-brand-500/50 hover:bg-brand-500/5 hover:text-brand-600 dark:border-white/10 dark:bg-white/[0.02] dark:text-slate-100 dark:hover:border-brand-400/50 dark:hover:bg-brand-500/10 dark:hover:text-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer transition-all shadow-sm"
                    >
                      <span className="flex items-center gap-2.5">
                        {c.icon && <c.icon className="h-5 w-5 shrink-0 text-brand-600 dark:text-brand-400" />}
                        {t(c.label)}
                      </span>
                    </button>

                    {c.subtopics && c.subtopics.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 pt-0.5">
                        {c.subtopics.map((sub, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => send(`[${c.label} - ${sub}] Please provide ASHA field guidance on ${sub}.`, c.key)}
                            className="rounded-xl border border-slate-200/70 bg-white px-2.5 py-2 text-left text-[12.5px] font-semibold text-slate-700 hover:border-brand-400 hover:bg-brand-500/5 hover:text-brand-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:text-brand-400 transition-all cursor-pointer flex items-center gap-1.5 min-w-0 h-full leading-snug shadow-xs"
                          >
                            <span className="text-brand-500 font-bold shrink-0">•</span>
                            <span className="truncate" title={t(sub)}>{t(sub)}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
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
