import { configureStore } from '@reduxjs/toolkit';
import { saveState, loadState } from '../lib/storage';
import draftsReducer, { type DraftsState } from '../features/drafts/draftsSlice';
import logsReducer, { type LogsState } from '../features/logs/logsSlice';
import logsFilterReducer from '../features/logs/logsFilterSlice';

const preloaded = loadState();

export const store = configureStore({
  reducer: {
    drafts: draftsReducer,
    logs: logsReducer,
    logsFilter: logsFilterReducer
  },
  preloadedState: preloaded as
    | { drafts: DraftsState; logs: LogsState }
    | undefined
});

store.subscribe(() => {
  const state = store.getState();
  saveState({
    drafts: state.drafts,
    logs: state.logs
  });
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
