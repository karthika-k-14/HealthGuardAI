import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Search,
  BookOpenText,
  TrendingUp,
  PlayCircle,
  Youtube,
  ShieldCheck,
  AlertTriangle,
  HeartPulse,
  Activity,
  CheckCircle2,
  ExternalLink,
  Clock,
  Building2,
  Share2,
  Sparkles,
  Stethoscope,
  Info,
  ChevronRight,
  Flame,
  Droplets,
  Wind,
  X,
  Maximize2
} from 'lucide-react';
import {
  searchDiseaseAwareness,
  getDiseaseSuggestions,
  getTrendingDiseases,
  fetchDiseaseSearchHistory,
  recordDiseaseSearch
} from '../../api/awarenessApi';
import { VERIFIED_DISEASES } from '../../data/diseaseAwarenessData';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { SkeletonGrid } from '../../components/common/Skeleton';

const LANG_NAMES = {
  en: 'English',
  ta: 'Tamil',
  or: 'Odia',
  hi: 'Hindi',
};

const SEVERITY_TONE = { Low: 'brand', Medium: 'amber', High: 'rose' };

function getEmbedUrl(video) {
  if (!video) return '';
  let id = video.id;
  if (!id && video.youtubeUrl) {
    const m = video.youtubeUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (m) id = m[1];
  }
  if (!id && video.url) {
    const m = video.url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (m) id = m[1];
  }
  if (!id && video.embedUrl) {
    const m = video.embedUrl.match(/(?:embed\/)([\w-]{11})/);
    if (m) id = m[1];
  }
  if (id) {
    return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
  }
  if (video.embedUrl && video.embedUrl.includes('embed')) {
    return video.embedUrl.includes('?') ? `${video.embedUrl}&autoplay=1&rel=0` : `${video.embedUrl}?autoplay=1&rel=0`;
  }
  return '';
}

function getWatchUrl(video) {
  if (!video) return '#';
  if (video.youtubeUrl) return video.youtubeUrl;
  if (video.url) return video.url;
  if (video.id) return `https://www.youtube.com/watch?v=${video.id}`;
  return '#';
}

export default function DiseaseAwareness() {
  const { languageCode } = useLanguage();
  const { user } = useAuth();
  const citizenId = user?.citizenId || user?.userId || user?.id || 1;

  const activeLangKey = languageCode || 'en';
  const backendLanguage = LANG_NAMES[activeLangKey]?.toLowerCase() || 'english';

  const [search, setSearch] = useState('');
  const [activeQuery, setActiveQuery] = useState('dengue');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [awarenessData, setAwarenessData] = useState(null);
  const [searchHistory, setSearchHistory] = useState({ recentSearches: [], topSearched: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [activeVideo, setActiveVideo] = useState(null);
  const [playingCardId, setPlayingCardId] = useState(null);

  const searchContainerRef = useRef(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch search history (Recent & Top Searched)
  const loadSearchHistory = useCallback(async () => {
    try {
      const history = await fetchDiseaseSearchHistory(citizenId);
      if (history) setSearchHistory(history);
    } catch (err) {
      console.debug('Error loading search history:', err);
    }
  }, [citizenId]);

  useEffect(() => {
    loadSearchHistory();
  }, [loadSearchHistory]);

  // Execute Disease Search
  const executeSearch = useCallback(async (queryToSearch) => {
    const q = (queryToSearch !== undefined ? queryToSearch : search).trim();
    if (!q) return;

    setIsLoading(true);
    setShowSuggestions(false);

    try {
      const data = await searchDiseaseAwareness(q, backendLanguage, citizenId);
      if (data && data.diseaseName) {
        if (!data.videos || data.videos.length === 0) {
          const lowerQ = q.toLowerCase();
          const matched = VERIFIED_DISEASES.find((d) =>
            d.name.toLowerCase().includes(lowerQ) ||
            lowerQ.includes(d.id.toLowerCase()) ||
            (d.keywords && d.keywords.some((k) => lowerQ.includes(k.toLowerCase())))
          );
          if (matched && matched.videos && matched.videos.length > 0) {
            data.videos = matched.videos;
          }
        }
        setAwarenessData(data);
        setActiveQuery(data.diseaseName);
        // Refresh history
        loadSearchHistory();
      }
    } catch (err) {
      console.error('Error executing disease search:', err);
    } finally {
      setIsLoading(false);
    }
  }, [search, backendLanguage, citizenId, loadSearchHistory]);

  // Initial load with default disease
  useEffect(() => {
    executeSearch(activeQuery || 'dengue');
  }, [backendLanguage]);

  // Autocomplete suggestions debounce
  useEffect(() => {
    if (!search.trim() || search.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const results = await getDiseaseSuggestions(search.trim(), backendLanguage);
        setSuggestions(results || []);
        setShowSuggestions(true);
      } catch (err) {
        console.debug('Error fetching suggestions:', err);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [search, backendLanguage]);

  const handleSelectSuggestion = (sug) => {
    const diseaseName = sug.name || sug.nativeName || sug;
    setSearch(diseaseName);
    setShowSuggestions(false);
    executeSearch(diseaseName);
  };

  const handleChipClick = (diseaseName) => {
    setSearch(diseaseName);
    executeSearch(diseaseName);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BookOpenText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              National Health Awareness Repository
            </span>
          </div>
          <h1 className="mt-1 font-display text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            Disease Awareness & Prevention Guide
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Search symptoms, treatment protocols, and educational videos backed by the National Health Mission.
          </p>
        </div>
      </div>

      {/* SEARCH BAR WITH AUTOCOMPLETE */}
      <div ref={searchContainerRef} className="relative surface-card p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            executeSearch();
          }}
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
              placeholder="Search diseases (e.g. Dengue, Malaria, Typhoid, Diabetes, Asthma, Tuberculosis)..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-white/10 dark:bg-slate-800 dark:text-white"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 shadow-sm transition-colors"
          >
            Search
          </button>
        </form>

        {/* Live Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute left-4 right-4 top-full z-50 mt-1 rounded-xl border border-slate-200 bg-white shadow-xl dark:border-white/10 dark:bg-slate-800 overflow-hidden">
            {suggestions.map((sug, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectSuggestion(sug)}
                className="flex w-full items-center justify-between px-4 py-2.5 text-left text-xs hover:bg-purple-50 dark:hover:bg-slate-700/50 transition-colors border-b border-slate-100 dark:border-white/5 last:border-0"
              >
                <span className="font-semibold text-slate-900 dark:text-white">
                  {sug.name} {sug.nativeName ? `(${sug.nativeName})` : ''}
                </span>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-2xs text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                  {sug.category || 'Disease'}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* DISEASE SEARCH HISTORY CHIPS */}
        <div className="mt-3 flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
          <span className="text-2xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Clock className="h-3 w-3" /> Recently Viewed:
          </span>
          {searchHistory.recentSearches && searchHistory.recentSearches.length > 0 ? (
            searchHistory.recentSearches.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleChipClick(item)}
                className="rounded-full border border-purple-200 bg-purple-50 px-2.5 py-0.5 text-2xs font-medium text-purple-700 hover:bg-purple-100 dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-300 transition-colors"
              >
                {item}
              </button>
            ))
          ) : (
            <span className="text-2xs text-slate-400">Search Dengue, Malaria, or Diabetes to build history</span>
          )}

          <div className="ml-auto flex items-center gap-1 text-2xs font-medium text-slate-400">
            <TrendingUp className="h-3 w-3 text-amber-500" />
            <span>Popular:</span>
            {['Dengue', 'Malaria', 'Diabetes', 'Hypertension', 'Tuberculosis'].map((pop) => (
              <button
                key={pop}
                onClick={() => handleChipClick(pop)}
                className="text-2xs text-slate-600 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-300 underline underline-offset-2 ml-1"
              >
                {pop}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent align-[-0.125em]" />
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Retrieving verified clinical guidelines...</p>
        </div>
      ) : awarenessData ? (
        <div className="space-y-6">
          {/* DISEASE HERO CARD */}
          <div className="surface-card p-6 border-l-4 border-l-purple-600">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                    {awarenessData.category || 'Infectious Disease'}
                  </span>
                  <Badge tone={SEVERITY_TONE[awarenessData.severity] || 'neutral'}>
                    Severity: {awarenessData.severity || 'Moderate'}
                  </Badge>
                </div>
                <h2 className="mt-1 font-display text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
                  {awarenessData.diseaseName}{' '}
                  {awarenessData.nativeName && (
                    <span className="text-lg font-normal text-slate-500 dark:text-slate-400">
                      ({awarenessData.nativeName})
                    </span>
                  )}
                </h2>
              </div>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {awarenessData.description}
            </p>
          </div>

          {/* TWO COLUMN CLINICAL CONTENT */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Symptoms Card */}
            <div className="surface-card p-5">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-3">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                  Common Symptoms & Manifestations
                </h3>
              </div>
              <ul className="mt-4 space-y-2">
                {awarenessData.symptoms?.map((sym, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>{sym}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Prevention Protocols */}
            <div className="surface-card p-5">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-3">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                  Prevention & Protection Protocols
                </h3>
              </div>
              <ul className="mt-4 space-y-2">
                {awarenessData.prevention?.map((prev, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{prev}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* TREATMENT & GOVERNMENT RECOMMENDATIONS */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Treatment Guidance */}
            <div className="surface-card p-5">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-3">
                <HeartPulse className="h-4 w-4 text-rose-500" />
                <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                  Treatment Guidance & Recovery
                </h3>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                {awarenessData.treatment}
              </p>
              <div className="mt-4 rounded-xl bg-amber-500/10 p-3 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300">
                <strong>When to Seek Emergency Care:</strong> Seek immediate medical attention if you experience severe shortness of breath, continuous vomiting, altered consciousness, or high fever beyond 3 days.
              </div>
            </div>

            {/* Government Schemes & Free Diagnostics */}
            <div className="surface-card p-5">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-3">
                <Building2 className="h-4 w-4 text-sky-500" />
                <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                  Government Guidelines & Subsidized Schemes
                </h3>
              </div>
              <ul className="mt-4 space-y-2.5">
                {awarenessData.governmentRecommendations?.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-500 shrink-0 mt-1.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* DYNAMIC EDUCATIONAL VIDEOS SECTION */}
          <div className="surface-card p-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Youtube className="h-5 w-5 text-rose-600" />
                <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                  Educational Videos for {awarenessData.diseaseName}
                </h3>
              </div>
              <span className="text-2xs text-slate-400">
                {awarenessData.videos?.length || 0} Disease-Specific Videos
              </span>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {awarenessData.videos && awarenessData.videos.length > 0 ? (
                awarenessData.videos.map((vid, idx) => {
                  const cardKey = vid.id || `vid-${idx}`;
                  const isPlaying = playingCardId === cardKey;

                  return (
                    <div
                      key={cardKey}
                      className="group rounded-xl border border-slate-200/80 bg-slate-50/50 overflow-hidden hover:border-purple-300 hover:shadow-md dark:border-white/5 dark:bg-slate-800/50 transition-all"
                    >
                      <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
                        {isPlaying ? (
                          <>
                            <iframe
                              title={vid.title}
                              src={getEmbedUrl(vid)}
                              className="h-full w-full border-0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              allowFullScreen
                            />
                            <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveVideo(vid);
                                }}
                                className="rounded-full bg-black/75 p-1.5 text-white hover:bg-black transition-colors"
                                title="Open in Theater Modal"
                              >
                                <Maximize2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPlayingCardId(null);
                                }}
                                className="rounded-full bg-black/75 p-1.5 text-white hover:bg-black transition-colors"
                                title="Close video"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </>
                        ) : (
                          <div
                            className="relative h-full w-full cursor-pointer"
                            onClick={() => {
                              setPlayingCardId(cardKey);
                            }}
                          >
                            <img
                              src={vid.thumbnail}
                              alt={vid.title}
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop';
                              }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-600 text-white shadow-xl group-hover:scale-110 transition-transform">
                                <PlayCircle className="h-7 w-7" />
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <p
                          onClick={() => setActiveVideo(vid)}
                          className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-2 cursor-pointer hover:text-purple-600 dark:hover:text-purple-400"
                        >
                          {vid.title}
                        </p>
                        <div className="mt-2 flex items-center justify-between text-2xs text-slate-400">
                          <span>{vid.channel || 'National Health Portal'}</span>
                          <div className="flex items-center gap-2">
                            <span>{vid.duration || '5:20'}</span>
                            <button
                              type="button"
                              onClick={() => setActiveVideo(vid)}
                              className="font-semibold text-purple-600 hover:text-purple-700"
                            >
                              Expand
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-slate-400 col-span-3">
                  No video tutorials available for this query.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* VIDEO PLAYER MODAL */}
      {activeVideo && (
        <Modal
          open={Boolean(activeVideo)}
          isOpen={Boolean(activeVideo)}
          onClose={() => setActiveVideo(null)}
          title={activeVideo.title}
          className="max-w-4xl"
        >
          <div className="space-y-3">
            <div className="aspect-video w-full overflow-hidden rounded-xl bg-black shadow-2xl">
              <iframe
                title={activeVideo.title}
                src={getEmbedUrl(activeVideo)}
                className="h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
              <span>Channel: {activeVideo.channel || 'National Health Channel'}</span>
              <a
                href={getWatchUrl(activeVideo)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-700 font-semibold"
              >
                Watch on YouTube <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
