import type { IEventErrorReason } from '@fridgeboard/contract/events';

export type ReadEventExtrasOptions = { fields: Record<string, unknown> };

export type EventExtras = { color?: string; reminder?: number };

export type ReadEventExtrasResult = { extras: EventExtras } | { reason: IEventErrorReason };
