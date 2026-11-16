import type { RepeatScope } from '../../../../../../hooks/useLocalCalendarEvents/types';
import type { CalendarEvent, EventDraft } from '../../../../../../types';

export type UseEventFormOptions = {
  event: CalendarEvent | undefined;
  date: string;
  onSave: (draft: EventDraft, scope?: RepeatScope) => void;
  onDelete: (scope?: RepeatScope) => void;
  onDone: () => void;
};
