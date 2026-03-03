import React, { useEffect, useRef, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import {
  updateDraft,
  markDraftSaved,
  deleteDraft,
  clearAllDrafts
} from './draftsSlice';
import { createFromDraft } from '../logs/logsSlice';
import type { ServiceLogBase, ServiceType } from '../../types/serviceLog';

const AUTOSAVE_DELAY = 900;

const SERVICE_TYPES: { value: ServiceType; label: string }[] = [
  { value: 'planned', label: 'Planned' },
  { value: 'unplanned', label: 'Unplanned' },
  { value: 'emergency', label: 'Emergency' }
];

interface FieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}

const Field: React.FC<FieldProps> = ({ label, error, children }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">
      {label}
    </label>
    {children}
    {error && <p className="text-xs text-red-400">{error}</p>}
  </div>
);

type ValidationErrors = Partial<Record<keyof ServiceLogBase, string>>;

function validateDraft(data: ServiceLogBase): ValidationErrors {
  const errors: ValidationErrors = {};
  if (!data.providerId.trim()) errors.providerId = 'Required';
  if (!data.serviceOrder.trim()) errors.serviceOrder = 'Required';
  if (!data.carId.trim()) errors.carId = 'Required';
  if (data.odometer < 0) errors.odometer = 'Must be ≥ 0';
  if (data.engineHours < 0) errors.engineHours = 'Must be ≥ 0';
  if (!data.startDate) errors.startDate = 'Required';
  if (!data.endDate) errors.endDate = 'Required';
  if (data.startDate && data.endDate && data.endDate < data.startDate) {
    errors.endDate = 'Must be after start date';
  }
  if (!data.serviceDescription.trim()) errors.serviceDescription = 'Required';
  return errors;
}

export const DraftForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentDraftId = useAppSelector((s) => s.drafts.currentDraftId);
  const draft = useAppSelector((s) =>
    currentDraftId ? s.drafts.items[currentDraftId] : null
  );
  const autosaveStatus = useAppSelector((s) => s.drafts.autosaveStatus);
  const logsCount = useAppSelector((s) => s.logs.items.length);

  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [errors, setErrors] = React.useState<ValidationErrors>({});
  const [submitAttempted, setSubmitAttempted] = React.useState(false);

  const scheduleAutosave = useCallback(
    (id: string) => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
      autosaveTimer.current = setTimeout(() => {
        dispatch(markDraftSaved(id));
      }, AUTOSAVE_DELAY);
    },
    [dispatch]
  );

  useEffect(() => () => { if (autosaveTimer.current) clearTimeout(autosaveTimer.current); }, []);

  useEffect(() => {
    if (autosaveStatus === 'saving' && draft) {
      scheduleAutosave(draft.id);
    }
  }, [autosaveStatus, draft, scheduleAutosave]);

  useEffect(() => {
    if (submitAttempted && draft) setErrors(validateDraft(draft));
  }, [draft, submitAttempted]);

  if (!draft) {
    return (
      <div className="flex flex-col items-center justify-center h-48 rounded-xl border border-dashed border-slate-700 text-slate-500 text-sm gap-2">
        <svg className="w-8 h-8 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span>No draft selected — click <strong>New Draft</strong></span>
      </div>
    );
  }

  const update = (changes: Partial<ServiceLogBase>) => {
    dispatch(updateDraft({ id: draft.id, changes }));
  };

  const handleCreateLog = () => {
    setSubmitAttempted(true);
    const validationErrors = validateDraft(draft);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    dispatch(createFromDraft({ draftId: draft.id, data: { ...draft } }));
    dispatch(deleteDraft(draft.id));
    setSubmitAttempted(false);
    setErrors({});
  };

  const statusBadge = () => {
    if (autosaveStatus === 'saving') {
      return (
        <span className="flex items-center gap-1 text-xs text-amber-400">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          Saving…
        </span>
      );
    }
    if (autosaveStatus === 'saved' && draft.isSaved) {
      return (
        <span className="flex items-center gap-1 text-xs text-emerald-400">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          Draft saved
        </span>
      );
    }
    if (!draft.isSaved) return <span className="text-xs text-slate-500">Unsaved changes</span>;
    return null;
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-base font-semibold text-slate-100">Edit Draft</h2>
          {statusBadge()}
        </div>
        <span className="text-xs text-slate-500">
          Total logs: <strong className="text-slate-300">{logsCount}</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Provider ID" error={errors.providerId}>
          <input value={draft.providerId} onChange={(e) => update({ providerId: e.target.value })} placeholder="e.g. PROV-001" />
        </Field>
        <Field label="Service Order" error={errors.serviceOrder}>
          <input value={draft.serviceOrder} onChange={(e) => update({ serviceOrder: e.target.value })} placeholder="e.g. SO-2024-0001" />
        </Field>
        <Field label="Car ID" error={errors.carId}>
          <input value={draft.carId} onChange={(e) => update({ carId: e.target.value })} placeholder="e.g. CAR-123" />
        </Field>
        <Field label="Odometer (mi)" error={errors.odometer}>
          <input type="number" min={0} value={draft.odometer} onChange={(e) => update({ odometer: parseFloat(e.target.value) || 0 })} />
        </Field>
        <Field label="Engine Hours" error={errors.engineHours}>
          <input type="number" min={0} step={0.1} value={draft.engineHours} onChange={(e) => update({ engineHours: parseFloat(e.target.value) || 0 })} />
        </Field>
        <Field label="Service Type" error={errors.type}>
          <select value={draft.type} onChange={(e) => update({ type: e.target.value as ServiceType })} className="bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-100">
            {SERVICE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </Field>
        <Field label="Start Date" error={errors.startDate}>
          <input type="date" value={draft.startDate} onChange={(e) => update({ startDate: e.target.value })} />
        </Field>
        <Field label="End Date" error={errors.endDate}>
          <input type="date" value={draft.endDate} onChange={(e) => update({ endDate: e.target.value })} />
        </Field>
      </div>

      <Field label="Service Description" error={errors.serviceDescription}>
        <textarea
          rows={3}
          value={draft.serviceDescription}
          onChange={(e) => update({ serviceDescription: e.target.value })}
          placeholder="Describe the service performed…"
          className="bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
        />
      </Field>

      <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-800">
        <button onClick={handleCreateLog} className="bg-brand-600 hover:bg-brand-700 text-white transition-colors">
          <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Service Log
        </button>
        <button onClick={() => dispatch(deleteDraft(draft.id))} className="bg-slate-800 hover:bg-red-900/50 text-red-400 hover:text-red-300 border border-slate-700 hover:border-red-700/50 transition-colors">
          <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete Draft
        </button>
        <button onClick={() => dispatch(clearAllDrafts())} className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors ml-auto">
          Clear All Drafts
        </button>
      </div>
    </div>
  );
};
