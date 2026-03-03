import React, { useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { deleteLog } from './logsSlice';
import { EditLogDialog } from './EditLogDialog';
import type { ServiceLog, ServiceType } from '../../types/serviceLog';

const TYPE_BADGE: Record<ServiceType, string> = {
  planned: 'bg-sky-500/20 text-sky-400 border border-sky-500/30',
  unplanned: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  emergency: 'bg-red-500/20 text-red-400 border border-red-500/30'
};

const COLUMNS = [
  { key: 'serviceOrder', label: 'Order' },
  { key: 'providerId', label: 'Provider' },
  { key: 'carId', label: 'Car' },
  { key: 'type', label: 'Type' },
  { key: 'startDate', label: 'Start' },
  { key: 'endDate', label: 'End' },
  { key: 'odometer', label: 'Odo (mi)' },
  { key: 'engineHours', label: 'Eng. Hours' }
] as const;

type SortKey = (typeof COLUMNS)[number]['key'];
type SortDir = 'asc' | 'desc';

function matchesQuery(log: ServiceLog, query: string): boolean {
  const q = query.toLowerCase();
  return (
    log.providerId.toLowerCase().includes(q) ||
    log.serviceOrder.toLowerCase().includes(q) ||
    log.carId.toLowerCase().includes(q) ||
    log.serviceDescription.toLowerCase().includes(q)
  );
}

export const LogsTable: React.FC = () => {
  const dispatch = useAppDispatch();
  const logs = useAppSelector((s) => s.logs.items);
  const filter = useAppSelector((s) => s.logsFilter);

  const [editLog, setEditLog] = useState<ServiceLog | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('startDate');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const filtered = useMemo(() => {
    return logs.filter((log) => {
      if (filter.query && !matchesQuery(log, filter.query)) return false;
      if (filter.type !== 'all' && log.type !== filter.type) return false;
      if (filter.startDateFrom && log.startDate < filter.startDateFrom) return false;
      if (filter.startDateTo && log.startDate > filter.startDateTo) return false;
      return true;
    });
  }, [logs, filter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = String(a[sortKey]);
      const bv = String(b[sortKey]);
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  };

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 rounded-xl border border-dashed border-slate-800 text-slate-600 text-sm gap-2">
        <svg className="w-8 h-8 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        No service logs yet. Create one from a draft.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{filtered.length} log{filtered.length !== 1 ? 's' : ''} found{filtered.length !== logs.length && ` (of ${logs.length} total)`}</span>
        {totalPages > 1 && <span>Page {page} / {totalPages}</span>}
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/80">
              {COLUMNS.map((col) => (
                <th key={col.key} onClick={() => handleSort(col.key)}
                  className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide cursor-pointer select-none hover:text-slate-200 whitespace-nowrap">
                  {col.label}
                  {col.key === sortKey
                    ? <span className="text-brand-500 ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>
                    : <span className="text-slate-700 ml-1">↕</span>}
                </th>
              ))}
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((log, idx) => (
              <tr key={log.id} className={`border-b border-slate-800/60 transition-colors hover:bg-slate-800/40 ${idx % 2 === 0 ? 'bg-slate-950' : 'bg-slate-900/30'}`}>
                <td className="px-4 py-3 text-slate-200 font-mono text-xs whitespace-nowrap">{log.serviceOrder}</td>
                <td className="px-4 py-3 text-slate-300">{log.providerId}</td>
                <td className="px-4 py-3 text-slate-300 font-mono text-xs">{log.carId}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_BADGE[log.type]}`}>{log.type}</span>
                </td>
                <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{log.startDate}</td>
                <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{log.endDate}</td>
                <td className="px-4 py-3 text-slate-300 text-right tabular-nums">{log.odometer.toLocaleString()}</td>
                <td className="px-4 py-3 text-slate-300 text-right tabular-nums">{log.engineHours}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1.5">
                    <button onClick={() => setEditLog(log)} title="Edit"
                      className="bg-slate-800 hover:bg-brand-600/20 text-slate-400 hover:text-brand-400 border border-slate-700 hover:border-brand-500/40 w-8 h-8 p-0 rounded-lg transition-colors">
                      <svg className="w-3.5 h-3.5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>

                    {deleteConfirm === log.id ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => { dispatch(deleteLog(log.id)); setDeleteConfirm(null); }}
                          className="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded transition-colors">
                          Confirm
                        </button>
                        <button onClick={() => setDeleteConfirm(null)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs px-2 py-1 rounded border border-slate-700 transition-colors">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteConfirm(log.id)} title="Delete"
                        className="bg-slate-800 hover:bg-red-900/40 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-700/40 w-8 h-8 p-0 rounded-lg transition-colors">
                        <svg className="w-3.5 h-3.5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            className="bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed w-8 h-8 p-0 rounded-lg transition-colors">
            ‹
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-8 h-8 p-0 rounded-lg text-sm border transition-colors ${p === page ? 'bg-brand-600 text-white border-brand-600' : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border-slate-700'}`}>
              {p}
            </button>
          ))}
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed w-8 h-8 p-0 rounded-lg transition-colors">
            ›
          </button>
        </div>
      )}

      {editLog && (
        <EditLogDialog log={editLog} open={!!editLog} onClose={() => setEditLog(null)} />
      )}
    </div>
  );
};
