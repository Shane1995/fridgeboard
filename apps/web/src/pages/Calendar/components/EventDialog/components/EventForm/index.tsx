import { Button, Input, Label, TextField } from '@heroui/react';
import {
  EVENT_NOTE_MAX_LENGTH,
  EVENT_TITLE_MAX_LENGTH,
  OWNER_OPTIONS,
} from '../../../../constants';
import { EVENT_FORM_COPY, FIELD_CLASS } from './constants';
import { useEventForm } from './hooks/useEventForm';
import type { EventFormProps } from './types';

export const EventForm = ({ event, date, onSave, onDelete, onDone }: EventFormProps) => {
  const { draft, setField, handleSubmit, handleDelete } = useEventForm({
    event,
    date,
    onSave,
    onDelete,
    onDone,
  });

  return (
    <form onSubmit={handleSubmit} className="flex min-w-0 flex-col gap-4">
      <TextField
        isRequired
        autoFocus
        maxLength={EVENT_TITLE_MAX_LENGTH}
        value={draft.title}
        onChange={(value) => setField({ field: 'title', value })}
      >
        <Label>{EVENT_FORM_COPY.titleLabel}</Label>
        <Input />
      </TextField>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={draft.allDay}
          onChange={(changeEvent) =>
            setField({ field: 'allDay', value: changeEvent.target.checked })
          }
        />
        {EVENT_FORM_COPY.allDayLabel}
      </label>
      <label className="flex min-w-0 flex-col gap-1 text-sm font-medium">
        {EVENT_FORM_COPY.dateLabel}
        <input
          type="date"
          required
          className={FIELD_CLASS}
          value={draft.date}
          onChange={(changeEvent) => setField({ field: 'date', value: changeEvent.target.value })}
        />
      </label>
      {!draft.allDay && (
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3">
          <label className="flex min-w-0 flex-col gap-1 text-sm font-medium">
            {EVENT_FORM_COPY.startLabel}
            <input
              type="time"
              required
              className={FIELD_CLASS}
              value={draft.startTime}
              onChange={(changeEvent) =>
                setField({ field: 'startTime', value: changeEvent.target.value })
              }
            />
          </label>
          <label className="flex min-w-0 flex-col gap-1 text-sm font-medium">
            {EVENT_FORM_COPY.endLabel}
            <input
              type="time"
              required
              className={FIELD_CLASS}
              value={draft.endTime}
              onChange={(changeEvent) =>
                setField({ field: 'endTime', value: changeEvent.target.value })
              }
            />
          </label>
        </div>
      )}
      <label className="flex min-w-0 flex-col gap-1 text-sm font-medium">
        {EVENT_FORM_COPY.ownerLabel}
        <select
          className={FIELD_CLASS}
          value={draft.ownerId}
          onChange={(changeEvent) =>
            setField({ field: 'ownerId', value: changeEvent.target.value })
          }
        >
          {OWNER_OPTIONS.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </select>
      </label>
      <TextField
        maxLength={EVENT_NOTE_MAX_LENGTH}
        value={draft.note}
        onChange={(value) => setField({ field: 'note', value })}
      >
        <Label>{EVENT_FORM_COPY.noteLabel}</Label>
        <Input />
      </TextField>
      <Button type="submit" fullWidth>
        {event === undefined ? EVENT_FORM_COPY.create : EVENT_FORM_COPY.save}
      </Button>
      {event !== undefined && (
        <Button variant="danger-soft" fullWidth onPress={handleDelete}>
          {EVENT_FORM_COPY.delete}
        </Button>
      )}
    </form>
  );
};
