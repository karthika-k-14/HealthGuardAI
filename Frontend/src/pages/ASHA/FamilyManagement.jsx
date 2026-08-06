import React, { useEffect, useState } from 'react';
import { Search, Users, MapPin, Phone, History, Eye } from 'lucide-react';
import { fetchFamilies } from '../../api/ashaApi';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { SkeletonGrid } from '../../components/common/Skeleton';
import { cn } from '../../utils/cn';

const RISK_LEVELS = ['All', 'Low', 'Medium', 'High'];
const RISK_TONE = { High: 'rose', Medium: 'amber', Low: 'brand', Critical: 'critical' };

export default function FamilyManagement() {
  const [families, setFamilies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskLevel, setRiskLevel] = useState('All');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    const handle = setTimeout(() => {
      fetchFamilies({ search, riskLevel }).then((data) => {
        setFamilies(data);
        setIsLoading(false);
      });
    }, 200);
    return () => clearTimeout(handle);
  }, [search, riskLevel]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">Family Management</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Search and review households assigned to your area.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or address…"
            className="input-field pl-10"
          />
        </div>
        <div className="flex gap-2">
          {RISK_LEVELS.map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setRiskLevel(lvl)}
              className={cn(
                'rounded-full border px-3 py-2 text-xs font-medium transition-colors',
                riskLevel === lvl
                  ? 'border-brand-500 bg-brand-500/10 text-brand-700 dark:text-brand-300'
                  : 'border-slate-200 text-slate-600 hover:border-brand-300 dark:border-white/10 dark:text-slate-300'
              )}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <SkeletonGrid count={4} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" />
      )}

      {!isLoading && families.length === 0 && (
        <div className="surface-card flex flex-col items-center gap-2 p-10 text-center text-sm text-slate-500">
          <Users className="h-6 w-6 text-slate-400" />
          No families match your search.
        </div>
      )}

      {!isLoading && families.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {families.map((f) => (
            <div key={f.id} className="surface-card flex flex-col gap-3 p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{f.headName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{f.members} members</p>
                </div>
                <Badge tone={RISK_TONE[f.riskLevel]}>{f.riskLevel}</Badge>
              </div>

              <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                <p className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 shrink-0" /> {f.address}
                </p>
                <p className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 shrink-0" /> {f.contact}
                </p>
                <p className="flex items-center gap-1.5">
                  <History className="h-3.5 w-3.5 shrink-0" /> Last visit {new Date(f.lastVisit).toLocaleDateString()}
                </p>
              </div>

              <div className="mt-1 flex items-center justify-between">
                <Badge tone={f.healthStatus === 'Stable' ? 'brand' : 'amber'}>{f.healthStatus}</Badge>
                <button
                  type="button"
                  onClick={() => setSelected(f)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
                >
                  <Eye className="h-3.5 w-3.5" /> View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.headName}>
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-slate-400">Address</p>
                <p className="text-slate-800 dark:text-slate-100">{selected.address}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Contact</p>
                <p className="text-slate-800 dark:text-slate-100">{selected.contact}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Health Status</p>
                <p className="text-slate-800 dark:text-slate-100">{selected.healthStatus}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Risk Level</p>
                <Badge tone={RISK_TONE[selected.riskLevel]}>{selected.riskLevel}</Badge>
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Visit History</p>
              <ul className="space-y-2 border-l border-slate-200/70 pl-4 dark:border-white/10">
                {selected.visitHistory.map((v, i) => (
                  <li key={i} className="relative">
                    <span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-brand-500" />
                    <p className="text-sm text-slate-700 dark:text-slate-200">{v.note}</p>
                    <p className="text-xs text-slate-400">{new Date(v.date).toLocaleDateString()}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
