import React, { useEffect, useState } from 'react';
import { Search, BookOpenText, TrendingUp, HelpCircle, PlayCircle } from 'lucide-react';
import { fetchDiseaseCategories, fetchDiseases, fetchFaqs } from '../../api/landingApi';
import { getIcon } from '../../utils/iconRegistry';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Accordion from '../../components/common/Accordion';
import { SkeletonGrid } from '../../components/common/Skeleton';
import { cn } from '../../utils/cn';

const SEVERITY_TONE = { Low: 'brand', Medium: 'amber', High: 'rose' };

export default function DiseaseAwareness() {
  const [categories, setCategories] = useState(['All']);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [diseases, setDiseases] = useState([]);
  const [trending, setTrending] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchDiseaseCategories().then(setCategories);
    fetchDiseases({}).then((all) => setTrending(all.filter((d) => d.trending)));
    fetchFaqs().then(setFaqs);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const handle = setTimeout(() => {
      fetchDiseases({ category: activeCategory, search }).then((data) => {
        setDiseases(data);
        setIsLoading(false);
      });
    }, 200);
    return () => clearTimeout(handle);
  }, [activeCategory, search]);

  return (
    <div className="mx-auto max-w-6xl">
      <span className="section-eyebrow">
        <BookOpenText className="h-3.5 w-3.5" /> Disease Awareness
      </span>
      <h1 className="mt-2 font-display text-2xl font-semibold text-slate-900 dark:text-white">
        Stay informed, stay protected
      </h1>

      {trending.length > 0 && (
        <div className="mt-5">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
            <TrendingUp className="h-3.5 w-3.5" /> Trending this week
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {trending.map((d) => (
              <Badge key={d.id} tone={SEVERITY_TONE[d.severity] || 'neutral'}>
                {d.name} · {d.cases7d} cases
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 shadow-sm dark:border-white/10 dark:bg-white/5 sm:max-w-sm">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search diseases, symptoms…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400 dark:text-slate-100"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setActiveCategory(c)}
              className={cn(
                'rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors',
                activeCategory === c
                  ? 'border-brand-500 bg-brand-500/10 text-brand-700 dark:text-brand-300'
                  : 'border-slate-200 text-slate-600 hover:border-brand-300 dark:border-white/10 dark:text-slate-300'
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <SkeletonGrid count={6} className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" cardClassName="p-5" />
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {diseases.map((d) => {
            const Icon = getIcon(d.icon);
            return (
              <div key={d.id} className="surface-card overflow-hidden">
                <div className="flex h-28 items-center justify-center bg-gradient-to-br from-brand-400 to-brand-700">
                  <Icon className="h-12 w-12 text-white/90" />
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{d.name}</p>
                    <Badge tone={SEVERITY_TONE[d.severity] || 'neutral'}>{d.severity} severity</Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{d.summary}</p>
                  <button
                    type="button"
                    onClick={() => setSelected(d)}
                    className="mt-4 text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
                  >
                    Read more →
                  </button>
                </div>
              </div>
            );
          })}
          {diseases.length === 0 && (
            <p className="col-span-full text-center text-sm text-slate-400">No diseases match your search.</p>
          )}
        </div>
      )}

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="surface-card p-6">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 dark:text-white">
            <HelpCircle className="h-4 w-4 text-brand-500" /> Frequently Asked Questions
          </p>
          <Accordion items={faqs.map((f) => ({ id: f.id, question: f.question, answer: f.answer }))} className="mt-2" />
        </div>

        <div className="surface-card p-6">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 dark:text-white">
            <PlayCircle className="h-4 w-4 text-brand-500" /> Awareness Videos
          </p>
          <div className="mt-4 space-y-3">
            {['Recognizing dengue symptoms early', 'How mosquito breeding sites form', 'Vaccination schedule basics'].map((title) => (
              <div key={title} className="flex items-center gap-3 rounded-xl border border-slate-200/70 p-3 dark:border-white/10">
                <span className="flex h-12 w-16 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400 dark:bg-white/10">
                  <PlayCircle className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm text-slate-700 dark:text-slate-200">{title}</p>
                  <p className="text-xs text-slate-400">Video placeholder — coming soon</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.name}>
        {selected && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-300">{selected.summary}</p>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Symptoms</p>
              <ul className="mt-1.5 flex flex-wrap gap-1.5">
                {selected.symptoms?.map((s) => (
                  <li key={s}>
                    <Badge tone="neutral">{s}</Badge>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Prevention</p>
              <ul className="mt-1.5 space-y-1">
                {selected.prevention?.map((p) => (
                  <li key={p} className="text-sm text-slate-600 dark:text-slate-300">• {p}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Treatment</p>
              <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">{selected.treatment}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
