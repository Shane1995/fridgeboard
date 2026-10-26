import type { ChangeType } from '@fridgeboard/contract/changes';
import type { SubscribeOptions } from '../../services/eventBus/createEventBus/types';
import type { ChangeEvent } from '../../services/realtime/types';

export type RealtimeApi = {
  subscribe: (options: SubscribeOptions<ChangeType, ChangeEvent>) => () => void;
};
