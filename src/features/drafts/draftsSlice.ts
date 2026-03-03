import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ServiceLogDraft, ServiceLogBase } from '../../types/serviceLog';

export interface DraftsState {
  items: Record<string, ServiceLogDraft>;
  currentDraftId: string | null;
  autosaveStatus: 'idle' | 'saving' | 'saved' | 'error';
}

const initialState: DraftsState = {
  items: {},
  currentDraftId: null,
  autosaveStatus: 'idle'
};

const generateId = () => crypto.randomUUID();

const emptyBase = (): ServiceLogBase => {
  const today = new Date();
  const nextDay = new Date(today);
  nextDay.setDate(today.getDate() + 1);
  const toISODate = (d: Date) => d.toISOString().slice(0, 10);
  return {
    providerId: '',
    serviceOrder: '',
    carId: '',
    odometer: 0,
    engineHours: 0,
    startDate: toISODate(today),
    endDate: toISODate(nextDay),
    type: 'planned',
    serviceDescription: ''
  };
};

interface UpdateDraftPayload {
  id: string;
  changes: Partial<ServiceLogBase>;
}

const draftsSlice = createSlice({
  name: 'drafts',
  initialState,
  reducers: {
    createDraft(state) {
      const id = generateId();
      state.items[id] = { id, isSaved: false, ...emptyBase() };
      state.currentDraftId = id;
      state.autosaveStatus = 'idle';
    },
    deleteDraft(state, action: PayloadAction<string>) {
      delete state.items[action.payload];
      if (state.currentDraftId === action.payload) {
        state.currentDraftId = Object.keys(state.items)[0] ?? null;
      }
    },
    clearAllDrafts(state) {
      state.items = {};
      state.currentDraftId = null;
      state.autosaveStatus = 'idle';
    },
    setCurrentDraft(state, action: PayloadAction<string | null>) {
      state.currentDraftId = action.payload;
    },
    updateDraft(state, action: PayloadAction<UpdateDraftPayload>) {
      const draft = state.items[action.payload.id];
      if (!draft) return;
      const updated: ServiceLogDraft = {
        ...draft,
        ...action.payload.changes,
        isSaved: false
      };
      if (action.payload.changes.startDate && !action.payload.changes.endDate) {
        const start = new Date(action.payload.changes.startDate);
        const next = new Date(start);
        next.setDate(start.getDate() + 1);
        updated.endDate = next.toISOString().slice(0, 10);
      }
      state.items[action.payload.id] = updated;
      state.autosaveStatus = 'saving';
    },
    markDraftSaved(state, action: PayloadAction<string>) {
      const draft = state.items[action.payload];
      if (!draft) return;
      draft.isSaved = true;
      draft.lastSavedAt = new Date().toISOString();
      state.autosaveStatus = 'saved';
    },
    setAutosaveStatus(
      state,
      action: PayloadAction<DraftsState['autosaveStatus']>
    ) {
      state.autosaveStatus = action.payload;
    }
  }
});

export const {
  createDraft,
  deleteDraft,
  clearAllDrafts,
  setCurrentDraft,
  updateDraft,
  markDraftSaved,
  setAutosaveStatus
} = draftsSlice.actions;

export default draftsSlice.reducer;
