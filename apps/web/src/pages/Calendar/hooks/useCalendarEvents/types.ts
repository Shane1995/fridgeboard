import type { EventDraft } from '../../types';

export type SaveEventOptions = { draft: EventDraft };

export type UpdateEventOptions = { id: string; draft: EventDraft };

export type DeleteEventOptions = { id: string };
