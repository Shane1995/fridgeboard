import type { IEventErrorReason } from '@fridgeboard/contract/events';
import type { EventExtras } from '../readEventExtras/types.ts';

export type ReadEventBasicsOptions = { merged: Record<string, unknown> };

export type EventBasics = { title: string; note: string; ownerId: string } & EventExtras;

export type ReadEventBasicsResult = { basics: EventBasics } | { reason: IEventErrorReason };
