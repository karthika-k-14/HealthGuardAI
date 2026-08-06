import React, { useState } from 'react';
import { Languages, Check } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { cn } from '../../utils/cn';

export default function LanguageSelector({ className }) {
  const { language, languages, setLanguageCode } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:border-brand-400 hover:text-brand-600 dark:border-white/10 dark:text-slate-300 dark:hover:text-brand-400"
      >
        <Languages className="h-3.5 w-3.5" aria-hidden="true" />
        {language.code.toUpperCase()}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden="true" />
          <div
            role="listbox"
            className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-white/10 dark:bg-surface-darkcard"
          >
            {languages.map((lang) => (
              <button
                key={lang.code}
                type="button"
                role="option"
                aria-selected={lang.code === language.code}
                onClick={() => {
                  setLanguageCode(lang.code);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/5"
              >
                <span>
                  {lang.label} <span className="text-slate-400">· {lang.nativeLabel}</span>
                </span>
                {lang.code === language.code && <Check className="h-3.5 w-3.5 text-brand-500" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
