import type { CalendarEvent, EventDraft } from '../../../../types';
import type { RepeatScope } from '../../../../hooks/useLocalCalendarEvents/types';

export type EventFormProps = {
  event: CalendarEvent | undefined;
  date: string;
  onSave: (draft: EventDraft, scope?: RepeatScope) => void;
  onDelete: (scope?: RepeatScope) => void;
  onDone: () => void;
};

export type SetFieldOptions<Field extends keyof EventDraft> = {
  field: Field;
  value: EventDraft[Field] | undefined;
};
