import { motion } from 'framer-motion';
import { HeartPulse, Pill, Stethoscope, Cross, Syringe, Activity } from 'lucide-react';

import React from 'react';

const ICONS = [
  { Icon: HeartPulse, top: '12%', left: '6%', delay: 0, size: 28 },
  { Icon: Pill, top: '68%', left: '4%', delay: 0.6, size: 22 },
  { Icon: Stethoscope, top: '20%', left: '92%', delay: 0.3, size: 30 },
  { Icon: Cross, top: '78%', left: '90%', delay: 0.9, size: 20 },
  { Icon: Syringe, top: '48%', left: '96%', delay: 1.2, size: 24 },
  { Icon: Activity, top: '85%', left: '18%', delay: 1.5, size: 22 },
];

export default function FloatingIcons() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 hidden overflow-hidden lg:block" aria-hidden="true">
      {ICONS.map(({ Icon, top, left, delay, size }, i) => (
        <motion.span
          key={i}
          className="absolute text-brand-500/25 dark:text-brand-400/20"
          style={{ top, left }}
          animate={{ y: [0, -14, 0] }}
          transition={{ duration: 5 + i, repeat: Infinity, ease: 'easeInOut', delay }}
        >
          <Icon size={size} />
        </motion.span>
      ))}
    </div>
  );
}
