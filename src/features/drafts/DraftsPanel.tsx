import React from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { createDraft, setCurrentDraft } from './draftsSlice';
import type { ServiceLogDraft } from '../../types/serviceLog';

const TYPE_COLORS: Record<string, string> = {
  planned: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
  unplanned: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  emergency: 'bg-red-500/20 text-red-400 border-red-500/30'
};

const DraftCard: React.FC<{
  draft: ServiceLogDraft;
  isActive: boolean;
  onClick: () => void;
}> = ({ draft, isActive, onClick }) => {
  const label = draft.carId || draft.serviceOrder || 'Untitled draft';
  const date = draft.lastSavedAt
    ? new Date(draft.lastSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left rounded-lg px-3 py-2.5 border transition-all
        ${isActive
          ? 'bg-brand-600/20 border-brand-500/50 text-slate-100'
          : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
        }
      `}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span
          className={`shrink-0 w-2 h-2 rounded-full ${
            draft.isSaved ? 'bg-emerald-400' : 'bg-amber-400'
          }`}
        />
        <span className="truncate text-sm font-medium">{label}</span>
        <span
          className={`ml-auto shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded border ${TYPE_COLORS[draft.type]}`}
        >
          {draft.type}
        </span>
      </div>
      {date && (
        <p className="mt-1 text-[11px] text-slate-600 pl-4">Saved {date}</p>
      )}
    </button>
  );
};

export const DraftsPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const drafts = useAppSelector((s) => s.drafts.items);
  const currentDraftId = useAppSelector((s) => s.drafts.currentDraftId);
  const draftList = Object.values(drafts);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-300">
          Drafts{' '}
          <span className="ml-1 text-xs text-slate-500 font-normal">
            ({draftList.length})
          </span>
        </h3>
        <button
          onClick={() => dispatch(createDraft())}
          className="bg-brand-600 hover:bg-brand-700 text-white text-xs px-2.5 py-1.5 transition-colors"
        >
          + New Draft
        </button>
      </div>

      {draftList.length === 0 ? (
        <p className="text-xs text-slate-600 py-2">No drafts yet.</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {draftList.map((d) => (
            <DraftCard
              key={d.id}
              draft={d}
              isActive={d.id === currentDraftId}
              onClick={() => dispatch(setCurrentDraft(d.id))}
            />
          ))}
        </div>
      )}
    </div>
  );
};
