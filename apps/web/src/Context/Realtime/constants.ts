import type { RealtimeApi } from './types';

export const SILENT_REALTIME: RealtimeApi = {
  subscribe: () => () => undefined,
  invalidateOn: () => () => undefined,
};
export const INVALIDATE_DELAY_MS = 150;
