import type { IEventInput } from '@fridgeboard/contract/events';

export type CreateEventVariables = { body: IEventInput };

export type UpdateEventVariables = { id: string; date: string; body: IEventInput };

export type DeleteEventVariables = { id: string; date: string; title: string };
