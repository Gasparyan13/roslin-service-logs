import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { updateLog } from './logsSlice';
import type { ServiceLog, ServiceLogBase, ServiceType } from '../../types/serviceLog';

const SERVICE_TYPES: { value: ServiceType; label: string }[] = [
  { value: 'planned', label: 'Planned' },
  { value: 'unplanned', label: 'Unplanned' },
  { value: 'emergency', label: 'Emergency' }
];

type ValidationErrors = Partial<Record<keyof ServiceLogBase, string>>;

function validate(data: ServiceLogBase): ValidationErrors {
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

interface FieldProps { label: string; error?: string; children: React.ReactNode; }
const Field: React.FC<FieldProps> = ({ label, error, children }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</label>
    {children}
    {error && <p className="text-xs text-red-400">{error}</p>}
  </div>
);

interface Props { log: ServiceLog; open: boolean; onClose: () => void; }

export const EditLogDialog: React.FC<Props> = ({ log, open, onClose }) => {
  const dispatch = useAppDispatch();
  const [form, setForm] = useState<ServiceLogBase>({ ...log });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => { setForm({ ...log }); setErrors({}); setSubmitted(false); }, [log, open]);
  useEffect(() => { if (submitted) setErrors(validate(form)); }, [form, submitted]);

  const update = (changes: Partial<ServiceLogBase>) => {
    setForm((prev) => {
      const next = { ...prev, ...changes };
      if (changes.startDate && !changes.endDate) {
        const start = new Date(changes.startDate);
        const nextDay = new Date(start);
        nextDay.setDate(start.getDate() + 1);
        next.endDate = nextDay.toISOString().slice(0, 10);
      }
      return next;
    });
  };

  const handleSave = () => {
    setSubmitted(true);
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    dispatch(updateLog({ id: log.id, changes: form }));
    onClose();
  };

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 p-6">
          <div className="flex items-center justify-between mb-5">
            <Dialog.Title className="text-lg font-semibold text-slate-100">Edit Service Log</Dialog.Title>
            <Dialog.Close asChild>
              <button className="bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700 w-8 h-8 p-0 rounded-full transition-colors">✕</button>
            </Dialog.Close>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Provider ID" error={errors.providerId}>
              <input value={form.providerId} onChange={(e) => update({ providerId: e.target.value })} />
            </Field>
            <Field label="Service Order" error={errors.serviceOrder}>
              <input value={form.serviceOrder} onChange={(e) => update({ serviceOrder: e.target.value })} />
            </Field>
            <Field label="Car ID" error={errors.carId}>
              <input value={form.carId} onChange={(e) => update({ carId: e.target.value })} />
            </Field>
            <Field label="Odometer (mi)" error={errors.odometer}>
              <input type="number" min={0} value={form.odometer} onChange={(e) => update({ odometer: parseFloat(e.target.value) || 0 })} />
            </Field>
            <Field label="Engine Hours" error={errors.engineHours}>
              <input type="number" min={0} step={0.1} value={form.engineHours} onChange={(e) => update({ engineHours: parseFloat(e.target.value) || 0 })} />
            </Field>
            <Field label="Type" error={errors.type}>
              <select value={form.type} onChange={(e) => update({ type: e.target.value as ServiceType })} className="bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-100">
                {SERVICE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </Field>
            <Field label="Start Date" error={errors.startDate}>
              <input type="date" value={form.startDate} onChange={(e) => update({ startDate: e.target.value })} />
            </Field>
            <Field label="End Date" error={errors.endDate}>
              <input type="date" value={form.endDate} onChange={(e) => update({ endDate: e.target.value })} />
            </Field>
          </div>

          <div className="mt-4">
            <Field label="Service Description" error={errors.serviceDescription}>
              <textarea rows={3} value={form.serviceDescription} onChange={(e) => update({ serviceDescription: e.target.value })} className="bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-brand-500 resize-none w-full" />
            </Field>
          </div>

          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-800">
            <Dialog.Close asChild>
              <button className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors">Cancel</button>
            </Dialog.Close>
            <button onClick={handleSave} className="bg-brand-600 hover:bg-brand-700 text-white transition-colors">Save Changes</button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
