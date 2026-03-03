import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ServiceType } from '../../types/serviceLog';

export interface LogsFilterState {
  query: string;
  type: ServiceType | 'all';
  startDateFrom?: string;
  startDateTo?: string;
}

const initialState: LogsFilterState = { query: '', type: 'all' };

const logsFilterSlice = createSlice({
  name: 'logsFilter',
  initialState,
  reducers: {
    setQuery(state, action: PayloadAction<string>) {
      state.query = action.payload;
    },
    setType(state, action: PayloadAction<LogsFilterState['type']>) {
      state.type = action.payload;
    },
    setStartDateFrom(state, action: PayloadAction<string | undefined>) {
      state.startDateFrom = action.payload;
    },
    setStartDateTo(state, action: PayloadAction<string | undefined>) {
      state.startDateTo = action.payload;
    },
    clearFilters(state) {
      state.query = '';
      state.type = 'all';
      state.startDateFrom = undefined;
      state.startDateTo = undefined;
    }
  }
});

export const { setQuery, setType, setStartDateFrom, setStartDateTo, clearFilters } =
  logsFilterSlice.actions;

export default logsFilterSlice.reducer;
