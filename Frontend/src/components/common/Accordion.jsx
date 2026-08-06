import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

/**
 * items: [{ id, question, answer }]
 * Single-open accordion. Reused by the Landing FAQ section; generic
 * enough to reuse anywhere a question/answer list is needed.
 */
export default function Accordion({ items, className }) {
  const [openId, setOpenId] = useState(items?.[0]?.id ?? null);

  return (
    <div className={cn('divide-y divide-slate-200/70 dark:divide-white/10', className)}>
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id} className="py-2">
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : item.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-2 py-4 text-left"
            >
              <span className="text-sm font-semibold text-slate-900 dark:text-white">{item.question}</span>
              <motion.span
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="shrink-0 text-slate-400"
              >
                <ChevronDown className="h-4 w-4" />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="overflow-hidden px-2"
                >
                  <p className="pb-4 text-sm text-slate-500 dark:text-slate-400">{item.answer}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
