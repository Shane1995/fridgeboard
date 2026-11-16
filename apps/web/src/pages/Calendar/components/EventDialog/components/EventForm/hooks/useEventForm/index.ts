import { useState } from 'react';
import type { FormEvent } from 'react';
import {
  DEFAULT_END_TIME,
  DEFAULT_START_TIME,
  HOUSEHOLD_OWNER_ID,
} from '../../../../../../constants';
import type { EventDraft } from '../../../../../../types';
import { eventToDraft } from '../../../../../../utils/eventToDraft';
import type { RepeatScope } from '../../../../../../hooks/useLocalCalendarEvents/types';
import type { SetFieldOptions } from '../../types';
import type { UseEventFormOptions } from './types';

export const useEventForm = ({ event, date, onSave, onDelete, onDone }: UseEventFormOptions) => {
  const [draft, setDraft] = useState<EventDraft>(() =>
    event === undefined
      ? {
          title: '',
          allDay: false,
          date,
          endDate: date,
          startTime: DEFAULT_START_TIME,
          endTime: DEFAULT_END_TIME,
          ownerId: HOUSEHOLD_OWNER_ID,
          note: '',
        }
      : eventToDraft({ event }),
  );

  // An undefined value takes the field off the draft, so "no colour" and "no reminder" are absent
  // rather than present-but-empty.
  const setField = <Field extends keyof EventDraft>({ field, value }: SetFieldOptions<Field>) =>
    setDraft((current) => {
      const { [field]: _removed, ...rest } = current;
      const next = (value === undefined ? rest : { ...rest, [field]: value }) as EventDraft;
      return field === 'date' && next.endDate !== undefined && next.endDate < next.date
        ? { ...next, endDate: next.date }
        : next;
    });

  // A scope only exists for a day of a repeating series; every other save passes the draft alone.
  const save = (scope?: RepeatScope) => {
    if (draft.title.trim() === '') {
      return;
    }
    if (scope === undefined) {
      onSave(draft);
    } else {
      onSave(draft, scope);
    }
    onDone();
  };

  const handleSubmit = (submitEvent: FormEvent) => {
    submitEvent.preventDefault();
    save();
  };

  const handleDelete = (scope?: RepeatScope) => {
    if (scope === undefined) {
      onDelete();
    } else {
      onDelete(scope);
    }
    onDone();
  };

  return { draft, setField, save, handleSubmit, handleDelete };
};
