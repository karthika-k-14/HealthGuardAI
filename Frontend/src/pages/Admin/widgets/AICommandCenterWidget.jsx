import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Radio } from 'lucide-react';
import { fetchCommandCenterFeed } from '../../../api/adminApi';
import { Skeleton } from '../../../components/common/Skeleton';

export default function AICommandCenterWidget() {
  const [feed, setFeed] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchCommandCenterFeed().then((data) => {
      if (mounted) {
        setFeed(data);
        setIsLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="surface-card p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <Radio className="h-4 w-4" />
          </span>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">AI Command Center</p>
        </div>
        <span className="flex items-center gap-1.5 text-xs font-medium text-brand-600 dark:text-brand-400">
          <motion.span
            className="h-1.5 w-1.5 rounded-full bg-brand-500"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.6, repeat: Infinity }}
          />
          Live
        </span>
      </div>

      <ul className="mt-4 space-y-2.5">
        {isLoading && Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}
        {!isLoading &&
          feed.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
              {item}
            </li>
          ))}
      </ul>
    </div>
  );
}
