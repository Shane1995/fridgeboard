import type { RealtimeApi } from './types';

export const SILENT_REALTIME: RealtimeApi = { subscribe: () => () => undefined };
export const ONLINE_EVENT = 'online';
export const CHANGES_FAILED = 'The changes request failed';
