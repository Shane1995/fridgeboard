import type { RealtimeApi } from './types';

export const SILENT_REALTIME: RealtimeApi = {
  subscribe: () => () => undefined,
  invalidate: () => undefined,
};
export const INVALIDATE_DELAY_MS = 150;
export const ONLINE_EVENT = 'online';
export const CHANGES_FAILED = 'The changes request failed';
