import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ListChecks } from 'lucide-react';
import { fetchTodayTasks } from '../../../api/ashaApi';
import { Skeleton } from '../../../components/common/Skeleton';
import Badge from '../../../components/common/Badge';
import { cn } from '../../../utils/cn';

const PRIORITY_TONE = { high: 'rose', medium: 'amber', low: 'neutral' };

export default function TodaysTasksWidget() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchTodayTasks().then((data) => {
      if (mounted) {
        setTasks(data);
        setIsLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const doneCount = tasks.filter((t) => t.done).length;

  return (
    <div className="surface-card p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <ListChecks className="h-4 w-4" />
          </span>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Today's Tasks</p>
        </div>
        {!isLoading && (
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {doneCount}/{tasks.length} done
          </span>
        )}
      </div>

      <div className="mt-4 space-y-2.5">
        {isLoading && Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-11 w-full" />)}
        {!isLoading &&
          tasks.map((task, i) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: i * 0.05 }}
              className={cn(
                'flex items-center gap-3 rounded-xl border border-slate-200/70 px-3 py-2.5 dark:border-white/10',
                task.done && 'opacity-60'
              )}
            >
              <span
                className={cn(
                  'h-2 w-2 shrink-0 rounded-full',
                  task.done ? 'bg-brand-500' : 'bg-slate-300 dark:bg-white/20'
                )}
              />
              <div className="min-w-0 flex-1">
                <p className={cn('truncate text-sm text-slate-800 dark:text-slate-100', task.done && 'line-through')}>
                  {task.title}
                </p>
                <p className="text-xs text-slate-400">{task.time}</p>
              </div>
              <Badge tone={PRIORITY_TONE[task.priority]}>{task.priority}</Badge>
            </motion.div>
          ))}
      </div>
    </div>
  );
}
