import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

import React from 'react';

const TONE_STROKE = {
  brand: '#1aab6f',
  amber: '#f5a524',
  rose: '#f43f5e',
  sky: '#3b9df5',
};

/**
 * value/max define the fill fraction. size/strokeWidth control the
 * ring dimensions. Children render centered inside the ring (e.g. a
 * score number or icon).
 */
export default function ProgressRing({ value, max = 100, size = 120, strokeWidth = 10, tone = 'brand', className, children }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const fraction = Math.max(0, Math.min(1, max > 0 ? value / max : 0));
  const offset = circumference * (1 - fraction);

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-slate-100 dark:stroke-white/10"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={TONE_STROKE[tone] || TONE_STROKE.brand}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}
