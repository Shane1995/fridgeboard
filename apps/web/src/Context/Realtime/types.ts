import type { ChangeType } from '@fridgeboard/contract/changes';
import type { SubscribeOptions } from '../../services/eventBus/createEventBus/types';
import type { ChangeEvent } from '../../services/realtime/types';

export type InvalidateOnOptions = {
  types: readonly ChangeType[];
  keys: readonly string[];
};

export type Registration = { count: number; unsubscribes: (() => void)[] };

export type RealtimeApi = {
  subscribe: (options: SubscribeOptions<ChangeType, ChangeEvent>) => () => void;
  invalidateOn: (options: InvalidateOnOptions) => () => void;
};
