import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ServiceLog, ServiceLogBase } from '../../types/serviceLog';

export interface LogsState {
  items: ServiceLog[];
}

const initialState: LogsState = { items: [] };

interface CreateFromDraftPayload {
  draftId: string;
  data: ServiceLogBase;
}

interface UpdateLogPayload {
  id: string;
  changes: Partial<ServiceLogBase>;
}

const logsSlice = createSlice({
  name: 'logs',
  initialState,
  reducers: {
    createFromDraft(state, action: PayloadAction<CreateFromDraftPayload>) {
      const now = new Date().toISOString();
      state.items.push({
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
        ...action.payload.data
      });
    },
    updateLog(state, action: PayloadAction<UpdateLogPayload>) {
      const log = state.items.find((l) => l.id === action.payload.id);
      if (!log) return;
      Object.assign(log, action.payload.changes);
      log.updatedAt = new Date().toISOString();
    },
    deleteLog(state, action: PayloadAction<string>) {
      state.items = state.items.filter((l) => l.id !== action.payload);
    }
  }
});

export const { createFromDraft, updateLog, deleteLog } = logsSlice.actions;
export default logsSlice.reducer;
