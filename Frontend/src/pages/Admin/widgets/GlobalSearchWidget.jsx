import React, { useState } from 'react';
import { Search, User, Hospital, Bug } from 'lucide-react';
import { globalSearch } from '../../../api/adminApi';
import { Spinner } from '../../../components/common/Loader';

export default function GlobalSearchWidget() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleChange = async (e) => {
    const value = e.target.value;
    setQuery(value);
    if (!value.trim()) {
      setResults(null);
      return;
    }
    setIsSearching(true);
    const data = await globalSearch(value);
    setResults(data);
    setIsSearching(false);
  };

  const hasResults = results && (results.users.length || results.facilities.length || results.diseases.length);

  return (
    <div className="surface-card p-6">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
          <Search className="h-4 w-4" />
        </span>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">Global Search</p>
      </div>

      <div className="relative mt-4">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={handleChange}
          placeholder="Search users, hospitals, diseases…"
          className="input-field pl-10 text-sm"
        />
        {isSearching && <Spinner size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2" />}
      </div>

      {results && !hasResults && (
        <p className="mt-3 text-xs text-slate-400">No matches found.</p>
      )}

      {hasResults && (
        <div className="mt-3 space-y-3">
          {results.users.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Users</p>
              <div className="mt-1.5 space-y-1">
                {results.users.map((u) => (
                  <div key={u.id} className="flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs dark:bg-white/5">
                    <User className="h-3 w-3 text-slate-400" /> {u.name}
                  </div>
                ))}
              </div>
            </div>
          )}
          {results.facilities.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Facilities</p>
              <div className="mt-1.5 space-y-1">
                {results.facilities.map((f) => (
                  <div key={f.id} className="flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs dark:bg-white/5">
                    <Hospital className="h-3 w-3 text-slate-400" /> {f.name}
                  </div>
                ))}
              </div>
            </div>
          )}
          {results.diseases.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Diseases</p>
              <div className="mt-1.5 space-y-1">
                {results.diseases.map((d) => (
                  <div key={d.id} className="flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs dark:bg-white/5">
                    <Bug className="h-3 w-3 text-slate-400" /> {d.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
