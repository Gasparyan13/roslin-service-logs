import React from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { setQuery, setType, setStartDateFrom, setStartDateTo, clearFilters } from './logsFilterSlice';
import type { ServiceType } from '../../types/serviceLog';

const TYPE_OPTIONS: { value: ServiceType | 'all'; label: string }[] = [
  { value: 'all', label: 'All types' },
  { value: 'planned', label: 'Planned' },
  { value: 'unplanned', label: 'Unplanned' },
  { value: 'emergency', label: 'Emergency' }
];

export const LogsFilters: React.FC = () => {
  const dispatch = useAppDispatch();
  const filter = useAppSelector((s) => s.logsFilter);

  const hasActiveFilters = filter.query || filter.type !== 'all' || filter.startDateFrom || filter.startDateTo;

  return (
    <div className="flex flex-wrap items-end gap-3 p-4 bg-slate-900 border border-slate-800 rounded-xl">
      <div className="flex flex-col gap-1 flex-1 min-w-48">
        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Search</label>
        <div className="relative">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input value={filter.query} onChange={(e) => dispatch(setQuery(e.target.value))} placeholder="Provider, order, car…" className="pl-8 w-full" />
        </div>
      </div>

      <div className="flex flex-col gap-1 min-w-36">
        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Type</label>
        <select value={filter.type} onChange={(e) => dispatch(setType(e.target.value as ServiceType | 'all'))} className="bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-100">
          {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div className="flex flex-col gap-1 min-w-36">
        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Start date from</label>
        <input type="date" value={filter.startDateFrom ?? ''} onChange={(e) => dispatch(setStartDateFrom(e.target.value || undefined))} />
      </div>

      <div className="flex flex-col gap-1 min-w-36">
        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Start date to</label>
        <input type="date" value={filter.startDateTo ?? ''} onChange={(e) => dispatch(setStartDateTo(e.target.value || undefined))} />
      </div>

      {hasActiveFilters && (
        <button onClick={() => dispatch(clearFilters())} className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors self-end">
          Clear filters
        </button>
      )}
    </div>
  );
};
