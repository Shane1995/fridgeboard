import type { CalendarEvent, EventDraft } from '../../types';

export type SelectDayOptions = { date: string };

export type SaveDraftOptions = { draft: EventDraft };

export type EditEventOptions = { event: CalendarEvent };
