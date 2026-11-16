import type { CalendarEvent, EventDraft } from '../../types';
import type { RepeatScope } from '../useLocalCalendarEvents/types';

export type SelectDayOptions = { date: string };

export type OpenCreateOptions = { date: string };

export type SaveDraftOptions = { draft: EventDraft; scope?: RepeatScope };

export type RemoveEditingOptions = { scope?: RepeatScope };

export type EditEventOptions = { event: CalendarEvent };
