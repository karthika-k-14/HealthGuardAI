import React, { useState } from 'react';
import { Mic, Square } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { cn } from '../../../utils/cn';

/**
 * UI-only placeholder for field voice notes — no real audio capture
 * wired up yet. Provides the interaction shape (record/stop, visual
 * feedback) for a future MediaRecorder-backed implementation.
 */
export default function VoiceNoteWidget() {
  const [recording, setRecording] = useState(false);

  const toggle = () => {
    if (recording) {
      toast.success('Voice note saved (demo)');
    }
    setRecording((v) => !v);
  };

  return (
    <div className="surface-card flex items-center justify-between gap-4 p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
          <Mic className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Voice Note</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Attach a quick note to a visit · placeholder</p>
        </div>
      </div>
      <button
        type="button"
        onClick={toggle}
        className={cn(
          'relative inline-flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors',
          recording ? 'bg-signal-rose' : 'bg-brand-500 hover:bg-brand-600'
        )}
        aria-label={recording ? 'Stop recording' : 'Start recording'}
      >
        {recording && (
          <motion.span
            className="absolute inset-0 rounded-full bg-signal-rose"
            animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
            transition={{ duration: 1.4, repeat: Infinity }}
          />
        )}
        {recording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
      </button>
    </div>
  );
}
