import React, { useEffect, useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { fetchMedicines } from '../../../api/medicineApi';
import { checkDrugInteractions } from '../../../api/pharmacyApi';
import { Spinner } from '../../../components/common/Loader';
import Button from '../../../components/common/Button';
import { cn } from '../../../utils/cn';

export default function DrugInteractionCheckerWidget() {
  const [medicines, setMedicines] = useState([]);
  const [selected, setSelected] = useState([]);
  const [result, setResult] = useState(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    fetchMedicines().then(setMedicines);
  }, []);

  const toggle = (name) => {
    setSelected((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]));
    setResult(null);
  };

  const handleCheck = async () => {
    setIsChecking(true);
    const data = await checkDrugInteractions(selected);
    setResult(data);
    setIsChecking(false);
  };

  return (
    <div className="surface-card p-6">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-signal-rose/10 text-signal-rose">
          <ShieldAlert className="h-4 w-4" />
        </span>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">Drug Interaction Checker</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {medicines.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => toggle(m.name)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
              selected.includes(m.name)
                ? 'border-brand-500 bg-brand-500/10 text-brand-700 dark:text-brand-300'
                : 'border-slate-200 text-slate-600 hover:border-brand-300 dark:border-white/10 dark:text-slate-300'
            )}
          >
            {m.name}
          </button>
        ))}
      </div>

      <Button
        variant="primary"
        className="mt-4 w-full text-sm"
        onClick={handleCheck}
        disabled={selected.length < 2}
        isLoading={isChecking}
      >
        {!isChecking && 'Check Interactions'}
        {isChecking && 'Checking…'}
      </Button>

      {selected.length < 2 && (
        <p className="mt-2 text-[11px] text-slate-400">Select at least 2 medicines to check.</p>
      )}

      {result && (
        <div className="mt-4 space-y-2">
          {result.interactions.length === 0 && (
            <p className="rounded-xl bg-brand-500/10 px-3 py-2 text-xs font-medium text-brand-700 dark:text-brand-300">
              No known interaction notes found for this combination.
            </p>
          )}
          {result.interactions.map((i, idx) => (
            <div key={idx} className="rounded-xl bg-signal-rose/5 px-3 py-2 text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-200">{i.medicine}: </span>
              <span className="text-slate-600 dark:text-slate-300">{i.note}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
