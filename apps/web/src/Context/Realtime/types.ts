import type { ChangeHub } from '../../services/realtime/types';

export type RealtimeApi = Pick<ChangeHub, 'subscribe' | 'invalidateOn'>;
