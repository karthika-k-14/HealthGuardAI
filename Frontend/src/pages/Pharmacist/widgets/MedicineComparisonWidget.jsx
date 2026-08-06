import React, { useEffect, useState } from 'react';
import { Scale } from 'lucide-react';
import { fetchMedicines } from '../../../api/medicineApi';
import { Skeleton } from '../../../components/common/Skeleton';

export default function MedicineComparisonWidget() {
  const [medicines, setMedicines] = useState([]);
  const [leftId, setLeftId] = useState('');
  const [rightId, setRightId] = useState('');

  useEffect(() => {
    fetchMedicines().then((data) => {
      setMedicines(data);
      if (data.length > 1) {
        setLeftId(data[0].id);
        setRightId(data[1].id);
      }
    });
  }, []);

  const left = medicines.find((m) => m.id === leftId);
  const right = medicines.find((m) => m.id === rightId);

  return (
    <div className="surface-card p-6">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
          <Scale className="h-4 w-4" />
        </span>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">Medicine Comparison</p>
      </div>

      {medicines.length === 0 ? (
        <Skeleton className="mt-4 h-40 w-full" />
      ) : (
        <>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <select value={leftId} onChange={(e) => setLeftId(e.target.value)} className="input-field text-sm">
              {medicines.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            <select value={rightId} onChange={(e) => setRightId(e.target.value)} className="input-field text-sm">
              {medicines.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          {left && right && (
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              {[
                ['Category', left.category, right.category],
                ['Dosage', left.dosage, right.dosage],
                ['Side Effects', left.sideEffects.join(', '), right.sideEffects.join(', ')],
              ].map(([label, l, r]) => (
                <div key={label} className="col-span-2 grid grid-cols-2 gap-3 border-t border-slate-200/70 pt-2 dark:border-white/10">
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-slate-400">{label}</p>
                    <p className="mt-0.5 text-slate-700 dark:text-slate-200">{l}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-slate-400">{label}</p>
                    <p className="mt-0.5 text-slate-700 dark:text-slate-200">{r}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
