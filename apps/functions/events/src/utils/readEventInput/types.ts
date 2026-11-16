import type { IEvent, IEventErrorReason } from '@fridgeboard/contract/events';

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

export type EventFields = DistributiveOmit<IEvent, 'id'>;

export type ReadEventInputOptions = { fields: Record<string, unknown>; current?: IEvent };

export type ReadEventInputResult = { event: EventFields } | { reason: IEventErrorReason };
