import type { DraftsState } from '../features/drafts/draftsSlice';
import type { LogsState } from '../features/logs/logsSlice';

const STORAGE_KEY = 'roslin_service_logs_state_v1';

interface PersistedState {
  drafts: DraftsState;
  logs: LogsState;
}

export function loadState(): Partial<PersistedState> | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    const serialized = window.localStorage.getItem(STORAGE_KEY);
    if (!serialized) return undefined;
    return JSON.parse(serialized) as PersistedState;
  } catch {
    return undefined;
  }
}

export function saveState(state: PersistedState): void {
  if (typeof window === 'undefined') return;
  try {
    const serialized = JSON.stringify(state);
    window.localStorage.setItem(STORAGE_KEY, serialized);
  } catch {
    // ignore write errors
  }
}
