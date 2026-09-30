import React, { useEffect, useState, useMemo } from 'react';
import {
  Landmark,
  ExternalLink,
  Search,
  X,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  MapPin,
  Tag,
  Check,
  Globe,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchSchemes, applyForScheme, fetchMySchemeApplications } from '../../api/schemeApi';
import Badge from '../../components/common/Badge';
import { SkeletonGrid } from '../../components/common/Skeleton';
import { cn } from '../../utils/cn';

const CATEGORY_TONE_MAP = {
  'Health Insurance': 'brand',
  'Maternal Health': 'rose',
  'Child Health': 'amber',
  'Immunization': 'sky',
  'Critical Care': 'rose',
};

export default function GovernmentSchemes() {
  const [schemes, setSchemes] = useState([]);
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedState, setSelectedState] = useState('All');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('All');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    setHasError(false);
    setErrorMessage('');
    try {
      const [schemeList, myApplications] = await Promise.all([
        fetchSchemes(),
        fetchMySchemeApplications(),
      ]);
      setSchemes(schemeList || []);
      setApplications(myApplications || []);
    } catch (err) {
      setHasError(true);
      setErrorMessage(err?.response?.data?.message || err?.message || 'Unable to load schemes');
      toast.error('Unable to load government schemes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  // Derive unique categories and states from the schemes
  const categories = useMemo(() => {
    const set = new Set();
    schemes.forEach((s) => {
      if (s.category) set.add(s.category);
    });
    return ['All', ...Array.from(set)];
  }, [schemes]);

  const states = useMemo(() => {
    const set = new Set();
    schemes.forEach((s) => {
      if (s.state) set.add(s.state);
    });
    return ['All', ...Array.from(set)];
  }, [schemes]);

  // Client-side instant filter on current schemes
  const filteredSchemes = useMemo(() => {
    return schemes.filter((s) => {
      const name = s.schemeName || s.name || '';
      const desc = s.description || '';
      const benefits = s.benefits || '';
      const cat = s.category || '';
      const state = s.state || '';
      const ageGroup = s.ageGroup || '';

      // Age Group filter
      if (selectedAgeGroup !== 'All') {
        if (selectedAgeGroup === '0-18') {
          const isMatch = ageGroup === '0-18' || cat.includes('Child') || cat.includes('Immunization');
          if (!isMatch) return false;
        } else if (selectedAgeGroup === '10-19') {
          const isMatch = ageGroup === '10-19' || cat.includes('Adolescent');
          if (!isMatch) return false;
        } else if (selectedAgeGroup === '18-59') {
          const isMatch = ageGroup === '18-59' || ageGroup === 'All' || cat.includes('Insurance') || cat.includes('Critical') || cat.includes('Generic');
          if (!isMatch) return false;
        } else if (selectedAgeGroup === '60+') {
          const isMatch = ageGroup === '60+' || cat.includes('Elderly') || name.includes('Senior') || name.includes('Vayo');
          if (!isMatch) return false;
        } else if (selectedAgeGroup === 'Maternal') {
          const isMatch = ageGroup === 'Maternal' || cat.includes('Maternal') || name.includes('Matru') || name.includes('Janani');
          if (!isMatch) return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'All' && cat.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }

      // State filter
      if (selectedState !== 'All') {
        const sState = state.toLowerCase();
        const targetState = selectedState.toLowerCase();
        if (sState !== targetState && sState !== 'all india') {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = name.toLowerCase().includes(q);
        const matchesDesc = desc.toLowerCase().includes(q);
        const matchesBenefits = benefits.toLowerCase().includes(q);
        const matchesCat = cat.toLowerCase().includes(q);
        const matchesAge = (s.eligibleAgeLabel || '').toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesBenefits && !matchesCat && !matchesAge) {
          return false;
        }
      }

      return true;
    });
  }, [schemes, selectedAgeGroup, selectedCategory, selectedState, searchQuery]);

  const isFiltered = searchQuery.trim() !== '' || selectedCategory !== 'All' || selectedState !== 'All' || selectedAgeGroup !== 'All';

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedState('All');
    setSelectedAgeGroup('All');
  };

  const handleInAppApply = async (schemeId) => {
    try {
      const app = await applyForScheme(schemeId);
      setApplications((prev) => [app, ...prev.filter((a) => a.schemeId !== schemeId)]);
      toast.success('Application recorded! Redirecting to official portal…');
    } catch {
      // ignore
    }
  };

  const parseList = (raw) => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    return raw
      .split(/[;,]/)
      .map((item) => item.trim())
      .filter(Boolean);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10">
            <Landmark className="h-4 w-4" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider">Public Health Welfare</span>
        </div>

        <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
              Health schemes you may be eligible for
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Government-funded healthcare, maternity aid, free immunizations, and cashless hospital treatments.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            <span>
              <strong className="text-slate-700 dark:text-slate-200">{schemes.length}</strong> active schemes verified
            </span>
          </div>
        </div>
      </div>

      {/* Age Cohorts Filter Navigation */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-2 dark:border-white/10 dark:bg-white/[0.03]">
        {[
          { id: 'All', label: 'All Life Stages', icon: '🌐' },
          { id: '0-18', label: 'Infants & Children (0-18 Yrs)', icon: '👶' },
          { id: '10-19', label: 'Adolescents (10-19 Yrs)', icon: '🧑' },
          { id: '18-59', label: 'Adults (18-59 Yrs)', icon: '👨‍💼' },
          { id: '60+', label: 'Senior Citizens (60+ Yrs)', icon: '🧓' },
          { id: 'Maternal', label: 'Maternal Health', icon: '🤰' },
        ].map((cohort) => {
          const isActive = selectedAgeGroup === cohort.id;
          return (
            <button
              key={cohort.id}
              type="button"
              onClick={() => setSelectedAgeGroup(cohort.id)}
              className={cn(
                'flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all shadow-xs cursor-pointer',
                isActive
                  ? 'bg-brand-600 text-white shadow-md scale-[1.02]'
                  : 'bg-white text-slate-700 hover:bg-slate-100 hover:text-brand-600 dark:bg-surface-darkcard dark:text-slate-300 dark:hover:bg-white/10'
              )}
            >
              <span>{cohort.icon}</span>
              <span>{cohort.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search and Filters Section */}
      <div className="glass-panel p-4 sm:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search schemes by name, benefits, or treatment keywords..."
              className="w-full rounded-xl border border-slate-200 bg-white/70 py-2.5 pl-10 pr-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-white/10 dark:bg-slate-900/60 dark:text-white dark:placeholder:text-slate-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* State Dropdown Filter */}
          <div className="flex items-center gap-2">
            <label htmlFor="state-filter" className="flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <MapPin className="h-3.5 w-3.5" /> State:
            </label>
            <select
              id="state-filter"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-xs font-medium text-slate-700 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-200"
            >
              {states.map((st) => (
                <option key={st} value={st} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
                  {st === 'All' ? 'All Jurisdictions' : st}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 dark:border-white/5">
          <span className="flex items-center gap-1 text-xs font-medium text-slate-400 mr-1">
            <Tag className="h-3.5 w-3.5" /> Category:
          </span>
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10'
                )}
              >
                {cat === 'All' ? 'All Categories' : cat}
              </button>
            );
          })}

          {isFiltered && (
            <button
              type="button"
              onClick={resetFilters}
              className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline dark:text-brand-400"
            >
              <RotateCcw className="h-3 w-3" /> Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-4">
          <SkeletonGrid count={4} className="grid gap-6 sm:grid-cols-2" cardClassName="p-6 h-80" />
        </div>
      )}

      {/* Error State */}
      {!isLoading && hasError && schemes.length === 0 && (
        <div className="surface-card flex flex-col items-center justify-center p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <AlertCircle className="h-7 w-7" />
          </div>
          <h3 className="mt-4 font-display text-lg font-semibold text-slate-900 dark:text-white">
            Unable to load schemes
          </h3>
          <p className="mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">
            {errorMessage || 'Failed to connect to the healthcare service. Please check your connection and retry.'}
          </p>
          <button
            type="button"
            onClick={loadData}
            className="btn-primary mt-6 inline-flex items-center gap-2 text-sm"
          >
            <RotateCcw className="h-4 w-4" /> Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !hasError && filteredSchemes.length === 0 && (
        <div className="surface-card flex flex-col items-center justify-center p-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 dark:bg-white/5">
            <Landmark className="h-8 w-8 text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="mt-4 font-display text-lg font-semibold text-slate-900 dark:text-white">
            No Government Schemes Available
          </h3>
          <p className="mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">
            {isFiltered
              ? 'No government schemes match your chosen search query and filter criteria.'
              : 'There are currently no active public health schemes listed for this district.'}
          </p>
          {isFiltered && (
            <button
              type="button"
              onClick={resetFilters}
              className="btn-primary mt-5 inline-flex items-center gap-1.5 text-xs font-medium"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Clear All Filters
            </button>
          )}
        </div>
      )}

      {/* Schemes Grid */}
      {!isLoading && filteredSchemes.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2">
          {filteredSchemes.map((s) => {
            const schemeId = s.id;
            const name = s.schemeName || s.name || 'Healthcare Welfare Scheme';
            const category = s.category || 'General Health';
            const state = s.state || 'All India';
            const description = s.description || '';
            const benefits = parseList(s.benefits);
            const eligibility = s.eligibilityCriteria || s.eligibility || 'Check official guidelines for full eligibility criteria.';
            const documents = parseList(s.requiredDocuments);
            const officialUrl = s.officialLink || s.officialUrl || 'https://nhm.gov.in';
            const applyUrl = s.applicationLink || s.applyUrl || s.officialLink || officialUrl;

            const categoryTone = CATEGORY_TONE_MAP[category] || 'brand';

            return (
              <div
                key={schemeId}
                className="surface-card group flex flex-col justify-between p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/30 hover:shadow-xl dark:hover:border-brand-400/20"
              >
                <div>
                  {/* Top Badges & Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={categoryTone} className="font-semibold">
                        {category}
                      </Badge>
                      <Badge tone={state === 'All India' ? 'sky' : 'amber'} className="font-medium">
                        <MapPin className="mr-1 h-3 w-3" /> {state}
                      </Badge>
                      {s.eligibleAgeLabel && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-bold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50">
                          🎯 {s.eligibleAgeLabel}
                        </span>
                      )}
                    </div>

                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400">
                      <ShieldCheck className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                    </span>
                  </div>

                  {/* Scheme Name */}
                  <h2 className="mt-3.5 font-display text-lg font-bold tracking-tight text-slate-900 group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400">
                    {name}
                  </h2>

                  {/* Short Description */}
                  <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    {description}
                  </p>

                  {/* Benefits Section */}
                  {benefits.length > 0 && (
                    <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-white/5 dark:bg-white/[0.02]">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                        <Sparkles className="h-3.5 w-3.5 text-brand-500" />
                        <span>Key Benefits</span>
                      </div>
                      <ul className="mt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                        {benefits.map((b, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                            <span className="leading-snug">{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Eligibility Section */}
                  <div className="mt-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Eligibility Criteria
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                      {eligibility}
                    </p>
                  </div>

                  {/* Required Documents Tag Cloud */}
                  {documents.length > 0 && (
                    <div className="mt-4">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Required Documents
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {documents.map((doc, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-white/5 dark:text-slate-300"
                          >
                            <FileText className="h-2.5 w-2.5 text-slate-400" />
                            {doc}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Action Buttons (Open in New Tab) */}
                <div className="mt-6 border-t border-slate-100 pt-4 dark:border-white/5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    {/* Official Website Button */}
                    <a
                      href={officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                    >
                      <Globe className="h-3.5 w-3.5 text-slate-400" />
                      <span>Official Website</span>
                      <ExternalLink className="h-3 w-3 opacity-60" />
                    </a>

                    {/* Apply Now Button */}
                    <a
                      href={applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleInAppApply(schemeId)}
                      className="btn-primary inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold shadow-sm"
                    >
                      <span>Apply Now</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
