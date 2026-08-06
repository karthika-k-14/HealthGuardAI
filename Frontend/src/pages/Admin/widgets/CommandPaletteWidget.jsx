import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command, Users, ShieldCheck, Megaphone, Bug, Hospital, FileBarChart, BrainCircuit } from 'lucide-react';
import Modal from '../../../components/common/Modal';
import { PATHS } from '../../../constants/routes';

const COMMANDS = [
  { label: 'Manage Users', icon: Users, to: PATHS.ADMIN_USERS },
  { label: 'Manage Roles', icon: ShieldCheck, to: PATHS.ADMIN_ROLES },
  { label: 'Manage Campaigns', icon: Megaphone, to: PATHS.ADMIN_CAMPAIGNS },
  { label: 'Manage Diseases', icon: Bug, to: PATHS.ADMIN_DISEASES },
  { label: 'Manage Hospitals', icon: Hospital, to: PATHS.ADMIN_HOSPITALS },
  { label: 'View Reports', icon: FileBarChart, to: PATHS.ADMIN_REPORTS },
  { label: 'AI Insights', icon: BrainCircuit, to: PATHS.ADMIN_AI_INSIGHTS },
];

export default function CommandPaletteWidget() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="surface-card p-6">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
          <Command className="h-4 w-4" />
        </span>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">Quick Command Palette</p>
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Press <kbd className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] dark:bg-white/10">⌘K</kbd> or click below to jump anywhere.
      </p>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 flex w-full items-center gap-2 rounded-xl border border-dashed border-slate-300 px-3 py-2.5 text-sm text-slate-400 hover:border-brand-400 hover:text-brand-600 dark:border-white/15"
      >
        <Command className="h-4 w-4" /> Open command palette…
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Quick Commands">
        <div className="space-y-1.5">
          {COMMANDS.map((c) => (
            <button
              key={c.label}
              type="button"
              onClick={() => {
                navigate(c.to);
                setOpen(false);
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/5"
            >
              <c.icon className="h-4 w-4 text-brand-500" />
              {c.label}
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
