import { useState } from 'react';
import type { FormEvent } from 'react';
import {
  DEFAULT_END_TIME,
  DEFAULT_START_TIME,
  HOUSEHOLD_OWNER_ID,
} from '../../../../../../constants';
import type { EventDraft } from '../../../../../../types';
import { eventToDraft } from '../../../../../../utils/eventToDraft';
import type { SetFieldOptions } from '../../types';
import type { UseEventFormOptions } from './types';

export const useEventForm = ({ event, date, onSave, onDelete, onDone }: UseEventFormOptions) => {
  const [draft, setDraft] = useState<EventDraft>(() =>
    event === undefined
      ? {
          title: '',
          allDay: false,
          date,
          startTime: DEFAULT_START_TIME,
          endTime: DEFAULT_END_TIME,
          ownerId: HOUSEHOLD_OWNER_ID,
          note: '',
        }
      : eventToDraft({ event }),
  );

  const setField = <Field extends keyof EventDraft>({ field, value }: SetFieldOptions<Field>) =>
    setDraft((current) => ({ ...current, [field]: value }));

  const handleSubmit = (submitEvent: FormEvent) => {
    submitEvent.preventDefault();
    if (draft.title.trim() === '') {
      return;
    }
    onSave(draft);
    onDone();
  };

  const handleDelete = () => {
    onDelete();
    onDone();
  };

  return { draft, setField, handleSubmit, handleDelete };
};
