import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Smile } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { fetchMoodData, logMood } from '../../../api/citizenApi';
import { Skeleton } from '../../../components/common/Skeleton';
import { cn } from '../../../utils/cn';

export default function MoodTrackerWidget() {
  const { t } = useTranslation();
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMoodData().then(({ options: opts }) => {
      setOptions(opts);
      setIsLoading(false);
    });
  }, []);

  const handleSelect = async (mood) => {
    setSelected(mood.id);
    await logMood(mood.id);
    toast.success(`${t('Mood logged')}: ${t(mood.label)}`);
  };

  return (
    <div className="surface-card p-6">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-300">
          <Smile className="h-4 w-4" />
        </span>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('Mood Tracker')}</p>
      </div>
      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{t('How are you feeling today?')}</p>

      <div className="mt-3 flex justify-between">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-10 rounded-full" />)
          : options.map((mood) => (
              <button
                key={mood.id}
                type="button"
                onClick={() => handleSelect(mood)}
                aria-label={mood.label}
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full text-xl transition-transform hover:scale-110',
                  selected === mood.id ? 'bg-brand-500/15 ring-2 ring-brand-500' : 'bg-slate-100 dark:bg-white/5'
                )}
              >
                {mood.emoji}
              </button>
            ))}
      </div>
    </div>
  );
}
