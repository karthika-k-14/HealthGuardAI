import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Search, Pill, AlertTriangle, Send } from 'lucide-react';
import { fetchMedicines, fetchMedicineCategories } from '../../api/medicineApi';
import { requestMedicine } from '../../api/workflowApi';
import { useAuth } from '../../contexts/AuthContext';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { SkeletonGrid } from '../../components/common/Skeleton';
import { cn } from '../../utils/cn';

export default function MedicineGuide() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [availability, setAvailability] = useState('All');
  const [expiry, setExpiry] = useState('All');
  const [categories, setCategories] = useState(['All']);
  const [medicines, setMedicines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    fetchMedicineCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const handle = setTimeout(() => {
      fetchMedicines({ search, category, availability, expiry })
        .then((data) => {
          setMedicines(data);
          setIsLoading(false);
          if (data.length > 0) {
            if (!selectedId || !data.some((m) => m.id === selectedId)) {
              setSelectedId(data[0].id);
            }
          } else {
            setSelectedId(null);
          }
        })
        .catch(() => {
          setIsLoading(false);
        });
    }, 200);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, availability, expiry]);

  const selected = medicines.find((m) => m.id === selectedId) || medicines[0];

  // Citizen -> Pharmacist: requests are pushed straight into the
  // pharmacist's notification feed via the shared workflow engine.
  const handleRequestMedicine = async () => {
    if (!selected) return;
    setIsRequesting(true);
    try {
      await requestMedicine({ citizenName: user?.name || 'Citizen', medicine: selected.name });
      toast.success(`Request for ${selected.name} sent to your pharmacist.`);
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <span className="section-eyebrow">
        <Pill className="h-3.5 w-3.5" /> Medicine Guide
      </span>
      <h1 className="mt-2 font-display text-2xl font-semibold text-slate-900 dark:text-white">
        Understand your medicines
      </h1>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm dark:border-white/10 dark:bg-white/5 sm:max-w-sm">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search medicine name…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400 dark:text-slate-100"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c === 'All' ? 'All Categories' : c}
            </option>
          ))}
        </select>
        <select
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
          className="rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
        >
          <option value="All">All Availability</option>
          <option value="IN_STOCK">In Stock</option>
          <option value="LOW_STOCK">Low Stock</option>
          <option value="OUT_OF_STOCK">Out of Stock</option>
        </select>
        <select
          value={expiry}
          onChange={(e) => setExpiry(e.target.value)}
          className="rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
        >
          <option value="All">All Expiry</option>
          <option value="expiring">Expiring Soon</option>
          <option value="valid">Valid / Unexpired</option>
        </select>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
        {isLoading ? (
          <SkeletonGrid count={4} className="space-y-3" cardClassName="p-4" />
        ) : (
          <div className="space-y-2">
            {medicines.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedId(m.id)}
                className={cn(
                  'w-full rounded-xl border px-4 py-3 text-left transition-colors',
                  selectedId === m.id
                    ? 'border-brand-500 bg-brand-500/10'
                    : 'border-slate-200 hover:border-brand-300 dark:border-white/10'
                )}
              >
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{m.name}</p>
                <p className="text-xs text-slate-400">{m.category}</p>
              </button>
            ))}
            {medicines.length === 0 && <p className="text-sm text-slate-400">No medicines found.</p>}
          </div>
        )}

        {selected && (
          <div className="surface-card p-6">
            <p className="font-display text-xl font-semibold text-slate-900 dark:text-white">{selected.name}</p>
            <Badge tone="brand" className="mt-2">{selected.category}</Badge>

            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Uses</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{selected.uses}</p>
            </div>

            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Dosage</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{selected.dosage}</p>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Side effects</p>
                <ul className="mt-1.5 space-y-1">
                  {selected.sideEffects.map((s) => (
                    <li key={s} className="text-sm text-slate-600 dark:text-slate-300">• {s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Alternatives</p>
                <ul className="mt-1.5 flex flex-wrap gap-1.5">
                  {selected.alternatives.map((a) => (
                    <li key={a}>
                      <Badge tone="neutral">{a}</Badge>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-2 rounded-xl bg-signal-amber/10 p-3.5">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-signal-amber" />
              <ul className="space-y-1">
                {selected.warnings.map((w) => (
                  <li key={w} className="text-xs text-amber-700 dark:text-signal-amber">{w}</li>
                ))}
              </ul>
            </div>

            <Button
              variant="primary"
              className="mt-4 w-full text-sm"
              onClick={handleRequestMedicine}
              isLoading={isRequesting}
            >
              {!isRequesting && (
                <>
                  <Send className="h-4 w-4" /> Request this medicine
                </>
              )}
              {isRequesting && 'Sending request…'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
